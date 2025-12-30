import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createContext } from '../context';

describe('callAgent', () => {
  const mockEnv = {
    DB: {} as D1Database,
    CONTENT_ENGINE: {
      fetch: vi.fn(),
    },
  } as any;

  const createTestContext = () => createContext({
    env: mockEnv,
    userId: 'test-user-id',
    accountId: 'test-account-id',
    userRole: 'owner',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('timeout behavior (AC2)', () => {
    it('should abort after 30 seconds with descriptive error message', async () => {
      // Mock fetch that simulates abort signal handling
      mockEnv.CONTENT_ENGINE.fetch.mockImplementation((_req: Request, opts: { signal?: AbortSignal }) => {
        return new Promise((resolve, reject) => {
          if (opts?.signal) {
            if (opts.signal.aborted) {
              const error = new Error('The operation was aborted');
              error.name = 'AbortError';
              reject(error);
            } else {
              opts.signal.addEventListener('abort', () => {
                const error = new Error('The operation was aborted');
                error.name = 'AbortError';
                reject(error);
              });
            }
          }
        });
      });

      const ctx = createTestContext();
      const callPromise = ctx.callAgent('test-client', 'testMethod', {});

      // Fast-forward 30 seconds (timeout + retry backoffs)
      // First attempt: 30s timeout
      // We must catch the rejection to prevent "Unhandled Rejection" warnings in the test runner
      // This is a common issue when testing async timeouts with fake timers
      callPromise.catch(() => {});

      await vi.advanceTimersByTimeAsync(30000);
      // First backoff: 100ms
      await vi.advanceTimersByTimeAsync(100);
      // Second attempt: 30s timeout
      await vi.advanceTimersByTimeAsync(30000);
      // Second backoff: 200ms
      await vi.advanceTimersByTimeAsync(200);
      // Third attempt: 30s timeout
      await vi.advanceTimersByTimeAsync(30000);

      await expect(callPromise).rejects.toThrow('Agent RPC timeout after 30000ms');
    });

    it('should clear timeout after successful response', async () => {
      mockEnv.CONTENT_ENGINE.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const ctx = createTestContext();
      const result = await ctx.callAgent('test-client', 'testMethod', {});

      expect(result).toEqual({ success: true });
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry behavior (AC3)', () => {
    it('should retry on 5xx errors with exponential backoff', async () => {
      // First two calls return 500, third succeeds
      mockEnv.CONTENT_ENGINE.fetch
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const ctx = createTestContext();
      const resultPromise = ctx.callAgent('test-client', 'testMethod', {});

      // First retry after 100ms
      await vi.advanceTimersByTimeAsync(100);
      // Second retry after 200ms
      await vi.advanceTimersByTimeAsync(200);

      const result = await resultPromise;

      expect(result).toEqual({ success: true });
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(3);
    });

    it('should NOT retry on 4xx errors', async () => {
      mockEnv.CONTENT_ENGINE.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const ctx = createTestContext();

      await expect(ctx.callAgent('test-client', 'testMethod', {}))
        .rejects.toThrow('Agent RPC failed: Not Found');

      // Should only try once - no retries for 4xx
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on network errors with exponential backoff', async () => {
      // First two calls throw network error, third succeeds
      mockEnv.CONTENT_ENGINE.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Connection reset'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ retried: true }),
        });

      const ctx = createTestContext();
      const resultPromise = ctx.callAgent('test-client', 'testMethod', {});

      // First retry after 100ms
      await vi.advanceTimersByTimeAsync(100);
      // Second retry after 200ms
      await vi.advanceTimersByTimeAsync(200);

      const result = await resultPromise;

      expect(result).toEqual({ retried: true });
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries (3 attempts)', async () => {
      mockEnv.CONTENT_ENGINE.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const ctx = createTestContext();
      const resultPromise = ctx.callAgent('test-client', 'testMethod', {});
      
      // Prevent unhandled rejection warning
      resultPromise.catch(() => {});

      // Advance through all retry backoffs
      await vi.advanceTimersByTimeAsync(100); // First backoff
      await vi.advanceTimersByTimeAsync(200); // Second backoff

      await expect(resultPromise).rejects.toThrow('Agent RPC failed: Internal Server Error');

      // Should try 3 times total
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(3);
    });

    it('should use correct backoff delays: 100ms, 200ms, 400ms', async () => {
      // All calls fail to test timing
      mockEnv.CONTENT_ENGINE.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      const ctx = createTestContext();
      const resultPromise = ctx.callAgent('test-client', 'testMethod', {});
      
      // Prevent unhandled rejection warning
      resultPromise.catch(() => {});

      // After first call, should wait 100ms
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(50);
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(1); // Still waiting

      await vi.advanceTimersByTimeAsync(50); // Total 100ms
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(2);

      // After second call, should wait 200ms
      await vi.advanceTimersByTimeAsync(100);
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(2); // Still waiting

      await vi.advanceTimersByTimeAsync(100); // Total 200ms
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(3);

      // Wait for promise to settle
      await expect(resultPromise).rejects.toThrow();
    });
  });

  describe('request format', () => {
    it('should send correct RPC request to CONTENT_ENGINE', async () => {
      mockEnv.CONTENT_ENGINE.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ result: 'success' }),
      });

      const ctx = createTestContext();
      await ctx.callAgent('my-client-123', 'someMethod', { key: 'value' });

      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(1);

      const [request] = mockEnv.CONTENT_ENGINE.fetch.mock.calls[0] as [Request, unknown];
      expect(request.url).toBe('http://internal/api/client/my-client-123/rpc');
      expect(request.method).toBe('POST');
      expect(request.headers.get('Content-Type')).toBe('application/json');

      const body = await request.text();
      expect(JSON.parse(body)).toEqual({ method: 'someMethod', params: { key: 'value' } });
    });
  });

  describe('callEngine (AC2/AC3 for Engine)', () => {
    it('should retry engine calls on 5xx errors', async () => {
      mockEnv.CONTENT_ENGINE.fetch
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Error' })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const ctx = createTestContext();
      const resultPromise = ctx.callEngine('/api/test', { method: 'GET' });

      await vi.advanceTimersByTimeAsync(100);
      const result = await resultPromise;

      expect(result).toEqual({ success: true });
      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry engine calls on 4xx errors', async () => {
      mockEnv.CONTENT_ENGINE.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const ctx = createTestContext();
      await expect(ctx.callEngine('/api/test', { method: 'GET' }))
        .rejects.toThrow('Engine request failed: Not Found');

      expect(mockEnv.CONTENT_ENGINE.fetch).toHaveBeenCalledTimes(1);
    });

    it('should normalize URL path', async () => {
      mockEnv.CONTENT_ENGINE.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const ctx = createTestContext();
      
      // Test with leading slash
      await ctx.callEngine('/api/test1');
      expect((mockEnv.CONTENT_ENGINE.fetch.mock.calls[0][0] as Request).url).toBe('http://internal/api/test1');

      // Test without leading slash
      await ctx.callEngine('api/test2');
      expect((mockEnv.CONTENT_ENGINE.fetch.mock.calls[1][0] as Request).url).toBe('http://internal/api/test2');
      
      // Test full URL
      await ctx.callEngine('http://external/api/test3');
      expect((mockEnv.CONTENT_ENGINE.fetch.mock.calls[2][0] as Request).url).toBe('http://external/api/test3');
    });
  });
});
