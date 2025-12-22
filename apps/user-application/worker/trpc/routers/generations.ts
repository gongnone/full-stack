import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { godfatherOffer, spokes, spoke_evaluations, feedback_log, workflowRuns, hub_registry, extracted_pillars, content_assets } from "@repo/data-ops/schema";
import { getGenerations } from "@repo/data-ops/queries/generations";
import { eq, desc, and, gt, lte, gte, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export const generationsRouter = t.router({
    getReviewBuckets: t.procedure
        .input(z.object({ clientId: z.string() }))
        .query(async ({ ctx, input }) => {
            const db = ctx.db;
            
            // 1. High Confidence: G7 > 9.0, status ready_for_review
            const highConfidence = await db.select({
                id: spokes.id,
                content: spokes.content,
                platform: spokes.platform,
                g7_score: spoke_evaluations.g7_score,
            })
            .from(spokes)
            .innerJoin(spoke_evaluations, eq(spokes.id, spoke_evaluations.spoke_id))
            .where(and(
                eq(spokes.client_id, input.clientId),
                eq(spokes.status, 'ready_for_review'),
                gt(spoke_evaluations.g7_score, 9.0)
            ))
            .all();

            // 2. Needs Review: G7 5.0-9.0, status ready_for_review
            const needsReview = await db.select({
                id: spokes.id,
                content: spokes.content,
                platform: spokes.platform,
                g7_score: spoke_evaluations.g7_score,
            })
            .from(spokes)
            .innerJoin(spoke_evaluations, eq(spokes.id, spoke_evaluations.spoke_id))
            .where(and(
                eq(spokes.client_id, input.clientId),
                eq(spokes.status, 'ready_for_review'),
                gte(spoke_evaluations.g7_score, 5.0),
                lte(spoke_evaluations.g7_score, 9.0)
            ))
            .all();

            // 3. Creative Conflicts: Failed 3x healing (status failed_qa)
            const conflicts = await db.select({
                id: spokes.id,
                content: spokes.content,
                platform: spokes.platform,
            })
            .from(spokes)
            .where(and(
                eq(spokes.client_id, input.clientId),
                eq(spokes.status, 'failed_qa')
            ))
            .all();

            // 4. Recently Generated: Any status, last 50 spokes
            const recent = await db.select({
                id: spokes.id,
                content: spokes.content,
                platform: spokes.platform,
                status: spokes.status,
                createdAt: spokes.created_at
            })
            .from(spokes)
            .where(eq(spokes.client_id, input.clientId))
            .orderBy(desc(spokes.created_at))
            .limit(50)
            .all();

            return {
                highConfidence,
                needsReview,
                conflicts,
                recent
            };
        }),

    getSprintItems: t.procedure
        .input(z.object({ 
            clientId: z.string(),
            bucket: z.enum(['high_confidence', 'needs_review', 'recent'])
        }))
        .query(async ({ ctx, input }) => {
            const db = ctx.db;
            let query = db.select({
                id: spokes.id,
                content: spokes.content,
                platform: spokes.platform,
                hubId: spokes.hub_id,
                pillarId: spokes.pillar_id,
                hookScore: spoke_evaluations.g2_score,
                predictionScore: spoke_evaluations.g7_score,
                criticNotes: spoke_evaluations.critic_notes,
                gates: {
                    g4Passed: eq(spoke_evaluations.g4_result, 'pass'),
                    g5Passed: eq(spoke_evaluations.g5_result, 'pass'),
                }
            })
            .from(spokes)
            .leftJoin(spoke_evaluations, eq(spokes.id, spoke_evaluations.spoke_id));

            const conditions = [eq(spokes.client_id, input.clientId)];

            if (input.bucket === 'high_confidence') {
                conditions.push(eq(spokes.status, 'ready_for_review'));
                conditions.push(gt(spoke_evaluations.g7_score, 9.0));
            } else if (input.bucket === 'needs_review') {
                conditions.push(eq(spokes.status, 'ready_for_review'));
                conditions.push(gte(spoke_evaluations.g7_score, 5.0));
                conditions.push(lte(spoke_evaluations.g7_score, 9.0));
            } else {
                // recent - no status/score filters
            }

            return await query
                .where(and(...conditions))
                .orderBy(desc(spokes.created_at))
                .limit(100)
                .all();
        }),

    bulkUpdateStatus: t.procedure
        .input(z.object({
            spokeIds: z.array(z.string()),
            status: z.string(),
            clientId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.spokeIds.length === 0) return { success: true, count: 0 };

            await ctx.db.update(spokes)
                .set({ status: input.status })
                .where(and(
                    eq(spokes.client_id, input.clientId),
                    inArray(spokes.id, input.spokeIds)
                ))
                .run();

            return { success: true, count: input.spokeIds.length };
        }),

    getHub: t.procedure
        .input(z.object({ hubId: z.string() }))
        .query(async ({ ctx, input }) => {
            const result = await ctx.db.select().from(hub_registry).where(eq(hub_registry.id, input.hubId)).get();
            return result || null;
        }),

    getHubPillars: t.procedure
        .input(z.object({ hubId: z.string() }))
        .query(async ({ ctx, input }) => {
            const results = await ctx.db.select().from(extracted_pillars).where(eq(extracted_pillars.hub_id, input.hubId)).all();
            return results;
        }),
    
    getCredits: t.procedure.query(async () => {
        // TODO: Implement actual credit tracking
        return {
            balance: 1000,
            used: 0,
        };
    }),

    getGodfatherOffer: t.procedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const offer = await ctx.db.select().from(godfatherOffer).where(eq(godfatherOffer.projectId, input.projectId)).get();
            return offer || null;
        }),

    startOfferWorkflow: t.procedure
        .input(z.object({ projectId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // FIX: Check for the Service Binding
            if (!ctx.env.BACKEND_SERVICE) {
                console.error("BACKEND_SERVICE binding is missing!");
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Backend Service disconnected" });
            }

            try {
                // @ts-ignore - Implicit type from Service Binding
                await ctx.env.BACKEND_SERVICE.startGodfatherOffer({ projectId: input.projectId });
                return { success: true };
            } catch (e: any) {
                console.error("Workflow trigger failed:", e);
                return { success: false, error: e.message };
            }
        }),
    getGenerations: t.procedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const results = await getGenerations(ctx.db, input.projectId);
            return results;
        }),

    getSpokes: t.procedure
        .input(z.object({ hubId: z.string() }))
        .query(async ({ ctx, input }) => {
            const results = await ctx.db.select().from(spokes).where(eq(spokes.hub_id, input.hubId)).all();
            return results;
        }),

    cloneSpoke: t.procedure
        .input(z.object({
            spokeId: z.string(),
            numVariations: z.number().min(1).max(5),
            platforms: z.array(z.string()),
            varyAngle: z.boolean(),
            hubId: z.string(), // For tracking progress against hub context
        }))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.env.BACKEND_SERVICE) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Backend Service disconnected" });
            }

            const runId = nanoid();

            // Create tracking record
            await ctx.db.insert(workflowRuns).values({
                id: runId,
                projectId: input.hubId,
                workflowType: 'spoke_cloning',
                status: 'running',
                current_step: 'Initializing variations...',
                progress: 0,
            }).run();

            try {
                // @ts-ignore
                await ctx.env.BACKEND_SERVICE.startCloneSpoke({
                    ...input,
                    runId
                });
                return { success: true, runId };
            } catch (e: any) {
                console.error("Clone trigger failed:", e);
                await ctx.db.update(workflowRuns).set({ status: 'failed', errorMessage: e.message }).where(eq(workflowRuns.id, runId)).run();
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: e.message });
            }
        }),
    
    evaluateSpoke: t.procedure
        .input(z.object({ spokeId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.env.BACKEND_SERVICE) {
                console.error("BACKEND_SERVICE binding is missing!");
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Backend Service disconnected" });
            }

            try {
                // @ts-ignore - Implicit type from Service Binding
                const evaluation = await ctx.env.BACKEND_SERVICE.evaluateSpoke(input.spokeId);
                return evaluation;
            } catch (e: any) {
                console.error("Evaluation failed:", e);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: e.message });
            }
        }),

    getSpokeEvaluation: t.procedure
        .input(z.object({ spokeId: z.string() }))
        .query(async ({ ctx, input }) => {
            const result = await ctx.db.select().from(spoke_evaluations).where(eq(spoke_evaluations.spoke_id, input.spokeId)).get();
            return result || null;
        }),

    getSpokeEvaluationsForHub: t.procedure
        .input(z.object({ hubId: z.string() }))
        .query(async ({ ctx, input }) => {
            const hubSpokes = await ctx.db.select({ id: spokes.id }).from(spokes).where(eq(spokes.hub_id, input.hubId)).all();
            const spokeIds = hubSpokes.map(s => s.id);
            if (spokeIds.length === 0) {
                return [];
            }
            const results = await ctx.db.select().from(spoke_evaluations).where(eq(spoke_evaluations.spoke_id, spokeIds[0])).all(); // Drizzle doesn't support `in` with sqlite drivers
            return results;
        }),

    getApprovedSpokesForExport: t.procedure
        .input(z.object({
            clientId: z.string(),
            platforms: z.array(z.string()).optional(),
            startDate: z.number().optional(),
            endDate: z.number().optional(),
            includeAssets: z.boolean().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const db = ctx.db;
            
            const conditions = [
                eq(spokes.client_id, input.clientId),
                eq(spokes.status, 'approved')
            ];

            if (input.platforms && input.platforms.length > 0) {
                conditions.push(inArray(spokes.platform, input.platforms));
            }

            if (input.startDate) {
                conditions.push(gte(spokes.created_at, input.startDate));
            }

            if (input.endDate) {
                conditions.push(lte(spokes.created_at, input.endDate));
            }

            const results = await db.select({
                id: spokes.id,
                content: spokes.content,
                platform: spokes.platform,
                createdAt: spokes.created_at,
                hubTitle: hub_registry.name,
                pillarTitle: extracted_pillars.name,
                hookScore: spoke_evaluations.g2_score,
                predictionScore: spoke_evaluations.g7_score,
                evaluations: {
                    g2_breakdown: spoke_evaluations.g2_breakdown,
                    g4_result: spoke_evaluations.g4_result,
                    g4_violations: spoke_evaluations.g4_violations,
                    g5_result: spoke_evaluations.g5_result,
                    g5_violations: spoke_evaluations.g5_violations,
                },
                assetId: content_assets.id,
                assetType: content_assets.asset_type,
                assetR2Key: content_assets.r2_key,
            })
            .from(spokes)
            .innerJoin(hub_registry, eq(spokes.hub_id, hub_registry.id))
            .innerJoin(extracted_pillars, eq(spokes.pillar_id, extracted_pillars.id))
            .leftJoin(spoke_evaluations, eq(spokes.id, spoke_evaluations.spoke_id))
            .leftJoin(content_assets, eq(spokes.id, content_assets.spoke_id))
            .where(and(...conditions))
            .orderBy(desc(spokes.created_at))
            .all();

            // Group by spoke ID to handle multiple assets
            const grouped: Record<string, any> = {};
            results.forEach(row => {
                if (!grouped[row.id]) {
                    grouped[row.id] = {
                        ...row,
                        assets: []
                    };
                    delete (grouped[row.id] as any).assetId;
                    delete (grouped[row.id] as any).assetType;
                    delete (grouped[row.id] as any).assetR2Key;
                }
                if (row.assetId) {
                    grouped[row.id].assets.push({
                        id: row.assetId,
                        type: row.assetType,
                        r2Key: row.assetR2Key
                    });
                }
            });

            return Object.values(grouped);
        }),

    getCreativeConflicts: t.procedure
        .query(async ({ ctx }) => {
            const results = await ctx.db.select().from(spokes).where(eq(spokes.status, 'failed_qa')).all();
            return results;
        }),

    updateSpokeStatus: t.procedure
        .input(z.object({
            spokeId: z.string(),
            status: z.enum(['ready_for_review', 'discarded', 'pending_manual_rewrite', 'killed']),
            note: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const spoke = await ctx.db.select({ client_id: spokes.client_id }).from(spokes).where(eq(spokes.id, input.spokeId)).get();

            await ctx.db.update(spokes)
                .set({
                    status: input.status,
                    manual_feedback_note: input.note
                })
                .where(eq(spokes.id, input.spokeId))
                .run();
            
            if (input.status === 'pending_manual_rewrite' && input.note) {
                // Also add to feedback_log
                await ctx.db.insert(feedback_log).values({
                    id: crypto.randomUUID(),
                    spoke_id: input.spokeId,
                    client_id: spoke?.client_id || 'unknown',
                    gate_type: 'human_feedback',
                    suggestions: input.note,
                }).run();
            }

            return { success: true };
        }),

    killHub: t.procedure
        .input(z.object({ hubId: z.string(), clientId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Mutation Rule: Edits survive the kill
            // Kill only non-mutated spokes
            const result = await ctx.db.update(spokes)
                .set({ status: 'killed' })
                .where(and(
                    eq(spokes.hub_id, input.hubId),
                    eq(spokes.client_id, input.clientId),
                    eq(spokes.is_mutated, 0)
                ))
                .run();
            
            // Mark Hub as archived
            await ctx.db.update(hub_registry)
                .set({ status: 'archived' })
                .where(eq(hub_registry.id, input.hubId))
                .run();

            return { success: true, count: result.meta.changes };
        }),

    undoKillHub: t.procedure
        .input(z.object({ hubId: z.string(), clientId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Restore spokes that were killed
            await ctx.db.update(spokes)
                .set({ status: 'ready_for_review' })
                .where(and(
                    eq(spokes.hub_id, input.hubId),
                    eq(spokes.client_id, input.clientId),
                    eq(spokes.status, 'killed')
                ))
                .run();
            
            // Restore Hub
            await ctx.db.update(hub_registry)
                .set({ status: 'ready' })
                .where(eq(hub_registry.id, input.hubId))
                .run();

            return { success: true };
        }),

    killPillar: t.procedure
        .input(z.object({ pillarId: z.string(), clientId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const result = await ctx.db.update(spokes)
                .set({ status: 'killed' })
                .where(and(
                    eq(spokes.pillar_id, input.pillarId),
                    eq(spokes.client_id, input.clientId),
                    eq(spokes.is_mutated, 0)
                ))
                .run();

            return { success: true, count: result.meta.changes };
        }),

    undoKillPillar: t.procedure
        .input(z.object({ pillarId: z.string(), clientId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.update(spokes)
                .set({ status: 'ready_for_review' })
                .where(and(
                    eq(spokes.pillar_id, input.pillarId),
                    eq(spokes.client_id, input.clientId),
                    eq(spokes.status, 'killed')
                ))
                .run();

            return { success: true };
        }),


    getSpokeFeedbackLog: t.procedure
        .input(z.object({ spokeId: z.string() }))
        .query(async ({ ctx, input }) => {
            const results = await ctx.db.select()
                .from(feedback_log)
                .where(eq(feedback_log.spoke_id, input.spokeId))
                .orderBy(desc(feedback_log.created_at))
                .all();
            return results;
        }),

    getWorkflowProgress: t.procedure
        .input(z.object({ hubId: z.string() }))
        .query(async ({ ctx, input }) => {
            const run = await ctx.db.select()
                .from(workflowRuns)
                .where(eq(workflowRuns.projectId, input.hubId))
                .orderBy(desc(workflowRuns.startedAt))
                .limit(1)
                .get();
            return run || null;
        }),

    generateSpokes: t.procedure
        .input(z.object({ hubId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (!ctx.env.BACKEND_SERVICE) {
                console.error("BACKEND_SERVICE binding is missing!");
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Backend Service disconnected" });
            }

            const runId = nanoid();
            
            // Create a tracking record for the workflow
            await ctx.db.insert(workflowRuns).values({
                id: runId,
                projectId: input.hubId, // Using hubId as projectId reference for tracking in this view
                workflowType: 'spoke_generation',
                status: 'running',
                current_step: 'Initializing...',
                progress: 0,
            }).run();

            try {
                // @ts-ignore - Implicit type from Service Binding
                await ctx.env.BACKEND_SERVICE.startSpokeGeneration(input.hubId, runId);
                return { success: true, runId };
            } catch (e: any) {
                console.error("Workflow trigger failed:", e);
                
                await ctx.db.update(workflowRuns)
                    .set({ status: 'failed', errorMessage: e.message })
                    .where(eq(workflowRuns.id, runId))
                    .run();

                return { success: false, error: e.message };
            }
        }),
});
