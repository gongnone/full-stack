import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientsRouter } from '../clients';
import { createMockContext } from './utils';
import { TRPCError } from '@trpc/server';

describe('clientsRouter', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('lists clients for the account', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);

      mockDb.all.mockResolvedValue({
        results: [
          { id: 'c1', name: 'Client 1', status: 'active', created_at: 123 },
        ],
      });

      const result = await caller.list({});

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name'));
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Client 1');
    });
  });

  describe('create', () => {
    it('creates a client and adds owner', async () => {
      const { ctx, mockDb, mockCallAgent } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        name: 'New Client',
        brandColor: '#FF0000',
      };

      mockDb.run.mockResolvedValue({ success: true });
      mockCallAgent.mockResolvedValue({});

      const result = await caller.create(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO clients'));
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO client_members'));
      expect(mockCallAgent).toHaveBeenCalledWith(expect.any(String), 'getBrandDNA', {});
      expect(result.success).toBe(true);
    });
  });

  describe('addMember', () => {
    it('adds a member if user has permissions', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        role: 'creator' as const,
      };

      // Mock permission check
      mockDb.first.mockResolvedValueOnce({ role: 'agency_owner' });
      // Mock user lookup
      mockDb.first.mockResolvedValueOnce({ id: 'target-u1' });
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.addMember(input);

      expect(result.success).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO client_members'));
    });

    it('throws forbidden if user is not an owner', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        role: 'creator' as const,
      };

      mockDb.first.mockResolvedValueOnce({ role: 'creator' });

      await expect(caller.addMember(input)).rejects.toThrow(TRPCError);
    });
  });

  describe('switch', () => {
    it('updates active client in profile', async () => {
      const { ctx, mockDb, mockCallAgent } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      mockDb.first.mockResolvedValueOnce({ role: 'creator' });
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.switch(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE user_profiles'));
      expect(mockCallAgent).toHaveBeenCalledWith(input.clientId, 'getBrandDNA', {});
      expect(result.success).toBe(true);
    });
  });
});
