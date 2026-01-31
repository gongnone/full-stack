import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from 'cloudflare:workers';
import { scoreEngagement, type G7ScoringResult } from '../agents/critic/g7-scorer';
import { sanitizeContent } from '../utils/content-sanitizer';

interface Env {
  CLIENT_AGENT: DurableObjectNamespace;
  AI: Ai;
  QUALITY_QUEUE: Queue;
  VECTORIZE: VectorizeIndex;
}

// Brand DNA types (matches ClientAgent DO)
interface VoiceMarker {
  id: string;
  phrase: string;
  source: 'voice' | 'manual' | 'analysis';
  confidence: number;
  createdAt: string;
}

interface BannedWord {
  id: string;
  word: string;
  severity: 'hard' | 'soft';
  reason?: string;
  source: 'voice' | 'manual' | 'analysis';
  createdAt: string;
}

interface BrandStance {
  id: string;
  topic: string;
  position: string;
  source: 'voice' | 'manual' | 'analysis';
  createdAt: string;
}

interface BrandDNA {
  voiceMarkers: VoiceMarker[];
  bannedWords: BannedWord[];
  stances: BrandStance[];
  signaturePatterns: string[];
  toneProfile: Record<string, number>;
  voiceBaseline: number | null;
  timeToDNA: number | null;
  lastCalibration: string | null;
}

interface AiTextGenerationResponse {
  response: string;
}

interface SpokeGenerationParams {
  clientId: string;
  hubId: string;
  spokeId: string;
  platform: string;
  pillarId: string;
  pillarTitle: string;
  hooks: string[];
  sourceContent: string;
  parentSpokeId?: string;
  isVariation?: boolean;
  // New: enriched content inputs
  contentSeed?: string; // Specific angle/idea, not just pillar title
  examplePosts?: string[]; // Client's best content for pattern matching
  antiExamples?: string[]; // Content they hate
  audiencePersona?: string; // Psychographic audience description
}

// ═══════════════════════════════════════════════════════════════════════
// MODEL CONFIGURATION — Single place to change models
// ═══════════════════════════════════════════════════════════════════════
const MODELS = {
  // Creative content generation — needs highest quality writing
  creator: '@cf/openai/gpt-oss-120b' as const,
  // Visual concept generation — needs creative thinking
  visual: '@cf/openai/gpt-oss-120b' as const,
  // Hook quality scoring — evaluation task, small model is fine
  critic: '@cf/meta/llama-3.1-8b-instruct-fast' as const,
  // Embeddings for G7
  embedding: '@cf/baai/bge-base-en-v1.5' as const,
};

// Platform-specific structural requirements
const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  twitter: `
STRUCTURE:
1. PUNCHY HOOK: Use a pattern-interrupt or contrarian opening (max 80 chars).
2. CORE VALUE: One clear takeaway.
3. HASHTAGS: Include EXACTLY 1-2 relevant hashtags at the end.
CONSTRAINT: Total length MUST be under 280 characters.`,
  linkedin: `
STRUCTURE:
1. STRONG HOOK: Open with a compelling question or bold statement.
2. STORY/VALUE: Use professional but authentic storytelling.
3. LINE BREAKS: Use frequent line breaks for readability.
CONSTRAINT: Max length 3000 characters.`,
  tiktok: `
STRUCTURE:
1. 3-SECOND HOOK: Start with a high-energy "Scroll Stopper" script line.
2. THE MEAT: A clear middle section delivering the core insight.
3. SOFT CTA: End with a natural call to action.
FORMAT: This is a VIDEO SCRIPT.`,
  instagram: `
STRUCTURE:
1. VISUAL HOOK: Reference the visual element.
2. LIFESTYLE TONE: Use authentic, behind-the-scenes phrasing.
3. EMOJI: Use 2-4 relevant emoji.`,
  carousel: `
STRUCTURE: Generate a 10-SLIDE outline:
- Slide 1: High-impact Hook
- Slide 2: The Problem
- Slides 3-8: Progressive Reveal of the Solution (one point per slide)
- Slide 9: Summary
- Slide 10: Call to Action`,
  thread: `
STRUCTURE: 5-7 tweet thread.
- Tweet 1: Mega-hook and promise.
- Tweets 2-6: Individual value points with numbering (1/7, 2/7...).
- Tweet 7: Conclusion and CTA.`,
};

