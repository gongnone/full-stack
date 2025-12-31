import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authRouter } from '../auth';
import { createMockContext } from './utils';
import { TRPCError } from '@trpc/server';

describe('authRouter', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('me', () => {
    it('returns user and profile when authenticated', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = authRouter.createCaller(ctx);

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      const mockProfile = { id: 'prof-1', user_id: 'user-123', display_name: 'Test User' };

      mockDb.first.mockResolvedValueOnce(mockUser); // user query
      mockDb.first.mockResolvedValueOnce(mockProfile); // profile query

      const result = await caller.me();

      expect(result.user.id).toBe('user-123');
      expect(result.profile?.display_name).toBe('Test User');
    });

    it('creates a profile if it doesn\'t exist', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = authRouter.createCaller(ctx);

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };

      mockDb.first.mockResolvedValueOnce(mockUser); // user query
      mockDb.first.mockResolvedValueOnce(null); // profile query (missing)
      mockDb.run.mockResolvedValue({ success: true }); // insert query
      mockDb.first.mockResolvedValueOnce(null); // getFirstClientId helper

      const result = await caller.me();

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO user_profiles'));
      expect(result.profile?.display_name).toBe('Test User');
    });

    it('throws unauthorized if userId is missing', async () => {
      const { ctx } = mockCtx;
      ctx.userId = ''; // Unauthenticate
      const caller = authRouter.createCaller(ctx);

      await expect(caller.me()).rejects.toThrow(TRPCError);
    });

    // R-14 AC1: auth.me returns clientId: null when user has no clients
    it('returns clientId: null when user has no clients', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = authRouter.createCaller(ctx);

      const mockUser = { id: 'user-123', email: 'new@example.com', name: 'New User' };
      // Profile exists but has no active_client_id
      const mockProfile = {
        id: 'prof-1',
        user_id: 'user-123',
        display_name: 'New User',
        active_client_id: null
      };

      mockDb.first.mockResolvedValueOnce(mockUser); // user query
      mockDb.first.mockResolvedValueOnce(mockProfile); // profile query
      mockDb.first.mockResolvedValueOnce(null); // getFirstClientId returns null (no memberships)

      const result = await caller.me();

      // R-14: clientId should be null, NOT userId or accountId
      expect(result.clientId).toBeNull();
      expect(result.user.id).toBe('user-123');
    });

    it('returns clientId from active_client_id when set', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = authRouter.createCaller(ctx);

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      const mockProfile = {
        id: 'prof-1',
        user_id: 'user-123',
        display_name: 'Test User',
        active_client_id: 'client-abc'
      };

      mockDb.first.mockResolvedValueOnce(mockUser); // user query
      mockDb.first.mockResolvedValueOnce(mockProfile); // profile query

      const result = await caller.me();

      expect(result.clientId).toBe('client-abc');
    });

    it('falls back to first client membership when no active_client_id', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = authRouter.createCaller(ctx);

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      const mockProfile = {
        id: 'prof-1',
        user_id: 'user-123',
        display_name: 'Test User',
        active_client_id: null
      };

      // Override the default first() behavior to return specific values in order
      // Note: client_members queries are special-cased in mock utils, so we use raw implementation
      let callCount = 0;
      mockDb.first.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve(mockUser); // user query
        if (callCount === 2) return Promise.resolve(mockProfile); // profile query
        if (callCount === 3) return Promise.resolve({ client_id: 'client-xyz' }); // getFirstClientId
        return Promise.resolve(null);
      });

      const result = await caller.me();

      expect(result.clientId).toBe('client-xyz');
    });
  });

  describe('updateProfile', () => {
    it('updates existing profile', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = authRouter.createCaller(ctx);
      const input = {
        displayName: 'New Name',
        emailNotifications: true,
      };

      mockDb.first.mockResolvedValueOnce({ id: 'prof-1' }); // existing profile check
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.updateProfile(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE user_profiles'));
      expect(result.success).toBe(true);
    });

    it('creates profile if not existing during update', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = authRouter.createCaller(ctx);
      const input = {
        displayName: 'New Name',
      };

      mockDb.first.mockResolvedValueOnce(null); // profile check fails
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.updateProfile(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO user_profiles'));
      expect(result.success).toBe(true);
    });
  });
});
