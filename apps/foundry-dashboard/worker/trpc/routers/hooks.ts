/**
 * Epic 12-2: Hook Database tRPC Router
 *
 * Provides API endpoints for:
 * - Finding similar hooks for G7 scoring
 * - Adding hooks (approved content, seeding)
 * - Getting database statistics
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { HookDatabaseService } from '../../lib/hook-database';
import type { HookPlatform, HookCategory } from '../../types';
import { SEED_HOOKS, SEED_STATS, type SeedHook } from '../../../src/lib/hook-seed-data';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Validation schemas
const hookPlatformSchema = z.enum([
  'twitter',
  'linkedin',
  'instagram',
  'tiktok',
  'newsletter',
  'thread',
  'carousel',
]);

const hookCategorySchema = z.enum([
  'business',
  'tech',
  'finance',
  'health',
  'lifestyle',
  'marketing',
  'creative',
  'education',
]);

const performanceTierSchema = z.enum(['viral', 'high', 'curated', 'community']);

const psychologicalAngleSchema = z.enum([
  'Contrarian',
  'Authority',
  'Urgency',
  'Aspiration',
  'Fear',
  'Curiosity',
  'Transformation',
  'Rebellion',
]);

export const hooksRouter = t.router({
  /**
   * Find similar hooks for a piece of content
   * Used for G7 engagement prediction
   */
  findSimilar: procedure
    .input(
      z.object({
        content: z.string().min(10).max(5000),
        platform: hookPlatformSchema.optional(),
        category: hookCategorySchema.optional(),
        topK: z.number().min(1).max(20).default(10),
        minScore: z.number().min(0).max(1).default(0.5),
        clientId: z.string().optional(), // For logging
      })
    )
    .query(async ({ input, ctx }) => {
      const service = new HookDatabaseService(ctx.env.DB, ctx.env.EMBEDDINGS, ctx.env.AI);

      const result = await service.findSimilar(input.content, {
        platform: input.platform as HookPlatform | undefined,
        category: input.category as HookCategory | undefined,
        topK: input.topK,
        minScore: input.minScore,
      });

      // Log the search if clientId provided
      if (input.clientId) {
        await service.logSimilaritySearch(
          input.clientId,
          input.content,
          input.platform as HookPlatform | undefined,
          result
        );
      }

      return result;
    }),

  /**
   * Get G7 similarity score for content
   * Returns a 0-1 score based on similarity to top performers
   */
  getG7Score: procedure
    .input(
      z.object({
        content: z.string().min(10).max(5000),
        platform: hookPlatformSchema,
        clientId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const service = new HookDatabaseService(ctx.env.DB, ctx.env.EMBEDDINGS, ctx.env.AI);

      const result = await service.getG7SimilarityScore(
        input.content,
        input.platform as HookPlatform
      );

      return {
        score: result.score,
        scoreOutOf10: Math.round(result.score * 10 * 10) / 10, // 0-10 scale, 1 decimal
        confidence: result.confidence,
        matchCount: result.matchCount,
        topMatch: result.topMatch
          ? {
              content: result.topMatch.content,
              similarity: result.topMatch.similarity,
              performanceTier: result.topMatch.performanceTier,
            }
          : null,
      };
    }),

  /**
   * Add a hook to the database (admin/seeding)
   */
  addHook: procedure
    .input(
      z.object({
        content: z.string().min(10).max(2000),
        platform: hookPlatformSchema,
        category: hookCategorySchema,
        engagementRate: z.number().min(0).max(1).optional(),
        performanceTier: performanceTierSchema.default('curated'),
        source: z.enum(['external', 'user_approved', 'generated']).default('external'),
        sourceUrl: z.string().url().optional(),
        psychologicalAngle: psychologicalAngleSchema.optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only allow authenticated users (could add admin check later)
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const service = new HookDatabaseService(ctx.env.DB, ctx.env.EMBEDDINGS, ctx.env.AI);

      const hook = await service.addHook({
        content: input.content,
        platform: input.platform as HookPlatform,
        category: input.category as HookCategory,
        engagementRate: input.engagementRate,
        performanceTier: input.performanceTier as 'viral' | 'high' | 'curated' | 'community',
        source: input.source as 'external' | 'user_approved' | 'generated',
        sourceUrl: input.sourceUrl,
        psychologicalAngle: input.psychologicalAngle as
          | 'Contrarian'
          | 'Authority'
          | 'Urgency'
          | 'Aspiration'
          | 'Fear'
          | 'Curiosity'
          | 'Transformation'
          | 'Rebellion'
          | undefined,
      });

      return {
        success: true,
        hookId: hook.id,
        vectorizeId: hook.vectorizeId,
      };
    }),

  /**
   * Batch add hooks (for seeding)
   */
  addHooksBatch: procedure
    .input(
      z.object({
        hooks: z.array(
          z.object({
            content: z.string().min(10).max(2000),
            platform: hookPlatformSchema,
            category: hookCategorySchema,
            engagementRate: z.number().min(0).max(1).optional(),
            performanceTier: performanceTierSchema.default('curated'),
            psychologicalAngle: psychologicalAngleSchema.optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const service = new HookDatabaseService(ctx.env.DB, ctx.env.EMBEDDINGS, ctx.env.AI);

      const result = await service.addHooksBatch(
        input.hooks.map((h) => ({
          content: h.content,
          platform: h.platform as HookPlatform,
          category: h.category as HookCategory,
          engagementRate: h.engagementRate,
          performanceTier: h.performanceTier as 'viral' | 'high' | 'curated' | 'community',
          source: 'external' as const,
          psychologicalAngle: h.psychologicalAngle as
            | 'Contrarian'
            | 'Authority'
            | 'Urgency'
            | 'Aspiration'
            | 'Fear'
            | 'Curiosity'
            | 'Transformation'
            | 'Rebellion'
            | undefined,
        }))
      );

      return result;
    }),

  /**
   * Get hook database statistics
   */
  getStats: procedure.query(async ({ ctx }) => {
    const service = new HookDatabaseService(ctx.env.DB, ctx.env.EMBEDDINGS, ctx.env.AI);
    return await service.getStats();
  }),

  /**
   * Get categories with hook counts
   */
  getCategories: procedure.query(async ({ ctx }) => {
    const result = await ctx.env.DB.prepare(
      `SELECT id, name, display_name, description, hook_count
       FROM hook_categories
       ORDER BY hook_count DESC`
    ).all<{
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      hook_count: number;
    }>();

    return (result.results || []).map((row) => ({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      hookCount: row.hook_count,
    }));
  }),

  /**
   * Promote a user-approved spoke to the hook database
   * This is how the system learns from user approvals
   */
  promoteToHookDatabase: procedure
    .input(
      z.object({
        spokeId: z.string(),
        clientId: z.string(),
        category: hookCategorySchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      // Get the spoke content
      const spoke = await ctx.env.DB.prepare(
        `SELECT id, content, platform FROM spokes WHERE id = ? AND client_id = ?`
      )
        .bind(input.spokeId, input.clientId)
        .first<{ id: string; content: string; platform: string }>();

      if (!spoke) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Spoke not found',
        });
      }

      // Add to hook database as user-approved
      const service = new HookDatabaseService(ctx.env.DB, ctx.env.EMBEDDINGS, ctx.env.AI);

      // Map spoke platform to hook platform
      const platformMap: Record<string, HookPlatform> = {
        twitter: 'twitter',
        linkedin: 'linkedin',
        instagram: 'instagram',
        tiktok: 'tiktok',
        newsletter: 'newsletter',
        thread: 'thread',
        carousel: 'carousel',
        youtube_thumbnail: 'carousel', // Map to closest
      };

      const hook = await service.addHook({
        content: spoke.content,
        platform: platformMap[spoke.platform] || 'twitter',
        category: input.category as HookCategory,
        performanceTier: 'community', // User-approved starts as community
        source: 'user_approved',
      });

      return {
        success: true,
        hookId: hook.id,
        message: 'Content added to hook database for learning',
      };
    }),

  /**
   * Seed the hook database with curated high-performing hooks
   * This populates the initial training data for G7
   */
  seedDatabase: procedure
    .input(
      z.object({
        batchSize: z.number().min(1).max(50).default(10),
        skipExisting: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const service = new HookDatabaseService(ctx.env.DB, ctx.env.EMBEDDINGS, ctx.env.AI);

      // Check current count
      const stats = await service.getStats();
      if (stats.totalHooks > 0 && input.skipExisting) {
        return {
          success: true,
          message: `Database already seeded with ${stats.totalHooks} hooks. Set skipExisting=false to add more.`,
          added: 0,
          failed: 0,
          existing: stats.totalHooks,
        };
      }

      // Convert seed hooks to the expected format
      const hooksToAdd = SEED_HOOKS.map((h: SeedHook) => ({
        content: h.content,
        platform: h.platform as HookPlatform,
        category: h.category as HookCategory,
        performanceTier: h.performanceTier,
        source: 'external' as const,
        psychologicalAngle: h.psychologicalAngle as
          | 'Contrarian'
          | 'Authority'
          | 'Urgency'
          | 'Aspiration'
          | 'Fear'
          | 'Curiosity'
          | 'Transformation'
          | 'Rebellion'
          | undefined,
      }));

      // Add in batches
      const result = await service.addHooksBatch(hooksToAdd);

      return {
        success: true,
        message: `Seeded ${result.added} hooks`,
        added: result.added,
        failed: result.failed,
        seedStats: SEED_STATS,
      };
    }),

  /**
   * Get seed data info without inserting
   */
  getSeedInfo: procedure.query(() => {
    return {
      totalHooks: SEED_HOOKS.length,
      stats: SEED_STATS,
      sample: SEED_HOOKS.slice(0, 5).map((h: SeedHook) => ({
        id: h.id,
        content: h.content.substring(0, 60) + (h.content.length > 60 ? '...' : ''),
        platform: h.platform,
        tier: h.performanceTier,
      })),
    };
  }),
});
