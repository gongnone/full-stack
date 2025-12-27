/**
 * Database types for D1 tables
 * Used with tRPC routers for type-safe queries
 */

// Better Auth tables
export interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  image: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
}

// User profile customization
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_color: string;
  timezone: string;
  email_notifications: number; // SQLite uses 0/1 for boolean
  preferences_json: string | null;
  active_client_id: string | null; // Currently selected client for multi-tenant UI
  created_at: number;
  updated_at: number;
}

// Input/output types for API
export interface UserProfileInput {
  displayName?: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  timezone?: string;
  emailNotifications?: boolean;
}

export interface UserWithProfile {
  user: User;
  profile: UserProfile | null;
  /** Client ID for multi-tenant isolation. For MVP, this is userId or accountId. */
  clientId: string;
}

// Training sample for Brand DNA analysis (Story 2.1 & 2.2)
export type TrainingSampleSourceType = 'pdf' | 'pasted_text' | 'article' | 'transcript' | 'voice';
export type TrainingSampleStatus = 'pending' | 'processing' | 'analyzed' | 'failed';

export interface TrainingSample {
  id: string;
  client_id: string;
  user_id: string;
  title: string;
  source_type: TrainingSampleSourceType;
  r2_key: string | null;
  word_count: number;
  character_count: number;
  extracted_text: string | null;
  status: TrainingSampleStatus;
  quality_score: number | null;
  quality_notes: string | null;
  error_message: string | null;
  created_at: number;
  updated_at: number;
  analyzed_at: number | null;
}

// API input/output types for training samples
export interface CreateTrainingSampleInput {
  clientId: string;
  title: string;
  sourceType: TrainingSampleSourceType;
  content?: string; // For pasted text
  r2Key?: string; // For file uploads
}

export interface TrainingSampleWithQuality {
  sample: TrainingSample;
  qualityBadge: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'pending';
}

export interface UploadUrlResponse {
  uploadUrl: string;
  r2Key: string;
  expiresAt: Date;
}

// Brand DNA for voice profile analysis (Story 2.3)
export type BrandDNAStatus = 'strong' | 'good' | 'needs_training';
export type CalibrationSource = 'content_upload' | 'voice_note' | 'manual';

export interface BrandDNA {
  id: string;
  client_id: string;
  strength_score: number;
  tone_profile: string; // JSON string: {tone_match, vocabulary, structure, topics}
  signature_patterns: string; // JSON array of SignaturePhrase objects (Story 2.4)
  topics_to_avoid: string | null; // JSON array of topics to avoid (Story 2.4)
  primary_tone: string | null;
  writing_style: string | null;
  target_audience: string | null;
  last_calibration_at: number;
  calibration_source: CalibrationSource;
  sample_count: number;
  created_at: number;
  updated_at: number;
}

export interface BrandDNABreakdown {
  tone_match: number;
  vocabulary: number;
  structure: number;
  topics: number;
}

export interface BrandDNARecommendation {
  type: 'add_samples' | 'voice_note' | 'diversify_content';
  message: string;
}

/** Signature phrase with example usage from content (Story 2.4) */
export interface SignaturePhrase {
  phrase: string;
  example: string; // Example sentence from content where phrase appears
}

export interface BrandDNAReport {
  strengthScore: number;
  status: BrandDNAStatus;
  primaryTone: string | null;
  writingStyle: string | null;
  targetAudience: string | null;
  signaturePhrases: SignaturePhrase[]; // Story 2.4: Now includes example usage
  topicsToAvoid: string[]; // Story 2.4: Topics/words to avoid (red pills)
  breakdown: BrandDNABreakdown;
  recommendations: BrandDNARecommendation[];
  sampleCount: number;
  lastCalibration: {
    source: CalibrationSource;
    timestamp: number;
  };
}

export interface BrandDNAAnalysisResult {
  success: boolean;
  strengthScore: number;
  breakdown: BrandDNABreakdown;
  primaryTone: string;
  writingStyle: string;
  targetAudience: string;
  signaturePhrases: SignaturePhrase[]; // Story 2.4: Now includes example usage
  topicsToAvoid: string[]; // Story 2.4: Topics/words to avoid
}

// Hub Source types for Story 3-1: Source Selection & Upload Wizard
export type HubSourceType = 'pdf' | 'text' | 'url';
export type HubSourceStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface HubSource {
  id: string;
  client_id: string;
  user_id: string;
  title: string | null;
  source_type: HubSourceType;
  r2_key: string | null;
  raw_content: string | null;
  url: string | null;
  character_count: number;
  word_count: number;
  status: HubSourceStatus;
  error_message: string | null;
  created_at: number;
  updated_at: number;
}

// API response types for hub sources
export interface SourceUploadUrlResponse {
  sourceId: string;
  r2Key: string;
  uploadEndpoint: string;
  expiresAt: Date;
}

export interface CreateSourceResult {
  sourceId: string;
  status: HubSourceStatus;
  characterCount?: number;
  wordCount?: number;
}

