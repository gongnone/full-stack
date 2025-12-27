import { describe, it, expect, vi } from 'vitest';
import { getUserCredits } from './user';
import { user } from '../drizzle-out/auth-schema';
import { eq } from 'drizzle-orm';

describe('user queries', () => {
  describe('getUserCredits', () => {
    it('returns 0 if user not found', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue(undefined),
      } as any;

      const result = await getUserCredits(mockDb, 'non-existent');
      expect(result).toBe(0);
      expect(mockDb.select).toHaveBeenCalledWith({ credits: user.credits });
      expect(mockDb.where).toHaveBeenCalled(); // verifying call without exact args is usually safer with mocked operators
    });

    it('returns credits if user found', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue({ credits: 100 }),
      } as any;

      const result = await getUserCredits(mockDb, 'user-123');
      expect(result).toBe(100);
    });
  });
});
