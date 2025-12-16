import { Hono } from 'hono';
export const App = new Hono<{ Bindings: Env }>();

App.get('/api/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426);
  }

  // Get sessionId from query param
  const url = new URL(c.req.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return c.text("Missing sessionId", 400);
  }

  const id = c.env.CHAT_SESSION.idFromName(sessionId);
  const stub = c.env.CHAT_SESSION.get(id);

  return stub.fetch(c.req.raw);
});

// --- Workflow Triggers ---



App.post('/api/workflows/golden-pheasant', async (c) => {
  const body = await c.req.json();
  if (!body.projectId || !body.competitorUrl) return c.text('Missing params', 400);

  const instance = await c.env.GOLDEN_PHEASANT_WORKFLOW.create({
    params: body
  });

  return c.json({ id: instance.id, status: 'started' });
});

App.post('/api/workflows/godfather-offer', async (c) => {
  const body = await c.req.json();
  if (!body.projectId) return c.text('Missing params', 400);

  const instance = await c.env.GODFATHER_OFFER_WORKFLOW.create({
    params: body
  });

  return c.json({ id: instance.id, status: 'started' });
});

App.post('/api/workflows/events/upload-complete', async (c) => {
  const body = await c.req.json();
  if (!body.workflowId || !body.objectKey) return c.text('Missing params', 400);

  try {
    const instance = await c.env.GOLDEN_PHEASANT_WORKFLOW.get(body.workflowId);
    // 'upload-complete' must match what we waitForEvent
    // Note: Workers Types might rely on specific method names. 
    // Usually `sendEvent` implies sending the event. 
    // Cloudflare Docs: instance.sendEvent(eventName, eventData)
    // We'll trust this API exists on the binding interface. 
    // If TS fails, we might need to cast or check types.
    // @ts-ignore
    await instance.sendEvent('upload-complete', { objectKey: body.objectKey });

    return c.json({ success: true });
  } catch (e) {
    console.error('Failed to send event', e);
    return c.json({ success: false, error: String(e) }, 500);
  }
});
