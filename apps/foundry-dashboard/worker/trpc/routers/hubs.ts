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
      clientId: z.string().min(1),
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
      clientId: z.string().min(1),
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
      clientId: z.string().min(1),
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
      clientId: z.string().min(1),
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
      clientId: z.string().min(1),
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
      clientId: z.string().min(1),
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

      // Initialize extraction progress in D1
      const now = Date.now();
      await ctx.db.prepare(`
        INSERT OR REPLACE INTO extraction_progress (source_id, client_id, status, current_stage, progress, stage_message, updated_at)
        VALUES (?, ?, 'processing', 'parsing', 0, 'Starting extraction...', ?)
      `).bind(input.sourceId, input.clientId, now).run();

      // Trigger the HubIngestionWorkflow via CONTENT_ENGINE service binding
      const response = await ctx.env.CONTENT_ENGINE.fetch(
        new Request('http://internal/api/hubs/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: input.clientId,
            hubId: input.sourceId,
            sourceContent: content,
            platform: input.platform || 'general',
            angle: 'Default',
          }),
        })
      );

      if (!response.ok) {
        const error = await response.text();
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Extraction failed: ${error}` });
      }

      const result = await response.json() as { instanceId: string; status: string };
      return {
        sourceId: input.sourceId,
        status: 'processing',
        workflowInstanceId: result.instanceId,
      };
    }),

  // Get extraction progress from D1
  getExtractionProgress: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }): Promise<ExtractionProgress> => {
      // Read progress from D1 extraction_progress table
      const progress = await ctx.db.prepare(`
        SELECT source_id, status, current_stage, progress, stage_message, error_message
        FROM extraction_progress
        WHERE source_id = ? AND client_id = ?
      `).bind(input.sourceId, input.clientId).first();

      if (progress) {
        return {
          sourceId: progress.source_id as string,
          status: progress.status as 'pending' | 'processing' | 'completed' | 'failed',
          currentStage: progress.current_stage as 'parsing' | 'themes' | 'claims' | 'pillars',
          progress: progress.progress as number,
          stageMessage: (progress.stage_message as string) || 'Processing...',
          error: progress.error_message as string | undefined,
        };
      }

      return {
        sourceId: input.sourceId,
        status: 'pending' as const,
        currentStage: 'parsing' as const,
        progress: 0,
        stageMessage: 'Waiting to start...',
      };
    }),

  // Retry failed extraction
  retryExtraction: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get source content
      const source = await ctx.db.prepare(`
        SELECT raw_content FROM hub_sources WHERE id = ? AND client_id = ?
      `).bind(input.sourceId, input.clientId).first();

      if (!source?.raw_content) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No content available for extraction' });
      }

      // Reset extraction progress
      const now = Date.now();
      await ctx.db.prepare(`
        INSERT OR REPLACE INTO extraction_progress (source_id, client_id, status, current_stage, progress, stage_message, error_message, updated_at)
        VALUES (?, ?, 'processing', 'parsing', 0, 'Retrying extraction...', NULL, ?)
      `).bind(input.sourceId, input.clientId, now).run();

      // Delete old pillars for this source
      await ctx.db.prepare(`
        DELETE FROM extracted_pillars WHERE source_id = ? AND client_id = ?
      `).bind(input.sourceId, input.clientId).run();

      // Re-trigger workflow
      const response = await ctx.env.CONTENT_ENGINE.fetch(
        new Request('http://internal/api/hubs/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: input.clientId,
            hubId: input.sourceId,
            sourceContent: source.raw_content as string,
            platform: 'general',
            angle: 'Default',
          }),
        })
      );

      if (!response.ok) {
        const error = await response.text();
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Retry failed: ${error}` });
      }

      return { success: true };
    }),

  // Get extracted pillars for a source from D1
  getPillars: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }): Promise<Pillar[]> => {
      const result = await ctx.db.prepare(`
        SELECT id, title, core_claim, psychological_angle, estimated_spoke_count, supporting_points
        FROM extracted_pillars
        WHERE source_id = ? AND client_id = ?
        ORDER BY created_at ASC
      `).bind(input.sourceId, input.clientId).all();

      return (result.results || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        title: row.title as string,
        coreClaim: row.core_claim as string,
        psychologicalAngle: row.psychological_angle as PsychologicalAngle,
        estimatedSpokeCount: row.estimated_spoke_count as number,
        supportingPoints: JSON.parse((row.supporting_points as string) || '[]'),
      }));
    }),

  // ===== PILLAR MANAGEMENT (Story 3-3) =====

  // Update pillar details in D1
  updatePillar: procedure
    .input(z.object({
      pillarId: z.string().uuid(),
      clientId: z.string().min(1),
      title: z.string().min(1).max(255).optional(),
      coreClaim: z.string().min(1).max(1000).optional(),
      psychologicalAngle: psychologicalAngleSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { pillarId, clientId, title, coreClaim, psychologicalAngle } = input;

      // Build dynamic UPDATE query
      const updates: string[] = [];
      const values: (string | number)[] = [];

      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      if (coreClaim !== undefined) {
        updates.push('core_claim = ?');
        values.push(coreClaim);
      }
      if (psychologicalAngle !== undefined) {
        updates.push('psychological_angle = ?');
        values.push(psychologicalAngle);
      }

      if (updates.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No updates provided' });
      }

      values.push(pillarId, clientId);
      await ctx.db.prepare(`
        UPDATE extracted_pillars SET ${updates.join(', ')} WHERE id = ? AND client_id = ?
      `).bind(...values).run();

      return { success: true, pillarId };
    }),

  // Delete a pillar from D1
  deletePillar: procedure
    .input(z.object({
      pillarId: z.string().uuid(),
      sourceId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // First get the pillar for undo capability
      const pillar = await ctx.db.prepare(`
        SELECT id, title, core_claim, psychological_angle, estimated_spoke_count, supporting_points
        FROM extracted_pillars WHERE id = ? AND client_id = ?
      `).bind(input.pillarId, input.clientId).first();

      if (!pillar) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pillar not found' });
      }

      // Delete from D1
      await ctx.db.prepare(`
        DELETE FROM extracted_pillars WHERE id = ? AND client_id = ?
      `).bind(input.pillarId, input.clientId).run();

      // Return deleted pillar for undo
      return {
        success: true,
        deletedPillar: {
          id: pillar.id as string,
          title: pillar.title as string,
          coreClaim: pillar.core_claim as string,
          psychologicalAngle: pillar.psychological_angle as PsychologicalAngle,
          estimatedSpokeCount: pillar.estimated_spoke_count as number,
          supportingPoints: JSON.parse((pillar.supporting_points as string) || '[]'),
        },
      };
    }),

  // Restore a deleted pillar (undo) to D1
  restorePillar: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().min(1),
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
      const { sourceId, clientId, pillar } = input;

      await ctx.db.prepare(`
        INSERT INTO extracted_pillars (id, source_id, client_id, title, core_claim, psychological_angle, estimated_spoke_count, supporting_points)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        pillar.id,
        sourceId,
        clientId,
        pillar.title,
        pillar.coreClaim,
        pillar.psychologicalAngle,
        pillar.estimatedSpokeCount,
        JSON.stringify(pillar.supportingPoints)
      ).run();

      return { success: true, pillarId: pillar.id };
    }),

  // ===== HUB FINALIZATION (Story 3-4) =====

  // Finalize hub creation in D1
  finalize: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().min(1),
      title: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get source info for hub creation
      const source = await ctx.db.prepare(`
        SELECT title, source_type FROM hub_sources WHERE id = ? AND client_id = ?
      `).bind(input.sourceId, input.clientId).first();

      if (!source) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Source not found' });
      }

      // Get pillar count
      const pillarCount = await ctx.db.prepare(`
        SELECT COUNT(*) as count FROM extracted_pillars WHERE source_id = ? AND client_id = ?
      `).bind(input.sourceId, input.clientId).first();

      const hubId = crypto.randomUUID();
      const hubTitle = input.title || (source.title as string);
      const now = Date.now();

      // Create hub in D1
      await ctx.db.prepare(`
        INSERT INTO hubs (id, client_id, user_id, source_id, title, source_type, pillar_count, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ready', ?, ?)
      `).bind(
        hubId,
        input.clientId,
        ctx.userId,
        input.sourceId,
        hubTitle,
        source.source_type as string,
        (pillarCount?.count as number) || 0,
        now,
        now
      ).run();

      // Link pillars to hub
      await ctx.db.prepare(`
        UPDATE extracted_pillars SET hub_id = ? WHERE source_id = ? AND client_id = ?
      `).bind(hubId, input.sourceId, input.clientId).run();

      // Update source status to 'ready' (hub is finalized)
      await ctx.db.prepare(`
        UPDATE hub_sources SET status = 'ready', updated_at = ? WHERE id = ?
      `).bind(now, input.sourceId).run();

      return {
        hubId,
        title: hubTitle,
        pillarCount: (pillarCount?.count as number) || 0,
        redirectTo: `/app/hubs/${hubId}`,
      };
    }),

  // ===== HUB MANAGEMENT (Story 3.4) =====

  // List all Hubs for a client from D1
  list: procedure
    .input(z.object({
      clientId: z.string().min(1),
      status: z.enum(['processing', 'ready', 'archived']).optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      let query = `
        SELECT id, title, source_type, pillar_count, spoke_count, status, created_at, updated_at
        FROM hubs
        WHERE client_id = ?
      `;
      const params: (string | number)[] = [input.clientId];

      if (input.status) {
        query += ` AND status = ?`;
        params.push(input.status);
      }

      query += ` ORDER BY created_at DESC LIMIT ?`;
      params.push(input.limit);

      const result = await ctx.db.prepare(query).bind(...params).all();

      const items = (result.results || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        title: row.title as string,
        sourceType: row.source_type as 'pdf' | 'text' | 'url',
        pillarCount: row.pillar_count as number,
        spokeCount: row.spoke_count as number,
        status: row.status as 'processing' | 'ready' | 'archived',
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      }));

      return {
        items,
        nextCursor: undefined,
      };
    }),

  // Get a single Hub with pillars from D1
  get: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }): Promise<HubWithPillars> => {
      const hub = await ctx.db.prepare(`
        SELECT id, source_id, title, source_type, pillar_count, spoke_count, status, created_at, updated_at
        FROM hubs WHERE id = ? AND client_id = ?
      `).bind(input.hubId, input.clientId).first();

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      // Get pillars for this hub
      const pillarsResult = await ctx.db.prepare(`
        SELECT id, title, core_claim, psychological_angle, estimated_spoke_count, supporting_points
        FROM extracted_pillars WHERE hub_id = ? AND client_id = ?
        ORDER BY created_at ASC
      `).bind(input.hubId, input.clientId).all();

      const pillars: Pillar[] = (pillarsResult.results || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        title: row.title as string,
        coreClaim: row.core_claim as string,
        psychologicalAngle: row.psychological_angle as PsychologicalAngle,
        estimatedSpokeCount: row.estimated_spoke_count as number,
        supportingPoints: JSON.parse((row.supporting_points as string) || '[]'),
      }));

      return {
        id: hub.id as string,
        client_id: input.clientId,
        user_id: '', // Not needed for frontend, but required by type
        source_id: hub.source_id as string,
        title: hub.title as string,
        source_type: hub.source_type as 'pdf' | 'text' | 'url',
        pillar_count: hub.pillar_count as number,
        spoke_count: hub.spoke_count as number,
        status: hub.status as 'processing' | 'ready' | 'archived',
        created_at: hub.created_at as number,
        updated_at: hub.updated_at as number,
        pillars,
      };
    }),

  // Archive a Hub (soft delete) in D1
  archive: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const now = Date.now();
      await ctx.db.prepare(`
        UPDATE hubs SET status = 'archived', updated_at = ? WHERE id = ? AND client_id = ?
      `).bind(now, input.hubId, input.clientId).run();

      return { success: true, hubId: input.hubId };
    }),
});