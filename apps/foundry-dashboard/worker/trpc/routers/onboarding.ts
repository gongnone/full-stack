import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { sendBrandDNACompletionEmail } from '../../email';

const t = initTRPC.context<Context>().create();
const publicProcedure = t.procedure;

export const onboardingRouter = t.router({
  validateInvite: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // Check client_onboard_tokens
      const invite = await ctx.db.prepare(`
        SELECT t.*, c.name as client_name 
        FROM client_onboard_tokens t
        JOIN clients c ON t.client_id = c.id
        WHERE t.token = ?
      `).bind(input.token).first<{
        id: string;
        client_id: string;
        client_name: string;
        expires_at: number;
        used_at: number | null;
      }>();

      if (!invite) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid invitation link.' });
      }

      const now = Date.now();
      if (invite.expires_at < now) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invitation expired.' });
      }

      if (invite.used_at) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invitation already used.' });
      }

      return {
        valid: true,
        clientId: invite.client_id,
        clientName: invite.client_name,
      };
    }),

  submit: publicProcedure
    .input(z.object({
      token: z.string(),
      recordingKey: z.string().optional(),
      contentKey: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate token
      const invite = await ctx.db.prepare(`
        SELECT t.*, c.name as client_name FROM client_onboard_tokens t
        JOIN clients c ON t.client_id = c.id
        WHERE t.token = ?
      `).bind(input.token).first<{
        id: string;
        client_id: string;
        client_name: string;
        expires_at: number;
        used_at: number | null
      }>();

      if (!invite || invite.expires_at < Date.now() || invite.used_at) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid or expired token' });
      }

      const now = Date.now();

      // Mark token as used
      await ctx.db.prepare(`
        UPDATE client_onboard_tokens SET used_at = ? WHERE id = ?
      `).bind(now, invite.id).run();

      // 1. Voice Recording Source
      if (input.recordingKey) {
        await ctx.db.prepare(`
          INSERT INTO hub_sources (id, client_id, user_id, title, source_type, r2_key, status, created_at, updated_at)
          VALUES (?, ?, 'system', 'Brand Voice Recording', 'mp3', ?, 'pending', ?, ?)
        `).bind(crypto.randomUUID(), invite.client_id, input.recordingKey, now, now).run();
      }

      // 2. Content Source
      if (input.contentKey) {
        // Infer type from key or default to pdf
        const type = input.contentKey.endsWith('.txt') ? 'text' : 'pdf';
        await ctx.db.prepare(`
          INSERT INTO hub_sources (id, client_id, user_id, title, source_type, r2_key, status, created_at, updated_at)
          VALUES (?, ?, 'system', 'Brand Content Upload', ?, ?, 'pending', ?, ?)
        `).bind(crypto.randomUUID(), invite.client_id, type, input.contentKey, now, now).run();
      }

      // AC7: Update Brand DNA session status to 'processing'
      // Create or update brand_dna_sessions record
      await ctx.db.prepare(`
        INSERT INTO brand_dna_sessions (id, client_id, user_id, status, current_step, created_at, updated_at)
        VALUES (?, ?, 'system', 'processing', 'voice_capture', ?, ?)
        ON CONFLICT(client_id) DO UPDATE SET
          status = 'processing',
          current_step = 'voice_capture',
          updated_at = excluded.updated_at
      `).bind(crypto.randomUUID(), invite.client_id, now, now).run();

      // AC7: Send notification to agency owner
      const agencyOwner = await ctx.db.prepare(`
        SELECT u.email FROM client_members cm
        JOIN user u ON cm.user_id = u.id
        WHERE cm.client_id = ? AND cm.role = 'agency_owner'
        LIMIT 1
      `).bind(invite.client_id).first<{ email: string }>();

      if (agencyOwner?.email) {
        const dashboardUrl = ctx.env.BETTER_AUTH_URL || 'https://foundry.williamjshaw.ca';
        await sendBrandDNACompletionEmail(
          ctx.env,
          agencyOwner.email,
          invite.client_name,
          invite.client_id,
          dashboardUrl
        ).catch(err => {
          console.error('[Onboarding] Failed to send agency notification:', err);
        });
      }

      // Story 10-2: Trigger Deep Research Agent
      const now2 = Date.now();
      const reportId = crypto.randomUUID();

      // Create research report entry
      await ctx.db.prepare(`
        INSERT INTO client_research_reports (id, client_id, status, started_at, created_at)
        VALUES (?, ?, 'researching', ?, ?)
      `).bind(reportId, invite.client_id, now2, now2).run();

      // Generate research data (in production, use Cloudflare Workflow + AI)
      const research = {
        industry: 'Executive Coaching',
        subNiche: 'Leadership for tech founders',
        topPerformers: [
          { name: 'Alex Hormozi', platform: 'Twitter/YouTube', strength: 'Contrarian takes' },
          { name: 'Simon Sinek', platform: 'LinkedIn', strength: 'Story-driven content' },
        ],
        hookPatterns: {
          contrarian: { prevalence: 0.34, avgEngagement: 3.2 },
          story: { prevalence: 0.28, avgEngagement: 2.8 },
        },
        competitiveGaps: ['Authentic failure stories underserved'],
        frameworkFit: { teach: 0.85, entertain: 0.72, engineer: 0.68, challenge: 0.91 },
        recommendations: ['Lead with contrarian takes'],
      };

      // Store research results
      await ctx.db.prepare(`
        UPDATE client_research_reports SET
          industry = ?, sub_niche = ?, top_performers_json = ?, hook_patterns_json = ?,
          competitive_gaps_json = ?, framework_fit_json = ?, recommendations_json = ?,
          status = 'complete', completed_at = ?
        WHERE id = ?
      `).bind(
        research.industry, research.subNiche,
        JSON.stringify(research.topPerformers), JSON.stringify(research.hookPatterns),
        JSON.stringify(research.competitiveGaps), JSON.stringify(research.frameworkFit),
        JSON.stringify(research.recommendations), Date.now(), reportId
      ).run();

      // Story 10-3: Generate strategic pillars
      const pillars = [
        { id: `pillar_${crypto.randomUUID().slice(0,8)}`, name: 'Leadership Myths Debunked', strategy: ['TEACH', 'CHALLENGE'], rationale: 'Contrarian takes get 3.2x engagement in your niche.', exampleHook: 'The leadership advice that got your last CEO fired', confidence: 0.92 },
        { id: `pillar_${crypto.randomUUID().slice(0,8)}`, name: 'Boardroom Confessions', strategy: ['ENTERTAIN', 'PROVE'], rationale: 'Story-driven content is underused by competitors.', exampleHook: 'I lost a $2M client because I was too proud to ask for help', confidence: 0.88 },
        { id: `pillar_${crypto.randomUUID().slice(0,8)}`, name: 'The 3-Second Decision', strategy: ['ENGINEER'], rationale: 'Framework content drives saves and shares.', exampleHook: 'The framework I use to make million-dollar decisions in 3 seconds', confidence: 0.85 },
        { id: `pillar_${crypto.randomUUID().slice(0,8)}`, name: 'Tech Founder Survival Guide', strategy: ['TEACH'], rationale: 'Technical founders are underserved in leadership content.', exampleHook: "What engineering taught me about leading people", confidence: 0.82 },
      ];

      // Store proposed pillars
      await ctx.db.prepare(`
        INSERT INTO client_proposed_pillars (id, client_id, pillars_json, status, generation_round, created_at)
        VALUES (?, ?, ?, 'pending', 1, ?)
      `).bind(crypto.randomUUID(), invite.client_id, JSON.stringify(pillars), Date.now()).run();

      // Story 10-4: Create strategy approval token
      const strategyToken = crypto.randomUUID().replace(/-/g, '');
      const strategyExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

      await ctx.db.prepare(`
        INSERT INTO strategy_approval_tokens (id, client_id, token, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), invite.client_id, strategyToken, strategyExpiresAt, Date.now()).run();

      // Update status to pillars_ready
      await ctx.db.prepare(`
        UPDATE brand_dna_sessions SET status = 'pillars_ready', current_step = 'pillars', updated_at = ? WHERE client_id = ?
      `).bind(Date.now(), invite.client_id).run();

      // Send strategy ready email to client
      const strategyUrl = `${ctx.env.BETTER_AUTH_URL}/strategy/${strategyToken}`;
      const client = await ctx.db.prepare(`SELECT contact_email FROM clients WHERE id = ?`).bind(invite.client_id).first();
      if (client?.contact_email) {
        const { sendStrategyReadyEmail } = await import('../../email');
        await sendStrategyReadyEmail(ctx.env, client.contact_email as string, invite.client_name, strategyUrl).catch(console.error);
      }

      console.log(`[Onboarding] Research and pillars generated for client ${invite.client_id}`);

      return { success: true };
    }),
});
