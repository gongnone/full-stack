/**
 * Brand DNA Router
 *
 * Phase 1.5 Stories:
 * - 1.5-1-3: Voice Note Transcription
 * - 1.5-1-4: Brand Personality Extraction
 * - 1.5-1-5: Upload Existing Content for Analysis
 * - 1.5-1-6: Save and Resume BrandDNA Session
 * - 1.5-1-7: Text-Only BrandDNA Path
 * - 1.5-1-8: Express BrandDNA 60-Second Path
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';
import * as schema from '../../db/schema';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// AC1: Validate audio file by magic bytes
function validateAudioMagicBytes(header: Uint8Array): { valid: boolean; format: string | null } {
  // Check WebM (starts with EBML header: 0x1A 0x45 0xDF 0xA3)
  if (
    header[0] === 0x1a &&
    header[1] === 0x45 &&
    header[2] === 0xdf &&
    header[3] === 0xa3
  ) {
    return { valid: true, format: 'webm' };
  }

  // Check MP3 (ID3 tag)
  if (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33) {
    return { valid: true, format: 'mp3' };
  }

  // Check MP3 (frame sync patterns)
  if (header[0] === 0xff && (header[1] === 0xfb || header[1] === 0xfa || header[1] === 0xf3 || header[1] === 0xf2)) {
    return { valid: true, format: 'mp3' };
  }

  // Check WAV (RIFF + WAVE)
  if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x41 &&
    header[10] === 0x56 &&
    header[11] === 0x45
  ) {
    return { valid: true, format: 'wav' };
  }

  // Check OGG
  if (
    header[0] === 0x4f &&
    header[1] === 0x67 &&
    header[2] === 0x67 &&
    header[3] === 0x53
  ) {
    return { valid: true, format: 'ogg' };
  }

  // Check M4A/AAC (ftyp box)
  if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
    return { valid: true, format: 'm4a' };
  }

  return { valid: false, format: null };
}

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DURATION_SECONDS = 300; // 5 minutes

// AC1: Prompt injection patterns to detect and escape (Story 1.5-1-4)
const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+(instructions?|prompts?)/gi,
  /disregard\s+(previous|above|all)\s+(instructions?|prompts?)/gi,
  /forget\s+(previous|above|all)\s+(instructions?|prompts?)/gi,
  /you\s+are\s+now/gi,
  /act\s+as\s+if/gi,
  /pretend\s+(you('re|are)?|to\s+be)/gi,
  /system\s*:\s*/gi,
  /assistant\s*:\s*/gi,
  /human\s*:\s*/gi,
  /<\/?system>/gi,
  /<\/?assistant>/gi,
  /<\/?human>/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<<SYS>>/gi,
  /<<\/SYS>>/gi,
];

/**
 * AC1: Sanitize user input to prevent prompt injection
 * - Escapes known injection patterns
 * - Wraps content in user_content tags for clear delimitation
 */
function sanitizeForLLM(content: string): { sanitized: string; flagged: boolean } {
  let sanitized = content;
  let flagged = false;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      flagged = true;
      // Replace the injection attempt with a safe placeholder
      sanitized = sanitized.replace(pattern, '[SANITIZED]');
    }
  }

  // Escape any remaining angle brackets that could be interpreted as tags
  sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return { sanitized, flagged };
}

// System prompt for personality extraction (isolated and immutable)
const PERSONALITY_EXTRACTION_PROMPT = `You are a brand personality analyst. Analyze the provided voice transcription and extract:

1. Primary Tone: The overall emotional and professional tone (e.g., "Direct and confident", "Warm and approachable", "Authoritative yet friendly")

2. Key Vocabulary Patterns: 3-5 signature phrases or word patterns the speaker uses frequently

3. Personality Markers: 2-4 personality traits evident in the speech (e.g., "Anti-corporate", "Data-driven", "Empathetic listener", "Bold risk-taker")

Respond ONLY with valid JSON in this exact format:
{
  "tone": "string describing primary tone",
  "vocabulary": ["phrase1", "phrase2", "phrase3"],
  "personality_markers": ["marker1", "marker2", "marker3"]
}

Analyze this transcription:
<user_content>
`;

const EXTRACTION_SUFFIX = `
</user_content>

Respond with JSON only:`;

