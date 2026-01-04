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
    batch: vi.fn(),
  };

  // Mock run that returns Drizzle result format with meta
  const mockDrizzleRun = vi.fn().mockImplementation(() => {
    return Promise.resolve({ meta: { changes: 1 } });
  });

  const mockDrizzle = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockImplementation((table: any) => {
      // Drizzle tables have a name property or can be stringified
      lastQuery = `SELECT FROM ${table?.name || table || 'unknown'}`;
      return mockDrizzle;
    }),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    insert: vi.fn().mockImplementation((table: any) => {
      lastQuery = `INSERT INTO ${table?.name || table || 'unknown'}`;
      return mockDrizzle;
    }),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockImplementation((table: any) => {
      lastQuery = `UPDATE ${table?.name || table || 'unknown'}`;
      return mockDrizzle;
    }),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockImplementation((table: any) => {
      lastQuery = `DELETE FROM ${table?.name || table || 'unknown'}`;
      return mockDrizzle;
    }),

    // Terminal methods delegating to mockDb
    get: mockFirst,
    all: vi.fn().mockImplementation(async () => {
      const result = await mockAll();
      // If result has .results (D1 format), return that. Otherwise return result (if array or other).
      if (result && typeof result === 'object' && 'results' in result) {
        return (result as any).results;
      }
      return result;
    }),
    // run returns Drizzle format with meta.changes
    run: mockDrizzleRun,
    // transaction for bulk operations
    transaction: vi.fn().mockImplementation(async (fn: (tx: typeof mockDrizzle) => Promise<unknown>) => {
      // Execute the transaction callback with the mock drizzle as tx
      return await fn(mockDrizzle);
    }),
  } as any;

  const mockCallAgent = vi.fn();
  const mockCallEngine = vi.fn();
  const mockFetch = vi.fn();
  const mockR2Delete = vi.fn();
  const mockR2Head = vi.fn();
  const mockR2Get = vi.fn();
  const mockAIRun = vi.fn();

  const ctx: Context = {
    env: {
      DB: mockDb,
      CONTENT_ENGINE: { fetch: mockFetch },
      MEDIA: { delete: mockR2Delete, head: mockR2Head, get: mockR2Get },
      AI: { run: mockAIRun },
    } as any,
    db: mockDb as any,
    drizzle: mockDrizzle,
    userId: 'user-123',
    accountId: 'account-123',
    userRole: 'admin',
    callAgent: mockCallAgent,
    callEngine: mockCallEngine,
  };

  return { ctx, mockDb, mockCallAgent, mockCallEngine, mockFetch, setMembershipRole, mockR2Delete, mockR2Head, mockR2Get, mockAIRun };
};
