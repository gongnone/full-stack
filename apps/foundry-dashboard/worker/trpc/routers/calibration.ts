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

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Helper to calculate quality badge from score
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

// Helper to count words in text
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Story 2.3 & 2.4: Calculate Brand DNA strength score from analysis results
interface AnalysisData {
  primary_tone: string | null;
  writing_style: string | null;
  target_audience: string | null;
  signature_phrases: SignaturePhrase[]; // Story 2.4: Now includes example usage
  topics_to_avoid: string[]; // Story 2.4: Words/topics to avoid (red pills)
}

function calculateStrengthScore(
  data: AnalysisData,
  sampleCount: number
): { total: number; breakdown: BrandDNABreakdown } {
  // Component scoring (0-100 each, weighted)
  // Tone Match: Did we detect a primary tone?
  const toneMatch = data.primary_tone ? 90 : 40;

  // Vocabulary: Based on signature phrases detected
  const vocabulary =
    (data.signature_phrases?.length ?? 0) >= 5
      ? 85
      : (data.signature_phrases?.length ?? 0) >= 3
        ? 70
        : 50;

  // Structure: Did we detect a writing style?
  const structure = data.writing_style ? 80 : 50;

  // Topics: Did we detect target audience?
  const topics = data.target_audience ? 85 : 50;

  // Coverage bonus for more samples (up to +10%)
  const coverageBonus = Math.min(sampleCount * 2, 10);

  // Weighted calculation: Tone 30% + Vocabulary 30% + Structure 25% + Topics 15%
  const total = Math.round(
    toneMatch * 0.3 + vocabulary * 0.3 + structure * 0.25 + topics * 0.15 + coverageBonus
  );

  return {
    total: Math.min(total, 100),
    breakdown: {
      tone_match: toneMatch,
      vocabulary,
      structure,
      topics,
    },
  };
}

