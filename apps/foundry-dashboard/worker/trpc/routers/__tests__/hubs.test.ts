import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hubsRouter } from '../hubs';
import { createMockContext } from './utils';
import { TRPCError } from '@trpc/server';

describe('hubsRouter', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('createUrlSource', () => {
    it('creates a URL source successfully', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        url: 'https://example.com',
        title: 'Example',
      };

      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.createUrlSource(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO hub_sources'));
      expect(result).toEqual({
        sourceId: expect.any(String),
        status: 'pending',
      });
    });

    it('validates URL format', async () => {
      const { ctx } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        url: 'invalid-url',
      };

      await expect(caller.createUrlSource(input)).rejects.toThrow();
    });
  });

  describe('getRecentSources', () => {
    it('returns a list of sources', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        limit: 5,
      };

      const mockSources = [
        {
          id: 'src-1',
          title: 'Source 1',
          source_type: 'url',
          status: 'pending',
          word_count: 100,
          character_count: 500,
          created_at: 1234567890,
        },
      ];

      mockDb.all.mockResolvedValue({ results: mockSources });

      const result = await caller.getRecentSources(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT id, title'));
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'src-1',
        title: 'Source 1',
        sourceType: 'url',
        status: 'pending',
        wordCount: 100,
        characterCount: 500,
        createdAt: 1234567890,
      });
    });
  });

  describe('extract', () => {
    it('calls CONTENT_ENGINE to start extraction', async () => {
      const { ctx, mockDb, mockCallEngine } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);
      const input = {
        sourceId: '00000000-0000-0000-0000-000000000000',
        clientId: '00000000-0000-0000-0000-000000000000',
        content: 'This is sample content for testing the hub extraction process. It needs to be at least 100 characters long to pass validation, so here is some extra text.',
      };

      // Mock DB run for extraction_progress insert
      mockDb.run.mockResolvedValue({ success: true });
      // Mock callEngine response
      mockCallEngine.mockResolvedValue({ instanceId: 'wf-1', status: 'started' });

      const result = await caller.extract(input);

      expect(mockCallEngine).toHaveBeenCalled();
      expect(result.workflowInstanceId).toBe('wf-1');
    });

    it('fetches content from DB if not provided', async () => {
      const { ctx, mockDb, mockCallEngine } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);
      const input = {
        sourceId: '00000000-0000-0000-0000-000000000000',
        clientId: '00000000-0000-0000-0000-000000000000',
      };

      // Mock getting raw content from DB
      mockDb.first.mockResolvedValueOnce({ raw_content: 'This is the raw content from the database that is at least 100 characters long for validation purposes.' });
      // Mock DB run for extraction_progress insert
      mockDb.run.mockResolvedValue({ success: true });
      // Mock callEngine response
      mockCallEngine.mockResolvedValue({ instanceId: 'wf-2', status: 'started' });

      const result = await caller.extract(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT raw_content'));
      expect(mockCallEngine).toHaveBeenCalled();
      expect(result.workflowInstanceId).toBe('wf-2');
    });

    it('throws error if content is missing', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);
      const input = {
        sourceId: '00000000-0000-0000-0000-000000000000',
        clientId: '00000000-0000-0000-0000-000000000000',
      };

      mockDb.first.mockResolvedValue(null);

      await expect(caller.extract(input)).rejects.toThrow(TRPCError);
    });
  });

  // ===== Story 1.5-4-4: Golden Nuggets =====

  describe('markGoldenNugget', () => {
    it('marks a supporting point as golden nugget', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);

      mockDb.first.mockResolvedValue({
        id: 'pillar-1',
        supporting_points: JSON.stringify(['Point A', 'Point B', 'Point C']),
        golden_nuggets: '[]',
      });
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.markGoldenNugget({
        clientId: '00000000-0000-0000-0000-000000000000',
        pillarId: '550e8400-e29b-41d4-a716-446655440000',
        nuggetIndex: 1,
        isGolden: true,
      });

      expect(result.success).toBe(true);
      expect(result.goldenNuggets).toContain(1);
    });

    it('removes golden nugget marking', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);

      mockDb.first.mockResolvedValue({
        id: 'pillar-1',
        supporting_points: JSON.stringify(['Point A', 'Point B']),
        golden_nuggets: '[0, 1]',
      });
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.markGoldenNugget({
        clientId: '00000000-0000-0000-0000-000000000000',
        pillarId: '550e8400-e29b-41d4-a716-446655440000',
        nuggetIndex: 0,
        isGolden: false,
      });

      expect(result.success).toBe(true);
      expect(result.goldenNuggets).not.toContain(0);
      expect(result.goldenNuggets).toContain(1);
    });

    it('throws on invalid nugget index', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);

      mockDb.first.mockResolvedValue({
        id: 'pillar-1',
        supporting_points: JSON.stringify(['Point A']),
        golden_nuggets: '[]',
      });

      await expect(caller.markGoldenNugget({
        clientId: '00000000-0000-0000-0000-000000000000',
        pillarId: '550e8400-e29b-41d4-a716-446655440000',
        nuggetIndex: 5, // Out of bounds
        isGolden: true,
      })).rejects.toThrow('Invalid nugget index');
    });
  });

  describe('getGoldenNuggets', () => {
    it('returns nuggets with golden status', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);

      mockDb.all.mockResolvedValue({
        results: [
          {
            id: 'pillar-1',
            title: 'Thought Leadership',
            supporting_points: JSON.stringify(['Key insight 1', 'Key insight 2', 'Key insight 3']),
            golden_nuggets: '[0, 2]',
          },
        ],
      });

      const result = await caller.getGoldenNuggets({
        clientId: '00000000-0000-0000-0000-000000000000',
        sourceId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result).toHaveLength(1);
      expect(result[0].nuggets).toHaveLength(3);
      expect(result[0].nuggets[0].isGolden).toBe(true);
      expect(result[0].nuggets[1].isGolden).toBe(false);
      expect(result[0].nuggets[2].isGolden).toBe(true);
    });
  });

  describe('updateNuggetWeights', () => {
    it('updates weights for nuggets', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);

      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.updateNuggetWeights({
        clientId: '00000000-0000-0000-0000-000000000000',
        pillarId: '550e8400-e29b-41d4-a716-446655440000',
        weights: { '0': 10, '1': 5, '2': 8 },
      });

      expect(result.success).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE extracted_pillars SET nugget_weights'));
    });
  });
});
