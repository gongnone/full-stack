import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
    createProject,

    getProjects,
    getProject,

    getMarketResearchV2,
} from "@repo/data-ops/queries/market-research-v2";
import { workflowRuns, researchSources } from "@repo/data-ops/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const marketResearchRouter = t.router({
    createProject: t.procedure
        .input(
            z.object({
                name: z.string().min(1),
                topic: z.string().min(1),
                targetAudience: z.string().optional(),
                productDescription: z.string().optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            // 1. Create the Project Container (Status: Research)
            const projectId = await createProject(ctx.db, ctx.userId, input.name);
            const runId = nanoid();

            // 2. CALL THE WORKFLOW (via Data Service V2)
            try {
                // @ts-ignore
                await ctx.env.BACKEND_SERVICE.startHaloResearchV2(
                    projectId,
                    input.topic,
                    ctx.userId,
                    runId,
                    {
                        targetAudience: input.targetAudience,
                        productDescription: input.productDescription
                    }
                );
            } catch (error: any) {
                console.error("Failed to start research workflow via RPC:", error);
            }

            return { projectId, status: "processing" };
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
            return await getMarketResearchV2(ctx.db, input.projectId);
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
                .set({ isExcluded: input.isExcluded as any })
                .where(eq(researchSources.id, input.sourceId));
            return { success: true };
        }),
});
