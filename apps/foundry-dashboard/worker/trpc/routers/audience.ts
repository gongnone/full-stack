/**
 * Audience Router
 *
 * Phase 1.5 Epic 2: BrandDNA Agent - Audience & Strategy Discovery
 * Stories:
 * - 1.5-2-0: Import Existing Audience Persona
 * - 1.5-2-1: Audience Demographics Questionnaire
 * - 1.5-2-2: Audience Psychographics Deep Dive
 * - 1.5-2-3: Content Consumption Habits
 * - 1.5-2-4: Generate Audience Persona
 * - 1.5-2-5: Review and Approve Persona
 * - 1.5-2-6: Competitor Input (Optional)
 * - 1.5-2-7: Platform Recommendation
 * - 1.5-2-8: Content Medium Preferences
 * - 1.5-2-9: Posting Cadence Proposal
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';
import * as schema from '../../db/schema';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Persona extraction prompt for imported documents
const PERSONA_EXTRACTION_PROMPT = `You are an audience persona analyst. Extract audience persona information from the provided document.

Extract the following fields if present:
1. Name: A memorable name for this persona (e.g., "Professional Sarah")
2. Demographics: age_range, gender, location, income_level, education, occupation
3. Psychographics: values (array), interests (array), pain_points (array), goals (array)
4. Content Preferences: preferred_platforms (array), content_types (array), consumption_time, engagement_style

Respond ONLY with valid JSON in this exact format:
{
  "name": "string",
  "age_range": "string or null",
  "gender": "string or null",
  "location": "string or null",
  "income_level": "string or null",
  "education": "string or null",
  "occupation": "string or null",
  "values": ["array of strings"],
  "interests": ["array of strings"],
  "pain_points": ["array of strings"],
  "goals": ["array of strings"],
  "preferred_platforms": ["array of strings"],
  "content_types": ["array of strings"],
  "consumption_time": "string or null",
  "engagement_style": "string or null",
  "summary": "Brief summary of this persona"
}

Analyze this document:
<document>
`;

const EXTRACTION_SUFFIX = `
</document>

Respond with JSON only:`;

// Helper: Safely parse JSON from AI response (Story 1.5-2-0)
function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return fallback;
  } catch (e) {
    console.error('JSON Parse Error:', e);
    return fallback;
  }
}

// Helper: Calculate weekly posts from frequency string
function calculateWeeklyPosts(frequency: string): number {
  const lower = frequency.toLowerCase();

  // Handle "Nx/day" patterns
  const dailyMatch = lower.match(/(\d+)[\s-]?(?:x\s*)?\/?\s*day/);
  if (dailyMatch) {
    return parseInt(dailyMatch[1], 10) * 7;
  }

  // Handle "daily"
  if (lower.includes('daily')) {
    return 7;
  }

  // Handle "Nx/week" patterns
  const weeklyMatch = lower.match(/(\d+)[\s-]?(?:x\s*)?\/?\s*week/);
  if (weeklyMatch) {
    return parseInt(weeklyMatch[1], 10);
  }

  // Handle "Nx/month" patterns
  const monthlyMatch = lower.match(/(\d+)[\s-]?(?:x\s*)?\/?\s*month/);
  if (monthlyMatch) {
    return Math.ceil(parseInt(monthlyMatch[1], 10) / 4);
  }

  // Default fallback
  return 1;
}

// Helper: Get medium name by rank
function getMediumByRank(
  prefs: { written_rank: number | null; video_rank: number | null; audio_rank: number | null; visual_rank: number | null },
  targetRank: number
): string {
  if (prefs.written_rank === targetRank) return 'Written';
  if (prefs.video_rank === targetRank) return 'Video';
  if (prefs.audio_rank === targetRank) return 'Audio';
  if (prefs.visual_rank === targetRank) return 'Visual';
  return 'Written';
}

export const audienceRouter = t.router({
  // ===== Story 1.5-2-0: Import Existing Audience Persona =====

  // AC1: Get upload URL for persona document
  getPersonaUploadUrl: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        filename: z.string().min(1).max(255),
        fileType: z.enum(['pdf', 'txt', 'docx']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const ext = input.filename.split('.').pop()?.toLowerCase() || '';
      const validExtensions: Record<string, string[]> = {
        pdf: ['pdf'],
        txt: ['txt', 'text'],
        docx: ['docx', 'doc'],
      };

      if (!validExtensions[input.fileType]?.includes(ext)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `File extension .${ext} does not match declared type ${input.fileType}`,
        });
      }

      const personaId = crypto.randomUUID();
      const timestamp = Date.now();
      const r2Key = `persona-imports/${input.clientId}/${timestamp}-${personaId}.${ext}`;

      return {
        personaId,
        r2Key,
        uploadEndpoint: `/api/upload/${encodeURIComponent(r2Key)}`,
        expiresAt: new Date(Date.now() + 3600000),
      };
    }),

  // AC2, AC3: Import and extract persona from uploaded document
  importPersona: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        personaId: z.string().uuid(),
        r2Key: z.string().min(1),
        fileType: z.enum(['pdf', 'txt', 'docx']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Validate R2 key path
      const expectedPrefix = `persona-imports/${input.clientId}/`;
      if (!input.r2Key.startsWith(expectedPrefix)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid path: client isolation violation',
        });
      }

      // Get file from R2
      const object = await ctx.env.MEDIA.get(input.r2Key);
      if (!object) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Persona document not found',
        });
      }

      // Extract text from document
      const buffer = await object.arrayBuffer();
      let documentText = '';

      if (input.fileType === 'txt') {
        documentText = new TextDecoder().decode(buffer);
      } else if (input.fileType === 'pdf') {
        // PDF extraction would require a library - placeholder for now
        documentText = '[PDF content - extraction pending]';
      } else if (input.fileType === 'docx') {
        // DOCX extraction would require a library - placeholder for now
        documentText = '[DOCX content - extraction pending]';
      }

      // AC3: Use Workers AI to extract persona fields
      const fullPrompt = `${PERSONA_EXTRACTION_PROMPT}${documentText}${EXTRACTION_SUFFIX}`;

      try {
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt: fullPrompt,
          max_tokens: 1000,
        });

        // Parse extracted persona safely
        const extracted = safeParseJSON(result.response || '', { 
          name: 'Imported Persona' 
        } as any);

        // Create persona record
        const now = Date.now();
        await ctx.drizzle.insert(schema.audience_personas).values({
          id: input.personaId,
          client_id: input.clientId,
          name: extracted.name || 'Imported Persona',
          status: 'draft',
          source: 'imported',
          age_range: extracted.age_range || null,
          gender: extracted.gender || null,
          location: extracted.location || null,
          income_level: extracted.income_level || null,
          education: extracted.education || null,
          occupation: extracted.occupation || null,
          values: extracted.values ? JSON.stringify(extracted.values) : null,
          interests: extracted.interests ? JSON.stringify(extracted.interests) : null,
          pain_points: extracted.pain_points ? JSON.stringify(extracted.pain_points) : null,
          goals: extracted.goals ? JSON.stringify(extracted.goals) : null,
          preferred_platforms: extracted.preferred_platforms ? JSON.stringify(extracted.preferred_platforms) : null,
          content_types: extracted.content_types ? JSON.stringify(extracted.content_types) : null,
          consumption_time: extracted.consumption_time || null,
          engagement_style: extracted.engagement_style || null,
          summary: extracted.summary || null,
          imported_from: input.fileType,
          r2_key: input.r2Key,
          created_at: now,
          updated_at: now,
        }).run();

        return {
          personaId: input.personaId,
          status: 'draft' as const,
          extracted,
          message: 'Persona imported successfully. Review and edit as needed.',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Extraction failed';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Persona extraction failed: ${errorMessage}`,
        });
      }
    }),

  // AC2: Import persona from pasted text
  importPersonaFromText: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        text: z.string().min(50).max(10000),
        name: z.string().min(1).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const fullPrompt = `${PERSONA_EXTRACTION_PROMPT}${input.text}${EXTRACTION_SUFFIX}`;

      try {
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt: fullPrompt,
          max_tokens: 1000,
        });

        const extracted = safeParseJSON(result.response || '', { 
          name: input.name || 'Imported Persona' 
        } as any);

        const personaId = crypto.randomUUID();
        const now = Date.now();

        await ctx.drizzle.insert(schema.audience_personas).values({
          id: personaId,
          client_id: input.clientId,
          name: input.name || extracted.name || 'Imported Persona',
          status: 'draft',
          source: 'imported',
          age_range: extracted.age_range || null,
          gender: extracted.gender || null,
          location: extracted.location || null,
          income_level: extracted.income_level || null,
          education: extracted.education || null,
          occupation: extracted.occupation || null,
          values: extracted.values ? JSON.stringify(extracted.values) : null,
          interests: extracted.interests ? JSON.stringify(extracted.interests) : null,
          pain_points: extracted.pain_points ? JSON.stringify(extracted.pain_points) : null,
          goals: extracted.goals ? JSON.stringify(extracted.goals) : null,
          preferred_platforms: extracted.preferred_platforms ? JSON.stringify(extracted.preferred_platforms) : null,
          content_types: extracted.content_types ? JSON.stringify(extracted.content_types) : null,
          consumption_time: extracted.consumption_time || null,
          engagement_style: extracted.engagement_style || null,
          summary: extracted.summary || null,
          imported_from: 'pasted_text',
          created_at: now,
          updated_at: now,
        }).run();

        return {
          personaId,
          status: 'draft' as const,
          extracted,
          message: 'Persona imported from text. Review and edit as needed.',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Extraction failed';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Persona extraction failed: ${errorMessage}`,
        });
      }
    }),

  // ===== Story 1.5-2-1: Audience Demographics Questionnaire =====

  // Create new persona from scratch
  createPersona: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const personaId = crypto.randomUUID();
      const now = Date.now();

      await ctx.drizzle.insert(schema.audience_personas).values({
        id: personaId,
        client_id: input.clientId,
        name: input.name,
        status: 'draft',
        source: 'manual',
        created_at: now,
        updated_at: now,
      }).run();

      return {
        personaId,
        name: input.name,
        status: 'draft' as const,
        createdAt: now,
      };
    }),

  // Update demographics
  updateDemographics: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        personaId: z.string().uuid(),
        ageRange: z.string().max(50).optional(),
        gender: z.string().max(50).optional(),
        location: z.string().max(200).optional(),
        incomeLevel: z.string().max(100).optional(),
        education: z.string().max(100).optional(),
        occupation: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const persona = await ctx.drizzle
        .select()
        .from(schema.audience_personas)
        .where(
          and(
            eq(schema.audience_personas.id, input.personaId),
            eq(schema.audience_personas.client_id, input.clientId)
          )
        )
        .get();

      if (!persona) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audience persona not found',
        });
      }

      const now = Date.now();
      const result = await ctx.drizzle
        .update(schema.audience_personas)
        .set({
          age_range: input.ageRange ?? persona.age_range,
          gender: input.gender ?? persona.gender,
          location: input.location ?? persona.location,
          income_level: input.incomeLevel ?? persona.income_level,
          education: input.education ?? persona.education,
          occupation: input.occupation ?? persona.occupation,
          updated_at: now,
        })
        .where(eq(schema.audience_personas.id, input.personaId))
        .run();

      if (result.meta.changes === 0) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update demographics: No changes applied',
        });
      }

      return {
        personaId: input.personaId,
        message: 'Demographics updated',
      };
    }),

  // ===== Story 1.5-2-2: Audience Psychographics Deep Dive =====

  updatePsychographics: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        personaId: z.string().uuid(),
        values: z.array(z.string()).max(10).optional(),
        interests: z.array(z.string()).max(20).optional(),
        painPoints: z.array(z.string()).max(10).optional(),
        goals: z.array(z.string()).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const persona = await ctx.drizzle
        .select()
        .from(schema.audience_personas)
        .where(
          and(
            eq(schema.audience_personas.id, input.personaId),
            eq(schema.audience_personas.client_id, input.clientId)
          )
        )
        .get();

      if (!persona) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audience persona not found',
        });
      }

      const now = Date.now();
      const result = await ctx.drizzle
        .update(schema.audience_personas)
        .set({
          values: input.values ? JSON.stringify(input.values) : persona.values,
          interests: input.interests ? JSON.stringify(input.interests) : persona.interests,
          pain_points: input.painPoints ? JSON.stringify(input.painPoints) : persona.pain_points,
          goals: input.goals ? JSON.stringify(input.goals) : persona.goals,
          updated_at: now,
        })
        .where(eq(schema.audience_personas.id, input.personaId))
        .run();

      if (result.meta.changes === 0) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update psychographics: No changes applied',
        });
      }

      return {
        personaId: input.personaId,
        message: 'Psychographics updated',
      };
    }),

  // ===== Story 1.5-2-3: Content Consumption Habits =====

  updateContentPreferences: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        personaId: z.string().uuid(),
        preferredPlatforms: z.array(z.string()).max(10).optional(),
        contentTypes: z.array(z.string()).max(10).optional(),
        consumptionTime: z.string().max(200).optional(),
        engagementStyle: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const persona = await ctx.drizzle
        .select()
        .from(schema.audience_personas)
        .where(
          and(
            eq(schema.audience_personas.id, input.personaId),
            eq(schema.audience_personas.client_id, input.clientId)
          )
        )
        .get();

      if (!persona) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audience persona not found',
        });
      }

      const now = Date.now();
      const result = await ctx.drizzle
        .update(schema.audience_personas)
        .set({
          preferred_platforms: input.preferredPlatforms
            ? JSON.stringify(input.preferredPlatforms)
            : persona.preferred_platforms,
          content_types: input.contentTypes
            ? JSON.stringify(input.contentTypes)
            : persona.content_types,
          consumption_time: input.consumptionTime ?? persona.consumption_time,
          engagement_style: input.engagementStyle ?? persona.engagement_style,
          updated_at: now,
        })
        .where(eq(schema.audience_personas.id, input.personaId))
        .run();

      if (result.meta.changes === 0) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update content preferences: No changes applied',
        });
      }

      return {
        personaId: input.personaId,
        message: 'Content preferences updated',
      };
    }),

  // ===== Story 1.5-2-4: Generate Audience Persona =====

  generatePersonaSummary: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        personaId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const persona = await ctx.drizzle
        .select()
        .from(schema.audience_personas)
        .where(
          and(
            eq(schema.audience_personas.id, input.personaId),
            eq(schema.audience_personas.client_id, input.clientId)
          )
        )
        .get();

      if (!persona) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audience persona not found',
        });
      }

      // Build persona context for summary generation safely (Story 1.5-2-4)
      const personaContext = {
        name: persona.name,
        demographics: {
          age: persona.age_range,
          gender: persona.gender,
          location: persona.location,
          income: persona.income_level,
          education: persona.education,
          occupation: persona.occupation,
        },
        psychographics: {
          values: safeParseJSON(persona.values || '[]', []),
          interests: safeParseJSON(persona.interests || '[]', []),
          painPoints: safeParseJSON(persona.pain_points || '[]', []),
          goals: safeParseJSON(persona.goals || '[]', []),
        },
        contentPreferences: {
          platforms: safeParseJSON(persona.preferred_platforms || '[]', []),
          contentTypes: safeParseJSON(persona.content_types || '[]', []),
          consumptionTime: persona.consumption_time,
          engagementStyle: persona.engagement_style,
        },
      };

      const prompt = `Generate a compelling 2-3 sentence summary for this audience persona:

${JSON.stringify(personaContext, null, 2)}

Focus on what makes this audience unique and what drives their content consumption. Be specific and actionable.`;

      try {
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt,
          max_tokens: 200,
        });

        const summary = result.response || 'Summary generation pending.';

        const now = Date.now();
        await ctx.drizzle
          .update(schema.audience_personas)
          .set({
            summary,
            updated_at: now,
          })
          .where(eq(schema.audience_personas.id, input.personaId))
          .run();

        return {
          personaId: input.personaId,
          summary,
          message: 'Persona summary generated',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Generation failed';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Summary generation failed: ${errorMessage}`,
        });
      }
    }),

  // ===== Story 1.5-2-5: Review and Approve Persona =====

  getPersona: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        personaId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const persona = await ctx.drizzle
        .select()
        .from(schema.audience_personas)
        .where(
          and(
            eq(schema.audience_personas.id, input.personaId),
            eq(schema.audience_personas.client_id, input.clientId)
          )
        )
        .get();

      if (!persona) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audience persona not found',
        });
      }

      return {
        id: persona.id,
        name: persona.name,
        status: persona.status,
        source: persona.source,
        demographics: {
          ageRange: persona.age_range,
          gender: persona.gender,
          location: persona.location,
          incomeLevel: persona.income_level,
          education: persona.education,
          occupation: persona.occupation,
        },
        psychographics: {
          values: safeParseJSON(persona.values || '[]', []),
          interests: safeParseJSON(persona.interests || '[]', []),
          painPoints: safeParseJSON(persona.pain_points || '[]', []),
          goals: safeParseJSON(persona.goals || '[]', []),
        },
        contentPreferences: {
          preferredPlatforms: safeParseJSON(persona.preferred_platforms || '[]', []),
          contentTypes: safeParseJSON(persona.content_types || '[]', []),
          consumptionTime: persona.consumption_time,
          engagementStyle: persona.engagement_style,
        },
        summary: persona.summary,
        createdAt: persona.created_at,
        updatedAt: persona.updated_at,
      };
    }),

  listPersonas: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const personas = await ctx.drizzle
        .select({
          id: schema.audience_personas.id,
          name: schema.audience_personas.name,
          status: schema.audience_personas.status,
          source: schema.audience_personas.source,
          summary: schema.audience_personas.summary,
          created_at: schema.audience_personas.created_at,
          updated_at: schema.audience_personas.updated_at,
        })
        .from(schema.audience_personas)
        .where(eq(schema.audience_personas.client_id, input.clientId))
        .orderBy(desc(schema.audience_personas.updated_at))
        .all();

      return personas.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        source: p.source,
        summary: p.summary,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    }),

  approvePersona: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        personaId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const persona = await ctx.drizzle
        .select()
        .from(schema.audience_personas)
        .where(
          and(
            eq(schema.audience_personas.id, input.personaId),
            eq(schema.audience_personas.client_id, input.clientId)
          )
        )
        .get();

      if (!persona) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audience persona not found',
        });
      }

      const now = Date.now();
      await ctx.drizzle
        .update(schema.audience_personas)
        .set({
          status: 'approved',
          updated_at: now,
        })
        .where(eq(schema.audience_personas.id, input.personaId))
        .run();

      return {
        personaId: input.personaId,
        status: 'approved' as const,
        message: 'Persona approved!',
      };
    }),

  deletePersona: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        personaId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const persona = await ctx.drizzle
        .select({ r2_key: schema.audience_personas.r2_key })
        .from(schema.audience_personas)
        .where(
          and(
            eq(schema.audience_personas.id, input.personaId),
            eq(schema.audience_personas.client_id, input.clientId)
          )
        )
        .get();

      if (!persona) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audience persona not found',
        });
      }

      // Delete associated R2 object if exists
      if (persona.r2_key) {
        try {
          await ctx.env.MEDIA.delete(persona.r2_key);
        } catch (e) {
          console.error(`Failed to delete R2 object: ${persona.r2_key}`, e);
        }
      }

      await ctx.drizzle
        .delete(schema.audience_personas)
        .where(eq(schema.audience_personas.id, input.personaId))
        .run();

      return { success: true };
    }),

  // ===== Story 1.5-2-6: Competitor Input (Optional) =====

  // AC1: Save 0-3 competitors with names/URLs
  saveCompetitors: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        sessionId: z.string().uuid(),
        competitors: z
          .array(
            z.object({
              name: z.string().min(1).max(100),
              url: z.string().url().optional(),
            })
          )
          .max(3),
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
          message: 'BrandDNA session not found',
        });
      }

      const now = Date.now();
      await ctx.drizzle
        .update(schema.brand_dna_sessions)
        .set({
          competitors: JSON.stringify(input.competitors),
          updated_at: now,
        })
        .where(and(
          eq(schema.brand_dna_sessions.id, input.sessionId),
          eq(schema.brand_dna_sessions.client_id, input.clientId)
        ))
        .run();

      return {
        sessionId: input.sessionId,
        competitorCount: input.competitors.length,
        message:
          input.competitors.length > 0
            ? `Great! We'll analyze ${input.competitors.length} competitor${input.competitors.length > 1 ? 's' : ''} to identify unique positioning opportunities for you.`
            : 'Competitors saved.',
      };
    }),

  // AC3: Skip competitor input
  skipCompetitors: procedure
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
          message: 'BrandDNA session not found',
        });
      }

      const now = Date.now();
      await ctx.drizzle
        .update(schema.brand_dna_sessions)
        .set({
          competitors: JSON.stringify([]),
          updated_at: now,
        })
        .where(and(
          eq(schema.brand_dna_sessions.id, input.sessionId),
          eq(schema.brand_dna_sessions.client_id, input.clientId)
        ))
        .run();

      return {
        sessionId: input.sessionId,
        message: "No problem! We can focus on your unique strengths.",
      };
    }),

  // ===== Story 1.5-2-7: Platform Recommendation =====

  // AC1: Generate platform recommendations based on persona and brand DNA
  generatePlatformRecommendations: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        personaId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get persona data if provided
      let personaContext = '';
      if (input.personaId) {
        const persona = await ctx.drizzle
          .select()
          .from(schema.audience_personas)
          .where(
            and(
              eq(schema.audience_personas.id, input.personaId),
              eq(schema.audience_personas.client_id, input.clientId)
            )
          )
          .get();

        if (persona) {
          personaContext = `
Audience Persona: ${persona.name}
Demographics: ${persona.age_range || 'Unknown'} age, ${persona.occupation || 'Unknown occupation'}
Interests: ${persona.interests || '[]'}
Pain Points: ${persona.pain_points || '[]'}
Preferred Platforms: ${persona.preferred_platforms || '[]'}
`;
        }
      }

      // Get brand DNA data
      const brandDna = await ctx.drizzle
        .select()
        .from(schema.brand_dna)
        .where(eq(schema.brand_dna.client_id, input.clientId))
        .get();

      const brandContext = brandDna
        ? `
Brand Voice: ${brandDna.primary_tone || 'Professional'}
Writing Style: ${brandDna.writing_style || 'Informative'}
Target Audience: ${brandDna.target_audience || 'General'}
`
        : '';

      const prompt = `Based on this brand and audience information, recommend social media platforms.
${personaContext}
${brandContext}

Return a JSON array of platform recommendations. Each platform should include:
- platform: The platform name (LinkedIn, Twitter, Instagram, YouTube, TikTok, Facebook, Threads, Newsletter)
- status: "primary" (2-3 platforms) or "secondary" (2-3 platforms)
- rationale: 1-2 sentences explaining why this platform fits
- contentTypes: Array of recommended content types for this platform
- postingCadence: Recommended frequency (e.g., "3x/week", "daily", "2x/month")

Respond ONLY with valid JSON array:`;

      try {
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt,
          max_tokens: 1000,
        });

        let recommendations: Array<{
          platform: string;
          status: string;
          rationale: string;
          contentTypes: string[];
          postingCadence: string;
        }> = [];

        try {
          const responseText = result.response || '';
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            recommendations = JSON.parse(jsonMatch[0]);
          }
        } catch {
          // Default recommendations if AI fails
          recommendations = [
            { platform: 'LinkedIn', status: 'primary', rationale: 'Professional networking and thought leadership', contentTypes: ['Articles', 'Posts'], postingCadence: '3x/week' },
            { platform: 'Twitter', status: 'primary', rationale: 'Real-time engagement and industry discussions', contentTypes: ['Threads', 'Quick takes'], postingCadence: 'daily' },
            { platform: 'Instagram', status: 'secondary', rationale: 'Visual storytelling and behind-the-scenes', contentTypes: ['Stories', 'Reels'], postingCadence: '3x/week' },
          ];
        }

        // Story 1.5-2-7: Use a transaction to ensure atomicity during recommendation updates
        await ctx.drizzle.transaction(async (tx) => {
          // Clear existing recommendations
          await tx
            .delete(schema.platform_recommendations)
            .where(eq(schema.platform_recommendations.client_id, input.clientId))
            .run();

          // Insert new recommendations
          const now = Date.now();
          for (let i = 0; i < recommendations.length; i++) {
            const rec = recommendations[i];
            await tx.insert(schema.platform_recommendations).values({
              id: crypto.randomUUID(),
              client_id: input.clientId,
              persona_id: input.personaId || null,
              platform: rec.platform,
              priority: i + 1,
              status: rec.status === 'primary' ? 'primary' : 'secondary',
              rationale: rec.rationale,
              content_types: JSON.stringify(rec.contentTypes),
              posting_cadence: rec.postingCadence,
              created_at: now,
              updated_at: now,
            }).run();
          }
        });

        return {
          recommendations: recommendations.map((r, i) => ({
            ...r,
            priority: i + 1,
          })),
          message: 'Platform recommendations generated.',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Generation failed';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Platform recommendation failed: ${errorMessage}`,
        });
      }
    }),

  // Get all platform recommendations for a client
  getPlatformRecommendations: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const recommendations = await ctx.drizzle
        .select()
        .from(schema.platform_recommendations)
        .where(eq(schema.platform_recommendations.client_id, input.clientId))
        .orderBy(schema.platform_recommendations.priority)
        .all();

      const primary = recommendations
        .filter((r) => r.status === 'primary')
        .map((r) => ({
          id: r.id,
          platform: r.platform,
          priority: r.priority,
          rationale: r.rationale,
          contentTypes: r.content_types ? JSON.parse(r.content_types) : [],
          postingCadence: r.posting_cadence,
        }));

      const secondary = recommendations
        .filter((r) => r.status === 'secondary')
        .map((r) => ({
          id: r.id,
          platform: r.platform,
          priority: r.priority,
          rationale: r.rationale,
          contentTypes: r.content_types ? JSON.parse(r.content_types) : [],
          postingCadence: r.posting_cadence,
        }));

      const excluded = recommendations
        .filter((r) => r.status === 'excluded')
        .map((r) => ({
          id: r.id,
          platform: r.platform,
          priority: r.priority,
        }));

      return { primary, secondary, excluded };
    }),

  // AC2: Update platform priority (drag to reorder)
  updatePlatformPriority: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        platformId: z.string().uuid(),
        newPriority: z.number().int().min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const platform = await ctx.drizzle
        .select()
        .from(schema.platform_recommendations)
        .where(
          and(
            eq(schema.platform_recommendations.id, input.platformId),
            eq(schema.platform_recommendations.client_id, input.clientId)
          )
        )
        .get();

      if (!platform) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Platform recommendation not found',
        });
      }

      const now = Date.now();
      await ctx.drizzle
        .update(schema.platform_recommendations)
        .set({
          priority: input.newPriority,
          updated_at: now,
        })
        .where(eq(schema.platform_recommendations.id, input.platformId))
        .run();

      return {
        platformId: input.platformId,
        newPriority: input.newPriority,
        message: 'Priority updated',
      };
    }),

  // AC2: Toggle platform status (primary/secondary/excluded)
  togglePlatformStatus: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        platformId: z.string().uuid(),
        newStatus: z.enum(['primary', 'secondary', 'excluded']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const platform = await ctx.drizzle
        .select()
        .from(schema.platform_recommendations)
        .where(
          and(
            eq(schema.platform_recommendations.id, input.platformId),
            eq(schema.platform_recommendations.client_id, input.clientId)
          )
        )
        .get();

      if (!platform) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Platform recommendation not found',
        });
      }

      const now = Date.now();
      await ctx.drizzle
        .update(schema.platform_recommendations)
        .set({
          status: input.newStatus,
          updated_at: now,
        })
        .where(eq(schema.platform_recommendations.id, input.platformId))
        .run();

      return {
        platformId: input.platformId,
        newStatus: input.newStatus,
        message: `Platform moved to ${input.newStatus}`,
      };
    }),

  // ===== Story 1.5-2-8: Content Medium Preferences =====

  // AC1: Get or create medium preferences
  getMediumPreferences: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const prefs = await ctx.drizzle
        .select()
        .from(schema.content_medium_preferences)
        .where(eq(schema.content_medium_preferences.client_id, input.clientId))
        .get();

      if (!prefs) {
        // Return defaults
        return {
          mediums: [
            { type: 'written', rank: 1, label: 'Written (articles, posts)' },
            { type: 'video', rank: 2, label: 'Video (reels, tutorials)' },
            { type: 'audio', rank: 3, label: 'Audio (podcasts, voice notes)' },
            { type: 'visual', rank: 4, label: 'Visual (graphics, infographics)' },
          ],
        };
      }

      return {
        mediums: [
          { type: 'written', rank: prefs.written_rank, label: 'Written (articles, posts)' },
          { type: 'video', rank: prefs.video_rank, label: 'Video (reels, tutorials)' },
          { type: 'audio', rank: prefs.audio_rank, label: 'Audio (podcasts, voice notes)' },
          { type: 'visual', rank: prefs.visual_rank, label: 'Visual (graphics, infographics)' },
        ].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)),
      };
    }),

  // AC1 & AC2: Update medium rankings
  updateMediumPreferences: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        rankings: z.object({
          written: z.number().int().min(1).max(4),
          video: z.number().int().min(1).max(4),
          audio: z.number().int().min(1).max(4),
          visual: z.number().int().min(1).max(4),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Validate unique rankings
      const rankValues = Object.values(input.rankings);
      const uniqueRanks = new Set(rankValues);
      if (uniqueRanks.size !== 4) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Each medium must have a unique rank (1-4)',
        });
      }

      const existing = await ctx.drizzle
        .select()
        .from(schema.content_medium_preferences)
        .where(eq(schema.content_medium_preferences.client_id, input.clientId))
        .get();

      const now = Date.now();

      if (existing) {
        const result = await ctx.drizzle
          .update(schema.content_medium_preferences)
          .set({
            written_rank: input.rankings.written,
            video_rank: input.rankings.video,
            audio_rank: input.rankings.audio,
            visual_rank: input.rankings.visual,
            updated_at: now,
          })
          .where(eq(schema.content_medium_preferences.client_id, input.clientId))
          .run();

        if (result.meta.changes === 0) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update preferences: No changes applied',
          });
        }
      } else {
        await ctx.drizzle.insert(schema.content_medium_preferences).values({
          id: crypto.randomUUID(),
          client_id: input.clientId,
          written_rank: input.rankings.written,
          video_rank: input.rankings.video,
          audio_rank: input.rankings.audio,
          visual_rank: input.rankings.visual,
          created_at: now,
          updated_at: now,
        }).run();
      }

      return {
        message: 'Content medium preferences saved. We\'ll prioritize your preferred formats in spoke generation.',
      };
    }),

  // ===== Story 1.5-2-9: Posting Cadence Proposal =====

  // AC1: Generate cadence recommendations per platform
  generateCadenceRecommendations: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get existing platform recommendations
      const platforms = await ctx.drizzle
        .select()
        .from(schema.platform_recommendations)
        .where(
          and(
            eq(schema.platform_recommendations.client_id, input.clientId),
            eq(schema.platform_recommendations.status, 'primary')
          )
        )
        .all();

      // Add secondary platforms
      const secondaryPlatforms = await ctx.drizzle
        .select()
        .from(schema.platform_recommendations)
        .where(
          and(
            eq(schema.platform_recommendations.client_id, input.clientId),
            eq(schema.platform_recommendations.status, 'secondary')
          )
        )
        .all();

      const allPlatforms = [...platforms, ...secondaryPlatforms];

      if (allPlatforms.length === 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Generate platform recommendations first',
        });
      }

      // Standard cadence recommendations by platform
      const standardCadence: Record<string, { frequency: string; bestTimes: string[] }> = {
        'LinkedIn': { frequency: '3x/week', bestTimes: ['Tuesday 9am', 'Wednesday 12pm', 'Thursday 2pm'] },
        'Twitter': { frequency: '5x/day', bestTimes: ['8am', '12pm', '3pm', '6pm', '9pm'] },
        'Instagram': { frequency: '1x/day', bestTimes: ['11am', '2pm', '7pm'] },
        'TikTok': { frequency: '1-2x/day', bestTimes: ['7pm', '9pm'] },
        'YouTube': { frequency: '1x/week', bestTimes: ['Friday 3pm', 'Saturday 10am'] },
        'Facebook': { frequency: '1x/day', bestTimes: ['1pm', '4pm'] },
        'Threads': { frequency: '3x/day', bestTimes: ['8am', '12pm', '6pm'] },
        'Newsletter': { frequency: '1x/week', bestTimes: ['Tuesday 10am', 'Thursday 10am'] },
      };

      const now = Date.now();
      const cadenceRecommendations = [];

      // Story 1.5-2-9: Use a transaction for multiple platform updates
      await ctx.drizzle.transaction(async (tx) => {
        for (const platform of allPlatforms) {
          const standard = standardCadence[platform.platform] || { frequency: '2x/week', bestTimes: ['9am'] };

          await tx
            .update(schema.platform_recommendations)
            .set({
              posting_cadence: standard.frequency,
              best_times: JSON.stringify(standard.bestTimes),
              updated_at: now,
            })
            .where(eq(schema.platform_recommendations.id, platform.id))
            .run();

          cadenceRecommendations.push({
            platform: platform.platform,
            status: platform.status,
            frequency: standard.frequency,
            bestTimes: standard.bestTimes,
            weeklyPosts: calculateWeeklyPosts(standard.frequency),
          });
        }
      });

      // Calculate total weekly commitment
      const totalWeeklyPosts = cadenceRecommendations.reduce((sum, r) => sum + r.weeklyPosts, 0);
      const isRealistic = totalWeeklyPosts <= 20;

      return {
        recommendations: cadenceRecommendations,
        totalWeeklyPosts,
        isRealistic,
        warning: isRealistic
          ? null
          : `${totalWeeklyPosts} posts/week is ambitious for a solo creator. Consider reducing secondary platform frequency.`,
        message: 'Cadence recommendations generated.',
      };
    }),

  // AC2: Update cadence for a specific platform
  updatePlatformCadence: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        platformId: z.string().uuid(),
        frequency: z.string().min(1).max(50),
        bestTimes: z.array(z.string()).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const platform = await ctx.drizzle
        .select()
        .from(schema.platform_recommendations)
        .where(
          and(
            eq(schema.platform_recommendations.id, input.platformId),
            eq(schema.platform_recommendations.client_id, input.clientId)
          )
        )
        .get();

      if (!platform) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Platform recommendation not found',
        });
      }

      const now = Date.now();
      await ctx.drizzle
        .update(schema.platform_recommendations)
        .set({
          posting_cadence: input.frequency,
          best_times: input.bestTimes ? JSON.stringify(input.bestTimes) : platform.best_times,
          updated_at: now,
        })
        .where(eq(schema.platform_recommendations.id, input.platformId))
        .run();

      // AC2: Warn if unrealistic for solo creator
      const weeklyPosts = calculateWeeklyPosts(input.frequency);
      const warning =
        weeklyPosts > 7
          ? `${input.frequency} is ambitious for ${platform.platform}. Consider if this is sustainable.`
          : null;

      return {
        platformId: input.platformId,
        frequency: input.frequency,
        weeklyPosts,
        warning,
        message: 'Cadence updated',
      };
    }),

  // ===== Story 1.5-2-10: Single Audience Prompt (Simplified Flow) =====

  // AC2 & AC3: Create persona from one-sentence description
  createQuickPersona: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        description: z.string().min(10).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const prompt = `You are an audience persona expert. Based on this one-sentence description, create a complete audience persona.

Description: "${input.description}"

Generate a comprehensive persona with:
1. A memorable persona name (e.g., "Scaling Sarah")
2. Demographics: age_range, gender, location, income_level, education, occupation
3. Psychographics: values (3-5), interests (5-7), pain_points (3-5), goals (3-5)
4. Content Preferences: preferred_platforms (2-4), content_types (3-5), consumption_time, engagement_style

Respond ONLY with valid JSON:
{
  "name": "string",
  "age_range": "string",
  "gender": "string",
  "location": "string",
  "income_level": "string",
  "education": "string",
  "occupation": "string",
  "values": ["array of strings"],
  "interests": ["array of strings"],
  "pain_points": ["array of strings"],
  "goals": ["array of strings"],
  "preferred_platforms": ["array of strings"],
  "content_types": ["array of strings"],
  "consumption_time": "string",
  "engagement_style": "string",
  "summary": "2-3 sentence summary"
}`;

      try {
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt,
          max_tokens: 1000,
        });

        // Story 1.5-2-10: Use standardized safe parsing
        const extracted = safeParseJSON(result.response || '', {
          name: 'Target Audience',
          summary: input.description,
        } as any);

        const personaId = crypto.randomUUID();
        const now = Date.now();

        await ctx.drizzle.insert(schema.audience_personas).values({
          id: personaId,
          client_id: input.clientId,
          name: extracted.name || 'Target Audience',
          status: 'draft',
          source: 'generated',
          age_range: extracted.age_range || null,
          gender: extracted.gender || null,
          location: extracted.location || null,
          income_level: extracted.income_level || null,
          education: extracted.education || null,
          occupation: extracted.occupation || null,
          values: extracted.values ? JSON.stringify(extracted.values) : null,
          interests: extracted.interests ? JSON.stringify(extracted.interests) : null,
          pain_points: extracted.pain_points ? JSON.stringify(extracted.pain_points) : null,
          goals: extracted.goals ? JSON.stringify(extracted.goals) : null,
          preferred_platforms: extracted.preferred_platforms ? JSON.stringify(extracted.preferred_platforms) : null,
          content_types: extracted.content_types ? JSON.stringify(extracted.content_types) : null,
          consumption_time: extracted.consumption_time || null,
          engagement_style: extracted.engagement_style || null,
          summary: extracted.summary || input.description,
          created_at: now,
          updated_at: now,
        }).run();

        return {
          personaId,
          name: extracted.name || 'Target Audience',
          status: 'draft' as const,
          source: 'generated' as const,
          expanded: {
            demographics: {
              ageRange: extracted.age_range,
              gender: extracted.gender,
              location: extracted.location,
              incomeLevel: extracted.income_level,
              education: extracted.education,
              occupation: extracted.occupation,
            },
            psychographics: {
              values: extracted.values || [],
              interests: extracted.interests || [],
              painPoints: extracted.pain_points || [],
              goals: extracted.goals || [],
            },
            contentPreferences: {
              preferredPlatforms: extracted.preferred_platforms || [],
              contentTypes: extracted.content_types || [],
              consumptionTime: extracted.consumption_time,
              engagementStyle: extracted.engagement_style,
            },
            summary: extracted.summary,
          },
          note: 'AI-Expanded - refine for better results',
          message: 'Persona generated from your description. Review and approve, or edit to refine.',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Generation failed';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Persona expansion failed: ${errorMessage}`,
        });
      }
    }),

  // AC4: Convert generated persona to guided flow for editing
  switchToGuidedFlow: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        personaId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const persona = await ctx.drizzle
        .select()
        .from(schema.audience_personas)
        .where(
          and(
            eq(schema.audience_personas.id, input.personaId),
            eq(schema.audience_personas.client_id, input.clientId)
          )
        )
        .get();

      if (!persona) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audience persona not found',
        });
      }

      // Return the current state for editing in guided flow
      return {
        personaId: input.personaId,
        currentStep: 'demographics',
        preFilledData: {
          name: persona.name,
          demographics: {
            ageRange: persona.age_range,
            gender: persona.gender,
            location: persona.location,
            incomeLevel: persona.income_level,
            education: persona.education,
            occupation: persona.occupation,
          },
          psychographics: {
            values: persona.values ? JSON.parse(persona.values) : [],
            interests: persona.interests ? JSON.parse(persona.interests) : [],
            painPoints: persona.pain_points ? JSON.parse(persona.pain_points) : [],
            goals: persona.goals ? JSON.parse(persona.goals) : [],
          },
          contentPreferences: {
            preferredPlatforms: persona.preferred_platforms ? JSON.parse(persona.preferred_platforms) : [],
            contentTypes: persona.content_types ? JSON.parse(persona.content_types) : [],
            consumptionTime: persona.consumption_time,
            engagementStyle: persona.engagement_style,
          },
        },
        message: 'Switched to guided flow. Your AI-generated answers are pre-filled for editing.',
      };
    }),

  // AC3: Complete Epic 2 - Get full strategy summary
  getStrategyComplete: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get all components
      const personas = await ctx.drizzle
        .select()
        .from(schema.audience_personas)
        .where(
          and(
            eq(schema.audience_personas.client_id, input.clientId),
            eq(schema.audience_personas.status, 'approved')
          )
        )
        .all();

      const platforms = await ctx.drizzle
        .select()
        .from(schema.platform_recommendations)
        .where(eq(schema.platform_recommendations.client_id, input.clientId))
        .orderBy(schema.platform_recommendations.priority)
        .all();

      const mediums = await ctx.drizzle
        .select()
        .from(schema.content_medium_preferences)
        .where(eq(schema.content_medium_preferences.client_id, input.clientId))
        .get();

      const isComplete =
        personas.length > 0 &&
        platforms.filter((p) => p.status === 'primary').length >= 2 &&
        mediums !== null;

      return {
        isComplete,
        summary: {
          approvedPersonas: personas.length,
          primaryPlatforms: platforms.filter((p) => p.status === 'primary').map((p) => p.platform),
          secondaryPlatforms: platforms.filter((p) => p.status === 'secondary').map((p) => p.platform),
          preferredMedium: mediums
            ? getMediumByRank(mediums, 1)
            : 'Written',
          totalWeeklyPosts: platforms.reduce(
            (sum, p) => sum + calculateWeeklyPosts(p.posting_cadence || '0'),
            0
          ),
        },
        message: isComplete
          ? 'Epic 2 complete! Your audience and strategy discovery is ready.'
          : 'Complete remaining steps to finalize your strategy.',
      };
    }),
});
