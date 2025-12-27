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
  // Create a content export (Story 6.1, 6.2, 6.3, 6.4)
  create: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      hubIds: z.array(z.string().uuid()).optional(),
      platforms: z.array(platformEnum).optional(),
      format: z.enum(['csv', 'json']),
      includeVisuals: z.boolean().default(false),
      includeScheduling: z.boolean().default(true), // Story 6.3
      groupByPlatform: z.boolean().default(false), // Story 6.2
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.callAgent(input.clientId, 'createExport', {
        format: input.format,
        hubIds: input.hubIds,
        platforms: input.platforms,
        includeVisuals: input.includeVisuals,
        includeScheduling: input.includeScheduling,
        groupByPlatform: input.groupByPlatform,
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

  // Copy spoke content to clipboard (Story 6.5)
  copyToClipboard: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      spokeIds: z.array(z.string().uuid()),
      format: z.enum(['plain', 'markdown', 'json']).default('plain'),
    }))
    .mutation(async ({ ctx, input }) => {
      const spokes = await ctx.callAgent(input.clientId, 'getSpokes', {
        spokeIds: input.spokeIds,
      });

      let content = '';
      if (input.format === 'json') {
        content = JSON.stringify(spokes, null, 2);
      } else if (input.format === 'markdown') {
        content = spokes.map((s: any) =>
          `## ${s.platform.toUpperCase()} - ${s.pillarId || 'General'}\n\n${s.content}\n\n---\n`
        ).join('\n');
      } else {
        content = spokes.map((s: any) => s.content).join('\n\n---\n\n');
      }

      return {
        content,
        count: spokes.length,
      };
    }),

  // Get export metadata (Story 6.3 - scheduling info)
  getExportMetadata: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      exportId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.callAgent(input.clientId, 'getExport', {
        exportId: input.exportId,
      });

      return {
        exportId: input.exportId,
        createdAt: result.createdAt,
        status: result.status,
        format: result.format,
        spokeCount: result.spokeCount,
        platforms: result.platforms || [],
        includesScheduling: result.includesScheduling || false,
        includesMedia: result.includesMedia || false,
      };
    }),
});
