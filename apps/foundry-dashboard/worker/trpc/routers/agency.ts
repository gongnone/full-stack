/**
 * Agency Router - Agency Owner Dashboard
 *
 * Epic 1.5-7: Client management, BrandDNA status, invites
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

export const agencyRouter = t.router({
  // ===== Story 1.5-7-1: View Client List =====

  listClients: procedure
    .input(z.object({
      status: z.enum(['all', 'active', 'inactive', 'pending']).default('all'),
      sortBy: z.enum(['name', 'created', 'activity', 'brandDnaStatus']).default('created'),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Agency owner can see all their clients - no specific client access check
      let query = `
        SELECT
          c.id,
          c.name,
          c.status,
          c.industry,
          c.contact_email,
          c.logo_url,
          c.brand_color,
          c.created_at,
          bd.strength_score as brand_dna_score,
          bd.last_calibration_at,
          bd.sample_count,
          (SELECT COUNT(*) FROM hubs WHERE client_id = c.id) as hub_count,
          (SELECT MAX(updated_at) FROM brand_dna_sessions WHERE client_id = c.id) as last_activity
        FROM clients c
        LEFT JOIN brand_dna bd ON c.id = bd.client_id
        WHERE c.id IN (
          SELECT client_id FROM user_clients WHERE user_id = ?
        )
      `;

      const params: (string | number)[] = [ctx.userId];

      if (input.status !== 'all') {
        query += ` AND c.status = ?`;
        params.push(input.status);
      }

      // Add sorting
      const sortMap: Record<string, string> = {
        name: 'c.name ASC',
        created: 'c.created_at DESC',
        activity: 'last_activity DESC NULLS LAST',
        brandDnaStatus: 'bd.strength_score DESC NULLS LAST',
      };
      query += ` ORDER BY ${sortMap[input.sortBy]}`;

      query += ` LIMIT ? OFFSET ?`;
      params.push(input.limit + 1, input.cursor || 0);

      const result = await ctx.db.prepare(query).bind(...params).all();
      const items = result.results || [];

      let nextCursor: number | undefined;
      if (items.length > input.limit) {
        items.pop();
        nextCursor = (input.cursor || 0) + input.limit;
      }

      return {
        items: items.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          name: row.name as string,
          status: row.status as string,
          industry: row.industry as string | null,
          contactEmail: row.contact_email as string | null,
          logoUrl: row.logo_url as string | null,
          brandColor: row.brand_color as string,
          createdAt: row.created_at as number,
          brandDna: {
            score: row.brand_dna_score as number | null,
            lastCalibration: row.last_calibration_at as number | null,
            sampleCount: row.sample_count as number | null,
          },
          stats: {
            hubCount: row.hub_count as number,
            lastActivity: row.last_activity as number | null,
          },
        })),
        nextCursor,
      };
    }),

  // ===== Story 1.5-7-2: BrandDNA Completion Status =====

  getBrandDnaStatus: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get all BrandDNA-related data for completion status
      const [brandDna, sessions, voiceRecordings, personas, pillars] = await Promise.all([
        ctx.db.prepare(`SELECT * FROM brand_dna WHERE client_id = ?`).bind(input.clientId).first(),
        ctx.db.prepare(`SELECT COUNT(*) as count FROM brand_dna_sessions WHERE client_id = ? AND status = 'completed'`).bind(input.clientId).first(),
        ctx.db.prepare(`SELECT COUNT(*) as count FROM voice_recordings WHERE client_id = ? AND status = 'completed'`).bind(input.clientId).first(),
        ctx.db.prepare(`SELECT COUNT(*) as count FROM audience_personas WHERE client_id = ? AND status = 'approved'`).bind(input.clientId).first(),
        ctx.db.prepare(`SELECT COUNT(*) as count FROM content_pillars WHERE client_id = ? AND status = 'approved'`).bind(input.clientId).first(),
      ]);

      const steps = [
        { step: 'voice', label: 'Voice Samples', complete: ((voiceRecordings?.count as number) || 0) >= 1 },
        { step: 'session', label: 'BrandDNA Session', complete: ((sessions?.count as number) || 0) >= 1 },
        { step: 'persona', label: 'Audience Persona', complete: ((personas?.count as number) || 0) >= 1 },
        { step: 'pillars', label: 'Content Pillars', complete: ((pillars?.count as number) || 0) >= 3 },
      ];

      const completedSteps = steps.filter(s => s.complete).length;
      const totalSteps = steps.length;

      return {
        clientId: input.clientId,
        overallComplete: completedSteps === totalSteps,
        completionPercentage: Math.round((completedSteps / totalSteps) * 100),
        steps,
        strengthScore: (brandDna?.strength_score as number) || 0,
        lastUpdated: (brandDna?.updated_at as number) || null,
        needsAttention: completedSteps < totalSteps,
      };
    }),

  // ===== Story 1.5-7-3: Invite New Clients via Email =====

  sendClientInvite: procedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1).max(100),
      personalMessage: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const inviteId = crypto.randomUUID();
      const inviteToken = crypto.randomUUID();
      const now = Date.now();
      const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

      await ctx.db.prepare(`
        INSERT INTO client_invites (id, inviter_id, email, name, personal_message, token, status, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `).bind(
        inviteId,
        ctx.userId,
        input.email,
        input.name,
        input.personalMessage || null,
        inviteToken,
        now,
        expiresAt
      ).run();

      // In production, this would send an actual email via SES/SendGrid
      // For now, return the invite link
      const inviteLink = `${ctx.env.BETTER_AUTH_URL || 'https://foundry.williamjshaw.ca'}/invite/${inviteToken}`;

      return {
        inviteId,
        inviteLink,
        expiresAt,
        message: `Invite sent to ${input.email}`,
      };
    }),

  listInvites: procedure
    .input(z.object({
      status: z.enum(['all', 'pending', 'accepted', 'expired']).default('all'),
    }))
    .query(async ({ ctx, input }) => {
      let query = `
        SELECT id, email, name, status, created_at, expires_at, accepted_at
        FROM client_invites
        WHERE inviter_id = ?
      `;
      const params: (string | number)[] = [ctx.userId];

      if (input.status !== 'all') {
        query += ` AND status = ?`;
        params.push(input.status);
      }

      query += ` ORDER BY created_at DESC LIMIT 50`;

      const result = await ctx.db.prepare(query).bind(...params).all();

      return (result.results || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        email: row.email as string,
        name: row.name as string,
        status: row.status as string,
        createdAt: row.created_at as number,
        expiresAt: row.expires_at as number,
        acceptedAt: row.accepted_at as number | null,
        isExpired: (row.expires_at as number) < Date.now() && row.status === 'pending',
      }));
    }),

  // ===== Story 1.5-7-4: View Collected Testimonials =====

  listTestimonials: procedure
    .input(z.object({
      clientId: z.string().uuid().optional(),
      status: z.enum(['all', 'pending', 'approved', 'public']).default('all'),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      let query = `
        SELECT t.*, c.name as client_name
        FROM testimonials t
        JOIN clients c ON t.client_id = c.id
        WHERE c.id IN (SELECT client_id FROM user_clients WHERE user_id = ?)
      `;
      const params: (string | number)[] = [ctx.userId];

      if (input.clientId) {
        query += ` AND t.client_id = ?`;
        params.push(input.clientId);
      }

      if (input.status !== 'all') {
        query += ` AND t.status = ?`;
        params.push(input.status);
      }

      query += ` ORDER BY t.created_at DESC LIMIT ?`;
      params.push(input.limit);

      const result = await ctx.db.prepare(query).bind(...params).all();

      return (result.results || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        clientId: row.client_id as string,
        clientName: row.client_name as string,
        type: row.type as string,
        content: row.content as string,
        r2Key: row.r2_key as string | null,
        thumbnailUrl: row.thumbnail_url as string | null,
        duration: row.duration as number | null,
        status: row.status as string,
        publicPermission: row.public_permission as number,
        createdAt: row.created_at as number,
      }));
    }),

  // ===== Story 1.5-7-5: Export Testimonials =====

  getTestimonialExportUrl: procedure
    .input(z.object({
      testimonialId: z.string().uuid(),
      format: z.enum(['mp4', 'mp3', 'json']).default('mp4'),
    }))
    .mutation(async ({ ctx, input }) => {
      const testimonial = await ctx.db.prepare(`
        SELECT t.*, c.name as client_name
        FROM testimonials t
        JOIN clients c ON t.client_id = c.id
        WHERE t.id = ? AND c.id IN (SELECT client_id FROM user_clients WHERE user_id = ?)
      `).bind(input.testimonialId, ctx.userId).first();

      if (!testimonial) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Testimonial not found' });
      }

      if (input.format === 'json') {
        return {
          format: 'json',
          data: {
            clientName: testimonial.client_name as string,
            content: testimonial.content as string,
            createdAt: testimonial.created_at as number,
          },
          downloadUrl: null,
        };
      }

      // For video/audio, return R2 presigned URL
      const r2Key = testimonial.r2_key as string;
      if (!r2Key) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No media file available' });
      }

      // Generate presigned download URL (valid for 1 hour)
      // In production, this would use R2's presigned URL feature
      const downloadUrl = `/api/download/${encodeURIComponent(r2Key)}?format=${input.format}`;

      return {
        format: input.format,
        data: null,
        downloadUrl,
        expiresIn: 3600,
      };
    }),

  // ===== Story 1.5-7-6: Self-Serve Client Onboarding Links =====

  createOnboardingLink: procedure
    .input(z.object({
      name: z.string().min(1).max(100).optional(), // Pre-fill client name
      expiresInDays: z.number().min(1).max(30).default(7),
      maxUses: z.number().min(1).max(100).default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const linkId = crypto.randomUUID();
      const token = crypto.randomUUID();
      const now = Date.now();
      const expiresAt = now + input.expiresInDays * 24 * 60 * 60 * 1000;

      await ctx.db.prepare(`
        INSERT INTO onboarding_links (id, creator_id, token, prefill_name, expires_at, max_uses, use_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
      `).bind(linkId, ctx.userId, token, input.name || null, expiresAt, input.maxUses, now).run();

      const onboardingUrl = `${ctx.env.BETTER_AUTH_URL || 'https://foundry.williamjshaw.ca'}/onboard/${token}`;

      return {
        linkId,
        onboardingUrl,
        expiresAt,
        maxUses: input.maxUses,
        prefillName: input.name,
      };
    }),

  listOnboardingLinks: procedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.prepare(`
        SELECT * FROM onboarding_links WHERE creator_id = ? ORDER BY created_at DESC LIMIT 20
      `).bind(ctx.userId).all();

      return (result.results || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        token: row.token as string,
        prefillName: row.prefill_name as string | null,
        expiresAt: row.expires_at as number,
        maxUses: row.max_uses as number,
        useCount: row.use_count as number,
        isExpired: (row.expires_at as number) < Date.now(),
        isMaxedOut: (row.use_count as number) >= (row.max_uses as number),
        createdAt: row.created_at as number,
      }));
    }),

  // ===== Story 1.5-7-7: Client Progress Dashboard =====

  getClientProgress: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const [client, brandDna, hubs, spokes, handoffs] = await Promise.all([
        ctx.db.prepare(`SELECT * FROM clients WHERE id = ?`).bind(input.clientId).first(),
        ctx.db.prepare(`SELECT * FROM brand_dna WHERE client_id = ?`).bind(input.clientId).first(),
        ctx.db.prepare(`SELECT COUNT(*) as count FROM hubs WHERE client_id = ?`).bind(input.clientId).first(),
        ctx.db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved FROM post_queue WHERE client_id = ?`).bind(input.clientId).first(),
        ctx.db.prepare(`SELECT COUNT(*) as count FROM handoff_log WHERE client_id = ? AND handed_off_at > ?`).bind(input.clientId, Date.now() - 30 * 24 * 60 * 60 * 1000).first(),
      ]);

      return {
        client: {
          id: input.clientId,
          name: (client?.name as string) || 'Unknown',
          status: (client?.status as string) || 'unknown',
          createdAt: (client?.created_at as number) || 0,
        },
        brandDna: {
          strengthScore: (brandDna?.strength_score as number) || 0,
          lastUpdated: (brandDna?.updated_at as number) || null,
        },
        content: {
          totalHubs: (hubs?.count as number) || 0,
          totalSpokes: (spokes?.total as number) || 0,
          approvedSpokes: (spokes?.approved as number) || 0,
          postsThisMonth: (handoffs?.count as number) || 0,
        },
        health: calculateClientHealth({
          brandDnaScore: (brandDna?.strength_score as number) || 0,
          hubs: (hubs?.count as number) || 0,
          recentPosts: (handoffs?.count as number) || 0,
        }),
      };
    }),

  // ===== Story 1.5-7-8: Proxy BrandDNA Completion =====

  proxyCompleteBrandDna: procedure
    .input(z.object({
      clientId: z.string().min(1),
      brandDnaData: z.object({
        primaryTone: z.string(),
        writingStyle: z.string(),
        targetAudience: z.string(),
        voiceMarkers: z.array(z.string()).optional(),
        bannedWords: z.array(z.string()).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const now = Date.now();
      const voiceEntities = JSON.stringify({
        voiceMarkers: input.brandDnaData.voiceMarkers || [],
        bannedWords: input.brandDnaData.bannedWords || [],
        stances: [],
      });

      // Upsert brand_dna
      await ctx.db.prepare(`
        INSERT INTO brand_dna (id, client_id, primary_tone, writing_style, target_audience, voice_entities, calibration_source, strength_score, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'proxy', 50, ?)
        ON CONFLICT(client_id) DO UPDATE SET
          primary_tone = excluded.primary_tone,
          writing_style = excluded.writing_style,
          target_audience = excluded.target_audience,
          voice_entities = excluded.voice_entities,
          calibration_source = 'proxy',
          updated_at = excluded.updated_at
      `).bind(
        crypto.randomUUID(),
        input.clientId,
        input.brandDnaData.primaryTone,
        input.brandDnaData.writingStyle,
        input.brandDnaData.targetAudience,
        voiceEntities,
        now
      ).run();

      return {
        success: true,
        completedAt: now,
        message: 'Brand DNA completed via proxy',
      };
    }),

  // ===== Story 1.5-7-9: Automated Nudge Emails =====

  getNudgeStatus: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const nudges = await ctx.db.prepare(`
        SELECT * FROM nudge_emails WHERE client_id = ? ORDER BY sent_at DESC LIMIT 5
      `).bind(input.clientId).all();

      const lastNudge = (nudges.results || [])[0];
      const daysSinceLastNudge = lastNudge
        ? Math.floor((Date.now() - (lastNudge.sent_at as number)) / (24 * 60 * 60 * 1000))
        : null;

      return {
        clientId: input.clientId,
        totalNudgesSent: (nudges.results || []).length,
        lastNudgeAt: lastNudge ? (lastNudge.sent_at as number) : null,
        daysSinceLastNudge,
        nudgeHistory: (nudges.results || []).map((n: Record<string, unknown>) => ({
          id: n.id as string,
          type: n.type as string,
          sentAt: n.sent_at as number,
        })),
      };
    }),

  sendNudge: procedure
    .input(z.object({
      clientId: z.string().min(1),
      type: z.enum(['brandDna-incomplete', 'no-activity', 'review-pending', 'custom']),
      customMessage: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get client email
      const client = await ctx.db.prepare(`
        SELECT contact_email, name FROM clients WHERE id = ?
      `).bind(input.clientId).first();

      if (!client?.contact_email) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Client has no contact email' });
      }

      const nudgeId = crypto.randomUUID();
      const now = Date.now();

      await ctx.db.prepare(`
        INSERT INTO nudge_emails (id, client_id, type, custom_message, sent_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(nudgeId, input.clientId, input.type, input.customMessage || null, now).run();

      // In production, this would send via SES/SendGrid
      return {
        nudgeId,
        sentTo: client.contact_email as string,
        type: input.type,
        sentAt: now,
      };
    }),

  // Story 14-1: Multi-Client Overview Dashboard
  getOverview: procedure
    .query(async ({ ctx }) => {
      // Get all clients with health metrics
      const clients = await ctx.db.prepare(`
        SELECT 
          c.id, c.name, c.status, c.brand_color, c.industry,
          bd.strength_score as brand_dna_score,
          (SELECT COUNT(*) FROM hubs WHERE client_id = c.id) as hub_count,
          (SELECT COUNT(*) FROM engagement_metrics WHERE client_id = c.id AND created_at > unixepoch() - 604800) as recent_posts
        FROM clients c
        LEFT JOIN brand_dna bd ON bd.client_id = c.id
        WHERE c.user_id = ?
        ORDER BY c.name
      `).bind(ctx.userId).all();

      const clientData = (clients.results || []).map((client: any) => ({
        ...client,
        health: calculateClientHealth({
          brandDnaScore: client.brand_dna_score || 0,
          hubs: client.hub_count || 0,
          recentPosts: client.recent_posts || 0,
        }),
      }));

      // Aggregate stats
      const totalClients = clientData.length;
      const activeClients = clientData.filter((c: any) => c.health === 'healthy').length;
      const needsAttention = clientData.filter((c: any) => c.health === 'needs-attention').length;
      const inactive = clientData.filter((c: any) => c.health === 'inactive').length;

      return {
        clients: clientData,
        stats: {
          total: totalClients,
          active: activeClients,
          needsAttention,
          inactive,
        },
      };
    }),

  // Story 14-2: Cross-Client Analytics Aggregation
  getCrossClientAnalytics: procedure
    .input(z.object({
      periodDays: z.number().min(1).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const since = Math.floor(Date.now() / 1000) - (input.periodDays * 86400);

      // Engagement by client
      const byClient = await ctx.db.prepare(`
        SELECT 
          c.id as client_id,
          c.name as client_name,
          COUNT(em.id) as post_count,
          SUM(em.impressions) as total_impressions,
          AVG(em.engagement_rate) as avg_engagement_rate,
          SUM(em.likes) as total_likes
        FROM clients c
        LEFT JOIN engagement_metrics em ON em.client_id = c.id AND em.created_at > ?
        WHERE c.user_id = ?
        GROUP BY c.id
        ORDER BY total_impressions DESC
      `).bind(since, ctx.userId).all();

      // Engagement by platform (across all clients)
      const byPlatform = await ctx.db.prepare(`
        SELECT 
          em.platform,
          COUNT(*) as post_count,
          SUM(em.impressions) as total_impressions,
          AVG(em.engagement_rate) as avg_engagement_rate
        FROM engagement_metrics em
        INNER JOIN clients c ON c.id = em.client_id AND c.user_id = ?
        WHERE em.created_at > ?
        GROUP BY em.platform
        ORDER BY total_impressions DESC
      `).bind(ctx.userId, since).all();

      // Overall
      const overall = await ctx.db.prepare(`
        SELECT 
          COUNT(*) as total_posts,
          SUM(impressions) as total_impressions,
          AVG(engagement_rate) as avg_engagement_rate,
          COUNT(DISTINCT em.client_id) as active_clients
        FROM engagement_metrics em
        INNER JOIN clients c ON c.id = em.client_id AND c.user_id = ?
        WHERE em.created_at > ?
      `).bind(ctx.userId, since).first();

      return {
        byClient: byClient.results || [],
        byPlatform: byPlatform.results || [],
        overall: overall || { total_posts: 0, total_impressions: 0, avg_engagement_rate: 0, active_clients: 0 },
        periodDays: input.periodDays,
      };
    }),
});

// Helper function
function calculateClientHealth(data: { brandDnaScore: number; hubs: number; recentPosts: number }): 'healthy' | 'needs-attention' | 'inactive' {
  if (data.brandDnaScore >= 70 && data.hubs >= 1 && data.recentPosts >= 5) return 'healthy';
  if (data.brandDnaScore >= 30 || data.hubs >= 1 || data.recentPosts >= 1) return 'needs-attention';
  return 'inactive';
}
