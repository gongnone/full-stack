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
      'https://foundry.williamjshaw.ca',
      'https://foundry-stage.williamjshaw.ca',
    ];
    return allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'foundry-dashboard' }));

// Better Auth routes - handles all /api/auth/* endpoints
app.on(['GET', 'POST'], '/api/auth/**', async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// Auth middleware for protected routes
const authMiddleware = async (c: any, next: any) => {
  const auth = createAuth(c.env);

  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Set user context for tRPC procedures
    c.set('userId', session.user.id);
    c.set('accountId', (session.user as any).accountId || '');
    c.set('userRole', (session.user as any).role || 'editor');

    return next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

// Apply auth middleware to tRPC routes
app.use('/trpc/*', authMiddleware);

// Apply auth middleware to upload routes
app.use('/api/upload/*', authMiddleware);

// File upload endpoint for R2 (Story 2.1 & 2.2)
app.post('/api/upload/:path{.+}', async (c) => {
  const r2Key = c.req.param('path');

  if (!r2Key) {
    return c.json({ error: 'Missing file path' }, 400);
  }

  // Validate the r2Key starts with allowed prefixes
  const allowedPrefixes = ['brand-samples/', 'voice-samples/'];
  if (!allowedPrefixes.some(prefix => r2Key.startsWith(prefix))) {
    return c.json({ error: 'Invalid upload path' }, 400);
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
