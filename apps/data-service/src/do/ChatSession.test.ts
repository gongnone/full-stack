import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock cloudflare:workers before importing the class
vi.mock('cloudflare:workers', () => {
  return {
    DurableObject: class {
      ctx: any;
      env: any;
      constructor(ctx: any, env: any) {
        this.ctx = ctx;
        this.env = env;
      }
    }
  };
});

import { ChatSession } from './ChatSession';

// Mock Dependencies
vi.mock('@repo/agent-logic/rag', () => ({
  searchKnowledge: vi.fn().mockResolvedValue('Mock RAG Context'),
}));

vi.mock('@repo/agent-logic/prompts', () => ({
  PHASE_PROMPTS: {
    research: 'Research Phase Prompt',
    offer: 'Offer Phase Prompt',
    content: 'Content Phase Prompt',
  },
}));

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: () => 'test-campaign-id',
}));

// Mock database
const mockDb = {
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue({}),
};
vi.mock('@repo/data-ops/database', () => ({
  initDatabase: () => mockDb,
}));
vi.mock('@repo/data-ops/schema', () => ({
  campaigns: {},
}));

// Mock Global WebSocket (removed to allow Response validation with real WebSockets)
// class MockWebSocket { ... }
// class MockWebSocketPair { ... }

// Patch WebSocketPair to allow spying on send and avoid 'not accepted' error
const RealWebSocketPair = global.WebSocketPair;
// @ts-ignore
global.WebSocketPair = class PatchedWebSocketPair {
  constructor() {
    // @ts-ignore
    const pair = new RealWebSocketPair();
    const serverSocket = pair[1];
    
    // Stub send to avoid "You must call accept()" error and allow spying
    serverSocket.send = vi.fn();
    
    // We return the real pair object, but with patched server socket
    return pair;
  }
};

describe('ChatSession Durable Object', () => {
  let session: ChatSession;
  let mockState: any;
  let mockEnv: any;

  beforeEach(() => {
    mockState = {
      id: { toString: () => 'do-id' },
      waitUntil: vi.fn(),
      blockConcurrencyWhile: vi.fn((cb) => cb()),
      storage: {
        get: vi.fn().mockResolvedValue(undefined),
        put: vi.fn().mockResolvedValue(undefined),
        deleteAll: vi.fn().mockResolvedValue(undefined),
      },
      acceptWebSocket: vi.fn(),
    };
    mockEnv = {
      AI: {
        run: vi.fn().mockResolvedValue({ response: 'AI Response' }),
      },
      DB: {},
    };
    session = new ChatSession(mockState, mockEnv);
  });

  describe('fetch', () => {
    it('handles WebSocket upgrades', async () => {
      const req = new Request('http://do/', { headers: { Upgrade: 'websocket' } });
      const res = await session.fetch(req);
      expect(res.status).toBe(101);
      expect(mockState.acceptWebSocket).toHaveBeenCalled();
    });

    it('handles standard POST messages', async () => {
      const req = new Request('http://do/', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });
      const res = await session.fetch(req);
      expect(res.status).toBe(200);
      expect(mockEnv.AI.run).toHaveBeenCalled();
    });
  });

  describe('State Transitions', () => {
    it('advances from research to offer on completePhase', async () => {
      session.currentPhase = 'research';
      const result = await session.completePhase('Research done', 'Target Audience');
      
      expect(session.currentPhase).toBe('offer');
      expect(session.phaseData.research).toEqual({ summary: 'Research done', audience: 'Target Audience' });
      expect(mockState.storage.put).toHaveBeenCalledWith('currentPhase', 'offer');
      expect(result).toContain('Switching to \'offer\'');
    });

    it('advances from offer to content on completePhase', async () => {
      session.currentPhase = 'offer';
      const result = await session.completePhase('Offer done', undefined, 99);
      
      expect(session.currentPhase).toBe('content');
      expect(session.phaseData.offer).toEqual({ summary: 'Offer done', price: 99 });
      expect(mockState.storage.put).toHaveBeenCalledWith('currentPhase', 'content');
    });
  });

  describe('finalizeCampaign', () => {
    it('inserts campaign into database', async () => {
      session.phaseData = {
        research: { summary: 'Res', audience: 'Aud' },
        offer: { summary: 'Off', price: 10 },
      };
      
      const result = await session.finalizeCampaign('My Campaign', { tone: 'Friendly' });
      
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        name: 'My Campaign',
        userId: 'user_test',
        id: 'test-campaign-id',
      }));
      expect(result).toContain('saved successfully');
    });
  });

  describe('message handling', () => {
    it('clears memory on /clear command', async () => {
      session.messages = [{ role: 'user', content: 'hi' }];
      const res = await session.message('/clear');
      
      expect(session.messages).toHaveLength(0);
      expect(mockState.storage.deleteAll).toHaveBeenCalled();
      expect(res).toContain('Memory cleared');
    });

    it('processes user message via AI', async () => {
      const res = await session.message('Hello AI');
      
      expect(mockEnv.AI.run).toHaveBeenCalled();
      expect(session.messages).toHaveLength(2); // User + Assistant
      expect(res).toBe('AI Response');
    });
  });
});
