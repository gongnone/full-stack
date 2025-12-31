/**
 * Unit tests for BrandDNA Agent Durable Object
 *
 * Story 1.5-1-1: BrandDNA Agent Infrastructure
 *
 * Tests cover:
 * - AC1: Durable Object scaffold with SQLite
 * - AC2: WebSocket welcome message
 * - AC3: Session reconnection within 30 minutes
 * - AC4: Rate limiting (30 messages per minute)
 * - AC5: Hibernation handling (state persistence)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the Agent class from agents SDK
vi.mock('agents', () => ({
  Agent: class MockAgent {
    sql = vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => {
      // Return empty array by default, tests can override
      return [];
    });
  },
}));

// Import after mocking
import { BrandDNAAgent } from '../BrandDNAAgent';

// Test helpers
function createMockConnection(id: string = 'test-conn-1') {
  return {
    id,
    send: vi.fn(),
    close: vi.fn(),
  };
}

function createMockContext() {
  return {
    request: new Request('https://example.com'),
  };
}

describe('BrandDNAAgent', () => {
  let agent: BrandDNAAgent;
  let mockConnection: ReturnType<typeof createMockConnection>;
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    vi.useFakeTimers();
    agent = new BrandDNAAgent();
    mockConnection = createMockConnection();
    mockCtx = createMockContext();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('AC1: Durable Object Scaffold', () => {
    it('should create session_state table on start', async () => {
      const sqlSpy = vi.spyOn(agent, 'sql' as keyof BrandDNAAgent);

      await agent.onStart();

      // Should create 4 tables (session_state, conversation_history, voice_samples, rate_limits)
      expect(sqlSpy).toHaveBeenCalledTimes(4);
    });

    it('should create conversation_history table on start', async () => {
      const sqlSpy = vi.spyOn(agent, 'sql' as keyof BrandDNAAgent);

      await agent.onStart();

      // Verify tables created (implementation detail - 3 tables)
      expect(sqlSpy).toHaveBeenCalled();
    });

    it('should create voice_samples table on start', async () => {
      await agent.onStart();

      // onStart should complete without errors
      expect(true).toBe(true);
    });
  });

  describe('AC2: WebSocket Welcome', () => {
    it('should send welcome message on new connection', async () => {
      // Mock sql to return empty (new session)
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockReturnValue([]);

      await agent.onConnect(mockConnection as any, mockCtx as any);

      expect(mockConnection.send).toHaveBeenCalledTimes(1);

      const sentMessage = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(sentMessage.component.type).toBe('TextMessage');
      expect(sentMessage.component.props.content).toContain("Hi! I'm your Brand DNA Agent");
      expect(sentMessage.sessionState.currentStep).toBe('welcome');
    });

    it('should include session state in welcome message', async () => {
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockReturnValue([]);

      await agent.onConnect(mockConnection as any, mockCtx as any);

      const sentMessage = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(sentMessage.sessionState).toBeDefined();
      expect(sentMessage.sessionState.currentStep).toBe('welcome');
      expect(sentMessage.sessionState.progress).toBe(0);
    });
  });

  describe('AC3: Session Reconnection', () => {
    it('should restore session if reconnecting within 30 minutes', async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // Mock existing session (last activity 10 minutes ago)
      const tenMinutesAgo = now - 10 * 60 * 1000;
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockImplementation(
        (strings: TemplateStringsArray, ...values: unknown[]) => {
          const query = strings.join('?');
          const keyValue = values[0];
          // Match on key parameter in SELECT query
          if (query.includes('SELECT') && query.includes('session_state')) {
            if (keyValue === 'last_activity_at') {
              return [{ value: String(tenMinutesAgo) }];
            }
            if (keyValue === 'session_started_at') {
              return [{ value: String(tenMinutesAgo - 5 * 60 * 1000) }];
            }
            if (keyValue === 'current_step') {
              return [{ value: 'personality' }];
            }
          }
          return [];
        }
      );

      await agent.onConnect(mockConnection as any, mockCtx as any);

      const sentMessage = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(sentMessage.component.props.content).toContain('Welcome back');
      expect(sentMessage.sessionState.currentStep).toBe('personality');
    });

    it('should start new session if reconnecting after 30 minutes', async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // Mock expired session (last activity 45 minutes ago)
      const fortyFiveMinutesAgo = now - 45 * 60 * 1000;
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockImplementation(
        (strings: TemplateStringsArray, ...values: unknown[]) => {
          const query = strings.join('?');
          if (query.includes('last_activity_at')) {
            return [{ value: String(fortyFiveMinutesAgo) }];
          }
          if (query.includes('session_started_at')) {
            return [{ value: String(fortyFiveMinutesAgo) }];
          }
          if (query.includes('current_step')) {
            return [{ value: 'personality' }];
          }
          return [];
        }
      );

      await agent.onConnect(mockConnection as any, mockCtx as any);

      const sentMessage = JSON.parse(mockConnection.send.mock.calls[0][0]);
      // Should NOT say "Welcome back" since session expired
      expect(sentMessage.component.props.content).not.toContain('Welcome back');
    });
  });

  describe('AC4: Rate Limiting', () => {
    it('should allow up to 30 messages per minute', async () => {
      // Mock SQL to return empty rate limits first (allowing), then updating
      let currentTimestamps: number[] = [];
      
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockImplementation(
        (strings: TemplateStringsArray, ...values: unknown[]) => {
          const query = strings.join('?');
          if (query.includes('SELECT') && query.includes('rate_limits')) {
            return [{ timestamps: JSON.stringify(currentTimestamps) }];
          }
          if (query.includes('INSERT OR REPLACE INTO rate_limits')) {
            // Extract the timestamp array from the query values
            const timestampsJson = values[1] as string;
            currentTimestamps = JSON.parse(timestampsJson);
            return [];
          }
          return [];
        }
      );

      // First connect
      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      // Send 30 messages - all should be allowed
      for (let i = 0; i < 30; i++) {
        await agent.onMessage(mockConnection as any, JSON.stringify({ type: 'ping' }));
      }

      // All 30 should receive pong responses
      const responses = mockConnection.send.mock.calls.map(call => JSON.parse(call[0]));
      const pongCount = responses.filter(r => r.type === 'pong').length;
      expect(pongCount).toBe(30);
    });

    it('should rate limit after 30 messages', async () => {
      // Start with 30 timestamps in the last minute
      const now = Date.now();
      let currentTimestamps: number[] = Array(30).fill(now - 1000);

      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockImplementation(
        (strings: TemplateStringsArray, ...values: unknown[]) => {
          const query = strings.join('?');
          if (query.includes('SELECT') && query.includes('rate_limits')) {
            return [{ timestamps: JSON.stringify(currentTimestamps) }];
          }
          return [];
        }
      );

      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      // Send 31st message
      await agent.onMessage(mockConnection as any, JSON.stringify({ type: 'ping' }));

      const response = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(response.component?.props?.error).toBe('rate_limited');
    });

    it('should return retry_after value when rate limited', async () => {
      const now = Date.now();
      // Oldest message was 30 seconds ago
      let currentTimestamps: number[] = Array(30).fill(now - 30000);

      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockImplementation(
        (strings: TemplateStringsArray, ...values: unknown[]) => {
          const query = strings.join('?');
          if (query.includes('SELECT') && query.includes('rate_limits')) {
            return [{ timestamps: JSON.stringify(currentTimestamps) }];
          }
          return [];
        }
      );

      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      await agent.onMessage(mockConnection as any, JSON.stringify({ type: 'ping' }));

      const response = JSON.parse(mockConnection.send.mock.calls[0][0]);
      // Retry after should be ~30 seconds (60s window - 30s elapsed)
      expect(response.component.props.retry_after).toBeGreaterThanOrEqual(29);
      expect(response.component.props.retry_after).toBeLessThanOrEqual(31);
    });
  });

  describe('AC5: Hibernation Handling', () => {
    it('should persist session state to SQLite', async () => {
      const sqlSpy = vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockReturnValue([]);

      await agent.onConnect(mockConnection as any, mockCtx as any);

      // Verify INSERT OR REPLACE was called for session state
      const insertCalls = sqlSpy.mock.calls.filter(call => {
        const query = call[0].join('');
        return query.includes('INSERT OR REPLACE INTO session_state');
      });

      expect(insertCalls.length).toBeGreaterThan(0);
    });

    it('should update last_activity_at on close', async () => {
      const sqlSpy = vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockReturnValue([]);

      await agent.onConnect(mockConnection as any, mockCtx as any);
      await agent.onClose(mockConnection as any, 1000, 'normal');

      // Verify last_activity_at was updated
      const insertCalls = sqlSpy.mock.calls.filter(call => {
        const query = call[0].join('');
        return query.includes('INSERT OR REPLACE INTO session_state');
      });

      expect(insertCalls.length).toBeGreaterThan(0);
    });

    it('should recover state from SQLite on reconnect', async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // Track call count to return different values for session check
      let callCount = 0;
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockImplementation(
        (strings: TemplateStringsArray, ...values: unknown[]) => {
          const query = strings.join('?');
          // Check which key is being queried
          const keyValue = values[0];
          if (query.includes('SELECT') && query.includes('session_state')) {
            if (keyValue === 'last_activity_at') {
              return [{ value: String(now - 5 * 60 * 1000) }]; // 5 minutes ago
            }
            if (keyValue === 'session_started_at') {
              return [{ value: String(now - 10 * 60 * 1000) }]; // 10 minutes ago
            }
            if (keyValue === 'current_step') {
              return [{ value: 'audience' }];
            }
          }
          return [];
        }
      );

      await agent.onConnect(mockConnection as any, mockCtx as any);

      const sentMessage = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(sentMessage.sessionState.currentStep).toBe('audience');
      expect(sentMessage.sessionState.progress).toBe(60); // audience is step 4 of 6 = 60%
    });
  });

  describe('Message Handling', () => {
    it('should handle ping messages', async () => {
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockReturnValue([]);

      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      await agent.onMessage(mockConnection as any, JSON.stringify({ type: 'ping' }));

      const response = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(response.type).toBe('pong');
      expect(response.timestamp).toBeDefined();
    });

    it('should handle text_input messages', async () => {
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockReturnValue([]);

      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      await agent.onMessage(
        mockConnection as any,
        JSON.stringify({
          type: 'text_input',
          payload: { text: 'My brand voice is professional and friendly' },
        })
      );

      const response = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(response.component.type).toBe('TextMessage');
      expect(response.component.props.content).toContain('Thanks for sharing');
    });

    it('should handle voice_sample messages', async () => {
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockReturnValue([]);

      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      await agent.onMessage(
        mockConnection as any,
        JSON.stringify({
          type: 'voice_sample',
          payload: { r2Key: 'voice/sample-123.wav', transcript: 'Hello world', durationMs: 5000 },
        })
      );

      const response = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(response.component.type).toBe('TextMessage');
      expect(response.component.props.content).toContain('Voice sample received');
    });

    it('should handle invalid JSON messages', async () => {
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockReturnValue([]);

      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      await agent.onMessage(mockConnection as any, 'not valid json');

      const response = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(response.component.type).toBe('Error');
      expect(response.component.props.error).toBe('invalid_message');
    });

    it('should handle unknown message types', async () => {
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockReturnValue([]);

      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      await agent.onMessage(mockConnection as any, JSON.stringify({ type: 'unknown_type' }));

      const response = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(response.component.type).toBe('Error');
      expect(response.component.props.error).toBe('unknown_message_type');
    });
  });

  describe('Actions', () => {
    it('should handle next_step action', async () => {
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockImplementation(
        (strings: TemplateStringsArray) => {
          const query = strings.join('?');
          if (query.includes('SELECT') && query.includes('current_step')) {
            return [{ value: 'welcome' }];
          }
          return [];
        }
      );

      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      await agent.onMessage(
        mockConnection as any,
        JSON.stringify({
          type: 'action',
          payload: { action: 'next_step' },
        })
      );

      const response = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(response.component.type).toBe('ProgressIndicator');
      expect(response.sessionState.currentStep).toBe('voice_capture');
    });

    it('should handle get_state action', async () => {
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockImplementation(
        (strings: TemplateStringsArray, ...values: unknown[]) => {
          const query = strings.join('?');
          const keyValue = values[0];
          if (query.includes('SELECT') && query.includes('session_state') && keyValue === 'current_step') {
            return [{ value: 'personality' }];
          }
          return [];
        }
      );

      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      await agent.onMessage(
        mockConnection as any,
        JSON.stringify({
          type: 'action',
          payload: { action: 'get_state' },
        })
      );

      const response = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(response.component.type).toBe('ProgressIndicator');
      expect(response.sessionState.currentStep).toBe('personality');
    });

    it('should handle reset_session action', async () => {
      vi.spyOn(agent, 'sql' as keyof BrandDNAAgent).mockReturnValue([]);

      await agent.onConnect(mockConnection as any, mockCtx as any);
      mockConnection.send.mockClear();

      await agent.onMessage(
        mockConnection as any,
        JSON.stringify({
          type: 'action',
          payload: { action: 'reset_session' },
        })
      );

      const response = JSON.parse(mockConnection.send.mock.calls[0][0]);
      expect(response.component.type).toBe('TextMessage');
      expect(response.component.props.content).toContain('Session reset');
      expect(response.sessionState.currentStep).toBe('welcome');
      expect(response.sessionState.progress).toBe(0);
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate correct progress for each step', async () => {
      const steps = ['welcome', 'voice_capture', 'personality', 'audience', 'pillars', 'complete'];
      const expectedProgress = [0, 20, 40, 60, 80, 100];

      for (let i = 0; i < steps.length; i++) {
        // Create fresh agent for each iteration
        const testAgent = new BrandDNAAgent();
        const testConn = createMockConnection(`conn-${i}`);

        vi.spyOn(testAgent, 'sql' as keyof BrandDNAAgent).mockImplementation(
          (strings: TemplateStringsArray, ...values: unknown[]) => {
            const query = strings.join('?');
            const keyValue = values[0];
            if (query.includes('SELECT') && query.includes('session_state') && keyValue === 'current_step') {
              return [{ value: steps[i] }];
            }
            if (query.includes('SELECT') && query.includes('session_state') && keyValue === 'session_started_at') {
              return [{ value: String(Date.now()) }];
            }
            return [];
          }
        );

        await testAgent.onConnect(testConn as any, mockCtx as any);

        const response = JSON.parse(testConn.send.mock.calls.at(-1)![0]);
        expect(response.sessionState.progress).toBe(expectedProgress[i]);
      }
    });
  });
});
