import { t } from "@/worker/trpc/trpc-instance";
import { userRouter } from "@/worker/trpc/routers/user";
import { projectsRouter } from "@/worker/trpc/routers/projects";
import { marketResearchRouter } from "@/worker/trpc/routers/market-research";
import { generationsRouter } from "@/worker/trpc/routers/generations";
import { authRouter } from "@/worker/trpc/routers/auth";
import { hubsRouter } from "@/worker/trpc/routers/hubs";
import { spokesRouter } from "@/worker/trpc/routers/spokes";
import { clientsRouter } from "@/worker/trpc/routers/clients"; // Import clientsRouter
import { analyticsRouter } from "@/worker/trpc/routers/analytics";
import { exportsRouter } from "@/worker/trpc/routers/exports";

export const appRouter = t.router({
    user: userRouter,
    projects: projectsRouter,
    marketResearch: marketResearchRouter,
    generations: generationsRouter,
    auth: authRouter,
    hubs: hubsRouter,
    spokes: spokesRouter,
    clients: clientsRouter, // Add clientsRouter to the appRouter
    analytics: analyticsRouter,
    exports: exportsRouter,
});
export type AppRouter = typeof appRouter;

