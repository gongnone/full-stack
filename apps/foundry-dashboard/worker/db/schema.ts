/**
 * Database schema for Foundry Dashboard
 *
 * This is a local copy of relevant schema definitions for Foundry.
 * Maintains architecture isolation from Legacy @repo/data-ops.
 */
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// === USER PROFILES ===

export const userProfiles = sqliteTable('user_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  avatarColor: text('avatar_color').default('#1D9BF0'),
  timezone: text('timezone').default('UTC'),
  emailNotifications: integer('email_notifications').default(1),
  preferencesJson: text('preferences_json'),
  activeClientId: text('active_client_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === CLIENTS ===

export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').default('active').notNull(),
  industry: text('industry'),
  contactEmail: text('contact_email'),
  logoUrl: text('logo_url'),
  brandColor: text('brand_color').default('#1D9BF0'),
  drift_threshold: integer('drift_threshold').default(25),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === CLIENT MEMBERS ===

export const clientMembers = sqliteTable('client_members', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === TRAINING SAMPLES ===

export const training_samples = sqliteTable('training_samples', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  user_id: text('user_id'),
  title: text('title').notNull(),
  source_type: text('source_type').notNull(), // 'pdf', 'article', 'transcript', 'pasted_text', 'voice'
  r2_key: text('r2_key'),
  extracted_text: text('extracted_text'),
  status: text('status').default('pending'), // 'pending', 'processing', 'analyzed', 'failed'
  word_count: integer('word_count'),
  character_count: integer('character_count'),
  quality_score: integer('quality_score'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  analyzed_at: integer('analyzed_at', { mode: 'timestamp' }), // P3: Track when sample was analyzed
});

// === BRAND DNA ===

export const brand_dna = sqliteTable('brand_dna', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().unique().references(() => clients.id, { onDelete: 'cascade' }),
  strength_score: integer('strength_score').default(0),
  tone_profile: text('tone_profile'), // JSON
  signature_patterns: text('signature_patterns'), // JSON
  topics_to_avoid: text('topics_to_avoid'), // JSON
  primary_tone: text('primary_tone'),
  writing_style: text('writing_style'),
  target_audience: text('target_audience'),
  voice_entities: text('voice_entities'), // JSON: { voiceMarkers, bannedWords, stances }
  last_voice_recording_at: integer('last_voice_recording_at'),
  calibration_source: text('calibration_source'),
  sample_count: integer('sample_count').default(0),
  last_calibration_at: integer('last_calibration_at', { mode: 'timestamp' }),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === BRAND DNA SNAPSHOTS (Story 9.2) ===

export const brand_dna_snapshots = sqliteTable('brand_dna_snapshots', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  voice_markers: text('voice_markers'), // JSON
  banned_words: text('banned_words'), // JSON
  stances: text('stances'), // JSON
  primary_tone: text('primary_tone'),
  writing_style: text('writing_style'),
  target_audience: text('target_audience'),
  strength_score: integer('strength_score'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// === BRAND DNA SESSIONS (Story 1.5-1-4, 1.5-1-7, 1.5-1-8) ===

export const brand_dna_sessions = sqliteTable('brand_dna_sessions', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull(),
  status: text('status').default('active').notNull(), // 'active', 'completed', 'abandoned'
  mode: text('mode').default('voice').notNull(), // 'voice', 'text-only', 'express' (Story 1.5-1-7, 1.5-1-8)
  voice_analysis: text('voice_analysis'), // JSON: { tone, vocabulary, personality_markers }
  total_transcription: text('total_transcription'), // Combined transcription text
  total_duration_seconds: integer('total_duration_seconds').default(0),
  recording_count: integer('recording_count').default(0),
  // Express path fields (Story 1.5-1-8)
  express_answers: text('express_answers'), // JSON: { tagline, toneWords, platform }
  // Competitor input (Story 1.5-2-6)
  competitors: text('competitors'), // JSON: [{ name, url }] - max 3
  created_at: integer('created_at').notNull(),
  updated_at: integer('updated_at').notNull(),
  completed_at: integer('completed_at'),
});

// === VOICE RECORDINGS (Story 1.5-1-3) ===

export const voice_recordings = sqliteTable('voice_recordings', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  session_id: text('session_id').notNull(),
  user_id: text('user_id').notNull(),
  r2_key: text('r2_key').notNull(),
  transcription: text('transcription'),
  duration_seconds: integer('duration_seconds'),
  file_size: integer('file_size').notNull(),
  format: text('format').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'transcribing', 'completed', 'failed'
  error_message: text('error_message'),
  created_at: integer('created_at').notNull(),
  transcribed_at: integer('transcribed_at'),
});

// === AUDIENCE PERSONAS (Epic 1.5-2) ===

export const audience_personas = sqliteTable('audience_personas', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Professional Sarah"
  status: text('status').default('draft').notNull(), // 'draft', 'approved', 'archived'
  source: text('source').default('manual').notNull(), // 'manual', 'imported', 'generated'
  // Demographics (Story 1.5-2-1)
  age_range: text('age_range'), // e.g., "25-34"
  gender: text('gender'), // e.g., "Female", "Male", "Non-binary", "All"
  location: text('location'), // e.g., "Urban US, UK"
  income_level: text('income_level'), // e.g., "Middle to High"
  education: text('education'), // e.g., "Bachelor's degree+"
  occupation: text('occupation'), // e.g., "Marketing Manager"
  // Psychographics (Story 1.5-2-2)
  values: text('values'), // JSON array: ["Innovation", "Work-life balance"]
  interests: text('interests'), // JSON array: ["Technology", "Productivity"]
  pain_points: text('pain_points'), // JSON array: ["Not enough time", "Information overload"]
  goals: text('goals'), // JSON array: ["Career growth", "Stay informed"]
  // Content Preferences (Story 1.5-2-3)
  preferred_platforms: text('preferred_platforms'), // JSON array: ["LinkedIn", "Twitter"]
  content_types: text('content_types'), // JSON array: ["Articles", "Videos", "Podcasts"]
  consumption_time: text('consumption_time'), // e.g., "Morning commute, Evening"
  engagement_style: text('engagement_style'), // e.g., "Likes to comment, shares occasionally"
  // Generated fields
  summary: text('summary'), // AI-generated summary
  imported_from: text('imported_from'), // Source document type if imported
  r2_key: text('r2_key'), // Original imported document
  created_at: integer('created_at').notNull(),
  updated_at: integer('updated_at').notNull(),
});

// === PLATFORM RECOMMENDATIONS (Story 1.5-2-7) ===

export const platform_recommendations = sqliteTable('platform_recommendations', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  persona_id: text('persona_id').references(() => audience_personas.id),
  platform: text('platform').notNull(), // e.g., "LinkedIn"
  priority: integer('priority').default(0), // Display order within status tier
  status: text('status').default('primary').notNull(), // 'primary', 'secondary', 'excluded' (Story 1.5-2-7 AC2)
  rationale: text('rationale'), // Why this platform
  content_types: text('content_types'), // JSON: recommended content types for platform
  posting_cadence: text('posting_cadence'), // e.g., "3x/week"
  best_times: text('best_times'), // JSON: recommended posting times
  created_at: integer('created_at').notNull(),
  updated_at: integer('updated_at').notNull(),
});

// === CONTENT MEDIUM PREFERENCES (Story 1.5-2-8) ===

export const content_medium_preferences = sqliteTable('content_medium_preferences', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().unique().references(() => clients.id, { onDelete: 'cascade' }),
  // Ranked mediums: 1 = most comfortable, 4 = least comfortable
  written_rank: integer('written_rank').default(1),
  video_rank: integer('video_rank').default(2),
  audio_rank: integer('audio_rank').default(3),
  visual_rank: integer('visual_rank').default(4),
  created_at: integer('created_at').notNull(),
  updated_at: integer('updated_at').notNull(),
});

// === CONTENT PILLARS (Epic 1.5-3) ===

export const content_pillars = sqliteTable('content_pillars', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  rationale: text('rationale'), // JSON: { voiceConnection, audienceAlignment, competitorDifferentiation }
  status: text('status').default('proposed').notNull(), // 'proposed', 'approved', 'rejected'
  priority: integer('priority').default(0), // Display order
  // Brand Story Framework alignment
  framework_type: text('framework_type'), // 'catalyst', 'core_truth', 'proof'
  generated_by: text('generated_by').default('ai'), // 'ai', 'user'
  created_at: integer('created_at').notNull(),
  updated_at: integer('updated_at').notNull(),
});

