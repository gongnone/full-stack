/**
 * Calendar router - Story 13-1: Content Calendar View
 *
 * Provides endpoints for viewing approved content by date range
 * for the content calendar view.
 */
import { initTRPC } from '@trpc/server';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';
import { z } from 'zod';

const t = initTRPC.context<Context>().create();
const router = t.router;

// Spoke from Durable Object
interface DOSpoke {
  id: string;
  hubId: string;
  pillarId: string;
  platform: string;
  content: string;
  status: string;
  qualityScores?: {
    g2?: number;
    g4?: number;
    g5?: number;
    g7?: number;
  };
  approvedAt?: string;
  scheduledFor?: string;
  createdAt: string;
}

export const calendarRouter = router({
  /**
   * Get approved spokes for a date range
   * Used by the calendar view to display content by date
   */
  getMonthSpokes: t.procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        startDate: z.number(), // Unix timestamp ms
        endDate: z.number(), // Unix timestamp ms
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get all approved spokes from the Durable Object
      const spokes = (await ctx.callAgent(input.clientId, 'listSpokes', {
        status: 'approved',
        limit: 500, // Get up to 500 for calendar view
      })) as DOSpoke[];

      // Filter by date range
      const startDate = input.startDate;
      const endDate = input.endDate;

      const filteredSpokes = spokes.filter((spoke) => {
        // Use approvedAt or scheduledFor timestamp
        const timestamp = spoke.scheduledFor
          ? new Date(spoke.scheduledFor).getTime()
          : spoke.approvedAt
            ? new Date(spoke.approvedAt).getTime()
            : null;

        if (!timestamp) return false;
        return timestamp >= startDate && timestamp <= endDate;
      });

      return {
        items: filteredSpokes.map((spoke) => ({
          id: spoke.id,
          hubId: spoke.hubId,
          pillarId: spoke.pillarId,
          platform: spoke.platform,
          content: spoke.content,
          status: spoke.status,
          g7Score: spoke.qualityScores?.g7,
          approvedAt: spoke.approvedAt ? new Date(spoke.approvedAt).getTime() : undefined,
          scheduledFor: spoke.scheduledFor ? new Date(spoke.scheduledFor).getTime() : undefined,
        })),
        total: filteredSpokes.length,
      };
    }),

  /**
   * Get content statistics for date range
   * Used for calendar summary widgets
   */
  getDateStats: t.procedure
    .input(
      z.object({
        clientId: z.string().min(1),
        startDate: z.number(),
        endDate: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const spokes = (await ctx.callAgent(input.clientId, 'listSpokes', {
        status: 'approved',
        limit: 500,
      })) as DOSpoke[];

      const startDate = input.startDate;
      const endDate = input.endDate;

      // Count by platform
      const platformCounts: Record<string, number> = {};
      let goldenNuggets = 0;
      let totalInRange = 0;

      spokes.forEach((spoke) => {
        const timestamp = spoke.scheduledFor
          ? new Date(spoke.scheduledFor).getTime()
          : spoke.approvedAt
            ? new Date(spoke.approvedAt).getTime()
            : null;

        if (!timestamp || timestamp < startDate || timestamp > endDate) return;

        totalInRange++;
        platformCounts[spoke.platform] = (platformCounts[spoke.platform] || 0) + 1;

        if (spoke.qualityScores?.g7 && spoke.qualityScores.g7 >= 9) {
          goldenNuggets++;
        }
      });

      return {
        total: totalInRange,
        goldenNuggets,
        platformCounts,
      };
    }),
});
