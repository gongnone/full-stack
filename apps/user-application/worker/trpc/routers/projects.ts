import { z } from "zod";
import { t } from "@/worker/trpc/trpc-instance";
import {
    projects,
    researchSources,
    haloAnalysis,
    competitors,
    godfatherOffer,
    dreamBuyerAvatar,
    workflowRuns,
    vectorMetadata,
    hvcoTitles,
    competitorOfferMap,
    goldenPheasantUploads
} from "@repo/data-ops/schema";
import { eq, desc, count, inArray, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const projectsRouter = t.router({
    delete: t.procedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.transaction(async (tx) => {
                const projectId = input.id;

                // 1. Delete Dependencies first (Leaves of the tree)
                // Vector Metadata
                await tx.delete(vectorMetadata).where(eq(vectorMetadata.projectId, projectId));

                // Workflow Runs
                await tx.delete(workflowRuns).where(eq(workflowRuns.projectId, projectId));

                // HVCO Titles
                await tx.delete(hvcoTitles).where(eq(hvcoTitles.projectId, projectId));

                // Godfather Offer
                await tx.delete(godfatherOffer).where(eq(godfatherOffer.projectId, projectId));

                // Competitor Related (Sub-dependencies)
                const projectCompetitors = await tx.select({ id: competitors.id }).from(competitors).where(eq(competitors.projectId, projectId));
                const competitorIds = projectCompetitors.map(c => c.id);

                if (competitorIds.length > 0) {
                    await tx.delete(competitorOfferMap).where(inArray(competitorOfferMap.competitorId, competitorIds));
                    await tx.delete(goldenPheasantUploads).where(inArray(goldenPheasantUploads.competitorId, competitorIds));
                    await tx.delete(competitors).where(eq(competitors.projectId, projectId));
                }

                // Dream Buyer Avatar
                await tx.delete(dreamBuyerAvatar).where(eq(dreamBuyerAvatar.projectId, projectId));

                // Halo Analysis
                await tx.delete(haloAnalysis).where(eq(haloAnalysis.projectId, projectId));

                // Research Sources
                await tx.delete(researchSources).where(eq(researchSources.projectId, projectId));

                // 2. Finally, delete the Project
                await tx.delete(projects).where(eq(projects.id, projectId));
            });

            return { success: true };
        }),
    update: t.procedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            industry: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const updateData: any = { updatedAt: new Date() };
            if (input.name) updateData.name = input.name;
            if (input.industry !== undefined) updateData.industry = input.industry;

            await ctx.db.update(projects)
                .set(updateData)
                .where(eq(projects.id, input.id));

            return { success: true };
        }),

    list: t.procedure
        .input(z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.number().nullish(), // Unix timestamp of updatedAt
            search: z.string().nullish(),
        }).optional())
        .query(async ({ ctx, input }) => {
            const limit = input?.limit ?? 20;
            const cursor = input?.cursor;
            const search = input?.search;

            const conditions = [];

            if (search) {
                // simple case-insensitive like search
                // SQLite's LIKE is case-insensitive by default for ASCII
                conditions.push(sql`lower(${projects.name}) LIKE lower(${'%' + search + '%'})`);
            }

            if (cursor) {
                conditions.push(sql`${projects.updatedAt} < ${cursor}`);
            }

            const whereClause = conditions.length > 0
                ? conditions.reduce((acc, condition) => and(acc, condition)!)
                : undefined;

            const items = await ctx.db.select()
                .from(projects)
                .where(whereClause)
                .orderBy(desc(projects.updatedAt))
                .limit(limit + 1);

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                // Ensure nextCursor is a number (unix timestamp)
                const nextDate = nextItem!.updatedAt;
                nextCursor = nextDate instanceof Date ? Math.floor(nextDate.getTime() / 1000) : (nextDate as unknown as number);
            }

            return {
                items,
                nextCursor,
            };
        }),

    getById: t.procedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const result = await ctx.db
                .select()
                .from(projects)
                .where(eq(projects.id, input.id))
                .get();

            if (!result) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
            }
            return result;
        }),

    create: t.procedure
        .input(z.object({
            name: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            const id = crypto.randomUUID();
            // Default to 'research' status and placeholders
            await ctx.db.insert(projects).values({
                id,
                accountId: ctx.userId || 'demo-account', // Fallback for quick dev
                name: input.name,
                industry: '', // To be filled in research step
                status: 'research',
            });
            return { id };
        }),

    startResearch: t.procedure
        .input(z.object({
            projectId: z.string(),
            keywords: z.string(),
            industry: z.string().optional(),
            targetAudience: z.string().optional(),
            productDescription: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // 1. Update Project Data
            await ctx.db.update(projects)
                .set({
                    industry: input.industry || undefined,
                    targetMarket: input.targetAudience || undefined,       // Map V2 Target Audience
                    valueProposition: input.productDescription || undefined, // Map V2 Product Context
                    updatedAt: new Date(),
                })
                .where(eq(projects.id, input.projectId));

            // 2. Trigger Workflow
            console.log("Starting research for project", input.projectId);

            // FIX: Check for the Service Binding, not the Workflow Binding
            if (!ctx.env.BACKEND_SERVICE) {
                console.error("BACKEND_SERVICE binding is missing!");
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Backend Service disconnected" });
            }

            try {
                // Create Workflow Run Record
                const runId = crypto.randomUUID();
                await ctx.db.insert(workflowRuns).values({
                    id: runId,
                    projectId: input.projectId,
                    workflowType: 'competitor_recon',
                    status: 'running',
                    current_step: 'Discovery',
                    progress: 0,
                }).run();

                const params = {
                    projectId: input.projectId,
                    runId, // Pass runId to workflow
                    keywords: input.keywords.split(',').map(k => k.trim()),
                    industry: input.industry,
                    targetAudience: input.targetAudience,
                    productDescription: input.productDescription
                };
                console.log("Triggering workflow via RPC with params:", JSON.stringify(params));

                // Use RPC call to Data Service
                // @ts-ignore - Implicit type from Service Binding
                await ctx.env.BACKEND_SERVICE.startHaloResearchV2(
                    input.projectId,
                    input.keywords,
                    ctx.userId || 'system',
                    runId, // Gap 2 Fix: Pass runId
                    {
                        targetAudience: input.targetAudience,
                        productDescription: input.productDescription
                    }
                );

                return { success: true, workflowId: input.projectId };
            } catch (e: any) {
                console.error("Workflow trigger failed:", e.message, e.stack);
                return {
                    success: false,
                    error: "Workflow failed: " + e.message,
                    details: e.stack
                };
            }
        }),

    getDashboardStatus: t.procedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const db = ctx.db;

            // Parallel fetch for speed
            const [project, sourceCount, analysis, competitorCount, offer] = await Promise.all([
                db.select().from(projects).where(eq(projects.id, input.projectId)).get(),
                db.select({ count: count() }).from(researchSources).where(eq(researchSources.projectId, input.projectId)).get(),
                db.select().from(haloAnalysis).where(eq(haloAnalysis.projectId, input.projectId)).get(),
                db.select({ count: count() }).from(competitors).where(eq(competitors.projectId, input.projectId)).get(),
                db.select().from(godfatherOffer).where(eq(godfatherOffer.projectId, input.projectId)).get(),
            ]);

            if (!project) throw new TRPCError({ code: "NOT_FOUND" });

            // Logic to determine phase status
            const hasResearch = (sourceCount?.count || 0) > 0;
            const hasHalo = !!analysis;
            const hasCompetitors = (competitorCount?.count || 0) > 0;
            const hasOffer = !!offer;

            return {
                project,
                phases: {
                    research: {
                        status: hasHalo ? 'completed' : hasResearch ? 'in_progress' : 'pending',
                        meta: `${sourceCount?.count || 0} Sources`
                    },
                    competitors: {
                        status: hasCompetitors ? 'completed' : hasHalo ? 'pending' : 'locked',
                        meta: `${competitorCount?.count || 0} Tracked`
                    },
                    offer: {
                        status: hasOffer ? 'completed' : hasCompetitors ? 'pending' : 'locked',
                        meta: hasOffer ? 'Draft Ready' : 'Not Started'
                    }
                }
            };
        }),
});
