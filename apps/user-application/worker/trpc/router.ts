import { t } from "@/worker/trpc/trpc-instance";
import { linksTrpcRoutes } from "@/worker/trpc/routers/links";
import { marketResearchRouter } from "@/worker/trpc/routers/market-research";
import { userRouter } from "@/worker/trpc/routers/user";
import { generationsRouter } from "@/worker/trpc/routers/generations";

export const appRouter = t.router({
  links: linksTrpcRoutes,
  marketResearch: marketResearchRouter,
  user: userRouter,
  generations: generationsRouter,
});

export type AppRouter = typeof appRouter;
