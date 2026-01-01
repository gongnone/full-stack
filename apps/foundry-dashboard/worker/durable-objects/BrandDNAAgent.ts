/**
 * BrandDNA Agent Durable Object
 *
 * Stateful AI agent for collecting brand voice data through conversational UI.
 * Uses Cloudflare Agent SDK with WebSocket support and SQLite persistence.
 *
 * Story 1.5-1-1: BrandDNA Agent Infrastructure
 */

import { Agent, type Connection, type ConnectionContext } from 'agents';

// Session state keys stored in SQLite
const SESSION_KEYS = {
  CURRENT_STEP: 'current_step',
  IS_EXPRESS: 'is_express',
  VOICE_SAMPLES: 'voice_samples',
  BRAND_PERSONALITY: 'brand_personality',
  AUDIENCE_DATA: 'audience_data',
  PILLARS: 'pillars',
  SESSION_STARTED_AT: 'session_started_at',
  LAST_ACTIVITY_AT: 'last_activity_at',
} as const;

// Rate limiting constants
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_MESSAGES = 30;

// Session timeout for reconnection (30 minutes)
const SESSION_RECONNECT_TIMEOUT_MS = 30 * 60 * 1000;

// Message types from client
interface ClientMessage {
  type: 'voice_sample' | 'text_input' | 'action' | 'ping';
  payload?: unknown;
  requestId?: string;
}

// Structured response component
interface ResponseComponent {
  type: 'TextMessage' | 'VoiceRecorder' | 'QuestionCard' | 'ProgressIndicator' | 'PillarCard' | 'Error' | 'HistoryBatch';
  props: Record<string, unknown>;
}

// Agent response format
interface AgentResponse {
  component: ResponseComponent;
  sessionState?: {
    currentStep: string;
    progress: number;
  };
  requestId?: string;
}

// Rate limit tracking per connection - reserved for future use
interface _RateLimitState {
  messageTimestamps: number[];
}

// Database row types
interface SessionStateRow {
  key: string;
  value: string;
  updated_at: number;
}

/**
 * BrandDNA Agent Durable Object
 *
 * Provides per-client stateful conversation for brand voice collection.
 * Supports WebSocket hibernation for cost efficiency.
 */
