import { betterAuth } from 'better-auth';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Env } from '../index';
import { sendVerificationEmail as sendVerificationEmailViaService, sendPasswordResetEmail as sendPasswordResetEmailViaService } from '../email';

/**
 * Convert any date-like value to milliseconds since epoch
 * Better Auth uses JavaScript Date.getTime() internally (milliseconds, not seconds)
 *
 * Handles: Date objects, ISO strings, existing timestamps (seconds or milliseconds)
 */
function toMilliseconds(value: unknown): number {
  if (value instanceof Date) {
    return value.getTime(); // Already milliseconds
  }
  if (typeof value === 'string') {
    // ISO string like "2026-01-08T17:14:15.553Z"
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) {
      return parsed; // Date.parse returns milliseconds
    }
  }
  if (typeof value === 'number') {
    // Detect if already milliseconds (13+ digits) or seconds (10 digits)
    // Timestamps before year 2001 in ms: 978307200000 (12 digits)
    // Timestamps after year 2001 in seconds: 978307200 (9 digits)
    // Year 3000 in seconds: 32503680000 (11 digits)
    // Year 3000 in milliseconds: 32503680000000 (14 digits)
    // If value has 10 or fewer digits, it's likely seconds
    if (value < 10000000000) {
      return value * 1000; // Convert seconds to milliseconds
    }
    return value; // Already milliseconds
  }
  // Fallback: current time
  return Date.now();
}

// NOTE: DateToTimestampPlugin was removed - using databaseHooks instead for explicit timestamp conversion

/**
 * Create Better Auth instance for Cloudflare Workers
 * Uses D1 as the database backend via Kysely
 */
// Better Auth database schema - using Record for Kysely compatibility
type AuthDatabase = Record<string, Record<string, unknown>>;

