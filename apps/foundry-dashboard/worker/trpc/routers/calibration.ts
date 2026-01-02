import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import type { Context } from '../context';
import type {
  TrainingSample,
  TrainingSampleWithQuality,
  BrandDNAReport,
  CalibrationSource,
} from '../../types';
import { assertClientAccess } from '../middleware/client-access';
import * as brandQueries from '../../db/queries/brand';
import * as schema from '../../db/schema';

// Helper to map DB TrainingSample to API TrainingSample
function mapTrainingSample(dbSample: schema.TrainingSample): TrainingSample {
  return {
    id: dbSample.id,
    client_id: dbSample.client_id,
    user_id: dbSample.user_id || '',
    title: dbSample.title,
    source_type: dbSample.source_type as TrainingSample['source_type'],
    r2_key: dbSample.r2_key,
    word_count: dbSample.word_count || 0,
    character_count: dbSample.character_count || 0,
    extracted_text: dbSample.extracted_text,
    status: dbSample.status as TrainingSample['status'],
    quality_score: dbSample.quality_score,
    quality_notes: null, // Not in DB schema yet
    error_message: null, // Not in DB schema yet
    created_at: dbSample.created_at ? dbSample.created_at.getTime() : 0,
    updated_at: 0, // Not in DB schema select? It is in schema definition.
    analyzed_at: null, // Not in DB schema yet
  };
}

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// ===== Helper to calculate quality badge from score =====
function getQualityBadge(sample: TrainingSample): TrainingSampleWithQuality['qualityBadge'] {
  if (sample.status === 'pending' || sample.status === 'processing') {
    return 'pending';
  }
  // If analyzed but no quality score yet, show as "good" (analyzed successfully)
  if (sample.status === 'analyzed' && sample.quality_score === null) {
    return 'good';
  }
  if (sample.quality_score === null) {
    return 'pending';
  }
  if (sample.quality_score >= 90) return 'excellent';
  if (sample.quality_score >= 75) return 'good';
  if (sample.quality_score >= 50) return 'fair';
  return 'needs_improvement';
}

// ===== Helper to count words in text =====
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ===== Helper to validate audio file magic bytes (Story 1.5-1-3) =====
async function validateAudioFile(ctx: Context, r2Key: string): Promise<boolean> {
  try {
    // Read first 12 bytes to cover most signatures
    const object = await ctx.env.MEDIA.get(r2Key, { range: { offset: 0, length: 12 } });
    if (!object) return false;

    const buffer = await object.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 12) return false;

    // WebM (EBML) - 1A 45 DF A3
    if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) return true;
    
    // WAV (RIFF....WAVE) - 52 49 46 46 ... 57 41 56 45
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) return true;
        
    // OGG - 4F 67 67 53
    if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return true;
    
    // MP3 (ID3) - 49 44 33
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true;
    // MP3 (MPEG Frame) - FF FB or FF F3 (approx check)
    if (bytes[0] === 0xFF && bytes[1] !== undefined && (bytes[1] & 0xE0) === 0xE0) return true;
    
    // M4A/MP4 (ftyp) - ... ftyp
    // Usually starts with size (4 bytes) then 'ftyp' at offset 4
    if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return true;

    return false;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

/**
 * Sanitize user content for LLM consumption (Story 1.5-1-4)
 * Wraps content in XML-like tags and escapes existing tags to prevent injection.
 */
function sanitizeForLLM(text: string): string {
  if (!text) return '';
  
  // Escape existing XML-like tags that could be used for injection
  const escaped = text
    .replace(/<user_content>/g, '&lt;user_content&gt;')
    .replace(/<\/user_content>/g, '&lt;/user_content&gt;')
    .replace(/<system_prompt>/g, '&lt;system_prompt&gt;')
    .replace(/<\/system_prompt>/g, '&lt;/system_prompt&gt;');
  
  // Standard delimiter used by our Content Engine
  return `<user_content>\n${escaped}\n</user_content>`;
}

