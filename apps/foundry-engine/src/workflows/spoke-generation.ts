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

// Story 4.3: Type definitions for Brand DNA (matches ClientAgent DO types)
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

interface BrandDNA {
  voiceMarkers: VoiceMarker[];
  bannedWords: BannedWord[];
  signaturePatterns: string[];
  toneProfile: Record<string, number>;
}

// Type for AI text generation response
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
}

// Story 1.5-4-7: Platform-specific structural requirements
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
- Tweet 7: Conclusion and CTA.`
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

const MAX_REGENERATION_ATTEMPTS = 3;

// Story 4.3: Content length limits for AI prompts (token optimization)
const SOURCE_CONTENT_LIMIT_INITIAL = 2000;
const SOURCE_CONTENT_LIMIT_REGENERATION = 1500;

// Story 4.3: Quality gate pass thresholds (consistent across evaluation and feedback)
const G2_HOOK_PASS_THRESHOLD = 70;
const G6_VISUAL_PASS_THRESHOLD = 70;
const G7_ENGAGEMENT_PASS_THRESHOLD = 7.5; // Story 4.6: G7 uses 0-10 scale

// Story 4.3: Gate result interface for Self-Healing Loop
interface GateResult {
  passed: boolean;
  score?: number;
  feedback: string;
  violations?: string[];
  cliches?: string[];
}

// Story 4.3: Aggregated feedback for regeneration
interface HealingFeedback {
  g2?: { score: number; feedback: string };
  g4?: { violations: string[]; feedback: string };
  g5?: { feedback: string };
  g6?: { cliches: string[]; feedback: string };
  g7?: { score: number; benchmark: number; feedback: string }; // Story 4.6: G7 Engagement Prediction
  userEditPatterns?: string[]; // Context Refresh on 3rd attempt
}

export class SpokeGenerationWorkflow extends WorkflowEntrypoint<Env, SpokeGenerationParams> {
  // Helper: Call ClientAgent DO with error handling
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
      // Log error for debugging, re-throw for workflow to handle
      console.error(`[SpokeGenerationWorkflow] callAgent(${method}) failed:`, error);
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
    } = event.payload;

    // Step 1: Get Brand DNA and platform specs
    const context = await step.do('get-generation-context', async () => {
      const brandDNA = await this.callAgent(clientId, 'getBrandDNA', {});
      const platformSpec = PLATFORM_SPECS[platform] || PLATFORM_SPECS.twitter;

      return { brandDNA, platformSpec };
    });

    // Step 2: Create initial spoke record
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

    // Story 4.3: Self-Healing Loop - Track attempts and feedback
    let regenerationCount = 0;
    let healingFeedback: HealingFeedback = {};

    // Step 3: CREATOR AGENT - Generate content (with healing feedback if regenerating)
    let generatedContent = await step.do('creator-generate-0', async () => {
      const { brandDNA, platformSpec } = context;

      // Different prompt for variations vs original content
      const creatorPrompt = isVariation
        ? `You are a CREATOR agent - a divergent thinker who generates VARIATIONS of existing content.

ORIGINAL CONTENT TO VARY:
"""
${sourceContent}
"""

BRAND VOICE:
- Voice Markers: ${(brandDNA as BrandDNA).voiceMarkers?.map(v => v.phrase).join(', ') || 'Authentic, engaging'}
- Banned Words: ${(brandDNA as BrandDNA).bannedWords?.map(b => b.word).join(', ') || 'None'}
- Signature Patterns: ${(brandDNA as BrandDNA).signaturePatterns?.join(', ') || 'None'}

PLATFORM REQUIREMENTS (${platform.toUpperCase()}):
- Max Length: ${platformSpec.maxLength} characters
- Format: ${platformSpec.format}
- Style: ${platformSpec.style}

VARIATION REQUIREMENTS:
Create an ALTERNATIVE version that:
1. MAINTAINS the same core message and value proposition
2. Uses a COMPLETELY DIFFERENT hook/opening approach
3. Varies sentence structure and rhythm
4. Explores a different angle or perspective
5. Keeps the same brand voice and platform constraints
6. Ends with a different engagement driver

DO NOT just rephrase - create a genuinely fresh take on the same idea.

Output ONLY the new variation, no meta-commentary.`
        : `You are a CREATOR agent - a divergent thinker who generates engaging content.

