-- Story 9.2: Drift Detection Implementation
-- Creates brand_dna_snapshots table for storing historical Brand DNA snapshots
-- Used to calculate brand voice drift over time (FR37)

-- Brand DNA snapshots for drift calculation
CREATE TABLE IF NOT EXISTS brand_dna_snapshots (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  -- Snapshot of Brand DNA state at this point in time
  strength_score REAL NOT NULL DEFAULT 0,
  voice_markers TEXT NOT NULL DEFAULT '[]',  -- JSON array of voice marker phrases
  banned_words TEXT NOT NULL DEFAULT '[]',   -- JSON array of banned words
  stances TEXT NOT NULL DEFAULT '[]',        -- JSON array of {topic, position}
  primary_tone TEXT,
  writing_style TEXT,
  target_audience TEXT,
  -- Metadata
  snapshot_reason TEXT DEFAULT 'scheduled',  -- scheduled | manual | significant_change
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Index for efficient client and time-based queries
CREATE INDEX IF NOT EXISTS idx_brand_dna_snapshots_client_time
  ON brand_dna_snapshots(client_id, created_at DESC);

-- Add drift_threshold column to clients table for configurable thresholds (default 25)
ALTER TABLE clients ADD COLUMN drift_threshold INTEGER DEFAULT 25;