// === BRAND DNA REPORTS (Story 1.5-3-5) ===

export const brand_dna_reports = sqliteTable('brand_dna_reports', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().unique().references(() => clients.id, { onDelete: 'cascade' }),
  // Compiled report data
  tone_summary: text('tone_summary'), // AI-generated summary of voice analysis
  vocabulary_insights: text('vocabulary_insights'), // JSON: { common_phrases, avoided_words }
  persona_summary: text('persona_summary'), // From audience.summary
  platform_strategy: text('platform_strategy'), // JSON: { primary, secondary, rationale }
  pillars_summary: text('pillars_summary'), // JSON array of pillar summaries
  // Score data (Story 1.5-3-6)
  strength_score: integer('strength_score').default(0), // 0-100
  score_breakdown: text('score_breakdown'), // JSON: { voice, audience, pillars, platform }
  recommendations: text('recommendations'), // JSON array of improvement suggestions
  // Report metadata
  generated_at: integer('generated_at').notNull(),
  updated_at: integer('updated_at').notNull(),
});

// === CLIENT INVITES (Story 1.5-7-3) ===

export const client_invites = sqliteTable('client_invites', {
  id: text('id').primaryKey(),
  inviter_id: text('inviter_id').notNull(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  personal_message: text('personal_message'),
  token: text('token').notNull().unique(),
  status: text('status').default('pending').notNull(), // 'pending', 'accepted', 'expired'
  created_at: integer('created_at').notNull(),
  expires_at: integer('expires_at').notNull(),
  accepted_at: integer('accepted_at'),
});

// === ONBOARDING LINKS (Story 1.5-7-6) ===

export const onboarding_links = sqliteTable('onboarding_links', {
  id: text('id').primaryKey(),
  creator_id: text('creator_id').notNull(),
  token: text('token').notNull().unique(),
  prefill_name: text('prefill_name'),
  expires_at: integer('expires_at').notNull(),
  max_uses: integer('max_uses').default(1).notNull(),
  use_count: integer('use_count').default(0).notNull(),
  created_at: integer('created_at').notNull(),
});

// === TESTIMONIALS (Story 1.5-8) ===

export const testimonials = sqliteTable('testimonials', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'video', 'audio', 'text'
  content: text('content'), // Text content or transcript
  r2_key: text('r2_key'), // Video/audio file
  thumbnail_url: text('thumbnail_url'),
  duration: integer('duration'), // Duration in seconds for video/audio
  status: text('status').default('pending').notNull(), // 'pending', 'approved', 'public'
  public_permission: integer('public_permission').default(0), // 1 = allowed for public use
  trigger_event: text('trigger_event'), // 'batch_approval', 'milestone', 'manual'
  created_at: integer('created_at').notNull(),
  approved_at: integer('approved_at'),
});