const PLATFORM_SPECS: Record<string, {
  maxLength: number;
  format: string;
  style: string;
}> = {
  twitter: {
    maxLength: 280,
    format: 'Single tweet or thread opener',
    style: 'Punchy, conversational, hook-driven',
  },
  linkedin: {
    maxLength: 3000,
    format: 'Professional post with line breaks',
    style: 'Thought leadership, storytelling, professional',
  },
  tiktok: {
    maxLength: 4000,
    format: 'Video script hook + CTA',
    style: 'Trendy, energetic, pattern-interrupt',
  },
  instagram: {
    maxLength: 2200,
    format: 'Caption with emoji and hashtags',
    style: 'Visual-first, lifestyle, authentic',
  },
  thread: {
    maxLength: 2800,
    format: '5-7 tweet thread with numbering',
    style: 'Educational, structured, value-packed',
  },
  carousel: {
    maxLength: 5000,
    format: '10-slide carousel with progressive reveal',
    style: 'Visual-first, educational, scroll-stopping',
  },
};

// Quality thresholds — scores are ADVISORY, not gates
// Only G2 < POLISH_THRESHOLD triggers a single regen attempt
const G2_HOOK_POLISH_THRESHOLD = 50; // Truly bad hooks get one polish pass
const G7_ENGAGEMENT_PASS_THRESHOLD = 5.0;

// Content length limits for AI prompts
const SOURCE_CONTENT_LIMIT = 3000; // Increased — better models handle more context

