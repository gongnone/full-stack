import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsRouter } from '../analytics';
import { type Context } from '../../context';

// Mock the context
const createMockContext = (overrides?: Partial<Context>) => {
  const mockFirst = vi.fn().mockResolvedValue({ role: 'agency_owner' }); // Default success
  const mockBind = vi.fn().mockReturnValue({ first: mockFirst, all: vi.fn(), run: vi.fn() });
  const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });

  return {
    env: {} as any,
    ctx: {} as any,
    db: {
      prepare: mockPrepare,
    } as any,
    clientId: 'test-client',
    userId: 'user-1', // Correct property name is userId, not user.id
    user: { id: 'user-1' },
    callAgent: vi.fn(),
    ...overrides,
  } as unknown as Context;
};

describe('analyticsRouter', () => {
  let mockCtx: Context;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCtx = createMockContext();
  });

  describe('getVolumeMetrics', () => {
    it('should calculate metrics correctly for a single day period', async () => {
      // Setup dates
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();

      // Mock data from Agent
      const mockSpokes = [
        // Current period (last 24h)
        { id: '1', createdAt: oneHourAgo, status: 'approved' },
        { id: '2', createdAt: oneHourAgo, status: 'generating' },
        // Previous period (24-48h ago)
        { id: '3', createdAt: twentyFiveHoursAgo, status: 'approved' },
      ];

      (mockCtx.callAgent as any).mockImplementation((clientId: string, method: string, params: any) => {
        if (method === 'listSpokes') {
           // Return truncated list to simulate batches if needed, or full list
           // For this test, just return all relevant mocks
           return Promise.resolve(mockSpokes);
        }
        if (method === 'countHubs') {
          return Promise.resolve({ count: 5 });
        }
        return Promise.resolve(null);
      });

      const caller = analyticsRouter.createCaller(mockCtx);
      const result = await caller.getVolumeMetrics({
        clientId: 'test-client',
        periodDays: 1
      });

      // Verification
      // 1. Check Date Filtering
      expect(result.spokesGenerated).toBe(2); // Should only count id:1 and id:2
      expect(result.totalSpokes).toBe(2);

      // 2. Check Hub Count
      expect(result.hubsCreated).toBe(5);

      // 3. Check Trend
      // Current: 2, Previous: 1. (2-1)/1 * 100 = 100% increase
      expect(result.trend).toBe(100);
      
      // 4. Check word count estimation
      expect(result.totalWords).toBe(300); // 2 spokes * 150
    });

    it('should handle pagination correctly when fetching spokes', async () => {
       // Mock a pagination scenario: 2 batches
       // Batch 1: 1000 items
       // Batch 2: 500 items
       const batch1 = Array(1000).fill({ id: 'x', createdAt: new Date().toISOString() });
       const batch2 = Array(500).fill({ id: 'y', createdAt: new Date().toISOString() });

       (mockCtx.callAgent as any).mockImplementation((clientId: string, method: string, params: any) => {
        if (method === 'listSpokes') {
           if (params.offset === 0) return Promise.resolve(batch1);
           if (params.offset === 1000) return Promise.resolve(batch2);
           return Promise.resolve([]);
        }
        if (method === 'countHubs') return Promise.resolve({ count: 0 });
        return Promise.resolve(null);
      });

      const caller = analyticsRouter.createCaller(mockCtx);
      const result = await caller.getVolumeMetrics({
        clientId: 'test-client',
        periodDays: 1
      });

      // Should have aggregated all 1500
      expect(result.spokesGenerated).toBe(1500);
      expect(mockCtx.callAgent).toHaveBeenCalledTimes(3); // batch1, batch2, countHubs
    });

    it('should handle negative trends (decrease)', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();

      const mockSpokes = [
        // Current: 1 spoke
        { id: '1', createdAt: oneHourAgo },
        // Previous: 2 spokes
        { id: '2', createdAt: twentyFiveHoursAgo },
        { id: '3', createdAt: twentyFiveHoursAgo },
      ];

      (mockCtx.callAgent as any).mockImplementation((_c: unknown, method: string) => {
        if (method === 'listSpokes') return Promise.resolve(mockSpokes);
        if (method === 'countHubs') return Promise.resolve({ count: 0 });
        return Promise.resolve(null);
      });

      const caller = analyticsRouter.createCaller(mockCtx);
      const result = await caller.getVolumeMetrics({ clientId: 'test-client', periodDays: 1 });

      // Current: 1, Previous: 2. (1-2)/2 = -0.5 -> -50%
      expect(result.trend).toBe(-50);
    });
  });

  describe('getReviewVelocity', () => {
    it('should calculate bulk approve rate and kill chain usage', async () => {
        const mockSpokes = [
            { id: '1', status: 'approved' },
            { id: '2', status: 'approved' },
            { id: '3', status: 'killed' },
            { id: '4', status: 'rejected' },
            { id: '5', status: 'generating' }, // Should be ignored
        ];

        (mockCtx.callAgent as any).mockResolvedValue(mockSpokes);

        const caller = analyticsRouter.createCaller(mockCtx);
        const result = await caller.getReviewVelocity({ clientId: 'test-client' });

        // Reviewed total: 4 (2 approved + 1 killed + 1 rejected)
        expect(result.totalReviewed).toBe(4);
        
        // Bulk Approve: 2/4 = 50%
        expect(result.bulkApproveRate).toBe(50);

        // Kill Chain: 2/4 (killed+rejected) = 50%
        expect(result.killChainUsage).toBe(50);
    });
  });
});
