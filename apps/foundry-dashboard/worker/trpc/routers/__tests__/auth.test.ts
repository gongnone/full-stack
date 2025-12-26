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
