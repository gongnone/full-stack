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

      const nowSeconds = Math.floor(Date.now() / 1000);
      if (invite.expires_at < nowSeconds) {
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

      if (!invite) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid invitation token' });
      }

      if (invite.expires_at < Math.floor(Date.now() / 1000)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invitation has expired' });
      }

      // Idempotency: If token is already used, return success without re-processing
      // This prevents duplicate emails if submit is called multiple times
      if (invite.used_at) {
        console.log(`[Onboarding] Token already used for client ${invite.client_id}, returning success`);
        return { success: true, alreadyProcessed: true };
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

      // Story 10-2: Trigger Deep Research Agent (runs async)
      // The research agent will:
      // 1. Analyze Brand DNA transcript and content
      // 2. Detect industry and sub-niche
      // 3. Generate framework fit scores
      // 4. Trigger Story 10-3 pillar synthesis when complete
      // 5. Create strategy approval token (Story 10-4)
      Promise.resolve().then(async () => {
        try {
          const { triggerResearchFromOnboarding } = await import('./research');
          await triggerResearchFromOnboarding(ctx, invite.client_id);
        } catch (err) {
          console.error('[Onboarding] Research agent trigger failed:', err);
          // Fallback: create a pending research report for manual retry
          const reportId = crypto.randomUUID();
          await ctx.db.prepare(`
            INSERT INTO client_research_reports (id, client_id, status, started_at, created_at)
            VALUES (?, ?, 'failed', ?, ?)
          `).bind(reportId, invite.client_id, Date.now(), Date.now()).run();
        }
      });

      console.log(`[Onboarding] Brand DNA submitted, research agent triggered for client ${invite.client_id}`);

      return { success: true };
    }),
});
