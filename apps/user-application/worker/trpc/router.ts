import { t } from "@/worker/trpc/trpc-instance";
import { linksTrpcRoutes } from "@/worker/trpc/routers/links";
import { marketResearchRouter } from "@/worker/trpc/routers/market-research";
import { userRouter } from "@/worker/trpc/routers/user";
import { generationsRouter } from "@/worker/trpc/routers/generations";
import { campaignsRouter } from "@/worker/trpc/routers/campaigns";

export const appRouter = t.router({
  links: linksTrpcRoutes,
  marketResearch: marketResearchRouter,
  user: userRouter,
  generations: generationsRouter,
  campaigns: campaignsRouter,
});

export type AppRouter = typeof appRouter;
