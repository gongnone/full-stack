import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  authMiddleware,
  validateTenantAccess,
  sanitizePath,
  extractAccountIdFromPath,
  type AuthVariables
} from './auth';

export const App = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// CORS configuration
App.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8787',
      'https://stage.williamjshaw.ca',
      'https://foundry.williamjshaw.ca',
    ];
    return allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health check - public endpoint
App.get('/health', (c) => c.json({ status: 'ok', service: 'data-service' }));

// --- Protected WebSocket Endpoints ---

// WebSocket for chat sessions - requires auth + tenant validation
App.get('/api/ws', authMiddleware(), async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426);
  }

  const url = new URL(c.req.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return c.json({ error: 'Missing sessionId' }, 400);
  }

  // Validate session ID format and sanitize
  const sanitized = sanitizePath(sessionId);
  if (!sanitized) {
    return c.json({ error: 'Invalid sessionId format' }, 400);
  }

  // Extract account ID from session ID (format: accountId_sessionId)
  const sessionAccountId = extractAccountIdFromPath(sanitized);
  const userAccountId = c.get('accountId');

  // Validate tenant access - user can only access their own sessions
  if (sessionAccountId && !validateTenantAccess(sessionAccountId, userAccountId)) {
    console.warn(`Cross-tenant access blocked: user ${userAccountId} tried to access session ${sessionAccountId}`);
    return c.json({ error: 'Forbidden: Access denied to this session' }, 403);
  }

  try {
    const id = c.env.CHAT_SESSION.idFromName(sessionId);
    const stub = c.env.CHAT_SESSION.get(id);
    return stub.fetch(c.req.raw);
  } catch (error) {
    console.error('WebSocket DO access error:', error);
    return c.json({ error: 'Service unavailable' }, 503);
  }
});

// --- Protected R2 Asset Endpoints ---

App.get('/api/assets/:key{.+}', authMiddleware(), async (c) => {
  const key = c.req.param('key');

  // Sanitize and validate the key
  const sanitizedKey = sanitizePath(key);
  if (!sanitizedKey) {
    return c.json({ error: 'Invalid asset key' }, 400);
  }

  // Extract account ID from asset path (format: accountId/path/to/file)
  const assetAccountId = extractAccountIdFromPath(sanitizedKey);
  const userAccountId = c.get('accountId');

  // Validate tenant access - user can only access their own assets
  if (assetAccountId && !validateTenantAccess(assetAccountId, userAccountId)) {
    console.warn(`Cross-tenant asset access blocked: user ${userAccountId} tried to access ${assetAccountId}`);
    // Return 404 to not confirm asset existence
    return c.text('Asset not found', 404);
  }

  try {
    const object = await c.env.BUCKET.get(sanitizedKey);

    if (!object) {
      return c.text('Asset not found', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    const headerObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerObj[key] = value;
    });

    return c.body(object.body as any, 200, headerObj);
  } catch (error) {
    console.error('R2 access error:', error);
    return c.json({ error: 'Service unavailable' }, 503);
  }
});

// --- Protected Workflow Endpoints ---

App.post('/api/workflows/golden-pheasant', authMiddleware(), async (c) => {
  const userId = c.get('userId');

  try {
    const body = await c.req.json();
    if (!body.projectId || !body.competitorUrl) {
      return c.json({ error: 'Missing params: projectId and competitorUrl required' }, 400);
    }

    // Validate project ownership
    const project = await c.env.DB.prepare(`
      SELECT id, user_id FROM projects WHERE id = ? LIMIT 1
    `).bind(body.projectId).first<{ id: string; user_id: string }>();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    if (project.user_id !== userId) {
      console.warn(`Workflow access blocked: user ${userId} tried to access project ${body.projectId}`);
      return c.json({ error: 'Forbidden: Access denied to this project' }, 403);
    }

    const instance = await c.env.GOLDEN_PHEASANT_WORKFLOW.create({
      params: { ...body, userId }
    });

    return c.json({ id: instance.id, status: 'started' });
  } catch (error: any) {
    // Check if it's a "table not found" error (projects table doesn't exist yet)
    if (error.message?.includes('no such table')) {
      // Allow if projects table doesn't exist (pre-Epic 7)
      console.warn('Projects table not found, allowing workflow without ownership check');
      const body = await c.req.json().catch(() => ({}));
      try {
        const instance = await c.env.GOLDEN_PHEASANT_WORKFLOW.create({
          params: { ...body, userId }
        });
        return c.json({ id: instance.id, status: 'started' });
      } catch (wfError) {
        console.error('Workflow creation error:', wfError);
        return c.json({ error: 'Workflow creation failed' }, 503);
      }
    }
    console.error('Workflow error:', error);
    return c.json({ error: 'Workflow creation failed' }, 500);
  }
});

App.post('/api/workflows/godfather-offer', authMiddleware(), async (c) => {
  const userId = c.get('userId');

  try {
    const body = await c.req.json();
    if (!body.projectId) {
      return c.json({ error: 'Missing params: projectId required' }, 400);
    }

    // Validate project ownership
    const project = await c.env.DB.prepare(`
      SELECT id, user_id FROM projects WHERE id = ? LIMIT 1
    `).bind(body.projectId).first<{ id: string; user_id: string }>();

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    if (project.user_id !== userId) {
      console.warn(`Workflow access blocked: user ${userId} tried to access project ${body.projectId}`);
      return c.json({ error: 'Forbidden: Access denied to this project' }, 403);
    }

    const instance = await c.env.GODFATHER_OFFER_WORKFLOW.create({
      params: { ...body, userId }
    });

    return c.json({ id: instance.id, status: 'started' });
  } catch (error: any) {
    if (error.message?.includes('no such table')) {
      console.warn('Projects table not found, allowing workflow without ownership check');
      const body = await c.req.json().catch(() => ({}));
      try {
        const instance = await c.env.GODFATHER_OFFER_WORKFLOW.create({
          params: { ...body, userId }
        });
        return c.json({ id: instance.id, status: 'started' });
      } catch (wfError) {
        console.error('Workflow creation error:', wfError);
        return c.json({ error: 'Workflow creation failed' }, 503);
      }
    }
    console.error('Workflow error:', error);
    return c.json({ error: 'Workflow creation failed' }, 500);
  }
});

// Workflow events endpoint - requires auth
App.post('/api/workflows/events/upload-complete', authMiddleware(), async (c) => {
  try {
    const body = await c.req.json();
    if (!body.workflowId || !body.objectKey) {
      return c.json({ error: 'Missing params: workflowId and objectKey required' }, 400);
    }

    const instance = await c.env.GOLDEN_PHEASANT_WORKFLOW.get(body.workflowId);
    // @ts-ignore - sendEvent exists but types may not include it
    await instance.sendEvent('upload-complete', { objectKey: body.objectKey });

    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to send event:', error);
    return c.json({ error: 'Event delivery failed' }, 500);
  }
});