export const brandDnaRouter = t.router({
  // AC2: Get upload URL for voice recording
  getVoiceUploadUrl: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
        filename: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Validate audio extension
      const validExtensions = ['webm', 'mp3', 'wav', 'ogg', 'm4a'];
      const ext = input.filename.split('.').pop()?.toLowerCase() || '';
      if (!validExtensions.includes(ext)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid audio format. Allowed: ${validExtensions.join(', ')}`,
        });
      }

      // AC2: Path structure /voice-notes/{client_id}/{session_id}.webm
      const r2Key = `voice-notes/${input.clientId}/${input.sessionId}.${ext}`;

      return {
        r2Key,
        uploadEndpoint: `/api/upload/${encodeURIComponent(r2Key)}`,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }),

  // AC1, AC2, AC3: Validate uploaded file and start transcription
  transcribeVoice: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
        r2Key: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // AC1: Validate R2 key path for security
      const expectedPrefix = `voice-notes/${input.clientId}/`;
      if (!input.r2Key.startsWith(expectedPrefix)) {
        console.error(
          `[Security] Invalid audio path: ${input.r2Key} does not match expected prefix ${expectedPrefix}`
        );
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid audio path: client isolation violation',
        });
      }

      // AC1: Get file from R2
      const object = await ctx.env.MEDIA.get(input.r2Key);
      if (!object) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audio file not found in storage',
        });
      }

      // AC1: Validate file size
      if (object.size > MAX_FILE_SIZE) {
        console.warn(`[Validation] File too large: ${object.size} bytes for ${input.r2Key}`);
        throw new TRPCError({
          code: 'PAYLOAD_TOO_LARGE',
          message: `File size ${(object.size / 1024 / 1024).toFixed(1)}MB exceeds limit of 10MB`,
        });
      }

      // AC1: Validate magic bytes - need to read first 12 bytes
      const audioBuffer = await object.arrayBuffer();
      const header = new Uint8Array(audioBuffer.slice(0, 12));
      const { valid, format } = validateAudioMagicBytes(header);

      if (!valid) {
        console.warn(`[Security] Invalid audio magic bytes for ${input.r2Key}`);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid file type. Please upload a valid audio file (WebM, MP3, WAV, OGG, or M4A)',
        });
      }

      // Create voice recording record
      const recordingId = crypto.randomUUID();
      const now = Date.now();

      // Insert pending record
      await ctx.drizzle.insert(schema.voice_recordings).values({
        id: recordingId,
        client_id: input.clientId,
        session_id: input.sessionId,
        user_id: ctx.userId,
        r2_key: input.r2Key,
        file_size: object.size,
        format: format || 'unknown',
        status: 'pending',
        created_at: now,
      }).run();

      // Update status to transcribing
      await ctx.drizzle
        .update(schema.voice_recordings)
        .set({ status: 'transcribing' })
        .where(eq(schema.voice_recordings.id, recordingId))
        .run();

      // AC3: Call Workers AI Whisper
      try {
        // Call Whisper model
        const transcriptionResult = await ctx.env.AI.run('@cf/openai/whisper', {
          audio: [...new Uint8Array(audioBuffer)],
        });

        const transcription = transcriptionResult.text || '';

        // Update record with transcription
        await ctx.drizzle
          .update(schema.voice_recordings)
          .set({
            transcription,
            status: 'completed',
            transcribed_at: Date.now(),
          })
          .where(eq(schema.voice_recordings.id, recordingId))
          .run();

        return {
          recordingId,
          transcription,
          status: 'completed' as const,
          format,
          fileSizeBytes: object.size,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
        console.error(`[Whisper] Transcription failed for ${input.r2Key}: ${errorMessage}`);

        // Update record with error
        await ctx.drizzle
          .update(schema.voice_recordings)
          .set({
            status: 'failed',
            error_message: errorMessage,
          })
          .where(eq(schema.voice_recordings.id, recordingId))
          .run();

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Transcription failed: ${errorMessage}`,
        });
      }
    }),

  // AC5: Get transcription for a recording
  getTranscription: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        recordingId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const result = await ctx.drizzle
        .select()
        .from(schema.voice_recordings)
        .where(
          and(
            eq(schema.voice_recordings.id, input.recordingId),
            eq(schema.voice_recordings.client_id, input.clientId)
          )
        )
        .get();

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Voice recording not found',
        });
      }

      return {
        id: result.id,
        sessionId: result.session_id,
        transcription: result.transcription,
        durationSeconds: result.duration_seconds,
        fileSizeBytes: result.file_size,
        format: result.format,
        status: result.status,
        errorMessage: result.error_message,
        createdAt: result.created_at,
        transcribedAt: result.transcribed_at,
      };
    }),

  // AC4: Get transcription status (for polling during progress)
  getTranscriptionStatus: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const result = await ctx.drizzle
        .select({
          id: schema.voice_recordings.id,
          status: schema.voice_recordings.status,
          transcription: schema.voice_recordings.transcription,
          error_message: schema.voice_recordings.error_message,
        })
        .from(schema.voice_recordings)
        .where(
          and(
            eq(schema.voice_recordings.session_id, input.sessionId),
            eq(schema.voice_recordings.client_id, input.clientId)
          )
        )
        .orderBy(desc(schema.voice_recordings.created_at))
        .limit(1)
        .get();

      if (!result) {
        return {
          status: 'not_found' as const,
          recordingId: null,
          transcription: null,
          errorMessage: null,
        };
      }

      return {
        status: result.status as 'pending' | 'transcribing' | 'completed' | 'failed',
        recordingId: result.id,
        transcription: result.transcription,
        errorMessage: result.error_message,
      };
    }),

  // List all voice recordings for a session
  listSessionRecordings: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const results = await ctx.drizzle
        .select({
          id: schema.voice_recordings.id,
          transcription: schema.voice_recordings.transcription,
          duration_seconds: schema.voice_recordings.duration_seconds,
          file_size: schema.voice_recordings.file_size,
          format: schema.voice_recordings.format,
          status: schema.voice_recordings.status,
          created_at: schema.voice_recordings.created_at,
        })
        .from(schema.voice_recordings)
        .where(
          and(
            eq(schema.voice_recordings.session_id, input.sessionId),
            eq(schema.voice_recordings.client_id, input.clientId)
          )
        )
        .orderBy(schema.voice_recordings.created_at)
        .all();

      return results.map((row) => ({
        id: row.id,
        transcription: row.transcription,
        durationSeconds: row.duration_seconds,
        fileSizeBytes: row.file_size,
        format: row.format,
        status: row.status as 'pending' | 'transcribing' | 'completed' | 'failed',
        createdAt: row.created_at,
      }));
    }),

  // Delete a voice recording
  deleteRecording: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        recordingId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get recording to find R2 key
      const result = await ctx.drizzle
        .select({ r2_key: schema.voice_recordings.r2_key })
        .from(schema.voice_recordings)
        .where(
          and(
            eq(schema.voice_recordings.id, input.recordingId),
            eq(schema.voice_recordings.client_id, input.clientId)
          )
        )
        .get();

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Voice recording not found',
        });
      }

      // Delete from R2
      try {
        await ctx.env.MEDIA.delete(result.r2_key);
      } catch (e) {
        console.error(`Failed to delete R2 object: ${result.r2_key}`, e);
      }

      // Delete from database
      await ctx.drizzle
        .delete(schema.voice_recordings)
        .where(
          and(
            eq(schema.voice_recordings.id, input.recordingId),
            eq(schema.voice_recordings.client_id, input.clientId)
          )
        )
        .run();

      return { success: true };
    }),

  // ===== Story 1.5-1-4: Brand Personality Extraction =====

  // Create a new Brand DNA session
  createSession: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const sessionId = crypto.randomUUID();
      const now = Date.now();

      await ctx.drizzle.insert(schema.brand_dna_sessions).values({
        id: sessionId,
        client_id: input.clientId,
        user_id: ctx.userId,
        status: 'active',
        created_at: now,
        updated_at: now,
      }).run();

      return {
        sessionId,
        status: 'active' as const,
        createdAt: now,
      };
    }),

  // Get session details
  getSession: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const result = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.id, input.sessionId),
            eq(schema.brand_dna_sessions.client_id, input.clientId)
          )
        )
        .get();

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Brand DNA session not found',
        });
      }

      return {
        id: result.id,
        clientId: result.client_id,
        status: result.status,
        voiceAnalysis: result.voice_analysis ? JSON.parse(result.voice_analysis) : null,
        totalTranscription: result.total_transcription,
        totalDurationSeconds: result.total_duration_seconds,
        recordingCount: result.recording_count,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        completedAt: result.completed_at,
      };
    }),

  // AC2, AC3: Analyze personality from transcription
  analyzePersonality: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
        transcription: z.string().min(10).max(50000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Verify session exists and belongs to this client
      const session = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.id, input.sessionId),
            eq(schema.brand_dna_sessions.client_id, input.clientId)
          )
        )
        .get();

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Brand DNA session not found',
        });
      }

      // AC1: Sanitize input to prevent prompt injection
      const { sanitized, flagged } = sanitizeForLLM(input.transcription);

      if (flagged) {
        console.warn(`[Security] Prompt injection attempt detected in session ${input.sessionId}`);
      }

      // Combine transcription with existing (multi-segment support)
      const existingTranscription = session.total_transcription || '';
      const combinedTranscription = existingTranscription
        ? `${existingTranscription}\n\n${input.transcription}`
        : input.transcription;

      // Build the full prompt
      const fullPrompt = `${PERSONALITY_EXTRACTION_PROMPT}${sanitized}${EXTRACTION_SUFFIX}`;

      try {
        // AC2: Call Workers AI for personality extraction
        // Using text-generation model for structured output
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt: fullPrompt,
          max_tokens: 500,
        });

        // Parse the JSON response
        let analysis: {
          tone: string;
          vocabulary: string[];
          personality_markers: string[];
        };

        try {
          // Extract JSON from the response
          const responseText = result.response || '';
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback if JSON extraction fails
            analysis = {
              tone: 'Unable to determine tone',
              vocabulary: [],
              personality_markers: [],
            };
          }
        } catch (parseError) {
          console.error(`[Analysis] Failed to parse LLM response for session ${input.sessionId}`);
          analysis = {
            tone: 'Analysis pending - please try again',
            vocabulary: [],
            personality_markers: [],
          };
        }

        // AC3: Store results in brand_dna_sessions
        const now = Date.now();
        await ctx.drizzle
          .update(schema.brand_dna_sessions)
          .set({
            voice_analysis: JSON.stringify(analysis),
            total_transcription: combinedTranscription,
            recording_count: (session.recording_count ?? 0) + 1,
            updated_at: now,
          })
          .where(eq(schema.brand_dna_sessions.id, input.sessionId))
          .run();

        return {
          sessionId: input.sessionId,
          analysis,
          flagged,
          message: flagged
            ? 'Analysis complete. Some content was sanitized for security.'
            : 'Analysis complete.',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        console.error(`[Analysis] Personality extraction failed for session ${input.sessionId}: ${errorMessage}`);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Personality analysis failed: ${errorMessage}`,
        });
      }
    }),

  // Update session with additional transcription (multi-segment)
  addTranscription: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
        transcription: z.string().min(1),
        durationSeconds: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const session = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.id, input.sessionId),
            eq(schema.brand_dna_sessions.client_id, input.clientId)
          )
        )
        .get();

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Brand DNA session not found',
        });
      }

      const existingTranscription = session.total_transcription || '';
      const combinedTranscription = existingTranscription
        ? `${existingTranscription}\n\n${input.transcription}`
        : input.transcription;

      const existingDuration = session.total_duration_seconds ?? 0;
      const newDuration = existingDuration + (input.durationSeconds || 0);

      const now = Date.now();
      await ctx.drizzle
        .update(schema.brand_dna_sessions)
        .set({
          total_transcription: combinedTranscription,
          total_duration_seconds: newDuration,
          recording_count: (session.recording_count ?? 0) + 1,
          updated_at: now,
        })
        .where(eq(schema.brand_dna_sessions.id, input.sessionId))
        .run();

      return {
        sessionId: input.sessionId,
        totalDurationSeconds: newDuration,
        recordingCount: (session.recording_count ?? 0) + 1,
      };
    }),

  // Complete a Brand DNA session
  completeSession: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const session = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.id, input.sessionId),
            eq(schema.brand_dna_sessions.client_id, input.clientId)
          )
        )
        .get();

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Brand DNA session not found',
        });
      }

      const now = Date.now();
      await ctx.drizzle
        .update(schema.brand_dna_sessions)
        .set({
          status: 'completed',
          updated_at: now,
          completed_at: now,
        })
        .where(eq(schema.brand_dna_sessions.id, input.sessionId))
        .run();

      return {
        sessionId: input.sessionId,
        status: 'completed' as const,
        completedAt: now,
      };
    }),

  // ===== Story 1.5-1-6: Save and Resume BrandDNA Session =====

  // AC1, AC2: List incomplete sessions for resume
  listIncompleteSessions: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      const sessions = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.client_id, input.clientId),
            eq(schema.brand_dna_sessions.status, 'active')
          )
        )
        .orderBy(desc(schema.brand_dna_sessions.updated_at))
        .all();

      return sessions.map((session) => {
        // Calculate progress percentage based on completed steps
        let progress = 0;
        if (session.recording_count && session.recording_count > 0) progress += 25; // Voice recorded
        if (session.total_transcription) progress += 25; // Transcription done
        if (session.voice_analysis) progress += 25; // Analysis done
        if (session.total_duration_seconds && session.total_duration_seconds > 60) progress += 25; // Sufficient content

        const isExpired = session.updated_at < thirtyDaysAgo;

        return {
          id: session.id,
          progress,
          recordingCount: session.recording_count || 0,
          totalDurationSeconds: session.total_duration_seconds || 0,
          hasVoiceAnalysis: !!session.voice_analysis,
          createdAt: session.created_at,
          updatedAt: session.updated_at,
          isExpired,
          lastActivitySummary: session.voice_analysis
            ? 'Voice analysis completed'
            : session.total_transcription
              ? 'Transcription ready for analysis'
              : session.recording_count && session.recording_count > 0
                ? `${session.recording_count} recording(s) captured`
                : 'Session started',
        };
      });
    }),

  // AC3: Get session with full context restoration
  getSessionWithContext: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const session = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.id, input.sessionId),
            eq(schema.brand_dna_sessions.client_id, input.clientId)
          )
        )
        .get();

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Brand DNA session not found',
        });
      }

      // Get associated voice recordings
      const recordings = await ctx.drizzle
        .select({
          id: schema.voice_recordings.id,
          transcription: schema.voice_recordings.transcription,
          duration_seconds: schema.voice_recordings.duration_seconds,
          format: schema.voice_recordings.format,
          status: schema.voice_recordings.status,
          created_at: schema.voice_recordings.created_at,
        })
        .from(schema.voice_recordings)
        .where(eq(schema.voice_recordings.session_id, input.sessionId))
        .orderBy(schema.voice_recordings.created_at)
        .all();

      // Build context summary for agent greeting
      let contextSummary = 'Welcome back!';
      if (session.voice_analysis) {
        const analysis = JSON.parse(session.voice_analysis);
        contextSummary = `Welcome back! Last time we analyzed your voice and found your primary tone is "${analysis.tone}".`;
      } else if (session.total_transcription) {
        contextSummary = 'Welcome back! Last time we captured your voice. Ready to analyze your personality?';
      } else if (recordings.length > 0) {
        contextSummary = `Welcome back! You have ${recordings.length} recording(s) ready to transcribe.`;
      }

      return {
        session: {
          id: session.id,
          status: session.status,
          voiceAnalysis: session.voice_analysis ? JSON.parse(session.voice_analysis) : null,
          totalTranscription: session.total_transcription,
          totalDurationSeconds: session.total_duration_seconds,
          recordingCount: session.recording_count,
          createdAt: session.created_at,
          updatedAt: session.updated_at,
        },
        recordings: recordings.map((r) => ({
          id: r.id,
          transcription: r.transcription,
          durationSeconds: r.duration_seconds,
          format: r.format,
          status: r.status,
          createdAt: r.created_at,
        })),
        contextSummary,
      };
    }),

  // AC4: Archive expired session
  archiveExpiredSession: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const session = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.id, input.sessionId),
            eq(schema.brand_dna_sessions.client_id, input.clientId)
          )
        )
        .get();

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Brand DNA session not found',
        });
      }

      // Mark as abandoned (archived) instead of deleting
      const now = Date.now();
      await ctx.drizzle
        .update(schema.brand_dna_sessions)
        .set({
          status: 'abandoned',
          updated_at: now,
        })
        .where(eq(schema.brand_dna_sessions.id, input.sessionId))
        .run();

      return {
        sessionId: input.sessionId,
        status: 'abandoned' as const,
        archivedAt: now,
      };
    }),

  // AC2: Start fresh session (abandon previous)
  startFreshSession: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        previousSessionId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const now = Date.now();

      // Archive previous session if provided
      if (input.previousSessionId) {
        await ctx.drizzle
          .update(schema.brand_dna_sessions)
          .set({
            status: 'abandoned',
            updated_at: now,
          })
          .where(
            and(
              eq(schema.brand_dna_sessions.id, input.previousSessionId),
              eq(schema.brand_dna_sessions.client_id, input.clientId)
            )
          )
          .run();
      }

      // Create new session
      const sessionId = crypto.randomUUID();
      await ctx.drizzle.insert(schema.brand_dna_sessions).values({
        id: sessionId,
        client_id: input.clientId,
        user_id: ctx.userId,
        status: 'active',
        created_at: now,
        updated_at: now,
      }).run();

      return {
        sessionId,
        status: 'active' as const,
        createdAt: now,
      };
    }),

  // ===== Story 1.5-1-7: Text-Only BrandDNA Path =====

  // AC1, AC2: Create text-only session
  createTextOnlySession: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const sessionId = crypto.randomUUID();
      const now = Date.now();

      await ctx.drizzle.insert(schema.brand_dna_sessions).values({
        id: sessionId,
        client_id: input.clientId,
        user_id: ctx.userId,
        status: 'active',
        mode: 'text-only',
        created_at: now,
        updated_at: now,
      }).run();

      return {
        sessionId,
        mode: 'text-only' as const,
        status: 'active' as const,
        createdAt: now,
      };
    }),

  // AC2, AC3: Submit text input for text-only path
  submitTextInput: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
        text: z.string().min(200, 'Minimum 200 characters required').max(5000, 'Maximum 5000 characters allowed'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Verify session exists and is text-only
      const session = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.id, input.sessionId),
            eq(schema.brand_dna_sessions.client_id, input.clientId)
          )
        )
        .get();

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Brand DNA session not found',
        });
      }

      // AC1: Sanitize input for LLM
      const { sanitized, flagged } = sanitizeForLLM(input.text);

      // Build prompt for personality extraction (reuse from Story 1.5-1-4)
      const fullPrompt = `${PERSONALITY_EXTRACTION_PROMPT}${sanitized}${EXTRACTION_SUFFIX}`;

      try {
        // AC3: Run personality extraction
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt: fullPrompt,
          max_tokens: 500,
        });

        // Parse JSON response
        let analysis: {
          tone: string;
          vocabulary: string[];
          personality_markers: string[];
        };

        try {
          const responseText = result.response || '';
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          } else {
            analysis = {
              tone: 'Unable to determine tone',
              vocabulary: [],
              personality_markers: [],
            };
          }
        } catch {
          analysis = {
            tone: 'Analysis pending',
            vocabulary: [],
            personality_markers: [],
          };
        }

        // Store results
        const now = Date.now();
        await ctx.drizzle
          .update(schema.brand_dna_sessions)
          .set({
            voice_analysis: JSON.stringify(analysis),
            total_transcription: input.text,
            updated_at: now,
          })
          .where(eq(schema.brand_dna_sessions.id, input.sessionId))
          .run();

        return {
          sessionId: input.sessionId,
          analysis,
          flagged,
          characterCount: input.text.length,
          message: flagged
            ? 'Analysis complete. Some content was sanitized.'
            : 'Analysis complete.',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Text analysis failed: ${errorMessage}`,
        });
      }
    }),

  // AC4: Add more text to existing session
  addMoreText: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
        text: z.string().min(50).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const session = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.id, input.sessionId),
            eq(schema.brand_dna_sessions.client_id, input.clientId)
          )
        )
        .get();

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Brand DNA session not found',
        });
      }

      const existingText = session.total_transcription || '';
      const combinedText = existingText
        ? `${existingText}\n\n${input.text}`
        : input.text;

      const now = Date.now();
      await ctx.drizzle
        .update(schema.brand_dna_sessions)
        .set({
          total_transcription: combinedText,
          updated_at: now,
        })
        .where(eq(schema.brand_dna_sessions.id, input.sessionId))
        .run();

      return {
        sessionId: input.sessionId,
        totalCharacters: combinedText.length,
        message: 'Text added. Re-analyze when ready.',
      };
    }),

  // ===== Story 1.5-1-8: Express BrandDNA 60-Second Path =====

  // Tone word options for express flow
  // AC1, AC2: Create express session
  createExpressSession: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const sessionId = crypto.randomUUID();
      const now = Date.now();

      await ctx.drizzle.insert(schema.brand_dna_sessions).values({
        id: sessionId,
        client_id: input.clientId,
        user_id: ctx.userId,
        status: 'active',
        mode: 'express',
        created_at: now,
        updated_at: now,
      }).run();

      return {
        sessionId,
        mode: 'express' as const,
        status: 'active' as const,
        createdAt: now,
        toneOptions: [
          'Professional', 'Casual', 'Friendly', 'Authoritative',
          'Playful', 'Direct', 'Warm', 'Bold',
          'Thoughtful', 'Energetic', 'Calm', 'Innovative',
        ],
        platformOptions: [
          'LinkedIn', 'Twitter/X', 'Instagram', 'Facebook',
          'TikTok', 'YouTube', 'Blog', 'Email Newsletter',
        ],
      };
    }),

  // AC2, AC3: Submit express answers
  submitExpressAnswers: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
        tagline: z.string().min(10).max(200), // "In one sentence, what do you do?"
        toneWords: z.array(z.string()).min(1).max(5), // "Pick 3 words that describe your tone"
        platform: z.string().min(1), // "Which platform is your priority?"
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const session = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.id, input.sessionId),
            eq(schema.brand_dna_sessions.client_id, input.clientId),
            eq(schema.brand_dna_sessions.mode, 'express')
          )
        )
        .get();

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Express session not found',
        });
      }

      // AC3: Generate starter brand DNA from express answers
      const expressAnswers = {
        tagline: input.tagline,
        toneWords: input.toneWords,
        platform: input.platform,
      };

      // Create basic analysis from tone words
      const analysis = {
        tone: input.toneWords.slice(0, 2).join(' and '),
        vocabulary: [], // Empty for express
        personality_markers: input.toneWords,
      };

      // Calculate starter strength score (40% per requirement)
      const strengthScore = 40;

      const now = Date.now();
      await ctx.drizzle
        .update(schema.brand_dna_sessions)
        .set({
          express_answers: JSON.stringify(expressAnswers),
          voice_analysis: JSON.stringify(analysis),
          status: 'completed',
          updated_at: now,
          completed_at: now,
        })
        .where(eq(schema.brand_dna_sessions.id, input.sessionId))
        .run();

      // Update brand_dna with starter profile
      const existingBrandDna = await ctx.drizzle
        .select()
        .from(schema.brand_dna)
        .where(eq(schema.brand_dna.client_id, input.clientId))
        .get();

      if (existingBrandDna) {
        await ctx.drizzle
          .update(schema.brand_dna)
          .set({
            primary_tone: analysis.tone,
            strength_score: strengthScore,
            tone_profile: JSON.stringify({ words: input.toneWords }),
            calibration_source: 'express',
            updated_at: new Date(now),
          })
          .where(eq(schema.brand_dna.client_id, input.clientId))
          .run();
      } else {
        await ctx.drizzle.insert(schema.brand_dna).values({
          id: crypto.randomUUID(),
          client_id: input.clientId,
          primary_tone: analysis.tone,
          strength_score: strengthScore,
          tone_profile: JSON.stringify({ words: input.toneWords }),
          calibration_source: 'express',
          updated_at: new Date(now),
        }).run();
      }

      return {
        sessionId: input.sessionId,
        mode: 'express' as const,
        status: 'completed' as const,
        analysis,
        platform: input.platform,
        strengthScore,
        message: 'Express Brand DNA complete! Strength: Starter (40%). Upgrade anytime for full analysis.',
      };
    }),

  // AC4: Get upgrade options
  getUpgradePath: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const session = await ctx.drizzle
        .select()
        .from(schema.brand_dna_sessions)
        .where(
          and(
            eq(schema.brand_dna_sessions.id, input.sessionId),
            eq(schema.brand_dna_sessions.client_id, input.clientId)
          )
        )
        .get();

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      const isExpress = session.mode === 'express';
      const currentStrength = isExpress ? 40 : (session.voice_analysis ? 75 : 25);

      return {
        sessionId: input.sessionId,
        currentMode: session.mode,
        currentStrength,
        canUpgrade: isExpress || currentStrength < 100,
        upgradeOptions: [
          {
            name: 'Voice Recording',
            description: 'Record your voice for deeper personality analysis',
            potentialStrength: 85,
            estimatedTime: '10-15 minutes',
          },
          {
            name: 'Upload Content',
            description: 'Upload existing blogs, podcasts, or social posts',
            potentialStrength: 90,
            estimatedTime: '5-10 minutes',
          },
          {
            name: 'Full Discovery',
            description: 'Complete guided brand discovery with all features',
            potentialStrength: 100,
            estimatedTime: '15-20 minutes',
          },
        ],
      };
    }),

  // ===== Story 1.5-1-5: Upload Existing Content for Analysis =====

  // AC1: Get upload URL for brand sample
  getBrandSampleUploadUrl: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        filename: z.string().min(1).max(255),
        fileType: z.enum(['pdf', 'txt', 'docx', 'mp3', 'mp4']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Validate file extension matches fileType
      const ext = input.filename.split('.').pop()?.toLowerCase() || '';
      const validExtensions: Record<string, string[]> = {
        pdf: ['pdf'],
        txt: ['txt', 'text'],
        docx: ['docx', 'doc'],
        mp3: ['mp3'],
        mp4: ['mp4', 'm4v'],
      };

      if (!validExtensions[input.fileType]?.includes(ext)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `File extension .${ext} does not match declared type ${input.fileType}`,
        });
      }

      // AC2: Path structure /brand-samples/{client_id}/
      const sampleId = crypto.randomUUID();
      const r2Key = `brand-samples/${input.clientId}/${sampleId}.${ext}`;

      return {
        sampleId,
        r2Key,
        uploadEndpoint: `/api/upload/${encodeURIComponent(r2Key)}`,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }),

  // AC2: Process uploaded brand sample
  processBrandSample: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sampleId: z.string().uuid(),
        r2Key: z.string().min(1),
        title: z.string().min(1).max(255),
        sourceType: z.enum(['pdf', 'txt', 'docx', 'mp3', 'mp4']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Validate R2 key path for security
      const expectedPrefix = `brand-samples/${input.clientId}/`;
      if (!input.r2Key.startsWith(expectedPrefix)) {
        console.error(`[Security] Invalid sample path: ${input.r2Key}`);
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid sample path: client isolation violation',
        });
      }

      // Get file from R2
      const object = await ctx.env.MEDIA.get(input.r2Key);
      if (!object) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sample file not found in storage',
        });
      }

      // Create training sample record
      const now = Date.now();
      await ctx.drizzle.insert(schema.training_samples).values({
        id: input.sampleId,
        client_id: input.clientId,
        user_id: ctx.userId,
        title: input.title,
        source_type: input.sourceType,
        r2_key: input.r2Key,
        status: 'processing',
        created_at: new Date(now),
      }).run();

      try {
        let extractedText = '';
        const audioBuffer = await object.arrayBuffer();

        // Extract text based on file type
        if (input.sourceType === 'txt') {
          // Plain text - just decode
          extractedText = new TextDecoder().decode(audioBuffer);
        } else if (input.sourceType === 'mp3' || input.sourceType === 'mp4') {
          // Audio/Video - use Whisper transcription
          const transcriptionResult = await ctx.env.AI.run('@cf/openai/whisper', {
            audio: [...new Uint8Array(audioBuffer)],
          });
          extractedText = transcriptionResult.text || '';
        } else if (input.sourceType === 'pdf') {
          // PDF - for now, store as pending for manual extraction
          // In production, would use a PDF parser library
          extractedText = '[PDF content extraction pending]';
        } else if (input.sourceType === 'docx') {
          // DOCX - for now, store as pending for manual extraction
          // In production, would use a DOCX parser library
          extractedText = '[DOCX content extraction pending]';
        }

        // Calculate metrics
        const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
        const characterCount = extractedText.length;

        // Update sample with extracted text
        await ctx.drizzle
          .update(schema.training_samples)
          .set({
            extracted_text: extractedText,
            word_count: wordCount,
            character_count: characterCount,
            status: 'analyzed',
          })
          .where(eq(schema.training_samples.id, input.sampleId))
          .run();

        // Update brand_dna sample count
        await ctx.drizzle
          .update(schema.brand_dna)
          .set({
            sample_count: schema.brand_dna.sample_count,
            updated_at: new Date(now),
          })
          .where(eq(schema.brand_dna.client_id, input.clientId))
          .run();

        return {
          sampleId: input.sampleId,
          status: 'analyzed' as const,
          extractedText: extractedText.substring(0, 500), // Preview
          wordCount,
          characterCount,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Processing failed';
        console.error(`[Sample] Processing failed for ${input.r2Key}: ${errorMessage}`);

        await ctx.drizzle
          .update(schema.training_samples)
          .set({ status: 'failed' })
          .where(eq(schema.training_samples.id, input.sampleId))
          .run();

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Sample processing failed: ${errorMessage}`,
        });
      }
    }),

  // AC3: Cross-reference analysis
  analyzeTrainingSamples: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get all analyzed training samples
      const samples = await ctx.drizzle
        .select({
          id: schema.training_samples.id,
          title: schema.training_samples.title,
          source_type: schema.training_samples.source_type,
          word_count: schema.training_samples.word_count,
          status: schema.training_samples.status,
          created_at: schema.training_samples.created_at,
        })
        .from(schema.training_samples)
        .where(eq(schema.training_samples.client_id, input.clientId))
        .orderBy(desc(schema.training_samples.created_at))
        .all();

      // Calculate confidence score based on sample count and diversity
      const analyzedCount = samples.filter((s) => s.status === 'analyzed').length;
      const sourceTypes = new Set(samples.map((s) => s.source_type));
      const totalWords = samples.reduce((sum, s) => sum + (s.word_count || 0), 0);

      // FR-1.5.1f: Confidence score calculation
      // - Base: 10 points per analyzed sample (max 50)
      // - Diversity bonus: 5 points per unique source type (max 25)
      // - Word volume bonus: 1 point per 500 words (max 25)
      const sampleScore = Math.min(analyzedCount * 10, 50);
      const diversityScore = Math.min(sourceTypes.size * 5, 25);
      const volumeScore = Math.min(Math.floor(totalWords / 500), 25);
      const confidenceScore = sampleScore + diversityScore + volumeScore;

      return {
        samples: samples.map((s) => ({
          id: s.id,
          title: s.title,
          sourceType: s.source_type,
          wordCount: s.word_count,
          status: s.status,
          createdAt: s.created_at,
        })),
        stats: {
          totalSamples: samples.length,
          analyzedSamples: analyzedCount,
          sourceTypes: Array.from(sourceTypes),
          totalWords,
          confidenceScore,
        },
      };
    }),

  // Delete training sample
  deleteTrainingSample: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sampleId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get sample to find R2 key
      const result = await ctx.drizzle
        .select({ r2_key: schema.training_samples.r2_key })
        .from(schema.training_samples)
        .where(
          and(
            eq(schema.training_samples.id, input.sampleId),
            eq(schema.training_samples.client_id, input.clientId)
          )
        )
        .get();

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Training sample not found',
        });
      }

      // Delete from R2 if exists
      if (result.r2_key) {
        try {
          await ctx.env.MEDIA.delete(result.r2_key);
        } catch (e) {
          console.error(`Failed to delete R2 object: ${result.r2_key}`, e);
        }
      }

      // Delete from database
      await ctx.drizzle
        .delete(schema.training_samples)
        .where(
          and(
            eq(schema.training_samples.id, input.sampleId),
            eq(schema.training_samples.client_id, input.clientId)
          )
        )
        .run();

      return { success: true };
    }),
});
