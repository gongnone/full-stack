/**
 * Engagement Data Pipeline Router (Epic 11 + 12)
 * 
 * Handles platform connections, engagement metrics, manual entry,
 * G7 predictions, and model accuracy tracking.
 */

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import type { Context } from '../context';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Supported platforms
const PLATFORMS = ['twitter', 'linkedin', 'instagram', 'tiktok'] as const;
const platformSchema = z.enum(PLATFORMS);

export const engagementRouter = t.router({
  /**
   * Get all platform connections for a client
   */
  getConnections: procedure
    .input(z.object({
      clientId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const connections = await ctx.env.DB.prepare(
        `SELECT id, platform, platform_username, status, created_at, updated_at
         FROM platform_connections
         WHERE client_id = ? AND status != 'revoked'
         ORDER BY platform`
      ).bind(input.clientId).all();

      return {
        connections: connections.results || [],
      };
    }),

  /**
   * Disconnect a platform
   */
  disconnectPlatform: procedure
    .input(z.object({
      clientId: z.string(),
      connectionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.env.DB.prepare(
        `UPDATE platform_connections 
         SET status = 'revoked', updated_at = unixepoch()
         WHERE id = ? AND client_id = ?`
      ).bind(input.connectionId, input.clientId).run();

      return { success: true };
    }),

  /**
   * Get engagement metrics for a client (with optional filters)
   */
  getMetrics: procedure
    .input(z.object({
      clientId: z.string(),
      platform: platformSchema.optional(),
      spokeId: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      let query = `
        SELECT em.*, g7.g7_score, g7.confidence as g7_confidence
        FROM engagement_metrics em
        LEFT JOIN g7_predictions g7 ON g7.spoke_id = em.spoke_id AND g7.platform = em.platform
        WHERE em.client_id = ?
      `;
      const bindings: any[] = [input.clientId];

      if (input.platform) {
        query += ' AND em.platform = ?';
        bindings.push(input.platform);
      }
      if (input.spokeId) {
        query += ' AND em.spoke_id = ?';
        bindings.push(input.spokeId);
      }

      query += ' ORDER BY em.updated_at DESC LIMIT ? OFFSET ?';
      bindings.push(input.limit, input.offset);

      const metrics = await ctx.env.DB.prepare(query).bind(...bindings).all();

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM engagement_metrics WHERE client_id = ?`;
      const countBindings: any[] = [input.clientId];
      if (input.platform) {
        countQuery += ' AND platform = ?';
        countBindings.push(input.platform);
      }
      if (input.spokeId) {
        countQuery += ' AND spoke_id = ?';
        countBindings.push(input.spokeId);
      }

      const countResult = await ctx.env.DB.prepare(countQuery).bind(...countBindings).first();

      return {
        metrics: metrics.results || [],
        total: (countResult as any)?.total || 0,
      };
    }),

  /**
   * Get aggregated engagement stats for a client
   */
  getStats: procedure
    .input(z.object({
      clientId: z.string(),
      periodDays: z.number().min(1).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const since = Math.floor(Date.now() / 1000) - (input.periodDays * 86400);

      const stats = await ctx.env.DB.prepare(`
        SELECT 
          platform,
          COUNT(*) as post_count,
          SUM(impressions) as total_impressions,
          SUM(likes) as total_likes,
          SUM(comments) as total_comments,
          SUM(shares) as total_shares,
          SUM(clicks) as total_clicks,
          AVG(engagement_rate) as avg_engagement_rate,
          MAX(engagement_rate) as best_engagement_rate
        FROM engagement_metrics
        WHERE client_id = ? AND created_at > ?
        GROUP BY platform
      `).bind(input.clientId, since).all();

      const overall = await ctx.env.DB.prepare(`
        SELECT 
          COUNT(*) as total_posts,
          AVG(engagement_rate) as avg_engagement_rate,
          SUM(impressions) as total_impressions
        FROM engagement_metrics
        WHERE client_id = ? AND created_at > ?
      `).bind(input.clientId, since).first();

      return {
        byPlatform: stats.results || [],
        overall: overall || { total_posts: 0, avg_engagement_rate: 0, total_impressions: 0 },
      };
    }),

  /**
   * Manual metric entry (Story 11-6)
   */
  addManualMetrics: procedure
    .input(z.object({
      clientId: z.string(),
      spokeId: z.string(),
      platform: platformSchema,
      externalPostUrl: z.string().url().optional(),
      impressions: z.number().min(0).default(0),
      likes: z.number().min(0).default(0),
      comments: z.number().min(0).default(0),
      shares: z.number().min(0).default(0),
      clicks: z.number().min(0).default(0),
      saves: z.number().min(0).default(0),
      publishedAt: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      const totalEngagements = input.likes + input.comments + input.shares;
      const engagementRate = input.impressions > 0 
        ? totalEngagements / input.impressions 
        : 0;

      await ctx.env.DB.prepare(`
        INSERT INTO engagement_metrics 
        (id, spoke_id, client_id, platform, external_post_url, 
         impressions, likes, comments, shares, clicks, saves,
         engagement_rate, is_manual_entry, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `).bind(
        id, input.spokeId, input.clientId, input.platform,
        input.externalPostUrl || null,
        input.impressions, input.likes, input.comments,
        input.shares, input.clicks, input.saves,
        engagementRate,
        input.publishedAt || null
      ).run();

      return { id, engagementRate };
    }),

  /**
   * Update existing metrics
   */
  updateMetrics: procedure
    .input(z.object({
      metricId: z.string(),
      clientId: z.string(),
      impressions: z.number().min(0).optional(),
      likes: z.number().min(0).optional(),
      comments: z.number().min(0).optional(),
      shares: z.number().min(0).optional(),
      clicks: z.number().min(0).optional(),
      saves: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const current = await ctx.env.DB.prepare(
        `SELECT * FROM engagement_metrics WHERE id = ? AND client_id = ?`
      ).bind(input.metricId, input.clientId).first();

      if (!current) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Metric not found' });
      }

      const impressions = input.impressions ?? (current as any).impressions;
      const likes = input.likes ?? (current as any).likes;
      const comments = input.comments ?? (current as any).comments;
      const shares = input.shares ?? (current as any).shares;
      const clicks = input.clicks ?? (current as any).clicks;
      const saves = input.saves ?? (current as any).saves;
      const totalEngagements = likes + comments + shares;
      const engagementRate = impressions > 0 ? totalEngagements / impressions : 0;

      // Save snapshot before updating
      await ctx.env.DB.prepare(`
        INSERT INTO engagement_snapshots (id, metric_id, impressions, likes, comments, shares, clicks, engagement_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(), input.metricId,
        (current as any).impressions, (current as any).likes,
        (current as any).comments, (current as any).shares,
        (current as any).clicks, (current as any).engagement_rate
      ).run();

      await ctx.env.DB.prepare(`
        UPDATE engagement_metrics 
        SET impressions = ?, likes = ?, comments = ?, shares = ?, clicks = ?, saves = ?,
            engagement_rate = ?, updated_at = unixepoch()
        WHERE id = ? AND client_id = ?
      `).bind(
        impressions, likes, comments, shares, clicks, saves,
        engagementRate, input.metricId, input.clientId
      ).run();

      return { success: true, engagementRate };
    }),

  /**
   * Get G7 predictions for a client's spokes
   */
  getG7Predictions: procedure
    .input(z.object({
      clientId: z.string(),
      platform: platformSchema.optional(),
      minScore: z.number().min(0).max(10).optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      let query = `
        SELECT * FROM g7_predictions
        WHERE client_id = ?
      `;
      const bindings: any[] = [input.clientId];

      if (input.platform) {
        query += ' AND platform = ?';
        bindings.push(input.platform);
      }
      if (input.minScore !== undefined) {
        query += ' AND g7_score >= ?';
        bindings.push(input.minScore);
      }

      query += ' ORDER BY g7_score DESC LIMIT ?';
      bindings.push(input.limit);

      const predictions = await ctx.env.DB.prepare(query).bind(...bindings).all();

      return {
        predictions: predictions.results || [],
        goldenNuggets: (predictions.results || []).filter((p: any) => p.g7_score >= 9).length,
      };
    }),

  /**
   * Get engagement trend for a specific metric over time
   */
  getMetricTrend: procedure
    .input(z.object({
      metricId: z.string(),
      clientId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const snapshots = await ctx.env.DB.prepare(`
        SELECT * FROM engagement_snapshots
        WHERE metric_id = ?
        ORDER BY snapshot_at ASC
      `).bind(input.metricId).all();

      const current = await ctx.env.DB.prepare(
        `SELECT * FROM engagement_metrics WHERE id = ? AND client_id = ?`
      ).bind(input.metricId, input.clientId).first();

      return {
        snapshots: snapshots.results || [],
        current,
      };
    }),

  /**
   * Story 12-6: Model Accuracy Tracking
   * Compare G7 predictions against actual engagement data
   */
  getModelAccuracy: procedure
    .input(z.object({
      clientId: z.string(),
      platform: platformSchema.optional(),
      modelVersion: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Join predictions with actual engagement metrics
      let query = `
        SELECT 
          g7.spoke_id,
          g7.platform,
          g7.g7_score as predicted_score,
          g7.confidence,
          g7.model_version,
          em.engagement_rate as actual_rate,
          em.impressions,
          em.likes + em.comments + em.shares as total_engagements
        FROM g7_predictions g7
        INNER JOIN engagement_metrics em ON em.spoke_id = g7.spoke_id AND em.platform = g7.platform
        WHERE g7.client_id = ?
      `;
      const bindings: any[] = [input.clientId];

      if (input.platform) {
        query += ' AND g7.platform = ?';
        bindings.push(input.platform);
      }
      if (input.modelVersion) {
        query += ' AND g7.model_version = ?';
        bindings.push(input.modelVersion);
      }

      query += ' ORDER BY g7.calculated_at DESC LIMIT 200';

      const pairs = await ctx.env.DB.prepare(query).bind(...bindings).all();
      const data = (pairs.results || []) as any[];

      if (data.length === 0) {
        return {
          dataPoints: 0,
          correlation: null,
          meanAbsoluteError: null,
          accuracy: null,
          goldenNuggetPrecision: null,
          directionalAccuracy: null,
          modelHealth: 'needs-data' as string,
          recommendation: 'Add engagement metrics to start tracking model accuracy.',
          message: 'Not enough data points. Add engagement metrics to track model accuracy.',
        };
      }

      // Calculate Pearson correlation between predicted G7 and actual engagement rate
      const n = data.length;
      const predictions = data.map(d => d.predicted_score);
      const actuals = data.map(d => d.actual_rate * 100); // Scale to comparable range

      const meanPred = predictions.reduce((s, v) => s + v, 0) / n;
      const meanActual = actuals.reduce((s, v) => s + v, 0) / n;

      let numerator = 0;
      let denomPred = 0;
      let denomActual = 0;

      for (let i = 0; i < n; i++) {
        const diffPred = predictions[i] - meanPred;
        const diffActual = actuals[i] - meanActual;
        numerator += diffPred * diffActual;
        denomPred += diffPred * diffPred;
        denomActual += diffActual * diffActual;
      }

      const correlation = denomPred > 0 && denomActual > 0
        ? numerator / (Math.sqrt(denomPred) * Math.sqrt(denomActual))
        : 0;

      // Mean Absolute Error (normalized to 0-10 scale)
      const mae = data.reduce((sum, d) => {
        const normalizedActual = Math.min(10, d.actual_rate * 100); // Scale engagement rate
        return sum + Math.abs(d.predicted_score - normalizedActual);
      }, 0) / n;

      // Golden Nugget precision: of all predicted Golden Nuggets (G7 >= 9), what % actually performed well?
      const predictedGolden = data.filter(d => d.predicted_score >= 9);
      const actualGolden = predictedGolden.filter(d => d.actual_rate >= 0.05); // Top 5% engagement
      const goldenPrecision = predictedGolden.length > 0
        ? actualGolden.length / predictedGolden.length
        : null;

      // Directional accuracy: did higher predictions correspond to higher actuals?
      let correctDirection = 0;
      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < Math.min(i + 5, n); j++) {
          const predDirection = predictions[i] > predictions[j];
          const actualDirection = actuals[i] > actuals[j];
          if (predDirection === actualDirection) correctDirection++;
        }
      }
      const totalPairs = Math.min(n * 4, n * (n - 1) / 2);
      const directionalAccuracy = totalPairs > 0 ? correctDirection / totalPairs : null;

      return {
        dataPoints: n,
        correlation: Math.round(correlation * 1000) / 1000,
        meanAbsoluteError: Math.round(mae * 100) / 100,
        directionalAccuracy: directionalAccuracy != null ? Math.round(directionalAccuracy * 1000) / 1000 : null,
        goldenNuggetPrecision: goldenPrecision != null ? Math.round(goldenPrecision * 1000) / 1000 : null,
        modelHealth: correlation > 0.6 ? 'good' : correlation > 0.3 ? 'learning' : 'needs-data',
        recommendation: n < 50
          ? 'Add more engagement data. Need 50+ data points for reliable accuracy metrics.'
          : correlation > 0.6
            ? 'Model performing well! G7 predictions correlate with actual engagement.'
            : correlation > 0.3
              ? 'Model is learning. Continue adding engagement data to improve predictions.'
              : 'Model needs more training data. Consider adding manual metrics for published content.',
      };
    }),
});