export class BrandDNAAgent extends Agent {
  /**
   * Initialize SQLite schema on first use
   */
  async onStart(): Promise<void> {
    // Create session state table
    this.sql`
      CREATE TABLE IF NOT EXISTS session_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;

    // Create conversation history table
    this.sql`
      CREATE TABLE IF NOT EXISTS conversation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL CHECK (role IN ('user', 'agent')),
        content TEXT NOT NULL,
        component_type TEXT,
        created_at INTEGER NOT NULL
      )
    `;

    // Create voice samples table
    this.sql`
      CREATE TABLE IF NOT EXISTS voice_samples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        r2_key TEXT,
        transcript TEXT,
        duration_ms INTEGER,
        created_at INTEGER NOT NULL
      )
    `;

    // Create rate limits table for persistent tracking
    this.sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        connection_id TEXT PRIMARY KEY,
        timestamps TEXT NOT NULL, -- JSON array of timestamps
        updated_at INTEGER NOT NULL
      )
    `;
  }

  /**
   * Handle new WebSocket connection
   * AC2: Send welcome message on connect
   * AC3: Restore session state if reconnecting within 30 minutes
   */
  async onConnect(connection: Connection, _ctx: ConnectionContext): Promise<void> {
    const now = Date.now();

    // Check for existing session to determine if resuming
    const lastActivity = this.getSessionValue(SESSION_KEYS.LAST_ACTIVITY_AT);
    const sessionStarted = this.getSessionValue(SESSION_KEYS.SESSION_STARTED_AT);
    const currentStep = this.getSessionValue(SESSION_KEYS.CURRENT_STEP);

    const isResuming = lastActivity !== null &&
      (now - Number(lastActivity)) < SESSION_RECONNECT_TIMEOUT_MS &&
      currentStep !== null;

    // Update last activity timestamp
    this.setSessionValue(SESSION_KEYS.LAST_ACTIVITY_AT, String(now));

    if (sessionStarted === null) {
      // New session
      this.setSessionValue(SESSION_KEYS.SESSION_STARTED_AT, String(now));
      this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'welcome');
    }

    // Send welcome message with session state
    const welcomeResponse: AgentResponse = {
      component: {
        type: 'TextMessage',
        props: {
          content: isResuming
            ? "Welcome back! Let's continue building your Brand DNA profile."
            : "Hi! I'm your Brand DNA Agent. I'll help you capture your authentic brand voice. Ready to get started?",
          variant: 'agent',
        },
      },
      sessionState: {
        currentStep: currentStep ?? 'welcome',
        progress: this.calculateProgress(currentStep ?? 'welcome'),
      },
    };

    connection.send(JSON.stringify(welcomeResponse));

    // Log connection event
    this.addToHistory('agent', welcomeResponse.component.props.content as string, 'TextMessage');

    // Story 1.5-1-6: Restore conversation history
    if (isResuming) {
      const history = this.getHistory();
      if (history.length > 0) {
        const historyResponse: AgentResponse = {
          component: {
            type: 'HistoryBatch',
            props: {
              messages: history
            }
          }
        };
        connection.send(JSON.stringify(historyResponse));
      }
    }
  }

  /**
   * Handle incoming WebSocket message
   * AC4: Rate limiting (30 messages per minute)
   */
  async onMessage(connection: Connection, message: string): Promise<void> {
    const now = Date.now();

    // Rate limiting check
    const rateLimitResult = this.checkRateLimit(connection.id, now);
    if (!rateLimitResult.allowed) {
      const errorResponse: AgentResponse = {
        component: {
          type: 'Error',
          props: {
            error: 'rate_limited',
            retry_after: rateLimitResult.retryAfter,
            message: `Too many messages. Please wait ${rateLimitResult.retryAfter} seconds.`,
          },
        },
      };
      connection.send(JSON.stringify(errorResponse));
      console.warn(`Rate limited connection ${connection.id}: ${rateLimitResult.retryAfter}s cooldown`);
      return;
    }

    // Update last activity
    this.setSessionValue(SESSION_KEYS.LAST_ACTIVITY_AT, String(now));

    // Parse message
    let clientMessage: ClientMessage;
    try {
      clientMessage = JSON.parse(message) as ClientMessage;
    } catch {
      const errorResponse: AgentResponse = {
        component: {
          type: 'Error',
          props: {
            error: 'invalid_message',
            message: 'Could not parse message. Please send valid JSON.',
          },
        },
      };
      connection.send(JSON.stringify(errorResponse));
      return;
    }

    // Handle message types
    switch (clientMessage.type) {
      case 'ping':
        connection.send(JSON.stringify({ type: 'pong', timestamp: now }));
        break;

      case 'voice_sample':
        await this.handleVoiceSample(connection, clientMessage);
        break;

      case 'text_input':
        await this.handleTextInput(connection, clientMessage);
        break;

      case 'action':
        await this.handleAction(connection, clientMessage);
        break;

      default: {
        const errorResponse: AgentResponse = {
          component: {
            type: 'Error',
            props: {
              error: 'unknown_message_type',
              message: `Unknown message type: ${clientMessage.type}`,
            },
          },
          requestId: clientMessage.requestId,
        };
        connection.send(JSON.stringify(errorResponse));
      }
    }
  }

  /**
   * Handle WebSocket close
   */
  async onClose(_connection: Connection, _code: number, _reason: string): Promise<void> {
    // Persist session state for potential reconnection
    this.setSessionValue(SESSION_KEYS.LAST_ACTIVITY_AT, String(Date.now()));
  }

  /**
   * Handle WebSocket error
   * Note: This can be called with 1 or 2 arguments depending on whether
   * it's a connection-specific error or a general error
   */
  async onError(connection: Connection | unknown, error?: unknown): Promise<void> {
    // Handle both signatures: (connection, error) and (error)
    if (error === undefined) {
      // Called with single argument (general error)
      console.error('WebSocket general error:', connection);
    } else {
      // Called with two arguments (connection-specific error)
      const conn = connection as Connection;
      console.error(`WebSocket error for connection ${conn.id}:`, error);
    }
  }

  // =====================================
  // Message Handlers
  // =====================================

  private async handleVoiceSample(connection: Connection, message: ClientMessage): Promise<void> {
    const payload = message.payload as { r2Key?: string; transcript?: string; durationMs?: number } | undefined;
    const now = Date.now();

    // Store voice sample
    const r2Key = payload?.r2Key ?? null;
    const transcript = payload?.transcript ?? null;
    const durationMs = payload?.durationMs ?? null;

    this.sql`
      INSERT INTO voice_samples (r2_key, transcript, duration_ms, created_at)
      VALUES (${r2Key}, ${transcript}, ${durationMs}, ${now})
    `;

    // Log user contribution
    this.addToHistory('user', transcript ?? '[Voice sample received]', undefined);

    const currentStep = this.getSessionValue(SESSION_KEYS.CURRENT_STEP) ?? 'voice_capture';
    const response: AgentResponse = {
      component: {
        type: 'TextMessage',
        props: {
          content: 'Voice sample received! Processing your brand voice...',
          variant: 'agent',
        },
      },
      sessionState: {
        currentStep,
        progress: this.calculateProgress('voice_capture'),
      },
      requestId: message.requestId,
    };

    connection.send(JSON.stringify(response));
    this.addToHistory('agent', response.component.props.content as string, 'TextMessage');
  }

  private async handleTextInput(connection: Connection, message: ClientMessage): Promise<void> {
    const payload = message.payload as { text?: string } | undefined;
    const text = (payload?.text ?? '').trim();

    // Story 1.5-1-7: Text-only BrandDNA Path validation (200-5000 chars)
    if (text.length < 200 || text.length > 5000) {
      const errorResponse: AgentResponse = {
        component: {
          type: 'Error',
          props: {
            error: 'invalid_text_length',
            message: text.length < 200 
              ? `Description is too short. Please provide at least 200 characters (you provided ${text.length}).`
              : `Description is too long. Please keep it under 5000 characters (you provided ${text.length}).`,
          },
        },
        requestId: message.requestId,
      };
      connection.send(JSON.stringify(errorResponse));
      return;
    }

    // Log user input
    this.addToHistory('user', text, undefined);

    const currentStep = this.getSessionValue(SESSION_KEYS.CURRENT_STEP) ?? 'text_input';
    const response: AgentResponse = {
      component: {
        type: 'TextMessage',
        props: {
          content: `Thanks for sharing! Your input helps build a stronger Brand DNA profile.`,
          variant: 'agent',
        },
      },
      sessionState: {
        currentStep,
        progress: this.calculateProgress('text_input'),
      },
      requestId: message.requestId,
    };

    connection.send(JSON.stringify(response));
    this.addToHistory('agent', response.component.props.content as string, 'TextMessage');
  }

  private async handleAction(connection: Connection, message: ClientMessage): Promise<void> {
    const payload = message.payload as { action?: string; data?: unknown } | undefined;
    const action = payload?.action;

    switch (action) {
      case 'start_express':
        this.setSessionValue(SESSION_KEYS.IS_EXPRESS, 'true');
        await this.advanceStep(connection, message.requestId);
        break;

      case 'start_full':
        this.setSessionValue(SESSION_KEYS.IS_EXPRESS, 'false');
        await this.advanceStep(connection, message.requestId);
        break;

      case 'next_step':
        await this.advanceStep(connection, message.requestId);
        break;

      case 'get_state':
        await this.sendCurrentState(connection, message.requestId);
        break;

      case 'reset_session':
        await this.resetSession(connection, message.requestId);
        break;

      // Story 1.5-3: Sync generated pillars from backend
      case 'sync_pillars': {
        const pillarsData = payload?.data as Record<string, unknown>; // { pillars: [...] }
        if (pillarsData) {
          this.setSessionValue(SESSION_KEYS.PILLARS, JSON.stringify(pillarsData));

          // Auto-advance to pillars step if not already there
          const currentStep = this.getSessionValue(SESSION_KEYS.CURRENT_STEP);
          if (currentStep !== 'pillars' && currentStep !== 'complete') {
            this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'pillars');
          }

          // Broadcast update
          const response: AgentResponse = {
            component: {
              type: 'PillarCard', // Or a new type 'PillarProposal'
              props: { pillars: pillarsData }
            },
            sessionState: {
              currentStep: 'pillars',
              progress: this.calculateProgress('pillars')
            }
          };
          connection.send(JSON.stringify(response));
        }
        break;
      }

      // Story 1.5-4-6: Update generation progress via WebSocket
      case 'update_generation_progress': {
        const progressData = payload?.data as { generated: number; total: number; hubId: string };
        if (progressData) {
          const response: AgentResponse = {
            component: {
              type: 'ProgressIndicator',
              props: {
                phase: 'generation',
                generated: progressData.generated,
                total: progressData.total,
                hubId: progressData.hubId,
                progress: Math.round((progressData.generated / progressData.total) * 100),
              },
            },
          };
          // Broadcast to all connections for this client
          this.broadcast(JSON.stringify(response));
        }
        break;
      }

      default: {
        const errorResponse: AgentResponse = {
          component: {
            type: 'Error',
            props: {
              error: 'unknown_action',
              message: `Unknown action: ${action}`,
            },
          },
          requestId: message.requestId,
        };
        connection.send(JSON.stringify(errorResponse));
      }
    }
  }

  // =====================================
  // Session Management
  // =====================================

  private async advanceStep(connection: Connection, requestId?: string): Promise<void> {
    const currentStep = this.getSessionValue(SESSION_KEYS.CURRENT_STEP) ?? 'welcome';
    const isExpress = this.getSessionValue(SESSION_KEYS.IS_EXPRESS) === 'true';

    const fullSteps = ['welcome', 'voice_capture', 'personality', 'audience', 'pillars', 'complete'] as const;
    const expressSteps = ['welcome', 'express_what', 'express_tone', 'express_platform', 'complete'] as const;
    type FullStep = typeof fullSteps[number];
    type ExpressStep = typeof expressSteps[number];

    const steps = isExpress ? expressSteps : fullSteps;
    const currentIndex = steps.indexOf(currentStep as FullStep & ExpressStep);
    const nextStepIndex = Math.min(Math.max(0, currentIndex + 1), steps.length - 1);
    const nextStep: string = steps[nextStepIndex] ?? 'welcome';

    this.setSessionValue(SESSION_KEYS.CURRENT_STEP, nextStep);

    const response: AgentResponse = {
      component: {
        type: (nextStep === 'express_what' || nextStep === 'express_tone' || nextStep === 'express_platform') 
          ? 'QuestionCard' 
          : 'ProgressIndicator',
        props: {
          currentStep: nextStep,
          totalSteps: steps.length,
          stepIndex: nextStepIndex,
          isExpress,
        },
      },
      sessionState: {
        currentStep: nextStep,
        progress: this.calculateProgress(nextStep),
      },
      requestId,
    };

    connection.send(JSON.stringify(response));
  }

  private async sendCurrentState(connection: Connection, requestId?: string): Promise<void> {
    const currentStep = this.getSessionValue(SESSION_KEYS.CURRENT_STEP) ?? 'welcome';

    const response: AgentResponse = {
      component: {
        type: 'ProgressIndicator',
        props: {
          currentStep,
          progress: this.calculateProgress(currentStep),
        },
      },
      sessionState: {
        currentStep,
        progress: this.calculateProgress(currentStep),
      },
      requestId,
    };

    connection.send(JSON.stringify(response));
  }

  private async resetSession(connection: Connection, requestId?: string): Promise<void> {
    // Clear session state
    this.sql`DELETE FROM session_state`;
    this.sql`DELETE FROM conversation_history`;
    this.sql`DELETE FROM voice_samples`;

    // Re-initialize
    const now = Date.now();
    this.setSessionValue(SESSION_KEYS.SESSION_STARTED_AT, String(now));
    this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'welcome');
    this.setSessionValue(SESSION_KEYS.LAST_ACTIVITY_AT, String(now));

    const response: AgentResponse = {
      component: {
        type: 'TextMessage',
        props: {
          content: "Session reset. Let's start fresh with your Brand DNA profile!",
          variant: 'agent',
        },
      },
      sessionState: {
        currentStep: 'welcome',
        progress: 0,
      },
      requestId,
    };

    connection.send(JSON.stringify(response));
  }

  // =====================================
  // Helpers
  // =====================================

  /**
   * Check rate limit for a connection
   * AC4: 30 messages per minute max (Persisted in SQLite)
   */
  private checkRateLimit(connectionId: string, now: number): { allowed: boolean; retryAfter: number } {
    // Clean up old entries periodically (lazy cleanup)
    if (Math.random() < 0.01) { // 1% chance
      const cleanupThreshold = now - RATE_LIMIT_WINDOW_MS;
      this.sql`DELETE FROM rate_limits WHERE updated_at < ${cleanupThreshold}`;
    }

    // Get current rate limit state
    const result = this.sql<{ timestamps: string }>`
      SELECT timestamps FROM rate_limits WHERE connection_id = ${connectionId}
    `;
    
    let timestamps: number[] = [];
    if (result.length > 0 && result[0]) {
      try {
        timestamps = JSON.parse(result[0].timestamps);
      } catch {
        timestamps = [];
      }
    }

    // Remove timestamps older than the rate limit window
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    timestamps = timestamps.filter(ts => ts > windowStart);

    if (timestamps.length >= RATE_LIMIT_MAX_MESSAGES) {
      // Calculate retry time based on oldest message in window
      const oldestTimestamp = timestamps[0];
      if (oldestTimestamp !== undefined) {
        const retryAfter = Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW_MS - now) / 1000);
        return { allowed: false, retryAfter: Math.max(1, retryAfter) };
      }
      return { allowed: false, retryAfter: 60 };
    }

    // Record this message
    timestamps.push(now);
    
    // Save updated state
    this.sql`
      INSERT OR REPLACE INTO rate_limits (connection_id, timestamps, updated_at)
      VALUES (${connectionId}, ${JSON.stringify(timestamps)}, ${now})
    `;
    
    return { allowed: true, retryAfter: 0 };
  }

  /**
   * Get session value from SQLite
   */
  private getSessionValue(key: string): string | null {
    const results = this.sql<SessionStateRow>`
      SELECT value FROM session_state WHERE key = ${key}
    `;
    const firstResult = results[0];
    return firstResult?.value ?? null;
  }

  /**
   * Set session value in SQLite
   * AC5: Hibernation handling - all state persisted to SQLite
   */
  private setSessionValue(key: string, value: string): void {
    const now = Date.now();
    this.sql`
      INSERT OR REPLACE INTO session_state (key, value, updated_at)
      VALUES (${key}, ${value}, ${now})
    `;
  }

  /**
   * Add entry to conversation history
   */
  private addToHistory(role: 'user' | 'agent', content: string, componentType: string | undefined): void {
    const now = Date.now();
    const compType = componentType ?? null;
    this.sql`
      INSERT INTO conversation_history (role, content, component_type, created_at)
      VALUES (${role}, ${content}, ${compType}, ${now})
    `;
  }

  /**
   * Retrieve conversation history
   */
  private getHistory(limit: number = 50): Array<{ role: string; content: string; componentType: string; createdAt: number }> {
    const results = this.sql<{ role: string; content: string; component_type: string; created_at: number }>`
      SELECT role, content, component_type, created_at
      FROM conversation_history
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    
    return results.reverse().map(row => ({
      role: row.role,
      content: row.content,
      componentType: row.component_type,
      createdAt: row.created_at
    }));
  }

  /**
   * Calculate progress percentage based on current step
   */
  private calculateProgress(step: string): number {
    const isExpress = this.getSessionValue(SESSION_KEYS.IS_EXPRESS) === 'true';
    const fullSteps = ['welcome', 'voice_capture', 'personality', 'audience', 'pillars', 'complete'];
    const expressSteps = ['welcome', 'express_what', 'express_tone', 'express_platform', 'complete'];
    
    const steps = isExpress ? expressSteps : fullSteps;
    const index = steps.indexOf(step);
    if (index === -1) return 0;
    return Math.round((index / (steps.length - 1)) * 100);
  }
}
