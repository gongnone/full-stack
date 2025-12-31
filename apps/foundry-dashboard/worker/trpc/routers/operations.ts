/**
 * Operations Router - Resilience & Observability
 *
 * Epic 1.5-10: Observability, DLQ handling, rate limiting
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

// Rate limit configuration per client
const RATE_LIMITS: Record<string, { requests: number; windowMs: number }> = {
  default: { requests: 100, windowMs: 60000 }, // 100 req/min
  premium: { requests: 500, windowMs: 60000 }, // 500 req/min
  enterprise: { requests: 2000, windowMs: 60000 }, // 2000 req/min
};

export const operationsRouter = t.router({
  // ===== Story 1.5-10-1: Observability and Alerting =====

  getSystemHealth: procedure
    .query(async ({ ctx }) => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      // Get recent error counts
      const errors = await ctx.db.prepare(`
        SELECT COUNT(*) as count FROM error_log WHERE created_at > ?
      `).bind(oneHourAgo).first();

      // Get queue depths
      const dlqCount = await ctx.db.prepare(`
        SELECT COUNT(*) as count FROM dead_letter_queue WHERE status = 'pending'
      `).first();

      // Get active workflows (approximation)
      const activeWorkflows = await ctx.db.prepare(`
        SELECT COUNT(*) as count FROM extraction_progress WHERE status = 'processing'
      `).first();

      const errorRate = (errors?.count as number) || 0;
      const queueDepth = (dlqCount?.count as number) || 0;

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (errorRate > 100 || queueDepth > 50) status = 'unhealthy';
      else if (errorRate > 20 || queueDepth > 10) status = 'degraded';

      return {
        status,
        timestamp: now,
        metrics: {
          errorsLastHour: errorRate,
          dlqPending: queueDepth,
          activeWorkflows: (activeWorkflows?.count as number) || 0,
        },
        alerts: [
          ...(errorRate > 50 ? [{ severity: 'high', message: `High error rate: ${errorRate} errors/hour` }] : []),
          ...(queueDepth > 20 ? [{ severity: 'medium', message: `DLQ backup: ${queueDepth} items pending` }] : []),
        ],
      };
    }),

  getMetrics: procedure
    .input(z.object({
      clientId: z.string().min(1).optional(),
      metric: z.enum(['api_latency', 'error_rate', 'spoke_generation', 'review_throughput']),
      period: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
    }))
    .query(async ({ ctx, input }) => {
      if (input.clientId) {
        await assertClientAccess(ctx, input.clientId);
      }

      const periodMs: Record<string, number> = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };

      const since = Date.now() - periodMs[input.period];

      // Metrics would come from a time-series DB in production
      // This is a simplified implementation using D1
      let data: Array<{ timestamp: number; value: number }> = [];

      if (input.metric === 'spoke_generation') {
        const result = await ctx.db.prepare(`
          SELECT
            (created_at / 3600000) * 3600000 as hour,
            COUNT(*) as count
          FROM post_queue
          WHERE created_at > ? ${input.clientId ? 'AND client_id = ?' : ''}
          GROUP BY hour
          ORDER BY hour ASC
        `).bind(...(input.clientId ? [since, input.clientId] : [since])).all();

        data = (result.results || []).map((r: Record<string, unknown>) => ({
          timestamp: r.hour as number,
          value: r.count as number,
        }));
      }

      return {
        metric: input.metric,
        period: input.period,
        data,
        summary: {
          total: data.reduce((sum, d) => sum + d.value, 0),
          average: data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length) : 0,
          peak: data.length > 0 ? Math.max(...data.map(d => d.value)) : 0,
        },
      };
    }),

  logError: procedure
    .input(z.object({
      clientId: z.string().min(1).optional(),
      errorType: z.string(),
      message: z.string(),
      stack: z.string().optional(),
      context: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const errorId = crypto.randomUUID();
      const now = Date.now();

      await ctx.db.prepare(`
        INSERT INTO error_log (id, client_id, user_id, error_type, message, stack, context, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        errorId,
        input.clientId || null,
        ctx.userId,
        input.errorType,
        input.message,
        input.stack || null,
        input.context ? JSON.stringify(input.context) : null,
        now
      ).run();

      return { errorId, logged: true };
    }),

  // ===== Story 1.5-10-2: Dead Letter Queue Handling =====

  getDLQItems: procedure
    .input(z.object({
      clientId: z.string().min(1).optional(),
      status: z.enum(['pending', 'retried', 'failed', 'resolved']).default('pending'),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      let query = `
        SELECT * FROM dead_letter_queue WHERE status = ?
      `;
      const params: (string | number)[] = [input.status];

      if (input.clientId) {
        await assertClientAccess(ctx, input.clientId);
        query += ` AND client_id = ?`;
        params.push(input.clientId);
      }

      query += ` ORDER BY created_at DESC LIMIT ?`;
      params.push(input.limit);

      const result = await ctx.db.prepare(query).bind(...params).all();

      return (result.results || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        clientId: row.client_id as string | null,
        messageType: row.message_type as string,
        payload: JSON.parse((row.payload as string) || '{}'),
        errorMessage: row.error_message as string,
        retryCount: row.retry_count as number,
        status: row.status as string,
        createdAt: row.created_at as number,
        lastRetryAt: row.last_retry_at as number | null,
      }));
    }),

  retryDLQItem: procedure
    .input(z.object({
      itemId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.prepare(`
        SELECT * FROM dead_letter_queue WHERE id = ?
      `).bind(input.itemId).first();

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'DLQ item not found' });
      }

      if (item.client_id) {
        await assertClientAccess(ctx, item.client_id as string);
      }

      const now = Date.now();
      const newRetryCount = (item.retry_count as number) + 1;

      // Update retry count
      await ctx.db.prepare(`
        UPDATE dead_letter_queue
        SET retry_count = ?, last_retry_at = ?, status = 'retried'
        WHERE id = ?
      `).bind(newRetryCount, now, input.itemId).run();

      // In production, this would re-queue the message to the appropriate handler
      // For now, we just mark it as retried

      return {
        success: true,
        itemId: input.itemId,
        retryCount: newRetryCount,
        status: 'retried',
      };
    }),

  resolveDLQItem: procedure
    .input(z.object({
      itemId: z.string().uuid(),
      resolution: z.enum(['resolved', 'ignored', 'manual']),
      notes: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const now = Date.now();

      await ctx.db.prepare(`
        UPDATE dead_letter_queue
        SET status = ?, resolution_notes = ?, resolved_at = ?
        WHERE id = ?
      `).bind(input.resolution, input.notes || null, now, input.itemId).run();

      return { success: true, resolvedAt: now };
    }),

  addToDLQ: procedure
    .input(z.object({
      clientId: z.string().min(1).optional(),
      messageType: z.string(),
      payload: z.record(z.unknown()),
      errorMessage: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const itemId = crypto.randomUUID();
      const now = Date.now();

      await ctx.db.prepare(`
        INSERT INTO dead_letter_queue (id, client_id, message_type, payload, error_message, retry_count, status, created_at)
        VALUES (?, ?, ?, ?, ?, 0, 'pending', ?)
      `).bind(
        itemId,
        input.clientId || null,
        input.messageType,
        JSON.stringify(input.payload),
        input.errorMessage,
        now
      ).run();

      return { itemId, status: 'pending' };
    }),

  // ===== Story 1.5-10-3: Per-Client Rate Limiting =====

  getRateLimitStatus: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get client's rate limit tier
      const client = await ctx.db.prepare(`
        SELECT rate_limit_tier FROM clients WHERE id = ?
      `).bind(input.clientId).first();

      const tier = (client?.rate_limit_tier as string) || 'default';
      const limits = RATE_LIMITS[tier] || RATE_LIMITS.default;

      // Get current usage (last window)
      const windowStart = Date.now() - limits.windowMs;
      const usage = await ctx.db.prepare(`
        SELECT COUNT(*) as count FROM api_requests
        WHERE client_id = ? AND created_at > ?
      `).bind(input.clientId, windowStart).first();

      const currentUsage = (usage?.count as number) || 0;
      const remaining = Math.max(0, limits.requests - currentUsage);
      const percentUsed = Math.round((currentUsage / limits.requests) * 100);

      return {
        clientId: input.clientId,
        tier,
        limits: {
          requests: limits.requests,
          windowMs: limits.windowMs,
          windowDescription: `${limits.windowMs / 1000} seconds`,
        },
        usage: {
          current: currentUsage,
          remaining,
          percentUsed,
          resetAt: windowStart + limits.windowMs,
        },
        isLimited: currentUsage >= limits.requests,
      };
    }),

  recordApiRequest: procedure
    .input(z.object({
      clientId: z.string().min(1),
      endpoint: z.string(),
      latencyMs: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const now = Date.now();

      await ctx.db.prepare(`
        INSERT INTO api_requests (id, client_id, endpoint, latency_ms, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), input.clientId, input.endpoint, input.latencyMs || null, now).run();

      // Check if rate limited
      const client = await ctx.db.prepare(`
        SELECT rate_limit_tier FROM clients WHERE id = ?
      `).bind(input.clientId).first();

      const tier = (client?.rate_limit_tier as string) || 'default';
      const limits = RATE_LIMITS[tier] || RATE_LIMITS.default;
      const windowStart = now - limits.windowMs;

      const usage = await ctx.db.prepare(`
        SELECT COUNT(*) as count FROM api_requests
        WHERE client_id = ? AND created_at > ?
      `).bind(input.clientId, windowStart).first();

      const isLimited = ((usage?.count as number) || 0) >= limits.requests;

      return {
        recorded: true,
        isLimited,
        remaining: Math.max(0, limits.requests - ((usage?.count as number) || 0)),
      };
    }),

  updateRateLimitTier: procedure
    .input(z.object({
      clientId: z.string().min(1),
      tier: z.enum(['default', 'premium', 'enterprise']),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      await ctx.db.prepare(`
        UPDATE clients SET rate_limit_tier = ? WHERE id = ?
      `).bind(input.tier, input.clientId).run();

      return {
        success: true,
        newTier: input.tier,
        newLimits: RATE_LIMITS[input.tier],
      };
    }),
});
