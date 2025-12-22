import { initDatabase } from "@repo/data-ops/database";

export async function createContext({
  req,
  env,
  workerCtx,
  userId,
  accountId,
  clientId // New: clientId
}: {
  req: Request;
  env: ServiceBindings;
  workerCtx: ExecutionContext;
  userId: string;
  accountId: string;
  clientId: string; // New: clientId type
}) {
  return {
    req,
    env,
    workerCtx,
    userId,
    accountId,
    clientId, // Include clientId in the context
    db: initDatabase(env.DB),
    callAgent: async <T = any>(clientId: string, method: string, params: any): Promise<T> => {
      // Use BACKEND_SERVICE binding which points to foundry-engine
      const response = await (env as any).BACKEND_SERVICE.fetch(
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

export type Context = Awaited<ReturnType<typeof createContext>>;
