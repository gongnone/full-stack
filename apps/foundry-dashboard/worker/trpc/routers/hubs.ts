import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import type { HubSource, ExtractionProgress, Pillar, Hub, HubListItem, HubWithPillars, PsychologicalAngle } from '../../types';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Psychological angle enum for validation
const psychologicalAngleSchema = z.enum([
  'Contrarian', 'Authority', 'Urgency', 'Aspiration',
  'Fear', 'Curiosity', 'Transformation', 'Rebellion'
]);

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

  // Register a PDF source after upload to R2
  registerPdfSource: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      sourceId: z.string().uuid(),
      r2Key: z.string(),
      filename: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const now = Date.now();
      await ctx.db.prepare(`
        INSERT INTO hub_sources (id, client_id, user_id, title, source_type, r2_key, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'pdf', ?, 'pending', ?, ?)
      `).bind(input.sourceId, input.clientId, ctx.userId, input.filename, input.r2Key, now, now).run();

      return { sourceId: input.sourceId, status: 'pending' as const };
    }),

  // Create a text source from pasted content
  createTextSource: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      title: z.string().min(1).max(255),
      content: z.string().min(100).max(100000),
    }))
    .mutation(async ({ ctx, input }) => {
      const sourceId = crypto.randomUUID();
      const now = Date.now();
      const wordCount = input.content.split(/\s+/).length;
      const charCount = input.content.length;

      await ctx.db.prepare(`
        INSERT INTO hub_sources (id, client_id, user_id, title, source_type, raw_content, word_count, character_count, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'text', ?, ?, ?, 'ready', ?, ?)
      `).bind(sourceId, input.clientId, ctx.userId, input.title, input.content, wordCount, charCount, now, now).run();

      return { sourceId, status: 'ready' as const, wordCount, characterCount: charCount };
    }),

  // Create a URL source
  createUrlSource: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      url: z.string().url(),
      title: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const sourceId = crypto.randomUUID();
      const now = Date.now();
      const title = input.title || new URL(input.url).hostname;

      await ctx.db.prepare(`
        INSERT INTO hub_sources (id, client_id, user_id, title, source_type, url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'url', ?, 'pending', ?, ?)
      `).bind(sourceId, input.clientId, ctx.userId, title, input.url, now, now).run();

      return { sourceId, status: 'pending' as const };
    }),

  // Get recent sources for a client
  getRecentSources: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.prepare(`
        SELECT id, title, source_type, status, word_count, character_count, created_at
        FROM hub_sources
        WHERE client_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `).bind(input.clientId, input.limit).all();

      return (result.results || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        title: row.title as string,
        sourceType: row.source_type as 'pdf' | 'text' | 'url',
        status: row.status as string,
        wordCount: row.word_count as number,
        characterCount: row.character_count as number,
        createdAt: row.created_at as number,
      }));
    }),

  // Start thematic extraction for a source
  extract: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
      content: z.string().min(100).optional(),
      platform: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get source content if not provided
      let content = input.content;
      if (!content) {
        const source = await ctx.db.prepare(`
          SELECT raw_content FROM hub_sources WHERE id = ? AND client_id = ?
        `).bind(input.sourceId, input.clientId).first();
        content = source?.raw_content as string;
      }

      if (!content) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No content available for extraction' });
      }

      // Proxy extraction to Durable Object for isolation
      return await ctx.callAgent(input.clientId, 'createHub', {
        id: input.sourceId,
        sourceContent: content,
        platform: input.platform || 'general',
        angle: 'Default',
        status: 'processing',
        pillars: [],
      });
    }),

  // Get extraction progress
  getExtractionProgress: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }): Promise<ExtractionProgress> => {
      const progress = await ctx.callAgent<ExtractionProgress | null>(
        input.clientId,
        'getExtractionProgress',
        { sourceId: input.sourceId }
      );

      return progress || {
        sourceId: input.sourceId,
        status: 'pending',
        currentStage: 'parsing',
        progress: 0,
        stageMessage: 'Waiting to start...',
      };
    }),

  // Retry failed extraction
  retryExtraction: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.callAgent<{ success: boolean; pillars?: Pillar[]; error?: string }>(
        input.clientId,
        'retryExtraction',
        { sourceId: input.sourceId }
      );
      return result;
    }),

  // Get extracted pillars for a source
  getPillars: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }): Promise<Pillar[]> => {
      const hub = await ctx.callAgent<{ pillars?: Pillar[] } | null>(input.clientId, 'getHub', { hubId: input.sourceId });
      if (!hub) return [];
      return hub.pillars || [];
    }),

  // ===== PILLAR MANAGEMENT (Story 3-3) =====

  // Update pillar details
  updatePillar: procedure
    .input(z.object({
      pillarId: z.string().uuid(),
      clientId: z.string().uuid(),
      title: z.string().min(1).max(255).optional(),
      coreClaim: z.string().min(1).max(1000).optional(),
      psychologicalAngle: psychologicalAngleSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { pillarId, clientId, ...updates } = input;
      return await ctx.callAgent(clientId, 'updatePillar', { pillarId, updates });
    }),

  // Delete a pillar (soft delete)
  deletePillar: procedure
    .input(z.object({
      pillarId: z.string().uuid(),
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.callAgent(input.clientId, 'deletePillar', {
        pillarId: input.pillarId,
        sourceId: input.sourceId,
      });
    }),

  // Restore a deleted pillar (undo)
  restorePillar: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
      pillar: z.object({
        id: z.string().uuid(),
        title: z.string(),
        coreClaim: z.string(),
        psychologicalAngle: psychologicalAngleSchema,
        estimatedSpokeCount: z.number(),
        supportingPoints: z.array(z.string()),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.callAgent(input.clientId, 'restorePillar', {
        sourceId: input.sourceId,
        pillar: input.pillar,
      });
    }),

  // ===== HUB FINALIZATION (Story 3-4) =====

  // Finalize hub creation
  finalize: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
      title: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.callAgent<{ hubId: string; title: string; pillarCount: number }>(
        input.clientId,
        'finalizeHub',
        { sourceId: input.sourceId, title: input.title }
      );

      return {
        hubId: result.hubId,
        title: result.title,
        pillarCount: result.pillarCount,
        redirectTo: `/app/hubs/${result.hubId}`,
      };
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