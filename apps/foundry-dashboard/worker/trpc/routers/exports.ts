import { initTRPC } from '@trpc/server';
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

export const exportsRouter = t.router({
  // Create a content export
  create: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      hubIds: z.array(z.string().uuid()).optional(),
      platforms: z.array(platformEnum).optional(),
      format: z.enum(['csv', 'json']),
      includeVisuals: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.callAgent(input.clientId, 'createExport', {
        format: input.format,
        hubIds: input.hubIds,
        platforms: input.platforms,
      });

      return {
        exportId: result.exportId,
        status: result.status,
      };
    }),

  // Get signed download URL for completed export
  getDownloadUrl: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      exportId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.callAgent(input.clientId, 'getExport', {
        exportId: input.exportId,
      });

      if (!result || result.status !== 'completed') {
        throw new Error('Export not ready or not found');
      }

      // Return the URL handled by foundry-engine
      // In a real production setup, you might generate a signed R2 URL here
      return {
        url: result.downloadUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour placeholder
      };
    }),

  // List recent exports
  list: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.callAgent(input.clientId, 'listExports', {
        limit: input.limit,
      });

      return {
        items,
      };
    }),
});
