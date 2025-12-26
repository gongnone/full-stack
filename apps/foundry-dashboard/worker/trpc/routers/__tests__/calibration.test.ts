import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calibrationRouter } from '../calibration';
import { createMockContext } from './utils';
import { TRPCError } from '@trpc/server';

describe('calibrationRouter', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('listSamples', () => {
    it('returns a list of training samples with badges', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000', limit: 10 };

      const mockSamples = [
        { id: 's1', status: 'analyzed', quality_score: 95, title: 'Sample 1' },
        { id: 's2', status: 'pending', quality_score: null, title: 'Sample 2' },
      ];

      mockDb.all.mockResolvedValue({ results: mockSamples });
      mockDb.first.mockResolvedValue({ total: 2 });

      const result = await caller.listSamples(input);

      expect(result.samples).toHaveLength(2);
      expect(result.samples[0].qualityBadge).toBe('excellent');
      expect(result.samples[1].qualityBadge).toBe('pending');
    });
  });

  describe('createTextSample', () => {
    it('creates a sample and triggers calibration', async () => {
      const { ctx, mockDb, mockFetch } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        title: 'New Text',
        content: 'This is a long enough text for a sample.',
      };

      mockDb.run.mockResolvedValue({ success: true });
      mockFetch.mockResolvedValue({ ok: true });

      const result = await caller.createTextSample(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO training_samples'));
      expect(mockFetch).toHaveBeenCalledWith(
        'http://engine/api/calibration/start',
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.status).toBe('pending');
    });
  });

  describe('getSampleStats', () => {
    it('returns aggregate stats and recommendations', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      mockDb.first.mockResolvedValue({
        total_samples: 5,
        total_words: 1200,
        avg_quality: 85,
        analyzed_count: 4,
        pending_count: 1,
      });

      const result = await caller.getSampleStats(input);

      expect(result.totalSamples).toBe(5);
      expect(result.recommendation).toContain('Good start');
    });
  });

  describe('analyzeDNA', () => {
    it('throws error if less than 3 samples exist', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = calibrationRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      mockDb.all.mockResolvedValue({ results: [{ id: 's1' }, { id: 's2' }] }); // Only 2 samples

      await expect(caller.analyzeDNA(input)).rejects.toThrow(TRPCError);
    });
  });
});
