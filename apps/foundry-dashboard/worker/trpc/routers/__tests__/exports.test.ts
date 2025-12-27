import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportsRouter } from '../exports';
import { createMockContext } from './utils';

// Valid UUIDs for testing
const CLIENT_ID = '00000000-0000-0000-0000-000000000001';
const EXPORT_ID = '00000000-0000-0000-0000-000000000002';
const SPOKE_ID_1 = '00000000-0000-0000-0000-000000000003';
const SPOKE_ID_2 = '00000000-0000-0000-0000-000000000004';

describe('exportsRouter', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('initiates an export', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = exportsRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        format: 'csv' as const,
        includeVisuals: true,
      };

      mockCallAgent.mockResolvedValue({ exportId: EXPORT_ID, status: 'pending' });

      const result = await caller.create(input);

      expect(mockCallAgent).toHaveBeenCalledWith(
        input.clientId,
        'createExport',
        expect.objectContaining({
          format: 'csv',
          includeVisuals: true,
        })
      );
      expect(result).toEqual({ exportId: EXPORT_ID, status: 'pending' });
    });
  });

  describe('getDownloadUrl', () => {
    it('returns download URL for completed export', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = exportsRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        exportId: EXPORT_ID,
      };

      mockCallAgent.mockResolvedValue({
        status: 'completed',
        downloadUrl: 'https://example.com/download.csv',
      });

      const result = await caller.getDownloadUrl(input);

      expect(result.url).toBe('https://example.com/download.csv');
    });

    it('throws if export is not ready', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = exportsRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        exportId: EXPORT_ID,
      };

      mockCallAgent.mockResolvedValue({ status: 'processing' });

      await expect(caller.getDownloadUrl(input)).rejects.toThrow();
    });
  });

  describe('copyToClipboard', () => {
    it('formats content for clipboard', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = exportsRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        spokeIds: [SPOKE_ID_1, SPOKE_ID_2],
        format: 'plain' as const,
      };

      const mockSpokes = [
        { id: SPOKE_ID_1, content: 'Spoke 1', platform: 'twitter' },
        { id: SPOKE_ID_2, content: 'Spoke 2', platform: 'linkedin' },
      ];

      mockCallAgent.mockResolvedValue(mockSpokes);

      const result = await caller.copyToClipboard(input);

      expect(result.content).toContain('Spoke 1');
      expect(result.content).toContain('Spoke 2');
      expect(result.count).toBe(2);
    });

    it('formats as markdown', async () => {
      const { ctx, mockCallAgent } = mockCtx;
      const caller = exportsRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        spokeIds: [SPOKE_ID_1],
        format: 'markdown' as const,
      };

      mockCallAgent.mockResolvedValue([
        { id: SPOKE_ID_1, content: 'Spoke 1', platform: 'twitter' },
      ]);

      const result = await caller.copyToClipboard(input);

      expect(result.content).toContain('## TWITTER');
      expect(result.content).toContain('Spoke 1');
    });
  });
});
