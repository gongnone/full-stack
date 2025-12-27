import type { Env } from '../index';

export interface Context {
  env: Env;
  db: D1Database;
  userId: string;
  accountId: string;
  userRole: string;
  callAgent: <T = any>(clientId: string, method: string, params: any) => Promise<T>;
  [key: string]: unknown;
}

export interface CreateContextOptions {
  env: Env;
  userId: string;
  accountId: string;
  userRole: string;
}

export function createContext(opts: CreateContextOptions): Context {
  return {
    env: opts.env,
    db: opts.env.DB,
    userId: opts.userId,
    accountId: opts.accountId,
    userRole: opts.userRole,
    callAgent: async (clientId, method, params) => {
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
      return await response.json() as any;
    }
  };
}
