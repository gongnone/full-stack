// Re-export all Zod inferred types
export type {
  Platform,
  HubStatus,
  SpokeStatus,
  QualityGate,
  Severity,
  Plan,
  Role,
  BannedWord,
  Stance,
  ToneProfile,
  BrandDNA,
  QualityScores,
  Hub,
  CreateHubInput,
  Spoke,
  ReviewFilter,
  ReviewQueueItem,
  ZeroEditRate,
  CriticPassRate,
  ReviewVelocity,
  SelfHealingEfficiency,
  VolumeMetrics,
  ContentType,
  CalibrationResult,
  DriftStatus,
  ExportFormat,
  ExportStatus,
  ExportJob,
  ClientStatus,
  Client,
  WorkflowType,
  WorkflowStatus,
  WorkflowInstance,
} from '../zod';

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T> {
  data: T;
  success: true;
}

export interface ApiError {
  error: string;
  code: string;
  success: false;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// ==========================================
// PAGINATION
// ==========================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// ==========================================
// DURABLE OBJECT RPC
// ==========================================

export interface DurableObjectRPCRequest {
  method: string;
  params: Record<string, unknown>;
}

export interface DurableObjectRPCResponse<T = unknown> {
  result?: T;
  error?: string;
}

// ==========================================
// WORKFLOW EVENTS
// ==========================================

export interface HubIngestionEvent {
  clientId: string;
  hubId: string;
  sourceContent: string;
  platform: string;
  angle: string;
}

export interface SpokeGenerationEvent {
  clientId: string;
  hubId: string;
  spokeId: string;
  platform: string;
  pillarId: string;
  pillarTitle: string;
  hooks: string[];
  sourceContent: string;
}

export interface CalibrationEvent {
  clientId: string;
  contentType: 'posts' | 'articles' | 'transcripts' | 'voice';
  content: string[];
  audioR2Key?: string;
}

// ==========================================
// QUALITY GATE RESULTS
// ==========================================

export interface QualityGateResult {
  gate: string;
  passed: boolean;
  score?: number;
  feedback?: string;
  violations?: string[];
}

export interface SelfHealingFeedback {
  spokeId: string;
  gate: string;
  criticOutput: string;
  iteration: number;
  createdAt: string;
}

// ==========================================
// PILLAR EXTRACTION
// ==========================================

export interface ContentPillar {
  pillarId: string;
  title: string;
  angle: string;
  hooks: string[];
}

// ==========================================
// KILL CHAIN
// ==========================================

export interface KillChainResult {
  hubId: string;
  killed: number;
  survived: number; // Mutated spokes that survived
  reason?: string;
}

// ==========================================
// VOICE TO GROUNDING
// ==========================================

export interface VoiceGroundingResult {
  calibrationId: string;
  transcript: string;
  entitiesExtracted: {
    bannedWords: string[];
    voiceMarkers: string[];
    stances: string[];
  };
  dnaScoreBefore: number;
  dnaScoreAfter: number;
}

// ==========================================
// PLATFORM SPECIFICATIONS
// ==========================================

export interface PlatformSpec {
  maxLength: number;
  format: string;
  style: string;
  hashtagSupport: boolean;
  mentionSupport: boolean;
  linkSupport: boolean;
  mediaRequired: boolean;
}

export const PLATFORM_SPECS: Record<string, PlatformSpec> = {
  twitter: {
    maxLength: 280,
    format: 'Single tweet or thread opener',
    style: 'Punchy, conversational, hook-driven',
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: true,
    mediaRequired: false,
  },
  linkedin: {
    maxLength: 3000,
    format: 'Professional post with line breaks',
    style: 'Thought leadership, storytelling, professional',
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: true,
    mediaRequired: false,
  },
  tiktok: {
    maxLength: 150,
    format: 'Video script hook + CTA',
    style: 'Trendy, energetic, pattern-interrupt',
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: false,
    mediaRequired: true,
  },
  instagram: {
    maxLength: 2200,
    format: 'Caption with emoji and hashtags',
    style: 'Visual-first, lifestyle, authentic',
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: false,
    mediaRequired: true,
  },
  thread: {
    maxLength: 2800,
    format: '5-7 tweet thread with numbering',
    style: 'Educational, structured, value-packed',
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: true,
    mediaRequired: false,
  },
  carousel: {
    maxLength: 2200,
    format: 'Multi-slide content with headers',
    style: 'Educational, visual, scannable',
    hashtagSupport: true,
    mentionSupport: true,
    linkSupport: false,
    mediaRequired: true,
  },
  youtube_thumbnail: {
    maxLength: 60,
    format: 'Thumbnail text overlay',
    style: 'Bold, curiosity-driven, emotional',
    hashtagSupport: false,
    mentionSupport: false,
    linkSupport: false,
    mediaRequired: true,
  },
};
