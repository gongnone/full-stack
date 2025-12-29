import { vi } from 'vitest';
import type { Context } from '../../context';

export const createMockContext = () => {
  // Track the last query to handle client_members checks
  let lastQuery = '';
  // Queue for mocked responses (for non-client_members queries)
  const responseQueue: unknown[] = [];
  // Configurable membership role for client_members queries
  let membershipOverride: { role: string } | null = null;

  const mockFirst = vi.fn().mockImplementation(() => {
    // For client_members queries, return membership (override or default)
    // This ensures assertClientAccess passes without tests needing to mock it
    if (lastQuery.includes('client_members')) {
      // Use override if set, otherwise default to agency_owner
      const membership = membershipOverride || { role: 'agency_owner' };
      // Reset override after use (single-use like mockResolvedValueOnce)
      membershipOverride = null;
      return Promise.resolve(membership);
    }
    // For all other queries, use queued responses if available
    if (responseQueue.length > 0) {
      return Promise.resolve(responseQueue.shift());
    }
    // Default: return null
    return Promise.resolve(null);
  });

  // Helper to queue responses for non-client_members queries
  (mockFirst as any).mockResolvedValueOnce = (value: unknown) => {
    responseQueue.push(value);
    return mockFirst;
  };

  // Helper to set the membership role for client_members queries
  const setMembershipRole = (role: string | null) => {
    membershipOverride = role ? { role } : null;
  };

  const mockAll = vi.fn();

  const mockDb = {
    prepare: vi.fn().mockImplementation((query: string) => {
      lastQuery = query;
      return mockDb;
    }),
    bind: vi.fn().mockReturnThis(),
    run: vi.fn(),
    all: mockAll,
    first: mockFirst,
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

  return { ctx, mockDb, mockCallAgent, mockFetch, setMembershipRole };
};
