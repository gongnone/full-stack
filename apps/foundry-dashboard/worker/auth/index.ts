import { betterAuth } from 'better-auth';
import { Kysely, KyselyPlugin, PluginTransformQueryArgs, PluginTransformResultArgs, QueryResult, RootOperationNode, UnknownRow } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Env } from '../index';

/**
 * Kysely plugin to convert Date objects to Unix timestamps for D1/SQLite
 * This intercepts ALL queries and transforms Date values before execution
 */
class DateToTimestampPlugin implements KyselyPlugin {
  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return this.transformNode(args.node) as RootOperationNode;
  }

  private transformNode(node: any): any {
    if (node === null || node === undefined) return node;

    // Handle Date objects - convert to Unix timestamp
    if (node instanceof Date) {
      return Math.floor(node.getTime() / 1000);
    }

    // Handle arrays
    if (Array.isArray(node)) {
      return node.map(item => this.transformNode(item));
    }

    // Handle objects (including Kysely nodes)
    if (typeof node === 'object') {
      const result: any = {};
      for (const key of Object.keys(node)) {
        result[key] = this.transformNode(node[key]);
      }
      return result;
    }

    return node;
  }

  async transformResult(args: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>> {
    return args.result;
  }
}

/**
 * Create Better Auth instance for Cloudflare Workers
 * Uses D1 as the database backend via Kysely
 */
export function createAuth(env: Env) {
  const db = new Kysely<any>({
    dialect: new D1Dialect({ database: env.DB }),
    plugins: [new DateToTimestampPlugin()],
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

    // Database hooks to convert Date objects to Unix timestamps for D1/SQLite
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            return {
              data: {
                ...user,
                createdAt: user.createdAt instanceof Date ? Math.floor(user.createdAt.getTime() / 1000) : user.createdAt,
                updatedAt: user.updatedAt instanceof Date ? Math.floor(user.updatedAt.getTime() / 1000) : user.updatedAt,
                emailVerified: user.emailVerified instanceof Date ? Math.floor(user.emailVerified.getTime() / 1000) : (user.emailVerified ? 1 : 0),
              },
            };
          },
        },
        update: {
          before: async (user) => {
            const data: any = { ...user };
            if (data.updatedAt instanceof Date) data.updatedAt = Math.floor(data.updatedAt.getTime() / 1000);
            if (data.createdAt instanceof Date) data.createdAt = Math.floor(data.createdAt.getTime() / 1000);
            if (data.emailVerified instanceof Date) data.emailVerified = Math.floor(data.emailVerified.getTime() / 1000);
            else if (typeof data.emailVerified === 'boolean') data.emailVerified = data.emailVerified ? 1 : 0;
            return { data };
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            return {
              data: {
                ...session,
                expiresAt: session.expiresAt instanceof Date ? Math.floor(session.expiresAt.getTime() / 1000) : session.expiresAt,
                createdAt: session.createdAt instanceof Date ? Math.floor(session.createdAt.getTime() / 1000) : session.createdAt,
                updatedAt: session.updatedAt instanceof Date ? Math.floor(session.updatedAt.getTime() / 1000) : session.updatedAt,
              },
            };
          },
        },
        update: {
          before: async (session) => {
            const data: any = { ...session };
            if (data.expiresAt instanceof Date) data.expiresAt = Math.floor(data.expiresAt.getTime() / 1000);
            if (data.createdAt instanceof Date) data.createdAt = Math.floor(data.createdAt.getTime() / 1000);
            if (data.updatedAt instanceof Date) data.updatedAt = Math.floor(data.updatedAt.getTime() / 1000);
            return { data };
          },
        },
      },
      account: {
        create: {
          before: async (account) => {
            return {
              data: {
                ...account,
                createdAt: account.createdAt instanceof Date ? Math.floor(account.createdAt.getTime() / 1000) : account.createdAt,
                updatedAt: account.updatedAt instanceof Date ? Math.floor(account.updatedAt.getTime() / 1000) : account.updatedAt,
                accessTokenExpiresAt: account.accessTokenExpiresAt instanceof Date ? Math.floor(account.accessTokenExpiresAt.getTime() / 1000) : account.accessTokenExpiresAt,
                refreshTokenExpiresAt: account.refreshTokenExpiresAt instanceof Date ? Math.floor(account.refreshTokenExpiresAt.getTime() / 1000) : account.refreshTokenExpiresAt,
              },
            };
          },
        },
        update: {
          before: async (account) => {
            const data: any = { ...account };
            if (data.createdAt instanceof Date) data.createdAt = Math.floor(data.createdAt.getTime() / 1000);
            if (data.updatedAt instanceof Date) data.updatedAt = Math.floor(data.updatedAt.getTime() / 1000);
            if (data.accessTokenExpiresAt instanceof Date) data.accessTokenExpiresAt = Math.floor(data.accessTokenExpiresAt.getTime() / 1000);
            if (data.refreshTokenExpiresAt instanceof Date) data.refreshTokenExpiresAt = Math.floor(data.refreshTokenExpiresAt.getTime() / 1000);
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
                expiresAt: verification.expiresAt instanceof Date ? Math.floor(verification.expiresAt.getTime() / 1000) : verification.expiresAt,
                createdAt: verification.createdAt instanceof Date ? Math.floor(verification.createdAt.getTime() / 1000) : verification.createdAt,
                updatedAt: verification.updatedAt instanceof Date ? Math.floor(verification.updatedAt.getTime() / 1000) : verification.updatedAt,
              },
            };
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
