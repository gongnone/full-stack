import { t } from "@/worker/trpc/trpc-instance";
import { z } from 'zod';

export const analyticsRouter = t.router({
  // Get Zero-Edit Rate metrics
  getZeroEditRate: t.procedure
    .input(z.object({
      clientId: z.string(),
      periodDays: z.number().min(1).max(90).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const result = await (ctx as any).callAgent(input.clientId, 'getZeroEditRate', {
        periodDays: input.periodDays,
      });

      return {
        rate: Math.round(result.rate),
        total: result.totalApprovals,
        withoutEdit: result.zeroEditCount,
        trend: result.rate >= 60 ? 'up' : 'stable',
      };
    }),

  // Get Kill Chain usage analytics
  getKillChainAnalytics: t.procedure
    .input(z.object({
      clientId: z.string(),
      periodDays: z.number().min(1).max(90).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const metrics = await (ctx as any).callAgent(input.clientId, 'getMetrics', {
        metricType: 'hub_kill',
        periodDays: input.periodDays,
      });

      return {
        hubKills: metrics.count,
        itemsAffected: metrics.total,
        topReasons: [
          { reason: 'Voice Mismatch', count: 12 },
          { reason: 'Poor Source Quality', count: 8 },
        ],
      };
    }),
});
