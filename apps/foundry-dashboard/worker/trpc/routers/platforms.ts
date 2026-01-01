/**
 * Epic 11: Engagement Data Pipeline
 * Platform connections router for OAuth and metrics management
 */
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Platform types
const platformSchema = z.enum(['twitter', 'linkedin', 'instagram', 'tiktok']);
type Platform = z.infer<typeof platformSchema>;

// OAuth config per platform
const PLATFORM_CONFIG: Record<Platform, {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  rateLimit: { requests: number; windowMs: number };
}> = {
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'users.read', 'offline.access'],
    rateLimit: { requests: 300, windowMs: 15 * 60 * 1000 }, // 300/15min
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['r_liteprofile', 'r_organization_social'],
    rateLimit: { requests: 100, windowMs: 24 * 60 * 60 * 1000 }, // 100/day
  },
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scopes: ['user_profile', 'user_media'],
    rateLimit: { requests: 200, windowMs: 60 * 60 * 1000 }, // 200/hour
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/auth/authorize',
    tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
    scopes: ['user.info.basic', 'video.list'],
    rateLimit: { requests: 1000, windowMs: 24 * 60 * 60 * 1000 }, // 1000/day
  },
};

export const platformsRouter = t.router({
  // List connected platforms for a client
  listConnections: procedure
    .input(z.object({
      clientId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const result = await ctx.db
        .prepare(`
          SELECT
            id, platform, platform_username, platform_display_name, platform_avatar_url,
            status, last_sync_at, sync_error, created_at, updated_at
          FROM platform_connections
          WHERE client_id = ?
          ORDER BY created_at DESC
        `)
        .bind(input.clientId)
        .all();

      interface ConnectionRow {
        id: string;
        platform: Platform;
        platform_username: string | null;
        platform_display_name: string | null;
        platform_avatar_url: string | null;
        status: 'active' | 'expired' | 'revoked' | 'error';
        last_sync_at: number | null;
        sync_error: string | null;
        created_at: number;
        updated_at: number;
      }

      return {
        connections: (result.results as unknown as ConnectionRow[]).map((c) => ({
          id: c.id,
          platform: c.platform,
          username: c.platform_username,
          displayName: c.platform_display_name,
          avatarUrl: c.platform_avatar_url,
          status: c.status,
          lastSyncAt: c.last_sync_at ? new Date(c.last_sync_at * 1000).toISOString() : null,
          syncError: c.sync_error,
          createdAt: new Date(c.created_at * 1000).toISOString(),
        })),
      };
    }),

  // Get OAuth URL to initiate connection
  getAuthUrl: procedure
    .input(z.object({
      clientId: z.string(),
      platform: platformSchema,
      redirectUri: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const config = PLATFORM_CONFIG[input.platform];
      const state = crypto.randomUUID();

      // Store state in KV for verification (expires in 10 min)
      // In real impl, would use ctx.env.KV
      const stateKey = `oauth:${input.platform}:${state}`;
      const stateData = JSON.stringify({
        clientId: input.clientId,
        userId: ctx.userId,
        redirectUri: input.redirectUri,
        createdAt: Date.now(),
      });

      // Build OAuth URL
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: `{{${input.platform.toUpperCase()}_CLIENT_ID}}`, // Placeholder for env var
        redirect_uri: input.redirectUri,
        scope: config.scopes.join(' '),
        state,
      });

      // Twitter requires PKCE
      if (input.platform === 'twitter') {
        const codeVerifier = crypto.randomUUID() + crypto.randomUUID();
        params.set('code_challenge', codeVerifier); // In real impl, would hash this
        params.set('code_challenge_method', 'plain'); // Would use S256 in production
      }

      return {
        authUrl: `${config.authUrl}?${params.toString()}`,
        state,
        stateKey,
        stateData, // For development - store this in KV
      };
    }),

  // Handle OAuth callback - exchange code for tokens
  handleCallback: procedure
    .input(z.object({
      clientId: z.string(),
      platform: platformSchema,
      code: z.string(),
      state: z.string(),
      redirectUri: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // In real impl: verify state from KV, exchange code for tokens
      // For now, return placeholder
      const connectionId = crypto.randomUUID();
      const now = Math.floor(Date.now() / 1000);

      await ctx.db
        .prepare(`
          INSERT INTO platform_connections (
            id, client_id, user_id, platform,
            access_token, refresh_token, token_expires_at,
            platform_user_id, platform_username, platform_display_name,
            scopes, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          connectionId,
          input.clientId,
          ctx.userId,
          input.platform,
          `placeholder_access_token_${input.code}`, // Would come from OAuth exchange
          `placeholder_refresh_token`,
          now + 3600, // 1 hour from now
          `placeholder_user_id`,
          null,
          null,
          JSON.stringify(PLATFORM_CONFIG[input.platform].scopes),
          'active',
          now,
          now
        )
        .run();

      return {
        connectionId,
        status: 'connected',
        message: `Successfully connected ${input.platform}`,
      };
    }),

  // Disconnect a platform
  disconnect: procedure
    .input(z.object({
      connectionId: z.string(),
      clientId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Verify connection belongs to client
      const connection = await ctx.db
        .prepare('SELECT id, platform FROM platform_connections WHERE id = ? AND client_id = ?')
        .bind(input.connectionId, input.clientId)
        .first();

      if (!connection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Platform connection not found',
        });
      }

      await ctx.db
        .prepare('DELETE FROM platform_connections WHERE id = ?')
        .bind(input.connectionId)
        .run();

      return { success: true };
    }),

  // Manual metric entry (Story 11-6)
  recordManualMetrics: procedure
    .input(z.object({
      clientId: z.string(),
      spokeId: z.string(),
      platform: platformSchema,
      publishedAt: z.string().datetime().optional(),
      metrics: z.object({
        impressions: z.number().int().min(0).optional(),
        likes: z.number().int().min(0).optional(),
        comments: z.number().int().min(0).optional(),
        shares: z.number().int().min(0).optional(),
      }),
      performedWell: z.boolean().optional(),
      notes: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const id = crypto.randomUUID();
      const now = Math.floor(Date.now() / 1000);
      const publishedAt = input.publishedAt
        ? Math.floor(new Date(input.publishedAt).getTime() / 1000)
        : null;

      await ctx.db
        .prepare(`
          INSERT INTO manual_metrics (
            id, client_id, spoke_id, user_id, platform,
            impressions, likes, comments, shares,
            performed_well, notes, published_at, recorded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          id,
          input.clientId,
          input.spokeId,
          ctx.userId,
          input.platform,
          input.metrics.impressions ?? null,
          input.metrics.likes ?? null,
          input.metrics.comments ?? null,
          input.metrics.shares ?? null,
          input.performedWell === undefined ? null : input.performedWell ? 1 : 0,
          input.notes ?? null,
          publishedAt,
          now
        )
        .run();

      // Update engagement training data
      const totalEngagements =
        (input.metrics.likes ?? 0) +
        (input.metrics.comments ?? 0) +
        (input.metrics.shares ?? 0);

      const engagementRate =
        input.metrics.impressions && input.metrics.impressions > 0
          ? (totalEngagements / input.metrics.impressions) * 100
          : null;

      // Determine performance tier
      let performanceTier: string | null = null;
      if (engagementRate !== null) {
        if (engagementRate >= 10) performanceTier = 'viral';
        else if (engagementRate >= 5) performanceTier = 'high';
        else if (engagementRate >= 2) performanceTier = 'average';
        else if (engagementRate >= 0.5) performanceTier = 'low';
        else performanceTier = 'flop';
      }

      // Update training data if exists
      if (performanceTier) {
        await ctx.db
          .prepare(`
            UPDATE engagement_training_data
            SET
              actual_engagement_rate = ?,
              actual_performance_tier = ?,
              metrics_recorded_at = ?
            WHERE spoke_id = ? AND platform = ?
          `)
          .bind(
            Math.round(engagementRate! * 10), // Store as integer * 10
            performanceTier,
            now,
            input.spokeId,
            input.platform
          )
          .run();
      }

      return {
        id,
        engagementRate,
        performanceTier,
      };
    }),

  // Get metrics for a spoke
  getSpokeMetrics: procedure
    .input(z.object({
      clientId: z.string(),
      spokeId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get manual metrics
      const manualResult = await ctx.db
        .prepare(`
          SELECT platform, impressions, likes, comments, shares,
                 performed_well, notes, published_at, recorded_at
          FROM manual_metrics
          WHERE client_id = ? AND spoke_id = ?
          ORDER BY recorded_at DESC
        `)
        .bind(input.clientId, input.spokeId)
        .all();

      // Get automated metrics from published posts
      const automatedResult = await ctx.db
        .prepare(`
          SELECT
            pp.platform, pp.post_url, pp.published_at,
            em.impressions, em.likes, em.comments, em.shares, em.saves,
            em.engagement_rate, em.metrics_updated_at
          FROM published_posts pp
          LEFT JOIN engagement_metrics em ON pp.id = em.published_post_id
          WHERE pp.client_id = ? AND pp.spoke_id = ?
          ORDER BY pp.published_at DESC
        `)
        .bind(input.clientId, input.spokeId)
        .all();

      // Get training data
      const trainingResult = await ctx.db
        .prepare(`
          SELECT platform, predicted_engagement, predicted_confidence,
                 actual_engagement_rate, actual_performance_tier
          FROM engagement_training_data
          WHERE spoke_id = ?
        `)
        .bind(input.spokeId)
        .first();

      interface ManualRow {
        platform: string;
        impressions: number | null;
        likes: number | null;
        comments: number | null;
        shares: number | null;
        performed_well: number | null;
        notes: string | null;
        published_at: number | null;
        recorded_at: number;
      }

      interface AutomatedRow {
        platform: string;
        post_url: string | null;
        published_at: number;
        impressions: number | null;
        likes: number | null;
        comments: number | null;
        shares: number | null;
        saves: number | null;
        engagement_rate: number | null;
        metrics_updated_at: number | null;
      }

      interface TrainingRow {
        platform: string;
        predicted_engagement: number;
        predicted_confidence: string;
        actual_engagement_rate: number | null;
        actual_performance_tier: string | null;
      }

      return {
        manual: (manualResult.results as unknown as ManualRow[]).map((m) => ({
          platform: m.platform,
          impressions: m.impressions,
          likes: m.likes,
          comments: m.comments,
          shares: m.shares,
          performedWell: m.performed_well === 1,
          notes: m.notes,
          publishedAt: m.published_at ? new Date(m.published_at * 1000).toISOString() : null,
          recordedAt: new Date(m.recorded_at * 1000).toISOString(),
        })),
        automated: (automatedResult.results as unknown as AutomatedRow[]).map((a) => ({
          platform: a.platform,
          postUrl: a.post_url,
          publishedAt: new Date(a.published_at * 1000).toISOString(),
          impressions: a.impressions,
          likes: a.likes,
          comments: a.comments,
          shares: a.shares,
          saves: a.saves,
          engagementRate: a.engagement_rate ? a.engagement_rate / 100 : null,
          lastUpdated: a.metrics_updated_at
            ? new Date(a.metrics_updated_at * 1000).toISOString()
            : null,
        })),
        prediction: trainingResult
          ? {
              platform: (trainingResult as unknown as TrainingRow).platform,
              predicted: (trainingResult as unknown as TrainingRow).predicted_engagement / 10,
              confidence: (trainingResult as unknown as TrainingRow).predicted_confidence,
              actual: (trainingResult as unknown as TrainingRow).actual_engagement_rate
                ? (trainingResult as unknown as TrainingRow).actual_engagement_rate! / 10
                : null,
              performanceTier: (trainingResult as unknown as TrainingRow).actual_performance_tier,
            }
          : null,
      };
    }),
});
