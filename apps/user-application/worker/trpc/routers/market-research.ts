import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
    createProject,
    saveMarketResearch,
    getProjects,
    getProject,

    getMarketResearch,
} from "@repo/data-ops/queries/market-research";
import { workflowRuns, researchSources } from "@repo/data-ops/schema";
import { eq, desc } from "drizzle-orm";

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

    getWorkflowProgress: t.procedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const run = await ctx.db.select()
                .from(workflowRuns)
                .where(eq(workflowRuns.projectId, input.projectId))
                .orderBy(desc(workflowRuns.startedAt))
                .limit(1)
                .get();
            return run;
        }),

    getSources: t.procedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.select()
                .from(researchSources)
                .where(eq(researchSources.projectId, input.projectId))
                .orderBy(desc(researchSources.sophisticationScore))
                .limit(50);
        }),

    excludeSource: t.procedure
        .input(z.object({ sourceId: z.string(), isExcluded: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.update(researchSources)
                .set({ isExcluded: input.isExcluded })
                .where(eq(researchSources.id, input.sourceId));
            return { success: true };
        }),
});
