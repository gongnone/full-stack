import { z } from 'zod';

// ==========================================
// ENUMS
// ==========================================

export const platformEnum = z.enum([
  'twitter',
  'linkedin',
  'tiktok',
  'instagram',
  'carousel',
  'thread',
  'youtube_thumbnail',
]);
export type Platform = z.infer<typeof platformEnum>;

export const hubStatusEnum = z.enum(['processing', 'ready', 'killed']);
export type HubStatus = z.infer<typeof hubStatusEnum>;

export const spokeStatusEnum = z.enum([
  'generating',
  'reviewing',
  'approved',
  'rejected',
  'killed',
]);
export type SpokeStatus = z.infer<typeof spokeStatusEnum>;

export const qualityGateEnum = z.enum([
  'g2_hook',
  'g4_voice',
  'g5_platform',
  'g6_visual',
  'g7_engagement',
  'g_compliance',
]);
export type QualityGate = z.infer<typeof qualityGateEnum>;

export const severityEnum = z.enum(['hard', 'soft']);
export type Severity = z.infer<typeof severityEnum>;

export const planEnum = z.enum(['starter', 'pro', 'enterprise']);
export type Plan = z.infer<typeof planEnum>;

export const roleEnum = z.enum(['owner', 'admin', 'editor', 'viewer']);
export type Role = z.infer<typeof roleEnum>;

// ==========================================
// BRAND DNA
// ==========================================

export const bannedWordSchema = z.object({
  word: z.string().min(1),
  severity: severityEnum,
  reason: z.string().optional(),
});
export type BannedWord = z.infer<typeof bannedWordSchema>;

export const stanceSchema = z.object({
  topic: z.string().min(1),
  position: z.string().min(1),
});
export type Stance = z.infer<typeof stanceSchema>;

export const toneProfileSchema = z.object({
  formal_casual: z.number().min(0).max(100),
  serious_playful: z.number().min(0).max(100),
  technical_accessible: z.number().min(0).max(100),
  reserved_expressive: z.number().min(0).max(100),
});
export type ToneProfile = z.infer<typeof toneProfileSchema>;

export const brandDNASchema = z.object({
  voiceMarkers: z.array(z.string()),
  bannedWords: z.array(bannedWordSchema),
  stances: z.array(stanceSchema),
  signaturePatterns: z.array(z.string()),
  toneProfile: toneProfileSchema.partial(),
  lastCalibration: z.string().nullable(),
});
export type BrandDNA = z.infer<typeof brandDNASchema>;

// ==========================================
// QUALITY SCORES
// ==========================================

export const qualityScoresSchema = z.object({
  g2_hook: z.number().min(0).max(100).optional(),
  g4_voice: z.boolean().optional(),
  g5_platform: z.boolean().optional(),
  g6_visual: z.number().min(0).max(100).optional(),
  g7_engagement: z.number().min(0).max(100).optional(),
});
export type QualityScores = z.infer<typeof qualityScoresSchema>;

// ==========================================
// HUB & SPOKE
// ==========================================

export const hubSchema = z.object({
  id: z.string().uuid(),
  sourceContent: z.string().min(1),
  platform: platformEnum,
  angle: z.string().min(1),
  status: hubStatusEnum,
  pillars: z.array(z.string()),
  createdAt: z.string(),
});
export type Hub = z.infer<typeof hubSchema>;

export const createHubInputSchema = z.object({
  sourceContent: z.string().min(1).max(50000),
  platform: platformEnum,
  angle: z.string().min(1).max(500),
});
export type CreateHubInput = z.infer<typeof createHubInputSchema>;