// === NUDGE EMAILS (Story 1.5-7-9) ===

export const nudge_emails = sqliteTable('nudge_emails', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'brandDna-incomplete', 'no-activity', 'review-pending', 'custom'
  custom_message: text('custom_message'),
  sent_at: integer('sent_at').notNull(),
});

// === USER CLIENTS (Multi-tenant access) ===

export const user_clients = sqliteTable('user_clients', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  role: text('role').default('owner').notNull(), // 'owner', 'admin', 'member'
  created_at: integer('created_at').notNull(),
});

// === POST QUEUE (Story 1.5-6-6) ===

export const post_queue = sqliteTable('post_queue', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  spoke_id: text('spoke_id').notNull(),
  status: text('status').default('ready').notNull(), // 'ready', 'posted', 'failed'
  target_platform: text('target_platform'),
  queued_at: integer('queued_at').notNull(),
  posted_at: integer('posted_at'),
});

// === HANDOFF LOG (Story 1.5-6-9) ===

export const handoff_log = sqliteTable('handoff_log', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  spoke_id: text('spoke_id').notNull(),
  handoff_type: text('handoff_type').notNull(), // 'copied', 'shared', 'scheduled'
  target_platform: text('target_platform'),
  handed_off_at: integer('handed_off_at').notNull(),
});

// === POST PERFORMANCE (Story 1.5-6-12) ===

export const post_performance = sqliteTable('post_performance', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  spoke_id: text('spoke_id').notNull(),
  metrics: text('metrics'), // JSON: { likes, comments, shares, impressions, clicks, saves }
  performed_well: integer('performed_well'), // 1 = yes, 0 = no, null = unknown
  notes: text('notes'),
  recorded_at: integer('recorded_at').notNull(),
});

// === ENGAGEMENT TRAINING DATA (Epic 12-1) ===

