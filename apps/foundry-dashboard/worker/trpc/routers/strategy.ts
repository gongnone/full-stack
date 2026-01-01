/**
 * Strategy Router - Epic 10: Strategic Brand Onboarding Pipeline
 *
 * Stories 10-2, 10-3, 10-4, 10-5
 * Handles research, pillar synthesis, approval flow, and refinement
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { sendStrategyReadyEmail, sendStrategyLockedEmail } from '../../email';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;
const publicProcedure = t.procedure;

// ===========================================
// Types
// ===========================================

interface Pillar {
  id: string;
  name: string;
  strategy: string[];
  rationale: string;
  exampleHook: string;
  confidence: number;
}

interface ResearchReport {
  industry: string;
  subNiche: string;
  topPerformers: Array<{ name: string; platform: string; strength: string }>;
  hookPatterns: Record<string, { prevalence: number; avgEngagement: number }>;
  competitiveGaps: string[];
  frameworkFit: Record<string, number>;
  recommendations: string[];
}

// ===========================================
// Router
// ===========================================

export const strategyRouter = t.router({
  // =========================================
  // Story 10-2: Deep Research Agent
  // =========================================

  /**
   * Trigger research for a client after Brand DNA submission
   * Called automatically from onboarding.submit
   */
  triggerResearch: procedure
    .input(z.object({ clientId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const now = Date.now();
      const reportId = crypto.randomUUID();

      // Create pending research report
      await ctx.db.prepare(`
        INSERT INTO client_research_reports (id, client_id, status, started_at, created_at)
        VALUES (?, ?, 'researching', ?, ?)
      `).bind(reportId, input.clientId, now, now).run();

      // Update brand DNA session status
      await ctx.db.prepare(`
        UPDATE brand_dna_sessions SET status = 'researching', updated_at = ? WHERE client_id = ?
      `).bind(now, input.clientId).run();

      // Simulate research (in production, this would be a Cloudflare Workflow)
      // For MVP, we generate mock research data
      const research = await generateMockResearch(ctx, input.clientId);

      // Store research results
      await ctx.db.prepare(`
        UPDATE client_research_reports SET
          industry = ?,
          sub_niche = ?,
          top_performers_json = ?,
          hook_patterns_json = ?,
          competitive_gaps_json = ?,
          framework_fit_json = ?,
          recommendations_json = ?,
          status = 'complete',
          completed_at = ?
        WHERE id = ?
      `).bind(
        research.industry,
        research.subNiche,
        JSON.stringify(research.topPerformers),
        JSON.stringify(research.hookPatterns),
        JSON.stringify(research.competitiveGaps),
        JSON.stringify(research.frameworkFit),
        JSON.stringify(research.recommendations),
        Date.now(),
        reportId
      ).run();

      // Trigger pillar synthesis
      await synthesizePillars(ctx, input.clientId, research);

      return { success: true, reportId };
    }),

  /**
   * Get research report for a client
   */
  getResearch: procedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.db.prepare(`
        SELECT * FROM client_research_reports WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
      `).bind(input.clientId).first();

      if (!report) {
        return null;
      }

      return {
        id: report.id as string,
        clientId: report.client_id as string,
        industry: report.industry as string,
        subNiche: report.sub_niche as string,
        topPerformers: JSON.parse((report.top_performers_json as string) || '[]'),
        hookPatterns: JSON.parse((report.hook_patterns_json as string) || '{}'),
        competitiveGaps: JSON.parse((report.competitive_gaps_json as string) || '[]'),
        frameworkFit: JSON.parse((report.framework_fit_json as string) || '{}'),
        recommendations: JSON.parse((report.recommendations_json as string) || '[]'),
        status: report.status as string,
        completedAt: report.completed_at as number,
      };
    }),

  // =========================================
  // Story 10-3: Strategic Pillar Synthesis
  // =========================================

  /**
   * Get proposed pillars for a client
   */
  getProposedPillars: procedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ ctx, input }) => {
      const proposal = await ctx.db.prepare(`
        SELECT * FROM client_proposed_pillars WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
      `).bind(input.clientId).first();

      if (!proposal) {
        return null;
      }

      return {
        id: proposal.id as string,
        clientId: proposal.client_id as string,
        pillars: JSON.parse((proposal.pillars_json as string) || '[]') as Pillar[],
        status: proposal.status as string,
        generationRound: proposal.generation_round as number,
      };
    }),

  /**
   * Regenerate pillars with different options
   */
  regeneratePillars: procedure
    .input(z.object({
      clientId: z.string(),
      rejectedThemes: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get research report
      const research = await ctx.db.prepare(`
        SELECT * FROM client_research_reports WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
      `).bind(input.clientId).first();

      if (!research) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No research report found' });
      }

      // Get current generation round
      const current = await ctx.db.prepare(`
        SELECT generation_round FROM client_proposed_pillars WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
      `).bind(input.clientId).first();

      const round = ((current?.generation_round as number) || 0) + 1;

      if (round > 3) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Maximum regeneration rounds reached. Please contact support.',
        });
      }

      // Generate new pillars avoiding rejected themes
      const researchData: ResearchReport = {
        industry: research.industry as string,
        subNiche: research.sub_niche as string,
        topPerformers: JSON.parse((research.top_performers_json as string) || '[]'),
        hookPatterns: JSON.parse((research.hook_patterns_json as string) || '{}'),
        competitiveGaps: JSON.parse((research.competitive_gaps_json as string) || '[]'),
        frameworkFit: JSON.parse((research.framework_fit_json as string) || '{}'),
        recommendations: JSON.parse((research.recommendations_json as string) || '[]'),
      };

      const pillars = generatePillars(researchData, input.rejectedThemes, round);

      // Store new proposal
      const proposalId = crypto.randomUUID();
      await ctx.db.prepare(`
        INSERT INTO client_proposed_pillars (id, client_id, pillars_json, status, generation_round, created_at)
        VALUES (?, ?, ?, 'pending', ?, ?)
      `).bind(proposalId, input.clientId, JSON.stringify(pillars), round, Date.now()).run();

      return { success: true, pillars, round };
    }),

  // =========================================
  // Story 10-4: Approval Flow (Public)
  // =========================================

  /**
   * Validate strategy approval token (public)
   */
  validateStrategyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const tokenRecord = await ctx.db.prepare(`
        SELECT t.*, c.name as client_name FROM strategy_approval_tokens t
        JOIN clients c ON t.client_id = c.id
        WHERE t.token = ?
      `).bind(input.token).first();

      if (!tokenRecord) {
        return { valid: false, error: 'Invalid token' };
      }

      if ((tokenRecord.expires_at as number) < Date.now()) {
        return { valid: false, error: 'Token expired' };
      }

      if (tokenRecord.locked_at) {
        return { valid: false, error: 'Strategy already locked', locked: true };
      }

      // Get proposed pillars
      const proposal = await ctx.db.prepare(`
        SELECT * FROM client_proposed_pillars WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
      `).bind(tokenRecord.client_id).first();

      // Get any existing approvals (for session recovery)
      const approvals = await ctx.db.prepare(`
        SELECT pillar_name FROM client_approved_pillars WHERE client_id = ?
      `).bind(tokenRecord.client_id).all();

      const approvedNames = (approvals.results || []).map((r: Record<string, unknown>) => r.pillar_name as string);

      return {
        valid: true,
        clientId: tokenRecord.client_id as string,
        clientName: tokenRecord.client_name as string,
        pillars: JSON.parse((proposal?.pillars_json as string) || '[]') as Pillar[],
        approvedPillars: approvedNames,
      };
    }),

  /**
   * Approve a pillar (public, token-gated)
   */
  approvePillar: publicProcedure
    .input(z.object({
      token: z.string(),
      pillarId: z.string(),
      pillarName: z.string(),
      strategyTags: z.array(z.string()),
      rationale: z.string().optional(),
      exampleHook: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate token
      const tokenRecord = await ctx.db.prepare(`
        SELECT * FROM strategy_approval_tokens WHERE token = ? AND expires_at > ? AND locked_at IS NULL
      `).bind(input.token, Date.now()).first();

      if (!tokenRecord) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid or expired token' });
      }

      const clientId = tokenRecord.client_id as string;
      const now = Date.now();

      // Insert or update approved pillar
      await ctx.db.prepare(`
        INSERT INTO client_approved_pillars (id, client_id, pillar_name, strategy_tags, rationale, example_hook, approved_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          pillar_name = excluded.pillar_name,
          strategy_tags = excluded.strategy_tags,
          approved_at = excluded.approved_at
      `).bind(
        input.pillarId,
        clientId,
        input.pillarName,
        JSON.stringify(input.strategyTags),
        input.rationale || null,
        input.exampleHook || null,
        now,
        now
      ).run();

      return { success: true };
    }),

  /**
   * Lock the strategy (finalize approvals)
   */
  lockStrategy: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Validate token
      const tokenRecord = await ctx.db.prepare(`
        SELECT t.*, c.name as client_name FROM strategy_approval_tokens t
        JOIN clients c ON t.client_id = c.id
        WHERE t.token = ? AND t.expires_at > ? AND t.locked_at IS NULL
      `).bind(input.token, Date.now()).first();

      if (!tokenRecord) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid or expired token' });
      }

      const clientId = tokenRecord.client_id as string;
      const now = Date.now();

      // Check minimum pillars approved
      const approved = await ctx.db.prepare(`
        SELECT COUNT(*) as count FROM client_approved_pillars WHERE client_id = ?
      `).bind(clientId).first();

      if ((approved?.count as number) < 3) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'At least 3 pillars must be approved to lock strategy',
        });
      }

      // Lock the token
      await ctx.db.prepare(`
        UPDATE strategy_approval_tokens SET locked_at = ? WHERE token = ?
      `).bind(now, input.token).run();

      // Update brand DNA session status
      await ctx.db.prepare(`
        UPDATE brand_dna_sessions SET status = 'complete', current_step = 'complete', updated_at = ? WHERE client_id = ?
      `).bind(now, clientId).run();

      // Update proposed pillars status
      await ctx.db.prepare(`
        UPDATE client_proposed_pillars SET status = 'approved', approved_at = ? WHERE client_id = ?
      `).bind(now, clientId).run();

      // Notify agency owner
      const agencyOwner = await ctx.db.prepare(`
        SELECT u.email FROM client_members cm
        JOIN user u ON cm.user_id = u.id
        WHERE cm.client_id = ? AND cm.role = 'agency_owner'
        LIMIT 1
      `).bind(clientId).first();

      if (agencyOwner?.email) {
        const dashboardUrl = ctx.env.BETTER_AUTH_URL || 'https://foundry.williamjshaw.ca';
        await sendStrategyLockedEmail(
          ctx.env,
          agencyOwner.email as string,
          tokenRecord.client_name as string,
          clientId,
          dashboardUrl
        ).catch(console.error);
      }

      return { success: true, message: 'Strategy locked successfully' };
    }),

  // =========================================
  // Story 10-5: Pillar Refinement
  // =========================================

  /**
   * Transcribe voice note for pillar refinement (AC5)
   * Uses Workers AI Whisper for transcription
   */
  transcribeVoiceNote: publicProcedure
    .input(z.object({
      token: z.string(),
      audioBase64: z.string(),
      mimeType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate token
      const tokenRecord = await ctx.db.prepare(`
        SELECT * FROM strategy_approval_tokens WHERE token = ? AND expires_at > ? AND locked_at IS NULL
      `).bind(input.token, Date.now()).first();

      if (!tokenRecord) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid or expired token' });
      }

      // Decode base64 audio
      const binaryString = atob(input.audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Use Workers AI Whisper for transcription
      const AI = ctx.env.AI;
      if (!AI) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI service not available',
        });
      }

      try {
        const response = await AI.run('@cf/openai/whisper', {
          audio: [...bytes],
        });

        const transcription = response.text || '';

        return {
          transcription: transcription.trim(),
          success: true,
        };
      } catch (error) {
        console.error('[Whisper] Voice note transcription failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Transcription failed. Please try again or type your feedback.',
        });
      }
    }),

  /**
   * Modify a pillar
   */
  modifyPillar: publicProcedure
    .input(z.object({
      token: z.string(),
      pillarId: z.string(),
      originalPillar: z.object({
        name: z.string(),
        strategy: z.array(z.string()),
        rationale: z.string(),
        exampleHook: z.string(),
      }),
      newName: z.string().optional(),
      newStrategyTags: z.array(z.string()).optional(),
      personalNote: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate token
      const tokenRecord = await ctx.db.prepare(`
        SELECT * FROM strategy_approval_tokens WHERE token = ? AND expires_at > ? AND locked_at IS NULL
      `).bind(input.token, Date.now()).first();

      if (!tokenRecord) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid or expired token' });
      }

      const clientId = tokenRecord.client_id as string;
      const now = Date.now();

      // Create modified pillar
      const modifiedPillar = {
        id: input.pillarId,
        name: input.newName || input.originalPillar.name,
        strategy: input.newStrategyTags || input.originalPillar.strategy,
        rationale: input.originalPillar.rationale,
        exampleHook: input.originalPillar.exampleHook,
        personalNote: input.personalNote,
      };

      // Track modification
      await ctx.db.prepare(`
        INSERT INTO pillar_modifications (id, client_id, pillar_id, original_json, modified_json, modification_type, feedback_text, created_at)
        VALUES (?, ?, ?, ?, ?, 'modified', ?, ?)
      `).bind(
        crypto.randomUUID(),
        clientId,
        input.pillarId,
        JSON.stringify(input.originalPillar),
        JSON.stringify(modifiedPillar),
        input.personalNote || null,
        now
      ).run();

      return { success: true, modifiedPillar };
    }),

  /**
   * Get alternative pillars for a slot
   */
  getAlternatives: publicProcedure
    .input(z.object({
      token: z.string(),
      pillarId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate token
      const tokenRecord = await ctx.db.prepare(`
        SELECT * FROM strategy_approval_tokens WHERE token = ? AND expires_at > ? AND locked_at IS NULL
      `).bind(input.token, Date.now()).first();

      if (!tokenRecord) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid or expired token' });
      }

      const clientId = tokenRecord.client_id as string;

      // Get research for context
      const research = await ctx.db.prepare(`
        SELECT * FROM client_research_reports WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
      `).bind(clientId).first();

      // Generate 3 alternative pillars
      const alternatives = generateAlternativePillars(research);

      return { alternatives };
    }),

  // =========================================
  // Agency Dashboard Endpoints
  // =========================================

  /**
   * Get approved pillars for a client (authenticated)
   */
  getApprovedPillars: procedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ ctx, input }) => {
      const pillars = await ctx.db.prepare(`
        SELECT * FROM client_approved_pillars WHERE client_id = ? AND is_active = 1
      `).bind(input.clientId).all();

      return (pillars.results || []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        name: r.pillar_name as string,
        strategyTags: JSON.parse((r.strategy_tags as string) || '[]'),
        rationale: r.rationale as string,
        exampleHook: r.example_hook as string,
        approvedAt: r.approved_at as number,
      }));
    }),

  /**
   * Get strategy status for a client
   */
  getStrategyStatus: procedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [research, proposal, approvedCount] = await Promise.all([
        ctx.db.prepare(`
          SELECT status FROM client_research_reports WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
        `).bind(input.clientId).first(),
        ctx.db.prepare(`
          SELECT status, generation_round FROM client_proposed_pillars WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
        `).bind(input.clientId).first(),
        ctx.db.prepare(`
          SELECT COUNT(*) as count FROM client_approved_pillars WHERE client_id = ?
        `).bind(input.clientId).first(),
      ]);

      const token = await ctx.db.prepare(`
        SELECT locked_at FROM strategy_approval_tokens WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
      `).bind(input.clientId).first();

      let status = 'not_started';
      if (token?.locked_at) {
        status = 'complete';
      } else if ((approvedCount?.count as number) > 0) {
        status = 'approving';
      } else if (proposal?.status) {
        status = 'pillars_ready';
      } else if (research?.status === 'complete') {
        status = 'researched';
      } else if (research?.status === 'researching') {
        status = 'researching';
      }

      return {
        status,
        researchStatus: research?.status as string | null,
        proposalStatus: proposal?.status as string | null,
        generationRound: proposal?.generation_round as number | null,
        approvedPillarCount: approvedCount?.count as number || 0,
        isLocked: !!token?.locked_at,
      };
    }),
});