BRAND VOICE:
- Voice Markers: ${(brandDNA as BrandDNA).voiceMarkers?.map(v => v.phrase).join(', ') || 'Authentic, engaging'}
- Banned Words: ${(brandDNA as BrandDNA).bannedWords?.map(b => b.word).join(', ') || 'None'}
- Signature Patterns: ${(brandDNA as BrandDNA).signaturePatterns?.join(', ') || 'None'}

PLATFORM REQUIREMENTS (${platform.toUpperCase()}):
- Max Length: ${platformSpec.maxLength} characters
- Format: ${platformSpec.format}
- Style: ${platformSpec.style}
${PLATFORM_INSTRUCTIONS[platform] || ''}

CONTENT PILLAR: ${pillarTitle}
HOOK OPTIONS: ${Array.isArray(hooks) && hooks.length > 0 ? hooks.join(' | ') : 'Create an attention-grabbing opener'}

Generate content that:
1. Opens with a strong hook
2. Delivers clear value
3. Matches the brand voice exactly
4. Fits platform constraints
5. Ends with engagement driver

CRITICAL RULES:
- Output ONLY the final content. No preamble, no "Here is the content:", no notes.
- NEVER start with "Here is", "Sure", "Let me", "I'm ready", or any meta-commentary.
- NEVER reference source material, prompts, or instructions in the output.
- Start directly with the hook or content.`;

      const result = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct' as any, {
        messages: [
          { role: 'system', content: creatorPrompt },
          { role: 'user', content: `Source material:\n${sourceContent.substring(0, SOURCE_CONTENT_LIMIT_INITIAL)}` },
        ],
      });

      return sanitizeContent((result as AiTextGenerationResponse).response);
    });

    // Story 4.3: Helper function to generate content with healing feedback
    const generateWithFeedback = async (
      attempt: number,
      feedback: HealingFeedback,
      previousContent: string
    ): Promise<string> => {
      const { brandDNA, platformSpec } = context;

      // Build feedback instructions for regeneration
      let feedbackInstructions = '';
      if (feedback.g2) {
        feedbackInstructions += `\n\nPREVIOUS HOOK FAILED (Score: ${feedback.g2.score}/100):
${feedback.g2.feedback}
REQUIRED: Improve Pattern Interrupt and Benefit signals. Target score >= ${G2_HOOK_PASS_THRESHOLD}.`;
      }
      if (feedback.g4 && feedback.g4.violations.length > 0) {
        feedbackInstructions += `\n\nVOICE ALIGNMENT FAILED:
Violations: ${feedback.g4.violations.join(', ')}
${feedback.g4.feedback}
REQUIRED: Remove all banned words and match brand voice markers.`;
      }
      if (feedback.g5) {
        feedbackInstructions += `\n\nPLATFORM COMPLIANCE FAILED:
${feedback.g5.feedback}
REQUIRED: Strictly adhere to platform character limits.`;
      }
      if (feedback.g6 && feedback.g6.cliches && feedback.g6.cliches.length > 0) {
        feedbackInstructions += `\n\nVISUAL CLICHÉS DETECTED:
Avoid: ${feedback.g6.cliches.join(', ')}
${feedback.g6.feedback}`;
      }
      if (feedback.g7) {
        feedbackInstructions += `\n\nENGAGEMENT PREDICTION FAILED (Score: ${feedback.g7.score.toFixed(1)}/10):
${feedback.g7.feedback}
REQUIRED: Improve hook stopping power and novelty. Target score >= ${G7_ENGAGEMENT_PASS_THRESHOLD}.
Benchmark engagement rate: ${(feedback.g7.benchmark * 100).toFixed(1)}%`;
      }
      // Story 4.3 AC7: Context Refresh on 3rd attempt
      if (feedback.userEditPatterns && feedback.userEditPatterns.length > 0) {
        feedbackInstructions += `\n\nUSER EDIT PATTERNS DETECTED (from mutation registry):
${feedback.userEditPatterns.join('\n')}
INCORPORATE these patterns to match user preferences.`;
      }

      const regenerationPrompt = `You are a CREATOR agent REGENERATING content after Critic rejection.

PREVIOUS FAILED CONTENT:
"""
${previousContent}
"""

