import { t } from "@/worker/trpc/trpc-instance";
import { userRouter } from "@/worker/trpc/routers/user";
import { projectsRouter } from "@/worker/trpc/routers/projects";
import { marketResearchRouter } from "@/worker/trpc/routers/market-research";
import { linksTrpcRoutes } from "@/worker/trpc/routers/links";
import { generationsRouter } from "@/worker/trpc/routers/generations";

export const appRouter = t.router({
  user: userRouter,
  projects: projectsRouter,
  marketResearch: marketResearchRouter,
  links: linksTrpcRoutes,
  generations: generationsRouter,
});

export type AppRouter = typeof appRouter;
