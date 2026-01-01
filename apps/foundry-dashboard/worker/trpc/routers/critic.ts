/**
 * Critic Router - Quality Scoring Lite
 *
 * Epic 1.5-5: Adversarial quality scoring for spokes
 * - G2: Hook strength scoring
 * - G4: Brand voice alignment
 * - G5: Platform compliance
 *
 * Epic 12-1: Engagement Prediction
 * - G7e: Engagement prediction (0-10 scale, 9+ = Golden Nugget)
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';
import {
  predictEngagement,
  predictionToDbFormat,
} from '../../lib/engagement-prediction';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Score thresholds
const SCORE_THRESHOLDS = {
  g2_hook: { excellent: 85, good: 70, poor: 50 },
  g4_voice: { excellent: 90, good: 75, poor: 60 },
  g5_platform: { excellent: 95, good: 80, poor: 65 },
  g7_overall: { excellent: 85, good: 70, poor: 50 },
};

// Platform requirements for compliance checking
const PLATFORM_REQUIREMENTS: Record<string, { maxChars?: number; hashtagLimit?: number; emojiPolicy?: string }> = {
  twitter: { maxChars: 280, hashtagLimit: 2, emojiPolicy: 'moderate' },
  linkedin: { maxChars: 3000, hashtagLimit: 5, emojiPolicy: 'minimal' },
  instagram: { maxChars: 2200, hashtagLimit: 30, emojiPolicy: 'liberal' },
  tiktok: { maxChars: 150, hashtagLimit: 5, emojiPolicy: 'liberal' },
  newsletter: { maxChars: 10000, hashtagLimit: 0, emojiPolicy: 'minimal' },
};

export const criticRouter = t.router({
  // ===== Story 1.5-5-1: G2 Hook Strength Scoring =====

  scoreHook: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Use Workers AI to score hook strength
      const prompt = `Rate the hook strength of this content on a scale of 0-100.
Consider: attention-grabbing opening, curiosity gap, emotional trigger, specificity.

Content:
${input.content.slice(0, 500)}

Respond with JSON only: { "score": number, "feedback": "brief explanation" }`;

      try {
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt,
          max_tokens: 150,
        });

        const parsed = JSON.parse((result as { response: string }).response);
        const score = Math.min(100, Math.max(0, parsed.score || 0));

        // Update spoke with G2 score via Durable Object
        await ctx.callAgent(input.clientId, 'updateSpokeScores', {
          spokeId: input.spokeId,
          scores: { g2_hook: score },
        });

        return {
          score,
          feedback: parsed.feedback || '',
          status: score >= SCORE_THRESHOLDS.g2_hook.excellent ? 'excellent' :
                  score >= SCORE_THRESHOLDS.g2_hook.good ? 'good' :
                  score >= SCORE_THRESHOLDS.g2_hook.poor ? 'needs-work' : 'poor',
        };
      } catch (error) {
        // Fallback to heuristic scoring if AI fails
        const hookScore = calculateHeuristicHookScore(input.content);
        return {
          score: hookScore,
          feedback: 'Scored using heuristics',
          status: hookScore >= 70 ? 'good' : 'needs-work',
        };
      }
    }),

  // ===== Story 1.5-5-2: G4 Brand Voice Alignment =====

  scoreVoiceAlignment: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get client's brand DNA for comparison
      const brandDna = await ctx.db.prepare(`
        SELECT primary_tone, writing_style, voice_entities
        FROM brand_dna WHERE client_id = ?
      `).bind(input.clientId).first();

      if (!brandDna) {
        return {
          score: 50,
          feedback: 'No Brand DNA configured - using neutral scoring',
          status: 'uncalibrated',
          voiceMarkers: [],
        };
      }

      const voiceEntities = JSON.parse((brandDna.voice_entities as string) || '{}');
      const voiceMarkers = voiceEntities.voiceMarkers || [];
      const bannedWords = voiceEntities.bannedWords || [];

      // Check for banned words (immediate flag)
      const contentLower = input.content.toLowerCase();
      const foundBanned = bannedWords.filter((word: string) =>
        contentLower.includes(word.toLowerCase())
      );

      if (foundBanned.length > 0) {
        await ctx.callAgent(input.clientId, 'updateSpokeScores', {
          spokeId: input.spokeId,
          scores: { g4_voice: 0, g5_banned: true },
        });

        return {
          score: 0,
          feedback: `Contains banned words: ${foundBanned.join(', ')}`,
          status: 'flagged',
          bannedWordsFound: foundBanned,
          voiceMarkers: [],
        };
      }

      // Use AI for voice alignment scoring
      const prompt = `Rate how well this content aligns with the brand voice on 0-100.
Brand tone: ${brandDna.primary_tone || 'professional'}
Writing style: ${brandDna.writing_style || 'clear'}
Voice markers to look for: ${voiceMarkers.slice(0, 10).join(', ')}

Content:
${input.content.slice(0, 500)}

Respond with JSON: { "score": number, "feedback": "explanation", "markersFound": ["list"] }`;

      try {
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt,
          max_tokens: 200,
        });

        const parsed = JSON.parse((result as { response: string }).response);
        const score = Math.min(100, Math.max(0, parsed.score || 50));

        await ctx.callAgent(input.clientId, 'updateSpokeScores', {
          spokeId: input.spokeId,
          scores: { g4_voice: score },
        });

        return {
          score,
          feedback: parsed.feedback || '',
          status: score >= SCORE_THRESHOLDS.g4_voice.excellent ? 'excellent' :
                  score >= SCORE_THRESHOLDS.g4_voice.good ? 'good' :
                  score >= SCORE_THRESHOLDS.g4_voice.poor ? 'needs-work' : 'poor',
          voiceMarkers: parsed.markersFound || [],
        };
      } catch {
        return {
          score: 60,
          feedback: 'AI scoring unavailable - using default',
          status: 'needs-review',
          voiceMarkers: [],
        };
      }
    }),

  // ===== Story 1.5-5-3: G5 Platform Compliance =====

  scorePlatformCompliance: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      content: z.string().min(1),
      platform: z.enum(['twitter', 'linkedin', 'instagram', 'tiktok', 'newsletter', 'thread', 'carousel']),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const requirements = PLATFORM_REQUIREMENTS[input.platform] || {};
      const issues: string[] = [];
      let score = 100;

      // Check character limit
      if (requirements.maxChars && input.content.length > requirements.maxChars) {
        const overBy = input.content.length - requirements.maxChars;
        issues.push(`${overBy} characters over limit (${requirements.maxChars} max)`);
        score -= Math.min(40, Math.floor(overBy / 10) * 5);
      }

      // Check hashtag count
      const hashtagCount = (input.content.match(/#\w+/g) || []).length;
      if (requirements.hashtagLimit !== undefined && hashtagCount > requirements.hashtagLimit) {
        issues.push(`Too many hashtags (${hashtagCount}/${requirements.hashtagLimit})`);
        score -= (hashtagCount - requirements.hashtagLimit) * 5;
      }

      // Check emoji usage
      const emojiPattern = /[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2600-\u27FF]|[\uFE00-\uFEFF]/gu;
      const emojiCount = (input.content.match(emojiPattern) || []).length;
      if (requirements.emojiPolicy === 'minimal' && emojiCount > 2) {
        issues.push(`Too many emojis for ${input.platform} (${emojiCount})`);
        score -= (emojiCount - 2) * 3;
      }

      score = Math.max(0, score);

      await ctx.callAgent(input.clientId, 'updateSpokeScores', {
        spokeId: input.spokeId,
        scores: { g5_platform: score },
      });

      return {
        score,
        feedback: issues.length > 0 ? issues.join('; ') : 'Compliant with platform requirements',
        status: score >= SCORE_THRESHOLDS.g5_platform.excellent ? 'compliant' :
                score >= SCORE_THRESHOLDS.g5_platform.good ? 'minor-issues' :
                score >= SCORE_THRESHOLDS.g5_platform.poor ? 'needs-adjustment' : 'non-compliant',
        issues,
        platform: input.platform,
        requirements,
      };
    }),

  // ===== Story 1.5-5-4: Display Scores in Review Queue =====

  getScoresForQueue: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeIds: z.array(z.string().uuid()),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const scores = await ctx.callAgent(input.clientId, 'getSpokesScores', {
        spokeIds: input.spokeIds,
      }) as Record<string, {
        g2_hook?: number;
        g4_voice?: number;
        g5_platform?: number;
        g7_overall?: number;
      }>;

      return Object.entries(scores).map(([spokeId, s]) => ({
        spokeId,
        scores: s,
        overallStatus: calculateOverallStatus(s),
        needsAttention: (s.g2_hook ?? 100) < 50 || (s.g4_voice ?? 100) < 50 || (s.g5_platform ?? 100) < 65,
      }));
    }),

  // ===== Story 1.5-5-5: Flag Low Scoring Spokes =====

  getFlaggedSpokes: procedure
    .input(z.object({
      clientId: z.string().min(1),
      threshold: z.number().min(0).max(100).default(50),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const flagged = await ctx.callAgent(input.clientId, 'getFlaggedSpokes', {
        threshold: input.threshold,
        limit: input.limit,
      }) as Array<{
        id: string;
        content: string;
        platform: string;
        qualityScores: Record<string, number | boolean>;
        flagReason: string;
      }>;

      return {
        items: flagged,
        count: flagged.length,
        threshold: input.threshold,
      };
    }),

  // ===== Story 1.5-5-6: Actionable Feedback Display =====

  getDetailedFeedback: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const spoke = await ctx.callAgent(input.clientId, 'getSpoke', {
        spokeId: input.spokeId,
      }) as {
        content: string;
        platform: string;
        qualityScores?: Record<string, number | boolean | string>;
      } | null;

      if (!spoke) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Spoke not found' });
      }

      const scores = spoke.qualityScores || {};

      // Generate actionable feedback based on scores
      const feedback: Array<{ category: string; score: number | boolean | undefined; suggestion: string; priority: 'high' | 'medium' | 'low' }> = [];

      // Helper to extract numeric score
      const getNumericScore = (key: string): number | undefined => {
        const val = scores[key];
        return typeof val === 'number' ? val : undefined;
      };

      const g2Hook = getNumericScore('g2_hook');
      if (g2Hook !== undefined && g2Hook < 70) {
        feedback.push({
          category: 'Hook Strength',
          score: g2Hook,
          suggestion: 'Start with a bold statement, question, or surprising fact to grab attention',
          priority: g2Hook < 50 ? 'high' : 'medium',
        });
      }

      const g4Voice = getNumericScore('g4_voice');
      if (g4Voice !== undefined && g4Voice < 70) {
        feedback.push({
          category: 'Voice Alignment',
          score: g4Voice,
          suggestion: 'Adjust tone and vocabulary to better match brand voice profile',
          priority: g4Voice < 50 ? 'high' : 'medium',
        });
      }

      const g5Platform = getNumericScore('g5_platform');
      if (g5Platform !== undefined && g5Platform < 80) {
        feedback.push({
          category: 'Platform Compliance',
          score: g5Platform,
          suggestion: `Review character limits and formatting requirements for ${spoke.platform}`,
          priority: g5Platform < 65 ? 'high' : 'medium',
        });
      }

      if (scores.g5_banned === true) {
        feedback.push({
          category: 'Banned Content',
          score: true,
          suggestion: 'Remove flagged words or phrases that don\'t align with brand guidelines',
          priority: 'high',
        });
      }

      return {
        spokeId: input.spokeId,
        content: spoke.content,
        platform: spoke.platform,
        scores,
        feedback,
        overallHealth: feedback.filter(f => f.priority === 'high').length === 0 ? 'healthy' :
                       feedback.filter(f => f.priority === 'high').length <= 1 ? 'needs-attention' : 'critical',
      };
    }),

  // ===== Story 1.5-5-7: Critic Calibration from Approvals =====

  recordApprovalFeedback: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      wasApproved: z.boolean(),
      userEditedContent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const now = Date.now();

      // Store approval/rejection for calibration
      await ctx.db.prepare(`
        INSERT INTO critic_calibration_data (id, client_id, spoke_id, was_approved, user_edited_content, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        input.clientId,
        input.spokeId,
        input.wasApproved ? 1 : 0,
        input.userEditedContent || null,
        now
      ).run();

      // Calculate updated calibration stats
      const stats = await ctx.db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN was_approved = 1 THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN user_edited_content IS NOT NULL THEN 1 ELSE 0 END) as edited
        FROM critic_calibration_data
        WHERE client_id = ? AND created_at > ?
      `).bind(input.clientId, now - 30 * 24 * 60 * 60 * 1000).first(); // Last 30 days

      return {
        recorded: true,
        calibrationStats: {
          totalReviewed: (stats?.total as number) || 0,
          approvalRate: (stats?.total as number) > 0
            ? Math.round(((stats?.approved as number) || 0) / (stats?.total as number) * 100)
            : 0,
          editRate: (stats?.total as number) > 0
            ? Math.round(((stats?.edited as number) || 0) / (stats?.total as number) * 100)
            : 0,
        },
      };
    }),

  getCalibrationStats: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      const stats = await ctx.db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN was_approved = 1 THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN user_edited_content IS NOT NULL THEN 1 ELSE 0 END) as edited
        FROM critic_calibration_data
        WHERE client_id = ? AND created_at > ?
      `).bind(input.clientId, thirtyDaysAgo).first();

      return {
        totalReviewed: (stats?.total as number) || 0,
        approvalRate: (stats?.total as number) > 0
          ? Math.round(((stats?.approved as number) || 0) / (stats?.total as number) * 100)
          : 0,
        editRate: (stats?.total as number) > 0
          ? Math.round(((stats?.edited as number) || 0) / (stats?.total as number) * 100)
          : 0,
        periodDays: 30,
      };
    }),

  // ===== Story 1.5-5-8: Critic Suggests Specific Rewrites =====

  suggestRewrite: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      content: z.string().min(1),
      platform: z.enum(['twitter', 'linkedin', 'instagram', 'tiktok', 'newsletter']),
      issue: z.enum(['weak-hook', 'voice-mismatch', 'too-long', 'formatting']),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get brand DNA for context
      const brandDna = await ctx.db.prepare(`
        SELECT primary_tone, writing_style, target_audience
        FROM brand_dna WHERE client_id = ?
      `).bind(input.clientId).first();

      const requirements = PLATFORM_REQUIREMENTS[input.platform] || {};
      const issuePrompts: Record<string, string> = {
        'weak-hook': 'Rewrite with a stronger, more attention-grabbing opening. Use curiosity, controversy, or specificity.',
        'voice-mismatch': `Rewrite to match brand tone (${brandDna?.primary_tone || 'professional'}) and style (${brandDna?.writing_style || 'clear'}).`,
        'too-long': `Condense to fit ${requirements.maxChars || 280} characters while keeping the core message.`,
        'formatting': `Improve formatting for ${input.platform}: better line breaks, appropriate hashtags, and emojis.`,
      };

      const prompt = `${issuePrompts[input.issue]}

Original content:
${input.content}

Platform: ${input.platform}
Target audience: ${brandDna?.target_audience || 'general'}

Provide exactly 2 rewrite suggestions in JSON format:
{ "suggestions": ["rewrite 1", "rewrite 2"], "explanation": "brief explanation of changes" }`;

      try {
        const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt,
          max_tokens: 500,
        });

        const parsed = JSON.parse((result as { response: string }).response);

        return {
          original: input.content,
          suggestions: parsed.suggestions || [],
          explanation: parsed.explanation || '',
          issue: input.issue,
          platform: input.platform,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate rewrite suggestions',
        });
      }
    }),

  // Batch score all quality metrics for a spoke
  scoreAll: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      content: z.string().min(1),
      platform: z.enum(['twitter', 'linkedin', 'instagram', 'tiktok', 'newsletter', 'thread', 'carousel']),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Run all scoring in parallel for performance
      const [hookResult, voiceResult, platformResult] = await Promise.all([
        // Inline scoring logic to avoid recursive calls
        scoreHookInternal(ctx, input),
        scoreVoiceInternal(ctx, input),
        scorePlatformInternal(ctx, input),
      ]);

      // Calculate G7 overall score
      const g7 = Math.round(
        (hookResult.score * 0.35) +
        (voiceResult.score * 0.35) +
        (platformResult.score * 0.30)
      );

      // Update all scores at once
      await ctx.callAgent(input.clientId, 'updateSpokeScores', {
        spokeId: input.spokeId,
        scores: {
          g2_hook: hookResult.score,
          g4_voice: voiceResult.score,
          g5_platform: platformResult.score,
          g7_overall: g7,
        },
      });

      return {
        spokeId: input.spokeId,
        scores: {
          g2_hook: hookResult.score,
          g4_voice: voiceResult.score,
          g5_platform: platformResult.score,
          g7_overall: g7,
        },
        feedback: {
          hook: hookResult.feedback,
          voice: voiceResult.feedback,
          platform: platformResult.feedback,
        },
        overallStatus: g7 >= 85 ? 'excellent' : g7 >= 70 ? 'good' : g7 >= 50 ? 'needs-work' : 'poor',
      };
    }),

  // ===== Epic 12-1: Engagement Prediction =====

  predictEngagement: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      content: z.string().min(1),
      platform: z.enum(['twitter', 'linkedin', 'instagram', 'tiktok', 'newsletter', 'thread', 'carousel']),
      g2HookScore: z.number().min(0).max(100).optional(),
      psychologicalAngle: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const prediction = predictEngagement({
        content: input.content,
        platform: input.platform,
        g2HookScore: input.g2HookScore,
        psychologicalAngle: input.psychologicalAngle,
      });

      // Store prediction in spoke via Durable Object
      const dbFormat = predictionToDbFormat(prediction);
      await ctx.callAgent(input.clientId, 'updateSpokeScores', {
        spokeId: input.spokeId,
        scores: {
          engagement_prediction: dbFormat.engagement_prediction,
          engagement_confidence: dbFormat.engagement_confidence,
          engagement_factors: dbFormat.engagement_factors,
        },
      });

      return {
        spokeId: input.spokeId,
        prediction,
      };
    }),

  predictEngagementBatch: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokes: z.array(z.object({
        spokeId: z.string().uuid(),
        content: z.string().min(1),
        platform: z.enum(['twitter', 'linkedin', 'instagram', 'tiktok', 'newsletter', 'thread', 'carousel']),
        g2HookScore: z.number().min(0).max(100).optional(),
        psychologicalAngle: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const predictions = input.spokes.map((spoke) => ({
        spokeId: spoke.spokeId,
        prediction: predictEngagement({
          content: spoke.content,
          platform: spoke.platform,
          g2HookScore: spoke.g2HookScore,
          psychologicalAngle: spoke.psychologicalAngle,
        }),
      }));

      // Store all predictions
      await Promise.all(
        predictions.map(async ({ spokeId, prediction }) => {
          const dbFormat = predictionToDbFormat(prediction);
          await ctx.callAgent(input.clientId, 'updateSpokeScores', {
            spokeId,
            scores: {
              engagement_prediction: dbFormat.engagement_prediction,
              engagement_confidence: dbFormat.engagement_confidence,
              engagement_factors: dbFormat.engagement_factors,
            },
          });
        })
      );

      return {
        total: predictions.length,
        goldenNuggets: predictions.filter((p) => p.prediction.isGoldenNugget).length,
        predictions,
      };
    }),

  getGoldenNuggets: procedure
    .input(z.object({
      clientId: z.string().min(1),
      hubId: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get spokes with engagement_prediction >= 9 (Golden Nuggets)
      const goldenNuggets = await ctx.callAgent(input.clientId, 'getGoldenNuggets', {
        hubId: input.hubId,
        limit: input.limit,
      }) as Array<{
        id: string;
        content: string;
        platform: string;
        engagement_prediction: number;
        engagement_confidence: string;
        engagement_factors: string;
      }>;

      return {
        items: goldenNuggets.map((spoke) => ({
          ...spoke,
          engagement_factors: spoke.engagement_factors ? JSON.parse(spoke.engagement_factors) : null,
        })),
        count: goldenNuggets.length,
        threshold: 9,
      };
    }),

  getEngagementStats: procedure
    .input(z.object({
      clientId: z.string().min(1),
      hubId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get engagement prediction distribution
      const stats = await ctx.callAgent(input.clientId, 'getEngagementStats', {
        hubId: input.hubId,
      }) as {
        total: number;
        goldenNuggets: number; // >= 9
        strong: number; // 7-8.9
        average: number; // 5-6.9
        weak: number; // < 5
        avgScore: number;
      };

      return {
        ...stats,
        goldenNuggetRate: stats.total > 0 ? Math.round((stats.goldenNuggets / stats.total) * 100) : 0,
        strongRate: stats.total > 0 ? Math.round((stats.strong / stats.total) * 100) : 0,
      };
    }),
});

// Helper functions

function calculateHeuristicHookScore(content: string): number {
  let score = 50;

  // Starts with question
  if (/^[^.!?]*\?/.test(content)) score += 15;

  // Contains numbers/statistics
  if (/\d+%|\d+x|\$\d+|\d+\s*(million|billion|k)/i.test(content)) score += 10;

  // Starts with strong word
  if (/^(Stop|Warning|Secret|Revealed|Breaking|Urgent|Finally)/i.test(content)) score += 10;

  // Has emotional words
  if (/shocking|amazing|incredible|devastating|powerful/i.test(content)) score += 10;

  // Short first sentence (punchy)
  const firstSentence = content.split(/[.!?]/)[0] || '';
  if (firstSentence.length < 50) score += 5;

  return Math.min(100, score);
}

function calculateOverallStatus(scores: { g2_hook?: number; g4_voice?: number; g5_platform?: number; g7_overall?: number }): string {
  const g7 = scores.g7_overall ?? Math.round(
    ((scores.g2_hook ?? 50) * 0.35) +
    ((scores.g4_voice ?? 50) * 0.35) +
    ((scores.g5_platform ?? 50) * 0.30)
  );

  if (g7 >= 85) return 'excellent';
  if (g7 >= 70) return 'good';
  if (g7 >= 50) return 'needs-work';
  return 'poor';
}

// Internal scoring functions for batch processing
async function scoreHookInternal(ctx: Context, input: { content: string }): Promise<{ score: number; feedback: string }> {
  try {
    const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: `Rate hook strength 0-100. Content: ${input.content.slice(0, 300)}. JSON: { "score": number, "feedback": "brief" }`,
      max_tokens: 100,
    });
    const parsed = JSON.parse((result as { response: string }).response);
    return { score: Math.min(100, Math.max(0, parsed.score || 50)), feedback: parsed.feedback || '' };
  } catch {
    return { score: calculateHeuristicHookScore(input.content), feedback: 'Heuristic score' };
  }
}

async function scoreVoiceInternal(ctx: Context, input: { clientId: string; content: string }): Promise<{ score: number; feedback: string }> {
  const brandDna = await ctx.db.prepare(`SELECT primary_tone FROM brand_dna WHERE client_id = ?`).bind(input.clientId).first();
  if (!brandDna) return { score: 60, feedback: 'No brand DNA configured' };

  try {
    const result = await ctx.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: `Rate voice alignment 0-100 for tone "${brandDna.primary_tone}". Content: ${input.content.slice(0, 300)}. JSON: { "score": number, "feedback": "brief" }`,
      max_tokens: 100,
    });
    const parsed = JSON.parse((result as { response: string }).response);
    return { score: Math.min(100, Math.max(0, parsed.score || 60)), feedback: parsed.feedback || '' };
  } catch {
    return { score: 60, feedback: 'AI unavailable' };
  }
}

async function scorePlatformInternal(ctx: Context, input: { content: string; platform: string }): Promise<{ score: number; feedback: string }> {
  const requirements = PLATFORM_REQUIREMENTS[input.platform] || {};
  let score = 100;
  const issues: string[] = [];

  if (requirements.maxChars && input.content.length > requirements.maxChars) {
    score -= 30;
    issues.push('Over character limit');
  }

  const hashtagCount = (input.content.match(/#\w+/g) || []).length;
  if (requirements.hashtagLimit !== undefined && hashtagCount > requirements.hashtagLimit) {
    score -= 10;
    issues.push('Too many hashtags');
  }

  return { score: Math.max(0, score), feedback: issues.join('; ') || 'Compliant' };
}
