import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from 'cloudflare:workers';

interface Env {
  CLIENT_AGENT: DurableObjectNamespace;
  AI: Ai;
  QUALITY_QUEUE: Queue;
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
    maxLength: 150,
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
};

const MAX_REGENERATION_ATTEMPTS = 3;

export class SpokeGenerationWorkflow extends WorkflowEntrypoint<Env, SpokeGenerationParams> {
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
      const id = this.env.CLIENT_AGENT.idFromName(clientId);
      const agent = this.env.CLIENT_AGENT.get(id);

      const response = await agent.fetch(new Request('http://internal/rpc', {
        method: 'POST',
        body: JSON.stringify({
          method: 'getBrandDNA',
          params: {},
        }),
      }));

      const brandDNA = await response.json();
      const platformSpec = PLATFORM_SPECS[platform] || PLATFORM_SPECS.twitter;

      return { brandDNA, platformSpec };
    });

    // Step 2: Create initial spoke record
    await step.do('create-spoke-record', async () => {
      const id = this.env.CLIENT_AGENT.idFromName(clientId);
      const agent = this.env.CLIENT_AGENT.get(id);

      await agent.fetch(new Request('http://internal/rpc', {
        method: 'POST',
        body: JSON.stringify({
          method: 'createSpoke',
          params: {
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
          },
        }),
      }));
    });

    // Step 3: CREATOR AGENT - Generate initial content
    let generatedContent = await step.do('creator-generate', async () => {
      const { brandDNA, platformSpec } = context;

      // Different prompt for variations vs original content
      const creatorPrompt = isVariation
        ? `You are a CREATOR agent - a divergent thinker who generates VARIATIONS of existing content.

ORIGINAL CONTENT TO VARY:
"""
${sourceContent}
"""

BRAND VOICE:
- Voice Markers: ${(brandDNA as any).voiceMarkers?.join(', ') || 'Authentic, engaging'}
- Banned Words: ${(brandDNA as any).bannedWords?.map((b: any) => b.word).join(', ') || 'None'}
- Signature Patterns: ${(brandDNA as any).signaturePatterns?.join(', ') || 'None'}

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
- Voice Markers: ${(brandDNA as any).voiceMarkers?.join(', ') || 'Authentic, engaging'}
- Banned Words: ${(brandDNA as any).bannedWords?.map((b: any) => b.word).join(', ') || 'None'}
- Signature Patterns: ${(brandDNA as any).signaturePatterns?.join(', ') || 'None'}

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

Output ONLY the content, no meta-commentary.`;

      const result = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct' as any, {
        messages: [
          { role: 'system', content: creatorPrompt },
          { role: 'user', content: `Source material:\n${sourceContent.substring(0, 2000)}` },
        ],
      });

      return (result as any).response.trim();
    });

    // Step 3.5: VISUAL CONCEPT ENGINE - Generate visual metadata
    const visualMetadata = await step.do('visual-concept-generate', async () => {
      const { brandDNA } = context;

      const visualPrompt = `You are a VISUAL STRATEGIST.
Based on this content, generate a visual concept for ${platform}.

CONTENT:
${generatedContent}

BRAND IDENTITY:
- Tone: ${JSON.stringify((brandDNA as any).toneProfile)}
- Markers: ${(brandDNA as any).voiceMarkers?.join(', ')}

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
        const text = (result as any).response;
        return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
      } catch {
        return {
          archetype: 'Generic',
          thumbnailConcept: 'Related image',
          imagePrompt: 'A brand-aligned image representing the content.',
        };
      }
    });

    const { archetype, thumbnailConcept, imagePrompt } = visualMetadata;

    // Step 4: CRITIC AGENT - Run Quality Gates (Lite Mode - Story 1.5-5)
    let allGatesPassed = false;
    let qualityScores: Record<string, any> = {};

    // Run G2: Hook Strength
    const g2Result = await step.do('critic-g2-pass', async () => {
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
Pass threshold: 60`,
            },
            { role: 'user', content: `Content to evaluate:\n${generatedContent}` },
          ],
        });

        try {
          const text = (result as any).response;
          const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return {
            score: json.score || 50,
            passed: json.passed ?? json.score >= 60,
            feedback: json.feedback || '',
          };
        } catch {
          return { score: 70, passed: true, feedback: '' };
        }
      });

      qualityScores.g2_hook = g2Result.score;

      // Run G4: Voice Alignment
      const g4Result = await step.do('critic-g4-pass', async () => {
        const { brandDNA } = context;

        const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct' as any, {
          messages: [
            {
              role: 'system',
              content: `You are a CRITIC agent evaluating voice alignment.
Check if the content matches the brand voice:
- Voice Markers: ${(brandDNA as any).voiceMarkers?.join(', ') || 'None'}
- Banned Words: ${(brandDNA as any).bannedWords?.map((b: any) => b.word).join(', ') || 'None'}

Output JSON: { "passed": boolean, "violations": ["string"], "feedback": "string" }`,
            },
            { role: 'user', content: `Content to evaluate:\n${generatedContent}` },
          ],
        });

        try {
          const text = (result as any).response;
          const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return {
            passed: json.passed ?? true,
            violations: json.violations || [],
            feedback: json.feedback || '',
          };
        } catch {
          return { passed: true, violations: [], feedback: '' };
        }
      });

      qualityScores.g4_voice = g4Result.passed;

      // Run G5: Platform Compliance
      const g5Result = await step.do('critic-g5-pass', async () => {
        const { platformSpec } = context;

        const lengthOk = generatedContent.length <= platformSpec.maxLength;
        return {
          passed: lengthOk,
          feedback: lengthOk ? '' : `Content exceeds ${platformSpec.maxLength} char limit`,
        };
      });

      qualityScores.g5_platform = g5Result.passed;

      // Run G6: Visual Metaphor
      const g6Result = await step.do('critic-g6-pass', async () => {
        const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct' as any, {
          messages: [
            {
              role: 'system',
              content: `You are a CRITIC agent evaluating visual metaphors and prompts.
Identify AI clichés: robot brains, handshakes, lightbulbs, generic stock business people, puzzle pieces.
Check if the prompt avoids these and matches brand identity.

Output JSON: { "score": number, "passed": boolean, "feedback": "string", "cliches": ["string"] }
Pass threshold: 70`,
            },
            { role: 'user', content: `Visual Archetype: ${archetype}\nThumbnail Concept: ${thumbnailConcept}\nImage Prompt: ${imagePrompt}` },
          ],
        });

        try {
          const text = (result as any).response;
          const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return {
            score: json.score || 50,
            passed: json.passed ?? json.score >= 70,
            feedback: json.feedback || '',
            cliches: json.cliches || [],
          };
        } catch {
          return { score: 75, passed: true, feedback: '', cliches: [] };
        }
      });

      qualityScores.g6_visual = g6Result.score;

      // Run G7: Engagement Prediction
      const g7Result = await step.do('critic-g7-pass', async () => {
        const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct' as any, {
          messages: [
            {
              role: 'system',
              content: `You are a CRITIC agent predicting engagement.
Rate engagement potential 0-100 based on:
- Shareability
- Comment-worthiness
- Save/bookmark likelihood
- Profile click potential

Output JSON: { "score": number, "feedback": "string" }`,
            },
            { role: 'user', content: `Content for ${platform}:\n${generatedContent}` },
          ],
        });

        try {
          const text = (result as any).response;
          const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          return { score: json.score || 70, feedback: json.feedback || '' };
        } catch {
          return { score: 70, feedback: '' };
        }
      });

      qualityScores.g7_engagement = g7Result.score;

      // Check if all gates passed
      allGatesPassed = g2Result.passed && g4Result.passed && g5Result.passed;

    // Step 5: Update spoke with final content and scores (Story 1.5-4-8)
    const finalStatus = 'pending_review';
    await step.do('update-spoke-final', async () => {
      const id = this.env.CLIENT_AGENT.idFromName(clientId);
      const agent = this.env.CLIENT_AGENT.get(id);

      await agent.fetch(new Request('http://internal/rpc', {
        method: 'POST',
        body: JSON.stringify({
          method: 'updateSpoke',
          params: {
            spokeId,
            updates: {
              content: generatedContent,
              status: finalStatus,
              qualityScores,
              visualArchetype: archetype,
              imagePrompt: imagePrompt,
              thumbnailConcept: thumbnailConcept,
              regenerationCount: 0,
            },
          },
        }),
      }));
    });

    return {
      spokeId,
      platform,
      status: finalStatus,
      iterations: 1,
      allGatesPassed,
      qualityScores,
      contentLength: generatedContent.length,
    };
  }
}