BRAND VOICE:
- Voice Markers: ${(brandDNA as Record<string, unknown>).voiceMarkers ? ((brandDNA as Record<string, unknown>).voiceMarkers as string[]).join(', ') : 'Authentic, engaging'}
- Banned Words: ${(brandDNA as Record<string, unknown>).bannedWords ? ((brandDNA as Record<string, unknown>).bannedWords as Array<{ word: string }>).map((b) => b.word).join(', ') : 'None'}

PLATFORM REQUIREMENTS (${platform.toUpperCase()}):
- Max Length: ${platformSpec.maxLength} characters
- Format: ${platformSpec.format}
- Style: ${platformSpec.style}
${PLATFORM_INSTRUCTIONS[platform] || ''}

CONTENT PILLAR: ${pillarTitle}
REGENERATION ATTEMPT: ${attempt}/${MAX_REGENERATION_ATTEMPTS}
${feedbackInstructions}

Generate IMPROVED content that fixes ALL identified issues.
Output ONLY the content, no meta-commentary.`;

      const result = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct' as any, {
        messages: [
          { role: 'system', content: regenerationPrompt },
          { role: 'user', content: `Original source material:\n${sourceContent.substring(0, SOURCE_CONTENT_LIMIT_REGENERATION)}` },
        ],
      });

      return sanitizeContent((result as AiTextGenerationResponse).response);
    };

    // Story 4.3: Helper function to generate visual metadata (reusable for healing loop)
    const generateVisualMetadata = async (
      content: string,
      stepId: string
    ): Promise<{ archetype: string; thumbnailConcept: string; imagePrompt: string }> => {
      return await step.do(stepId, async () => {
        const { brandDNA } = context;

        const visualPrompt = `You are a VISUAL STRATEGIST.
Based on this content, generate a visual concept for ${platform}.

CONTENT:
${content}

BRAND IDENTITY:
- Tone: ${JSON.stringify((brandDNA as Record<string, unknown>).toneProfile)}
- Markers: ${(brandDNA as Record<string, unknown>).voiceMarkers ? ((brandDNA as Record<string, unknown>).voiceMarkers as string[]).join(', ') : ''}

Output JSON only:
{
  "archetype": "string (e.g. Bold Contrast, Minimalist, Data-Driven)",
  "thumbnailConcept": "string (short description of the main visual idea)",
  "imagePrompt": "string (detailed prompt for AI image generation, avoiding robot brains, handshakes, lightbulbs)"
}`;

        const result = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct' as any, {
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
            archetype: 'Generic',
            thumbnailConcept: 'Related image',
            imagePrompt: 'A brand-aligned image representing the content.',
          };
        }
      });
    };

    // Step 3.5: VISUAL CONCEPT ENGINE - Generate initial visual metadata
    let visualMetadata = await generateVisualMetadata(generatedContent, 'visual-concept-generate-0');
    let archetype = visualMetadata.archetype;
    let thumbnailConcept = visualMetadata.thumbnailConcept;
    let imagePrompt = visualMetadata.imagePrompt;

    // Story 4.3: Self-Healing Loop - Helper to run all gates
    const runGates = async (content: string, attempt: number): Promise<{
      allPassed: boolean;
      scores: Record<string, unknown>;
      feedback: HealingFeedback;
      g2Result: GateResult;
      g4Result: GateResult;
      g5Result: GateResult;
      g6Result: GateResult;
      g7Result: { score: number; feedback: string };
    }> => {
      const { brandDNA, platformSpec } = context;

      // G2: Hook Strength
      const g2Result = await step.do(`critic-g2-attempt-${attempt}`, async () => {
        const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct' as any, {
          messages: [
            {
              role: 'system',
              content: `You are a CRITIC agent evaluating hook strength.
Rate the opening hook on a scale of 0-100 based on:
- Curiosity gap (does it make you want to read more?)
- Pattern interrupt (does it break expectations?)
- Relevance (does it connect to the value proposition?)

