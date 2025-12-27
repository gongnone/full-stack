import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spokesRouter } from '../spokes';
import { createMockContext } from './utils';
import { TRPCError } from '@trpc/server';

const CLIENT_ID = '00000000-0000-0000-0000-000000000000';
const HUB_ID = '00000000-0000-0000-0000-000000000001';
const SPOKE_ID_1 = '00000000-0000-0000-0000-000000000002';

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
      const { ctx, mockFetch } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        hubId: '00000000-0000-0000-0000-000000000001',
        platforms: ['twitter' as const, 'linkedin' as const],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ instanceId: 'wf-123', status: 'started' }),
      });

      const result = await caller.generate(input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://internal/api/spokes/generate',
          method: 'POST',
        })
      );
      expect(result).toEqual({ instanceId: 'wf-123', status: 'started' });
    });

    it('throws error if generation fails to start', async () => {
      const { ctx, mockFetch } = mockCtx;
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        hubId: '00000000-0000-0000-0000-000000000001',
      };

      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(caller.generate(input)).rejects.toThrow(TRPCError);
    });
  });
});
