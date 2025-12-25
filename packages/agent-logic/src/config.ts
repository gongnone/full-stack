/**
 * Centralized AI Model and logic configuration
 */

export const AI_MODELS = {
  /** Standard LLM for spoke generation */
  GENERATION: '@cf/meta/llama-3-8b-instruct',
  /** Heavy-duty LLM for extraction and complex reasoning */
  REASONING: '@cf/meta/llama-3.1-70b-instruct',
  /** Base embedding model for Vectorize */
  EMBEDDING: '@cf/baai/bge-base-en-v1.5',
  /** Transcription model */
  TRANSCRIPTION: '@cf/openai/whisper',
} as const;

export const GENERATION_CONFIG = {
  /** Maximum number of auto-healing attempts */
  MAX_ATTEMPTS: 3,
  /** Standard psychological angles */
  PSYCHOLOGICAL_ANGLES: ['contrarian', 'how-to', 'story-based'] as const,
} as const;