export const engagement_training_data = sqliteTable('engagement_training_data', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  spoke_id: text('spoke_id').notNull(),
  platform: text('platform').notNull(),
  content_hash: text('content_hash').notNull(), // For deduplication

  // Predicted scores (at generation time)
  predicted_engagement: integer('predicted_engagement').notNull(), // 0-100 scaled from 0-10
  predicted_confidence: text('predicted_confidence').notNull(), // 'low', 'medium', 'high'

  // Actual performance (filled in after publishing)
  actual_engagement_rate: integer('actual_engagement_rate'), // Engagement rate * 1000 (for integer storage)
  actual_performance_tier: text('actual_performance_tier'), // 'viral', 'high', 'average', 'low', 'flop'

  // Timing
  predicted_at: integer('predicted_at').notNull(),
  published_at: integer('published_at'),
  metrics_recorded_at: integer('metrics_recorded_at'),

  // For model training
  feature_vector: text('feature_vector'), // JSON: normalized features used for prediction
});

// === CRITIC CALIBRATION (Story 1.5-5-7) ===

export const critic_calibration_data = sqliteTable('critic_calibration_data', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  spoke_id: text('spoke_id').notNull(),
  was_approved: integer('was_approved').notNull(), // 1 = approved, 0 = rejected
  user_edited_content: text('user_edited_content'), // If user edited before approving
  original_scores: text('original_scores'), // JSON: { g2, g4, g5, g7 } at time of review
  created_at: integer('created_at').notNull(),
});

// === TESTIMONIAL REQUESTS (Story 1.5-8-5) ===

export const testimonial_requests = sqliteTable('testimonial_requests', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  trigger: text('trigger').notNull(), // 'batch_approval', 'milestone', 'manual'
  // FR-1.5.16c: 'snoozed' = "ask me later" option in PRD (functionally equivalent)
  status: text('status').default('sent').notNull(), // 'sent', 'accepted', 'declined', 'snoozed'
  response_at: integer('response_at'),
  remind_at: integer('remind_at'),
  created_at: integer('created_at').notNull(),
});

// === DELETION REQUESTS (Story 1.5-9-1) ===

export const deletion_requests = sqliteTable('deletion_requests', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull(),
  reason: text('reason'),
  status: text('status').default('pending').notNull(), // 'pending', 'cancelled', 'completed'
  scheduled_at: integer('scheduled_at').notNull(),
  cancelled_at: integer('cancelled_at'),
  completed_at: integer('completed_at'),
  created_at: integer('created_at').notNull(),
});

// === CONSENT RECORDS (Story 1.5-9-2) ===

export const consent_records = sqliteTable('consent_records', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull(),
  consent_type: text('consent_type').notNull(), // 'terms', 'privacy', 'marketing', 'analytics', 'testimonial'
  version: text('version').notNull(),
  granted: integer('granted').notNull(), // 1 = granted, 0 = revoked
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  recorded_at: integer('recorded_at').notNull(),
});

// === ASSET TOKENS (Story 1.5-9-3) ===

export const asset_tokens = sqliteTable('asset_tokens', {
  token: text('token').primaryKey(),
  r2_key: text('r2_key').notNull(),
  client_id: text('client_id').notNull(),
  expires_at: integer('expires_at').notNull(),
  created_at: integer('created_at').notNull(),
});

// === DATA EXPORTS (Story 1.5-9-4) ===

export const data_exports = sqliteTable('data_exports', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull(),
  format: text('format').notNull(), // 'json', 'csv'
  include_media: integer('include_media').default(0),
  status: text('status').default('pending').notNull(), // 'pending', 'processing', 'ready', 'expired'
  download_url: text('download_url'),
  expires_at: integer('expires_at'),
  created_at: integer('created_at').notNull(),
  completed_at: integer('completed_at'),
});

// === AUDIT LOG (Story 1.5-9-5) ===

export const audit_log = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull(),
  user_id: text('user_id').notNull(),
  action: text('action').notNull(),
  details: text('details'), // JSON
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: integer('created_at').notNull(),
});

// === ERROR LOG (Story 1.5-10-1) ===

export const error_log = sqliteTable('error_log', {
  id: text('id').primaryKey(),
  client_id: text('client_id'),
  user_id: text('user_id'),
  error_type: text('error_type').notNull(),
  message: text('message').notNull(),
  stack: text('stack'),
  context: text('context'), // JSON
  created_at: integer('created_at').notNull(),
});

