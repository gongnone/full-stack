import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
    createProject,
    saveMarketResearch,
    getProjects,
    getProject,
    getMarketResearch,
} from "@repo/data-ops/queries/market-research";

export const marketResearchRouter = t.router({
    createProject: t.procedure
        .input(
            z.object({
                name: z.string().min(1),
                topic: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // 1. Create the Project Container
            const projectId = await createProject(ctx.db, ctx.userId, input.name);

            // 2. Save initial market research data
            // TODO: In production, trigger a Cloudflare Workflow here instead
            // For now, create a placeholder that can be updated by the workflow
            await saveMarketResearch(ctx.db, {
                projectId,
                userId: ctx.userId,
                topic: input.topic,
                rawAnalysis: "", // Will be populated by workflow
                competitors: [],
                painPoints: [],
                desires: [],
            });

            // TODO: Trigger workflow like this:
            // await ctx.env.RESEARCH_WORKFLOW.create({ id: projectId, params: { topic: input.topic } });

            return { projectId, status: "active" };
        }),

    getAll: t.procedure.query(async ({ ctx }) => {
        return await getProjects(ctx.db, ctx.userId);
    }),

    getProject: t.procedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ input, ctx }) => {
            return await getProject(ctx.db, input.projectId);
        }),

    getResearch: t.procedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ input, ctx }) => {
            return await getMarketResearch(ctx.db, input.projectId);
        }),
});
