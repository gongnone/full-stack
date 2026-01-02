/**
 * BrandDNA Agent Durable Object
 *
 * Stateful AI agent for collecting brand voice data through agentic conversation.
 * Uses Cloudflare Agent SDK with WebSocket support and SQLite persistence.
 *
 * PRD 1.5 Implementation:
 * - FR-1.5.1: Voice Capture & Analysis (Whisper)
 * - FR-1.5.2: Audience Deep Dive (dynamic questions)
 * - FR-1.5.3: Competitor Analysis Input
 * - FR-1.5.4: Platform Prioritization
 * - FR-1.5.5: Topic Pillar Proposal
 * - FR-1.5.6: Brand DNA Report
 */

import { Agent, type Connection, type ConnectionContext } from 'agents';

// Environment bindings available to the Agent
interface AgentEnv {
  AI: Ai;
  CONTENT_ENGINE: Fetcher;
  MEDIA: R2Bucket;
  EMBEDDINGS: VectorizeIndex;
}

// Session state keys stored in SQLite
const SESSION_KEYS = {
  CURRENT_STEP: 'current_step',
  IS_EXPRESS: 'is_express',
  CLIENT_ID: 'client_id',
  VOICE_SAMPLES: 'voice_samples',
  BRAND_DESCRIPTION: 'brand_description',
  BRAND_PERSONALITY: 'brand_personality',
  AUDIENCE_DATA: 'audience_data',
  AUDIENCE_ANSWERS: 'audience_answers',
  PLATFORM_STRATEGY: 'platform_strategy',
  COMPETITORS: 'competitors',
  PILLARS: 'pillars',
  SESSION_STARTED_AT: 'session_started_at',
  LAST_ACTIVITY_AT: 'last_activity_at',
  CURRENT_QUESTION_INDEX: 'current_question_index',
} as const;

// Step definitions for full and express paths
const FULL_STEPS = [
  'welcome',
  'voice_capture',
  'brand_description',
  'audience_questions',
  'platform_selection',
  'competitor_input',
  'pillar_proposal',
  'review',
  'complete',
] as const;

const EXPRESS_STEPS = [
  'welcome',
  'voice_capture',  // FR-1.5.1: Voice capture is P0 for ALL paths
  'express_brand',
  'express_audience',
  'express_platform',
  'complete',
] as const;

// Rate limiting constants
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_MESSAGES = 30;
const SESSION_RECONNECT_TIMEOUT_MS = 30 * 60 * 1000;

// Audience deep-dive questions (FR-1.5.2)
const AUDIENCE_QUESTIONS = [
  {
    id: 'demographics',
    question: "Who is your ideal customer? Describe their age range, profession, and lifestyle.",
    followUp: "Great! What's their typical income level and education background?",
  },
  {
    id: 'pain_points',
    question: "What are the biggest challenges or frustrations your ideal customer faces?",
    followUp: "How do these problems affect their daily life or business?",
  },
  {
    id: 'aspirations',
    question: "What does success look like for your ideal customer? What are they trying to achieve?",
    followUp: "What would make them feel truly fulfilled?",
  },
  {
    id: 'content_habits',
    question: "Where does your ideal customer spend time online? What content do they consume?",
    followUp: "What type of content do they engage with most - videos, articles, podcasts?",
  },
  {
    id: 'decision_factors',
    question: "What factors influence their buying decisions? What do they value most?",
    followUp: "What would make them choose you over a competitor?",
  },
];

// Platform options for recommendation (FR-1.5.4)
const PLATFORM_OPTIONS = [
  { id: 'linkedin', name: 'LinkedIn', bestFor: 'B2B, professional insights, thought leadership' },
  { id: 'twitter', name: 'Twitter/X', bestFor: 'Quick takes, news, community building' },
  { id: 'instagram', name: 'Instagram', bestFor: 'Visual storytelling, lifestyle brands' },
  { id: 'tiktok', name: 'TikTok', bestFor: 'Short-form video, younger audiences' },
  { id: 'youtube', name: 'YouTube', bestFor: 'Long-form video, tutorials, deep dives' },
  { id: 'threads', name: 'Threads', bestFor: 'Conversational content, community' },
  { id: 'newsletter', name: 'Newsletter', bestFor: 'Deep relationships, owned audience' },
];

// Message types from client
interface ClientMessage {
  type: 'voice_sample' | 'text_input' | 'action' | 'ping' | 'selection';
  payload?: unknown;
  requestId?: string;
}

