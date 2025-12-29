import type { Env } from '../index';
import { initDatabase, type DrizzleD1Database } from '../db';
import * as schema from '../db/schema';

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
      const response = await opts.env.CONTENT_ENGINE.fetch(
        new Request(`http://internal/api/client/${clientId}/rpc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method, params }),
        })
      );
      if (!response.ok) {
        throw new Error(`Agent RPC failed: ${response.statusText}`);
      }
      return await response.json() as T;
    }
  };
}