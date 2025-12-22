import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import type { HubSource, ExtractionProgress, Pillar, Hub, HubListItem, HubWithPillars } from '../../types';
import { extractPillars } from '../../services/extraction';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Module-level progress store for real-time extraction tracking
// Key: sourceId, Value: current progress state
const extractionProgressStore = new Map<string, ExtractionProgress>();

// Module-level pillar store for extraction results
// Key: sourceId, Value: extracted pillars
const extractionPillarsStore = new Map<string, Pillar[]>();

// Helper to count words in text
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const hubsRouter = t.router({
  // ===== SOURCE MANAGEMENT (Story 3-1) =====

  // Get upload URL for source PDF
  getSourceUploadUrl: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      filename: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

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

  // Register uploaded PDF source in database
  registerPdfSource: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      sourceId: z.string().uuid(),
      r2Key: z.string().min(1).max(500),
      title: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      // TODO: Replace with actual RBAC check when Epic 7 implemented
      // For MVP, userId === clientId (single-user per client)
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Security: Validate R2 key belongs to this client (prevent path traversal)
      const expectedPrefix = `sources/${input.clientId}/`;
      if (!input.r2Key.startsWith(expectedPrefix)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Security: Prevent path traversal attacks (../ sequences)
      const normalizedKey = input.r2Key.replace(/\\/g, '/');
      if (normalizedKey.includes('../') || normalizedKey.includes('/..')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Security: Validate key structure (must have 4 parts minimum)
      const keyParts = normalizedKey.split('/');
      if (keyParts.length < 4 || keyParts[0] !== 'sources' || keyParts[1] !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Verify file exists in R2
      const object = await ctx.env.MEDIA.head(input.r2Key);
      if (!object) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File upload failed. Please try again.',
        });
      }

      // Security: Validate file size (50MB max)
      if (object.size && object.size > 50 * 1024 * 1024) {
        // Cleanup: Delete oversized file from R2
        await ctx.env.MEDIA.delete(input.r2Key);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'File size exceeds 50MB limit',
        });
      }

      try {
        // Insert into hub_sources
        await ctx.db
          .prepare(`
            INSERT INTO hub_sources (id, client_id, user_id, title, source_type, r2_key, status)
            VALUES (?, ?, ?, ?, 'pdf', ?, 'pending')
          `)
          .bind(
            input.sourceId,
            input.clientId,
            ctx.userId,
            input.title || 'Uploaded PDF',
            input.r2Key
          )
          .run();

        return {
          sourceId: input.sourceId,
          status: 'pending' as const,
        };
      } catch (err) {
        // Cleanup: Delete R2 file if database insert fails
        try {
          await ctx.env.MEDIA.delete(input.r2Key);
        } catch {
          // Ignore cleanup errors
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register upload. Please try again.',
        });
      }
    }),

  // Create source from pasted text
  createTextSource: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      title: z.string().max(255).optional(),
      content: z.string().min(100).max(100000), // Min 100 chars for meaningful content
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const sourceId = crypto.randomUUID();
      const wordCount = countWords(input.content);
      const characterCount = input.content.length;

      await ctx.db
        .prepare(`
          INSERT INTO hub_sources (
            id, client_id, user_id, title, source_type, raw_content,
            character_count, word_count, status
          ) VALUES (?, ?, ?, ?, 'text', ?, ?, ?, 'ready')
        `)
        .bind(
          sourceId,
          input.clientId,
          ctx.userId,
          input.title || 'Pasted Content',
          input.content,
          characterCount,
          wordCount
        )
        .run();

      return {
        sourceId,
        status: 'ready' as const,
        characterCount,
        wordCount,
      };
    }),

  // Create source from URL (YouTube, article)
  createUrlSource: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      url: z.string().url(),
      title: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Validate URL format
      const urlObj = new URL(input.url);
      const isYouTube = ['youtube.com', 'youtu.be', 'www.youtube.com'].some(d =>
        urlObj.hostname.includes(d)
      );
      const isHttps = urlObj.protocol === 'https:';

      if (!isHttps && !isYouTube) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'URL must use HTTPS',
        });
      }

      const sourceId = crypto.randomUUID();

      // Store URL source as pending (scraping happens in Story 3-2)
      await ctx.db
        .prepare(`
          INSERT INTO hub_sources (id, client_id, user_id, title, source_type, url, status)
          VALUES (?, ?, ?, ?, 'url', ?, 'pending')
        `)
        .bind(
          sourceId,
          input.clientId,
          ctx.userId,
          input.title || `Content from ${urlObj.hostname}`,
          input.url
        )
        .run();

      return {
        sourceId,
        url: input.url,
        status: 'pending' as const,
      };
    }),

  // Get recent sources for quick-select (up to 3)
  getRecentSources: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      limit: z.number().min(1).max(3).default(3),
    }))
    .query(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const result = await ctx.db
        .prepare(`
          SELECT id, title, source_type, character_count, word_count, status, created_at
          FROM hub_sources
          WHERE client_id = ? AND status IN ('ready', 'pending')
          ORDER BY created_at DESC
          LIMIT ?
        `)
        .bind(input.clientId, input.limit)
        .all<HubSource>();

      return result.results || [];
    }),

  // Get single source by ID
  getSource: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const source = await ctx.db
        .prepare('SELECT * FROM hub_sources WHERE id = ? AND client_id = ?')
        .bind(input.sourceId, input.clientId)
        .first<HubSource>();

      if (!source) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source not found',
        });
      }

      return source;
    }),

  // Delete a source
  deleteSource: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const source = await ctx.db
        .prepare('SELECT r2_key FROM hub_sources WHERE id = ? AND client_id = ?')
        .bind(input.sourceId, input.clientId)
        .first<{ r2_key: string | null }>();

      if (!source) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source not found',
        });
      }

      // Delete from R2 if exists
      if (source.r2_key) {
        try {
          await ctx.env.MEDIA.delete(source.r2_key);
        } catch {
          // Ignore R2 delete errors (file may already be deleted)
        }
      }

      await ctx.db
        .prepare('DELETE FROM hub_sources WHERE id = ?')
        .bind(input.sourceId)
        .run();

      return { success: true };
    }),

  // ===== THEMATIC EXTRACTION (Story 3-2) =====

  // Start thematic extraction for a source
  extract: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Get source from database
      const source = await ctx.db
        .prepare('SELECT * FROM hub_sources WHERE id = ? AND client_id = ?')
        .bind(input.sourceId, input.clientId)
        .first<HubSource>();

      if (!source) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source not found',
        });
      }

      // Get content from source
      let content: string;
      if (source.raw_content) {
        content = source.raw_content;
      } else if (source.r2_key) {
        // Fetch PDF content from R2 (TODO: Extract text from PDF)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'PDF extraction not implemented in MVP - use text sources',
        });
      } else if (source.url) {
        // Fetch URL content (TODO: Implement URL scraping)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'URL extraction not implemented in MVP - use text sources',
        });
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Source has no content',
        });
      }

      // Validate content length
      if (content.length < 100) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Content too short for extraction (minimum 100 characters)',
        });
      }

      // Update source status to processing
      await ctx.db
        .prepare('UPDATE hub_sources SET status = ? WHERE id = ?')
        .bind('processing', input.sourceId)
        .run();

      // Initialize progress in D1 (persistent across isolates)
      await ctx.db
        .prepare(`
          INSERT INTO extraction_progress (source_id, client_id, status, current_stage, progress, stage_message)
          VALUES (?, ?, 'processing', 'parsing', 0, 'Starting extraction...')
          ON CONFLICT(source_id) DO UPDATE SET
            status = 'processing',
            current_stage = 'parsing',
            progress = 0,
            stage_message = 'Starting extraction...',
            error_message = NULL,
            updated_at = unixepoch()
        `)
        .bind(input.sourceId, input.clientId)
        .run();

      // Helper to update progress in D1
      const updateProgressInDb = async (progress: ExtractionProgress) => {
        await ctx.db
          .prepare(`
            UPDATE extraction_progress SET
              status = ?,
              current_stage = ?,
              progress = ?,
              stage_message = ?,
              error_message = ?,
              updated_at = unixepoch()
            WHERE source_id = ?
          `)
          .bind(
            progress.status,
            progress.currentStage,
            progress.progress,
            progress.stageMessage,
            progress.error || null,
            input.sourceId
          )
          .run();
      };

      // Run extraction with real-time progress updates to D1
      const result = await extractPillars({
        ai: ctx.env.AI,
        content,
        sourceId: input.sourceId,
        onProgress: updateProgressInDb,
      });

      // Store pillars in D1 for persistent retrieval
      if (result.success && result.pillars.length > 0) {
        // Delete any existing pillars for this source
        await ctx.db
          .prepare('DELETE FROM extracted_pillars WHERE source_id = ?')
          .bind(input.sourceId)
          .run();

        // Insert new pillars
        for (const pillar of result.pillars) {
          await ctx.db
            .prepare(`
              INSERT INTO extracted_pillars (
                id, source_id, client_id, title, core_claim,
                psychological_angle, estimated_spoke_count, supporting_points
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
              pillar.id,
              input.sourceId,
              input.clientId,
              pillar.title,
              pillar.coreClaim,
              pillar.psychologicalAngle,
              pillar.estimatedSpokeCount,
              JSON.stringify(pillar.supportingPoints)
            )
            .run();
        }
      }

      // Update source status based on result
      const newStatus = result.success ? 'ready' : 'failed';
      await ctx.db
        .prepare('UPDATE hub_sources SET status = ?, error_message = ? WHERE id = ?')
        .bind(newStatus, result.error || null, input.sourceId)
        .run();

      // Mark extraction progress as completed/failed
      await updateProgressInDb({
        sourceId: input.sourceId,
        status: result.success ? 'completed' : 'failed',
        currentStage: 'pillars',
        progress: result.success ? 100 : 0,
        stageMessage: result.success
          ? `${result.pillars.length} pillars generated`
          : 'Extraction failed',
        error: result.error,
      });

      return {
        sourceId: input.sourceId,
        success: result.success,
        pillars: result.pillars,
        extractionDuration: result.extractionDuration,
        error: result.error,
      };
    }),

  // Get extraction progress for a source
  getExtractionProgress: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Check D1 extraction_progress table for real-time progress (persistent)
      const dbProgress = await ctx.db
        .prepare(`
          SELECT source_id, status, current_stage, progress, stage_message, error_message
          FROM extraction_progress
          WHERE source_id = ? AND client_id = ?
        `)
        .bind(input.sourceId, input.clientId)
        .first<{
          source_id: string;
          status: string;
          current_stage: string;
          progress: number;
          stage_message: string;
          error_message: string | null;
        }>();

      if (dbProgress) {
        return {
          sourceId: dbProgress.source_id,
          status: dbProgress.status as ExtractionProgress['status'],
          currentStage: dbProgress.current_stage as ExtractionProgress['currentStage'],
          progress: dbProgress.progress,
          stageMessage: dbProgress.stage_message,
          error: dbProgress.error_message || undefined,
        };
      }

      // Fall back to hub_sources status for historical data (before migration)
      const source = await ctx.db
        .prepare('SELECT status, error_message FROM hub_sources WHERE id = ? AND client_id = ?')
        .bind(input.sourceId, input.clientId)
        .first<{ status: string; error_message: string | null }>();

      if (!source) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source not found',
        });
      }

      // Map database status to extraction progress (fallback for historical data)
      const statusMap: Record<string, ExtractionProgress> = {
        pending: {
          sourceId: input.sourceId,
          status: 'pending',
          currentStage: 'parsing',
          progress: 0,
          stageMessage: 'Waiting to start extraction',
        },
        processing: {
          sourceId: input.sourceId,
          status: 'processing',
          currentStage: 'themes',
          progress: 50,
          stageMessage: 'Processing content...',
        },
        ready: {
          sourceId: input.sourceId,
          status: 'completed',
          currentStage: 'pillars',
          progress: 100,
          stageMessage: 'Extraction completed successfully',
        },
        failed: {
          sourceId: input.sourceId,
          status: 'failed',
          currentStage: 'parsing',
          progress: 0,
          stageMessage: 'Extraction failed',
          error: source.error_message || 'Unknown error',
        },
      };

      return statusMap[source.status] || statusMap['pending'];
    }),

  // Retry extraction from last successful stage (Story 3.5 AC4)
  retryExtraction: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Get current progress to determine last stage
      const currentProgress = await ctx.db
        .prepare(`
          SELECT source_id, current_stage, retry_count
          FROM extraction_progress
          WHERE source_id = ? AND client_id = ?
        `)
        .bind(input.sourceId, input.clientId)
        .first<{
          source_id: string;
          current_stage: string;
          retry_count: number | null;
        }>();

      // Get source to re-extract
      const source = await ctx.db
        .prepare('SELECT * FROM hub_sources WHERE id = ? AND client_id = ?')
        .bind(input.sourceId, input.clientId)
        .first<HubSource>();

      if (!source) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source not found',
        });
      }

      // Get content (only text sources for MVP)
      if (!source.raw_content) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only text sources can be retried in MVP',
        });
      }

      // Track retry count
      const retryCount = (currentProgress?.retry_count || 0) + 1;

      // Reset progress state (preserving pillars - no deletion)
      await ctx.db
        .prepare(`
          UPDATE extraction_progress SET
            status = 'processing',
            current_stage = 'parsing',
            progress = 0,
            stage_message = 'Retrying extraction (attempt ${retryCount})...',
            error_message = NULL,
            retry_count = ?,
            updated_at = unixepoch()
          WHERE source_id = ?
        `)
        .bind(retryCount, input.sourceId)
        .run();

      // Update source status back to processing
      await ctx.db
        .prepare('UPDATE hub_sources SET status = ?, error_message = NULL WHERE id = ?')
        .bind('processing', input.sourceId)
        .run();

      // Helper to update progress
      const updateProgressInDb = async (progress: ExtractionProgress) => {
        await ctx.db
          .prepare(`
            UPDATE extraction_progress SET
              status = ?,
              current_stage = ?,
              progress = ?,
              stage_message = ?,
              error_message = ?,
              updated_at = unixepoch()
            WHERE source_id = ?
          `)
          .bind(
            progress.status,
            progress.currentStage,
            progress.progress,
            progress.stageMessage,
            progress.error || null,
            input.sourceId
          )
          .run();
      };

      // Run extraction (will add to existing pillars, not replace)
      const result = await extractPillars({
        ai: ctx.env.AI,
        content: source.raw_content,
        sourceId: input.sourceId,
        onProgress: updateProgressInDb,
      });

      // Store NEW pillars in D1 - PRESERVE existing pillars per AC4
      // Only add if extraction was successful
      if (result.success && result.pillars.length > 0) {
        // Get existing pillar titles to avoid duplicates (preserving existing pillars)
        const existingPillars = await ctx.db
          .prepare('SELECT title FROM extracted_pillars WHERE source_id = ?')
          .bind(input.sourceId)
          .all<{ title: string }>();

        const existingTitles = new Set(existingPillars.results?.map(p => p.title) || []);

        // Insert only NEW pillars (skip if title already exists)
        for (const pillar of result.pillars) {
          if (!existingTitles.has(pillar.title)) {
            await ctx.db
              .prepare(`
                INSERT INTO extracted_pillars (
                  id, source_id, client_id, title, core_claim,
                  psychological_angle, estimated_spoke_count, supporting_points
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `)
              .bind(
                pillar.id,
                input.sourceId,
                input.clientId,
                pillar.title,
                pillar.coreClaim,
                pillar.psychologicalAngle,
                pillar.estimatedSpokeCount,
                JSON.stringify(pillar.supportingPoints)
              )
              .run();
          }
        }
      }

      // Update source and progress status
      const newStatus = result.success ? 'ready' : 'failed';
      await ctx.db
        .prepare('UPDATE hub_sources SET status = ?, error_message = ? WHERE id = ?')
        .bind(newStatus, result.error || null, input.sourceId)
        .run();

      await updateProgressInDb({
        sourceId: input.sourceId,
        status: result.success ? 'completed' : 'failed',
        currentStage: 'pillars',
        progress: result.success ? 100 : 0,
        stageMessage: result.success
          ? `${result.pillars.length} pillars generated`
          : 'Extraction failed',
        error: result.error,
      });

      return {
        sourceId: input.sourceId,
        success: result.success,
        pillars: result.pillars,
        retryCount,
        error: result.error,
      };
    }),

  // Get extracted pillars for a source
  getPillars: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Fetch pillars from D1 extracted_pillars table (persistent)
      const result = await ctx.db
        .prepare(`
          SELECT id, title, core_claim, psychological_angle, estimated_spoke_count, supporting_points
          FROM extracted_pillars
          WHERE source_id = ? AND client_id = ?
          ORDER BY psychological_angle
        `)
        .bind(input.sourceId, input.clientId)
        .all<{
          id: string;
          title: string;
          core_claim: string;
          psychological_angle: string;
          estimated_spoke_count: number;
          supporting_points: string;
        }>();

      // Map to Pillar type with JSON parsing
      return (result.results || []).map((row): Pillar => ({
        id: row.id,
        title: row.title,
        coreClaim: row.core_claim,
        psychologicalAngle: row.psychological_angle as Pillar['psychologicalAngle'],
        estimatedSpokeCount: row.estimated_spoke_count,
        supportingPoints: JSON.parse(row.supporting_points || '[]'),
      }));
    }),

  // ===== PILLAR CONFIGURATION (Story 3-3) =====

  // Update a pillar (title, claim, angle)
  updatePillar: procedure
    .input(z.object({
      pillarId: z.string().uuid(),
      clientId: z.string().uuid(),
      title: z.string().min(1).max(255).optional(),
      coreClaim: z.string().min(1).max(2000).optional(),
      psychologicalAngle: z.enum([
        'Contrarian', 'Authority', 'Urgency', 'Aspiration',
        'Fear', 'Curiosity', 'Transformation', 'Rebellion',
      ]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Verify pillar exists and belongs to client
      const pillar = await ctx.db
        .prepare('SELECT id, hub_id FROM extracted_pillars WHERE id = ? AND client_id = ?')
        .bind(input.pillarId, input.clientId)
        .first<{ id: string; hub_id: string | null }>();

      if (!pillar) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pillar not found',
        });
      }

      // AC2: Pillars become immutable after Hub creation
      if (pillar.hub_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot edit pillars after Hub is created',
        });
      }

      // Build dynamic update query
      const updates: string[] = [];
      const values: (string | number)[] = [];

      if (input.title !== undefined) {
        updates.push('title = ?');
        values.push(input.title);
      }
      if (input.coreClaim !== undefined) {
        updates.push('core_claim = ?');
        values.push(input.coreClaim);
      }
      if (input.psychologicalAngle !== undefined) {
        updates.push('psychological_angle = ?');
        values.push(input.psychologicalAngle);
      }

      if (updates.length === 0) {
        return { success: true, pillarId: input.pillarId };
      }

      values.push(input.pillarId);

      await ctx.db
        .prepare(`UPDATE extracted_pillars SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...values)
        .run();

      return { success: true, pillarId: input.pillarId };
    }),

  // Delete a pillar (with minimum 3 validation)
  deletePillar: procedure
    .input(z.object({
      pillarId: z.string().uuid(),
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Count existing pillars for this source
      const countResult = await ctx.db
        .prepare('SELECT COUNT(*) as count FROM extracted_pillars WHERE source_id = ? AND client_id = ?')
        .bind(input.sourceId, input.clientId)
        .first<{ count: number }>();

      const pillarCount = countResult?.count || 0;

      // Minimum 3 pillars validation
      if (pillarCount <= 3) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Minimum 3 pillars required for Hub creation',
        });
      }

      // Verify pillar exists and belongs to client
      const pillar = await ctx.db
        .prepare('SELECT id, hub_id FROM extracted_pillars WHERE id = ? AND client_id = ?')
        .bind(input.pillarId, input.clientId)
        .first<{ id: string; hub_id: string | null }>();

      if (!pillar) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pillar not found',
        });
      }

      // AC2: Pillars become immutable after Hub creation
      if (pillar.hub_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete pillars after Hub is created',
        });
      }

      await ctx.db
        .prepare('DELETE FROM extracted_pillars WHERE id = ?')
        .bind(input.pillarId)
        .run();

      return { success: true, remainingCount: pillarCount - 1 };
    }),

  // Restore a deleted pillar (for undo functionality)
  restorePillar: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
      pillar: z.object({
        id: z.string().uuid(),
        title: z.string(),
        coreClaim: z.string(),
        psychologicalAngle: z.string(),
        estimatedSpokeCount: z.number(),
        supportingPoints: z.array(z.string()),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      await ctx.db
        .prepare(`
          INSERT INTO extracted_pillars (
            id, source_id, client_id, title, core_claim,
            psychological_angle, estimated_spoke_count, supporting_points
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          input.pillar.id,
          input.sourceId,
          input.clientId,
          input.pillar.title,
          input.pillar.coreClaim,
          input.pillar.psychologicalAngle,
          input.pillar.estimatedSpokeCount,
          JSON.stringify(input.pillar.supportingPoints)
        )
        .run();

      return { success: true };
    }),

  // ===== HUB MANAGEMENT (Story 3.4) =====

  // Finalize Hub creation from configured pillars
  finalize: procedure
    .input(z.object({
      sourceId: z.string().uuid(),
      clientId: z.string().uuid(),
      title: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Get source to validate and extract metadata
      const source = await ctx.db
        .prepare('SELECT * FROM hub_sources WHERE id = ? AND client_id = ?')
        .bind(input.sourceId, input.clientId)
        .first<HubSource>();

      if (!source) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source not found',
        });
      }

      // Count pillars for this source
      const pillarCountResult = await ctx.db
        .prepare('SELECT COUNT(*) as count FROM extracted_pillars WHERE source_id = ? AND client_id = ?')
        .bind(input.sourceId, input.clientId)
        .first<{ count: number }>();

      const pillarCount = pillarCountResult?.count || 0;

      if (pillarCount < 3) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Minimum 3 pillars required to create a Hub',
        });
      }

      const hubId = crypto.randomUUID();
      const hubTitle = input.title || source.title || 'Untitled Hub';

      // Create Hub record
      await ctx.db
        .prepare(`
          INSERT INTO hubs (id, client_id, user_id, source_id, title, source_type, pillar_count, spoke_count, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'ready')
        `)
        .bind(
          hubId,
          input.clientId,
          ctx.userId,
          input.sourceId,
          hubTitle,
          source.source_type,
          pillarCount
        )
        .run();

      // Link pillars to Hub
      await ctx.db
        .prepare('UPDATE extracted_pillars SET hub_id = ? WHERE source_id = ? AND client_id = ?')
        .bind(hubId, input.sourceId, input.clientId)
        .run();

      // Update source status to completed
      await ctx.db
        .prepare('UPDATE hub_sources SET status = ? WHERE id = ?')
        .bind('ready', input.sourceId)
        .run();

      return {
        hubId,
        title: hubTitle,
        pillarCount,
        redirectTo: `/app/hubs/${hubId}`,
      };
    }),

  // List all Hubs for a client (Story 3.4 AC4)
  list: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      status: z.enum(['processing', 'ready', 'archived']).optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Build query with optional status filter
      let query = `
        SELECT id, title, source_type, pillar_count, spoke_count, status, created_at
        FROM hubs
        WHERE client_id = ?
      `;
      const params: (string | number)[] = [input.clientId];

      if (input.status) {
        query += ' AND status = ?';
        params.push(input.status);
      }

      // Cursor-based pagination (cursor is created_at timestamp)
      if (input.cursor) {
        query += ' AND created_at < ?';
        params.push(parseInt(input.cursor, 10));
      }

      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(input.limit + 1); // Fetch one extra to detect if there's more

      const result = await ctx.db
        .prepare(query)
        .bind(...params)
        .all<Hub>();

      const items = result.results || [];
      const hasMore = items.length > input.limit;
      const returnItems = hasMore ? items.slice(0, input.limit) : items;

      // Map to API response format
      const hubList: HubListItem[] = returnItems.map((hub) => ({
        id: hub.id,
        title: hub.title,
        sourceType: hub.source_type,
        pillarCount: hub.pillar_count,
        spokeCount: hub.spoke_count,
        status: hub.status,
        createdAt: hub.created_at,
      }));

      const lastItem = returnItems[returnItems.length - 1];
      return {
        items: hubList,
        nextCursor: hasMore && lastItem ? String(lastItem.created_at) : undefined,
      };
    }),

  // Get a single Hub with pillars (Story 3.4 AC5)
  get: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Fetch Hub
      const hub = await ctx.db
        .prepare('SELECT * FROM hubs WHERE id = ? AND client_id = ?')
        .bind(input.hubId, input.clientId)
        .first<Hub>();

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      // Fetch associated pillars
      const pillarsResult = await ctx.db
        .prepare(`
          SELECT id, title, core_claim, psychological_angle, estimated_spoke_count, supporting_points
          FROM extracted_pillars
          WHERE hub_id = ? AND client_id = ?
          ORDER BY psychological_angle
        `)
        .bind(input.hubId, input.clientId)
        .all<{
          id: string;
          title: string;
          core_claim: string;
          psychological_angle: string;
          estimated_spoke_count: number;
          supporting_points: string;
        }>();

      const pillars: Pillar[] = (pillarsResult.results || []).map((row) => ({
        id: row.id,
        title: row.title,
        coreClaim: row.core_claim,
        psychologicalAngle: row.psychological_angle as Pillar['psychologicalAngle'],
        estimatedSpokeCount: row.estimated_spoke_count,
        supportingPoints: JSON.parse(row.supporting_points || '[]'),
      }));

      return {
        ...hub,
        pillars,
      } as HubWithPillars;
    }),

  // Archive a Hub (soft delete)
  archive: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // Verify Hub exists and belongs to client
      const hub = await ctx.db
        .prepare('SELECT id FROM hubs WHERE id = ? AND client_id = ?')
        .bind(input.hubId, input.clientId)
        .first<{ id: string }>();

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      // Archive Hub
      await ctx.db
        .prepare('UPDATE hubs SET status = ?, updated_at = unixepoch() WHERE id = ?')
        .bind('archived', input.hubId)
        .run();

      return { success: true };
    }),

  // Get Hub processing progress (placeholder for Story 3.5)
  getProgress: procedure
    .input(z.object({
      hubId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Security: User-client authorization check
      if (ctx.userId !== input.clientId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      // For now, return ready status (real-time progress in Story 3.5)
      return {
        status: 'ready' as const,
        currentPhase: 'complete',
        progress: 100,
        error: undefined as string | undefined,
      };
    }),
});
