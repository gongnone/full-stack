import type { Env } from '../index';
import { initDatabase, type DrizzleD1Database } from '../db';
import * as schema from '../db/schema';

// Agent RPC configuration
const AGENT_RPC_TIMEOUT_MS = 30000;
const AGENT_RPC_MAX_RETRIES = 3;
const AGENT_RPC_BACKOFF_MS = [100, 200, 400] as const;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface Context {
  env: Env;
  db: D1Database;
  drizzle: DrizzleD1Database<typeof schema>;
  userId: string;
  accountId: string;
  userRole: string;
  callAgent: <T = unknown>(clientId: string, method: string, params: Record<string, unknown>) => Promise<T>;
  [key: string]: unknown;
}

export interface CreateContextOptions {
  env: Env;
  userId: string;
  accountId: string;
  userRole: string;
}

export function createContext(opts: CreateContextOptions): Context {
  const drizzle = initDatabase(opts.env.DB);
  
  return {
    env: opts.env,
    db: opts.env.DB,
    drizzle,
    userId: opts.userId,
    accountId: opts.accountId,
    userRole: opts.userRole,
    callAgent: async <T>(clientId: string, method: string, params: Record<string, unknown>): Promise<T> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < AGENT_RPC_MAX_RETRIES; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), AGENT_RPC_TIMEOUT_MS);

        try {
          const response = await opts.env.CONTENT_ENGINE.fetch(
            new Request(`http://internal/api/client/${clientId}/rpc`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ method, params }),
            }),
            { signal: controller.signal }
          );

          if (!response.ok) {
            // Don't retry 4xx errors (client errors)
            if (response.status >= 400 && response.status < 500) {
              throw new Error(`Agent RPC failed: ${response.statusText}`);
            }
            // Retry 5xx errors (server errors)
            lastError = new Error(`Agent RPC failed: ${response.statusText}`);
            if (attempt < AGENT_RPC_MAX_RETRIES - 1) {
              await sleep(AGENT_RPC_BACKOFF_MS[attempt] ?? 400);
            }
            continue;
          }

          return await response.json() as T;
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') {
            lastError = new Error(`Agent RPC timeout after ${AGENT_RPC_TIMEOUT_MS}ms`);
          } else if (e instanceof Error) {
            // Don't retry non-network errors (e.g., client errors we already threw)
            if (e.message.startsWith('Agent RPC failed:')) {
              throw e;
            }
            lastError = e;
          } else {
            lastError = new Error('Unknown agent RPC error');
          }

          if (attempt < AGENT_RPC_MAX_RETRIES - 1) {
            await sleep(AGENT_RPC_BACKOFF_MS[attempt] ?? 400);
          }
        } finally {
          clearTimeout(timeout);
        }
      }

      throw lastError ?? new Error('Agent RPC failed after retries');
    }
  };
}