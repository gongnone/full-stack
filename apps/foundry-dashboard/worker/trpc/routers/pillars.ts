/**
 * Pillars Router
 *
 * Phase 1.5 Epic 3: BrandDNA Agent - Pillars & Report
 * Stories:
 * - 1.5-3-1: Topic Pillar Generation
 * - 1.5-3-2: Pillar Rationale Display
 * - 1.5-3-3: Pillar Approve/Edit/Regenerate
 * - 1.5-3-4: Store Approved Pillars
 * - 1.5-3-5: Generate Brand DNA Report
 * - 1.5-3-6: Brand DNA Strength Score
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';
import * as schema from '../../db/schema';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Brand Story Framework types for pillar generation
type FrameworkType = 'catalyst' | 'core_truth' | 'proof';

interface PillarRationale {
  voiceConnection: string;
  audienceAlignment: string;
  competitorDifferentiation: string;
}

interface ScoreBreakdown {
  voice: number;      // 0-30
  audience: number;   // 0-25
  pillars: number;    // 0-20
  platform: number;   // 0-25
}

// Pillar generation prompt
const PILLAR_GENERATION_PROMPT = `You are a brand strategist creating content topic pillars using the Brand Story Framework.

The Brand Story Framework has three components:
1. CATALYST: Topics that challenge the status quo, provoke thought, disrupt conventional wisdom
2. CORE_TRUTH: Topics that reveal authentic insights, share hard-won wisdom, build trust
3. PROOF: Topics that demonstrate results, showcase expertise, provide evidence

Based on the following brand and audience information, generate 3-5 strategic content pillars:

BRAND VOICE ANALYSIS:
`;

// Helper: Safely parse JSON (Story 1.5-3)
function safeParseJSON<T>(text: string | null | undefined, fallback: T): T {
  if (!text) return fallback;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/) || text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return JSON.parse(text) as T;
  } catch (e) {
    console.error('JSON Parse Error:', e);
    return fallback;
  }
}

export const pillarsRouter = t.router({
  // ===== Story 1.5-3-1: Topic Pillar Generation =====

  // AC1: Generate 3-5 topic pillars
  generatePillars: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const startTime = Date.now();

      // Gather context from previous epics
      const [brandDna, personas, platforms, sessions] = await Promise.all([
        ctx.drizzle
          .select()
          .from(schema.brand_dna)
          .where(eq(schema.brand_dna.client_id, input.clientId))
          .get(),
        ctx.drizzle
          .select()
          .from(schema.audience_personas)
          .where(
            and(
              eq(schema.audience_personas.client_id, input.clientId),
              eq(schema.audience_personas.status, 'approved')
            )
          )
          .all(),
        ctx.drizzle
          .select()
          .from(schema.platform_recommendations)
          .where(eq(schema.platform_recommendations.client_id, input.clientId))
          .all(),
        ctx.drizzle
          .select()
          .from(schema.brand_dna_sessions)
          .where(eq(schema.brand_dna_sessions.client_id, input.clientId))
          .orderBy(desc(schema.brand_dna_sessions.updated_at))
          .limit(1)
          .all(),
      ]);

      // Build prompt context
      const voiceContext = brandDna
        ? `
Primary Tone: ${brandDna.primary_tone || 'Professional'}
Writing Style: ${brandDna.writing_style || 'Informative'}
Target Audience: ${brandDna.target_audience || 'General'}
Voice Entities: ${brandDna.voice_entities || '{}'}
`
        : 'No voice analysis available yet.';

      const audienceContext = personas.length > 0
        ? personas.map(p => `
Persona: ${p.name}
Pain Points: ${p.pain_points || '[]'}
Goals: ${p.goals || '[]'}
Interests: ${p.interests || '[]'}
`).join('\n')
        : 'No audience personas defined yet.';

      const competitorContext = sessions[0]?.competitors
        ? `Competitors: ${sessions[0].competitors}`
        : 'No competitor data provided.';

      const platformContext = platforms.length > 0
        ? `Primary Platforms: ${platforms.filter(p => p.status === 'primary').map(p => p.platform).join(', ')}`
        : 'No platform strategy defined yet.';

      const fullPrompt = `${PILLAR_GENERATION_PROMPT}
${voiceContext}

AUDIENCE INSIGHTS:
${audienceContext}

COMPETITIVE LANDSCAPE:
${competitorContext}

PLATFORM FOCUS:
${platformContext}

Generate 3-5 content pillars. For each pillar, provide:
1. title: A compelling 3-5 word title
2. description: 1-2 sentences explaining the pillar
3. framework_type: "catalyst", "core_truth", or "proof"
4. rationale: { voiceConnection, audienceAlignment, competitorDifferentiation }

Respond ONLY with valid JSON array:
[
  {
    "title": "string",
    "description": "string",
    "framework_type": "catalyst|core_truth|proof",
    "rationale": {
      "voiceConnection": "How this pillar reflects the brand voice",
      "audienceAlignment": "How this addresses audience pain points/goals",
      "competitorDifferentiation": "How this stands out from competitors"
    }
  }
]`;

      try {
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt: fullPrompt,
          max_tokens: 1500,
        });

        let pillars: Array<{
          title: string;
          description: string;
          framework_type: FrameworkType;
          rationale: PillarRationale;
        }> = [];

        try {
          const responseText = result.response || '';
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            pillars = JSON.parse(jsonMatch[0]);
          }
        } catch {
          // Default pillars if AI fails
          pillars = [
            {
              title: 'Industry Disruption Insights',
              description: 'Challenge conventional thinking in your industry',
              framework_type: 'catalyst',
              rationale: {
                voiceConnection: 'Aligns with thought leadership tone',
                audienceAlignment: 'Addresses desire for fresh perspectives',
                competitorDifferentiation: 'Few competitors take contrarian stances',
              },
            },
            {
              title: 'Behind-the-Scenes Wisdom',
              description: 'Share authentic lessons from your journey',
              framework_type: 'core_truth',
              rationale: {
                voiceConnection: 'Reflects authentic, personal voice',
                audienceAlignment: 'Builds trust through vulnerability',
                competitorDifferentiation: 'Most competitors stay surface-level',
              },
            },
            {
              title: 'Results & Case Studies',
              description: 'Demonstrate expertise through concrete examples',
              framework_type: 'proof',
              rationale: {
                voiceConnection: 'Supports credibility claims',
                audienceAlignment: 'Provides evidence for decision-making',
                competitorDifferentiation: 'Shows tangible outcomes',
              },
            },
          ];
        }

        // Clear existing proposed pillars
        await ctx.drizzle
          .delete(schema.content_pillars)
          .where(
            and(
              eq(schema.content_pillars.client_id, input.clientId),
              eq(schema.content_pillars.status, 'proposed')
            )
          )
          .run();

        // Insert new pillars
        const now = Date.now();
        const insertedPillars = [];

        for (let i = 0; i < pillars.length; i++) {
          const pillar = pillars[i];
          if (!pillar) continue;
          const id = crypto.randomUUID();

          await ctx.drizzle.insert(schema.content_pillars).values({
            id,
            client_id: input.clientId,
            title: pillar.title,
            description: pillar.description,
            rationale: JSON.stringify(pillar.rationale),
            status: 'proposed',
            priority: i + 1,
            framework_type: pillar.framework_type,
            generated_by: 'ai',
            created_at: now,
            updated_at: now,
          }).run();

          insertedPillars.push({
            id,
            title: pillar.title,
            description: pillar.description,
            frameworkType: pillar.framework_type,
            rationale: pillar.rationale,
            status: 'proposed',
            priority: i + 1,
          });
        }

        // Sync to Durable Object state
        try {
          await ctx.callAgent(input.clientId, 'sync_pillars', { pillars: insertedPillars });
        } catch (e) {
          console.warn('Failed to sync pillars to DO:', e);
        }

        const generationTime = Date.now() - startTime;

        return {
          pillars: insertedPillars,
          count: insertedPillars.length,
          generationTimeMs: generationTime,
          meetsNFR: generationTime < 30000, // NFR-1.5-P3: < 30 seconds
          message: `Generated ${insertedPillars.length} content pillars in ${(generationTime / 1000).toFixed(1)}s`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Generation failed';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Pillar generation failed: ${errorMessage}`,
        });
      }
    }),

  // ===== Story 1.5-3-2: Pillar Rationale Display =====

  // Get all pillars with full rationale
  getPillars: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        status: z.enum(['proposed', 'approved', 'rejected', 'all']).optional().default('all'),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      let query = ctx.drizzle
        .select()
        .from(schema.content_pillars)
        .where(eq(schema.content_pillars.client_id, input.clientId));

      if (input.status !== 'all') {
        query = ctx.drizzle
          .select()
          .from(schema.content_pillars)
          .where(
            and(
              eq(schema.content_pillars.client_id, input.clientId),
              eq(schema.content_pillars.status, input.status)
            )
          );
      }

      const pillars = await query.orderBy(schema.content_pillars.priority).all();

      return pillars.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        rationale: p.rationale ? JSON.parse(p.rationale) as PillarRationale : null,
        status: p.status,
        priority: p.priority,
        frameworkType: p.framework_type as FrameworkType | null,
        generatedBy: p.generated_by,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    }),

  // Get single pillar with expanded rationale
  getPillar: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        pillarId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const pillar = await ctx.drizzle
        .select()
        .from(schema.content_pillars)
        .where(
          and(
            eq(schema.content_pillars.id, input.pillarId),
            eq(schema.content_pillars.client_id, input.clientId)
          )
        )
        .get();

      if (!pillar) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content pillar not found',
        });
      }

      return {
        id: pillar.id,
        title: pillar.title,
        description: pillar.description,
        rationale: pillar.rationale ? JSON.parse(pillar.rationale) as PillarRationale : null,
        status: pillar.status,
        priority: pillar.priority,
        frameworkType: pillar.framework_type as FrameworkType | null,
        generatedBy: pillar.generated_by,
        createdAt: pillar.created_at,
        updatedAt: pillar.updated_at,
      };
    }),

  // ===== Story 1.5-3-3: Pillar Approve/Edit/Regenerate =====

  // AC1: Approve individual pillar
  approvePillar: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        pillarId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const pillar = await ctx.drizzle
        .select()
        .from(schema.content_pillars)
        .where(
          and(
            eq(schema.content_pillars.id, input.pillarId),
            eq(schema.content_pillars.client_id, input.clientId)
          )
        )
        .get();

      if (!pillar) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content pillar not found',
        });
      }

      const now = Date.now();
      await ctx.drizzle
        .update(schema.content_pillars)
        .set({
          status: 'approved',
          updated_at: now,
        })
        .where(eq(schema.content_pillars.id, input.pillarId))
        .run();

      return {
        pillarId: input.pillarId,
        status: 'approved' as const,
        message: `"${pillar.title}" approved!`,
      };
    }),

  // AC2: Edit pillar
  updatePillar: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        pillarId: z.string().uuid(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const pillar = await ctx.drizzle
        .select()
        .from(schema.content_pillars)
        .where(
          and(
            eq(schema.content_pillars.id, input.pillarId),
            eq(schema.content_pillars.client_id, input.clientId)
          )
        )
        .get();

      if (!pillar) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content pillar not found',
        });
      }

      const now = Date.now();
      await ctx.drizzle
        .update(schema.content_pillars)
        .set({
          title: input.title ?? pillar.title,
          description: input.description ?? pillar.description,
          generated_by: 'user', // Mark as user-edited
          updated_at: now,
        })
        .where(eq(schema.content_pillars.id, input.pillarId))
        .run();

      return {
        pillarId: input.pillarId,
        message: 'Pillar updated',
      };
    }),

  // AC3: Regenerate individual pillar with feedback
  regeneratePillar: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        pillarId: z.string().uuid(),
        feedback: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const pillar = await ctx.drizzle
        .select()
        .from(schema.content_pillars)
        .where(
          and(
            eq(schema.content_pillars.id, input.pillarId),
            eq(schema.content_pillars.client_id, input.clientId)
          )
        )
        .get();

      if (!pillar) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content pillar not found',
        });
      }

      const prompt = `Generate an alternative content pillar to replace this one:

Current Pillar: "${pillar.title}"
Description: "${pillar.description}"
Framework Type: ${pillar.framework_type || 'catalyst'}
${input.feedback ? `User Feedback: "${input.feedback}"` : ''}

Generate a different angle while keeping the same framework type. Respond with JSON:
{
  "title": "New 3-5 word title",
  "description": "1-2 sentence description",
  "rationale": {
    "voiceConnection": "How this reflects brand voice",
    "audienceAlignment": "How this addresses audience needs",
    "competitorDifferentiation": "How this stands out"
  }
}`;

      try {
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt,
          max_tokens: 500,
        });

        let newPillar: {
          title: string;
          description: string;
          rationale: PillarRationale;
        };

        try {
          const responseText = result.response || '';
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            newPillar = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found');
          }
        } catch {
          newPillar = {
            title: 'Alternative Perspective',
            description: 'A fresh take on this topic area',
            rationale: {
              voiceConnection: 'Maintains brand voice',
              audienceAlignment: 'Addresses similar needs differently',
              competitorDifferentiation: 'Unique angle',
            },
          };
        }

        const now = Date.now();
        await ctx.drizzle
          .update(schema.content_pillars)
          .set({
            title: newPillar.title,
            description: newPillar.description,
            rationale: JSON.stringify(newPillar.rationale),
            status: 'proposed',
            generated_by: 'ai',
            updated_at: now,
          })
          .where(eq(schema.content_pillars.id, input.pillarId))
          .run();

        return {
          pillarId: input.pillarId,
          previous: {
            title: pillar.title,
            description: pillar.description,
          },
          new: {
            title: newPillar.title,
            description: newPillar.description,
            rationale: newPillar.rationale,
          },
          message: 'Pillar regenerated. Compare and decide.',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Regeneration failed';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Pillar regeneration failed: ${errorMessage}`,
        });
      }
    }),

  // AC4: Bulk approve all pillars
  approveAllPillars: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const proposedPillars = await ctx.drizzle
        .select()
        .from(schema.content_pillars)
        .where(
          and(
            eq(schema.content_pillars.client_id, input.clientId),
            eq(schema.content_pillars.status, 'proposed')
          )
        )
        .all();

      if (proposedPillars.length === 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'No proposed pillars to approve',
        });
      }

      const now = Date.now();
      await ctx.drizzle
        .update(schema.content_pillars)
        .set({
          status: 'approved',
          updated_at: now,
        })
        .where(
          and(
            eq(schema.content_pillars.client_id, input.clientId),
            eq(schema.content_pillars.status, 'proposed')
          )
        )
        .run();

      return {
        approvedCount: proposedPillars.length,
        message: `All ${proposedPillars.length} pillars approved! Ready for Brand DNA Report.`,
      };
    }),

  // ===== Story 1.5-3-5: Generate Brand DNA Report =====

  generateReport: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Gather all data
      const [brandDna, personas, platforms, pillars, mediums, sessions] = await Promise.all([
        ctx.drizzle.select().from(schema.brand_dna).where(eq(schema.brand_dna.client_id, input.clientId)).get(),
        ctx.drizzle.select().from(schema.audience_personas).where(and(eq(schema.audience_personas.client_id, input.clientId), eq(schema.audience_personas.status, 'approved'))).all(),
        ctx.drizzle.select().from(schema.platform_recommendations).where(eq(schema.platform_recommendations.client_id, input.clientId)).all(),
        ctx.drizzle.select().from(schema.content_pillars).where(and(eq(schema.content_pillars.client_id, input.clientId), eq(schema.content_pillars.status, 'approved'))).all(),
        ctx.drizzle.select().from(schema.content_medium_preferences).where(eq(schema.content_medium_preferences.client_id, input.clientId)).get(),
        ctx.drizzle.select().from(schema.brand_dna_sessions).where(eq(schema.brand_dna_sessions.client_id, input.clientId)).all(),
      ]);

      // Generate tone summary
      const toneSummary = brandDna
        ? `Your brand voice is ${brandDna.primary_tone || 'professional'} with a ${brandDna.writing_style || 'clear'} writing style.`
        : 'Voice analysis pending.';

      // Compile vocabulary insights
      const vocabularyInsights = safeParseJSON(brandDna?.voice_entities, { 
        common_phrases: [], 
        avoided_words: [] 
      });

      // Compile persona summary
      const personaSummary = personas.length > 0
        ? personas.map(p => p.summary || p.name).join('; ')
        : 'No audience personas approved yet.';

      // Compile platform strategy
      const platformStrategy = {
        primary: platforms.filter(p => p.status === 'primary').map(p => ({ platform: p.platform, rationale: p.rationale })),
        secondary: platforms.filter(p => p.status === 'secondary').map(p => ({ platform: p.platform, rationale: p.rationale })),
      };

      // Compile pillars summary
      const pillarsSummary = pillars.map(p => ({
        title: p.title,
        description: p.description,
        frameworkType: p.framework_type,
      }));

      // Calculate strength score (Story 1.5-3-6)
      const scoreBreakdown: ScoreBreakdown = {
        voice: Math.min(30, (sessions.length * 10) + (brandDna?.sample_count || 0) * 2),
        audience: Math.min(25, personas.length * 8 + (mediums ? 5 : 0)),
        pillars: Math.min(20, pillars.length * 4),
        platform: Math.min(25, platforms.filter(p => p.status === 'primary').length * 8 + platforms.filter(p => p.posting_cadence).length * 2),
      };

      const strengthScore = scoreBreakdown.voice + scoreBreakdown.audience + scoreBreakdown.pillars + scoreBreakdown.platform;

      // Generate recommendations
      const recommendations: string[] = [];
      if (scoreBreakdown.voice < 20) recommendations.push('Add more voice samples to strengthen brand voice analysis');
      if (scoreBreakdown.audience < 15) recommendations.push('Complete audience persona details for better targeting');
      if (scoreBreakdown.pillars < 12) recommendations.push('Generate and approve more content pillars');
      if (scoreBreakdown.platform < 15) recommendations.push('Finalize platform strategy and posting cadence');

      // Store report
      const now = Date.now();
      const existingReport = await ctx.drizzle
        .select()
        .from(schema.brand_dna_reports)
        .where(eq(schema.brand_dna_reports.client_id, input.clientId))
        .get();

      const reportData = {
        tone_summary: toneSummary,
        vocabulary_insights: JSON.stringify(vocabularyInsights),
        persona_summary: personaSummary,
        platform_strategy: JSON.stringify(platformStrategy),
        pillars_summary: JSON.stringify(pillarsSummary),
        strength_score: strengthScore,
        score_breakdown: JSON.stringify(scoreBreakdown),
        recommendations: JSON.stringify(recommendations),
        updated_at: now,
      };

      if (existingReport) {
        await ctx.drizzle
          .update(schema.brand_dna_reports)
          .set(reportData)
          .where(eq(schema.brand_dna_reports.client_id, input.clientId))
          .run();
      } else {
        await ctx.drizzle.insert(schema.brand_dna_reports).values({
          id: crypto.randomUUID(),
          client_id: input.clientId,
          ...reportData,
          generated_at: now,
        }).run();
      }

      return {
        report: {
          toneSummary,
          vocabularyInsights,
          personaSummary,
          platformStrategy,
          pillarsSummary,
          strengthScore,
          scoreBreakdown,
          recommendations,
          status: strengthScore >= 85 ? 'strong' : strengthScore >= 70 ? 'good' : 'needs-improvement',
        },
        message: strengthScore >= 85
          ? 'Brand DNA Report complete. Your brand profile is strong!'
          : 'Brand DNA Report generated. See recommendations for improvement.',
      };
    }),

  // Get existing report
  getReport: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const report = await ctx.drizzle
        .select()
        .from(schema.brand_dna_reports)
        .where(eq(schema.brand_dna_reports.client_id, input.clientId))
        .get();

      if (!report) {
        return null;
      }

      return {
        toneSummary: report.tone_summary,
        vocabularyInsights: report.vocabulary_insights ? JSON.parse(report.vocabulary_insights) : null,
        personaSummary: report.persona_summary,
        platformStrategy: report.platform_strategy ? JSON.parse(report.platform_strategy) : null,
        pillarsSummary: report.pillars_summary ? JSON.parse(report.pillars_summary) : [],
        strengthScore: report.strength_score,
        scoreBreakdown: report.score_breakdown ? JSON.parse(report.score_breakdown) as ScoreBreakdown : null,
        recommendations: report.recommendations ? JSON.parse(report.recommendations) as string[] : [],
        status: (report.strength_score || 0) >= 85 ? 'strong' : (report.strength_score || 0) >= 70 ? 'good' : 'needs-improvement',
        generatedAt: report.generated_at,
        updatedAt: report.updated_at,
      };
    }),

  // ===== Story 3.6: Pillar-First Hub Creation =====

  // Get approved pillars transformed for Hub wizard format
  getApprovedPillarsForHub: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get approved pillars from content_pillars table
      const pillars = await ctx.drizzle
        .select()
        .from(schema.content_pillars)
        .where(
          and(
            eq(schema.content_pillars.client_id, input.clientId),
            eq(schema.content_pillars.status, 'approved')
          )
        )
        .orderBy(schema.content_pillars.priority)
        .all();

      // Transform to Hub wizard format (extracted_pillars shape)
      return pillars.map(p => {
        // Map framework_type to psychological angle
        const angleMap: Record<string, string> = {
          'catalyst': 'Contrarian',
          'core_truth': 'Authority',
          'proof': 'Transformation',
        };

        // Extract supporting points from rationale JSON
        let supportingPoints: string[] = [];
        if (p.rationale) {
          try {
            const rationale = JSON.parse(p.rationale) as PillarRationale;
            supportingPoints = [
              rationale.voiceConnection,
              rationale.audienceAlignment,
              rationale.competitorDifferentiation,
            ].filter(Boolean);
          } catch {
            // Ignore parse errors
          }
        }

        return {
          id: p.id,
          title: p.title,
          coreClaim: p.description || '',
          psychologicalAngle: angleMap[p.framework_type || ''] || 'Authority',
          estimatedSpokeCount: 5,
          supportingPoints,
          frameworkType: p.framework_type as FrameworkType | null,
        };
      });
    }),

  // ===== Story 1.5-3-6: Brand DNA Strength Score =====

  // Get current strength score with breakdown
  getStrengthScore: procedure
    .input(
      z.object({
        clientId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const report = await ctx.drizzle
        .select({
          strength_score: schema.brand_dna_reports.strength_score,
          score_breakdown: schema.brand_dna_reports.score_breakdown,
          recommendations: schema.brand_dna_reports.recommendations,
        })
        .from(schema.brand_dna_reports)
        .where(eq(schema.brand_dna_reports.client_id, input.clientId))
        .get();

      if (!report) {
        return {
          score: 0,
          status: 'not-generated' as const,
          breakdown: null,
          recommendations: ['Generate your Brand DNA Report to see your strength score'],
        };
      }

      const score = report.strength_score || 0;
      const breakdown = report.score_breakdown ? JSON.parse(report.score_breakdown) as ScoreBreakdown : null;
      const recommendations = report.recommendations ? JSON.parse(report.recommendations) as string[] : [];

      return {
        score,
        status: score >= 85 ? 'strong' as const : score >= 70 ? 'good' as const : 'needs-improvement' as const,
        breakdown,
        recommendations,
      };
    }),
});