// ===========================================
// Helper Functions
// ===========================================

async function generateMockResearch(ctx: Context, clientId: string): Promise<ResearchReport> {
  // Get brand DNA for context
  const brandDna = await ctx.db.prepare(`
    SELECT * FROM brand_dna WHERE client_id = ?
  `).bind(clientId).first();

  const primaryTone = (brandDna?.primary_tone as string) || 'Professional';
  const targetAudience = (brandDna?.target_audience as string) || 'Business professionals';

  // Generate research based on detected patterns
  // In production, this would use Workers AI and web search
  return {
    industry: 'Executive Coaching',
    subNiche: 'Leadership for tech founders',
    topPerformers: [
      { name: 'Alex Hormozi', platform: 'Twitter/YouTube', strength: 'Contrarian takes, value bombs' },
      { name: 'Simon Sinek', platform: 'LinkedIn', strength: 'Story-driven leadership content' },
      { name: 'Brené Brown', platform: 'All platforms', strength: 'Vulnerability + authority' },
    ],
    hookPatterns: {
      contrarian: { prevalence: 0.34, avgEngagement: 3.2 },
      story: { prevalence: 0.28, avgEngagement: 2.8 },
      question: { prevalence: 0.22, avgEngagement: 2.1 },
      statistic: { prevalence: 0.16, avgEngagement: 1.9 },
    },
    competitiveGaps: [
      'Few creators address failure stories authentically',
      'Technical founders underserved by generic leadership content',
      'Lack of tactical, actionable frameworks',
    ],
    frameworkFit: {
      teach: 0.85,
      entertain: 0.72,
      engineer: 0.68,
      challenge: 0.91,
    },
    recommendations: [
      'Lead with contrarian takes - high engagement in this niche',
      'Share personal failure stories - underserved content type',
      'Create tactical frameworks - strong authority builder',
    ],
  };
}