export const spokeSchema = z.object({
  id: z.string().uuid(),
  hubId: z.string().uuid(),
  pillarId: z.string().optional(),
  platform: platformEnum,
  content: z.string(),
  status: spokeStatusEnum,
  qualityScores: qualityScoresSchema,
  visualArchetype: z.string().optional(),
  imagePrompt: z.string().optional(),
  thumbnailConcept: z.string().optional(),
  regenerationCount: z.number().int().min(0),
  mutatedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type Spoke = z.infer<typeof spokeSchema>;

// ==========================================
// REVIEW QUEUE
// ==========================================

export const reviewFilterEnum = z.enum(['all', 'top10', 'flagged']);
export type ReviewFilter = z.infer<typeof reviewFilterEnum>;

export const reviewQueueItemSchema = spokeSchema.extend({
  hubSourcePreview: z.string().optional(),
  estimatedReviewTime: z.number().optional(), // seconds
});
export type ReviewQueueItem = z.infer<typeof reviewQueueItemSchema>;

// ==========================================
// ANALYTICS
// ==========================================

export const zeroEditRateSchema = z.object({
  rate: z.number().min(0).max(100),
  total: z.number().int().min(0),
  withoutEdit: z.number().int().min(0),
  trend: z.enum(['up', 'down', 'stable']),
});
export type ZeroEditRate = z.infer<typeof zeroEditRateSchema>;

export const criticPassRateSchema = z.object({
  g2: z.number().min(0).max(100),
  g4: z.number().min(0).max(100),
  g5: z.number().min(0).max(100),
  g6: z.number().min(0).max(100),
  g7: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
});
export type CriticPassRate = z.infer<typeof criticPassRateSchema>;

export const reviewVelocitySchema = z.object({
  avgTimePerDecision: z.number().min(0), // seconds
  bulkApproveRate: z.number().min(0).max(100),
  killChainUsage: z.number().min(0).max(100),
});
export type ReviewVelocity = z.infer<typeof reviewVelocitySchema>;

export const selfHealingEfficiencySchema = z.object({
  avgLoops: z.number().min(0),
  successRate: z.number().min(0).max(100),
  topFailureReasons: z.array(z.object({
    gate: z.string(),
    count: z.number().int().min(0),
  })),
});
export type SelfHealingEfficiency = z.infer<typeof selfHealingEfficiencySchema>;

export const volumeMetricsSchema = z.object({
  hubsCreated: z.number().int().min(0),
  spokesGenerated: z.number().int().min(0),
  spokesApproved: z.number().int().min(0),
  spokesRejected: z.number().int().min(0),
  spokesKilled: z.number().int().min(0),
});
export type VolumeMetrics = z.infer<typeof volumeMetricsSchema>;

// ==========================================
// CALIBRATION
// ==========================================

export const contentTypeEnum = z.enum(['posts', 'articles', 'transcripts', 'voice']);
export type ContentType = z.infer<typeof contentTypeEnum>;

export const calibrationResultSchema = z.object({
  analysisId: z.string().uuid(),
  entitiesExtracted: z.object({
    voiceMarkers: z.number().int().min(0),
    bannedWords: z.number().int().min(0),
    stances: z.number().int().min(0),
    signaturePatterns: z.number().int().min(0),
  }),
  dnaScoreBefore: z.number().min(0).max(100),
  dnaScoreAfter: z.number().min(0).max(100),
  improvement: z.number(),
});
export type CalibrationResult = z.infer<typeof calibrationResultSchema>;

export const driftStatusSchema = z.object({
  driftScore: z.number().min(0).max(100),
  needsCalibration: z.boolean(),
  trigger: z.string().optional(),
  suggestion: z.string().optional(),
});
export type DriftStatus = z.infer<typeof driftStatusSchema>;

// ==========================================
// EXPORTS
// ==========================================

export const exportFormatEnum = z.enum(['csv', 'json']);
export type ExportFormat = z.infer<typeof exportFormatEnum>;

export const exportStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed']);
export type ExportStatus = z.infer<typeof exportStatusEnum>;

export const exportJobSchema = z.object({
  id: z.string().uuid(),
  format: exportFormatEnum,
  status: exportStatusEnum,
  downloadUrl: z.string().url().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
});
export type ExportJob = z.infer<typeof exportJobSchema>;

// ==========================================
// CLIENT
// ==========================================

export const clientStatusEnum = z.enum(['active', 'paused', 'archived']);
export type ClientStatus = z.infer<typeof clientStatusEnum>;

export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  status: clientStatusEnum,
  createdAt: z.string(),
});
export type Client = z.infer<typeof clientSchema>;

// ==========================================
// WORKFLOW
// ==========================================

export const workflowTypeEnum = z.enum([
  'hub_ingestion',
  'spoke_generation',
  'calibration',
]);
export type WorkflowType = z.infer<typeof workflowTypeEnum>;

export const workflowStatusEnum = z.enum([
  'running',
  'completed',
  'failed',
  'cancelled',
]);
export type WorkflowStatus = z.infer<typeof workflowStatusEnum>;

export const workflowInstanceSchema = z.object({
  id: z.string(),
  workflowType: workflowTypeEnum,
  status: workflowStatusEnum,
  startedAt: z.string(),
  completedAt: z.string().optional(),
});
export type WorkflowInstance = z.infer<typeof workflowInstanceSchema>;
