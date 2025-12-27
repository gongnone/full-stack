import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spokesRouter } from '../spokes';
import { createMockContext } from './utils';
import { TRPCError } from '@trpc/server';

const CLIENT_ID = '00000000-0000-0000-0000-000000000000';
const HUB_ID = '00000000-0000-0000-0000-000000000001';
const SPOKE_ID_1 = '00000000-0000-0000-0000-000000000002';
const PILLAR_ID_1 = '00000000-0000-0000-0000-000000000003';

describe('spokesRouter', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('calls agent to list spokes', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        hubId: '00000000-0000-0000-0000-000000000001',
        limit: 10,
      };

      mockCallAgent.mockResolvedValue([]);

      await caller.list(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'listSpokes',
        expect.objectContaining({
          hubId: input.hubId,
          limit: input.limit,
        })
      );
    });

    /**
     * P0-08: Case Mapping Transform
     * Regression test for BUG-001: Case mapping mismatch
     *
     * DO returns camelCase (pillarId), frontend expects snake_case (pillar_id).
     * Without transformation, SpokeTreeView filter `s.pillar_id === pillar.id` fails
     * because `s.pillar_id` is undefined.
     *
     * @tags @P0 @regression @data-integrity
     */
    it('transforms camelCase DO response to snake_case for frontend', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        hubId: HUB_ID,
        limit: 10,
      };

      // Mock DO response with camelCase fields (as returned by Durable Object)
      const doResponse = [
        {
          id: SPOKE_ID_1,
          hubId: HUB_ID,
          pillarId: PILLAR_ID_1, // camelCase from DO
          platform: 'twitter',
          content: 'Test content for Twitter',
          status: 'reviewing',
          qualityScores: { g2_hook: 85, g4_voice: true, g5_platform: true },
          visualArchetype: 'Bold Contrast',
          imagePrompt: 'A bold image prompt',
          thumbnailConcept: 'Thumbnail concept',
          regenerationCount: 1,
          mutatedAt: null,
          createdAt: '2025-12-27T00:00:00.000Z',
        },
      ];

      mockCallAgent.mockResolvedValue(doResponse);

      const result = await caller.list(input);

      // Verify response uses snake_case
      expect(result.items).toHaveLength(1);
      const spoke = result.items[0];

      // Critical: pillar_id must be defined for SpokeTreeView grouping
      expect(spoke.pillar_id).toBe(PILLAR_ID_1);
      expect(spoke.hub_id).toBe(HUB_ID);
      expect(spoke.quality_scores).toEqual({ g2_hook: 85, g4_voice: true, g5_platform: true });
      expect(spoke.visual_archetype).toBe('Bold Contrast');
      expect(spoke.image_prompt).toBe('A bold image prompt');
      expect(spoke.thumbnail_concept).toBe('Thumbnail concept');
      expect(spoke.regeneration_count).toBe(1);
      expect(spoke.mutated_at).toBeNull();
      expect(spoke.created_at).toBe('2025-12-27T00:00:00.000Z');
    });

    it('handles empty spokes array correctly', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        hubId: HUB_ID,
        limit: 10,
      };

      mockCallAgent.mockResolvedValue([]);

      const result = await caller.list(input);

      expect(result.items).toEqual([]);
    });

    it('transforms multiple spokes correctly', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        hubId: HUB_ID,
        limit: 20,
      };

      // Mock multiple spokes with different platforms
      const doResponse = [
        {
          id: 'spoke-1',
          hubId: HUB_ID,
          pillarId: 'pillar-1',
          platform: 'twitter',
          content: 'Twitter content',
          status: 'reviewing',
          qualityScores: { g2_hook: 90 },
          visualArchetype: null,
          imagePrompt: null,
          thumbnailConcept: null,
          regenerationCount: 0,
          mutatedAt: null,
          createdAt: '2025-12-27T00:00:00.000Z',
        },
        {
          id: 'spoke-2',
          hubId: HUB_ID,
          pillarId: 'pillar-1', // Same pillar
          platform: 'linkedin',
          content: 'LinkedIn content',
          status: 'reviewing',
          qualityScores: { g2_hook: 85 },
          visualArchetype: 'Minimalist',
          imagePrompt: 'LinkedIn image',
          thumbnailConcept: 'Professional concept',
          regenerationCount: 0,
          mutatedAt: null,
          createdAt: '2025-12-27T00:00:00.000Z',
        },
        {
          id: 'spoke-3',
          hubId: HUB_ID,
          pillarId: 'pillar-2', // Different pillar
          platform: 'twitter',
          content: 'Another Twitter post',
          status: 'approved',
          qualityScores: { g2_hook: 95 },
          visualArchetype: null,
          imagePrompt: null,
          thumbnailConcept: null,
          regenerationCount: 2,
          mutatedAt: '2025-12-27T01:00:00.000Z',
          createdAt: '2025-12-27T00:00:00.000Z',
        },
      ];

      mockCallAgent.mockResolvedValue(doResponse);

      const result = await caller.list(input);

      expect(result.items).toHaveLength(3);

      // Verify all spokes have pillar_id defined
      result.items.forEach(spoke => {
        expect(spoke.pillar_id).toBeDefined();
        expect(spoke.hub_id).toBe(HUB_ID);
      });

      // Verify grouping by pillar_id would work
      const pillar1Spokes = result.items.filter(s => s.pillar_id === 'pillar-1');
      const pillar2Spokes = result.items.filter(s => s.pillar_id === 'pillar-2');

      expect(pillar1Spokes).toHaveLength(2);
      expect(pillar2Spokes).toHaveLength(1);
    });
  });

  describe('approve', () => {
    it('approves a spoke', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        spokeId: '00000000-0000-0000-0000-000000000002',
      };

      mockCallAgent.mockResolvedValue({ success: true });

      const result = await caller.approve(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'approveSpoke',
        { spokeId: input.spokeId }
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('reject', () => {
    it('rejects a spoke with a reason', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        spokeId: '00000000-0000-0000-0000-000000000002',
        reason: 'Off-brand tone',
      };

      mockCallAgent.mockResolvedValue({ success: true });

      const result = await caller.reject(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'rejectSpoke',
        { spokeId: input.spokeId, reason: input.reason }
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('edit', () => {
    it('edits spoke content and calculates edit distance', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        spokeId: SPOKE_ID_1,
        content: 'Modified content here',
      };

      // Mock getSpoke to return original content
      mockCallAgent.mockResolvedValueOnce({ content: 'Original content' });
      // Mock updateSpoke
      mockCallAgent.mockResolvedValueOnce({ success: true });

      const result = await caller.edit(input);

      expect(result.success).toBe(true);
      expect(result.editDistance).toBeGreaterThan(0);
      expect(result.editDistance).toBeLessThan(1);
      expect(mockCallAgent).toHaveBeenCalledWith(CLIENT_ID, 'getSpoke', { spokeId: SPOKE_ID_1 });
      expect(mockCallAgent).toHaveBeenCalledWith(CLIENT_ID, 'updateSpoke', {
        spokeId: SPOKE_ID_1,
        updates: { content: 'Modified content here' },
      });
    });

    it('throws NOT_FOUND when spoke does not exist', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        spokeId: SPOKE_ID_1,
        content: 'New content',
      };

      mockCallAgent.mockResolvedValueOnce(null);

      await expect(caller.edit(input)).rejects.toThrow('Spoke not found');
    });
  });

  describe('clone', () => {
    it('clones a spoke for variations', async () => {
      const { ctx } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        spokeId: '00000000-0000-0000-0000-000000000002',
        count: 3,
      };

      const result = await caller.clone(input);

      expect(result.status).toBe('processing');
      expect(Array.isArray(result.newSpokeIds)).toBe(true);
    });
  });

  describe('generate', () => {
    it('starts generation workflow via CONTENT_ENGINE', async () => {
      const { ctx, mockFetch, mockDb } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        hubId: HUB_ID,
        platforms: ['twitter' as const, 'linkedin' as const],
      };

      // Mock D1 hub query (first call)
      mockDb.first.mockResolvedValueOnce({
        id: HUB_ID,
        title: 'Test Hub',
        source_content: 'Sample source content for testing',
      });

      // Mock D1 pillars query (second call)
      mockDb.all.mockResolvedValueOnce({
        results: [
          {
            id: PILLAR_ID_1,
            title: 'Pillar 1',
            core_claim: 'Core claim for pillar 1',
            supporting_points: JSON.stringify(['Point 1', 'Point 2']),
          },
          {
            id: '00000000-0000-0000-0000-000000000004',
            title: 'Pillar 2',
            core_claim: 'Core claim for pillar 2',
            supporting_points: JSON.stringify(['Point A', 'Point B']),
          },
        ],
      });

      // Mock CONTENT_ENGINE fetch response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'started',
          hubId: HUB_ID,
          pillarsCount: 2,
          platformsCount: 2,
          spokesQueued: 4,
          instances: [
            { instanceId: 'wf-1', spokeId: 'spoke-1', platform: 'twitter', pillarId: PILLAR_ID_1 },
            { instanceId: 'wf-2', spokeId: 'spoke-2', platform: 'linkedin', pillarId: PILLAR_ID_1 },
          ],
        }),
      });

      const result = await caller.generate(input);

      expect(result.status).toBe('started');
      expect(result.pillarsCount).toBe(2);
      expect(result.platformsCount).toBe(2);
      expect(result.spokesQueued).toBe(4);
    });

    it('throws NOT_FOUND when hub does not exist', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        hubId: HUB_ID,
      };

      // Mock D1 hub query returning null
      mockDb.first.mockResolvedValueOnce(null);

      await expect(caller.generate(input)).rejects.toThrow('Hub not found');
    });

    it('throws BAD_REQUEST when hub has no pillars', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        hubId: HUB_ID,
      };

      // Mock D1 hub query
      mockDb.first.mockResolvedValueOnce({
        id: HUB_ID,
        title: 'Empty Hub',
        source_content: 'No pillars',
      });

      // Mock D1 pillars query returning empty
      mockDb.all.mockResolvedValueOnce({ results: [] });

      await expect(caller.generate(input)).rejects.toThrow('Hub has no pillars');
    });

    it('throws error if generation fails to start', async () => {
      const { ctx, mockDb, mockFetch } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        hubId: HUB_ID,
      };

      // Mock D1 queries
      mockDb.first.mockResolvedValueOnce({
        id: HUB_ID,
        title: 'Test Hub',
        source_content: 'Sample content',
      });
      mockDb.all.mockResolvedValueOnce({
        results: [{ id: PILLAR_ID_1, title: 'Pillar', core_claim: null, supporting_points: null }],
      });

      // Mock engine failure
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(caller.generate(input)).rejects.toThrow(TRPCError);
    });
  });
});