async function synthesizePillars(ctx: Context, clientId: string, research: ResearchReport) {
  const pillars = generatePillars(research, undefined, 1);

  // Store proposed pillars
  const proposalId = crypto.randomUUID();
  await ctx.db.prepare(`
    INSERT INTO client_proposed_pillars (id, client_id, pillars_json, status, generation_round, created_at)
    VALUES (?, ?, ?, 'pending', 1, ?)
  `).bind(proposalId, clientId, JSON.stringify(pillars), Date.now()).run();

  // Create strategy approval token
  const token = crypto.randomUUID().replace(/-/g, '');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  await ctx.db.prepare(`
    INSERT INTO strategy_approval_tokens (id, client_id, token, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), clientId, token, expiresAt, Date.now()).run();

  // Update status
  await ctx.db.prepare(`
    UPDATE brand_dna_sessions SET status = 'pillars_ready', current_step = 'pillars', updated_at = ? WHERE client_id = ?
  `).bind(Date.now(), clientId).run();

  // Send notification email
  const client = await ctx.db.prepare(`
    SELECT c.name, c.contact_email FROM clients c WHERE c.id = ?
  `).bind(clientId).first();

  if (client?.contact_email) {
    const approvalUrl = `${ctx.env.BETTER_AUTH_URL}/strategy/${token}`;
    await sendStrategyReadyEmail(
      ctx.env,
      client.contact_email as string,
      client.name as string,
      approvalUrl
    ).catch(console.error);
  }
}

function generatePillars(research: ResearchReport, rejectedThemes?: string[], round = 1): Pillar[] {
  // Generate pillars based on research and framework fit
  // In production, this would use Workers AI
  const basePillars: Pillar[] = [
    {
      id: `pillar_${crypto.randomUUID().slice(0, 8)}`,
      name: 'Leadership Myths Debunked',
      strategy: ['TEACH', 'CHALLENGE'],
      rationale: `Contrarian takes get ${(research.hookPatterns.contrarian?.avgEngagement || 3.2).toFixed(1)}x engagement in your niche. Your voice analysis shows strong myth-buster tendencies.`,
      exampleHook: 'The leadership advice that got your last CEO fired',
      confidence: 0.92,
    },
    {
      id: `pillar_${crypto.randomUUID().slice(0, 8)}`,
      name: 'Boardroom Confessions',
      strategy: ['ENTERTAIN', 'PROVE'],
      rationale: 'Story-driven content is underused by competitors. Your candid voice is perfect for authentic failure stories.',
      exampleHook: 'I lost a $2M client because I was too proud to ask for help',
      confidence: 0.88,
    },
    {
      id: `pillar_${crypto.randomUUID().slice(0, 8)}`,
      name: 'The 3-Second Decision',
      strategy: ['ENGINEER'],
      rationale: 'Framework content drives saves and shares. Your "decisive not stubborn" stance translates perfectly to tactical content.',
      exampleHook: 'The framework I use to make million-dollar decisions in 3 seconds',
      confidence: 0.85,
    },
    {
      id: `pillar_${crypto.randomUUID().slice(0, 8)}`,
      name: 'Tech Founder Survival Guide',
      strategy: ['TEACH'],
      rationale: 'Technical founders are underserved in leadership content. Your background gives you unique credibility.',
      exampleHook: 'What engineering taught me about leading people (hint: it\'s not about optimization)',
      confidence: 0.82,
    },
  ];

  // Filter out rejected themes if any
  if (rejectedThemes && rejectedThemes.length > 0) {
    return basePillars
      .filter(p => !rejectedThemes.some(theme =>
        p.name.toLowerCase().includes(theme.toLowerCase())
      ))
      .slice(0, 4);
  }

  // Vary pillars slightly on regeneration
  if (round > 1) {
    return basePillars.map(p => ({
      ...p,
      id: `pillar_${crypto.randomUUID().slice(0, 8)}`,
      name: p.name + (round === 2 ? ' (v2)' : ' (v3)'),
    }));
  }

  return basePillars;
}

function generateAlternativePillars(research: Record<string, unknown> | null): Pillar[] {
  return [
    {
      id: `alt_${crypto.randomUUID().slice(0, 8)}`,
      name: 'The Uncomfortable Truth',
      strategy: ['CHALLENGE'],
      rationale: 'High-impact contrarian content that challenges industry assumptions.',
      exampleHook: 'Everything you learned about leadership in business school is wrong',
      confidence: 0.79,
    },
    {
      id: `alt_${crypto.randomUUID().slice(0, 8)}`,
      name: 'Monday Motivation Killers',
      strategy: ['ENTERTAIN', 'CHALLENGE'],
      rationale: 'Anti-motivation content performs well when authentic.',
      exampleHook: 'Stop with the positive affirmations. Here\'s what actually works.',
      confidence: 0.76,
    },
    {
      id: `alt_${crypto.randomUUID().slice(0, 8)}`,
      name: 'Lessons From the Trenches',
      strategy: ['TEACH', 'PROVE'],
      rationale: 'Experience-based teaching establishes authority.',
      exampleHook: '10 years of leadership failures condensed into 10 lessons',
      confidence: 0.81,
    },
  ];
}
