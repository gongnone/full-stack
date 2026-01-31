import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';

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

interface ExportResult {
  exportId: string;
  status: string;
  downloadUrl?: string;
  createdAt?: string;
  format?: string;
  spokeCount?: number;
  platforms?: string[];
  includesScheduling?: boolean;
  includesMedia?: boolean;
}

export const exportsRouter = t.router({
  // Create a content export (Story 6.1, 6.2, 6.3, 6.4)
  create: procedure
    .input(z.object({
      clientId: z.string().min(1),
      hubIds: z.array(z.string().uuid()).optional(),
      platforms: z.array(platformEnum).optional(),
      format: z.enum(['csv', 'json']),
      includeVisuals: z.boolean().default(false),
      includeScheduling: z.boolean().default(true), // Story 6.3
      groupByPlatform: z.boolean().default(false), // Story 6.2
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const result = await ctx.callAgent(input.clientId, 'createExport', {
        format: input.format,
        hubIds: input.hubIds,
        platforms: input.platforms,
        includeVisuals: input.includeVisuals,
        includeScheduling: input.includeScheduling,
        groupByPlatform: input.groupByPlatform,
      }) as ExportResult;

      return {
        exportId: result.exportId,
        status: result.status,
      };
    }),

  // Get signed download URL for completed export
  getDownloadUrl: procedure
    .input(z.object({
      clientId: z.string().min(1),
      exportId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const result = await ctx.callAgent(input.clientId, 'getExport', {
        exportId: input.exportId,
      }) as ExportResult;

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
      clientId: z.string().min(1),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const items = await ctx.callAgent(input.clientId, 'listExports', {
        limit: input.limit,
      }) as ExportResult[];

      return {
        items,
      };
    }),

  // Copy spoke content to clipboard (Story 6.5)
  copyToClipboard: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeIds: z.array(z.string().uuid()),
      format: z.enum(['plain', 'markdown', 'json']).default('plain'),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      interface SpokeContent {
        platform: string;
        pillarId?: string;
        content: string;
      }
      const spokes = await ctx.callAgent(input.clientId, 'getSpokes', {
        spokeIds: input.spokeIds,
      }) as SpokeContent[];

      let content = '';
      if (input.format === 'json') {
        content = JSON.stringify(spokes, null, 2);
      } else if (input.format === 'markdown') {
        content = spokes.map((s) =>
          `## ${s.platform.toUpperCase()} - ${s.pillarId || 'General'}\n\n${s.content}\n\n---\n`
        ).join('\n');
      } else {
        content = spokes.map((s) => s.content).join('\n\n---\n\n');
      }

      return {
        content,
        count: spokes.length,
      };
    }),

  // Story 13-4: Buffer CSV format export
  exportBufferCsv: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeIds: z.array(z.string()).optional(),
      hubIds: z.array(z.string()).optional(),
      platforms: z.array(platformEnum).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get approved spokes
      const spokes = await ctx.callAgent(input.clientId, 'getApprovedSpokes', {
        spokeIds: input.spokeIds,
        hubIds: input.hubIds,
        platforms: input.platforms,
      }) as Array<{
        id: string;
        content: string;
        platform: string;
        scheduledFor?: string;
        pillarTitle?: string;
        visualPrompt?: string;
      }>;

      // Buffer CSV format: Text, Media URL, Scheduled Date, Scheduled Time, Profile
      const BUFFER_PROFILE_MAP: Record<string, string> = {
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        facebook: 'Facebook',
      };

      const header = 'Text,Media URL,Scheduled Date,Scheduled Time,Profile';
      const rows = spokes.map(spoke => {
        const scheduledDate = spoke.scheduledFor
          ? new Date(spoke.scheduledFor).toISOString().split('T')[0]
          : '';
        const scheduledTime = spoke.scheduledFor
          ? new Date(spoke.scheduledFor).toISOString().split('T')[1]?.slice(0, 5)
          : '';
        const profile = BUFFER_PROFILE_MAP[spoke.platform] || spoke.platform;
        const text = spoke.content.replace(/"/g, '""'); // Escape quotes
        return `"${text}","","${scheduledDate}","${scheduledTime}","${profile}"`;
      });

      return {
        csv: [header, ...rows].join('\n'),
        count: spokes.length,
        format: 'buffer',
      };
    }),

  // Story 13-5: Hootsuite CSV format export
  exportHootsuiteCsv: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeIds: z.array(z.string()).optional(),
      hubIds: z.array(z.string()).optional(),
      platforms: z.array(platformEnum).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const spokes = await ctx.callAgent(input.clientId, 'getApprovedSpokes', {
        spokeIds: input.spokeIds,
        hubIds: input.hubIds,
        platforms: input.platforms,
      }) as Array<{
        id: string;
        content: string;
        platform: string;
        scheduledFor?: string;
        pillarTitle?: string;
      }>;

      // Hootsuite CSV format: Date, Time, Message, Media URLs
      const header = 'Date,Time,Message,Media URLs';
      const rows = spokes.map(spoke => {
        const scheduledDate = spoke.scheduledFor
          ? new Date(spoke.scheduledFor).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
          : '';
        const scheduledTime = spoke.scheduledFor
          ? new Date(spoke.scheduledFor).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          : '';
        const message = spoke.content.replace(/"/g, '""');
        return `"${scheduledDate}","${scheduledTime}","${message}",""`;
      });

      return {
        csv: [header, ...rows].join('\n'),
        count: spokes.length,
        format: 'hootsuite',
      };
    }),

  // Get export metadata (Story 6.3 - scheduling info)
  getExportMetadata: procedure
    .input(z.object({
      clientId: z.string().min(1),
      exportId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const result = await ctx.callAgent(input.clientId, 'getExport', {
        exportId: input.exportId,
      }) as ExportResult;

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
