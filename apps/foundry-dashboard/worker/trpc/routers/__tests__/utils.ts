import { vi } from 'vitest';
import type { Context } from '../../context';

export const createMockContext = () => {
  const mockDb = {
    prepare: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    run: vi.fn(),
    all: vi.fn(),
    first: vi.fn(),
  };

  const mockCallAgent = vi.fn();
  const mockFetch = vi.fn();

  const ctx: Context = {
    env: { 
      DB: mockDb,
      CONTENT_ENGINE: { fetch: mockFetch }
    } as any,
    db: mockDb as any,
    userId: 'user-123',
    accountId: 'account-123',
    userRole: 'admin',
    callAgent: mockCallAgent,
  };

  return { ctx, mockDb, mockCallAgent, mockFetch };
};
