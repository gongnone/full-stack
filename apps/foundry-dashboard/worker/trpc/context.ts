import type { Env } from '../index';
import { initDatabase, type DrizzleD1Database } from '../db';
import * as schema from '../db/schema';

// Agent RPC configuration
const AGENT_RPC_TIMEOUT_MS = 30000;
const AGENT_RPC_MAX_RETRIES = 3;
const AGENT_RPC_BACKOFF_MS: readonly number[] = [100, 200, 400];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Standalone helper to avoid recreation on every request
// Optimization: Moved out of createContext to module scope
async function fetchWithRetry(
  env: Env,
  url: string, 
  init?: RequestInit, 
  errorContext: string = 'Engine request'
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < AGENT_RPC_MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AGENT_RPC_TIMEOUT_MS);

    try {
      const response = await env.CONTENT_ENGINE.fetch(
        new Request(url, init),
        { signal: controller.signal }
      );

      if (!response.ok) {
        // Don't retry 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          // Return response to let caller handle 4xx
          clearTimeout(timeout);
          return response;
        }
        // Retry 5xx errors (server errors)
        lastError = new Error(`${errorContext} failed: ${response.statusText}`);
        if (attempt < AGENT_RPC_MAX_RETRIES - 1) {
          // Robust backoff: use Math.min to handle array bounds safely
          const backoff = AGENT_RPC_BACKOFF_MS[Math.min(attempt, AGENT_RPC_BACKOFF_MS.length - 1)] ?? 400;
          await sleep(backoff);
        }
        continue;
      }

      clearTimeout(timeout);
      return response;
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        lastError = new Error(`${errorContext} timeout after ${AGENT_RPC_TIMEOUT_MS}ms`);
      } else if (e instanceof Error) {
        lastError = e;
      } else {
        lastError = new Error(`Unknown ${errorContext.toLowerCase()} error`);
      }

      if (attempt < AGENT_RPC_MAX_RETRIES - 1) {
        // Robust backoff: use Math.min to handle array bounds safely
        const backoff = AGENT_RPC_BACKOFF_MS[Math.min(attempt, AGENT_RPC_BACKOFF_MS.length - 1)] ?? 400;
        await sleep(backoff);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error(`${errorContext} failed after retries`);
}

export interface Context {
  env: Env;
  db: D1Database;
  drizzle: DrizzleD1Database<typeof schema>;
  userId: string;
  accountId: string;
  userRole: string;
  callAgent: <T = unknown>(clientId: string, method: string, params: Record<string, unknown>) => Promise<T>;
  callEngine: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
  /** Optional request for audit logging - may be undefined in some contexts */
  request?: Request;
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
    callEngine: async <T>(path: string, options?: RequestInit): Promise<T> => {
      const url = path.startsWith('http') ? path : `http://internal${path.startsWith('/') ? '' : '/'}${path}`;
      const response = await fetchWithRetry(opts.env, url, options, 'Engine request');
      
      if (!response.ok) {
        throw new Error(`Engine request failed: ${response.statusText}`);
      }
      return await response.json() as T;
    },
    callAgent: async <T>(clientId: string, method: string, params: Record<string, unknown>): Promise<T> => {
      const url = `http://internal/api/client/${clientId}/rpc`;
      const response = await fetchWithRetry(opts.env, url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, params }),
      }, 'Agent RPC');

      if (!response.ok) {
        throw new Error(`Agent RPC failed: ${response.statusText}`);
      }
      return await response.json() as T;
    }
  };
}