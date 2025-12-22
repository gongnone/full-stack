-- Migration: Add training_samples table for Brand DNA content analysis
-- Story: 2-1-multi-source-content-ingestion-for-brand-analysis
-- Date: 2025-12-21

-- Training samples table for storing uploaded content for Brand DNA analysis
-- Each sample is tied to a client and used to learn voice patterns
CREATE TABLE IF NOT EXISTS training_samples (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  -- TODO: Add FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  -- when clients table is created in Epic 7 (Multi-Client Agency Operations)
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Content metadata
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'pasted_text', 'article', 'transcript', 'voice')),

  -- Storage reference (R2 path for files, null for pasted text)
  r2_key TEXT,

  -- Content analysis
  word_count INTEGER NOT NULL DEFAULT 0,
  character_count INTEGER NOT NULL DEFAULT 0,
  extracted_text TEXT, -- Extracted/parsed content for analysis

  -- Quality and processing status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'analyzed', 'failed')),
  quality_score REAL, -- 0-100 score after analysis
  quality_notes TEXT, -- JSON array of quality indicators

  -- Error tracking
  error_message TEXT,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  analyzed_at INTEGER,

  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Index for fast client-scoped queries (Rule 1: Isolation Above All)
CREATE INDEX IF NOT EXISTS idx_training_samples_client_id ON training_samples(client_id);
CREATE INDEX IF NOT EXISTS idx_training_samples_user_id ON training_samples(user_id);
CREATE INDEX IF NOT EXISTS idx_training_samples_status ON training_samples(status);
CREATE INDEX IF NOT EXISTS idx_training_samples_created_at ON training_samples(created_at DESC);
