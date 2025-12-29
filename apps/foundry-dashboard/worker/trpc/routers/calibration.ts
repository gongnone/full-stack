import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import type {
  TrainingSample,
  TrainingSampleWithQuality,
  BrandDNA,
  BrandDNABreakdown,
  BrandDNAReport,
  BrandDNAAnalysisResult,
  SignaturePhrase,
} from '../../types';
import { assertClientAccess } from '../middleware/client-access';
import * as brandQueries from '@repo/data-ops/queries/brand';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// ===== Helper to calculate quality badge from score =====
function getQualityBadge(sample: TrainingSample): TrainingSampleWithQuality['qualityBadge'] {
  if (sample.status === 'pending' || sample.status === 'processing') {
    return 'pending';
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

      const samples: TrainingSampleWithQuality[] = results.map(sample => ({
        sample: sample as unknown as TrainingSample,
        qualityBadge: getQualityBadge(sample as unknown as TrainingSample),
      }));

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
      const sample = await brandQueries.getTrainingSampleById(ctx.drizzle, input.sampleId, input.clientId);

      if (!sample) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Training sample not found',
        });
      }

      return {
        sample: sample as unknown as TrainingSample,
        qualityBadge: getQualityBadge(sample as unknown as TrainingSample),
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
            content: [input.content],
          }),
        });
      } catch (error) {
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
          }),
        });
      } catch (error) {
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
      const sample = await brandQueries.getTrainingSampleById(ctx.drizzle, input.sampleId, input.clientId);

      if (!sample) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Training sample not found',
        });
      }

      if (sample.r2_key) {
        try {
          await ctx.env.MEDIA.delete(sample.r2_key);
        } catch (e) {
          console.error(`Failed to delete R2 object: ${sample.r2_key}`, e);
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

      // Trigger CalibrationWorkflow on Engine
      const response = await ctx.env.CONTENT_ENGINE.fetch('http://engine/api/calibration/start', {
        method: 'POST',
        body: JSON.stringify({
          clientId: input.clientId,
          contentType: 'voice',
          r2Key: input.audioR2Key,
        }),
      });

      if (!response.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to trigger voice calibration workflow',
        });
      }

      const result = await response.json() as { instanceId: string };

      // Create a pending sample record
      const recordingId = crypto.randomUUID();
      await brandQueries.createTrainingSample(ctx.drizzle, {
        id: recordingId,
        client_id: input.clientId,
        user_id: ctx.userId,
        title: `Voice Note ${new Date().toLocaleDateString()}`,
        source_type: 'voice',
        r2_key: input.audioR2Key,
        status: 'processing'
      });

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
        try { entities = JSON.parse(dna.voice_entities); } catch {}
      }

      const normalizedWord = input.word.toLowerCase().trim();
      if (entities.bannedWords.includes(normalizedWord)) {
        return { success: true, bannedWords: entities.bannedWords };
      }

      entities.bannedWords.push(normalizedWord);
      await brandQueries.updateBrandDNAEntities(ctx.drizzle, input.clientId, JSON.stringify(entities));

      // Also sync to DO
      await ctx.callAgent(input.clientId, 'addBannedWord', { word: normalizedWord, source: 'manual' });

      return { success: true, bannedWords: entities.bannedWords };
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

      if (!dna?.voice_entities) return { success: true, bannedWords: [] };

      let entities = JSON.parse(dna.voice_entities);
      const normalizedWord = input.word.toLowerCase().trim();
      entities.bannedWords = (entities.bannedWords || []).filter((w: string) => w.toLowerCase() !== normalizedWord);

      await brandQueries.updateBrandDNAEntities(ctx.drizzle, input.clientId, JSON.stringify(entities));
      
      // Sync to DO - find the ID first
      const doBannedWords = await ctx.callAgent<any[]>(input.clientId, 'listBannedWords', {});
      const target = doBannedWords.find(w => w.word.toLowerCase() === normalizedWord);
      if (target) {
        await ctx.callAgent(input.clientId, 'removeBannedWord', { wordId: target.id });
      }

      return { success: true, bannedWords: entities.bannedWords };
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
        try { entities = JSON.parse(dna.voice_entities); } catch {}
      }

      const normalizedPhrase = input.phrase.toLowerCase().trim();
      if (entities.voiceMarkers.includes(normalizedPhrase)) {
        return { success: true, voiceMarkers: entities.voiceMarkers };
      }

      entities.voiceMarkers.push(normalizedPhrase);
      await brandQueries.updateBrandDNAEntities(ctx.drizzle, input.clientId, JSON.stringify(entities));

      // Sync to DO
      await ctx.callAgent(input.clientId, 'addVoiceMarker', { phrase: normalizedPhrase, source: 'manual' });

      return { success: true, voiceMarkers: entities.voiceMarkers };
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

      if (!dna?.voice_entities) return { success: true, voiceMarkers: [] };

      let entities = JSON.parse(dna.voice_entities);
      const normalizedPhrase = input.phrase.toLowerCase().trim();
      entities.voiceMarkers = (entities.voiceMarkers || []).filter((p: string) => p.toLowerCase() !== normalizedPhrase);

      await brandQueries.updateBrandDNAEntities(ctx.drizzle, input.clientId, JSON.stringify(entities));

      // Sync to DO
      const doMarkers = await ctx.callAgent<any[]>(input.clientId, 'listVoiceMarkers', {});
      const target = doMarkers.find(m => m.phrase.toLowerCase() === normalizedPhrase);
      if (target) {
        await ctx.callAgent(input.clientId, 'removeVoiceMarker', { markerId: target.id });
      }

      return { success: true, voiceMarkers: entities.voiceMarkers };
    }),

  // Get Brand DNA for a client (basic stats)
  getBrandDNA: procedure
    .input(z.object({ clientId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const result = await ctx.callAgent<any>(input.clientId, 'getDNAReport', {});
      return result;
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

      const response = await ctx.env.CONTENT_ENGINE.fetch('http://engine/api/calibration/start', {
        method: 'POST',
        body: JSON.stringify({
          clientId: input.clientId,
          contentType: 'posts', // Mixed content
          content: samples.map(s => s.extracted_text).filter(Boolean)
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

      const toneProfile = JSON.parse(dna.tone_profile || '{}');
      const signaturePhrases = JSON.parse(dna.signature_patterns || '[]');
      const topicsToAvoid = JSON.parse(dna.topics_to_avoid || '[]');

      return {
        strengthScore: dna.strength_score || 0,
        status: (dna.strength_score || 0) >= 80 ? 'strong' : (dna.strength_score || 0) >= 70 ? 'good' : 'needs_training',
        primaryTone: dna.primary_tone,
        writing_style: dna.writing_style, // Compatibility with type
        target_audience: dna.target_audience,
        signaturePhrases,
        topicsToAvoid,
        breakdown: {
          tone_match: toneProfile.tone_match ?? 0,
          vocabulary: toneProfile.vocabulary ?? 0,
          structure: toneProfile.structure ?? 0,
          topics: toneProfile.topics ?? 0,
        },
        recommendations: [], // Can be calculated here or in engine
        sampleCount: dna.sample_count,
        lastCalibration: {
          source: dna.calibration_source as any,
          timestamp: dna.last_calibration_at?.toISOString() || null,
        },
      } as any;
    }),
});