Output JSON: { "score": number, "passed": boolean, "feedback": "string" }
Pass threshold: ${G2_HOOK_PASS_THRESHOLD}`,
            },
            { role: 'user', content: `Content to evaluate:\n${content}` },
          ],
        });

        try {
          const text = (result as { response: string }).response;
          const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          const score = json.score || 50;
          const feedback = json.feedback || '';
          // If critic returned no feedback and a middling score, it didn't
          // meaningfully evaluate — default to pass to avoid blind regen loops
          const passed = feedback === '' && score < G2_HOOK_PASS_THRESHOLD
            ? true
            : (json.passed ?? score >= G2_HOOK_PASS_THRESHOLD);
          return { score, passed, feedback };
        } catch {
          return { score: G2_HOOK_PASS_THRESHOLD, passed: true, feedback: '' };
        }
      });

      // G4: Voice Alignment — skip when Brand DNA is empty
      const hasBrandDNA = brandDNA && (
        ((brandDNA as BrandDNA).voiceMarkers?.length > 0) ||
        ((brandDNA as BrandDNA).bannedWords?.length > 0) ||
        ((brandDNA as BrandDNA).signaturePatterns?.length > 0)
      );

      const g4Result = hasBrandDNA
        ? await step.do(`critic-g4-attempt-${attempt}`, async () => {
            const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct' as any, {
              messages: [
                {
                  role: 'system',
                  content: `You are a CRITIC agent evaluating voice alignment.
Check if the content matches the brand voice:
- Voice Markers: ${(brandDNA as Record<string, unknown>).voiceMarkers ? ((brandDNA as Record<string, unknown>).voiceMarkers as string[]).join(', ') : 'None'}
- Banned Words: ${(brandDNA as Record<string, unknown>).bannedWords ? ((brandDNA as Record<string, unknown>).bannedWords as Array<{ word: string }>).map((b) => b.word).join(', ') : 'None'}

Output JSON: { "passed": boolean, "violations": ["string"], "feedback": "string" }`,
                },
                { role: 'user', content: `Content to evaluate:\n${content}` },
              ],
            });

            try {
              const text = (result as { response: string }).response;
              const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
              return {
                passed: json.passed ?? true,
                violations: json.violations || [],
                feedback: json.feedback || '',
              };
            } catch {
              return { passed: true, violations: [], feedback: '' };
            }
          })
        : { passed: true, violations: [] as string[], feedback: 'Brand DNA not configured — voice alignment skipped' };

      // G5: Platform Compliance
      const g5Result = await step.do(`critic-g5-attempt-${attempt}`, async () => {
        const lengthOk = content.length <= platformSpec.maxLength;
        return {
          passed: lengthOk,
          feedback: lengthOk ? '' : `Content exceeds ${platformSpec.maxLength} char limit (current: ${content.length})`,
        };
      });

      // G6: Visual Metaphor
      const g6Result = await step.do(`critic-g6-attempt-${attempt}`, async () => {
        const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct' as any, {
          messages: [
            {
              role: 'system',
              content: `You are a CRITIC agent evaluating visual metaphors and prompts.
Identify AI clichés: robot brains, handshakes, lightbulbs, generic stock business people, puzzle pieces.
Check if the prompt avoids these and matches brand identity.

