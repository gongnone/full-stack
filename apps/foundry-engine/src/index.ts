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
app.post('/api/spokes/generate', async (c) => {
  const { clientId, hubId, platforms } = await c.req.json();

  const instance = await c.env.SPOKE_GENERATION.create({
    params: { clientId, hubId, platforms },
  });

  return c.json({
    instanceId: instance.id,
    status: 'started',
  });
});

// Trigger Calibration Workflow
app.post('/api/calibration/start', async (c) => {
  const { clientId, contentType, content } = await c.req.json();

  const instance = await c.env.CALIBRATION.create({
    params: { clientId, contentType, content },
  });

  return c.json({
    instanceId: instance.id,
    status: 'started',
  });
});

// Get workflow status
app.get('/api/workflows/:instanceId', async (c) => {
  const instanceId = c.req.param('instanceId');

  // Check each workflow type for the instance
  // In practice, you'd store the workflow type with the instance ID
  try {
    const instance = await c.env.HUB_INGESTION.get(instanceId);
    const status = await instance.status();
    return c.json(status);
  } catch {
    return c.json({ error: 'Workflow not found' }, 404);
  }
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

// Queue consumer for spoke generation
export default {
  fetch: app.fetch,

  async queue(batch: MessageBatch, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const { type, payload } = message.body as { type: string; payload: any };

      switch (type) {
        case 'generate-spoke': {
          const { clientId, hubId, platform, spokeId } = payload;
          // Trigger spoke generation workflow step
          await env.SPOKE_GENERATION.create({
            params: { clientId, hubId, platform, spokeId },
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
      }

      message.ack();
    }
  },
};
