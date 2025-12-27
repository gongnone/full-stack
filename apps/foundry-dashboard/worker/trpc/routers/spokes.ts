import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

const platformEnum = z.enum([
  'twitter',
  'linkedin',
  'tiktok',
  'instagram',
  'carousel',
  'thread',
  'newsletter',
  'youtube_thumbnail',
]);

const spokeStatusEnum = z.enum([
  'pending',
  'approved',
  'rejected',
  'killed',
]);

// Calculate Levenshtein edit distance ratio (0 = identical, 1 = completely different)
function calculateEditDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return 1;
  if (b.length === 0) return 1;

  const matrix: number[][] = Array.from({ length: b.length + 1 }, () =>
    Array(a.length + 1).fill(0)
  );

  for (let i = 0; i <= b.length; i++) {
    matrix[i]![0] = i;
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j]! + 1
        );
      }
    }
  }

  const distance = matrix[b.length]![a.length]!;
  const maxLen = Math.max(a.length, b.length);
  return distance / maxLen;
}

export const spokesRouter = t.router({
  // List spokes with filtering
  list: procedure
    .input(z.object({
      clientId: z.string().min(1),
      hubId: z.string().uuid().optional(),
      pillarId: z.string().uuid().optional(),
      platform: platformEnum.optional(),
      status: spokeStatusEnum.optional(),
      g7Min: z.number().min(0).max(100).optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Proxy to Durable Object
      const spokes = await ctx.callAgent(input.clientId, 'listSpokes', {
        hubId: input.hubId,
        status: input.status,
        limit: input.limit,
      }) as any[];
      // Transform camelCase (DO) to snake_case (frontend types)
      const items = spokes.map((s) => ({
        id: s.id,
        hub_id: s.hubId,
        pillar_id: s.pillarId,
        platform: s.platform,
        content: s.content,
        status: s.status,
        quality_scores: s.qualityScores,
        visual_archetype: s.visualArchetype,
        image_prompt: s.imagePrompt,
        thumbnail_concept: s.thumbnailConcept,
        regeneration_count: s.regenerationCount,
        mutated_at: s.mutatedAt,
        created_at: s.createdAt,
      }));
      return { items };
    }),

  // Get a single spoke with quality scores and feedback
  get: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.callAgent(input.clientId, 'getSpoke', {
        spokeId: input.spokeId,
      });
    }),

  // Approve a single spoke
  approve: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.callAgent(input.clientId, 'approveSpoke', {
        spokeId: input.spokeId,
      });
    }),

  // Reject a spoke
  reject: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.callAgent(input.clientId, 'rejectSpoke', {
        spokeId: input.spokeId,
        reason: input.reason,
      });
    }),

  // Trigger generation for a hub (Story 4.1)
  // Orchestrates spoke generation for all pillars × platforms
  generate: procedure
    .input(z.object({
      clientId: z.string().min(1),
      hubId: z.string().uuid(),
      platforms: z.array(platformEnum).default(['twitter', 'linkedin']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Fetch hub and pillars from D1 (source of truth)
      const hub = await ctx.db.prepare(`
        SELECT h.id, h.title, hs.raw_content as source_content
        FROM hubs h
        JOIN hub_sources hs ON h.source_id = hs.id
        WHERE h.id = ? AND h.client_id = ?
      `).bind(input.hubId, input.clientId).first<{
        id: string;
        title: string;
        source_content: string | null;
      }>();

      if (!hub) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Hub not found',
        });
      }

      // Fetch pillars from D1
      const pillarsResult = await ctx.db.prepare(`
        SELECT id, title, core_claim, supporting_points
        FROM extracted_pillars
        WHERE hub_id = ? AND client_id = ?
        ORDER BY created_at ASC
      `).bind(input.hubId, input.clientId).all<{
        id: string;
        title: string;
        core_claim: string | null;
        supporting_points: string | null;
      }>();

      const pillars = pillarsResult.results.map(p => ({
        pillarId: p.id,
        title: p.title,
        // Use supporting_points as hooks (they serve same purpose)
        hooks: p.supporting_points ? JSON.parse(p.supporting_points) : [],
        summary: p.core_claim || '',
      }));

      if (pillars.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Hub has no pillars. Run extraction first.',
        });
      }

      // Pass hub and pillar data to engine (instead of having engine query DO)
      const response = await ctx.env.CONTENT_ENGINE.fetch(
        new Request('http://internal/api/spokes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: input.clientId,
            hubId: input.hubId,
            platforms: input.platforms,
            // Include hub/pillar data so engine doesn't need to query DO
            hubData: {
              sourceContent: hub.source_content || '',
              pillars,
            },
          }),
        })
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new TRPCError({
          code: response.status === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          message: (error as any).error || 'Failed to start generation workflow',
        });
      }

      return await response.json() as {
        status: string;
        hubId: string;
        pillarsCount: number;
        platformsCount: number;
        spokesQueued: number;
        instances: Array<{
          instanceId: string;
          spokeId: string;
          platform: string;
          pillarId: string;
        }>;
      };
    }),

  // Get workflow status for a spoke generation instance
  getWorkflowStatus: procedure
    .input(z.object({
      instanceId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const response = await ctx.env.CONTENT_ENGINE.fetch(
        new Request(`http://internal/api/workflows/${input.instanceId}?type=spoke`, {
          method: 'GET',
        })
      );

      if (!response.ok) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      return await response.json() as {
        workflowType: string;
        status: 'queued' | 'running' | 'complete' | 'errored';
        output?: unknown;
        error?: string;
      };
    }),

  // Edit spoke content (marks as mutated for Kill Chain survival)
  edit: procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      content: z.string().min(1).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get original spoke to calculate edit distance
      const original = await ctx.callAgent(input.clientId, 'getSpoke', {
        spokeId: input.spokeId,
      }) as { content: string } | null;

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Spoke not found',
        });
      }

      // Update spoke - DO automatically sets mutated_at when content changes
      await ctx.callAgent(input.clientId, 'updateSpoke', {
        spokeId: input.spokeId,
        updates: {
          content: input.content,
        },
      });

      // Calculate Levenshtein edit distance ratio
      const editDistance = calculateEditDistance(original.content, input.content);

      return {
        success: true,
        editDistance,
      };
    }),

  // Clone a high-performing spoke to generate variations
  clone: procedure
    .input(z.object({
      spokeId: z.string().uuid(),
      count: z.number().min(1).max(10).default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Trigger variation generation via CONTENT_ENGINE

      return {
        newSpokeIds: [] as string[],
        status: 'processing' as const,
      };
    }),
});
