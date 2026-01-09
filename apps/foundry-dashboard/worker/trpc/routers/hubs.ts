import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import type { ExtractionProgress, Pillar, HubWithPillars, PsychologicalAngle } from '../../types';
import { assertClientAccess } from '../middleware/client-access';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Psychological angle enum for validation
const psychologicalAngleSchema = z.enum([
  'Contrarian', 'Authority', 'Urgency', 'Aspiration',
  'Fear', 'Curiosity', 'Transformation', 'Rebellion'
]);

export const hubsRouter = t.router({
  // ===== SOURCE MANAGEMENT (Story 3-1) =====

  // Get upload URL for source file (Story 1.5-4-1)
  getSourceUploadUrl: procedure
    .input(z.object({
      clientId: z.string().min(1),
      filename: z.string().min(1).max(255),
      fileType: z.enum(['pdf', 'docx', 'txt', 'mp3', 'mp4']),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const sourceId = crypto.randomUUID();
      const ext = input.filename.split('.').pop()?.toLowerCase() || '';

      // AC2: Store in R2: /hubs/{client_id}/{hub_id}/source.*
      const r2Key = `hubs/${input.clientId}/${sourceId}/source.${ext}`;

      return {
        sourceId,
        r2Key,
        uploadEndpoint: `/api/upload/${encodeURIComponent(r2Key)}`,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }),

  // Register a source file after upload to R2 (Story 1.5-4-1)
  registerSource: procedure
    .input(z.object({
      clientId: z.string().min(1),
      sourceId: z.string().uuid(),
      r2Key: z.string(),
      filename: z.string(),
      sourceType: z.enum(['pdf', 'docx', 'txt', 'mp3', 'mp4']),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const now = Date.now();
      
      await ctx.db.prepare(`
        INSERT INTO hub_sources (id, client_id, user_id, title, source_type, r2_key, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `).bind(
        input.sourceId, 
        input.clientId, 
        ctx.userId, 
        input.filename, 
        input.sourceType, 
        input.r2Key, 
        now, 
        now
      ).run();

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
      await assertClientAccess(ctx, input.clientId);
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
      await assertClientAccess(ctx, input.clientId);
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
      await assertClientAccess(ctx, input.clientId);
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
      await assertClientAccess(ctx, input.clientId);
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
      try {
        const result = await ctx.callEngine<{ instanceId: string; status: string }>('http://internal/api/hubs/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: input.clientId,
            hubId: input.sourceId,
            sourceContent: content,
            platform: input.platform || 'general',
            angle: 'Default',
          }),
        });

        return {
          sourceId: input.sourceId,
          status: 'processing',
          workflowInstanceId: result.instanceId,
        };
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
      }
    }),

  // Get extraction progress from D1
  getExtractionProgress: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }): Promise<ExtractionProgress> => {
      await assertClientAccess(ctx, input.clientId);
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

  // Get extracted themes for a hub/source (Story 1.5-4-3)
  getExtractedThemes: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      
      const source = await ctx.db.prepare(`
        SELECT extracted_themes FROM hub_sources 
        WHERE id = ? AND client_id = ?
      `).bind(input.sourceId, input.clientId).first();

      if (!source?.extracted_themes) {
        return [];
      }

      try {
        return JSON.parse(source.extracted_themes as string);
      } catch (e) {
        console.error('Failed to parse extracted_themes:', e);
        return [];
      }
    }),

  // Retry failed extraction
  retryExtraction: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
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
      try {
        await ctx.callEngine('http://internal/api/hubs/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: input.clientId,
            hubId: input.sourceId,
            sourceContent: source.raw_content as string,
            platform: 'general',
            angle: 'Default',
          }),
        });
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Retry failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
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
      await assertClientAccess(ctx, input.clientId);
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
      await assertClientAccess(ctx, input.clientId);
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
      await assertClientAccess(ctx, input.clientId);
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
      await assertClientAccess(ctx, input.clientId);
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
      await assertClientAccess(ctx, input.clientId);
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

  // ===== GOLDEN NUGGETS (Story 1.5-4-4) =====

  // Mark a supporting point as a golden nugget
  markGoldenNugget: procedure
    .input(z.object({
      clientId: z.string().min(1),
      pillarId: z.string().uuid(),
      nuggetIndex: z.number().min(0), // Index in supportingPoints array
      isGolden: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get pillar with supporting points
      const pillar = await ctx.db.prepare(`
        SELECT id, supporting_points, golden_nuggets
        FROM extracted_pillars WHERE id = ? AND client_id = ?
      `).bind(input.pillarId, input.clientId).first();

      if (!pillar) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pillar not found' });
      }

      const supportingPoints = JSON.parse((pillar.supporting_points as string) || '[]');
      if (input.nuggetIndex >= supportingPoints.length) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid nugget index' });
      }

      // Parse existing golden nuggets (array of indices)
      let goldenNuggets: number[] = [];
      try {
        goldenNuggets = JSON.parse((pillar.golden_nuggets as string) || '[]');
      } catch { /* ignore */ }

      // Add or remove nugget index
      if (input.isGolden && !goldenNuggets.includes(input.nuggetIndex)) {
        goldenNuggets.push(input.nuggetIndex);
      } else if (!input.isGolden) {
        goldenNuggets = goldenNuggets.filter(i => i !== input.nuggetIndex);
      }

      await ctx.db.prepare(`
        UPDATE extracted_pillars SET golden_nuggets = ? WHERE id = ?
      `).bind(JSON.stringify(goldenNuggets), input.pillarId).run();

      return { success: true, goldenNuggets };
    }),

  // Get all golden nuggets for a source
  getGoldenNuggets: procedure
    .input(z.object({
      clientId: z.string().min(1),
      sourceId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const result = await ctx.db.prepare(`
        SELECT id, title, supporting_points, golden_nuggets
        FROM extracted_pillars
        WHERE source_id = ? AND client_id = ?
      `).bind(input.sourceId, input.clientId).all();

      return (result.results || []).map((row: Record<string, unknown>) => {
        const supportingPoints = JSON.parse((row.supporting_points as string) || '[]');
        const goldenIndices: number[] = JSON.parse((row.golden_nuggets as string) || '[]');

        return {
          pillarId: row.id as string,
          pillarTitle: row.title as string,
          nuggets: supportingPoints.map((point: string, index: number) => ({
            index,
            text: point,
            isGolden: goldenIndices.includes(index),
          })),
        };
      });
    }),

  // Bulk update golden nugget weights
  updateNuggetWeights: procedure
    .input(z.object({
      clientId: z.string().min(1),
      pillarId: z.string().uuid(),
      weights: z.record(z.string(), z.number().min(0).max(10)), // index -> weight (0-10)
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      await ctx.db.prepare(`
        UPDATE extracted_pillars SET nugget_weights = ? WHERE id = ? AND client_id = ?
      `).bind(JSON.stringify(input.weights), input.pillarId, input.clientId).run();

      return { success: true };
    }),

  // Trigger Spoke Generation Workflow (Story 1.5-4-5)
  triggerSpokeGeneration: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // 1. Fetch Approved Pillars
      const pillars = await ctx.db.prepare(`
        SELECT id, title, core_claim, psychological_angle, supporting_points, golden_nuggets
        FROM extracted_pillars
        WHERE hub_id = ? AND client_id = ?
      `).bind(input.hubId, input.clientId).all();

      if (!pillars.results || pillars.results.length === 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'No pillars found for this hub. Extract pillars first.',
        });
      }

      // 2. Fetch Platform Strategy
      const strategy = await ctx.db.prepare(`
        SELECT platform, status, posting_cadence
        FROM platform_recommendations
        WHERE client_id = ? AND status != 'excluded'
      `).bind(input.clientId).all();

      // 3. Trigger Workflow on Engine
      try {
        const result = await ctx.callEngine<{ instanceId: string }>('http://internal/api/hubs/generate-spokes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: input.clientId,
            hubId: input.hubId,
            pillars: pillars.results,
            strategy: strategy.results,
          }),
        });

        // Update hub status
        await ctx.db.prepare(`
          UPDATE hubs SET status = 'processing', updated_at = ? WHERE id = ?
        `).bind(Date.now(), input.hubId).run();

        return {
          success: true,
          workflowInstanceId: result.instanceId,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to trigger generation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  // Get Spoke Generation Progress (Story 1.5-4-6)
  getGenerationProgress: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      
      try {
        const result = await ctx.db.prepare(`
          SELECT COUNT(*) as generated, total_expected
          FROM spokes s
          JOIN hubs h ON s.hub_id = h.id
          WHERE h.id = ? AND h.client_id = ?
        `).bind(input.hubId, input.clientId).first();

        return {
          generated: (result?.generated as number) || 0,
          total: (result?.total_expected as number) || 25, // Fallback to 25
        };
      } catch (error) {
        return { generated: 0, total: 25 };
      }
    }),

  // Resume Failed Generation (Story 1.5-4-9)
  resumeSpokeGeneration: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Check for already generated spokes
      const existing = await ctx.db.prepare(`
        SELECT COUNT(*) as count FROM spokes WHERE hub_id = ?
      `).bind(input.hubId).first();

      const skipCount = (existing?.count as number) || 0;

      // Re-trigger workflow passing the skip count
      try {
        await ctx.callEngine<{ instanceId: string }>('http://internal/api/hubs/generate-spokes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: input.clientId,
            hubId: input.hubId,
            skipCount, // Engine should skip these many spokes
          }),
        });

        await ctx.db.prepare(`
          UPDATE hubs SET status = 'processing', updated_at = ? WHERE id = ?
        `).bind(Date.now(), input.hubId).run();

        return { success: true, resumedFrom: skipCount };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to resume generation',
        });
      }
    }),

  // Start Over Spoke Generation (Story 1.5-4-9)
  startOverSpokeGeneration: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // 1. Delete existing spokes for this hub
      await ctx.db.prepare(`
        DELETE FROM spokes WHERE hub_id = ?
      `).bind(input.hubId).run();

      // 2. Trigger fresh generation
      await ctx.callEngine<{ instanceId: string }>('http://internal/api/hubs/generate-spokes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: input.clientId,
          hubId: input.hubId,
          skipCount: 0,
        }),
      });

      return { success: true };
    }),

  // ===== Story 3.6: Pillar-First Hub Creation =====

  // Create a Hub using approved Brand DNA pillars (no source upload needed)
  createPillarFirstHub: procedure
    .input(z.object({
      clientId: z.string().min(1),
      pillarIds: z.array(z.string().uuid()).min(1).max(10),
      title: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const now = Date.now();
      const sourceId = crypto.randomUUID();
      const hubId = crypto.randomUUID();

      // AC5: Create synthetic hub_sources record with source_type = 'pillars'
      await ctx.db.prepare(`
        INSERT INTO hub_sources (id, client_id, user_id, title, source_type, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'pillars', 'ready', ?, ?)
      `).bind(
        sourceId,
        input.clientId,
        ctx.userId,
        input.title || 'Core Pillars Hub',
        now,
        now
      ).run();

      // AC5: Copy and transform pillars from content_pillars to extracted_pillars
      // Map framework_type to psychological_angle
      const angleMap: Record<string, string> = {
        'catalyst': 'Contrarian',
        'core_truth': 'Authority',
        'proof': 'Transformation',
      };

      // Get the source pillars from content_pillars
      const placeholders = input.pillarIds.map(() => '?').join(',');
      const contentPillars = await ctx.db.prepare(`
        SELECT id, title, description, framework_type, rationale
        FROM content_pillars
        WHERE id IN (${placeholders}) AND client_id = ?
      `).bind(...input.pillarIds, input.clientId).all();

      if (!contentPillars.results || contentPillars.results.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No approved pillars found with the provided IDs',
        });
      }

      // Insert transformed pillars into extracted_pillars
      let insertedCount = 0;
      for (const pillar of contentPillars.results as Record<string, unknown>[]) {
        const extractedPillarId = crypto.randomUUID();
        const psychologicalAngle = angleMap[(pillar.framework_type as string) || ''] || 'Authority';

        // Extract supporting points from rationale JSON
        let supportingPoints: string[] = [];
        if (pillar.rationale) {
          try {
            const rationale = JSON.parse(pillar.rationale as string);
            supportingPoints = [
              rationale.voiceConnection,
              rationale.audienceAlignment,
              rationale.competitorDifferentiation,
            ].filter(Boolean);
          } catch {
            // Ignore parse errors
          }
        }

        await ctx.db.prepare(`
          INSERT INTO extracted_pillars (id, source_id, client_id, hub_id, title, core_claim, psychological_angle, estimated_spoke_count, supporting_points, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          extractedPillarId,
          sourceId,
          input.clientId,
          hubId,
          pillar.title as string,
          pillar.description as string || '',
          psychologicalAngle,
          5, // Default spoke count
          JSON.stringify(supportingPoints),
          now
        ).run();

        insertedCount++;
      }

      // Create the hub record
      const hubTitle = input.title || 'Core Pillars Hub';
      await ctx.db.prepare(`
        INSERT INTO hubs (id, client_id, user_id, source_id, title, source_type, pillar_count, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'pillars', ?, 'ready', ?, ?)
      `).bind(
        hubId,
        input.clientId,
        ctx.userId,
        sourceId,
        hubTitle,
        insertedCount,
        now,
        now
      ).run();

      return {
        hubId,
        sourceId,
        title: hubTitle,
        pillarCount: insertedCount,
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
      await assertClientAccess(ctx, input.clientId);
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
      await assertClientAccess(ctx, input.clientId);
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
      await assertClientAccess(ctx, input.clientId);
      const now = Date.now();
      await ctx.db.prepare(`
        UPDATE hubs SET status = 'archived', updated_at = ? WHERE id = ? AND client_id = ?
      `).bind(now, input.hubId, input.clientId).run();

      return { success: true, hubId: input.hubId };
    }),
});