export const calibrationRouter = t.router({
  // ===== TRAINING SAMPLES (Story 2.1) =====

  // List training samples for a client
  listSamples: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Rule 1: Isolation Above All - always filter by clientId
      const result = await ctx.db
        .prepare(`
          SELECT * FROM training_samples
          WHERE client_id = ?
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `)
        .bind(input.clientId, input.limit, input.offset)
        .all<TrainingSample>();

      const countResult = await ctx.db
        .prepare('SELECT COUNT(*) as total FROM training_samples WHERE client_id = ?')
        .bind(input.clientId)
        .first<{ total: number }>();

      const samples: TrainingSampleWithQuality[] = (result.results || []).map(sample => ({
        sample,
        qualityBadge: getQualityBadge(sample),
      }));

      return {
        samples,
        total: countResult?.total ?? 0,
        hasMore: (countResult?.total ?? 0) > input.offset + input.limit,
      };
    }),

  // Get a single training sample
  getSample: procedure
    .input(z.object({
      sampleId: z.string().uuid(),
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const sample = await ctx.db
        .prepare('SELECT * FROM training_samples WHERE id = ? AND client_id = ?')
        .bind(input.sampleId, input.clientId)
        .first<TrainingSample>();

      if (!sample) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Training sample not found',
        });
      }

      return {
        sample,
        qualityBadge: getQualityBadge(sample),
      };
    }),

  // Create training sample from pasted text
  createTextSample: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      title: z.string().min(1).max(255),
      content: z.string().min(10).max(100000), // 10 chars to 100k chars
    }))
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      const wordCount = countWords(input.content);
      const charCount = input.content.length;

      await ctx.db
        .prepare(`
          INSERT INTO training_samples (
            id, client_id, user_id, title, source_type,
            word_count, character_count, extracted_text, status
          ) VALUES (?, ?, ?, ?, 'pasted_text', ?, ?, ?, 'pending')
        `)
        .bind(
          id,
          input.clientId,
          ctx.userId,
          input.title,
          wordCount,
          charCount,
          input.content
        )
        .run();

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
      clientId: z.string().uuid(),
      filename: z.string().min(1).max(255),
      contentType: z.string().default('application/pdf'),
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate unique R2 key with client isolation
      const timestamp = Date.now();
      const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const r2Key = `brand-samples/${input.clientId}/${timestamp}-${sanitizedFilename}`;

      // For now, we'll handle uploads via a separate endpoint
      // R2 presigned URLs require Workers for Platforms or custom implementation
      // We'll use a direct upload approach via the worker

      return {
        r2Key,
        uploadEndpoint: `/api/upload/${encodeURIComponent(r2Key)}`,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }),

  // Register file after upload to R2
  registerFileSample: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      title: z.string().min(1).max(255),
      r2Key: z.string().min(1),
      sourceType: z.enum(['pdf', 'article', 'transcript']),
      fileSize: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the file exists in R2
      const object = await ctx.env.MEDIA.head(input.r2Key);
      if (!object) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Uploaded file not found in storage',
        });
      }

      const id = crypto.randomUUID();

      await ctx.db
        .prepare(`
          INSERT INTO training_samples (
            id, client_id, user_id, title, source_type, r2_key, status
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `)
        .bind(
          id,
          input.clientId,
          ctx.userId,
          input.title,
          input.sourceType,
          input.r2Key
        )
        .run();

      // TODO: Trigger content extraction workflow via CONTENT_ENGINE
      // This would parse PDF, count words, extract text, etc.

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
      clientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get sample to check ownership and get r2Key
      const sample = await ctx.db
        .prepare('SELECT * FROM training_samples WHERE id = ? AND client_id = ?')
        .bind(input.sampleId, input.clientId)
        .first<TrainingSample>();

      if (!sample) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Training sample not found',
        });
      }

      // Delete from R2 if it has an r2Key
      if (sample.r2_key) {
        try {
          await ctx.env.MEDIA.delete(sample.r2_key);
        } catch {
          // Log but don't fail if R2 delete fails
          console.error(`Failed to delete R2 object: ${sample.r2_key}`);
        }
      }

      // Delete from database
      await ctx.db
        .prepare('DELETE FROM training_samples WHERE id = ? AND client_id = ?')
        .bind(input.sampleId, input.clientId)
        .run();

      return { success: true };
    }),

  // Get aggregate stats for Brand DNA
  getSampleStats: procedure
    .input(z.object({
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db
        .prepare(`
          SELECT
            COUNT(*) as total_samples,
            SUM(word_count) as total_words,
            AVG(quality_score) as avg_quality,
            COUNT(CASE WHEN status = 'analyzed' THEN 1 END) as analyzed_count,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
            COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_count,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
          FROM training_samples
          WHERE client_id = ?
        `)
        .bind(input.clientId)
        .first<{
          total_samples: number;
          total_words: number;
          avg_quality: number | null;
          analyzed_count: number;
          pending_count: number;
          processing_count: number;
          failed_count: number;
        }>();

      return {
        totalSamples: stats?.total_samples ?? 0,
        totalWords: stats?.total_words ?? 0,
        averageQuality: stats?.avg_quality ?? null,
        analyzedCount: stats?.analyzed_count ?? 0,
        pendingCount: stats?.pending_count ?? 0,
        processingCount: stats?.processing_count ?? 0,
        failedCount: stats?.failed_count ?? 0,
        // Recommendation based on sample count
        recommendation: (stats?.total_samples ?? 0) < 3
          ? 'Add more samples for better Brand DNA analysis'
          : (stats?.total_samples ?? 0) < 10
          ? 'Good start! More samples will improve accuracy'
          : 'Strong sample set for Brand DNA',
      };
    }),

  // ===== EXISTING CALIBRATION ENDPOINTS =====

  // Upload existing content for Brand DNA analysis
  uploadContent: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      content: z.array(z.string()),
      contentType: z.enum(['posts', 'articles', 'transcripts']),
    }))
    .mutation(async ({ ctx, input }) => {
      const analysisId = crypto.randomUUID();

      // TODO: Trigger CalibrationWorkflow via CONTENT_ENGINE

      return {
        analysisId,
        status: 'processing' as const,
      };
    }),

  // Submit voice note for calibration (Story 2.2)
  recordVoice: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      audioR2Key: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const calibrationId = crypto.randomUUID();

      // Security: Validate R2 key belongs to this client (prevent cross-client access)
      const expectedPrefix = `voice-samples/${input.clientId}/`;
      if (!input.audioR2Key.startsWith(expectedPrefix)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid audio path: client isolation violation',
        });
      }

      // Rate limiting: Check last voice recording timestamp (max 1 per minute)
      const rateLimitCheck = await ctx.db
        .prepare('SELECT last_voice_recording_at FROM brand_dna WHERE client_id = ?')
        .bind(input.clientId)
        .first<{ last_voice_recording_at: number }>();

      const now = Math.floor(Date.now() / 1000);
      const minInterval = 60; // 60 seconds between recordings
      if (rateLimitCheck?.last_voice_recording_at &&
          (now - rateLimitCheck.last_voice_recording_at) < minInterval) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Please wait ${minInterval - (now - rateLimitCheck.last_voice_recording_at)} seconds before recording again`,
        });
      }

      // Verify the audio file exists in R2
      const audioObject = await ctx.env.MEDIA.get(input.audioR2Key);
      if (!audioObject) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Voice recording not found in storage',
        });
      }

      // Backend audio duration validation: Max 60 seconds (~10MB for WebM at 128kbps)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (audioObject.size > maxFileSize) {
        // Clean up oversized file
        await ctx.env.MEDIA.delete(input.audioR2Key);
        throw new TRPCError({
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Audio file too large. Maximum recording is 60 seconds.',
        });
      }

      // Get audio data as ArrayBuffer for Whisper
      const audioData = await audioObject.arrayBuffer();

      // Use Workers AI Whisper for transcription
      let transcript = '';
      try {
        const inputs = {
          audio: [...new Uint8Array(audioData)],
        };

        const whisperResult = await ctx.env.AI.run('@cf/openai/whisper', inputs);
        transcript = (whisperResult as { text?: string })?.text || '';
      } catch (error) {
        console.error('Whisper transcription error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to transcribe audio. Please try again.',
        });
      }

      // If we got a transcript, extract entities using LLM
      let entitiesExtracted = {
        bannedWords: [] as string[],
        voiceMarkers: [] as string[],
        stances: [] as Array<{ topic: string; position: string }>,
      };
      let dnaScoreBefore = 0;
      let dnaScoreAfter = 0;

      if (transcript.length > 10) {
        try {
          // Improved entity extraction prompt with structured output
          const extractionPrompt = `You are an expert brand voice analyst. Analyze this voice note transcript and extract the speaker's brand preferences.

