import { initDatabase } from "@repo/data-ops/database";

export async function createContext({
  req,
  env,
  workerCtx,
  userId
}: {
  req: Request;
  env: ServiceBindings;
  workerCtx: ExecutionContext;
  userId: string
}) {
  return {
    req,
    env,
    workerCtx,
    userId,
    db: initDatabase(env.DB),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
