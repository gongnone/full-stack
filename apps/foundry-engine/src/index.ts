import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Re-export Durable Objects
export { ClientAgent } from './durable-objects/client-agent';

// Re-export Workflows
export { HubIngestionWorkflow } from './workflows/hub-ingestion';
export { SpokeGenerationWorkflow } from './workflows/spoke-generation';
export { CalibrationWorkflow } from './workflows/calibration';

export interface Env {
  // Durable Objects
  CLIENT_AGENT: DurableObjectNamespace;

  // Workflows
  HUB_INGESTION: Workflow;
  SPOKE_GENERATION: Workflow;
  CALIBRATION: Workflow;

  // AI
  AI: Ai;

  // Storage
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  MEDIA_BUCKET: R2Bucket;

  // Queues
  SPOKE_QUEUE: Queue;
  QUALITY_QUEUE: Queue;

  // Config
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: ['http://localhost:5173', 'https://foundry.yourdomain.com'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'foundry-engine' }));

// Story 12-2: Seed Vectorize hook database with curated hooks
app.post('/api/hooks/seed', async (c) => {
  try {
    const { bulkIngestHooks } = await import('./services/hook-database');
    const { SEED_HOOKS } = await import('./services/hook-seed-data');

    const hooks = SEED_HOOKS;
    console.log(`[Hook Seed] Starting bulk ingest of ${hooks.length} hooks...`);

    const result = await bulkIngestHooks(
      hooks,
      c.env.VECTORIZE,
      c.env.DB,
      c.env.AI,
      25 // batch size
    );

    console.log(`[Hook Seed] Complete: ${result.ingested} ingested, ${result.errors.length} errors`);

    return c.json({
      status: 'complete',
      ingested: result.ingested,
      errors: result.errors.slice(0, 10), // Limit error output
      totalErrors: result.errors.length,
    });
  } catch (error) {
    console.error('[Hook Seed] Error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Story 12-2: Search similar hooks
app.post('/api/hooks/search', async (c) => {
  try {
    const { searchSimilarHooks } = await import('./services/hook-database');
    const { query, platform, category, topK } = await c.req.json();

    if (!query) {
      return c.json({ error: 'query is required' }, 400);
    }

    const result = await searchSimilarHooks(query, c.env.VECTORIZE, c.env.AI, {
      platform,
      category,
      topK: topK || 10,
    });

    return c.json(result);
  } catch (error) {
    console.error('[Hook Search] Error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Trigger Hub Ingestion Workflow
app.post('/api/hubs/ingest', async (c) => {
  const { clientId, hubId, sourceContent, platform, angle } = await c.req.json();

  const instance = await c.env.HUB_INGESTION.create({
    params: { clientId, hubId, sourceContent, platform, angle },
  });

  return c.json({
    instanceId: instance.id,
    status: 'started',
  });
});

// Trigger Spoke Generation Workflow
// This orchestrates spoke generation for all pillars × platforms
app.post('/api/spokes/generate', async (c) => {
  const { clientId, hubId, platforms, hubData } = await c.req.json();

  // hubData is passed from the dashboard (which queries D1)
  // This avoids the DO needing to duplicate hub storage
  if (!hubData || !hubData.pillars || hubData.pillars.length === 0) {
    return c.json({ error: 'Hub has no pillars. Run extraction first.' }, 400);
  }

  const { sourceContent, pillars } = hubData as {
    sourceContent: string;
    pillars: Array<{
      pillarId: string;
      title: string;
      hooks: string[];
      summary?: string;
    }>;
  };

  // Create workflow instances for each pillar × platform
  const workflowInstances: Array<{
    instanceId: string;
    spokeId: string;
    platform: string;
    pillarId: string;
  }> = [];

  const targetPlatforms = platforms || ['twitter', 'linkedin'];

  for (const pillar of pillars) {
    for (const platform of targetPlatforms) {
      const spokeId = crypto.randomUUID();

      const instance = await c.env.SPOKE_GENERATION.create({
        params: {
          clientId,
          hubId,
          spokeId,
          platform,
          pillarId: pillar.pillarId,
          pillarTitle: pillar.title,
          hooks: pillar.hooks || [],
          sourceContent: sourceContent,
        },
      });

      workflowInstances.push({
        instanceId: instance.id,
        spokeId,
        platform,
        pillarId: pillar.pillarId,
      });
    }
  }

  return c.json({
    status: 'started',
    hubId,
    pillarsCount: pillars.length,
    platformsCount: targetPlatforms.length,
    spokesQueued: workflowInstances.length,
    instances: workflowInstances,
  });
});

// Dashboard-compatible alias for spoke generation
// Dashboard calls this endpoint from hubs.ts triggerSpokeGeneration
app.post('/api/hubs/generate-spokes', async (c) => {
  const { clientId, hubId, pillars, strategy } = await c.req.json();

  if (!pillars || pillars.length === 0) {
    return c.json({ error: 'No pillars found. Extract pillars first.' }, 400);
  }

  // Determine platforms from strategy or use defaults
  const targetPlatforms = (strategy && Array.isArray(strategy) && strategy.length > 0)
    ? strategy.map((s: { platform: string }) => s.platform)
    : ['twitter', 'linkedin', 'tiktok', 'instagram', 'thread', 'carousel'];

  // Get source content from ClientAgent DO
  let sourceContent = '';
  let brandDNAContext = '';
  try {
    const agentId = c.env.CLIENT_AGENT.idFromName(clientId);
    const agent = c.env.CLIENT_AGENT.get(agentId);
    
    // Fetch hub source content
    const hubResponse = await agent.fetch(new Request('http://internal/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'getHub', params: { hubId } }),
    }));
    if (hubResponse.ok) {
      const hubData = await hubResponse.json() as { sourceContent?: string };
      sourceContent = hubData?.sourceContent || '';
    }
    
    // QR-2: Also fetch Brand DNA for richer context (non-blocking)
    try {
      const dnaResponse = await agent.fetch(new Request('http://internal/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'getBrandDNA', params: {} }),
      }));
      if (dnaResponse.ok) {
        const dna = await dnaResponse.json() as Record<string, unknown>;
        brandDNAContext = JSON.stringify(dna);
      }
    } catch (e) {
      console.warn('[generate-spokes] Could not fetch Brand DNA:', e);
    }
  } catch (e) {
    console.warn('[generate-spokes] Could not fetch source content from DO, continuing with empty:', e);
  }
  
  // QR-2: If source content is empty, synthesize from Brand DNA + pillar details
  if (!sourceContent || sourceContent.length < 100) {
    const pillarContext = pillars.map((p: any) => 
      `Pillar: ${p.title || p.pillar_name}\nCore claim: ${p.core_claim || 'N/A'}\nAngle: ${p.psychological_angle || 'N/A'}\nSupporting points: ${p.supporting_points || 'N/A'}`
    ).join('\n\n');
    
    sourceContent = `BRAND CONTEXT:\n${brandDNAContext ? brandDNAContext.substring(0, 2000) : 'No brand DNA available'}\n\nCONTENT PILLARS:\n${pillarContext}\n\nINSTRUCTION: Generate original, engaging content based on these pillars and brand context. Do NOT reference testing, platforms, databases, or technical infrastructure.`;
  }

  // Create workflow instances for each pillar × platform
  const workflowInstances: Array<{
    instanceId: string;
    spokeId: string;
    platform: string;
    pillarId: string;
  }> = [];

  for (const pillar of pillars) {
    // Parse golden_nuggets as hooks if available
    let hooks: string[] = [];
    try {
      if (pillar.golden_nuggets) {
        hooks = typeof pillar.golden_nuggets === 'string'
          ? JSON.parse(pillar.golden_nuggets)
          : pillar.golden_nuggets;
      }
    } catch { /* ignore parse errors */ }

    for (const platform of targetPlatforms) {
      const spokeId = crypto.randomUUID();

      const instance = await c.env.SPOKE_GENERATION.create({
        params: {
          clientId,
          hubId,
          spokeId,
          platform,
          pillarId: pillar.id || pillar.pillarId,
          pillarTitle: pillar.title,
          hooks,
          sourceContent,
        },
      });

      workflowInstances.push({
        instanceId: instance.id,
        spokeId,
        platform,
        pillarId: pillar.id || pillar.pillarId,
      });
    }
  }

  return c.json({
    instanceId: workflowInstances[0]?.instanceId || 'batch-' + hubId,
    status: 'started',
    hubId,
    spokesQueued: workflowInstances.length,
    instances: workflowInstances,
  });
});

// Trigger Spoke Variation Generation (Clone Feature)
// Creates variations of an existing spoke with different content
app.post('/api/spokes/variations', async (c) => {
  const { clientId, parentSpokeId, count } = await c.req.json();

  if (!clientId || !parentSpokeId) {
    return c.json({ error: 'clientId and parentSpokeId are required' }, 400);
  }

  const variationCount = Math.min(count || 1, 5);

  // Get parent spoke data from DO
  const doId = c.env.CLIENT_AGENT.idFromName(clientId);
  const agent = c.env.CLIENT_AGENT.get(doId);

  const parentResponse = await agent.fetch(new Request('http://internal/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'getSpoke',
      params: { spokeId: parentSpokeId },
    }),
  }));

  const parentSpoke = await parentResponse.json() as {
    id: string;
    hubId: string;
    pillarId: string;
    platform: string;
    content: string;
    qualityScores: Record<string, unknown>;
  } | null;

  if (!parentSpoke) {
    return c.json({ error: 'Parent spoke not found' }, 404);
  }

  // Check variation limit
  const countResponse = await agent.fetch(new Request('http://internal/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'countVariations',
      params: { parentSpokeId },
    }),
  }));

  const { count: existingCount } = await countResponse.json() as { count: number };

  if (existingCount >= 5) {
    return c.json({ error: 'Maximum 5 variations per spoke reached' }, 400);
  }

  const allowedVariations = Math.min(variationCount, 5 - existingCount);

  // Create workflow instances for each variation
  const workflowInstances: Array<{
    instanceId: string;
    spokeId: string;
    platform: string;
  }> = [];

  for (let i = 0; i < allowedVariations; i++) {
    const spokeId = crypto.randomUUID();

    const instance = await c.env.SPOKE_GENERATION.create({
      params: {
        clientId,
        hubId: parentSpoke.hubId,
        spokeId,
        platform: parentSpoke.platform,
        pillarId: parentSpoke.pillarId,
        pillarTitle: 'Variation',
        hooks: [],
        sourceContent: parentSpoke.content, // Use parent content as seed
        parentSpokeId, // Pass parent reference for tracking
        isVariation: true, // Flag to enable variation-specific prompting
      },
    });

    workflowInstances.push({
      instanceId: instance.id,
      spokeId,
      platform: parentSpoke.platform,
    });
  }

  return c.json({
    status: 'started',
    parentSpokeId,
    variationsQueued: workflowInstances.length,
    instances: workflowInstances,
  });
});