// ===== Story R-11: AC5, AC6 - Safe DO sync helper =====
// Wraps ctx.callAgent calls to prevent unhandled rejections and enable partial success
async function safeDOSync<T>(
  ctx: Context,
  clientId: string,
  method: string,
  payload: Record<string, unknown>,
  operation: string
): Promise<{ result: T | null; failed: boolean }> {
  try {
    const result = await ctx.callAgent<T>(clientId, method, payload);
    return { result, failed: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[DO Sync] ${operation} failed for client ${clientId}: ${message}`);
    return { result: null, failed: true };
  }
}

interface DriftComponent {
  voiceMarkers?: string[];
  bannedWords?: string[];
  stances?: Array<{ topic: string; position: string }>;
  primaryTone?: string | null;
}

// ===== Helper to calculate drift (Story 9.2) =====
export function calculateDrift(baseline: DriftComponent, current: DriftComponent, threshold = 25) {
  let voiceDrift = 0;
  let bannedDrift = 0;
  let stanceDrift = 0;
  let toneDrift = 0;

  // Voice Markers (30%)
  if (baseline.voiceMarkers && baseline.voiceMarkers.length > 0) {
    const currSet = new Set(current.voiceMarkers || []);
    let diff = 0;
    baseline.voiceMarkers.forEach((m: string) => { if (!currSet.has(m)) diff++; });
    voiceDrift = (diff / baseline.voiceMarkers.length) * 100;
  }

  // Banned Words (20%)
  if (baseline.bannedWords && baseline.bannedWords.length > 0) {
    const currSet = new Set(current.bannedWords || []);
    let diff = 0;
    baseline.bannedWords.forEach((w: string) => { if (!currSet.has(w)) diff++; });
    bannedDrift = (diff / baseline.bannedWords.length) * 100;
  }

  // Stances (30%)
  if (baseline.stances && baseline.stances.length > 0) {
    const currMap = new Map((current.stances || []).map((s) => [s.topic, s.position]));
    let diff = 0;
    baseline.stances.forEach((s) => {
      if (currMap.get(s.topic) !== s.position) diff++;
    });
    stanceDrift = (diff / baseline.stances.length) * 100;
  }

  // Tone (20%)
  if (baseline.primaryTone && baseline.primaryTone !== current.primaryTone) {
    toneDrift = 100;
  }

  const totalScore = (voiceDrift * 0.3) + (bannedDrift * 0.2) + (stanceDrift * 0.3) + (toneDrift * 0.2);

  // Identify trigger
  let trigger: string | undefined;
  let suggestion: string | undefined;
  if (totalScore > threshold) {
    if (voiceDrift > 0) { trigger = 'voice_markers'; suggestion = 'Update voice markers'; }
    else if (bannedDrift > 0) { trigger = 'banned_words'; suggestion = 'Review banned words'; }
    else if (stanceDrift > 0) { trigger = 'stances'; suggestion = 'Clarify stances'; }
    else if (toneDrift > 0) { trigger = 'tone'; suggestion = ' recalibrate tone'; }
  }

  return { 
    driftScore: totalScore,
    needsCalibration: totalScore > threshold,
    trigger,
    suggestion,
    components: {
      voiceMarkerDrift: voiceDrift,
      bannedWordDrift: bannedDrift,
      stanceDrift: stanceDrift,
      toneDrift: toneDrift
    }
  };
}

export const calibrationRouter = t.router({
  // ===== TRAINING SAMPLES (Story 2.1) =====

  // List training samples for a client
  listSamples: procedure
    .input(z.object({
      clientId: z.string().min(1),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      
      const results = await brandQueries.getTrainingSamples(ctx.drizzle, input.clientId, input.limit, input.offset);
      const total = await brandQueries.getTrainingSamplesCount(ctx.drizzle, input.clientId);

      const samples: TrainingSampleWithQuality[] = results.map(dbSample => {
        const sample = mapTrainingSample(dbSample);
        return {
          sample,
          qualityBadge: getQualityBadge(sample),
        };
      });

      return {
        samples,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  // Get a single training sample
  getSample: procedure
    .input(z.object({
      sampleId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const result = await brandQueries.getTrainingSampleById(ctx.drizzle, input.sampleId, input.clientId);

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Training sample not found',
        });
      }

      const sample = mapTrainingSample(result);

      return {
        sample,
        qualityBadge: getQualityBadge(sample),
      };
    }),

  // Create training sample from pasted text
  createTextSample: procedure
    .input(z.object({
      clientId: z.string().min(1),
      title: z.string().min(1).max(255),
      content: z.string().min(10).max(100000),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const id = crypto.randomUUID();
      const wordCount = countWords(input.content);
      const charCount = input.content.length;

      await brandQueries.createTrainingSample(ctx.drizzle, {
        id,
        client_id: input.clientId,
        user_id: ctx.userId,
        title: input.title,
        source_type: 'pasted_text',
        word_count: wordCount,
        character_count: charCount,
        extracted_text: input.content,
        status: 'pending'
      });

      // Trigger calibration workflow via CONTENT_ENGINE
      try {
        await ctx.env.CONTENT_ENGINE.fetch('http://engine/api/calibration/start', {
          method: 'POST',
          body: JSON.stringify({
            clientId: input.clientId,
            contentType: 'transcripts',
            content: [sanitizeForLLM(input.content)],
            sampleIds: [id], // Pass sample ID for workflow to mark as analyzed
          }),
        });
      } catch (error: unknown) {
        console.error('Failed to trigger calibration workflow:', error);
      }

      return {
        id,
        title: input.title,
        wordCount,
        status: 'pending' as const,
      };
    }),

  // Get presigned URL for file upload to R2
  getUploadUrl: procedure
    .input(z.object({
      clientId: z.string().min(1),
      filename: z.string().min(1).max(255),
      contentType: z.string().default('application/pdf'),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const timestamp = Date.now();
      const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const r2Key = `brand-samples/${input.clientId}/${timestamp}-${sanitizedFilename}`;

      return {
        r2Key,
        uploadEndpoint: `/api/upload/${encodeURIComponent(r2Key)}`,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }),

  // Get presigned URL for voice upload to R2 (Story R-11: AC1, AC2, AC9)
  getVoiceUploadUrl: procedure
    .input(z.object({
      clientId: z.string().min(1),
      filename: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // AC9: Validate audio extension
      const validExtensions = ['webm', 'mp3', 'wav', 'ogg', 'm4a'];
      const ext = input.filename.split('.').pop()?.toLowerCase() || '';
      if (!validExtensions.includes(ext)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid audio format. Allowed: ${validExtensions.join(', ')}`,
        });
      }

      const timestamp = Date.now();
      const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      // AC2: Voice files stored under voice-samples/{clientId}/ prefix
      const r2Key = `voice-samples/${input.clientId}/${timestamp}-${sanitizedFilename}`;

      return {
        r2Key,
        uploadEndpoint: `/api/upload/${encodeURIComponent(r2Key)}`,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }),

  // Register file after upload to R2
  registerFileSample: procedure
    .input(z.object({
      clientId: z.string().min(1),
      title: z.string().min(1).max(255),
      r2Key: z.string().min(1),
      sourceType: z.enum(['pdf', 'article', 'transcript']),
      fileSize: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const object = await ctx.env.MEDIA.head(input.r2Key);
      if (!object) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Uploaded file not found in storage',
        });
      }

      const id = crypto.randomUUID();

      await brandQueries.createTrainingSample(ctx.drizzle, {
        id,
        client_id: input.clientId,
        user_id: ctx.userId,
        title: input.title,
        source_type: input.sourceType,
        r2_key: input.r2Key,
        status: 'pending'
      });

      try {
        await ctx.env.CONTENT_ENGINE.fetch('http://engine/api/calibration/start', {
          method: 'POST',
          body: JSON.stringify({
            clientId: input.clientId,
            contentType: input.sourceType,
            r2Key: input.r2Key,
            sampleIds: [id], // Pass sample ID for workflow to mark as analyzed
          }),
        });
      } catch (error: unknown) {
        console.error('Failed to trigger calibration workflow:', error);
      }

      return {
        id,
        title: input.title,
        r2Key: input.r2Key,
        status: 'pending' as const,
      };
    }),

  // Delete a training sample
  deleteSample: procedure
    .input(z.object({
      sampleId: z.string().uuid(),
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const result = await brandQueries.getTrainingSampleById(ctx.drizzle, input.sampleId, input.clientId);

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Training sample not found',
        });
      }

      if (result.r2_key) {
        try {
          await ctx.env.MEDIA.delete(result.r2_key);
        } catch (e: unknown) {
          console.error(`Failed to delete R2 object: ${result.r2_key}`, e);
        }
      }

      await brandQueries.deleteTrainingSample(ctx.drizzle, input.sampleId, input.clientId);
      return { success: true };
    }),

  // Get aggregate stats for Brand DNA
  getSampleStats: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const stats = await brandQueries.getTrainingSampleStats(ctx.drizzle, input.clientId);

      return {
        totalSamples: stats?.total_samples ?? 0,
        totalWords: stats?.total_words ?? 0,
        averageQuality: stats?.avg_quality ?? null,
        analyzedCount: stats?.analyzed_count ?? 0,
        pendingCount: stats?.pending_count ?? 0,
        processingCount: stats?.processing_count ?? 0,
        failedCount: stats?.failed_count ?? 0,
        recommendation: (stats?.total_samples ?? 0) < 3
          ? 'Add more samples for better Brand DNA analysis'
          : (stats?.total_samples ?? 0) < 10
          ? 'Good start! More samples will improve accuracy'
          : 'Strong sample set for Brand DNA',
      };
    }),

  // Submit voice note for calibration (Story 2.2)
  // DELEGATED to Engine for centralized extraction
  recordVoice: procedure
    .input(z.object({
      clientId: z.string().min(1),
      audioR2Key: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      
      const expectedPrefix = `voice-samples/${input.clientId}/`;
      if (!input.audioR2Key.startsWith(expectedPrefix)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid audio path: client isolation violation',
        });
      }

      const rateLimitCheck = await brandQueries.getLastVoiceRecordingTime(ctx.drizzle, input.clientId);
      const now = Math.floor(Date.now() / 1000);
      const minInterval = 60;
      if (rateLimitCheck?.last_voice_recording_at &&
          (now - rateLimitCheck.last_voice_recording_at) < minInterval) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Please wait ${minInterval - (now - rateLimitCheck.last_voice_recording_at)} seconds before recording again`,
        });
      }

      // Validate file integrity (Story 1.5-1-3)
      const isValid = await validateAudioFile(ctx, input.audioR2Key);
      if (!isValid) {
        // Cleanup invalid file
        try { await ctx.env.MEDIA.delete(input.audioR2Key); } catch { /* Intentionally empty - error handled silently */ }
        
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid audio file format. File corrupted or type mismatch.',
        });
      }

      // Create sample record FIRST so we have the ID for the workflow
      const recordingId = crypto.randomUUID();
      try {
        await brandQueries.createTrainingSample(ctx.drizzle, {
          id: recordingId,
          client_id: input.clientId,
          user_id: ctx.userId,
          title: `Voice Note ${new Date().toLocaleDateString()}`,
          source_type: 'voice',
          r2_key: input.audioR2Key,
          status: 'processing'
        });

        // Story R-11: AC8 - Update rate limit timestamp
        await brandQueries.updateLastVoiceRecordingTime(ctx.drizzle, input.clientId);
      } catch (dbError) {
        // Story R-11: AC10 - Attempt R2 cleanup if DB insert fails
        try {
          await ctx.env.MEDIA.delete(input.audioR2Key);
        } catch (cleanupError) {
          console.error(`[R2 Cleanup] Failed to delete ${input.audioR2Key}:`, cleanupError);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create voice recording record',
        });
      }

      // Trigger CalibrationWorkflow on Engine with sample ID
      let response: Response;
      try {
        response = await ctx.env.CONTENT_ENGINE.fetch('http://engine/api/calibration/start', {
          method: 'POST',
          body: JSON.stringify({
            clientId: input.clientId,
            contentType: 'voice',
            r2Key: input.audioR2Key,
            sampleIds: [recordingId], // Pass sample ID for workflow to mark as analyzed
          }),
        });
      } catch (error) {
        // Story R-11: AC10 - Attempt R2 cleanup on failure
        try {
          await ctx.env.MEDIA.delete(input.audioR2Key);
        } catch (cleanupError) {
          console.error(`[R2 Cleanup] Failed to delete ${input.audioR2Key}:`, cleanupError);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to trigger voice calibration workflow',
        });
      }

      if (!response.ok) {
        // Story R-11: AC10 - Attempt R2 cleanup on failure
        try {
          await ctx.env.MEDIA.delete(input.audioR2Key);
        } catch (cleanupError) {
          console.error(`[R2 Cleanup] Failed to delete ${input.audioR2Key}:`, cleanupError);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to trigger voice calibration workflow',
        });
      }

      const result = await response.json() as { instanceId: string };

      return {
        calibrationId: result.instanceId,
        recordingId,
        status: 'processing',
        message: 'Voice note is being transcribed and analyzed. This may take a moment.'
      };
    }),

  // Get current voice entities for editing (FR35)
  getVoiceEntities: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const result = await brandQueries.getBrandDNA(ctx.drizzle, input.clientId);

      if (!result || !result.voice_entities) {
        return {
          bannedWords: [] as string[],
          voiceMarkers: [] as string[],
          stances: [] as Array<{ topic: string; position: string }>,
        };
      }

      try {
        const entities = JSON.parse(result.voice_entities);
        return {
          bannedWords: entities.bannedWords || [],
          voiceMarkers: entities.voiceMarkers || [],
          stances: entities.stances || [],
        };
      } catch {
        // Intentionally empty - error handled silently
        return { bannedWords: [], voiceMarkers: [], stances: [] };
      }
    }),

  // Add a banned word (FR35)
  addBannedWord: procedure
    .input(z.object({
      clientId: z.string().min(1),
      word: z.string().min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const dna = await brandQueries.getBrandDNA(ctx.drizzle, input.clientId);

      let entities = { bannedWords: [] as string[], voiceMarkers: [], stances: [] };
      if (dna?.voice_entities) {
        try { entities = JSON.parse(dna.voice_entities); } catch { /* Intentionally empty - error handled silently */ }
      }

      const normalizedWord = input.word.toLowerCase().trim();
      if (entities.bannedWords.includes(normalizedWord)) {
        return { success: true, bannedWords: entities.bannedWords };
      }

      entities.bannedWords.push(normalizedWord);
      await brandQueries.updateBrandDNAEntities(ctx.drizzle, input.clientId, JSON.stringify(entities));

      // Story R-11: AC5, AC6 - Use safeDOSync for graceful failure handling
      const { failed: doSyncFailed } = await safeDOSync(
        ctx, input.clientId, 'addBannedWord',
        { word: normalizedWord, source: 'manual' },
        'addBannedWord'
      );

      return { success: true, bannedWords: entities.bannedWords, doSyncFailed };
    }),

  // Remove a banned word (FR35)
  removeBannedWord: procedure
    .input(z.object({
      clientId: z.string().min(1),
      word: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const dna = await brandQueries.getBrandDNA(ctx.drizzle, input.clientId);

      if (!dna?.voice_entities) return { success: true, bannedWords: [], doSyncFailed: false };

      // Story R-11: AC7 - JSON.parse error handling
      let entities = { bannedWords: [] as string[], voiceMarkers: [] as string[], stances: [] as Array<{ topic: string; position: string }> };
      try {
        entities = JSON.parse(dna.voice_entities);
      } catch (error) {
        console.error(`[JSON Parse] Failed to parse voice_entities for client ${input.clientId}`);
        return { success: true, bannedWords: [], doSyncFailed: false };
      }

      const normalizedWord = input.word.toLowerCase().trim();
      entities.bannedWords = (entities.bannedWords || []).filter((w: string) => w.toLowerCase() !== normalizedWord);

      await brandQueries.updateBrandDNAEntities(ctx.drizzle, input.clientId, JSON.stringify(entities));

      // Story R-11: AC5, AC6 - Use safeDOSync for graceful failure handling
      interface BannedWord { id: string; word: string; }
      const { result: doBannedWords, failed: listFailed } = await safeDOSync<BannedWord[]>(
        ctx, input.clientId, 'listBannedWords', {}, 'listBannedWords'
      );

      let doSyncFailed = listFailed;
      if (!listFailed && doBannedWords) {
        const target = doBannedWords.find(w => w.word.toLowerCase() === normalizedWord);
        if (target) {
          const { failed: removeFailed } = await safeDOSync(
            ctx, input.clientId, 'removeBannedWord', { wordId: target.id }, 'removeBannedWord'
          );
          doSyncFailed = removeFailed;
        }
      }

      return { success: true, bannedWords: entities.bannedWords, doSyncFailed };
    }),

  // Add a voice marker phrase (FR35)
  addVoiceMarker: procedure
    .input(z.object({
      clientId: z.string().min(1),
      phrase: z.string().min(1).max(200),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const dna = await brandQueries.getBrandDNA(ctx.drizzle, input.clientId);

      let entities = { bannedWords: [], voiceMarkers: [] as string[], stances: [] };
      if (dna?.voice_entities) {
        try { entities = JSON.parse(dna.voice_entities); } catch { /* Intentionally empty - error handled silently */ }
      }

      const normalizedPhrase = input.phrase.toLowerCase().trim();
      if (entities.voiceMarkers.includes(normalizedPhrase)) {
        return { success: true, voiceMarkers: entities.voiceMarkers };
      }

      entities.voiceMarkers.push(normalizedPhrase);
      await brandQueries.updateBrandDNAEntities(ctx.drizzle, input.clientId, JSON.stringify(entities));

      // Story R-11: AC5, AC6 - Use safeDOSync for graceful failure handling
      const { failed: doSyncFailed } = await safeDOSync(
        ctx, input.clientId, 'addVoiceMarker',
        { phrase: normalizedPhrase, source: 'manual' },
        'addVoiceMarker'
      );

      return { success: true, voiceMarkers: entities.voiceMarkers, doSyncFailed };
    }),

  // Remove a voice marker phrase (FR35)
  removeVoiceMarker: procedure
    .input(z.object({
      clientId: z.string().min(1),
      phrase: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const dna = await brandQueries.getBrandDNA(ctx.drizzle, input.clientId);

      if (!dna?.voice_entities) return { success: true, voiceMarkers: [], doSyncFailed: false };

      // Story R-11: AC7 - JSON.parse error handling
      let entities = { bannedWords: [] as string[], voiceMarkers: [] as string[], stances: [] as Array<{ topic: string; position: string }> };
      try {
        entities = JSON.parse(dna.voice_entities);
      } catch (error) {
        console.error(`[JSON Parse] Failed to parse voice_entities for client ${input.clientId}`);
        return { success: true, voiceMarkers: [], doSyncFailed: false };
      }

      const normalizedPhrase = input.phrase.toLowerCase().trim();
      entities.voiceMarkers = (entities.voiceMarkers || []).filter((p: string) => p.toLowerCase() !== normalizedPhrase);

      await brandQueries.updateBrandDNAEntities(ctx.drizzle, input.clientId, JSON.stringify(entities));

      // Story R-11: AC5, AC6 - Use safeDOSync for graceful failure handling
      interface VoiceMarker { id: string; phrase: string; }
      const { result: doMarkers, failed: listFailed } = await safeDOSync<VoiceMarker[]>(
        ctx, input.clientId, 'listVoiceMarkers', {}, 'listVoiceMarkers'
      );

      let doSyncFailed = listFailed;
      if (!listFailed && doMarkers) {
        const target = doMarkers.find(m => m.phrase.toLowerCase() === normalizedPhrase);
        if (target) {
          const { failed: removeFailed } = await safeDOSync(
            ctx, input.clientId, 'removeVoiceMarker', { markerId: target.id }, 'removeVoiceMarker'
          );
          doSyncFailed = removeFailed;
        }
      }

      return { success: true, voiceMarkers: entities.voiceMarkers, doSyncFailed };
    }),

  // Get Brand DNA for a client (basic stats)
  // FIX: Changed to read from D1 instead of DO to match getBrandDNAReport source
  getBrandDNA: procedure
    .input(z.object({ clientId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Read from D1 (source of truth after CalibrationWorkflow syncs)
      const dna = await brandQueries.getBrandDNA(ctx.drizzle, input.clientId);

      if (!dna) {
        // Return minimal valid response for empty state
        return {
          strengthScore: 0, // UI expects strengthScore for header display
          dnaStrength: 0,
          currentZER: 0,
          voiceBaseline: null,
          movingAverageSimilarity: null,
          voiceDrift: false,
          timeToDNA: null,
          recentHubs: [],
        };
      }

      // Parse tone_profile for voice baseline if available
      let voiceBaseline: number | null = null;
      try {
        const toneProfile = JSON.parse(dna.tone_profile || '{}');
        // Calculate baseline as average of tone dimensions
        const values = Object.values(toneProfile).filter((v): v is number => typeof v === 'number');
        if (values.length > 0) {
          voiceBaseline = values.reduce((a, b) => a + b, 0) / values.length / 100;
        }
      } catch {
        // Ignore parse errors
      }

      const strengthScore = dna.strength_score || 0;
      return {
        strengthScore, // UI expects this for header display
        dnaStrength: strengthScore, // Alias for backwards compatibility
        currentZER: 0, // TODO: Calculate from approved spokes if needed
        voiceBaseline,
        movingAverageSimilarity: null,
        voiceDrift: false,
        timeToDNA: null,
        recentHubs: [],
      };
    }),

  // Analyze training samples and generate Brand DNA profile
  // DELEGATED to Engine
  analyzeDNA: procedure
    .input(z.object({ clientId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const samples = await brandQueries.getTrainingSamplesWithExtractedText(ctx.drizzle, input.clientId);
      if (samples.length < 3) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `At least 3 training samples required. You have ${samples.length}.`,
        });
      }

      // Extract sample IDs to pass to workflow for D1 status updates
      const sampleIds = samples.map(s => s.id);

      const response = await ctx.env.CONTENT_ENGINE.fetch('http://engine/api/calibration/start', {
        method: 'POST',
        body: JSON.stringify({
          clientId: input.clientId,
          contentType: 'posts', // Mixed content
          content: samples.map(s => sanitizeForLLM(s.extracted_text || '')).filter(Boolean),
          sampleIds, // Pass sample IDs for workflow to mark as analyzed
        }),
      });

      if (!response.ok) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to start analysis workflow' });
      }

      return { success: true, message: 'Analysis started in background' };
    }),

  // Get Brand DNA Report with full breakdown
  getBrandDNAReport: procedure
    .input(z.object({ clientId: z.string().min(1) }))
    .query(async ({ ctx, input }): Promise<BrandDNAReport | null> => {
      await assertClientAccess(ctx, input.clientId);
      const dna = await brandQueries.getBrandDNA(ctx.drizzle, input.clientId);

      if (!dna) return null;

      // Story R-11: AC7 - JSON.parse error handling for all DB fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let toneProfile: any = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let signaturePhrases: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let topicsToAvoid: any[] = [];

      try {
        toneProfile = JSON.parse(dna.tone_profile || '{}');
      } catch (e) {
        console.error(`[JSON Parse] Failed to parse tone_profile for client ${input.clientId}`);
      }

      try {
        const parsedPatterns = JSON.parse(dna.signature_patterns || '[]');
        // Normalize: Convert plain strings to SignaturePhrase objects if needed
        signaturePhrases = parsedPatterns.map((item: string | { phrase: string; example?: string }) => {
          if (typeof item === 'string') {
            return { phrase: item, example: '' };
          }
          return item;
        });
      } catch (e) {
        console.error(`[JSON Parse] Failed to parse signature_patterns for client ${input.clientId}`);
      }

      try {
        topicsToAvoid = JSON.parse(dna.topics_to_avoid || '[]');
      } catch (e) {
        console.error(`[JSON Parse] Failed to parse topics_to_avoid for client ${input.clientId}`);
      }

      // FIX: Map CalibrationWorkflow toneProfile keys to UI breakdown keys
      // Workflow stores: formal_casual, serious_playful, technical_accessible, reserved_expressive
      // UI expects: tone_match, vocabulary, structure, topics
      const breakdown = {
        tone_match: toneProfile.formal_casual ?? toneProfile.tone_match ?? 0,
        vocabulary: toneProfile.technical_accessible ?? toneProfile.vocabulary ?? 0,
        structure: toneProfile.serious_playful ?? toneProfile.structure ?? 0,
        topics: toneProfile.reserved_expressive ?? toneProfile.topics ?? 0,
      };

      const report: BrandDNAReport = {
        strengthScore: dna.strength_score || 0,
        status: (dna.strength_score || 0) >= 80 ? 'strong' : (dna.strength_score || 0) >= 70 ? 'good' : 'needs_training',
        primaryTone: dna.primary_tone,
        writingStyle: dna.writing_style,
        targetAudience: dna.target_audience,
        signaturePhrases,
        topicsToAvoid,
        breakdown,
        recommendations: [],
        sampleCount: dna.sample_count || 0,
        lastCalibration: {
          source: (dna.calibration_source as CalibrationSource) || 'manual',
          timestamp: dna.last_calibration_at?.getTime() || 0,
        },
      };

      return report;
    }),

  // Story R-11: AC4 - Auth checks on stub procedures
  getDriftStatus: procedure
    .input(z.object({ clientId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      
      // Get baseline snapshot (most recent)
      const baselineSnapshot = await ctx.drizzle
        .select()
        .from(schema.brand_dna_snapshots)
        .where(eq(schema.brand_dna_snapshots.client_id, input.clientId))
        .orderBy(desc(schema.brand_dna_snapshots.created_at))
        .limit(1)
        .get();

      if (!baselineSnapshot) {
        return {
          driftScore: 0,
          status: 'stable',
          lastCheck: Date.now(),
          needsCalibration: false,
          trigger: undefined as string | undefined,
          suggestion: undefined as string | undefined
        };
      }

      // Get current Brand DNA
      const currentDNA = await brandQueries.getBrandDNA(ctx.drizzle, input.clientId);
      if (!currentDNA) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Brand DNA not found' });
      }

      // Get client settings for threshold
      const clientSettings = await ctx.drizzle
        .select({ drift_threshold: schema.clients.drift_threshold })
        .from(schema.clients)
        .where(eq(schema.clients.id, input.clientId))
        .get();
      
      const threshold = clientSettings?.drift_threshold ?? 25;

      // Parse baseline components
      const baseline: DriftComponent = {
        voiceMarkers: baselineSnapshot.voice_markers ? JSON.parse(baselineSnapshot.voice_markers) : [],
        bannedWords: baselineSnapshot.banned_words ? JSON.parse(baselineSnapshot.banned_words) : [],
        stances: baselineSnapshot.stances ? JSON.parse(baselineSnapshot.stances) : [],
        primaryTone: baselineSnapshot.primary_tone,
      };

      // Parse current components
      let currentEntities = { voiceMarkers: [], bannedWords: [], stances: [] };
      try {
        if (currentDNA.voice_entities) {
          currentEntities = JSON.parse(currentDNA.voice_entities);
        }
      } catch (e) {
        console.error(`Failed to parse voice_entities for drift check: ${input.clientId}`);
      }

      const current: DriftComponent = {
        voiceMarkers: currentEntities.voiceMarkers || [],
        bannedWords: currentEntities.bannedWords || [],
        stances: currentEntities.stances || [],
        primaryTone: currentDNA.primary_tone,
      };

      const result = calculateDrift(baseline, current, threshold);

      return {
        driftScore: result.driftScore,
        status: result.needsCalibration ? 'drifted' : 'stable',
        lastCheck: Date.now(),
        needsCalibration: result.needsCalibration,
        trigger: result.trigger,
        suggestion: result.suggestion,
        components: result.components
      };
    }),

  createDNASnapshot: procedure
    .input(z.object({ clientId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      
      const dna = await brandQueries.getBrandDNA(ctx.drizzle, input.clientId);
      if (!dna) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Brand DNA not found' });
      }

      let entities = { voiceMarkers: [], bannedWords: [], stances: [] };
      try {
        if (dna.voice_entities) {
          entities = JSON.parse(dna.voice_entities);
        }
      } catch (e) {
        console.warn('Failed to parse voice entities for snapshot');
      }

      const snapshotId = crypto.randomUUID();
      await ctx.drizzle.insert(schema.brand_dna_snapshots).values({
        id: snapshotId,
        client_id: input.clientId,
        voice_markers: JSON.stringify(entities.voiceMarkers || []),
        banned_words: JSON.stringify(entities.bannedWords || []),
        stances: JSON.stringify(entities.stances || []),
        primary_tone: dna.primary_tone,
        writing_style: dna.writing_style,
        target_audience: dna.target_audience,
        strength_score: dna.strength_score,
        created_at: new Date(), // D1 will store as integer/text depending on setup
      }).run();

      return { success: true, snapshotId };
    }),
});
