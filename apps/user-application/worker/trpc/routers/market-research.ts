import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import { createProject, saveMarketResearch, getProjects } from "@repo/data-ops/queries/market-research";

export const marketResearchRouter = t.router({
    createProject: t.procedure
        .input(z.object({
            name: z.string().min(1),
            topic: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            // 1. Create the Project Container
            const projectId = await createProject(ctx.userInfo.userId, input.name);

            // 2. SIMULATION: In a real app, we'd trigger a Cloudflare Workflow here.
            // For now, we just save some dummy "AI" data immediately to prove the flow.
            await saveMarketResearch({
                projectId,
                userId: ctx.userInfo.userId,
                topic: input.topic,
                rawAnalysis: "SIMULATED AI RESPONSE: This niche is highly profitable...",
                competitors: ["Competitor A", "Competitor B"],
                painPoints: ["Lack of time", "Compliance issues"],
                desires: ["Automated solution", "Peace of mind"],
            });

            return { projectId, status: "active" };
        }),

    getAll: t.procedure.query(async ({ ctx }) => {
        return await getProjects(ctx.userInfo.userId);
    }),
});
