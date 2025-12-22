import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import type { HubSource, ExtractionProgress, Pillar, Hub, HubListItem, HubWithPillars } from '../../types';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

export const hubsRouter = t.router({
  // ===== SOURCE MANAGEMENT (Story 3-1) =====

  // Get upload URL for source PDF
  getSourceUploadUrl: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      filename: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      const sourceId = crypto.randomUUID();
      const timestamp = Date.now();
      const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const r2Key = `sources/${input.clientId}/${sourceId}/${timestamp}-${sanitizedFilename}`;

      return {
        sourceId,
        r2Key,
        uploadEndpoint: `/api/upload/${encodeURIComponent(r2Key)}`,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }),

  // Start thematic extraction for a source
  extract: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
      content: z.string().min(100),
      platform: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Proxy extraction to Durable Object for isolation
      return await ctx.callAgent(input.clientId, 'createHub', {
        id: input.sourceId,
        sourceContent: input.content,
        platform: input.platform,
        angle: 'Default',
        status: 'processing',
        pillars: [],
      });
    }),

  // Get extracted pillars for a source
  getPillars: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const hub = await ctx.callAgent(input.clientId, 'getHub', { hubId: input.sourceId });
      if (!hub) return [];
      return hub.pillars || [];
    }),

  // ===== HUB MANAGEMENT (Story 3.4) =====

  // List all Hubs for a client
  list: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      status: z.enum(['processing', 'ready', 'killed']).optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.callAgent(input.clientId, 'listHubs', {
        status: input.status,
        limit: input.limit,
      });

      return {
        items,
        nextCursor: undefined,
      };
    }),

  // Get a single Hub with pillars
  get: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const hub = await ctx.callAgent(input.clientId, 'getHub', { hubId: input.hubId });
      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }
      return hub;
    }),

  // Archive a Hub (soft delete)
  archive: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.callAgent(input.clientId, 'killHub', {
        hubId: input.hubId,
        reason: 'Archived by user',
      });
    }),
});