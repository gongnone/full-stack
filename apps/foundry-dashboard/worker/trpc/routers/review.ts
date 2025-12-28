import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

export const reviewRouter = t.router({
  // Get the bulk approval queue
  getQueue: procedure
    .input(z.object({
      clientId: z.string().min(1),
      filter: z.enum(['all', 'top10', 'flagged']).default('all'),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.callAgent(input.clientId, 'getReviewQueue', {
        filter: input.filter,
        limit: input.limit,
      });

      return {
        items,
        totalCount: items.length,
        estimatedReviewTime: `${Math.ceil(items.length * 6 / 60)} minutes`, // Based on 6 sec/decision promise
      };
    }),

  // Approve multiple spokes at once
  bulkApprove: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
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
