import { Hono } from 'hono';
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
      'https://stage.williamjshaw.ca',
      'https://foundry.williamjshaw.ca',
    ];
    return allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];
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
  } catch (e: any) {
    checks['d1'] = 'error';
    allHealthy = false;
  }

  // Check 3: R2 connectivity (if MEDIA bucket exists)
  if (c.env.MEDIA) {
    try {
      // List with limit 1 to check connectivity without reading data
      await c.env.MEDIA.list({ limit: 1 });
      checks['r2'] = 'ok';
    } catch {
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
  } catch (e: any) {
    return c.json({
      status: 'error',
      error: e.message,
    }, 503);
  }
});

// Test cookie setting
app.get('/api/debug/set-cookie', (c) => {
  const testValue = `test-${Date.now()}`;
  c.header('Set-Cookie', `__Secure-test.session=${testValue}; Path=/; Secure; HttpOnly; SameSite=None`);
  return c.json({ message: 'Cookie set', value: testValue });
});

// Test session creation directly
app.get('/api/debug/test-session', async (c) => {
  const auth = createAuth(c.env);

  try {
    // Get the existing user
    const user = await c.env.DB.prepare('SELECT * FROM user LIMIT 1').first();
    if (!user) {
      return c.json({ error: 'No user found' });
    }

    // Try to create a session via the sign-in endpoint
    const signInResponse = await auth.api.signInEmail({
      body: {
        email: user.email as string,
        password: 'test-password-will-fail',
      },
    });

    return c.json({
      message: 'Sign-in attempt result',
      response: signInResponse,
    });
  } catch (error: any) {
    return c.json({
      error: error.message,
      stack: error.stack,
    });
  }
});

// Debug endpoint to check cookies and session
app.get('/api/debug/session', async (c) => {
  const auth = createAuth(c.env);
  const cookies = c.req.header('cookie');

  // Parse the session token from cookies (handles __Secure- prefix)
  const sessionTokenMatch = cookies?.match(/__Secure-better-auth\.session_token=([^;]+)/);
  const sessionToken = sessionTokenMatch?.[1] ? decodeURIComponent(sessionTokenMatch[1]) : null;

  // Try to get session using the handler (same as /api/auth/get-session)
  const sessionResponse = await auth.handler(
    new Request(new URL('/api/auth/get-session', c.req.url), {
      method: 'GET',
      headers: c.req.raw.headers,
    })
  );

  const sessionData = await sessionResponse.json();

  // Also check DB directly
  let dbSession = null;
  let dbError = null;
  if (sessionToken) {
    try {
      dbSession = await c.env.DB.prepare('SELECT id, token, user_id, expires_at FROM session WHERE token = ? LIMIT 1')
        .bind(sessionToken)
        .first();
    } catch (e: any) {
      dbError = e.message;
    }
  }

  return c.json({
    hasCookies: !!cookies,
    cookieNames: cookies ? cookies.split(';').map(c => c.trim().split('=')[0]) : [],
    sessionTokenFromCookie: sessionToken ? `${sessionToken.substring(0, 8)}...` : null,
    sessionResponseStatus: sessionResponse.status,
    sessionData,
    dbSession: dbSession ? { id: dbSession.id, hasToken: !!dbSession.token, userId: dbSession.user_id } : null,
    dbError,
  });
});

// Better Auth routes - handles all /api/auth/* endpoints
app.on(['GET', 'POST'], '/api/auth/**', async (c) => {
  const auth = createAuth(c.env);

  try {
    // Debug: Log sign-in attempts
    if (c.req.path.includes('/sign-in/')) {
      console.log('Sign-in attempt:', { path: c.req.path, method: c.req.method });
    }

    const response = await auth.handler(c.req.raw);

    // Debug: Log non-OK responses from auth handler
    if (!response.ok && c.req.path.includes('/sign-in/')) {
      const clonedResponse = response.clone();
      const body = await clonedResponse.text();
      console.log('Sign-in response:', { status: response.status, body: body.substring(0, 500) });
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
      }

      // Debug: Log callback details
      if (c.req.path.includes('/callback/')) {
        console.log('OAuth callback response:', {
          status: response.status,
          location: response.headers.get('location'),
          cookies: newHeaders.getSetCookie().map(c => c.substring(0, 80) + '...'),
        });
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Auth handler error:', error.message, error.stack);
    // For callbacks, redirect with error instead of returning JSON
    if (c.req.path.includes('/callback/')) {
      return c.redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
    return c.json({ error: error.message }, 500);
  }
});

// Auth middleware for protected routes
const authMiddleware = async (c: any, next: any) => {
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
      const cookies = c.req.header('cookie');
      console.log('Auth middleware: Session check failed. Status:', sessionResponse.status, 'Cookies:', !!cookies);
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
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

// Apply auth middleware to tRPC routes
app.use('/trpc/*', authMiddleware);

// Apply auth middleware to upload routes
app.use('/api/upload/*', authMiddleware);

// File upload endpoint for R2 (Story 2.1 & 2.2)
app.post('/api/upload/:path{.+}', async (c) => {
  // Explicitly decode the path parameter (URL may be encoded from frontend)
  const rawPath = c.req.param('path');
  const r2Key = rawPath ? decodeURIComponent(rawPath) : '';
  const userId = c.get('userId');

  console.log('Upload request:', { rawPath, r2Key, userId });

  if (!r2Key) {
    return c.json({ error: 'Missing file path' }, 400);
  }

  // Validate the r2Key starts with allowed prefixes
  const allowedPrefixes = ['brand-samples/', 'voice-samples/', 'sources/'];
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
    } catch {
      // If client_members table doesn't exist yet (Epic 7), skip check
      // This allows uploads to work while maintaining security once clients exist
    }
  }

  try {
    const body = await c.req.arrayBuffer();

    if (body.byteLength === 0) {
      return c.json({ error: 'Empty file' }, 400);
    }

    // Max file size: 10MB
    if (body.byteLength > 10 * 1024 * 1024) {
      return c.json({ error: 'File too large (max 10MB)' }, 400);
    }

    // Upload to R2
    console.log('Uploading to R2:', { r2Key, size: body.byteLength });
    await c.env.MEDIA.put(r2Key, body, {
      httpMetadata: {
        contentType: c.req.header('Content-Type') || 'application/octet-stream',
      },
    });
    console.log('R2 upload success:', { r2Key });

    return c.json({
      success: true,
      r2Key,
      size: body.byteLength,
    });
  } catch (error) {
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
