-- Story 2.3: Brand DNA Analysis & Scoring
-- Creates brand_dna table for storing analyzed brand voice profiles
-- Uses singleton pattern per client (one record per client_id)

CREATE TABLE IF NOT EXISTS brand_dna (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  client_id TEXT NOT NULL UNIQUE,  -- Singleton per client
  strength_score REAL NOT NULL DEFAULT 0,
  tone_profile TEXT NOT NULL DEFAULT '{}',  -- JSON: {tone_match: 85, vocabulary: 78, structure: 75, topics: 82}
  signature_patterns TEXT NOT NULL DEFAULT '[]',  -- JSON array of detected phrases
  primary_tone TEXT,  -- e.g., "Candid & Direct", "Warm & Approachable"
  writing_style TEXT,  -- e.g., "Conversational", "Technical", "Story-driven"
  target_audience TEXT,  -- e.g., "B2B SaaS founders", "Creative professionals"
  last_calibration_at INTEGER NOT NULL DEFAULT (unixepoch()),
  calibration_source TEXT DEFAULT 'content_upload',  -- content_upload | voice_note | manual
  sample_count INTEGER NOT NULL DEFAULT 0,  -- Number of samples used in analysis
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Index for fast client lookups (Rule 1: Isolation Above All)
CREATE INDEX IF NOT EXISTS idx_brand_dna_client_id ON brand_dna(client_id);