TRANSCRIPT:
"${transcript}"

EXTRACTION RULES:
1. bannedWords: Extract ONLY words the speaker EXPLICITLY says to avoid/stop using/never use
   - Look for phrases like "stop using", "don't say", "hate the word", "never use"
   - Example: "I hate corporate jargon like synergy" → ["synergy", "corporate jargon"]

2. voiceMarkers: Extract unique phrases, expressions, or verbal patterns the speaker:
   - Regularly uses or wants to use
   - Considers part of their signature style
   - Example: "I always say 'let's dive in'" → ["let's dive in"]

3. stances: Extract clear opinions/positions on topics
   - Must have both a topic AND a clear position
   - Example: "I believe in radical transparency" → {"topic": "transparency", "position": "radical transparency is essential"}

IMPORTANT: Only extract what is EXPLICITLY stated. Do not infer or assume.
Return ONLY valid JSON with no markdown formatting:
{"bannedWords":[],"voiceMarkers":[],"stances":[]}`;

          const llmResult = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            prompt: extractionPrompt,
            max_tokens: 1024,
          });

          const responseText = (llmResult as { response?: string })?.response;
          if (responseText) {
            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              entitiesExtracted = {
                bannedWords: Array.isArray(parsed.bannedWords) ? parsed.bannedWords : [],
                voiceMarkers: Array.isArray(parsed.voiceMarkers) ? parsed.voiceMarkers : [],
                stances: Array.isArray(parsed.stances) ? parsed.stances : [],
              };
            }
          }
        } catch (error) {
          console.error('Entity extraction error:', error);
        }

        // Get existing DNA score before update
        const existingDNA = await ctx.db
          .prepare('SELECT strength_score, voice_entities FROM brand_dna WHERE client_id = ?')
          .bind(input.clientId)
          .first<{ strength_score: number; voice_entities: string }>();

        dnaScoreBefore = existingDNA?.strength_score ?? 0;

        // Merge new entities with existing ones
        let existingEntities = { bannedWords: [] as string[], voiceMarkers: [] as string[], stances: [] as Array<{ topic: string; position: string }> };
        if (existingDNA?.voice_entities) {
          try {
            existingEntities = JSON.parse(existingDNA.voice_entities);
          } catch { /* ignore parse errors */ }
        }

        // Deduplicate and merge entities
        const mergedEntities = {
          bannedWords: [...new Set([...existingEntities.bannedWords, ...entitiesExtracted.bannedWords])],
          voiceMarkers: [...new Set([...existingEntities.voiceMarkers, ...entitiesExtracted.voiceMarkers])],
          stances: [...existingEntities.stances, ...entitiesExtracted.stances].filter(
            (stance, i, arr) => arr.findIndex(s => s.topic === stance.topic) === i
          ),
        };

        // Calculate DNA score based on merged entity counts
        dnaScoreAfter = Math.min(100,
          (mergedEntities.voiceMarkers.length * 15) +
          (mergedEntities.bannedWords.length * 10) +
          (mergedEntities.stances.length * 20)
        );

        // Persist entities to brand_dna table (upsert)
        await ctx.db
          .prepare(`
            INSERT INTO brand_dna (id, client_id, strength_score, voice_entities, last_voice_recording_at, calibration_source, updated_at)
            VALUES (?, ?, ?, ?, ?, 'voice_note', ?)
            ON CONFLICT(client_id) DO UPDATE SET
              strength_score = MAX(brand_dna.strength_score, excluded.strength_score),
              voice_entities = excluded.voice_entities,
              last_voice_recording_at = excluded.last_voice_recording_at,
              calibration_source = excluded.calibration_source,
              updated_at = excluded.updated_at
          `)
          .bind(
            `dna_${input.clientId}`,
            input.clientId,
            dnaScoreAfter,
            JSON.stringify(mergedEntities),
            now,
            now
          )
          .run();

        // Store voice transcript in Vectorize for semantic search (FR33)
        try {
          const embeddingResult = await ctx.env.AI.run('@cf/baai/bge-base-en-v1.5', {
            text: transcript,
          });

          const vectors = (embeddingResult as { data?: number[][] })?.data;
          if (vectors && vectors[0]) {
            await ctx.env.EMBEDDINGS.upsert([
              {
                id: `voice_transcript_${calibrationId}`,
                values: vectors[0],
                metadata: {
                  type: 'voice_transcript',
                  clientId: input.clientId,
                  calibrationId,
                  timestamp: now,
                },
              },
            ]);
          }
        } catch (error) {
          // Log but don't fail if embedding storage fails
          console.error('Voice Vectorize embedding error:', error);
        }
      }

      // Store the voice recording metadata for later reference
      const recordingId = crypto.randomUUID();
      try {
        await ctx.db
          .prepare(`
            INSERT INTO training_samples (
              id, client_id, user_id, title, source_type, r2_key,
              extracted_text, status, word_count, character_count
            ) VALUES (?, ?, ?, ?, 'voice', ?, ?, 'analyzed', ?, ?)
          `)
          .bind(
            recordingId,
            input.clientId,
            ctx.userId,
            `Voice Note ${new Date().toLocaleDateString()}`,
            input.audioR2Key,
            transcript,
            transcript.split(/\s+/).filter(Boolean).length,
            transcript.length
          )
          .run();
      } catch (error) {
        // Clean up R2 on database failure
        await ctx.env.MEDIA.delete(input.audioR2Key);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save voice recording metadata',
        });
      }

      return {
        calibrationId,
        recordingId,
        transcript,
        entitiesExtracted,
        dnaScoreBefore,
        dnaScoreAfter,
      };
    }),

  // ===== STORY 2.5: VOICE MARKER AND BANNED WORD MANAGEMENT =====

  // Get current voice entities for editing (FR35)
  getVoiceEntities: procedure
    .input(z.object({
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Rule 1: Isolation Above All - always filter by clientId
      const result = await ctx.db
        .prepare(`SELECT voice_entities FROM brand_dna WHERE client_id = ?`)
        .bind(input.clientId)
        .first<{ voice_entities: string | null }>();

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
        return {
          bannedWords: [] as string[],
          voiceMarkers: [] as string[],
          stances: [] as Array<{ topic: string; position: string }>,
        };
      }
    }),

  // Add a banned word (FR35)
  addBannedWord: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      word: z.string().min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get current voice entities
      const result = await ctx.db
        .prepare(`SELECT voice_entities FROM brand_dna WHERE client_id = ?`)
        .bind(input.clientId)
        .first<{ voice_entities: string | null }>();

      let entities = {
        bannedWords: [] as string[],
        voiceMarkers: [] as string[],
        stances: [] as Array<{ topic: string; position: string }>,
      };

      if (result?.voice_entities) {
        try {
          entities = JSON.parse(result.voice_entities);
        } catch {
          // Keep defaults
        }
      }

      // Normalize and check for duplicates (case-insensitive)
      const normalizedWord = input.word.toLowerCase().trim();
      if (entities.bannedWords.map(w => w.toLowerCase()).includes(normalizedWord)) {
        return { success: true, bannedWords: entities.bannedWords };
      }

      // Add the new word
      entities.bannedWords.push(input.word.trim());

      // Update the database
      await ctx.db
        .prepare(`
          UPDATE brand_dna
          SET voice_entities = ?, updated_at = unixepoch(), calibration_source = 'manual'
          WHERE client_id = ?
        `)
        .bind(JSON.stringify(entities), input.clientId)
        .run();

      return { success: true, bannedWords: entities.bannedWords };
    }),

  // Remove a banned word (FR35)
  removeBannedWord: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      word: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .prepare(`SELECT voice_entities FROM brand_dna WHERE client_id = ?`)
        .bind(input.clientId)
        .first<{ voice_entities: string | null }>();

      if (!result?.voice_entities) {
        return { success: true, bannedWords: [] };
      }

      let entities = JSON.parse(result.voice_entities);
      const normalizedWord = input.word.toLowerCase().trim();
      entities.bannedWords = (entities.bannedWords || []).filter(
        (w: string) => w.toLowerCase().trim() !== normalizedWord
      );

      await ctx.db
        .prepare(`
          UPDATE brand_dna
          SET voice_entities = ?, updated_at = unixepoch(), calibration_source = 'manual'
          WHERE client_id = ?
        `)
        .bind(JSON.stringify(entities), input.clientId)
        .run();

      return { success: true, bannedWords: entities.bannedWords };
    }),

  // Add a voice marker phrase (FR35)
  addVoiceMarker: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      phrase: z.string().min(1).max(200),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .prepare(`SELECT voice_entities FROM brand_dna WHERE client_id = ?`)
        .bind(input.clientId)
        .first<{ voice_entities: string | null }>();

      let entities = {
        bannedWords: [] as string[],
        voiceMarkers: [] as string[],
        stances: [] as Array<{ topic: string; position: string }>,
      };

      if (result?.voice_entities) {
        try {
          entities = JSON.parse(result.voice_entities);
        } catch {
          // Keep defaults
        }
      }

      // Check for duplicates (case-insensitive)
      const normalizedPhrase = input.phrase.toLowerCase().trim();
      if (entities.voiceMarkers.map(p => p.toLowerCase()).includes(normalizedPhrase)) {
        return { success: true, voiceMarkers: entities.voiceMarkers };
      }

      // Add the new phrase
      entities.voiceMarkers.push(input.phrase.trim());

      await ctx.db
        .prepare(`
          UPDATE brand_dna
          SET voice_entities = ?, updated_at = unixepoch(), calibration_source = 'manual'
          WHERE client_id = ?
        `)
        .bind(JSON.stringify(entities), input.clientId)
        .run();

      return { success: true, voiceMarkers: entities.voiceMarkers };
    }),

  // Remove a voice marker phrase (FR35)
  removeVoiceMarker: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      phrase: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .prepare(`SELECT voice_entities FROM brand_dna WHERE client_id = ?`)
        .bind(input.clientId)
        .first<{ voice_entities: string | null }>();

      if (!result?.voice_entities) {
        return { success: true, voiceMarkers: [] };
      }

      let entities = JSON.parse(result.voice_entities);
      const normalizedPhrase = input.phrase.toLowerCase().trim();
      entities.voiceMarkers = (entities.voiceMarkers || []).filter(
        (p: string) => p.toLowerCase().trim() !== normalizedPhrase
      );

      await ctx.db
        .prepare(`
          UPDATE brand_dna
          SET voice_entities = ?, updated_at = unixepoch(), calibration_source = 'manual'
          WHERE client_id = ?
        `)
        .bind(JSON.stringify(entities), input.clientId)
        .run();

      return { success: true, voiceMarkers: entities.voiceMarkers };
    }),

  // Get current drift status and calibration recommendation
  getDriftStatus: procedure
    .input(z.object({
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // TODO: Calculate drift from Durable Object

      return {
        driftScore: 0,
        needsCalibration: false,
        trigger: undefined as string | undefined,
        suggestion: undefined as string | undefined,
      };
    }),

  // Get upload URL for voice recording (Story 2.2)
  getVoiceUploadUrl: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      filename: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate unique R2 key with client isolation
      const timestamp = Date.now();
      const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const r2Key = `voice-samples/${input.clientId}/${timestamp}-${sanitizedFilename}`;

      return {
        r2Key,
        uploadEndpoint: `/api/upload/${encodeURIComponent(r2Key)}`,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }),

  // Get Brand DNA for a client (basic stats - legacy endpoint)
  getBrandDNA: procedure
    .input(z.object({
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Get all analyzed training samples to compute DNA
      const samples = await ctx.db
        .prepare(`
          SELECT * FROM training_samples
          WHERE client_id = ? AND status = 'analyzed'
          ORDER BY created_at DESC
          LIMIT 50
        `)
        .bind(input.clientId)
        .all<TrainingSample>();

      // Compute basic stats
      const sampleCount = samples.results?.length ?? 0;
      const totalWords = samples.results?.reduce((sum, s) => sum + (s.word_count || 0), 0) ?? 0;

      // DNA strength based on samples and diversity
      let dnaStrength = Math.min(100,
        (sampleCount >= 3 ? 30 : sampleCount * 10) +
        (sampleCount >= 5 ? 20 : 0) +
        (totalWords >= 1000 ? 25 : Math.floor(totalWords / 40)) +
        (samples.results?.some(s => s.source_type === 'voice') ? 25 : 0)
      );

      return {
        dnaStrength,
        sampleCount,
        totalWords,
        hasVoiceSamples: samples.results?.some(s => s.source_type === 'voice') ?? false,
        lastCalibration: samples.results?.[0]?.created_at
          ? new Date(samples.results[0].created_at).toISOString()
          : null,
        recommendation: dnaStrength < 30
          ? 'Add more training samples or record a voice note to improve Brand DNA'
          : dnaStrength < 60
          ? 'Good start! Adding voice samples will significantly improve accuracy'
          : dnaStrength < 80
          ? 'Strong Brand DNA foundation. Consider adding more diverse content types'
          : 'Excellent Brand DNA profile. System is well-calibrated for your voice',
      };
    }),

  // ===== STORY 2.3: BRAND DNA ANALYSIS & SCORING =====

  // Analyze training samples and generate Brand DNA profile (AC1)
  analyzeDNA: procedure
    .input(
      z.object({
        clientId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<BrandDNAAnalysisResult> => {
      // Rule 1: Isolation Above All - always filter by clientId
      // Fetch all training samples with extracted text
      const samplesResult = await ctx.db
        .prepare(
          `
          SELECT * FROM training_samples
          WHERE client_id = ? AND extracted_text IS NOT NULL AND extracted_text != ''
          ORDER BY created_at DESC
          LIMIT 50
        `
        )
        .bind(input.clientId)
        .all<TrainingSample>();

      const samples = samplesResult.results || [];

      // AC1: Require at least 3 training samples
      if (samples.length < 3) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `At least 3 training samples with content required. You have ${samples.length}.`,
        });
      }

      // Aggregate all sample content for analysis
      const aggregatedContent = samples
        .map((s) => s.extracted_text)
        .filter(Boolean)
        .join('\n\n---\n\n');

      // Task 3: Workers AI analysis pipeline using 70B model for quality
      // Story 2.4: Enhanced prompt to extract phrase examples and topics to avoid
      const analysisPrompt = `You are a brand voice analyst. Analyze the following content samples and extract the brand voice profile.

