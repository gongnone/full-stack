import type { Context, Next } from 'hono';

/**
 * Auth Types for Data Service
 */
export type AuthUser = {
  id: string;
  accountId: string;
  email?: string;
  role?: string;
};

export type AuthVariables = {
  user: AuthUser | null;
  userId: string;
  accountId: string;
};

/**
 * Validate session token from Better Auth cookie
 *
 * For data-service which doesn't have direct Better Auth setup,
 * we validate sessions by querying the session table directly.
 */
async function validateSession(db: D1Database, token: string): Promise<AuthUser | null> {
  try {
    // Query session table directly - same schema as Better Auth
    const session = await db.prepare(`
      SELECT s.id, s.user_id, s.expires_at, u.email, u.account_id, u.role
      FROM session s
      JOIN user u ON s.user_id = u.id
      WHERE s.token = ?
      AND s.expires_at > ?
      LIMIT 1
    `).bind(token, Math.floor(Date.now() / 1000)).first<{
      id: string;
      user_id: string;
      expires_at: number;
      email: string;
      account_id: string | null;
      role: string | null;
    }>();

    if (!session) {
      return null;
    }

    return {
      id: session.user_id,
      accountId: session.account_id || session.user_id, // Fallback to userId if no accountId
      email: session.email,
      role: session.role || 'editor',
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Extract session token from cookies
 * Supports both __Secure- prefixed and plain cookie names
 */
function extractSessionToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;

  // Try secure cookie first (production)
  const secureMatch = cookieHeader.match(/__Secure-better-auth\.session_token=([^;]+)/);
  if (secureMatch) {
    return decodeURIComponent(secureMatch[1]);
  }

  // Fallback to non-secure cookie (development)
  const plainMatch = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
  if (plainMatch) {
    return decodeURIComponent(plainMatch[1]);
  }

  return null;
}

/**
 * Auth middleware that validates session and sets user context
 *
 * Usage:
 *   app.use('/api/*', authMiddleware);
 *
 *   // In route handler:
 *   const user = c.get('user');
 *   const userId = c.get('userId');
 */
export function authMiddleware(options?: { required?: boolean }) {
  const required = options?.required ?? true;

  return async (c: Context<{ Bindings: Env; Variables: AuthVariables }>, next: Next) => {
    try {
      const cookieHeader = c.req.header('cookie');
      const token = extractSessionToken(cookieHeader);

      if (!token) {
        if (required) {
          return c.json({ error: 'Unauthorized: No session token' }, 401);
        }
        c.set('user', null);
        c.set('userId', '');
        c.set('accountId', '');
        return next();
      }

      const user = await validateSession(c.env.DB, token);

      if (!user) {
        if (required) {
          return c.json({ error: 'Unauthorized: Invalid or expired session' }, 401);
        }
        c.set('user', null);
        c.set('userId', '');
        c.set('accountId', '');
        return next();
      }

      c.set('user', user);
      c.set('userId', user.id);
      c.set('accountId', user.accountId);

      return next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return c.json({ error: 'Authentication failed' }, 500);
    }
  };
}

/**
 * Validate that the requested resource belongs to the authenticated user
 *
 * @param pathAccountId - Account ID from URL path
 * @param sessionAccountId - Account ID from session
 * @returns true if valid, false if cross-tenant access attempt
 */
export function validateTenantAccess(pathAccountId: string, sessionAccountId: string): boolean {
  return pathAccountId === sessionAccountId;
}

/**
 * Validate and sanitize path parameters to prevent path traversal
 */
export function sanitizePath(path: string): string | null {
  // Block path traversal attempts
  if (path.includes('..') || path.includes('%00') || path.includes('\0')) {
    return null;
  }

  // Normalize and validate
  const normalized = path.replace(/\/+/g, '/').replace(/^\//, '');

  // Block suspicious patterns
  if (/[<>"|?*]/.test(normalized)) {
    return null;
  }

  return normalized;
}

/**
 * Extract account ID from a path like "accountId/file/path"
 */
export function extractAccountIdFromPath(path: string): string | null {
  const parts = path.split('/');
  if (parts.length === 0) return null;
  return parts[0] || null;
}
