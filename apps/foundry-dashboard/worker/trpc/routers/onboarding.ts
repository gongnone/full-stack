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

      // Track transcription result for session update
      let voiceTranscription: string | null = null;
      let trainingSampleId: string | null = null;

      // 1. Voice Recording Source - Process with Whisper transcription
      if (input.recordingKey) {
        const sourceId = crypto.randomUUID();
        trainingSampleId = crypto.randomUUID();

        // Insert hub_sources record (for research agent)
        await ctx.db.prepare(`
          INSERT INTO hub_sources (id, client_id, user_id, title, source_type, r2_key, status, created_at, updated_at)
          VALUES (?, ?, 'onboarding', 'Brand Voice Recording', 'mp3', ?, 'processing', ?, ?)
        `).bind(sourceId, invite.client_id, input.recordingKey, now, now).run();

        // REMEDIATION: Also create training_samples record for dashboard visibility
        // This bridges onboarding data to the dashboard's Brand DNA page
        await ctx.db.prepare(`
          INSERT INTO training_samples (id, client_id, user_id, title, source_type, r2_key, status, word_count, character_count, created_at, updated_at)
          VALUES (?, ?, 'onboarding', 'Onboarding Voice Recording', 'voice', ?, 'processing', 0, 0, ?, ?)
        `).bind(trainingSampleId, invite.client_id, input.recordingKey, now, now).run();

        // Fetch audio from R2 and transcribe with Whisper
        try {
          const audioObject = await ctx.env.MEDIA.get(input.recordingKey);
          if (audioObject) {
            const audioBuffer = await audioObject.arrayBuffer();

            // Call Workers AI Whisper for transcription
            const transcriptionResult = await ctx.env.AI.run('@cf/openai/whisper', {
              audio: [...new Uint8Array(audioBuffer)],
            });

            voiceTranscription = transcriptionResult.text || '';

            // Update hub_sources with transcription
            const wordCount = voiceTranscription.split(/\s+/).filter(Boolean).length;
            await ctx.db.prepare(`
              UPDATE hub_sources
              SET raw_content = ?, word_count = ?, status = 'ready', updated_at = ?
              WHERE id = ?
            `).bind(
              voiceTranscription,
              wordCount,
              Date.now(),
              sourceId
            ).run();

            // REMEDIATION: Also update training_samples with transcription
            // This makes the voice recording visible in the dashboard's Brand DNA page
            await ctx.db.prepare(`
              UPDATE training_samples
              SET extracted_text = ?, word_count = ?, character_count = ?, status = 'analyzed', analyzed_at = ?, updated_at = ?
              WHERE id = ?
            `).bind(
              voiceTranscription,
              wordCount,
              voiceTranscription.length,
              Date.now(),
              Date.now(),
              trainingSampleId
            ).run();

            // REMEDIATION: Trigger CalibrationWorkflow to extract voice entities and populate brand_dna table
            // This enables the dashboard to display DNA strength scores, voice markers, and banned words
            try {
              const engineResponse = await ctx.env.CONTENT_ENGINE.fetch('http://engine/api/calibration/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  clientId: invite.client_id,
                  contentType: 'voice',
                  r2Key: input.recordingKey,
                  sampleIds: [trainingSampleId],
                }),
              });

              if (!engineResponse.ok) {
                console.error('[Onboarding] CalibrationWorkflow trigger failed:', await engineResponse.text());
              } else {
                console.log('[Onboarding] CalibrationWorkflow started for brand_dna population');
              }
            } catch (calibrationErr) {
              console.error('[Onboarding] CalibrationWorkflow trigger error:', calibrationErr);
              // Non-blocking - onboarding completes even if workflow fails
            }

            console.log(`[Onboarding] Voice transcription complete for client ${invite.client_id}: ${voiceTranscription.length} chars, ${wordCount} words`);
          } else {
            console.error(`[Onboarding] Voice recording not found in R2: ${input.recordingKey}`);
            await ctx.db.prepare(`
              UPDATE hub_sources SET status = 'failed', updated_at = ? WHERE id = ?
            `).bind(Date.now(), sourceId).run();
          }
        } catch (err) {
          console.error(`[Onboarding] Voice transcription failed for client ${invite.client_id}:`, err);
          await ctx.db.prepare(`
            UPDATE hub_sources SET status = 'failed', updated_at = ? WHERE id = ?
          `).bind(Date.now(), sourceId).run();
        }
      }

      // 2. Content Source
      if (input.contentKey) {
        // Infer type from key or default to pdf
        const type = input.contentKey.endsWith('.txt') ? 'text' : 'pdf';
        const contentSourceId = crypto.randomUUID();
        const contentSampleId = crypto.randomUUID();

        // Insert hub_sources record (for research agent)
        await ctx.db.prepare(`
          INSERT INTO hub_sources (id, client_id, user_id, title, source_type, r2_key, status, created_at, updated_at)
          VALUES (?, ?, 'onboarding', 'Brand Content Upload', ?, ?, 'pending', ?, ?)
        `).bind(contentSourceId, invite.client_id, type, input.contentKey, now, now).run();

        // REMEDIATION: Also create training_samples record for dashboard visibility
        // Content type mapping: text → transcript, pdf → pdf
        const sampleType = type === 'text' ? 'transcript' : 'pdf';
        await ctx.db.prepare(`
          INSERT INTO training_samples (id, client_id, user_id, title, source_type, r2_key, status, word_count, character_count, created_at, updated_at)
          VALUES (?, ?, 'onboarding', 'Onboarding Content Upload', ?, ?, 'pending', 0, 0, ?, ?)
        `).bind(contentSampleId, invite.client_id, sampleType, input.contentKey, now, now).run();
      }

      // Determine session status based on processing results
      const sessionStatus = voiceTranscription ? 'completed' : (input.recordingKey ? 'failed' : 'pending');
      const sessionStep = voiceTranscription ? 'complete' : 'voice_capture';

      // AC7: Update Brand DNA session with transcription results
      await ctx.db.prepare(`
        INSERT INTO brand_dna_sessions (id, client_id, user_id, status, current_step, total_transcription, created_at, updated_at, completed_at)
        VALUES (?, ?, 'onboarding', ?, ?, ?, ?, ?, ?)
        ON CONFLICT(client_id) DO UPDATE SET
          status = excluded.status,
          current_step = excluded.current_step,
          total_transcription = COALESCE(excluded.total_transcription, total_transcription),
          updated_at = excluded.updated_at,
          completed_at = excluded.completed_at
      `).bind(
        crypto.randomUUID(),
        invite.client_id,
        sessionStatus,
        sessionStep,
        voiceTranscription,
        now,
        now,
        voiceTranscription ? now : null
      ).run();

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
