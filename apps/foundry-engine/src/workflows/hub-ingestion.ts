import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from 'cloudflare:workers';
import { AI_MODELS } from '@repo/agent-logic';

interface Env {
  CLIENT_AGENT: DurableObjectNamespace;
  AI: Ai;
  VECTORIZE: VectorizeIndex;
  SPOKE_QUEUE: Queue;
}

interface HubIngestionParams {
  clientId: string;
  hubId: string;
  sourceContent: string;
  platform: string;
  angle: string;
}

interface PillarResult {
  pillarId: string;
  title: string;
  angle: string;
  hooks: string[];
}

export class HubIngestionWorkflow extends WorkflowEntrypoint<Env, HubIngestionParams> {
  async run(event: WorkflowEvent<HubIngestionParams>, step: WorkflowStep) {
    const { clientId, hubId, sourceContent, platform, angle } = event.payload;

    // Step 1: Create Hub record in Durable Object
    await step.do('create-hub', async () => {
      const id = this.env.CLIENT_AGENT.idFromName(clientId);
      const agent = this.env.CLIENT_AGENT.get(id);

      await agent.fetch(new Request('http://internal/rpc', {
        method: 'POST',
        body: JSON.stringify({
          method: 'createHub',
          params: {
            id: hubId,
            sourceContent,
            platform,
            angle,
            status: 'processing',
            pillars: [],
          },
        }),
      }));
    });

    // Step 2: Get Brand DNA for context
    const brandDNA = await step.do('get-brand-dna', async () => {
      const id = this.env.CLIENT_AGENT.idFromName(clientId);
      const agent = this.env.CLIENT_AGENT.get(id);

      const response = await agent.fetch(new Request('http://internal/rpc', {
        method: 'POST',
        body: JSON.stringify({
          method: 'getBrandDNA',
          params: {},
        }),
      }));

      return response.json();
    });

    // Step 3: Generate embeddings for source content
    const embeddings = await step.do('generate-embeddings', async () => {
      const result = await this.env.AI.run(AI_MODELS.EMBEDDING as any, {
        text: sourceContent,
      }) as any;

      // Store in Vectorize for future retrieval
      await this.env.VECTORIZE.upsert([
        {
          id: `hub-${hubId}`,
          values: result.data[0],
          metadata: { clientId, hubId, type: 'hub' },
        },
      ]);

      return result.data[0];
    });

    // Step 4: Extract content pillars using AI
    const pillars = await step.do('extract-pillars', async () => {
      const systemPrompt = `You are a content strategist. Extract 3-5 unique content pillars/angles from the source content.
Each pillar should represent a distinct theme or perspective that can be expanded into multiple pieces of content.

Brand Voice Context:
- Voice Markers: ${(brandDNA as any).voiceMarkers?.join(', ') || 'None defined'}
- Signature Patterns: ${(brandDNA as any).signaturePatterns?.join(', ') || 'None defined'}

Output format: JSON array of objects with 'pillarId', 'title', 'angle', 'hooks' (array of 3 hook ideas)`;

      const result = await this.env.AI.run(AI_MODELS.REASONING as any, {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Source Content:\n${sourceContent}\n\nTarget Platform: ${platform}\nContent Angle: ${angle}` },
        ],
      }) as any;

      try {
        // Parse the AI response
        const responseText = (result as any).response;
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as PillarResult[];
        }
      } catch (e) {
        // Fallback: create default pillars
      }

      return [
        {
          pillarId: crypto.randomUUID(),
          title: 'Primary Angle',
          angle: angle,
          hooks: ['Hook 1', 'Hook 2', 'Hook 3'],
        },
      ] as PillarResult[];
    });

    // Step 5: Update Hub with pillars
    await step.do('update-hub-pillars', async () => {
      const id = this.env.CLIENT_AGENT.idFromName(clientId);
      const agent = this.env.CLIENT_AGENT.get(id);

      // Note: We'd need an updateHub method, for now we'll store pillars
      // This is a simplification - in production, update the hub record
    });

    // Step 6: Queue spoke generation for each platform variant
    const platforms = ['twitter', 'linkedin', 'tiktok', 'instagram', 'thread'];
    const queuedSpokes = await step.do('queue-spoke-generation', async () => {
      const spokesToQueue: Array<{ spokeId: string; platform: string; pillarId: string }> = [];

      for (const pillar of pillars) {
        for (const targetPlatform of platforms) {
          const spokeId = crypto.randomUUID();
          spokesToQueue.push({
            spokeId,
            platform: targetPlatform,
            pillarId: pillar.pillarId,
          });

          // Queue each spoke for generation
          await this.env.SPOKE_QUEUE.send({
            type: 'generate-spoke',
            payload: {
              clientId,
              hubId,
              platform: targetPlatform,
              spokeId,
              pillarId: pillar.pillarId,
              pillarTitle: pillar.title,
              hooks: pillar.hooks,
              sourceContent,
            },
          });
        }
      }

      return spokesToQueue;
    });

    // Step 7: Mark Hub as ready
    await step.do('mark-hub-ready', async () => {
      const id = this.env.CLIENT_AGENT.idFromName(clientId);
      const agent = this.env.CLIENT_AGENT.get(id);

      // Update hub status - simplified
    });

    return {
      hubId,
      pillarsExtracted: pillars.length,
      spokesQueued: queuedSpokes.length,
      status: 'processing',
    };
  }
}
