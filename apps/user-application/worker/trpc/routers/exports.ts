import { t } from "@/worker/trpc/trpc-instance";
import { z } from 'zod';

const platformEnum = z.enum([
  'twitter',
  'linkedin',
  'tiktok',
  'instagram',
  'carousel',
  'thread',
  'newsletter',
]);

export const exportsRouter = t.router({
  // Create a content export
  create: t.procedure
    .input(z.object({
      clientId: z.string(),
      hubIds: z.array(z.string()).optional(),
      platforms: z.array(platformEnum).optional(),
      format: z.enum(['csv', 'json']),
      includeVisuals: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await (ctx as any).callAgent(input.clientId, 'createExport', {
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
  getDownloadUrl: t.procedure
    .input(z.object({
      clientId: z.string(),
      exportId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const result = await (ctx as any).callAgent(input.clientId, 'getExport', {
        exportId: input.exportId,
      });

      if (!result || result.status !== 'completed') {
        throw new Error('Export not ready or not found');
      }

      return {
        url: result.downloadUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };
    }),

  // List recent exports
  list: t.procedure
    .input(z.object({
      clientId: z.string(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const items = await (ctx as any).callAgent(input.clientId, 'listExports', {
        limit: input.limit,
      });

      return {
        items,
      };
    }),
});