CONTENT TO ANALYZE:
${aggregatedContent.slice(0, 12000)}

EXTRACT THE FOLLOWING (be specific and concise):
1. primary_tone: The dominant emotional tone (e.g., "Candid & Direct", "Warm & Approachable", "Professional & Authoritative")
2. writing_style: How they write (e.g., "Conversational", "Technical", "Story-driven", "Data-focused")
3. target_audience: Who they're speaking to (e.g., "B2B SaaS founders", "Creative professionals", "Marketing teams")
4. signature_phrases: Array of 5-10 objects with the recurring phrase AND an example sentence from the content showing how it's used
5. topics_to_avoid: Array of words, phrases, or topics that should be AVOIDED based on the brand voice (e.g., corporate jargon, clichés, or terms that don't fit the tone)

Return ONLY valid JSON (no markdown, no explanation):
{
  "primary_tone": "string",
  "writing_style": "string",
  "target_audience": "string",
  "signature_phrases": [{"phrase": "phrase1", "example": "Full sentence from content using this phrase"}, ...],
  "topics_to_avoid": ["word1", "phrase2", ...]
}`;

      let analysisData: AnalysisData = {
        primary_tone: null,
        writing_style: null,
        target_audience: null,
        signature_phrases: [],
        topics_to_avoid: [],
      };

      try {
        // Note: Using 8B model for faster inference. For production, consider upgrading to 70B
        const llmResult = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt: analysisPrompt,
          max_tokens: 2048, // Increased for richer responses with examples
        });

        const responseText = (llmResult as { response?: string })?.response;
        if (responseText) {
          // Extract JSON from response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            // Story 2.4: Parse signature phrases with examples
            let signaturePhrases: SignaturePhrase[] = [];
            if (Array.isArray(parsed.signature_phrases)) {
              signaturePhrases = parsed.signature_phrases
                .slice(0, 10)
                .map((item: unknown) => {
                  // Handle both old format (string) and new format ({phrase, example})
                  if (typeof item === 'string') {
                    return { phrase: item, example: '' };
                  }
                  if (typeof item === 'object' && item !== null) {
                    const obj = item as { phrase?: string; example?: string };
                    return {
                      phrase: obj.phrase || '',
                      example: obj.example || '',
                    };
                  }
                  return null;
                })
                .filter((p: SignaturePhrase | null): p is SignaturePhrase => p !== null && p.phrase.length > 0);
            }

            // Story 2.4: Parse topics to avoid
            const topicsToAvoid: string[] = Array.isArray(parsed.topics_to_avoid)
              ? parsed.topics_to_avoid.filter((t: unknown): t is string => typeof t === 'string').slice(0, 20)
              : [];

            analysisData = {
              primary_tone: parsed.primary_tone || null,
              writing_style: parsed.writing_style || null,
              target_audience: parsed.target_audience || null,
              signature_phrases: signaturePhrases,
              topics_to_avoid: topicsToAvoid,
            };
          }
        }
      } catch (error) {
        console.error('Brand DNA analysis error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze content. Please try again.',
        });
      }

      // Task 4: Calculate strength score
      const strengthResult = calculateStrengthScore(analysisData, samples.length);

      // Task 5: Generate and store Vectorize embeddings for brand voice
      try {
        const embeddingText = [
          analysisData.primary_tone,
          analysisData.writing_style,
          analysisData.target_audience,
          // Story 2.4: Extract just the phrase strings for embedding
          ...(analysisData.signature_phrases || []).map((p) => p.phrase),
        ]
          .filter(Boolean)
          .join(' ');

        if (embeddingText.length > 10) {
          const embeddingResult = await ctx.env.AI.run('@cf/baai/bge-base-en-v1.5', {
            text: embeddingText,
          });

          // Store in Vectorize with client namespace
          const vectors = (embeddingResult as { data?: number[][] })?.data;
          if (vectors && vectors[0]) {
            await ctx.env.EMBEDDINGS.upsert([
              {
                id: `brand_voice_${input.clientId}`,
                values: vectors[0],
                metadata: {
                  type: 'brand_voice',
                  clientId: input.clientId,
                  primaryTone: analysisData.primary_tone || '',
                  writingStyle: analysisData.writing_style || '',
                },
              },
            ]);
          }
        }
      } catch (error) {
        // Log but don't fail if embedding storage fails
        console.error('Vectorize embedding error:', error);
      }

      // Store results in brand_dna table (upsert - singleton per client)
      // Story 2.4: Added topics_to_avoid column
      const now = Math.floor(Date.now() / 1000);
      await ctx.db
        .prepare(
          `
          INSERT INTO brand_dna (
            id, client_id, strength_score, tone_profile, signature_patterns, topics_to_avoid,
            primary_tone, writing_style, target_audience,
            last_calibration_at, calibration_source, sample_count, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'content_upload', ?, ?)
          ON CONFLICT(client_id) DO UPDATE SET
            strength_score = excluded.strength_score,
            tone_profile = excluded.tone_profile,
            signature_patterns = excluded.signature_patterns,
            topics_to_avoid = excluded.topics_to_avoid,
            primary_tone = excluded.primary_tone,
            writing_style = excluded.writing_style,
            target_audience = excluded.target_audience,
            last_calibration_at = excluded.last_calibration_at,
            calibration_source = excluded.calibration_source,
            sample_count = excluded.sample_count,
            updated_at = excluded.updated_at
        `
        )
        .bind(
          `dna_${input.clientId}`,
          input.clientId,
          strengthResult.total,
          JSON.stringify(strengthResult.breakdown),
          JSON.stringify(analysisData.signature_phrases),
          JSON.stringify(analysisData.topics_to_avoid), // Story 2.4
          analysisData.primary_tone,
          analysisData.writing_style,
          analysisData.target_audience,
          now,
          samples.length,
          now
        )
        .run();

      return {
        success: true,
        strengthScore: strengthResult.total,
        breakdown: strengthResult.breakdown,
        primaryTone: analysisData.primary_tone || '',
        writingStyle: analysisData.writing_style || '',
        targetAudience: analysisData.target_audience || '',
        // Story 2.4: Now includes example usage from content
        signaturePhrases: analysisData.signature_phrases || [],
        topicsToAvoid: analysisData.topics_to_avoid || [],
      };
    }),

  // Get Brand DNA Report with full breakdown (AC2, AC3, AC4)
  getBrandDNAReport: procedure
    .input(
      z.object({
        clientId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }): Promise<BrandDNAReport | null> => {
      // Rule 1: Isolation Above All
      const dna = await ctx.db
        .prepare('SELECT * FROM brand_dna WHERE client_id = ?')
        .bind(input.clientId)
        .first<BrandDNA>();

      if (!dna) {
        return null;
      }

      // Parse JSON fields
      const toneProfile: BrandDNABreakdown = JSON.parse(dna.tone_profile || '{}');

      // Story 2.4: Parse signature patterns as SignaturePhrase[]
      // Handle both old format (string[]) and new format (SignaturePhrase[])
      const rawPatterns: unknown = JSON.parse(dna.signature_patterns || '[]');
      let signaturePhrases: SignaturePhrase[] = [];
      if (Array.isArray(rawPatterns)) {
        signaturePhrases = rawPatterns.map((item: unknown) => {
          if (typeof item === 'string') {
            return { phrase: item, example: '' };
          }
          if (typeof item === 'object' && item !== null) {
            const obj = item as { phrase?: string; example?: string };
            return { phrase: obj.phrase || '', example: obj.example || '' };
          }
          return { phrase: '', example: '' };
        }).filter((p) => p.phrase.length > 0);
      }

      // Story 2.4: Parse topics to avoid
      const topicsToAvoid: string[] = JSON.parse(dna.topics_to_avoid || '[]');

      // AC4: Determine status badge based on strength score
      const status =
        dna.strength_score >= 80
          ? 'strong'
          : dna.strength_score >= 70
            ? 'good'
            : 'needs_training';

      // AC3: Generate recommendations for low scores
      const recommendations: BrandDNAReport['recommendations'] = [];
      if (dna.strength_score < 70) {
        recommendations.push({
          type: 'add_samples',
          message: 'Add more content samples to improve accuracy',
        });
        recommendations.push({
          type: 'voice_note',
          message: 'Record a voice note to capture your natural speaking style',
        });
      }
      if (dna.sample_count < 5) {
        recommendations.push({
          type: 'diversify_content',
          message: 'Add more diverse content types (articles, transcripts, posts)',
        });
      }

      return {
        strengthScore: dna.strength_score,
        status,
        primaryTone: dna.primary_tone,
        writingStyle: dna.writing_style,
        targetAudience: dna.target_audience,
        signaturePhrases, // Story 2.4: Now includes example usage
        topicsToAvoid, // Story 2.4: Words/topics to avoid (red pills)
        breakdown: {
          tone_match: toneProfile.tone_match ?? 0,
          vocabulary: toneProfile.vocabulary ?? 0,
          structure: toneProfile.structure ?? 0,
          topics: toneProfile.topics ?? 0,
        },
        recommendations,
        sampleCount: dna.sample_count,
        lastCalibration: {
          source: dna.calibration_source,
          timestamp: dna.last_calibration_at,
        },
      };
    }),
});
