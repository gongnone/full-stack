import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewRouter } from '../review';
import { createMockContext } from './utils';

// Valid UUIDs for testing
const CLIENT_ID = '00000000-0000-0000-0000-000000000001';
const SPOKE_ID_1 = '00000000-0000-0000-0000-000000000002';
const SPOKE_ID_2 = '00000000-0000-0000-0000-000000000003';
const HUB_ID = '00000000-0000-0000-0000-000000000004';

describe('reviewRouter', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('getQueue', () => {
    it('returns queue items and stats', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = reviewRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        filter: 'all' as const,
      };

      const mockItems = Array(10).fill({ id: SPOKE_ID_1 });
      mockCallAgent.mockResolvedValue(mockItems);

      const result = await caller.getQueue(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'getReviewQueue',
        expect.objectContaining({ filter: 'all' })
      );
      expect(result.items).toHaveLength(10);
      expect(result.totalCount).toBe(10);
      expect(result.estimatedReviewTime).toContain('1 minutes'); // ceil(10*6/60) = 1
    });
  });

  describe('bulkApprove', () => {
    it('approves multiple spokes', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = reviewRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        spokeIds: [SPOKE_ID_1, SPOKE_ID_2],
      };

      mockCallAgent.mockResolvedValue({ success: true, count: 2 });

      await caller.bulkApprove(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'bulkApprove',
        { spokeIds: input.spokeIds }
      );
    });
  });

  describe('bulkReject', () => {
    it('rejects multiple spokes', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = reviewRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        spokeIds: [SPOKE_ID_1, SPOKE_ID_2],
        reason: 'Poor alignment',
      };

      mockCallAgent.mockResolvedValue({ success: true, count: 2 });

      await caller.bulkReject(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'bulkReject',
        { spokeIds: input.spokeIds, reason: input.reason }
      );
    });
  });

  describe('killHub', () => {
    it('kills a hub', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = reviewRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        hubId: HUB_ID,
        reason: 'bad quality',
      };

      mockCallAgent.mockResolvedValue({ success: true });

      await caller.killHub(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'killHub',
        { hubId: input.hubId, reason: input.reason }
      );
    });
  });

  describe('swipeAction', () => {
    it('approves on swipe approve', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = reviewRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        spokeId: SPOKE_ID_1,
        action: 'approve' as const,
      };

      await caller.swipeAction(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'approveSpoke',
        { spokeId: input.spokeId }
      );
    });

    it('rejects on swipe reject', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = reviewRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        spokeId: SPOKE_ID_1,
        action: 'reject' as const,
      };

      await caller.swipeAction(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'rejectSpoke',
        { spokeId: input.spokeId }
      );
    });
  });
});
