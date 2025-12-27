import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IngestionTracker } from './IngestionTracker';

// Mock WebSocket classes
class MockWebSocket {
  public readyState = 1; // Open
  public send = vi.fn();
  public accept = vi.fn();
  public addEventListener = vi.fn();
  public close = vi.fn();

  constructor() {}
}

class MockWebSocketPair {
  0: MockWebSocket; // Client
  1: MockWebSocket; // Server

  constructor() {
    this['0'] = new MockWebSocket();
    this['1'] = new MockWebSocket();
  }
}

// @ts-ignore - Mocking global WebSocketPair
global.WebSocketPair = MockWebSocketPair;

describe('IngestionTracker Durable Object', () => {
  let tracker: IngestionTracker;
  let mockState: any;
  let mockEnv: any;

  beforeEach(() => {
    mockState = {
      id: { toString: () => 'do-id' },
      waitUntil: vi.fn(),
      blockConcurrencyWhile: vi.fn((cb) => cb()),
      storage: {},
    };
    mockEnv = {};
    tracker = new IngestionTracker(mockState, mockEnv);
  });

  describe('fetch', () => {
    it('returns 404 for unknown paths', async () => {
      const req = new Request('http://do/unknown');
      const res = await tracker.fetch(req);
      expect(res.status).toBe(404);
    });

    it('handles WebSocket upgrade requests', async () => {
      const req = new Request('http://do/websocket', {
        headers: { Upgrade: 'websocket' },
      });

      const res = await tracker.fetch(req);

      expect(res.status).toBe(101);
      expect(res.webSocket).toBeDefined();
    });

    it('rejects WebSocket requests without Upgrade header', async () => {
      const req = new Request('http://do/websocket');
      const res = await tracker.fetch(req);
      expect(res.status).toBe(426);
    });

    it('handles broadcast requests', async () => {
      // First connect a client
      const wsReq = new Request('http://do/websocket', {
        headers: { Upgrade: 'websocket' },
      });
      await tracker.fetch(wsReq);

      // Now broadcast
      const broadcastReq = new Request('http://do/broadcast', {
        method: 'POST',
        body: 'test-message',
      });
      
      const res = await tracker.fetch(broadcastReq);
      expect(res.status).toBe(200);
      
      // Access private websockets array via any cast to check if send was called
      // In a real test we might spy on the WebSocket class prototype
    });
    
    it('rejects non-POST broadcast requests', async () => {
      const req = new Request('http://do/broadcast', { method: 'GET' });
      const res = await tracker.fetch(req);
      expect(res.status).toBe(405);
    });
  });

  describe('broadcast', () => {
    it('sends message to all connected clients', async () => {
      // Manually add a mock websocket to the private array
      const mockWs = new MockWebSocket();
      (tracker as any).websockets.push(mockWs);

      tracker.broadcast('hello world');

      expect(mockWs.send).toHaveBeenCalledWith('hello world');
    });

    it('removes dead connections on send error', async () => {
      const mockWs1 = new MockWebSocket();
      const mockWs2 = new MockWebSocket();
      
      mockWs1.send.mockImplementation(() => { throw new Error('Closed'); });
      
      (tracker as any).websockets = [mockWs1, mockWs2];

      tracker.broadcast('ping');

      expect(mockWs1.send).toHaveBeenCalled();
      expect(mockWs2.send).toHaveBeenCalled();
      
      // Should have filtered out ws1
      expect((tracker as any).websockets).toHaveLength(1);
      expect((tracker as any).websockets[0]).toBe(mockWs2);
    });
  });
});
