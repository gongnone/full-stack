import { t } from "@/worker/trpc/trpc-instance";
import { userRouter } from "@/worker/trpc/routers/user";
import { projectsRouter } from "@/worker/trpc/routers/projects";
import { marketResearchRouter } from "@/worker/trpc/routers/market-research";
marketResearch: marketResearchRouter,
  generations: generationsRouter,
});

export type AppRouter = typeof appRouter;