// Trigger Calibration Workflow
app.post('/api/calibration/start', async (c) => {
  const { clientId, contentType, content, r2Key, sampleIds } = await c.req.json();

  const instance = await c.env.CALIBRATION.create({
    params: { clientId, contentType, content, r2Key, sampleIds },
  });

  return c.json({
    instanceId: instance.id,
    status: 'started',
  });
});

// Story 2.3: Trigger Brand DNA Analysis background task
// Pulls voice_markers and brand_stances from DO, calculates strength score,
// generates embeddings with @cf/baai/bge-base-en-v1.5 and stores in Vectorize
app.post('/api/brand-dna/analyze', async (c) => {
  const { clientId, sampleContent } = await c.req.json();

  if (!clientId) {
    return c.json({ error: 'clientId is required' }, 400);
  }

  // Get the client's Durable Object
  const id = c.env.CLIENT_AGENT.idFromName(clientId);
  const agent = c.env.CLIENT_AGENT.get(id);

  // Trigger the background analysis
  const response = await agent.fetch(new Request('http://internal/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'analyzeBrandDNA',
      params: { sampleContent },
    }),
  }));

  const result = await response.json() as Record<string, unknown>;

  return c.json({
    status: 'completed',
    ...result,
  });
});

// Get workflow status - checks all workflow types
app.get('/api/workflows/:instanceId', async (c) => {
  const instanceId = c.req.param('instanceId');
  const workflowType = c.req.query('type'); // Optional: hub, spoke, calibration

  // Try each workflow binding based on type hint or all of them
  const workflows = [
    { name: 'hub', binding: c.env.HUB_INGESTION },
    { name: 'spoke', binding: c.env.SPOKE_GENERATION },
    { name: 'calibration', binding: c.env.CALIBRATION },
  ];

  // If type is specified, check only that workflow
  const toCheck = workflowType
    ? workflows.filter(w => w.name === workflowType)
    : workflows;

  for (const { name, binding } of toCheck) {
    try {
      const instance = await binding.get(instanceId);
      const status = await instance.status();
      return c.json({ workflowType: name, ...status });
    } catch {
      // Not found in this workflow type, try next
    }
  }

  return c.json({ error: 'Workflow not found' }, 404);
});

