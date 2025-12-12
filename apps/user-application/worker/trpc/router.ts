import { t } from "@/worker/trpc/trpc-instance";
import { userRouter } from "@/worker/trpc/routers/user";
import { projectsRouter } from "@/worker/trpc/routers/projects";

export const appRouter = t.router({
  user: userRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
