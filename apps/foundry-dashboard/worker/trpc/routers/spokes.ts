import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';
import type { Spoke, SpokePlatform, SpokeStatus, QualityScores } from '../../types';
import { z } from 'zod'; // Import zod to make it available for schema definitions

const t = initTRPC.context<Context>().create();
const router = t.router;
const procedure = t.procedure;

// Interface for Durable Object spoke representation
interface DOSpoke {
  id: string;
  hubId: string;
  pillarId: string;
  platform: SpokePlatform;
  content: string;
  status: string;
  qualityScores: QualityScores;
  visualArchetype?: string;
  imagePrompt?: string;
  thumbnailConcept?: string;
  regenerationCount: number;
  mutatedAt: string | null;
  parentSpokeId: string | null;
  clonedFrom?: string | null; // Added for Story R-4
  createdAt: string;
}

const platformEnum = z.enum([
  'twitter',
  'linkedin',
  'tiktok',
  'instagram',
  'newsletter',
  'thread',
  'carousel',
  'youtube_thumbnail',
]);

const spokeStatusEnum = z.enum([
  'pending',
  'generating',
  'ready',
  'approved',
  'rejected',
  'killed',
  'failed',
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

export const spokesRouter = router({
  // List spokes with filtering
  list: t.procedure
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
      await assertClientAccess(ctx, input.clientId);

      // Proxy to Durable Object
      const spokes = await ctx.callAgent(input.clientId, 'listSpokes', {
        hubId: input.hubId,
        status: input.status,
        limit: input.limit,
      }) as DOSpoke[];

      // Transform camelCase (DO) to snake_case (frontend types)
      const items: Partial<Spoke>[] = spokes.map((s) => ({
        id: s.id,
        hub_id: s.hubId,
        pillar_id: s.pillarId,
        platform: s.platform,
        content: s.content,
        status: s.status as SpokeStatus,
        quality_scores: s.qualityScores,
        visual_archetype: s.visualArchetype,
        image_prompt: s.imagePrompt,
        thumbnail_concept: s.thumbnailConcept,
        regeneration_count: s.regenerationCount,
        mutated_at: s.mutatedAt ? new Date(s.mutatedAt).getTime() / 1000 : null,
        parent_spoke_id: s.parentSpokeId,
        cloned_from: s.clonedFrom, // Map clonedFrom
        created_at: new Date(s.createdAt).getTime() / 1000,
      }));
      return { items };
    }),

  // Get a single spoke with quality scores and feedback
  get: t.procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return await ctx.callAgent(input.clientId, 'getSpoke', {
        spokeId: input.spokeId,
      });
    }),

  // Approve a single spoke
  approve: t.procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return await ctx.callAgent(input.clientId, 'approveSpoke', {
        spokeId: input.spokeId,
      });
    }),

  // Reject a spoke
  reject: t.procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return await ctx.callAgent(input.clientId, 'rejectSpoke', {
        spokeId: input.spokeId,
        reason: input.reason,
      });
    }),

  // Trigger generation for a hub (Story 4.1)
  // Orchestrates spoke generation for all pillars × platforms
  generate: t.procedure
    .input(z.object({
      clientId: z.string().min(1),
      hubId: z.string().uuid(),
      platforms: z.array(platformEnum).default(['twitter', 'linkedin']),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
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

      const pillars = pillarsResult.results.map(p => {
        let hooks: string[] = [];
        if (p.supporting_points) {
          try {
            hooks = JSON.parse(p.supporting_points);
          } catch (e) {
            console.error('Failed to parse supporting_points JSON:', e);
            hooks = [];
          }
        }
        return {
          pillarId: p.id,
          title: p.title,
          hooks,
          summary: p.core_claim || '',
        };
      });

      if (pillars.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Hub has no pillars. Run extraction first.',
        });
      }

      // Pass hub and pillar data to engine (instead of having engine query DO)
      try {
        return await ctx.callEngine<{
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
        }>('http://internal/api/spokes/generate', {
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
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start generation workflow';
        // Map common errors to TRPC codes if possible, otherwise INTERNAL_SERVER_ERROR
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
        });
      }
    }),

  // Get workflow status for a spoke generation instance
  getWorkflowStatus: t.procedure
    .input(z.object({
      clientId: z.string().min(1),
      instanceId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      
      try {
        return await ctx.callEngine<{
          workflowType: string;
          status: 'queued' | 'running' | 'complete' | 'errored';
          output?: unknown;
          error?: string;
        }>(`http://internal/api/workflows/${input.instanceId}?type=spoke`, {
          method: 'GET',
        });
      } catch (error) {
        // If 404, callEngine returns the response which allows us to catch it? 
        // No, callEngine throws on non-ok response. 
        // We need to verify if we can distinguish 404 from other errors in callEngine
        // Ideally callEngine should expose status or we rely on message
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }
    }),

  // Edit spoke content (marks as mutated for Kill Chain survival)
  edit: t.procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      content: z.string().min(1).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
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

  // Clone a spoke with different modes (Story R-4)
  // Supports: exact (duplicate), variation (regenerate), platform (adapt)
  clone: t.procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
      mode: z.enum(['exact', 'variation', 'platform']).default('exact'),
      // count is only relevant for 'variation' mode
      count: z.number().min(1).max(5).default(1).optional(),
      // targetPlatform is only relevant for 'platform' mode
      targetPlatform: platformEnum.optional(),
    })
    .superRefine((data, ctx) => {
      // Custom validation: targetPlatform is required if mode is 'platform'
      if (data.mode === 'platform' && !data.targetPlatform) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '`targetPlatform` must be defined for `platform` mode',
          path: ['targetPlatform'], // Associate error with targetPlatform field
        });
      }
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      // Get original spoke for all modes
      const original = await ctx.callAgent(input.clientId, 'getSpoke', {
        spokeId: input.spokeId,
      }) as DOSpoke | null;

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Spoke not found',
        });
      }

      // AC3: Exact Copy - duplicate spoke with same content and metadata
      if (input.mode === 'exact') {
        const newSpoke = await ctx.callAgent(input.clientId, 'duplicateSpoke', {
          spokeId: input.spokeId,
          clonedFrom: input.spokeId, // Pass original spoke ID as clonedFrom
        }) as { id: string };

        return {
          newSpokeIds: [newSpoke.id],
          status: 'complete' as const,
          mode: 'exact' as const,
          clonedFrom: input.spokeId, // Return the clonedFrom field
        };
      }

      // AC5: Platform mode - duplicate spoke with different platform
      if (input.mode === 'platform') {
        // Zod validation already handled this via superRefine, but we check again for safety
        if (!input.targetPlatform) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Target platform required for platform clone mode',
          });
        }

        const newSpoke = await ctx.callAgent(input.clientId, 'duplicateSpoke', {
          spokeId: input.spokeId,
          clonedFrom: input.spokeId, // Pass original spoke ID as clonedFrom
          overrides: {
            platform: input.targetPlatform,
          },
        }) as { id: string };

        return {
          newSpokeIds: [newSpoke.id],
          status: 'complete' as const,
          mode: 'platform' as const,
          clonedFrom: input.spokeId, // Return the clonedFrom field
          targetPlatform: input.targetPlatform,
        };
      }

      // AC4: Variation mode - regenerate with same pillar but new seed
      // Call CONTENT_ENGINE variation generation endpoint
      try {
        const result = await ctx.callEngine<{
          status: string;
          parentSpokeId: string;
          variationsQueued: number;
          instances: Array<{
            instanceId: string;
            spokeId: string;
            platform: string;
          }>;
        }>('http://internal/api/spokes/variations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: input.clientId,
            parentSpokeId: input.spokeId, // Use parentSpokeId here for variation tracking
            count: input.count,
          }),
        });

        return {
          newSpokeIds: result.instances.map(i => i.spokeId),
          status: 'processing' as const,
          mode: 'variation' as const,
          variationsQueued: result.variationsQueued,
          instances: result.instances,
          clonedFrom: input.spokeId, // Track original spoke ID for variations
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate variations';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
        });
      }
    }),

  // Get variations for a spoke
  getVariations: t.procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const variations = await ctx.callAgent(input.clientId, 'listVariations', {
        parentSpokeId: input.spokeId,
      }) as DOSpoke[];

      return {
        items: variations.map((s) => ({
          id: s.id,
          hub_id: s.hubId,
          pillar_id: s.pillarId,
          platform: s.platform,
          content: s.content,
          status: s.status as SpokeStatus,
          quality_scores: s.qualityScores,
          parent_spoke_id: s.parentSpokeId,
          cloned_from: s.clonedFrom, // Include cloned_from
          created_at: new Date(s.createdAt).getTime() / 1000,
        })),
        count: variations.length,
      };
    }),

  // Count variations for a spoke
  countVariations: t.procedure
    .input(z.object({
      clientId: z.string().min(1),
      spokeId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return await ctx.callAgent(input.clientId, 'countVariations', {
        parentSpokeId: input.spokeId,
      }) as { count: number };
    }),
});