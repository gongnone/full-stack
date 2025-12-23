import { betterAuth } from 'better-auth';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Env } from '../index';

/**
 * Create Better Auth instance for Cloudflare Workers
 * Uses D1 as the database backend via Kysely
 */
export function createAuth(env: Env) {
  const db = new Kysely<any>({
    dialect: new D1Dialect({ database: env.DB }),
  });

  return betterAuth({
    database: {
      db,
      type: 'sqlite',
    },

    // Email + Password authentication
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: env.ENVIRONMENT === 'production',
      minPasswordLength: 12,
      maxPasswordLength: 128,
      // Password must contain: uppercase, lowercase, number, special char
      async sendVerificationEmail(user: any, url: string) {
        // TODO: Implement email sending in Epic 1.2
        console.log('Verification email:', user.email, url);
      },
    },

    // Session configuration - map to snake_case DB columns
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
      fields: {
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        userId: 'user_id',
      },
    },

    // Account configuration - map to snake_case DB columns
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github'],
      },
      fields: {
        accountId: 'account_id',
        providerId: 'provider_id',
        userId: 'user_id',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        idToken: 'id_token',
        accessTokenExpiresAt: 'access_token_expires_at',
        refreshTokenExpiresAt: 'refresh_token_expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },

    // Verification configuration - map to snake_case DB columns
    verification: {
      fields: {
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },

    // User configuration with custom fields - map to snake_case DB columns
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
    },

    // Security settings
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL || 'http://localhost:8787',

    // Trust the host header in production
    trustedOrigins: [
      'http://localhost:5173',
      'http://localhost:8787',
      'https://stage.williamjshaw.ca',
      'https://foundry.williamjshaw.ca',
    ],

    // Advanced security configuration
    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
      },
      cookiePrefix: 'foundry',
      useSecureCookies: env.ENVIRONMENT === 'production',
      crossSubDomainCookies: {
        enabled: false,
      },
      defaultCookieAttributes: {
        sameSite: 'lax',
        secure: env.ENVIRONMENT === 'production',
        httpOnly: true,
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
