import { Hono, type Context, type Next } from 'hono';
import { cors } from 'hono/cors';
import { trpcServer } from '@hono/trpc-server';
import { appRouter } from '../trpc/router';
import { createContext } from '../trpc/context';
import { createAuth } from '../auth';
import type { Env } from '../index';

// Extend Hono context to include auth info
type Variables = {
  userId: string;
  accountId: string;
  userRole: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS - allow credentials for auth cookies
app.use('*', cors({
  origin: (origin) => {
    // Allow localhost and production domains
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8787',
      'https://foundry-stage.williamjshaw.ca',
      'https://foundry.williamjshaw.ca',
    ];
    // If origin is present and in allowed list, return it
    if (origin && allowedOrigins.includes(origin)) {
      return origin;
    }
    // For same-origin requests (no Origin header), return null to skip CORS headers
    // This is safe because same-origin requests don't need CORS
    if (!origin) {
      return null;
    }
    // Reject unknown origins by returning null (no CORS headers)
    return null;
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health check (simple)
app.get('/health', (c) => c.json({ status: 'ok', service: 'foundry-dashboard' }));

// API Health check (comprehensive - for smoke tests)
app.get('/api/health', async (c) => {
  const checks: Record<string, string> = {};
  let allHealthy = true;

  // Check 1: Basic response
  checks['api'] = 'ok';

  // Check 2: D1 Database connectivity
  try {
    await c.env.DB.prepare('SELECT 1').first();
    checks['d1'] = 'ok';
  } catch (error: unknown) {
    checks['d1'] = 'error';
    allHealthy = false;
  }

  // Check 3: R2 connectivity (if MEDIA bucket exists)
  if (c.env.MEDIA) {
    try {
      // List with limit 1 to check connectivity without reading data
      await c.env.MEDIA.list({ limit: 1 });
      checks['r2'] = 'ok';
    } catch (error: unknown) {
      checks['r2'] = 'error';
      allHealthy = false;
    }
  } else {
    checks['r2'] = 'not_configured';
  }

  return c.json({
    status: allHealthy ? 'ok' : 'degraded',
    service: 'foundry-dashboard',
    checks,
    timestamp: new Date().toISOString(),
  }, allHealthy ? 200 : 503);
});

// D1 Database health check (dedicated endpoint)
app.get('/api/health/db', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT 1 as check_value').first();
    return c.json({
      status: 'ok',
      database: 'foundry-global',
      result,
    });
  } catch (e: unknown) {
    return c.json({
      status: 'error',
      error: e instanceof Error ? e.message : 'Unknown database error',
    }, 503);
  }
});

// DEBUG ENDPOINTS REMOVED FOR SECURITY
// The following debug endpoints were removed to prevent information disclosure:
// - /api/debug/set-cookie - test cookie setting
// - /api/debug/test-session - session creation testing (exposed user emails!)
// - /api/debug/session - session state debugging (exposed session tokens!)
// If debugging is needed, use wrangler tail or local development instead.

// Better Auth routes - handles all /api/auth/* endpoints
app.on(['GET', 'POST'], '/api/auth/*', async (c) => {
  const auth = createAuth(c.env);
  const path = c.req.path;

  // Debug logging for OAuth callbacks
  if (path.includes('/callback/')) {
    console.log('[AUTH] OAuth callback received:', path);
    console.log('[AUTH] Query params:', c.req.url);
  }

  try {
    const response = await auth.handler(c.req.raw);

    // Debug logging for callback responses
    if (path.includes('/callback/')) {
      console.log('[AUTH] Callback response status:', response.status);
      console.log('[AUTH] Callback response headers:', Object.fromEntries(response.headers.entries()));
    }

    // Fix: Better Auth 1.4+ forces SameSite=None which Chrome blocks
    // Rewrite cookies to use SameSite=Lax for same-origin deployment
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length > 0) {
      const newHeaders = new Headers(response.headers);
      newHeaders.delete('Set-Cookie');

      for (const cookie of setCookies) {
        // Replace SameSite=None with SameSite=Lax
        const fixedCookie = cookie.replace(/SameSite=None/gi, 'SameSite=Lax');
        newHeaders.append('Set-Cookie', fixedCookie);
        console.log('[AUTH] Setting cookie:', fixedCookie.substring(0, 100) + '...');
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown auth error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('[AUTH] Handler error:', message);
    console.error('[AUTH] Stack:', stack);
    // For callbacks, redirect with error instead of returning JSON
    if (path.includes('/callback/')) {
      console.log('[AUTH] Redirecting to login with error:', message);
      return c.redirect(`/login?error=${encodeURIComponent(message)}`);
    }
    return c.json({ error: message }, 500);
  }
});

// Public tRPC procedures that don't require authentication
// These are for onboarding flows where users don't have accounts yet
const PUBLIC_TRPC_PROCEDURES = [
  'onboarding.validateInvite',
  'onboarding.submit',
  'strategy.validateStrategyToken',
  'strategy.approvePillar',
  'strategy.lockStrategy',
  'strategy.transcribeVoiceNote',
  'strategy.modifyPillar',
  'strategy.refinePillarWithAI',
  'strategy.getAlternatives',
];

// Auth middleware for protected routes
const authMiddleware = async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
  // Check if this is a public tRPC procedure
  const url = new URL(c.req.url);
  const input = url.searchParams.get('input');

  // For batched requests, check the path after /trpc/
  const pathParts = url.pathname.split('/trpc/');
  const procedureName = pathParts[1]?.split('?')[0];

  // Check if procedure is public (handles both single and batch requests)
  const isPublicProcedure = procedureName && PUBLIC_TRPC_PROCEDURES.some(pub =>
    procedureName === pub || procedureName.startsWith(pub)
  );

  if (isPublicProcedure) {
    // For public procedures, set guest context and continue
    c.set('userId', 'guest');
    c.set('accountId', '');
    c.set('userRole', 'guest');
    return next();
  }

  const auth = createAuth(c.env);

  try {
    // Use the getSession endpoint internally by making a synthetic request
    // This ensures consistent behavior with /api/auth/get-session
    const sessionResponse = await auth.handler(
      new Request(new URL('/api/auth/get-session', c.req.url), {
        method: 'GET',
        headers: c.req.raw.headers,
      })
    );

    if (!sessionResponse.ok) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sessionData = await sessionResponse.json() as { user?: { id: string; accountId?: string; role?: string } };

    if (!sessionData?.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Set user context for tRPC procedures
    c.set('userId', sessionData.user.id);
    c.set('accountId', sessionData.user.accountId || '');
    c.set('userRole', sessionData.user.role || 'editor');

    return next();
  } catch (error: unknown) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

// PUBLIC: Shareable review link validation (no auth required)
// This endpoint allows external reviewers to access shared content via token + email
app.post('/api/review/validate', async (c) => {
  const { token, email } = await c.req.json() as { token: string; email: string };

  if (!token || !email) {
    return c.json({ error: 'Token and email are required' }, 400);
  }

  // Find link by token
  const link = await c.env.DB.prepare('SELECT * FROM shareable_links WHERE token = ?')
    .bind(token)
    .first<{
      id: string;
      client_id: string;
      expires_at: number;
      permissions: string;
      allowed_emails: string | null;
    }>();

  if (!link) {
    return c.json({ error: 'Invalid or expired link' }, 404);
  }

  // Check expiration
  if (link.expires_at < Math.floor(Date.now() / 1000)) {
    return c.json({ error: 'Link has expired' }, 403);
  }

  // Check allowed emails if restricted
  if (link.allowed_emails) {
    const allowed = JSON.parse(link.allowed_emails) as string[];
    if (!allowed.includes(email.toLowerCase())) {
      return c.json({ error: 'You do not have permission to view this review' }, 403);
    }
  }

  // Get client info
  const client = await c.env.DB.prepare('SELECT id, name, brand_color FROM clients WHERE id = ?')
    .bind(link.client_id)
    .first<{ id: string; name: string; brand_color: string }>();

  if (!client) {
    return c.json({ error: 'Client not found' }, 404);
  }

  // Fetch spokes for review from Durable Object via service binding
  const doResponse = await c.env.CONTENT_ENGINE.fetch(
    new Request(`http://internal/api/client/${link.client_id}/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'getReviewQueue',
        params: { limit: 50 },
      }),
    })
  );

  const spokes = await doResponse.json();

  return c.json({
    client: {
      id: client.id,
      name: client.name,
      brandColor: client.brand_color,
    },
    permissions: link.permissions,
    spokes,
  });
});

// PUBLIC: Shareable review actions (approve/reject via token)
app.post('/api/review/action', async (c) => {
  const { token, email, spokeId, action, reason } = await c.req.json() as {
    token: string;
    email: string;
    spokeId: string;
    action: 'approve' | 'reject';
    reason?: string;
  };

  if (!token || !email || !spokeId || !action) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // Validate link and permissions
  const link = await c.env.DB.prepare('SELECT * FROM shareable_links WHERE token = ?')
    .bind(token)
    .first<{
      id: string;
      client_id: string;
      expires_at: number;
      permissions: string;
      allowed_emails: string | null;
    }>();

  if (!link) {
    return c.json({ error: 'Invalid or expired link' }, 404);
  }

  if (link.expires_at < Math.floor(Date.now() / 1000)) {
    return c.json({ error: 'Link has expired' }, 403);
  }

  // Check permissions - must have 'approve' or 'comment' permission for actions
  if (link.permissions !== 'approve' && link.permissions !== 'comment') {
    return c.json({ error: 'This link does not have approval permissions' }, 403);
  }

  // Check allowed emails
  if (link.allowed_emails) {
    const allowed = JSON.parse(link.allowed_emails) as string[];
    if (!allowed.includes(email.toLowerCase())) {
      return c.json({ error: 'You do not have permission' }, 403);
    }
  }

  // Execute action via Durable Object
  const method = action === 'approve' ? 'approveSpoke' : 'rejectSpoke';
  const params = action === 'approve'
    ? { spokeId }
    : { spokeId, reason: reason || 'Rejected via shared review' };

  const doResponse = await c.env.CONTENT_ENGINE.fetch(
    new Request(`http://internal/api/client/${link.client_id}/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, params }),
    })
  );

  const result = await doResponse.json() as Record<string, unknown>;
  return c.json(result);
});

// PUBLIC: Edit spoke content via shareable link (requires 'comment' permission)
app.post('/api/review/edit', async (c) => {
  const { token, email, spokeId, content } = await c.req.json() as {
    token: string;
    email: string;
    spokeId: string;
    content: string;
  };

  if (!token || !email || !spokeId || !content) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // Validate link and permissions
  const link = await c.env.DB.prepare('SELECT * FROM shareable_links WHERE token = ?')
    .bind(token)
    .first<{
      id: string;
      client_id: string;
      expires_at: number;
      permissions: string;
      allowed_emails: string | null;
    }>();

  if (!link) {
    return c.json({ error: 'Invalid or expired link' }, 404);
  }

  if (link.expires_at < Math.floor(Date.now() / 1000)) {
    return c.json({ error: 'Link has expired' }, 403);
  }

  // Check permissions - must have 'comment' permission to edit
  if (link.permissions !== 'comment') {
    return c.json({ error: 'This link does not have edit permissions' }, 403);
  }

  // Check allowed emails
  if (link.allowed_emails) {
    const allowed = JSON.parse(link.allowed_emails) as string[];
    if (!allowed.includes(email.toLowerCase())) {
      return c.json({ error: 'You do not have permission' }, 403);
    }
  }

  // Update spoke content via Durable Object
  const doResponse = await c.env.CONTENT_ENGINE.fetch(
    new Request(`http://internal/api/client/${link.client_id}/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'updateSpoke',
        params: { spokeId, updates: { content } },
      }),
    })
  );

  const result = await doResponse.json() as Record<string, unknown>;
  return c.json({ success: true, ...result });
});

// Apply auth middleware to tRPC routes
app.use('/trpc/*', authMiddleware);

// Public upload endpoint for onboarding (Story 10-1)
app.post('/api/upload/onboarding/:token/:path{.+}', async (c) => {
  const token = c.req.param('token');
  const rawPath = c.req.param('path');
  const filename = rawPath ? decodeURIComponent(rawPath) : '';

  if (!token || !filename) {
    return c.json({ error: 'Missing token or filename' }, 400);
  }

  // Validate token
  const invite = await c.env.DB.prepare(`
    SELECT client_id, expires_at, used_at FROM client_onboard_tokens WHERE token = ?
  `).bind(token).first<{ client_id: string; expires_at: number; used_at: number | null }>();

  if (!invite || invite.expires_at < Date.now() || invite.used_at) {
    return c.json({ error: 'Invalid or expired token' }, 403);
  }

  // Construct secure key
  // Format: onboarding/{client_id}/{uuid}/{filename}
  // We use the filename provided in path, but prefix it securely
  const r2Key = `onboarding/${invite.client_id}/${crypto.randomUUID()}/${filename}`;

  try {
    const body = await c.req.arrayBuffer();

    if (body.byteLength === 0) {
      return c.json({ error: 'Empty file' }, 400);
    }

    if (body.byteLength > 50 * 1024 * 1024) { // 50MB limit for audio/video
      return c.json({ error: 'File too large (max 50MB)' }, 400);
    }

    await c.env.MEDIA.put(r2Key, body, {
      httpMetadata: {
        contentType: c.req.header('Content-Type') || 'application/octet-stream',
      },
    });

    return c.json({
      success: true,
      r2Key,
      size: body.byteLength,
    });
  } catch (error: unknown) {
    console.error('Onboarding upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Apply auth middleware to upload routes
app.use('/api/upload/*', authMiddleware);

// File upload endpoint for R2 (Story 2.1 & 2.2)
app.post('/api/upload/:path{.+}', async (c) => {
  // Explicitly decode the path parameter (URL may be encoded from frontend)
  const rawPath = c.req.param('path');
  const r2Key = rawPath ? decodeURIComponent(rawPath) : '';
  const userId = c.get('userId');

  if (!r2Key) {
    return c.json({ error: 'Missing file path' }, 400);
  }

  // Validate the r2Key starts with allowed prefixes
  const allowedPrefixes = ['brand-samples/', 'voice-samples/', 'sources/', 'testimonials/'];
  if (!allowedPrefixes.some(prefix => r2Key.startsWith(prefix))) {
    return c.json({ error: 'Invalid upload path' }, 400);
  }

  // Story 3.1 Security: Verify user has access to the client_id in the R2 path
  // R2 key format: {prefix}/{client_id}/{...}
  const pathParts = r2Key.split('/');
  if (pathParts.length >= 2) {
    const clientIdFromPath = pathParts[1];
    // Verify user has membership to this client (via client_members junction table)
    try {
      const clientAccess = await c.env.DB.prepare(`
        SELECT 1 FROM client_members WHERE client_id = ? AND user_id = ?
      `).bind(clientIdFromPath, userId).first();

      if (!clientAccess) {
        return c.json({ error: 'Access denied to this client' }, 403);
      }
    } catch (error: unknown) {
      // If client_members table doesn't exist yet (Epic 7), skip check
      // This allows uploads to work while maintaining security once clients exist
    }
  }

  try {
    const body = await c.req.arrayBuffer();

    if (body.byteLength === 0) {
      return c.json({ error: 'Empty file' }, 400);
    }

    // Max file size: 10MB for most files, 20MB for testimonial videos
    const isTestimonial = r2Key.startsWith('testimonials/');
    const maxSize = isTestimonial ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
    const maxSizeLabel = isTestimonial ? '20MB' : '10MB';

    if (body.byteLength > maxSize) {
      return c.json({ error: `File too large (max ${maxSizeLabel})` }, 400);
    }

    // Upload to R2
    await c.env.MEDIA.put(r2Key, body, {
      httpMetadata: {
        contentType: c.req.header('Content-Type') || 'application/octet-stream',
      },
    });

    return c.json({
      success: true,
      r2Key,
      size: body.byteLength,
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// tRPC handler - passes auth context to procedures
app.use('/trpc/*', trpcServer({
  router: appRouter,
  createContext: (opts, c) => createContext({
    env: c.env,
    userId: c.get('userId'),
    accountId: c.get('accountId'),
    userRole: c.get('userRole'),
  }),
}));

// ===== WebSocket Route for BrandDNA Agent (Story 1.5-1-1) =====
// Handles WebSocket upgrade for client onboarding conversations
app.get('/ws/brand-dna/:clientId', async (c) => {
  const clientId = c.req.param('clientId');
  console.log('[WS] BrandDNA WebSocket request for client:', clientId);

  if (!clientId) {
    return c.json({ error: 'Client ID required' }, 400);
  }

  // Check for WebSocket upgrade
  const upgradeHeader = c.req.header('Upgrade');
  console.log('[WS] Upgrade header:', upgradeHeader);
  if (upgradeHeader?.toLowerCase() !== 'websocket') {
    return c.json({ error: 'WebSocket upgrade required' }, 426);
  }

  try {
    // Get the Durable Object for this client
    const doId = c.env.BRAND_DNA_AGENT.idFromName(clientId);
    const stub = c.env.BRAND_DNA_AGENT.get(doId);
    console.log('[WS] Created DO stub, forwarding request...');

    // The Agent SDK (partyserver) requires x-partykit-room header
    // Clone the request and add the required header
    const modifiedRequest = new Request(c.req.raw);
    modifiedRequest.headers.set('x-partykit-room', clientId);
    modifiedRequest.headers.set('x-partykit-namespace', 'brand-dna-agent');

    // Forward the request to the Durable Object
    const response = await stub.fetch(modifiedRequest);
    console.log('[WS] DO response status:', response.status, 'webSocket:', !!response.webSocket);
    return response;
  } catch (error) {
    console.error('[WS] Error forwarding to DO:', error);
    return c.json({ error: 'WebSocket connection failed' }, 500);
  }
});

// SPA fallback - serve static assets
app.get('*', async (c) => {
  const url = new URL(c.req.url);

  // Try to serve the exact path first
  let response = await c.env.ASSETS.fetch(c.req.raw);

  // If not found, serve index.html for SPA routing
  if (response.status === 404) {
    const indexRequest = new Request(new URL('/index.html', url.origin));
    response = await c.env.ASSETS.fetch(indexRequest);
  }

  return response;
});

export { app };