// Story 3.2: Thematic Extraction Engine types
export type PsychologicalAngle = 'Contrarian' | 'Authority' | 'Urgency' | 'Aspiration' | 'Fear' | 'Curiosity' | 'Transformation' | 'Rebellion';
export type ExtractionStage = 'parsing' | 'themes' | 'claims' | 'pillars';
export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Pillar {
  id: string;
  title: string;
  coreClaim: string;
  psychologicalAngle: PsychologicalAngle;
  estimatedSpokeCount: number;
  supportingPoints: string[];
  hubId?: string; // Set when pillar is finalized into a Hub (AC2: immutability after Hub creation)
}

export interface ExtractionProgress {
  sourceId: string;
  status: ExtractionStatus;
  currentStage: ExtractionStage;
  progress: number; // 0-100
  stageMessage: string;
  error?: string;
}

export interface ExtractionResult {
  sourceId: string;
  pillars: Pillar[];
  extractionDuration: number; // milliseconds
  success: boolean;
  error?: string;
}

export interface StartExtractionInput {
  sourceId: string;
  clientId: string;
}

export interface GetExtractionProgressInput {
  sourceId: string;
  clientId: string;
}

// Story 3.4: Hub Metadata & State Management types
export type HubStatus = 'processing' | 'ready' | 'archived';

export interface Hub {
  id: string;
  client_id: string;
  user_id: string;
  source_id: string;
  title: string;
  source_type: HubSourceType;
  pillar_count: number;
  spoke_count: number;
  status: HubStatus;
  created_at: number;
  updated_at: number;
}

export interface HubWithPillars extends Hub {
  pillars: Pillar[];
}

export interface HubListItem {
  id: string;
  title: string;
  sourceType: HubSourceType;
  pillarCount: number;
  spokeCount: number;
  status: HubStatus;
  createdAt: number;
}

export interface FinalizeHubInput {
  sourceId: string;
  clientId: string;
  title?: string; // Optional override for Hub title
}

export interface FinalizeHubResult {
  hubId: string;
  title: string;
  pillarCount: number;
  redirectTo: string; // URL path to redirect after creation
}

// Story 4.1: Deterministic Spoke Fracturing types
export type SpokePlatform = 'twitter' | 'linkedin' | 'tiktok' | 'instagram' | 'newsletter' | 'thread' | 'carousel';
export type SpokeStatus = 'pending' | 'generating' | 'ready' | 'approved' | 'rejected' | 'killed' | 'failed';
export type SpokeGenerationStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface Spoke {
  id: string;
  hub_id: string;
  pillar_id: string;
  client_id: string;
  platform: SpokePlatform;
  content: string;
  psychological_angle: PsychologicalAngle;
  status: SpokeStatus;
  generation_attempt: number;
  g2_score: number | null; // Hook strength 0-100 (Story 4.2)
  g4_status: string | null; // Voice alignment (Story 4.2)
  g5_status: string | null; // Platform compliance (Story 4.2)
  is_mutated: number; // 0 = no, 1 = user-edited (survives Kill Chain)
  created_at: number;
  updated_at: number;
}

export interface SpokeGenerationProgress {
  hub_id: string;
  client_id: string;
  status: SpokeGenerationStatus;
  total_pillars: number;
  completed_pillars: number;
  total_spokes: number;
  completed_spokes: number;
  current_pillar_id: string | null;
  current_pillar_name: string | null;
  error_message: string | null;
  started_at: number | null;
  completed_at: number | null;
  updated_at: number;
}

// Platform configuration for content generation
export interface PlatformConfig {
  maxChars?: number;
  maxWords?: number;
  maxDuration?: number;
  minPosts?: number;
  maxPosts?: number;
  minSlides?: number;
  maxSlides?: number;
  format: string;
  tone: string;
}

export const PLATFORM_CONFIGS: Record<SpokePlatform, PlatformConfig> = {
  twitter: { maxChars: 280, format: 'single-post', tone: 'punchy' },
  linkedin: { maxChars: 3000, format: 'professional', tone: 'authoritative' },
  tiktok: { maxDuration: 60, format: 'script', tone: 'conversational' },
  instagram: { maxChars: 2200, format: 'caption', tone: 'visual' },
  newsletter: { maxWords: 500, format: 'long-form', tone: 'value-dense' },
  thread: { minPosts: 5, maxPosts: 7, format: 'sequential', tone: 'storytelling' },
  carousel: { minSlides: 5, maxSlides: 8, format: 'visual-slides', tone: 'educational' },
} as const;

// API types for spoke generation
export interface GenerateSpokesInput {
  hubId: string;
  clientId: string;
}

export interface GenerateSpokesResult {
  hubId: string;
  status: SpokeGenerationStatus;
  totalPillars: number;
  totalSpokes: number;
  message: string;
}

export interface SpokeWithPillar extends Spoke {
  pillar_title: string;
}

export interface SpokeTreeNode {
  id: string;
  type: 'hub' | 'pillar' | 'spoke';
  title: string;
  count?: number;
  platform?: SpokePlatform;
  status?: SpokeStatus;
  children?: SpokeTreeNode[];
}
