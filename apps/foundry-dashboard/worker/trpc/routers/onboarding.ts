import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';

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
        SELECT * FROM client_onboard_tokens WHERE token = ?
      `).bind(input.token).first<{ id: string; client_id: string; expires_at: number; used_at: number | null }>();

      if (!invite || invite.expires_at < Date.now() || invite.used_at) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid or expired token' });
      }

      const now = Date.now();

      // Mark as used
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

      // Trigger Deep Research (Story 10-2 placeholder)
      console.log(`[Onboarding] Triggering Deep Research for client ${invite.client_id}`);

      return { success: true };
    }),
});