// Client Agent RPC endpoint
app.post('/api/client/:clientId/rpc', async (c) => {
  const clientId = c.req.param('clientId');
  const { method, params } = await c.req.json();

  const id = c.env.CLIENT_AGENT.idFromName(clientId);
  const agent = c.env.CLIENT_AGENT.get(id);

  const response = await agent.fetch(new Request('http://internal/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, params }),
  }));

  return c.json(await response.json());
});

// Serve media from R2 (Exports, Images, etc.)
app.get('/api/media/*', async (c) => {
  const path = c.req.path.replace('/api/media/', '');
  const object = await c.env.MEDIA_BUCKET.get(path);

  if (!object) {
    return c.json({ error: 'Object not found' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, {
    headers,
  });
});

// Queue consumer for spoke generation and brand DNA analysis
export default {
  fetch: app.fetch,

  async queue(batch: MessageBatch, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const { type, payload } = message.body as { type: string; payload: any };

      switch (type) {
        case 'generate-spoke': {
          // All params come from hub-ingestion workflow queue message
          const {
            clientId,
            hubId,
            platform,
            spokeId,
            pillarId,
            pillarTitle,
            hooks,
            sourceContent,
          } = payload;

          // Trigger spoke generation workflow with full params
          await env.SPOKE_GENERATION.create({
            params: {
              clientId,
              hubId,
              spokeId,
              platform,
              pillarId,
              pillarTitle,
              hooks,
              sourceContent,
            },
          });
          break;
        }

        case 'run-quality-gate': {
          const { clientId, spokeId, gate } = payload;
          // Run quality gate via Client Agent
          const id = env.CLIENT_AGENT.idFromName(clientId);
          const agent = env.CLIENT_AGENT.get(id);
          await agent.fetch(new Request('http://internal/rpc', {
            method: 'POST',
            body: JSON.stringify({
              method: 'runQualityGate',
              params: { spokeId, gate }
            }),
          }));
          break;
        }

        // Story 2.3: Brand DNA Analysis background task
        // Pulls voice_markers and brand_stances from DO, calculates strength,
        // generates embeddings with @cf/baai/bge-base-en-v1.5 and stores in Vectorize
        case 'analyze-brand-dna': {
          const { clientId, sampleContent } = payload;
          const id = env.CLIENT_AGENT.idFromName(clientId);
          const agent = env.CLIENT_AGENT.get(id);
          await agent.fetch(new Request('http://internal/rpc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'analyzeBrandDNA',
              params: { sampleContent },
            }),
          }));
          break;
        }
      }

      message.ack();
    }
  },
};
