import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsRouter } from '../analytics';
import { createMockContext } from './utils';

describe('analyticsRouter', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('getZeroEditRate', () => {
    it('fetches zero edit rate', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = analyticsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        periodDays: 30,
      };

      mockCallAgent.mockResolvedValue(0.75);

      const result = await caller.getZeroEditRate(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'getZeroEditRate',
        { periodDays: 30 }
      );
      expect(result).toBe(0.75);
    });
  });

  describe('getCriticPassRate', () => {
    it('calculates pass rates from metrics', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = analyticsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
      };

      mockCallAgent.mockResolvedValue({ avg: 0.88 });

      const result = await caller.getCriticPassRate(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'getMetrics',
        expect.objectContaining({ metricType: 'spoke_approval' })
      );
      expect(result.overall).toBe(88);
      expect(result.g2).toBe(85); // Hardcoded in router currently
    });
  });

  describe('getVolumeMetrics', () => {
    it('fetches volume metrics from DB', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = analyticsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        periodDays: 30,
      };

      mockDb.first.mockResolvedValue({
        hubs_created: 10,
        pillars_extracted: 50,
        spokes_generated: 200,
      });

      const result = await caller.getVolumeMetrics(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(result).toEqual({
        hubsCreated: 10,
        spokesGenerated: 200,
        spokesApproved: 0,
        spokesRejected: 0,
        spokesKilled: 0,
      });
    });
  });

  describe('getZeroEditTrend', () => {
    it('returns time series data', async () => {
      const { ctx } = mockCtx;
      const caller = analyticsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        periodDays: 7,
      };

      const result = await caller.getZeroEditTrend(input);

      expect(result.data).toHaveLength(7);
      expect(result.data[0]).toHaveProperty('rate');
      expect(result.data[0]).toHaveProperty('date');
    });
  });

  describe('getCriticPassTrend', () => {
    it('returns critic pass trend data', async () => {
      const { ctx } = mockCtx;
      const caller = analyticsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        periodDays: 5,
      };

      const result = await caller.getCriticPassTrend(input);

      expect(result.data).toHaveLength(5);
      expect(result.data[0]).toHaveProperty('g2');
      expect(result.data[0]).toHaveProperty('g4');
      expect(result.data[0]).toHaveProperty('g5');
      expect(result.data[0]).toHaveProperty('g7');
    });
  });

  describe('getKillChainTrend', () => {
    it('returns kill chain trend and reasons', async () => {
      const { ctx } = mockCtx;
      const caller = analyticsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        periodDays: 5,
      };

      const result = await caller.getKillChainTrend(input);

      expect(result.data).toHaveLength(5);
      expect(result.topReasons).toHaveLength(5);
      expect(result.data[0]).toHaveProperty('totalKills');
    });
  });

  describe('getHealingMetrics', () => {
    it('returns healing metrics', async () => {
      const { ctx } = mockCtx;
      const caller = analyticsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        periodDays: 7,
      };

      const result = await caller.getHealingMetrics(input);

      expect(result.data).toHaveLength(7);
      expect(result.topFailureGates).toBeDefined();
    });
  });
});