export function createAuth(env: Env) {
  const db = new Kysely<AuthDatabase>({
    dialect: new D1Dialect({ database: env.DB }),
    // Removed DateToTimestampPlugin - using databaseHooks instead for explicit timestamp conversion
  });

  return betterAuth({
    database: {
      db,
      type: 'sqlite',
      // Enable debug logs to trace queries
      debugLogs: true,
      // D1 doesn't support transactions well via kysely-d1
      transaction: false,
    },

    // Email + Password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: env.ENVIRONMENT === 'production',
      minPasswordLength: 12,
      maxPasswordLength: 128,
      // Password must contain: uppercase, lowercase, number, special char
      sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
        const result = await sendPasswordResetEmailViaService(env, { email: user.email, name: user.name }, url);
        if (!result.success) {
          console.error('Failed to send password reset email:', result.error);
          throw new Error('Failed to send password reset email. Please try again.');
        }
      },
    },

    // Email verification configuration
    emailVerification: {
      sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
        const result = await sendVerificationEmailViaService(env, { email: user.email, name: user.name }, url);
        if (!result.success) {
          console.error('Failed to send verification email:', result.error);
          // Don't throw - Better Auth will still create the user
          // They can request a new verification email later
        }
      },
    },

    // Session configuration - map to actual snake_case DB columns
    // Note: DB schema uses snake_case despite migration file showing camelCase
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: false,
      },
      fields: {
        token: 'token',
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        userId: 'user_id',
      },
    },

    // Account configuration - map to actual snake_case DB columns
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github', 'twitter'],
      },
      fields: {
        accountId: 'account_id',
        providerId: 'provider_id',
        userId: 'user_id',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: 'access_token_expires_at',
        refreshTokenExpiresAt: 'refresh_token_expires_at',
        idToken: 'id_token',
        scope: 'scope',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },

    // Verification configuration - map to actual snake_case DB columns
    verification: {
      fields: {
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },

    // User configuration - map to actual snake_case DB columns
    user: {
      fields: {
        emailVerified: 'email_verified',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      additionalFields: {
        accountId: {
          type: 'string',
          required: false,
          fieldName: 'account_id',
        },
        role: {
          type: 'string',
          required: false,
          defaultValue: 'editor',
        },
      },
    },

    // OAuth providers (optional - configure with env vars)
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || '',
        clientSecret: env.GOOGLE_CLIENT_SECRET || '',
        enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID || '',
        clientSecret: env.GITHUB_CLIENT_SECRET || '',
        enabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
      },
      // Twitter/X OAuth 2.0 for social posting (Phase 2B)
      // Requires Twitter API v2 OAuth 2.0 app with read/write access
      // Scopes needed: tweet.read, tweet.write, users.read, offline.access
      twitter: {
        clientId: env.TWITTER_CLIENT_ID || '',
        clientSecret: env.TWITTER_CLIENT_SECRET || '',
        enabled: !!(env.TWITTER_CLIENT_ID && env.TWITTER_CLIENT_SECRET),
      },
    },

    // Security settings
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL || 'http://localhost:8787',

    // Trust the host header in production (must match CORS origins)
    trustedOrigins: [
      'http://localhost:5173',
      'http://localhost:8787',
      'https://foundry-stage.williamjshaw.ca',
      'https://foundry.williamjshaw.ca',
    ],

    // Advanced security configuration
    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
      },
      // Use default 'better-auth' prefix to match existing session cookies
      // Use secure cookies only in production - localhost HTTP needs non-secure for WebKit
      useSecureCookies: env.ENVIRONMENT === 'production' || env.ENVIRONMENT === 'stage',
      crossSubDomainCookies: {
        enabled: false,
      },
      // sameSite: 'lax' is correct for same-origin (frontend + API on same domain)
      // 'none' was causing issues - it's for cross-origin only
      // secure: false for local dev to support WebKit E2E tests on localhost HTTP
      defaultCookieAttributes: {
        sameSite: 'lax',
        secure: env.ENVIRONMENT === 'production' || env.ENVIRONMENT === 'stage',
        httpOnly: true,
      },
    },

    // Database hooks to convert Date objects to millisecond timestamps for D1/SQLite
    // IMPORTANT: Better Auth expects milliseconds for timestamp comparisons (Date.now())
    // Using 'as any' to satisfy TypeScript while returning numeric timestamps for SQLite
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            // emailVerified can be boolean or Date depending on Better Auth version
            // If Date, use milliseconds for consistency with Better Auth
            const emailVerifiedValue = (user.emailVerified as unknown) instanceof Date
              ? (user.emailVerified as unknown as Date).getTime()
              : (user.emailVerified ? 1 : 0);
            return {
              data: {
                ...user,
                createdAt: toMilliseconds(user.createdAt),
                updatedAt: toMilliseconds(user.updatedAt),
                emailVerified: emailVerifiedValue,
              } as Record<string, unknown>,
            };
          },
        },
        update: {
          before: async (user) => {
            const data: Record<string, unknown> = { ...user };
            if (data.updatedAt !== undefined) data.updatedAt = toMilliseconds(data.updatedAt);
            if (data.createdAt !== undefined) data.createdAt = toMilliseconds(data.createdAt);
            if (data.emailVerified instanceof Date) data.emailVerified = data.emailVerified.getTime();
            else if (typeof data.emailVerified === 'boolean') data.emailVerified = data.emailVerified ? 1 : 0;
            return { data };
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            console.log('[AUTH DB] Session create - raw input:', JSON.stringify(session));
            // Only transform timestamp fields, preserve everything else
            const sessionRecord = session as Record<string, unknown>;
            const transformed: Record<string, unknown> = {};

            for (const [key, value] of Object.entries(sessionRecord)) {
              if (key === 'expiresAt' || key === 'createdAt' || key === 'updatedAt') {
                transformed[key] = toMilliseconds(value);
              } else {
                transformed[key] = value;
              }
            }

            console.log('[AUTH DB] Session create - transformed:', JSON.stringify(transformed));
            return { data: transformed };
          },
          after: async (session) => {
            console.log('[AUTH DB] Session after hook - id:', session.id, 'token:', (session as Record<string, unknown>).token);
            // after hook must return void
          },
        },
        update: {
          before: async (session) => {
            const data: Record<string, unknown> = { ...session };
            if (data.expiresAt !== undefined) data.expiresAt = toMilliseconds(data.expiresAt);
            if (data.createdAt !== undefined) data.createdAt = toMilliseconds(data.createdAt);
            if (data.updatedAt !== undefined) data.updatedAt = toMilliseconds(data.updatedAt);
            return { data };
          },
        },
      },
      account: {
        create: {
          before: async (account) => {
            const data: Record<string, unknown> = {
              ...account,
              createdAt: toMilliseconds(account.createdAt),
              updatedAt: toMilliseconds(account.updatedAt),
            };
            // Convert accessTokenExpiresAt if present (maps to 'access_token_expires_at' DB column)
            const accRecord = account as Record<string, unknown>;
            if (accRecord.accessTokenExpiresAt !== undefined) {
              data.accessTokenExpiresAt = toMilliseconds(accRecord.accessTokenExpiresAt);
            }
            // Convert refreshTokenExpiresAt if present (maps to 'refresh_token_expires_at' DB column)
            if (accRecord.refreshTokenExpiresAt !== undefined) {
              data.refreshTokenExpiresAt = toMilliseconds(accRecord.refreshTokenExpiresAt);
            }
            return { data };
          },
        },
        update: {
          before: async (account) => {
            const data: Record<string, unknown> = { ...account };
            if (data.createdAt !== undefined) data.createdAt = toMilliseconds(data.createdAt);
            if (data.updatedAt !== undefined) data.updatedAt = toMilliseconds(data.updatedAt);
            if (data.accessTokenExpiresAt !== undefined) data.accessTokenExpiresAt = toMilliseconds(data.accessTokenExpiresAt);
            if (data.refreshTokenExpiresAt !== undefined) data.refreshTokenExpiresAt = toMilliseconds(data.refreshTokenExpiresAt);
            return { data };
          },
        },
      },
      verification: {
        create: {
          before: async (verification) => {
            return {
              data: {
                ...verification,
                expiresAt: toMilliseconds(verification.expiresAt),
                createdAt: toMilliseconds(verification.createdAt),
                updatedAt: toMilliseconds(verification.updatedAt),
              } as Record<string, unknown>,
            };
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
