import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';
import type { SpokePlatform, SpokeStatus } from '../../types';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

/**
 * Review queue spoke representation from Durable Object
 * Uses camelCase for consistency with frontend
 */
interface ReviewQueueSpoke {
  id: string;
  hubId: string;
  pillarId: string;
  platform: SpokePlatform;
  content: string;
  status: SpokeStatus;
  qualityScores: {
    g2_hook?: number;
    g4_voice?: boolean;
    g5_platform?: boolean;
    g7_engagement?: number;
  };
  // Epic 12-1: G7e Engagement Prediction
  engagementPrediction?: number | null; // 0-10 scale, 9+ = Golden Nugget
  engagementConfidence?: 'low' | 'medium' | 'high' | null;
  parentSpokeId?: string | null;
  clonedFrom?: string | null;
  createdAt: string;
}

export const reviewRouter = t.router({
  // Get the bulk approval queue
  getQueue: procedure
    .input(z.object({
      clientId: z.string().min(1),
      filter: z.enum(['all', 'top10', 'flagged', 'needs-review', 'just-generated', 'golden-nuggets']).default('all'),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().optional(), // offset-based pagination
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const items = await ctx.callAgent(input.clientId, 'getReviewQueue', {
        filter: input.filter,
        limit: input.limit + 1, // Fetch one extra to determine next cursor
        offset: input.cursor,
      }) as ReviewQueueSpoke[]; // DO returns snake_case, we normalize below

      let nextCursor: number | undefined = undefined;
      if (items.length > input.limit) {
        items.pop(); // Remove the extra item
        nextCursor = (input.cursor || 0) + input.limit;
      }

      // Map snake_case from DO to consistent camelCase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedItems: ReviewQueueSpoke[] = items.map((item: any) => ({
        ...item,
        parentSpokeId: item.parentSpokeId || item.parent_spoke_id,
        clonedFrom: item.clonedFrom || item.cloned_from,
        // Epic 12-1: Map engagement prediction fields
        engagementPrediction: item.engagementPrediction ?? item.engagement_prediction ?? null,
        engagementConfidence: item.engagementConfidence ?? item.engagement_confidence ?? null,
      }));

      return {
        items: mappedItems,
        nextCursor,
        totalCount: items.length, // Approximation for current page
        estimatedReviewTime: `${Math.ceil(items.length * 6 / 60)} minutes`,
      };
    }),

  // Approve multiple spokes at once
  bulkApprove: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeIds: z.array(z.string().uuid()),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return await ctx.callAgent(input.clientId, 'bulkApprove', {
        spokeIds: input.spokeIds,
      });
    }),

  // Reject multiple spokes
  bulkReject: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeIds: z.array(z.string().uuid()),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return await ctx.callAgent(input.clientId, 'bulkReject', {
        spokeIds: input.spokeIds,
        reason: input.reason,
      });
    }),

  // Kill entire Hub from review queue (cascade)
  killHub: procedure
    .input(z.object({
      clientId: z.string().min(1),
      hubId: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return await ctx.callAgent(input.clientId, 'killHub', {
        hubId: input.hubId,
        reason: input.reason,
      });
    }),

  // Single swipe action (optimized for mobile)
  swipeAction: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      action: z.enum(['approve', 'reject', 'skip']),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      if (input.action === 'approve') {
        await ctx.callAgent(input.clientId, 'approveSpoke', { spokeId: input.spokeId });
      } else if (input.action === 'reject') {
        await ctx.callAgent(input.clientId, 'rejectSpoke', { spokeId: input.spokeId });
      }

      return {
        success: true,
      };
    }),

  // ===== Epic 1.5-6: Mobile Review & Native Publish Flow =====

  // Story 1.5-6-1: Ready-for-Review Dashboard
  getDashboardStats: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const stats = await ctx.callAgent(input.clientId, 'getReviewStats', {}) as {
        pendingCount: number;
        approvedToday: number;
        rejectedToday: number;
        avgScore: number;
      };

      // Get hub breakdown
      const hubStats = await ctx.callAgent(input.clientId, 'getHubReviewStats', {}) as Array<{
        hubId: string;
        hubTitle: string;
        pendingCount: number;
        avgScore: number;
      }>;

      return {
        overview: {
          pending: stats.pendingCount,
          approvedToday: stats.approvedToday,
          rejectedToday: stats.rejectedToday,
          avgQualityScore: stats.avgScore,
        },
        byHub: hubStats,
        estimatedReviewTime: `${Math.ceil(stats.pendingCount * 6 / 60)} minutes`,
      };
    }),

  // Story 1.5-6-2: Sort by Critic Score
  getSortedQueue: procedure
    .input(z.object({
      clientId: z.string().min(1),
      sortBy: z.enum(['score-asc', 'score-desc', 'date-asc', 'date-desc', 'platform']).default('score-desc'),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const items = await ctx.callAgent(input.clientId, 'getSortedReviewQueue', {
        sortBy: input.sortBy,
        limit: input.limit + 1,
        offset: input.cursor,
      }) as ReviewQueueSpoke[];

      let nextCursor: number | undefined;
      if (items.length > input.limit) {
        items.pop();
        nextCursor = (input.cursor || 0) + input.limit;
      }

      return { items, nextCursor, sortBy: input.sortBy };
    }),

  // Story 1.5-6-3: Filter by Platform, Hub, Score
  getFilteredQueue: procedure
    .input(z.object({
      clientId: z.string().min(1),
      filters: z.object({
        platforms: z.array(z.enum(['twitter', 'linkedin', 'instagram', 'tiktok', 'newsletter', 'thread', 'carousel'])).optional(),
        hubIds: z.array(z.string().uuid()).optional(),
        minScore: z.number().min(0).max(100).optional(),
        maxScore: z.number().min(0).max(100).optional(),
        status: z.enum(['pending', 'ready', 'approved', 'rejected']).optional(),
      }),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const items = await ctx.callAgent(input.clientId, 'getFilteredReviewQueue', {
        filters: input.filters,
        limit: input.limit,
      }) as ReviewQueueSpoke[];

      return {
        items,
        appliedFilters: input.filters,
        count: items.length,
      };
    }),

  // Story 1.5-6-4: Mobile Swipe Interface (batch fetch for smooth swiping)
  getMobileSwipeBatch: procedure
    .input(z.object({
      clientId: z.string().min(1),
      batchSize: z.number().min(5).max(20).default(10),
      excludeIds: z.array(z.string().uuid()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const items = await ctx.callAgent(input.clientId, 'getMobileSwipeBatch', {
        batchSize: input.batchSize,
        excludeIds: input.excludeIds || [],
      }) as ReviewQueueSpoke[];

      return {
        items,
        hasMore: items.length === input.batchSize,
        batchId: crypto.randomUUID(), // For tracking swipe sessions
      };
    }),

  // Story 1.5-6-5: Estimated Review Time
  getEstimatedReviewTime: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeIds: z.array(z.string().uuid()).optional(), // If not provided, calculate for all pending
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const count = input.spokeIds?.length ||
        (await ctx.callAgent(input.clientId, 'getPendingCount', {}) as { count: number }).count;

      // Average 6 seconds per spoke for quick review, 15 for detailed
      return {
        quickReview: {
          seconds: count * 6,
          formatted: formatDuration(count * 6),
        },
        detailedReview: {
          seconds: count * 15,
          formatted: formatDuration(count * 15),
        },
        spokeCount: count,
      };
    }),

  // Story 1.5-6-6: Ready to Post Button
  markReadyToPost: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      await ctx.callAgent(input.clientId, 'updateSpokeStatus', {
        spokeId: input.spokeId,
        status: 'approved',
        readyToPost: true,
      });

      const now = Date.now();
      await ctx.db.prepare(`
        INSERT INTO post_queue (id, client_id, spoke_id, status, queued_at)
        VALUES (?, ?, ?, 'ready', ?)
      `).bind(crypto.randomUUID(), input.clientId, input.spokeId, now).run();

      return { success: true, queuedAt: now };
    }),

  // Story 1.5-6-7: Copy Caption to Clipboard (returns content for frontend to copy)
  getCaptionForCopy: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      format: z.enum(['plain', 'with-hashtags', 'with-cta']).default('plain'),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const spoke = await ctx.callAgent(input.clientId, 'getSpoke', {
        spokeId: input.spokeId,
      }) as { content: string; platform: string } | null;

      if (!spoke) {
        throw new Error('Spoke not found');
      }

      let caption = spoke.content;

      if (input.format === 'with-hashtags') {
        // Extract or generate relevant hashtags based on platform
        const hashtagCount = spoke.platform === 'instagram' ? 5 : 2;
        // In production, this would use AI to generate relevant hashtags
        caption = `${caption}\n\n${generatePlaceholderHashtags(hashtagCount)}`;
      } else if (input.format === 'with-cta') {
        caption = `${caption}\n\n👉 Link in bio`;
      }

      return {
        caption,
        platform: spoke.platform,
        characterCount: caption.length,
      };
    }),

  // Story 1.5-6-8: Native Share Sheet Trigger (returns data for Web Share API)
  getShareData: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const spoke = await ctx.callAgent(input.clientId, 'getSpoke', {
        spokeId: input.spokeId,
      }) as { content: string; platform: string; imagePrompt?: string } | null;

      if (!spoke) {
        throw new Error('Spoke not found');
      }

      return {
        title: `Post for ${spoke.platform}`,
        text: spoke.content,
        // URL would be the spoke's permalink if we have one
        files: spoke.imagePrompt ? [{ name: 'image-prompt.txt', type: 'text/plain' }] : [],
      };
    }),

  // Story 1.5-6-9: Track Hand-off Timestamp
  recordHandoff: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      handoffType: z.enum(['copied', 'shared', 'scheduled']),
      targetPlatform: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const now = Date.now();
      await ctx.db.prepare(`
        INSERT INTO handoff_log (id, client_id, spoke_id, handoff_type, target_platform, handed_off_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        input.clientId,
        input.spokeId,
        input.handoffType,
        input.targetPlatform || null,
        now
      ).run();

      // Update spoke with handoff timestamp
      await ctx.callAgent(input.clientId, 'updateSpokeHandoff', {
        spokeId: input.spokeId,
        handedOffAt: now,
        handoffType: input.handoffType,
      });

      return { success: true, handedOffAt: now };
    }),

  // Story 1.5-6-10: Share API Fallback
  getShareFallback: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      platform: z.enum(['twitter', 'linkedin', 'facebook', 'email']),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const spoke = await ctx.callAgent(input.clientId, 'getSpoke', {
        spokeId: input.spokeId,
      }) as { content: string } | null;

      if (!spoke) {
        throw new Error('Spoke not found');
      }

      const encodedContent = encodeURIComponent(spoke.content);

      const shareUrls: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedContent}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=&text=${encodedContent}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodedContent}`,
        email: `mailto:?subject=Check%20this%20out&body=${encodedContent}`,
      };

      return {
        platform: input.platform,
        shareUrl: shareUrls[input.platform],
        content: spoke.content,
      };
    }),

  // Story 1.5-6-11: Bulk Review Operations
  bulkAction: procedure
    .input(z.object({
      clientId: z.string().min(1),
      action: z.enum(['approve', 'reject', 'mark-ready', 'archive']),
      spokeIds: z.array(z.string().uuid()).min(1).max(50),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const results = await ctx.callAgent(input.clientId, 'bulkSpokeAction', {
        action: input.action,
        spokeIds: input.spokeIds,
        reason: input.reason,
      }) as { succeeded: string[]; failed: string[] };

      return {
        action: input.action,
        total: input.spokeIds.length,
        succeeded: results.succeeded.length,
        failed: results.failed.length,
        failedIds: results.failed,
      };
    }),

  // Story 1.5-6-12: Post Performance Feedback (Manual)
  recordPerformanceFeedback: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      metrics: z.object({
        likes: z.number().min(0).optional(),
        comments: z.number().min(0).optional(),
        shares: z.number().min(0).optional(),
        impressions: z.number().min(0).optional(),
        clicks: z.number().min(0).optional(),
        saves: z.number().min(0).optional(),
      }),
      performedWell: z.boolean().optional(),
      notes: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const now = Date.now();
      await ctx.db.prepare(`
        INSERT INTO post_performance (id, client_id, spoke_id, metrics, performed_well, notes, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        input.clientId,
        input.spokeId,
        JSON.stringify(input.metrics),
        input.performedWell !== undefined ? (input.performedWell ? 1 : 0) : null,
        input.notes || null,
        now
      ).run();

      return { success: true, recordedAt: now };
    }),

  // Story 1.5-6-13: Device-Adaptive Review UI (returns device-optimized config)
  getDeviceConfig: procedure
    .input(z.object({
      clientId: z.string().min(1),
      deviceType: z.enum(['mobile', 'tablet', 'desktop']),
      screenWidth: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Device-specific UI configuration
      const configs: Record<string, {
        swipeEnabled: boolean;
        batchSize: number;
        previewLines: number;
        showScoreDetails: boolean;
        cardLayout: 'stack' | 'grid' | 'list';
      }> = {
        mobile: {
          swipeEnabled: true,
          batchSize: 10,
          previewLines: 3,
          showScoreDetails: false,
          cardLayout: 'stack',
        },
        tablet: {
          swipeEnabled: true,
          batchSize: 15,
          previewLines: 5,
          showScoreDetails: true,
          cardLayout: 'grid',
        },
        desktop: {
          swipeEnabled: false,
          batchSize: 20,
          previewLines: 8,
          showScoreDetails: true,
          cardLayout: 'list',
        },
      };

      return {
        deviceType: input.deviceType,
        config: configs[input.deviceType],
        adaptiveFeatures: {
          touchOptimized: input.deviceType !== 'desktop',
          keyboardShortcuts: input.deviceType === 'desktop',
          gestureHints: input.deviceType === 'mobile',
        },
      };
    }),
});

// Helper functions
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function generatePlaceholderHashtags(count: number): string {
  const hashtags = ['#content', '#marketing', '#growth', '#strategy', '#business', '#tips', '#success', '#entrepreneur'];
  return hashtags.slice(0, count).join(' ');
}
