import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';
import type { SpokePlatform, SpokeStatus } from '../../types';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

/**
 * Review queue spoke representation from Durable Object
 * Uses camelCase for consistency with frontend
 */
interface ReviewQueueSpoke {
  id: string;
  hubId: string;
  pillarId: string;
  platform: SpokePlatform;
  content: string;
  status: SpokeStatus;
  qualityScores: {
    g2_hook?: number;
    g4_voice?: boolean;
    g5_platform?: boolean;
    g7_engagement?: number;
  };
  parentSpokeId?: string | null;
  clonedFrom?: string | null;
  createdAt: string;
}

export const reviewRouter = t.router({
  // Get the bulk approval queue
  getQueue: procedure
    .input(z.object({
      clientId: z.string().min(1),
      filter: z.enum(['all', 'top10', 'flagged', 'needs-review']).default('all'),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().optional(), // offset-based pagination
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const items = await ctx.callAgent(input.clientId, 'getReviewQueue', {
        filter: input.filter,
        limit: input.limit + 1, // Fetch one extra to determine next cursor
        offset: input.cursor,
      }) as any[]; // Type as any first to handle mapping

      let nextCursor: number | undefined = undefined;
      if (items.length > input.limit) {
        items.pop(); // Remove the extra item
        nextCursor = (input.cursor || 0) + input.limit;
      }

      // Map snake_case from DO to consistent camelCase
      const mappedItems: ReviewQueueSpoke[] = items.map(item => ({
        ...item,
        parentSpokeId: item.parentSpokeId || item.parent_spoke_id,
        clonedFrom: item.clonedFrom || item.cloned_from,
      }));

      return {
        items: mappedItems,
        nextCursor,
        totalCount: items.length, // Approximation for current page
        estimatedReviewTime: `${Math.ceil(items.length * 6 / 60)} minutes`,
      };
    }),

  // Approve multiple spokes at once
  bulkApprove: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return await ctx.callAgent(input.clientId, 'bulkApprove', {
        spokeIds: input.spokeIds,
      });
    }),

  // Reject multiple spokes
  bulkReject: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeIds: z.array(z.string().uuid()),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return await ctx.callAgent(input.clientId, 'bulkReject', {
        spokeIds: input.spokeIds,
        reason: input.reason,
      });
    }),

  // Kill entire Hub from review queue (cascade)
  killHub: procedure
    .input(z.object({
      clientId: z.string().min(1),
      hubId: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return await ctx.callAgent(input.clientId, 'killHub', {
        hubId: input.hubId,
        reason: input.reason,
      });
    }),

  // Single swipe action (optimized for mobile)
  swipeAction: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      action: z.enum(['approve', 'reject', 'skip']),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      if (input.action === 'approve') {
        await ctx.callAgent(input.clientId, 'approveSpoke', { spokeId: input.spokeId });
      } else if (input.action === 'reject') {
        await ctx.callAgent(input.clientId, 'rejectSpoke', { spokeId: input.spokeId });
      }

      return {
        success: true,
      };
    }),
});
