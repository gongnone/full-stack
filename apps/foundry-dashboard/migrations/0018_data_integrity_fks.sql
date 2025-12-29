-- Story 9.7: Database Foreign Key Constraints
-- Adds missing foreign key constraints to ensure data integrity and cascade deletions
--
-- IMPORTANT: D1 requires PRAGMA foreign_keys = ON to be set per-connection.
-- The application should execute this pragma at the start of each request.
-- This migration recreates tables with FK constraints defined in schema.

-- Enable foreign keys for this migration session
PRAGMA foreign_keys = ON;

-- 1. hubs(client_id) -> clients(id)
-- Note: SQLite doesn't support adding FKs via ALTER TABLE.
-- We must recreate the tables or accept application-level integrity for some.
-- However, for Story 9.7, we will implement the most critical ones using recreation if needed.

-- For D1, it's safer to use application-level checks for existing tables if they are large.
-- But for this project, tables are small enough to recreate.

-- Recreate training_samples with client_id FK
CREATE TABLE training_samples_new (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('posts', 'articles', 'transcripts', 'pasted_text', 'pdf', 'url', 'voice')),
  r2_key TEXT,
  extracted_text TEXT,
  quality_score REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'analyzed', 'failed')),
  word_count INTEGER,
  character_count INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

INSERT INTO training_samples_new SELECT * FROM training_samples;
DROP TABLE training_samples;
ALTER TABLE training_samples_new RENAME TO training_samples;

-- Recreate brand_dna with client_id FK
CREATE TABLE brand_dna_new (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  client_id TEXT NOT NULL UNIQUE,
  strength_score REAL NOT NULL DEFAULT 0,
  tone_profile TEXT NOT NULL DEFAULT '{}',
  signature_patterns TEXT NOT NULL DEFAULT '[]',
  primary_tone TEXT,
  writing_style TEXT,
  target_audience TEXT,
  last_calibration_at INTEGER NOT NULL DEFAULT (unixepoch()),
  calibration_source TEXT DEFAULT 'content_upload',
  sample_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  voice_entities TEXT DEFAULT '{"bannedWords":[],"voiceMarkers":[],"stances":[]}',
  last_voice_recording_at INTEGER DEFAULT 0,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

INSERT INTO brand_dna_new SELECT * FROM brand_dna;
DROP TABLE brand_dna;
ALTER TABLE brand_dna_new RENAME TO brand_dna;

-- Recreate hubs with client_id FK
CREATE TABLE hubs_new (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'text', 'url')),
  pillar_count INTEGER NOT NULL DEFAULT 0,
  spoke_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('processing', 'ready', 'archived')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES hub_sources(id) ON DELETE CASCADE
);

INSERT INTO hubs_new SELECT * FROM hubs;
DROP TABLE hubs;
ALTER TABLE hubs_new RENAME TO hubs;

-- Update extracted_pillars to include hub_id FK
CREATE TABLE extracted_pillars_new (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  hub_id TEXT,
  title TEXT NOT NULL,
  core_claim TEXT,
  psychological_angle TEXT,
  estimated_spoke_count INTEGER DEFAULT 0,
  supporting_points TEXT DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (source_id) REFERENCES hub_sources(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE
);

INSERT INTO extracted_pillars_new SELECT * FROM extracted_pillars;
DROP TABLE extracted_pillars;
ALTER TABLE extracted_pillars_new RENAME TO extracted_pillars;

-- Add indexes on FK columns for query performance
CREATE INDEX IF NOT EXISTS idx_training_samples_client_id ON training_samples(client_id);
CREATE INDEX IF NOT EXISTS idx_training_samples_user_id ON training_samples(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_dna_client_id ON brand_dna(client_id);
CREATE INDEX IF NOT EXISTS idx_hubs_client_id ON hubs(client_id);
CREATE INDEX IF NOT EXISTS idx_hubs_user_id ON hubs(user_id);
CREATE INDEX IF NOT EXISTS idx_hubs_source_id ON hubs(source_id);
CREATE INDEX IF NOT EXISTS idx_extracted_pillars_client_id ON extracted_pillars(client_id);
CREATE INDEX IF NOT EXISTS idx_extracted_pillars_hub_id ON extracted_pillars(hub_id);
CREATE INDEX IF NOT EXISTS idx_extracted_pillars_source_id ON extracted_pillars(source_id);
