import { z } from "zod";
import { t } from "@/worker/trpc/trpc-instance";
import { projects, researchSources, haloAnalysis, competitors, godfatherOffer } from "@repo/data-ops/schema";
import { eq, desc, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const projectsRouter = t.router({
    list: t.procedure.query(async ({ ctx }) => {
        return ctx.db.select().from(projects).orderBy(desc(projects.updatedAt));
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
        }))
        .mutation(async ({ ctx, input }) => {
            // 1. Update Project Data
            await ctx.db.update(projects)
                .set({
                    // Store keywords in valueProposition temporarily or structured field if exists
                    // For now, let's just update timestamp
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
                const params = {
                    projectId: input.projectId,
                    keywords: input.keywords.split(',').map(k => k.trim())
                };
                console.log("Triggering workflow via RPC with params:", JSON.stringify(params));

                // Use RPC call to Data Service
                if (!ctx.env.BACKEND_SERVICE) {
                    throw new Error("BACKEND_SERVICE binding is missing");
                }

                // @ts-ignore - Implicit type from Service Binding
                await ctx.env.BACKEND_SERVICE.startHaloResearch(params);

                return { success: true, workflowId: input.projectId };
            } catch (e: any) {
                console.error("Workflow trigger failed:", e.message, e.stack);
                // Return error as value to debug the 500
                return {
                    success: false,
                    error: "Workflow failed: " + e.message,
                    details: e.stack
                };
            }
        }),

    getDashboardStatus: t.procedure
        .input(z.object({ projectId: z.string() }))
        .output(z.object({
            project: z.any(),
            phases: z.object({
                research: z.object({ status: z.string(), meta: z.string() }),
                competitors: z.object({ status: z.string(), meta: z.string() }),
                offer: z.object({ status: z.string(), meta: z.string() })
            })
        }))
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
