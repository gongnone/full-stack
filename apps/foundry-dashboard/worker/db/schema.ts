/**
 * Database schema for Foundry Dashboard
 *
 * This is a local copy of relevant schema definitions for Foundry.
 * Maintains architecture isolation from Legacy @repo/data-ops.
 */
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

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

// === TYPE EXPORTS ===

export type TrainingSample = typeof training_samples.$inferSelect;
export type TrainingSampleInsert = typeof training_samples.$inferInsert;
export type BrandDNA = typeof brand_dna.$inferSelect;
export type Client = typeof clients.$inferSelect;