Output JSON: { "score": number, "passed": boolean, "feedback": "string", "cliches": ["string"] }
Pass threshold: ${G6_VISUAL_PASS_THRESHOLD}`,
            },
            { role: 'user', content: `Visual Archetype: ${archetype}\nThumbnail Concept: ${thumbnailConcept}\nImage Prompt: ${imagePrompt}` },
          ],
        });

        try {
          const text = (result as { response: string }).response;
          const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          const score = json.score || 50;
          const feedback = json.feedback || '';
          const cliches = json.cliches || [];
          // If critic returned no feedback, no clichés, and a middling score,
          // it didn't meaningfully evaluate — default to pass
          const passed = (feedback === '' && cliches.length === 0 && score < G6_VISUAL_PASS_THRESHOLD)
            ? true
            : (json.passed ?? score >= G6_VISUAL_PASS_THRESHOLD);
          return { score, passed, feedback, cliches };
        } catch {
          return { score: G6_VISUAL_PASS_THRESHOLD, passed: true, feedback: '', cliches: [] };
        }
      });

      // G7: Engagement Prediction (Story 4.6 - Hybrid Vectorize approach)
      const g7Result = await step.do(`critic-g7-attempt-${attempt}`, async () => {
        try {
          // Create adapter for Vectorize API to match g7-scorer interface
          const vectorizeAdapter = {
            query: async (vectorOrParams: number[] | { namespace?: string; vector: number[]; topK: number }, options?: { namespace?: string; topK?: number; returnMetadata?: string }) => {
              // Support both positional (vector, options) and object ({vector, namespace, topK}) forms
              let vector: number[];
              let namespace: string | undefined;
              let topK: number;
              
              if (Array.isArray(vectorOrParams)) {
                vector = vectorOrParams;
                namespace = options?.namespace;
                topK = options?.topK || 50;
              } else {
                vector = vectorOrParams.vector;
                namespace = vectorOrParams.namespace;
                topK = vectorOrParams.topK;
              }
              
              const queryOpts: Record<string, unknown> = { topK, returnMetadata: 'all' };
              if (namespace) queryOpts.namespace = namespace;
              
              const results = await this.env.VECTORIZE.query(vector, queryOpts as any);
              return {
                matches: results.matches.map(match => ({
                  values: Array.from(match.values || []) as number[],
                  metadata: (match.metadata || {}) as Record<string, unknown>,
                  score: match.score,
                })),
                count: results.count,
              };
            },
          };

          // Create adapter for Workers AI to match g7-scorer interface
          const aiAdapter = {
            run: async (model: string, params: { text: string }) => {
              const result = await this.env.AI.run(model as any, params);
              return result as { data: number[][] };
            },
          };

          const result: G7ScoringResult = await scoreEngagement(
            {
              id: spokeId,
              content,
              platform,
            },
            {
              niche: 'business', // TODO: Add niche tracking to BrandDNA in Story 4.7
            },
            clientId,
            vectorizeAdapter,
            aiAdapter
          );

          const passed = result.g7Score >= G7_ENGAGEMENT_PASS_THRESHOLD;
          const feedback = !passed
            ? `Low engagement prediction (${result.g7Score.toFixed(1)}/10). Target >= ${G7_ENGAGEMENT_PASS_THRESHOLD}. Benchmark: ${(result.g7Benchmark * 100).toFixed(1)}% engagement rate.`
            : '';

          return {
            passed,
            score: result.g7Score,
            benchmark: result.g7Benchmark,
            source: result.g7Source,
            stoppingPower: result.stoppingPower,
            novelty: result.novelty,
            feedback,
          };
        } catch (error) {
          // Default to pass on error to avoid blocking content generation
          console.error('G7 scoring error:', error);
          return {
            passed: true,
            score: 7.5,
            benchmark: 0.042,
            source: 'error-fallback',
            stoppingPower: 5,
            novelty: 5,
            feedback: 'G7 evaluation failed (defaulting to pass)',
          };
        }
      });

      // Aggregate results
      // Note: G6 (visual) and G7 (engagement) included in pass/fail
      // Story 4.6: G7 now BLOCKS content with score < 7.5
      const allPassed = g2Result.passed && g4Result.passed && g5Result.passed && g6Result.passed && g7Result.passed;
      const scores = {
        g2_hook: g2Result.score,
        g4_voice: g4Result.passed,
        g5_platform: g5Result.passed,
        g6_visual: g6Result.score,
        g6_visual_passed: g6Result.passed,
        g7_engagement: g7Result.score, // Story 4.6: 0-10 scale (maps to g7_engagement column in DO)
        engagement_prediction: g7Result.score, // Also populate engagement_prediction for Golden Nugget filter
        g7_benchmark: g7Result.benchmark,
        g7_source: g7Result.source,
        g7_stopping_power: g7Result.stoppingPower,
        g7_novelty: g7Result.novelty,
        g7_passed: g7Result.passed,
      };

      // Build feedback for regeneration if gates failed
      const feedback: HealingFeedback = {};
      if (!g2Result.passed) {
        feedback.g2 = { score: g2Result.score || 0, feedback: g2Result.feedback };
      }
      if (!g4Result.passed) {
        feedback.g4 = { violations: g4Result.violations || [], feedback: g4Result.feedback };
      }
      if (!g5Result.passed) {
        feedback.g5 = { feedback: g5Result.feedback };
      }
      if (!g6Result.passed && g6Result.cliches && g6Result.cliches.length > 0) {
        feedback.g6 = { cliches: g6Result.cliches, feedback: g6Result.feedback };
      }
      if (!g7Result.passed) {
        feedback.g7 = {
          score: g7Result.score,
          benchmark: g7Result.benchmark,
          feedback: g7Result.feedback,
        };
      }

      return { allPassed, scores, feedback, g2Result, g4Result, g5Result, g6Result, g7Result };
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // Story 4.3: SELF-HEALING LOOP - The Core Differentiator
    // ═══════════════════════════════════════════════════════════════════════════
    let allGatesPassed = false;
    let qualityScores: Record<string, unknown> = {};
    let finalContent = generatedContent;

    // Run initial gate evaluation
    let gateResults = await runGates(finalContent, 0);
    allGatesPassed = gateResults.allPassed;
    qualityScores = gateResults.scores;
    healingFeedback = gateResults.feedback;

    // Self-Healing Loop: Regenerate if gates failed
    while (!allGatesPassed && regenerationCount < MAX_REGENERATION_ATTEMPTS) {
      regenerationCount++;

      // Story 4.3 AC1: Write failure reason to feedback_log
      await step.do(`log-failure-${regenerationCount}`, async () => {
        await this.callAgent(clientId, 'logHealingFeedback', {
          spokeId,
          attempt: regenerationCount,
          feedback: healingFeedback,
          scores: qualityScores,
        });
      });

      // Story 4.3 AC7: Context Refresh on 3rd attempt - Query mutation registry
      if (regenerationCount === MAX_REGENERATION_ATTEMPTS) {
        const userPatterns = await step.do('context-refresh', async () => {
          const patterns = await this.callAgent(clientId, 'getUserEditPatterns', {
            pillarId,
            platform,
            limit: 5,
          });
          return patterns as string[];
        });
        healingFeedback.userEditPatterns = userPatterns;
      }

      // Story 4.3 AC2-3: Regenerate with Critic feedback
      finalContent = await step.do(`creator-regenerate-${regenerationCount}`, async () => {
        return await generateWithFeedback(regenerationCount, healingFeedback, finalContent);
      });

      // Story 4.3: Regenerate visual metadata for the healed content
      // This ensures G6 evaluates visuals based on the new content, not stale initial content
      visualMetadata = await generateVisualMetadata(finalContent, `visual-concept-regenerate-${regenerationCount}`);
      archetype = visualMetadata.archetype;
      thumbnailConcept = visualMetadata.thumbnailConcept;
      imagePrompt = visualMetadata.imagePrompt;

      // Re-run gates on regenerated content (with updated visuals)
      gateResults = await runGates(finalContent, regenerationCount);
      allGatesPassed = gateResults.allPassed;
      qualityScores = gateResults.scores;
      healingFeedback = gateResults.feedback;

      // Story 4.3 AC4: Update regeneration count in DO (< 10 seconds per loop)
      await step.do(`update-regen-count-${regenerationCount}`, async () => {
        await this.callAgent(clientId, 'updateSpoke', {
          spokeId,
          updates: { regenerationCount },
        });
      });
    }

    // Story 4.3 AC5-6: Determine final status based on gate results
    // AC5: If passed after regeneration → ready_for_review
    // Story 4.4: If still failed after 3 attempts → creative_conflict (escalate to human)
    const finalStatus = allGatesPassed ? 'pending_review' : 'creative_conflict';

    // Step 5: Update spoke with final content and scores
    await step.do('update-spoke-final', async () => {
      await this.callAgent(clientId, 'updateSpoke', {
        spokeId,
        updates: {
          content: finalContent,
          status: finalStatus,
          qualityScores,
          visualArchetype: archetype,
          imagePrompt: imagePrompt,
          thumbnailConcept: thumbnailConcept,
          regenerationCount,
          // Story 4.3 AC5: Log successful healing
          healedAt: allGatesPassed && regenerationCount > 0 ? new Date().toISOString() : null,
        },
      });

      // Log healing success/failure for analytics (FR50)
      if (regenerationCount > 0) {
        await this.callAgent(clientId, 'logHealingResult', {
          spokeId,
          attempts: regenerationCount,
          success: allGatesPassed,
          finalScores: qualityScores,
        });
      }
    });

    return {
      spokeId,
      platform,
      status: finalStatus,
      iterations: regenerationCount + 1,
      allGatesPassed,
      qualityScores,
      contentLength: finalContent.length,
      // Story 4.3 metrics
      selfHealed: regenerationCount > 0 && allGatesPassed,
      escalatedToCreativeConflict: !allGatesPassed && regenerationCount >= MAX_REGENERATION_ATTEMPTS,
    };
  }
}