// Structured response component
interface ResponseComponent {
  type:
    | 'TextMessage'
    | 'VoiceRecorder'
    | 'QuestionCard'
    | 'ProgressIndicator'
    | 'PlatformSelector'
    | 'PillarProposal'
    | 'PersonaCard'
    | 'BrandDNAReport'
    | 'ButtonChoice'
    | 'Error'
    | 'HistoryBatch';
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
 * Implements PRD 1.5 agentic conversation flow.
 */
export class BrandDNAAgent extends Agent<AgentEnv> {
  private clientId: string | null = null;

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
        analyzed BOOLEAN DEFAULT FALSE,
        created_at INTEGER NOT NULL
      )
    `;

    // Create audience answers table
    this.sql`
      CREATE TABLE IF NOT EXISTS audience_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `;

    // Create rate limits table
    this.sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        connection_id TEXT PRIMARY KEY,
        timestamps TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;

    // Load client ID from session if exists
    this.clientId = this.getSessionValue(SESSION_KEYS.CLIENT_ID);
  }

  /**
   * Handle new WebSocket connection
   */
  async onConnect(connection: Connection, ctx: ConnectionContext): Promise<void> {
    const now = Date.now();

    // Extract client ID from URL path
    const url = new URL(ctx.request.url);
    const pathParts = url.pathname.split('/');
    const clientIdFromPath = pathParts[pathParts.length - 1];

    if (clientIdFromPath && clientIdFromPath !== 'brand-dna') {
      this.clientId = clientIdFromPath;
      this.setSessionValue(SESSION_KEYS.CLIENT_ID, clientIdFromPath);
    }

    // Check for existing session
    const lastActivity = this.getSessionValue(SESSION_KEYS.LAST_ACTIVITY_AT);
    const sessionStarted = this.getSessionValue(SESSION_KEYS.SESSION_STARTED_AT);
    const currentStep = this.getSessionValue(SESSION_KEYS.CURRENT_STEP);

    const isResuming = lastActivity !== null &&
      (now - Number(lastActivity)) < SESSION_RECONNECT_TIMEOUT_MS &&
      currentStep !== null;

    this.setSessionValue(SESSION_KEYS.LAST_ACTIVITY_AT, String(now));

    if (sessionStarted === null) {
      this.setSessionValue(SESSION_KEYS.SESSION_STARTED_AT, String(now));
      this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'welcome');
    }

    // Send welcome with path choice
    const welcomeResponse: AgentResponse = {
      component: {
        type: 'TextMessage',
        props: {
          content: isResuming
            ? "Welcome back! Let's continue building your Brand DNA profile."
            : "Hi! I'm your Brand DNA Agent. I'll help you capture your authentic brand voice and build a content strategy that resonates with your audience. How would you like to proceed?",
          variant: 'agent',
        },
      },
      sessionState: {
        currentStep: currentStep ?? 'welcome',
        progress: this.calculateProgress(currentStep ?? 'welcome'),
      },
    };

    connection.send(JSON.stringify(welcomeResponse));
    this.addToHistory('agent', welcomeResponse.component.props.content as string, 'TextMessage');

    // Send path choice if new session
    if (!isResuming || currentStep === 'welcome') {
      const choiceResponse: AgentResponse = {
        component: {
          type: 'ButtonChoice',
          props: {
            prompt: 'Choose your path:',
            choices: [
              {
                id: 'full',
                label: 'Full Brand Discovery',
                description: '10-15 minutes for comprehensive brand DNA',
                icon: 'sparkles',
              },
              {
                id: 'express',
                label: 'Express Setup',
                description: '2-3 minutes for quick start',
                icon: 'zap',
              },
            ],
          },
        },
      };
      connection.send(JSON.stringify(choiceResponse));
    }

    // Restore history if resuming
    if (isResuming) {
      const history = this.getHistory();
      if (history.length > 0) {
        const historyResponse: AgentResponse = {
          component: {
            type: 'HistoryBatch',
            props: { messages: history },
          },
        };
        connection.send(JSON.stringify(historyResponse));
      }
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  async onMessage(connection: Connection, message: string): Promise<void> {
    const now = Date.now();

    // Rate limiting
    const rateLimitResult = this.checkRateLimit(connection.id, now);
    if (!rateLimitResult.allowed) {
      this.sendError(connection, 'rate_limited',
        `Too many messages. Please wait ${rateLimitResult.retryAfter} seconds.`,
        rateLimitResult.retryAfter);
      return;
    }

    this.setSessionValue(SESSION_KEYS.LAST_ACTIVITY_AT, String(now));

    let clientMessage: ClientMessage;
    try {
      clientMessage = JSON.parse(message) as ClientMessage;
    } catch {
      this.sendError(connection, 'invalid_message', 'Could not parse message. Please send valid JSON.');
      return;
    }

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

      case 'selection':
        await this.handleSelection(connection, clientMessage);
        break;

      case 'action':
        await this.handleAction(connection, clientMessage);
        break;

      default:
        this.sendError(connection, 'unknown_message_type', `Unknown message type: ${clientMessage.type}`);
    }
  }

  async onClose(_connection: Connection, _code: number, _reason: string): Promise<void> {
    this.setSessionValue(SESSION_KEYS.LAST_ACTIVITY_AT, String(Date.now()));
  }

  async onError(connection: Connection | unknown, error?: unknown): Promise<void> {
    if (error === undefined) {
      console.error('WebSocket general error:', connection);
    } else {
      const conn = connection as Connection;
      console.error(`WebSocket error for connection ${conn.id}:`, error);
    }
  }

  // =====================================
  // Message Handlers
  // =====================================

  /**
   * Handle voice sample upload with Whisper transcription (FR-1.5.1)
   */
  private async handleVoiceSample(connection: Connection, message: ClientMessage): Promise<void> {
    const payload = message.payload as { r2Key?: string; audioData?: ArrayBuffer; durationMs?: number; transcript?: string } | undefined;
    const now = Date.now();

    let transcript = payload?.transcript || '';
    let r2Key = payload?.r2Key;

    // Send processing message immediately
    this.sendTextMessage(connection, "Got it! Processing your voice recording...", message.requestId);

    // If we have r2Key but no transcript, fetch from R2 and transcribe
    if (r2Key && !transcript && this.env.MEDIA && this.env.AI) {
      try {
        console.log(`[BrandDNAAgent] Fetching audio from R2: ${r2Key}`);
        const audioObject = await this.env.MEDIA.get(r2Key);

        if (audioObject) {
          const audioBuffer = await audioObject.arrayBuffer();
          console.log(`[BrandDNAAgent] Audio fetched, size: ${audioBuffer.byteLength} bytes`);

          // Transcribe using Whisper
          const whisperResult = await this.env.AI.run('@cf/openai/whisper', {
            audio: new Uint8Array(audioBuffer),
          }) as { text: string };

          transcript = whisperResult.text || '';
          console.log(`[BrandDNAAgent] Transcription complete: ${transcript.substring(0, 100)}...`);
        } else {
          console.error(`[BrandDNAAgent] Audio not found in R2: ${r2Key}`);
          this.sendError(connection, 'audio_not_found',
            'Could not find your recording. Please try again.');
          return;
        }
      } catch (error) {
        console.error('[BrandDNAAgent] R2 fetch/transcription failed:', error);
        this.sendError(connection, 'transcription_failed',
          'Voice transcription failed. Please try recording again or use text input.');
        return;
      }
    }
    // If we have audioData directly (legacy path), transcribe it
    else if (payload?.audioData && this.env.AI) {
      try {
        // Transcribe using Whisper
        const whisperResult = await this.env.AI.run('@cf/openai/whisper', {
          audio: new Uint8Array(payload.audioData as ArrayBuffer),
        }) as { text: string };

        transcript = whisperResult.text || '';

        // Store audio in R2 if not already stored
        if (!r2Key && this.clientId && this.env.MEDIA) {
          r2Key = `voice-samples/${this.clientId}/${crypto.randomUUID()}.webm`;
          await this.env.MEDIA.put(r2Key, payload.audioData);
        }
      } catch (error) {
        console.error('Whisper transcription failed:', error);
        this.sendError(connection, 'transcription_failed',
          'Voice transcription failed. Please try recording again or use text input.');
        return;
      }
    }

    // Store voice sample with transcript
    this.sql`
      INSERT INTO voice_samples (r2_key, transcript, duration_ms, analyzed, created_at)
      VALUES (${r2Key ?? null}, ${transcript}, ${payload?.durationMs ?? null}, FALSE, ${now})
    `;

    this.addToHistory('user', transcript || '[Voice sample received]', undefined);

    // Analyze voice for personality markers - CRITICAL: this advances the flow
    if (transcript && this.env.AI) {
      await this.analyzeVoicePersonality(connection, transcript, message.requestId);
    } else if (!transcript) {
      // If still no transcript, inform user and offer alternatives
      console.warn('[BrandDNAAgent] No transcript available, offering alternatives');
      this.sendTextMessage(connection,
        "I couldn't transcribe your recording clearly. Could you try speaking a bit louder, or use the text input below to describe your brand voice?",
        message.requestId);
    }
  }

  /**
   * Analyze voice transcript for personality markers using AI
   */
  private async analyzeVoicePersonality(connection: Connection, transcript: string, requestId?: string): Promise<void> {
    try {
      const prompt = `Analyze this brand voice sample and extract key personality traits:

"${transcript}"

Identify:
1. Tone (e.g., professional, casual, authoritative, friendly)
2. Key vocabulary patterns
3. Communication style (e.g., direct, storytelling, educational)
4. Unique phrases or expressions

Return as JSON:
{
  "tone": "string",
  "vocabulary": ["string"],
  "style": "string",
  "uniquePhrases": ["string"],
  "summary": "one sentence summary of brand personality"
}`;

      const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      }) as { response: string };

      let personality;
      try {
        // Extract JSON from response
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        personality = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        personality = { summary: 'Voice analyzed - continuing to next step.' };
      }

      if (personality) {
        this.setSessionValue(SESSION_KEYS.BRAND_PERSONALITY, JSON.stringify(personality));

        // Determine next step based on Express vs Full path
        const isExpress = this.getSessionValue(SESSION_KEYS.IS_EXPRESS) === 'true';
        const nextStep = isExpress ? 'express_brand' : 'audience_questions';
        const nextStepMessage = isExpress
          ? "Now let's quickly capture your brand essence."
          : "Now let's understand your audience better.";

        const response: AgentResponse = {
          component: {
            type: 'TextMessage',
            props: {
              content: `Great! I detected these traits in your voice:\n\n` +
                `**Tone:** ${personality.tone || 'Authentic'}\n` +
                `**Style:** ${personality.style || 'Engaging'}\n\n` +
                `${personality.summary || 'Your unique voice is coming through clearly!'}\n\n` +
                nextStepMessage,
              variant: 'agent',
            },
          },
          sessionState: {
            currentStep: nextStep,
            progress: this.calculateProgress(nextStep),
          },
          requestId,
        };

        this.setSessionValue(SESSION_KEYS.CURRENT_STEP, nextStep);
        connection.send(JSON.stringify(response));
        this.addToHistory('agent', response.component.props.content as string, 'TextMessage');

        // Route to correct next step
        if (isExpress) {
          await this.sendExpressBrandPrompt(connection, requestId);
        } else {
          this.setSessionValue(SESSION_KEYS.CURRENT_QUESTION_INDEX, '0');
          await this.sendAudienceQuestion(connection, 0);
        }
      }
    } catch (error) {
      console.error('Voice analysis failed:', error);
      // Proceed anyway - route based on path
      const isExpress = this.getSessionValue(SESSION_KEYS.IS_EXPRESS) === 'true';
      if (isExpress) {
        this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'express_brand');
        await this.sendExpressBrandPrompt(connection);
      } else {
        this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'audience_questions');
        await this.sendAudienceQuestion(connection, 0);
      }
    }
  }

  /**
   * Handle text input responses
   */
  private async handleTextInput(connection: Connection, message: ClientMessage): Promise<void> {
    const payload = message.payload as { text?: string } | undefined;
    const text = (payload?.text ?? '').trim();
    const currentStep = this.getSessionValue(SESSION_KEYS.CURRENT_STEP) ?? 'welcome';

    this.addToHistory('user', text, undefined);

    switch (currentStep) {
      case 'brand_description':
        await this.handleBrandDescription(connection, text, message.requestId);
        break;

      case 'audience_questions':
        await this.handleAudienceAnswer(connection, text, message.requestId);
        break;

      case 'competitor_input':
        await this.handleCompetitorInput(connection, text, message.requestId);
        break;

      case 'express_brand':
        await this.handleExpressBrand(connection, text, message.requestId);
        break;

      case 'express_audience':
        await this.handleExpressAudience(connection, text, message.requestId);
        break;

      default:
        this.sendTextMessage(connection,
          "Thanks for sharing! Please use the buttons or voice recorder to proceed.",
          message.requestId);
    }
  }

  /**
   * Handle selection responses (buttons, platforms, etc.)
   */
  private async handleSelection(connection: Connection, message: ClientMessage): Promise<void> {
    const payload = message.payload as { selection?: string | string[]; type?: string } | undefined;
    const currentStep = this.getSessionValue(SESSION_KEYS.CURRENT_STEP);

    if (payload?.type === 'path') {
      const isExpress = payload.selection === 'express';
      this.setSessionValue(SESSION_KEYS.IS_EXPRESS, isExpress ? 'true' : 'false');

      // FR-1.5.1: Voice capture is P0 for BOTH paths
      // Express path uses shorter voice prompt, Full path uses comprehensive prompt
      this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'voice_capture');
      await this.sendVoiceCapturePrompt(connection, message.requestId, isExpress);
      return;
    }

    if (payload?.type === 'platforms' && currentStep === 'platform_selection') {
      await this.handlePlatformSelection(connection, payload.selection as string[], message.requestId);
      return;
    }

    if (payload?.type === 'pillar_action') {
      await this.handlePillarAction(connection, payload, message.requestId);
      return;
    }
  }

  /**
   * Handle action messages
   */
  private async handleAction(connection: Connection, message: ClientMessage): Promise<void> {
    const payload = message.payload as { action?: string; data?: unknown } | undefined;
    const action = payload?.action;

    switch (action) {
      case 'start_express':
        // FR-1.5.1: Voice capture is P0 for ALL paths
        this.setSessionValue(SESSION_KEYS.IS_EXPRESS, 'true');
        this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'voice_capture');
        await this.sendVoiceCapturePrompt(connection, message.requestId, true);
        break;

      case 'start_full':
        this.setSessionValue(SESSION_KEYS.IS_EXPRESS, 'false');
        this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'voice_capture');
        await this.sendVoiceCapturePrompt(connection, message.requestId, false);
        break;

      case 'skip_voice':
        this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'brand_description');
        await this.sendBrandDescriptionPrompt(connection, message.requestId);
        break;

      case 'next_question':
        const currentIndex = parseInt(this.getSessionValue(SESSION_KEYS.CURRENT_QUESTION_INDEX) || '0', 10);
        await this.sendAudienceQuestion(connection, currentIndex + 1);
        break;

      case 'generate_pillars':
        await this.generatePillars(connection, message.requestId);
        break;

      case 'complete_session':
        await this.completeSession(connection, message.requestId);
        break;

      case 'get_state':
        await this.sendCurrentState(connection, message.requestId);
        break;

      case 'reset_session':
        await this.resetSession(connection, message.requestId);
        break;

      case 'sync_pillars':
        const pillarsData = payload?.data as Record<string, unknown>;
        if (pillarsData) {
          this.setSessionValue(SESSION_KEYS.PILLARS, JSON.stringify(pillarsData));
          const response: AgentResponse = {
            component: {
              type: 'PillarProposal',
              props: { pillars: pillarsData },
            },
            sessionState: {
              currentStep: 'pillar_proposal',
              progress: this.calculateProgress('pillar_proposal'),
            },
          };
          connection.send(JSON.stringify(response));
        }
        break;

      default:
        this.sendError(connection, 'unknown_action', `Unknown action: ${action}`);
    }
  }

  // =====================================
  // Flow Step Handlers
  // =====================================

  private async sendVoiceCapturePrompt(connection: Connection, requestId?: string, isExpress: boolean = false): Promise<void> {
    // FR-1.5.1a: Users can record a 2-minute voice note (P0 for ALL paths)
    // Express path uses a shorter, more focused prompt
    const prompt = isExpress
      ? "Quick voice intro: In 30-60 seconds, tell me what your brand does and who you help. Speak naturally!"
      : "Tell me about your brand in your own words. What makes you unique? What do you stand for? Speak naturally - I'm listening for your authentic voice.";

    const maxDuration = isExpress ? 60 : 120;

    const response: AgentResponse = {
      component: {
        type: 'VoiceRecorder',
        props: {
          prompt,
          maxDuration,
          skipOption: true,
          skipText: "I'd rather type",
        },
      },
      sessionState: {
        currentStep: 'voice_capture',
        progress: this.calculateProgress('voice_capture'),
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', prompt, 'VoiceRecorder');
  }

  private async sendBrandDescriptionPrompt(connection: Connection, requestId?: string): Promise<void> {
    const response: AgentResponse = {
      component: {
        type: 'QuestionCard',
        props: {
          question: "Describe your brand in 200-500 words. What makes you unique? What do you stand for? What's your story?",
          placeholder: "My brand is all about...",
          minLength: 200,
          maxLength: 5000,
        },
      },
      sessionState: {
        currentStep: 'brand_description',
        progress: this.calculateProgress('brand_description'),
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', response.component.props.question as string, 'QuestionCard');
  }

  private async handleBrandDescription(connection: Connection, text: string, requestId?: string): Promise<void> {
    if (text.length < 100) {
      this.sendError(connection, 'too_short',
        `Please provide more detail about your brand (at least 100 characters). You provided ${text.length}.`);
      return;
    }

    this.setSessionValue(SESSION_KEYS.BRAND_DESCRIPTION, text);

    // Analyze for personality if AI available
    if (this.env.AI) {
      await this.analyzeVoicePersonality(connection, text, requestId);
    } else {
      // Route based on Express vs Full path
      const isExpress = this.getSessionValue(SESSION_KEYS.IS_EXPRESS) === 'true';
      if (isExpress) {
        this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'express_brand');
        await this.sendExpressBrandPrompt(connection, requestId);
      } else {
        this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'audience_questions');
        this.setSessionValue(SESSION_KEYS.CURRENT_QUESTION_INDEX, '0');
        await this.sendAudienceQuestion(connection, 0);
      }
    }
  }

  private async sendAudienceQuestion(connection: Connection, index: number): Promise<void> {
    if (index >= AUDIENCE_QUESTIONS.length) {
      // All questions answered, move to platform selection
      this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'platform_selection');
      await this.sendPlatformSelection(connection);
      return;
    }

    const question = AUDIENCE_QUESTIONS[index];
    if (!question) return;

    this.setSessionValue(SESSION_KEYS.CURRENT_QUESTION_INDEX, String(index));

    const response: AgentResponse = {
      component: {
        type: 'QuestionCard',
        props: {
          question: question.question,
          questionId: question.id,
          questionIndex: index + 1,
          totalQuestions: AUDIENCE_QUESTIONS.length,
          placeholder: "Type your answer here...",
        },
      },
      sessionState: {
        currentStep: 'audience_questions',
        progress: this.calculateProgress('audience_questions'),
      },
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', question.question, 'QuestionCard');
  }

  private async handleAudienceAnswer(connection: Connection, text: string, requestId?: string): Promise<void> {
    const currentIndex = parseInt(this.getSessionValue(SESSION_KEYS.CURRENT_QUESTION_INDEX) || '0', 10);
    const question = AUDIENCE_QUESTIONS[currentIndex];

    if (question) {
      // Store the answer
      const now = Date.now();
      this.sql`
        INSERT INTO audience_answers (question_id, answer, created_at)
        VALUES (${question.id}, ${text}, ${now})
      `;

      // Update session answers
      const existingAnswers = JSON.parse(this.getSessionValue(SESSION_KEYS.AUDIENCE_ANSWERS) || '{}');
      existingAnswers[question.id] = text;
      this.setSessionValue(SESSION_KEYS.AUDIENCE_ANSWERS, JSON.stringify(existingAnswers));
    }

    // Send acknowledgment and next question
    this.sendTextMessage(connection, "Great insight! Let me ask you another question.", requestId);
    await this.sendAudienceQuestion(connection, currentIndex + 1);
  }

  private async sendPlatformSelection(connection: Connection, requestId?: string): Promise<void> {
    // Generate AI recommendations based on audience data
    let recommendations = PLATFORM_OPTIONS.slice(0, 3);

    if (this.env.AI) {
      try {
        const audienceData = this.getSessionValue(SESSION_KEYS.AUDIENCE_ANSWERS);
        const personality = this.getSessionValue(SESSION_KEYS.BRAND_PERSONALITY);

        const prompt = `Based on this brand and audience data, recommend the best 3 social media platforms:

Brand Personality: ${personality || 'Not analyzed'}
Audience Data: ${audienceData || 'General business audience'}

Available platforms: ${PLATFORM_OPTIONS.map(p => `${p.id} (${p.bestFor})`).join(', ')}

Return JSON array of exactly 3 platform IDs with rationale:
[{"id": "platform_id", "rationale": "why this platform"}]`;

        const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
        }) as { response: string };

        try {
          const jsonMatch = result.response.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const recs = JSON.parse(jsonMatch[0]) as Array<{ id: string; rationale: string }>;
            recommendations = recs.map(r => ({
              ...PLATFORM_OPTIONS.find(p => p.id === r.id) || PLATFORM_OPTIONS[0]!,
              rationale: r.rationale,
            })).filter(Boolean);
          }
        } catch {
          // Use defaults
        }
      } catch (error) {
        console.error('Platform recommendation failed:', error);
      }
    }

    const response: AgentResponse = {
      component: {
        type: 'PlatformSelector',
        props: {
          prompt: "Based on your audience, I recommend these platforms. Select 2-3 to focus on:",
          recommended: recommendations,
          allPlatforms: PLATFORM_OPTIONS,
          minSelection: 2,
          maxSelection: 4,
        },
      },
      sessionState: {
        currentStep: 'platform_selection',
        progress: this.calculateProgress('platform_selection'),
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', response.component.props.prompt as string, 'PlatformSelector');
  }

  private async handlePlatformSelection(connection: Connection, platforms: string[], requestId?: string): Promise<void> {
    if (platforms.length < 2) {
      this.sendError(connection, 'too_few_platforms', 'Please select at least 2 platforms.');
      return;
    }

    this.setSessionValue(SESSION_KEYS.PLATFORM_STRATEGY, JSON.stringify(platforms));
    this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'competitor_input');

    const response: AgentResponse = {
      component: {
        type: 'QuestionCard',
        props: {
          question: "Who are 2-3 competitors or brands you admire in your space? This helps me understand your positioning. (You can skip if unsure)",
          placeholder: "e.g., Nike, Apple, or specific industry leaders...",
          skipOption: true,
        },
      },
      sessionState: {
        currentStep: 'competitor_input',
        progress: this.calculateProgress('competitor_input'),
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', response.component.props.question as string, 'QuestionCard');
  }

  private async handleCompetitorInput(connection: Connection, text: string, requestId?: string): Promise<void> {
    this.setSessionValue(SESSION_KEYS.COMPETITORS, text);
    this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'pillar_proposal');

    this.sendTextMessage(connection, "Perfect! Now I'm generating your content pillars based on everything you've shared...", requestId);
    await this.generatePillars(connection, requestId);
  }

  private async generatePillars(connection: Connection, requestId?: string): Promise<void> {
    const personality = this.getSessionValue(SESSION_KEYS.BRAND_PERSONALITY);
    const description = this.getSessionValue(SESSION_KEYS.BRAND_DESCRIPTION);
    const audienceData = this.getSessionValue(SESSION_KEYS.AUDIENCE_ANSWERS);
    const platforms = this.getSessionValue(SESSION_KEYS.PLATFORM_STRATEGY);
    const competitors = this.getSessionValue(SESSION_KEYS.COMPETITORS);

    let pillars = [
      { id: '1', title: 'Core Expertise', description: 'Share your knowledge and insights', rationale: 'Establishes authority' },
      { id: '2', title: 'Behind the Scenes', description: 'Show your process and journey', rationale: 'Builds connection' },
      { id: '3', title: 'Industry Insights', description: 'Comment on trends and news', rationale: 'Shows thought leadership' },
      { id: '4', title: 'Client Success', description: 'Share wins and testimonials', rationale: 'Builds trust' },
    ];

    if (this.env.AI) {
      try {
        const prompt = `Generate 4-5 content topic pillars for a brand with these characteristics:

Brand Description: ${description || 'Not provided'}
Brand Personality: ${personality || 'Professional and authentic'}
Target Audience: ${audienceData || 'Business professionals'}
Platforms: ${platforms || 'LinkedIn, Twitter'}
Competitors: ${competitors || 'General market'}

Each pillar should follow the Brand Story Framework:
- Catalyst: Origin story or transformation
- Core Truth: Fundamental belief or value
- Proof: Evidence or results

Return JSON array:
[{
  "id": "1",
  "title": "Pillar Name",
  "description": "What this pillar covers",
  "rationale": "Why this resonates with the audience",
  "type": "catalyst|core_truth|proof"
}]`;

        const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
        }) as { response: string };

        try {
          const jsonMatch = result.response.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const generated = JSON.parse(jsonMatch[0]) as typeof pillars;
            if (generated.length >= 3) {
              pillars = generated;
            }
          }
        } catch {
          // Use defaults
        }
      } catch (error) {
        console.error('Pillar generation failed:', error);
      }
    }

    this.setSessionValue(SESSION_KEYS.PILLARS, JSON.stringify(pillars));

    const response: AgentResponse = {
      component: {
        type: 'PillarProposal',
        props: {
          prompt: "Here are your content pillars. You can approve, edit, or regenerate any of them:",
          pillars,
          allowEdit: true,
          allowRegenerate: true,
        },
      },
      sessionState: {
        currentStep: 'pillar_proposal',
        progress: this.calculateProgress('pillar_proposal'),
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', 'Generated content pillars for review', 'PillarProposal');
  }

  private async handlePillarAction(connection: Connection, payload: { selection?: string | string[]; pillarId?: string; action?: string; data?: unknown }, requestId?: string): Promise<void> {
    const action = payload.action;
    const pillarId = payload.pillarId;

    if (action === 'approve_all') {
      this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'review');
      await this.sendReviewSummary(connection, requestId);
    } else if (action === 'regenerate' && pillarId) {
      // Regenerate single pillar
      this.sendTextMessage(connection, `Regenerating pillar ${pillarId}...`, requestId);
      // For now, just acknowledge - full implementation would regenerate
    }
  }

  private async sendReviewSummary(connection: Connection, requestId?: string): Promise<void> {
    const personality = JSON.parse(this.getSessionValue(SESSION_KEYS.BRAND_PERSONALITY) || '{}');
    const platforms = JSON.parse(this.getSessionValue(SESSION_KEYS.PLATFORM_STRATEGY) || '[]');
    const pillars = JSON.parse(this.getSessionValue(SESSION_KEYS.PILLARS) || '[]');
    const audienceAnswers = JSON.parse(this.getSessionValue(SESSION_KEYS.AUDIENCE_ANSWERS) || '{}');

    const response: AgentResponse = {
      component: {
        type: 'BrandDNAReport',
        props: {
          personality: personality.summary || 'Authentic and engaging',
          tone: personality.tone || 'Professional',
          platforms: platforms,
          pillars: pillars,
          audienceSnapshot: {
            demographics: audienceAnswers.demographics || '',
            painPoints: audienceAnswers.pain_points || '',
            aspirations: audienceAnswers.aspirations || '',
          },
          strengthScore: 75, // Will be calculated properly when synced to ClientAgent
          actions: [
            { id: 'complete', label: 'Complete Setup', primary: true },
            { id: 'edit', label: 'Make Changes' },
          ],
        },
      },
      sessionState: {
        currentStep: 'review',
        progress: this.calculateProgress('review'),
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', 'Brand DNA Report generated', 'BrandDNAReport');
  }

  private async completeSession(connection: Connection, requestId?: string): Promise<void> {
    // Sync to ClientAgent via CONTENT_ENGINE
    if (this.clientId && this.env.CONTENT_ENGINE) {
      try {
        // Get raw session data
        const personality = JSON.parse(this.getSessionValue(SESSION_KEYS.BRAND_PERSONALITY) || '{}');
        const description = this.getSessionValue(SESSION_KEYS.BRAND_DESCRIPTION) || '';
        const audienceAnswers = JSON.parse(this.getSessionValue(SESSION_KEYS.AUDIENCE_ANSWERS) || '{}');
        const platforms = JSON.parse(this.getSessionValue(SESSION_KEYS.PLATFORM_STRATEGY) || '[]');
        const pillars = JSON.parse(this.getSessionValue(SESSION_KEYS.PILLARS) || '[]');
        const competitors = this.getSessionValue(SESSION_KEYS.COMPETITORS) || '';

        // Transform to ClientAgent's expected format
        // Map personality_markers and vocabulary to voiceMarkers
        const voiceMarkers: Array<{ phrase: string; source: string; confidence: number }> = [];

        if (personality.personality_markers && Array.isArray(personality.personality_markers)) {
          personality.personality_markers.forEach((marker: string) => {
            if (marker && typeof marker === 'string') {
              voiceMarkers.push({ phrase: marker, source: 'voice', confidence: 0.9 });
            }
          });
        }

        if (personality.vocabulary && Array.isArray(personality.vocabulary)) {
          personality.vocabulary.forEach((word: string) => {
            if (word && typeof word === 'string') {
              voiceMarkers.push({ phrase: word, source: 'voice', confidence: 0.8 });
            }
          });
        }

        // Convert tone string to toneProfile scores
        const toneProfile: Record<string, number> = {};
        if (personality.tone) {
          const toneLower = personality.tone.toLowerCase();
          toneProfile.formal_casual = toneLower.includes('casual') ? 75 : toneLower.includes('formal') ? 25 : 50;
          toneProfile.serious_playful = toneLower.includes('playful') ? 75 : toneLower.includes('serious') ? 25 : 50;
          toneProfile.technical_accessible = toneLower.includes('accessible') ? 75 : toneLower.includes('technical') ? 25 : 50;
          toneProfile.reserved_expressive = toneLower.includes('expressive') ? 75 : toneLower.includes('reserved') ? 25 : 50;
        }

        // Convert pillars to signature patterns
        const signaturePatterns: string[] = pillars
          .filter((p: { title?: string }) => p.title)
          .map((p: { title: string }) => p.title);

        // Convert audience data to brand stances
        const stances: Array<{ topic: string; position: string; source: string }> = [];
        if (audienceAnswers.pain_points) {
          stances.push({ topic: 'Audience Pain Points', position: audienceAnswers.pain_points, source: 'voice' });
        }
        if (audienceAnswers.aspirations) {
          stances.push({ topic: 'Audience Goals', position: audienceAnswers.aspirations, source: 'voice' });
        }
        if (description) {
          stances.push({ topic: 'Brand Mission', position: description, source: 'voice' });
        }
        if (competitors) {
          stances.push({ topic: 'Competitive Positioning', position: competitors, source: 'voice' });
        }

        const brandDNAPayload = {
          voiceMarkers,
          stances,
          signaturePatterns,
          toneProfile,
          // Also include raw data for future reference
          _rawData: { personality, description, audienceAnswers, platforms, pillars, competitors },
        };

        await this.env.CONTENT_ENGINE.fetch(
          new Request(`http://internal/api/client/${this.clientId}/rpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'updateBrandDNA',
              params: brandDNAPayload,
            }),
          })
        );

        // Trigger brand DNA analysis to calculate strength score and embeddings
        await this.env.CONTENT_ENGINE.fetch(
          new Request(`http://internal/api/client/${this.clientId}/rpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'analyzeBrandDNA',
              params: {},
            }),
          })
        );
      } catch (error) {
        console.error('Failed to sync to ClientAgent:', error);
      }
    }

    this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'complete');

    const response: AgentResponse = {
      component: {
        type: 'TextMessage',
        props: {
          content: "Congratulations! Your Brand DNA is now captured. You're ready to start creating content that truly represents your authentic voice. Your agency will be notified to help you get started.",
          variant: 'success',
        },
      },
      sessionState: {
        currentStep: 'complete',
        progress: 100,
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', response.component.props.content as string, 'TextMessage');
  }

  // =====================================
  // Express Path Handlers
  // =====================================

  private async sendExpressBrandPrompt(connection: Connection, requestId?: string): Promise<void> {
    const response: AgentResponse = {
      component: {
        type: 'QuestionCard',
        props: {
          question: "In one sentence, what does your brand do and who do you help?",
          placeholder: "e.g., I help small business owners grow their revenue through strategic marketing...",
          maxLength: 500,
        },
      },
      sessionState: {
        currentStep: 'express_brand',
        progress: this.calculateProgress('express_brand'),
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', response.component.props.question as string, 'QuestionCard');
  }

  private async handleExpressBrand(connection: Connection, text: string, requestId?: string): Promise<void> {
    this.setSessionValue(SESSION_KEYS.BRAND_DESCRIPTION, text);
    this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'express_audience');

    const response: AgentResponse = {
      component: {
        type: 'QuestionCard',
        props: {
          question: "Who is your ideal customer and what's their biggest challenge?",
          placeholder: "e.g., Marketing managers at tech startups struggling with lead generation...",
          maxLength: 500,
        },
      },
      sessionState: {
        currentStep: 'express_audience',
        progress: this.calculateProgress('express_audience'),
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', response.component.props.question as string, 'QuestionCard');
  }

  private async handleExpressAudience(connection: Connection, text: string, requestId?: string): Promise<void> {
    this.setSessionValue(SESSION_KEYS.AUDIENCE_ANSWERS, JSON.stringify({ express: text }));
    this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'express_platform');

    const response: AgentResponse = {
      component: {
        type: 'PlatformSelector',
        props: {
          prompt: "Which platforms do you want to focus on? Pick 2-3:",
          allPlatforms: PLATFORM_OPTIONS,
          minSelection: 2,
          maxSelection: 3,
          compact: true,
        },
      },
      sessionState: {
        currentStep: 'express_platform',
        progress: this.calculateProgress('express_platform'),
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
  }

  // =====================================
  // Helper Methods
  // =====================================

  private sendTextMessage(connection: Connection, content: string, requestId?: string): void {
    const response: AgentResponse = {
      component: {
        type: 'TextMessage',
        props: { content, variant: 'agent' },
      },
      requestId,
    };
    connection.send(JSON.stringify(response));
    this.addToHistory('agent', content, 'TextMessage');
  }

  private sendError(connection: Connection, error: string, message: string, retryAfter?: number): void {
    const response: AgentResponse = {
      component: {
        type: 'Error',
        props: { error, message, retry_after: retryAfter },
      },
    };
    connection.send(JSON.stringify(response));
  }

  private checkRateLimit(connectionId: string, now: number): { allowed: boolean; retryAfter: number } {
    if (Math.random() < 0.01) {
      const cleanupThreshold = now - RATE_LIMIT_WINDOW_MS;
      this.sql`DELETE FROM rate_limits WHERE updated_at < ${cleanupThreshold}`;
    }

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

    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    timestamps = timestamps.filter(ts => ts > windowStart);

    if (timestamps.length >= RATE_LIMIT_MAX_MESSAGES) {
      const oldestTimestamp = timestamps[0];
      if (oldestTimestamp !== undefined) {
        const retryAfter = Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW_MS - now) / 1000);
        return { allowed: false, retryAfter: Math.max(1, retryAfter) };
      }
      return { allowed: false, retryAfter: 60 };
    }

    timestamps.push(now);
    this.sql`
      INSERT OR REPLACE INTO rate_limits (connection_id, timestamps, updated_at)
      VALUES (${connectionId}, ${JSON.stringify(timestamps)}, ${now})
    `;

    return { allowed: true, retryAfter: 0 };
  }

  private getSessionValue(key: string): string | null {
    const results = this.sql<SessionStateRow>`
      SELECT value FROM session_state WHERE key = ${key}
    `;
    return results[0]?.value ?? null;
  }

  private setSessionValue(key: string, value: string): void {
    const now = Date.now();
    this.sql`
      INSERT OR REPLACE INTO session_state (key, value, updated_at)
      VALUES (${key}, ${value}, ${now})
    `;
  }

  private addToHistory(role: 'user' | 'agent', content: string, componentType: string | undefined): void {
    const now = Date.now();
    const compType = componentType ?? null;
    this.sql`
      INSERT INTO conversation_history (role, content, component_type, created_at)
      VALUES (${role}, ${content}, ${compType}, ${now})
    `;
  }

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
      createdAt: row.created_at,
    }));
  }

  private calculateProgress(step: string): number {
    const isExpress = this.getSessionValue(SESSION_KEYS.IS_EXPRESS) === 'true';
    const steps = isExpress ? EXPRESS_STEPS : FULL_STEPS;
    const index = steps.indexOf(step as typeof steps[number]);
    if (index === -1) return 0;
    return Math.round((index / (steps.length - 1)) * 100);
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
    this.sql`DELETE FROM session_state`;
    this.sql`DELETE FROM conversation_history`;
    this.sql`DELETE FROM voice_samples`;
    this.sql`DELETE FROM audience_answers`;

    const now = Date.now();
    this.setSessionValue(SESSION_KEYS.SESSION_STARTED_AT, String(now));
    this.setSessionValue(SESSION_KEYS.CURRENT_STEP, 'welcome');
    this.setSessionValue(SESSION_KEYS.LAST_ACTIVITY_AT, String(now));
    if (this.clientId) {
      this.setSessionValue(SESSION_KEYS.CLIENT_ID, this.clientId);
    }

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
}
