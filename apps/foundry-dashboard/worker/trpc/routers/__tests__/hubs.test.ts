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
      const { ctx, mockDb, mockFetch } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);
      const input = {
        sourceId: '00000000-0000-0000-0000-000000000000',
        clientId: '00000000-0000-0000-0000-000000000000',
        content: 'This is sample content for testing the hub extraction process. It needs to be at least 100 characters long to pass validation, so here is some extra text.',
      };

      // Mock DB run for extraction_progress insert
      mockDb.run.mockResolvedValue({ success: true });
      // Mock CONTENT_ENGINE.fetch response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ instanceId: 'wf-1', status: 'started' }),
      });

      const result = await caller.extract(input);

      expect(mockFetch).toHaveBeenCalled();
      expect(result.workflowInstanceId).toBe('wf-1');
    });

    it('fetches content from DB if not provided', async () => {
      const { ctx, mockDb, mockFetch } = mockCtx;
      const caller = hubsRouter.createCaller(ctx);
      const input = {
        sourceId: '00000000-0000-0000-0000-000000000000',
        clientId: '00000000-0000-0000-0000-000000000000',
      };

      // Mock getting raw content from DB
      mockDb.first.mockResolvedValueOnce({ raw_content: 'This is the raw content from the database that is at least 100 characters long for validation purposes.' });
      // Mock DB run for extraction_progress insert
      mockDb.run.mockResolvedValue({ success: true });
      // Mock CONTENT_ENGINE.fetch response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ instanceId: 'wf-2', status: 'started' }),
      });

      const result = await caller.extract(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT raw_content'));
      expect(mockFetch).toHaveBeenCalled();
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
});