export class SpokeGenerationWorkflow extends WorkflowEntrypoint<Env, SpokeGenerationParams> {
  // Helper: Call ClientAgent DO
  private async callAgent(clientId: string, method: string, params: Record<string, unknown>) {
    try {
      const id = this.env.CLIENT_AGENT.idFromName(clientId);
      const agent = this.env.CLIENT_AGENT.get(id);
      const response = await agent.fetch(new Request('http://internal/rpc', {
        method: 'POST',
        body: JSON.stringify({ method, params }),
      }));
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ClientAgent ${method} failed: ${response.status} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`[SpokeGen] callAgent(${method}) failed:`, error);
      throw error;
    }
  }

  async run(event: WorkflowEvent<SpokeGenerationParams>, step: WorkflowStep) {
    const {
      clientId,
      hubId,
      spokeId,
      platform,
      pillarId,
      pillarTitle,
      hooks,
      sourceContent,
      parentSpokeId,
      isVariation,
      contentSeed,
      examplePosts,
      antiExamples,
      audiencePersona,
    } = event.payload;

    const platformSpec = PLATFORM_SPECS[platform] || PLATFORM_SPECS.twitter;

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 0: GATHER CONTEXT
    // ═══════════════════════════════════════════════════════════════════
    const context = await step.do('gather-context', async () => {
      const brandDNA = await this.callAgent(clientId, 'getBrandDNA', {}) as BrandDNA;
      return { brandDNA };
    });

    // Create spoke record
    await step.do('create-spoke-record', async () => {
      await this.callAgent(clientId, 'createSpoke', {
        id: spokeId,
        hubId,
        pillarId,
        platform,
        content: '',
        status: 'generating',
        qualityScores: {},
        regenerationCount: 0,
        mutatedAt: null,
        parentSpokeId: parentSpokeId || null,
      });
    });

    const { brandDNA } = context;

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 1: CREATE (Creator + Visual — the only creative LLM calls)
    // ═══════════════════════════════════════════════════════════════════

    // Build the enriched Creator prompt
    const buildCreatorPrompt = (isRegen: boolean, prevContent?: string, feedback?: string): string => {
      // Voice identity section
      const voiceMarkers = brandDNA.voiceMarkers?.map(v => v.phrase).join(', ') || 'Authentic, engaging';
      const bannedWords = brandDNA.bannedWords?.map(b => b.word).join(', ') || 'None';
      const stances = brandDNA.stances?.map(s => `• ${s.topic}: ${s.position}`).join('\n') || 'None provided';
      const patterns = brandDNA.signaturePatterns?.join(', ') || 'None detected';

      // Example content section
      let examplesSection = '';
      if (examplePosts && examplePosts.length > 0) {
        const examples = examplePosts.slice(0, 3).map((p, i) =>
          `Example ${i + 1}:\n"""\n${p.substring(0, 500)}\n"""`
        ).join('\n\n');
        examplesSection = `\nEXAMPLE CONTENT (match this quality and voice):\n${examples}\n`;
      }

      let antiSection = '';
      if (antiExamples && antiExamples.length > 0) {
        antiSection = `\nNEVER write like this:\n"""\n${antiExamples[0].substring(0, 300)}\n"""\n`;
      }

      // Audience section
      const audienceSection = audiencePersona
        ? `\nAUDIENCE: ${audiencePersona}\nWrite as if speaking directly to this person.\n`
        : '';

      // Content seed (specific angle vs generic pillar title)
      const seedSection = contentSeed
        ? `CONTENT SEED: ${contentSeed}`
        : `CONTENT PILLAR: ${pillarTitle}`;

      if (isRegen && prevContent && feedback) {
        return `You are a world-class social media copywriter. Your previous draft needs improvement.

PREVIOUS DRAFT:
"""
${prevContent}
"""

WHAT TO FIX:
${feedback}

BRAND VOICE:
- Voice markers: ${voiceMarkers}
- Never use these words: ${bannedWords}
- Signature patterns: ${patterns}
${examplesSection}${antiSection}${audienceSection}
${seedSection}
HOOK OPTIONS: ${Array.isArray(hooks) && hooks.length > 0 ? hooks.join(' | ') : 'Create an attention-grabbing opener'}

PLATFORM: ${platform.toUpperCase()}
- Max Length: ${platformSpec.maxLength} characters
- Format: ${platformSpec.format}
- Style: ${platformSpec.style}
${PLATFORM_INSTRUCTIONS[platform] || ''}

Write an IMPROVED version. Output ONLY the final content.
Do NOT start with "Here is", "Sure", "Let me", "I'm ready", or any commentary.
Start directly with the hook.`;
      }

      if (isVariation) {
        return `You are a world-class social media copywriter creating a VARIATION of existing content.

ORIGINAL TO VARY:
"""
${sourceContent.substring(0, SOURCE_CONTENT_LIMIT)}
"""

Create a genuinely DIFFERENT take on the same idea. Different hook, different angle, same core message.

BRAND VOICE:
- Voice markers: ${voiceMarkers}
- Never use: ${bannedWords}
- Brand believes:\n${stances}
${examplesSection}${audienceSection}
PLATFORM: ${platform.toUpperCase()}
- Max: ${platformSpec.maxLength} chars | Format: ${platformSpec.format}
${PLATFORM_INSTRUCTIONS[platform] || ''}

Output ONLY the variation. No preamble.`;
      }

      return `You are a world-class social media copywriter.

BRAND IDENTITY:
- Voice markers: ${voiceMarkers}
- Never use these words: ${bannedWords}
- Signature patterns: ${patterns}
- Brand believes:
${stances}
${examplesSection}${antiSection}${audienceSection}
${seedSection}
HOOK OPTIONS: ${Array.isArray(hooks) && hooks.length > 0 ? hooks.join(' | ') : 'Create an attention-grabbing opener'}

PLATFORM: ${platform.toUpperCase()}
- Max Length: ${platformSpec.maxLength} characters
- Format: ${platformSpec.format}
- Style: ${platformSpec.style}
${PLATFORM_INSTRUCTIONS[platform] || ''}

RULES:
1. Open with a strong hook that stops the scroll
2. Deliver clear, specific value (not platitudes)
3. Match the brand voice exactly
4. Fit platform constraints
5. End with an engagement driver
6. Use SPECIFIC details, stories, or data — not generic advice
7. Output ONLY the final content. No preamble, no meta-commentary.
8. NEVER start with "Here is", "Sure", "Let me", "I'm ready", or similar.
9. Start directly with the hook or content.`;
    };

    // PHASE 1a: Generate content
    let generatedContent = await step.do('creator-generate', async () => {
      const prompt = buildCreatorPrompt(false);

      // gpt-oss-120b uses Responses API format
      const result = await this.env.AI.run(MODELS.creator as any, {
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Source material:\n${sourceContent.substring(0, SOURCE_CONTENT_LIMIT)}` },
        ],
      });

      return sanitizeContent((result as AiTextGenerationResponse).response);
    });

    // PHASE 1b: Generate visual metadata
    let visualMetadata = await step.do('visual-generate', async () => {
      const visualPrompt = `You are a visual strategist for social media content.
Based on this content, generate a visual concept for ${platform}.

CONTENT:
${generatedContent}

BRAND TONE: ${JSON.stringify(brandDNA.toneProfile || {})}

RULES:
- AVOID clichés: robot brains, handshakes, lightbulbs, generic stock business people, puzzle pieces, gears
- Think cinematographic, specific, evocative
- Match the emotional tone of the content

Output JSON only:
{
  "archetype": "string (e.g. Bold Contrast, Minimalist, Data-Driven, Street Photography, Candid Moment)",
  "thumbnailConcept": "string (specific visual description, not generic)",
  "imagePrompt": "string (detailed, specific prompt for AI image generation)"
}`;

      const result = await this.env.AI.run(MODELS.visual as any, {
        messages: [
          { role: 'system', content: visualPrompt },
          { role: 'user', content: 'Generate visual concept metadata.' },
        ],
      });

      try {
        const text = (result as { response: string }).response;
        return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
      } catch {
        return {
          archetype: 'Brand Aligned',
          thumbnailConcept: 'Content-specific visual',
          imagePrompt: 'A visually striking image that matches the content tone and brand identity.',
        };
      }
    });

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 2: SCORE (parallel, non-blocking — scores are advisory)
    // ═══════════════════════════════════════════════════════════════════
    const scores = await step.do('score-parallel', async () => {
      // G2: Hook Quality (LLM-based)
      const g2Promise = (async () => {
        try {
          const result = await this.env.AI.run(MODELS.critic as any, {
            messages: [
              {
                role: 'system',
                content: `You are a social media hook quality evaluator.
Rate the opening hook on a scale of 0-100:
- Curiosity gap (does it make you want to read more?)
- Pattern interrupt (does it break expectations?)
- Specificity (does it use concrete details, not generic claims?)
- Relevance (does it connect to the value proposition?)

Output JSON only: { "score": number, "feedback": "one sentence explaining the score" }`,
              },
              { role: 'user', content: `Evaluate this ${platform} content:\n${generatedContent}` },
            ],
          });
          const text = (result as { response: string }).response;
          const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return { score: json.score || 50, feedback: json.feedback || '' };
        } catch {
          return { score: 60, feedback: 'G2 evaluation failed' };
        }
      })();

      // G5: Platform Compliance (pure JS — no LLM)
      const g5 = {
        passed: generatedContent.length <= platformSpec.maxLength,
        length: generatedContent.length,
        maxLength: platformSpec.maxLength,
      };

      // G7: Engagement Prediction (heuristic + Vectorize)
      const g7Promise = (async () => {
        try {
          const vectorizeAdapter = {
            query: async (params: { namespace?: string; vector: number[]; topK: number }) => {
              try {
                const opts: Record<string, any> = { topK: params.topK };
                if (params.namespace) opts.namespace = params.namespace;
                const results = await this.env.VECTORIZE.query(params.vector, opts);
                return (results?.matches || []).map((m: any) => ({
                  values: (m.values ? Array.from(m.values) : []) as number[],
                  metadata: (m.metadata || {}) as Record<string, unknown>,
                  score: (m.score || 0) as number,
                }));
              } catch (e) {
                console.warn('[G7] Vectorize query error:', e);
                return [];
              }
            },
          };
          const aiAdapter = {
            run: async (model: string, params: { text: string }) => {
              const result = await this.env.AI.run(model as any, params);
              return result as { data: number[][] };
            },
          };

          const result: G7ScoringResult = await scoreEngagement(
            { id: spokeId, content: generatedContent, platform },
            { niche: 'business' },
            clientId,
            vectorizeAdapter,
            aiAdapter,
          );
          return {
            score: result.g7Score,
            benchmark: result.g7Benchmark,
            source: result.g7Source,
            stoppingPower: result.stoppingPower,
            novelty: result.novelty,
          };
        } catch (error) {
          console.error('[G7] scoring error:', error);
          return { score: 6.0, benchmark: 0.042, source: 'error-fallback', stoppingPower: 5, novelty: 5 };
        }
      })();

      // Wait for all scores in parallel
      const [g2, g7] = await Promise.all([g2Promise, g7Promise]);

      return { g2, g5, g7 };
    });

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 3: POLISH (conditional — one targeted regen if hook is bad)
    // ═══════════════════════════════════════════════════════════════════
    let finalContent = generatedContent;
    let regenerationCount = 0;
    let polished = false;

    // Only polish if hook is truly bad OR content exceeds platform limit
    const needsPolish = scores.g2.score < G2_HOOK_POLISH_THRESHOLD || !scores.g5.passed;

    if (needsPolish) {
      regenerationCount = 1;
      polished = true;

      finalContent = await step.do('creator-polish', async () => {
        let feedback = '';
        if (scores.g2.score < G2_HOOK_POLISH_THRESHOLD) {
          feedback += `Hook is weak (scored ${scores.g2.score}/100). ${scores.g2.feedback}. Make the opening more specific and scroll-stopping.\n`;
        }
        if (!scores.g5.passed) {
          feedback += `Content is ${scores.g5.length} chars but platform max is ${scores.g5.maxLength}. Tighten it up.\n`;
        }

        const prompt = buildCreatorPrompt(true, generatedContent, feedback);
        const result = await this.env.AI.run(MODELS.creator as any, {
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Source material:\n${sourceContent.substring(0, SOURCE_CONTENT_LIMIT)}` },
          ],
        });
        return sanitizeContent((result as AiTextGenerationResponse).response);
      });

      // Re-generate visual if content changed significantly
      if (finalContent !== generatedContent) {
        visualMetadata = await step.do('visual-regenerate', async () => {
          const visualPrompt = `You are a visual strategist. Generate a visual concept for this ${platform} post.

CONTENT:
${finalContent}

AVOID: robot brains, handshakes, lightbulbs, generic stock photos, puzzle pieces, gears.

Output JSON only:
{
  "archetype": "string",
  "thumbnailConcept": "string",
  "imagePrompt": "string"
}`;

          const result = await this.env.AI.run(MODELS.visual as any, {
            messages: [
              { role: 'system', content: visualPrompt },
              { role: 'user', content: 'Generate visual concept.' },
            ],
          });

          try {
            const text = (result as { response: string }).response;
            return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          } catch {
            return visualMetadata; // Keep previous if parse fails
          }
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 4: FINALIZE — Everything produces output. Always.
    // ═══════════════════════════════════════════════════════════════════
    const cleanedContent = sanitizeContent(finalContent);

    // Determine status: pending_review (good) or needs_review (has issues but still usable)
    // NEVER creative_conflict — user always gets content
    const qualityLevel =
      scores.g2.score >= 70 && scores.g7.score >= G7_ENGAGEMENT_PASS_THRESHOLD && scores.g5.passed
        ? 'high'
        : scores.g2.score >= 50 && scores.g5.passed
          ? 'medium'
          : 'low';

    const finalStatus = qualityLevel === 'low' ? 'needs_review' : 'pending_review';

    const qualityScores = {
      g2_hook: scores.g2.score,
      g2_feedback: scores.g2.feedback,
      g5_platform: scores.g5.passed,
      g5_length: scores.g5.length,
      g7_engagement: scores.g7.score,
      engagement_prediction: scores.g7.score,
      g7_benchmark: scores.g7.benchmark,
      g7_source: scores.g7.source,
      g7_stopping_power: scores.g7.stoppingPower,
      g7_novelty: scores.g7.novelty,
      quality_level: qualityLevel,
      polished,
    };

    await step.do('update-spoke-final', async () => {
      await this.callAgent(clientId, 'updateSpoke', {
        spokeId,
        updates: {
          content: cleanedContent,
          status: finalStatus,
          qualityScores,
          visualArchetype: visualMetadata.archetype || 'Brand Aligned',
          imagePrompt: visualMetadata.imagePrompt || '',
          thumbnailConcept: visualMetadata.thumbnailConcept || '',
          regenerationCount,
        },
      });
    });

    return {
      spokeId,
      platform,
      status: finalStatus,
      qualityLevel,
      qualityScores,
      contentLength: cleanedContent.length,
      polished,
      iterations: regenerationCount + 1,
    };
  }
}
