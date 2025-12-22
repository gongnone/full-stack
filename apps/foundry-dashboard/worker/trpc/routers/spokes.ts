import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

const platformEnum = z.enum([
  'twitter',
  'linkedin',
  'tiktok',
  'instagram',
  'carousel',
  'thread',
  'youtube_thumbnail',
]);

const spokeStatusEnum = z.enum([
  'pending',
  'approved',
  'rejected',
  'killed',
]);

export const spokesRouter = t.router({
  // List spokes with filtering
  list: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      hubId: z.string().uuid().optional(),
      pillarId: z.string().uuid().optional(),
      platform: platformEnum.optional(),
      status: spokeStatusEnum.optional(),
      g7Min: z.number().min(0).max(100).optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Proxy to Durable Object
      return await ctx.callAgent(input.clientId, 'listSpokes', {
        hubId: input.hubId,
        status: input.status,
        limit: input.limit,
      });
    }),

  // Get a single spoke with quality scores and feedback
  get: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      spokeId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.callAgent(input.clientId, 'getSpoke', {
        spokeId: input.spokeId,
      });
    }),

  // Approve a single spoke
  approve: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      spokeId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.callAgent(input.clientId, 'approveSpoke', {
        spokeId: input.spokeId,
      });
    }),

  // Reject a spoke
  reject: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      spokeId: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.callAgent(input.clientId, 'rejectSpoke', {
        spokeId: input.spokeId,
        reason: input.reason,
      });
    }),

  // Trigger generation for a hub (Story 4.1)
  generate: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      hubId: z.string().uuid(),
      platforms: z.array(platformEnum).default(['twitter', 'linkedin']),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.env.CONTENT_ENGINE.fetch(
        new Request('http://internal/api/spokes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: input.clientId,
            hubId: input.hubId,
            platforms: input.platforms,
          }),
        })
      );

      if (!response.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start generation workflow',
        });
      }

      return await response.json() as { instanceId: string, status: string };
    }),

  // Edit spoke content (marks as mutated for Kill Chain survival)
  edit: procedure
    .input(z.object({
      spokeId: z.string().uuid(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Update content, set is_mutated = 1
      // TODO: Create entry in mutation_registry

      return {
        success: true,
        editDistance: 0.15, // Levenshtein ratio
      };
    }),

  // Clone a high-performing spoke to generate variations
  clone: procedure
    .input(z.object({
      spokeId: z.string().uuid(),
      count: z.number().min(1).max(10).default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Trigger variation generation via CONTENT_ENGINE

      return {
        newSpokeIds: [] as string[],
        status: 'processing' as const,
      };
    }),
});
