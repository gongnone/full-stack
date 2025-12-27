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
}

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
          },
        }),
      }));
    });

    // Step 3: CREATOR AGENT - Generate initial content
    let generatedContent = await step.do('creator-generate', async () => {
      const { brandDNA, platformSpec } = context;

      const creatorPrompt = `You are a CREATOR agent - a divergent thinker who generates engaging content.

BRAND VOICE:
- Voice Markers: ${(brandDNA as any).voiceMarkers?.join(', ') || 'Authentic, engaging'}
- Banned Words: ${(brandDNA as any).bannedWords?.map((b: any) => b.word).join(', ') || 'None'}
- Signature Patterns: ${(brandDNA as any).signaturePatterns?.join(', ') || 'None'}

PLATFORM REQUIREMENTS (${platform.toUpperCase()}):
- Max Length: ${platformSpec.maxLength} characters
- Format: ${platformSpec.format}
- Style: ${platformSpec.style}

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

    let { archetype, thumbnailConcept, imagePrompt } = visualMetadata;

    // Step 4: CRITIC AGENT - Run Quality Gates
    let iteration = 0;
    let allGatesPassed = false;
    let qualityScores: Record<string, any> = {};

    while (iteration < MAX_REGENERATION_ATTEMPTS && !allGatesPassed) {
      // Run G2: Hook Strength
      const g2Result = await step.do(`critic-g2-iteration-${iteration}`, async () => {
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
      const g4Result = await step.do(`critic-g4-iteration-${iteration}`, async () => {
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
      const g5Result = await step.do(`critic-g5-iteration-${iteration}`, async () => {
        const { platformSpec } = context;

        const lengthOk = generatedContent.length <= platformSpec.maxLength;
        return {
          passed: lengthOk,
          feedback: lengthOk ? '' : `Content exceeds ${platformSpec.maxLength} char limit`,
        };
      });

      qualityScores.g5_platform = g5Result.passed;

      // Run G6: Visual Metaphor (NEW)
      const g6Result = await step.do(`critic-g6-iteration-${iteration}`, async () => {
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
      const g7Result = await step.do(`critic-g7-iteration-${iteration}`, async () => {
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
      allGatesPassed = g2Result.passed && g4Result.passed && g5Result.passed && g6Result.passed;

      if (!allGatesPassed && iteration < MAX_REGENERATION_ATTEMPTS - 1) {
        // Store feedback for self-healing
        await step.do(`store-feedback-iteration-${iteration}`, async () => {
          const id = this.env.CLIENT_AGENT.idFromName(clientId);
          const agent = this.env.CLIENT_AGENT.get(id);

          const feedback = [
            !g2Result.passed ? `G2: ${g2Result.feedback}` : '',
            !g4Result.passed ? `G4: ${g4Result.feedback}` : '',
            !g5Result.passed ? `G5: ${g5Result.feedback}` : '',
            !g6Result.passed ? `G6: ${g6Result.feedback}` : '',
          ].filter(Boolean).join('\n');

          await agent.fetch(new Request('http://internal/rpc', {
            method: 'POST',
            body: JSON.stringify({
              method: 'storeFeedback',
              params: {
                spokeId,
                gate: 'combined',
                criticOutput: feedback,
                iteration,
              },
            }),
          }));
        });

        // SELF-HEALING: Regenerate with feedback
        const healingResult = await step.do(`regenerate-iteration-${iteration + 1}`, async () => {
          const { brandDNA, platformSpec } = context;

          const healingPrompt = `You are a CREATOR agent REGENERATING content and visual metadata based on CRITIC feedback.

PREVIOUS ATTEMPT FAILED THESE GATES:
${!g2Result.passed ? `- G2 Hook Strength: ${g2Result.feedback}` : ''}
${!g4Result.passed ? `- G4 Voice Alignment: ${g4Result.feedback}` : ''}
${!g5Result.passed ? `- G5 Platform Compliance: ${g5Result.feedback}` : ''}
${!g6Result.passed ? `- G6 Visual Metaphor: ${g6Result.feedback}` : ''}

ORIGINAL CONTENT:
${generatedContent}

ORIGINAL VISUAL:
- Archetype: ${archetype}
- Prompt: ${imagePrompt}

REQUIREMENTS:
- Fix ALL identified issues
- Maintain core message
- Stay within ${platformSpec.maxLength} chars
- Match brand voice exactly
- Fix visual prompt to avoid clichés: robot brains, handshakes, lightbulbs

Output JSON only: {
  "content": "string (improved text)",
  "archetype": "string",
  "thumbnailConcept": "string",
  "imagePrompt": "string"
}`;

          const result = await this.env.AI.run('@cf/meta/llama-3.1-70b-instruct' as any, {
            messages: [
              { role: 'system', content: healingPrompt },
              { role: 'user', content: 'Regenerate addressing all feedback.' },
            ],
          });

          try {
            const text = (result as any).response;
            return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          } catch {
            return { content: generatedContent, archetype, thumbnailConcept, imagePrompt };
          }
        });

        generatedContent = healingResult.content || generatedContent;
        archetype = healingResult.archetype || archetype;
        thumbnailConcept = healingResult.thumbnailConcept || thumbnailConcept;
        imagePrompt = healingResult.imagePrompt || imagePrompt;

        iteration++;
      } else {
        break;
      }
    }

    // Step 5: Update spoke with final content and scores
    const finalStatus = allGatesPassed ? 'reviewing' : 'reviewing';
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
              regenerationCount: iteration,
            },
          },
        }),
      }));
    });

    return {
      spokeId,
      platform,
      status: finalStatus,
      iterations: iteration + 1,
      allGatesPassed,
      qualityScores,
      contentLength: generatedContent.length,
    };
  }
}