// === DEAD LETTER QUEUE (Story 1.5-10-2) ===

export const dead_letter_queue = sqliteTable('dead_letter_queue', {
  id: text('id').primaryKey(),
  client_id: text('client_id'),
  message_type: text('message_type').notNull(),
  payload: text('payload').notNull(), // JSON
  error_message: text('error_message').notNull(),
  retry_count: integer('retry_count').default(0).notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'retried', 'failed', 'resolved'
  resolution_notes: text('resolution_notes'),
  last_retry_at: integer('last_retry_at'),
  resolved_at: integer('resolved_at'),
  created_at: integer('created_at').notNull(),
});

// === API REQUESTS (Story 1.5-10-3) ===

export const api_requests = sqliteTable('api_requests', {
  id: text('id').primaryKey(),
  client_id: text('client_id').notNull(),
  endpoint: text('endpoint').notNull(),
  latency_ms: integer('latency_ms'),
  created_at: integer('created_at').notNull(),
});

// === TYPE EXPORTS ===

export type TrainingSample = typeof training_samples.$inferSelect;
export type AudiencePersona = typeof audience_personas.$inferSelect;
export type AudiencePersonaInsert = typeof audience_personas.$inferInsert;
export type PlatformRecommendation = typeof platform_recommendations.$inferSelect;
export type PlatformRecommendationInsert = typeof platform_recommendations.$inferInsert;
export type ContentMediumPreferences = typeof content_medium_preferences.$inferSelect;
export type ContentMediumPreferencesInsert = typeof content_medium_preferences.$inferInsert;
export type ContentPillar = typeof content_pillars.$inferSelect;
export type ContentPillarInsert = typeof content_pillars.$inferInsert;
export type BrandDnaReport = typeof brand_dna_reports.$inferSelect;
export type BrandDnaReportInsert = typeof brand_dna_reports.$inferInsert;
export type TrainingSampleInsert = typeof training_samples.$inferInsert;
export type BrandDNA = typeof brand_dna.$inferSelect;
export type BrandDnaSession = typeof brand_dna_sessions.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type VoiceRecording = typeof voice_recordings.$inferSelect;
export type VoiceRecordingInsert = typeof voice_recordings.$inferInsert;
export type EngagementTrainingData = typeof engagement_training_data.$inferSelect;
export type EngagementTrainingDataInsert = typeof engagement_training_data.$inferInsert;

// === HOOKS DATABASE (Epic 12-2) ===

export const hooks = sqliteTable('hooks', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  platform: text('platform').notNull(), // twitter, linkedin, instagram, tiktok, etc.
  category: text('category').notNull(), // business, lifestyle, tech, health, finance, etc.

  // Performance metrics (from training data)
  engagementRate: integer('engagement_rate'), // likes+comments+shares / impressions * 10000 (for integer storage)
  performanceTier: text('performance_tier').notNull().default('curated'), // viral, high, curated, community

  // Content analysis
  wordCount: integer('word_count').notNull(),
  characterCount: integer('character_count').notNull(),
  hasQuestion: integer('has_question').notNull().default(0),
  hasNumbers: integer('has_numbers').notNull().default(0),
  hasCta: integer('has_cta').notNull().default(0),
  emotionalIntensity: text('emotional_intensity'), // high, medium, low
  psychologicalAngle: text('psychological_angle'), // Contrarian, Authority, Urgency, etc.

  // Source tracking
  source: text('source'), // external, user_approved, generated
  sourceUrl: text('source_url'),
  contributorId: text('contributor_id'), // user who contributed (if applicable)

  // Vectorize reference
  vectorizeId: text('vectorize_id').notNull(), // ID in Vectorize index for lookups
  embeddingModel: text('embedding_model').notNull().default('bge-base-en-v1.5'),

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const hookCategories = sqliteTable('hook_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  hookCount: integer('hook_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const hookSimilarityLog = sqliteTable('hook_similarity_log', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  queryContent: text('query_content').notNull(),
  queryPlatform: text('query_platform'),
  topMatchId: text('top_match_id'),
  topMatchScore: integer('top_match_score'), // Stored as score * 10000 for integer storage
  matchCount: integer('match_count').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export type Hook = typeof hooks.$inferSelect;
export type HookInsert = typeof hooks.$inferInsert;
export type HookCategory = typeof hookCategories.$inferSelect;
export type HookSimilarityLog = typeof hookSimilarityLog.$inferSelect;
