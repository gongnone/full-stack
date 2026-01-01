-- Rollback for Story 9.7: Database Foreign Key Constraints
-- Removes FK constraints by recreating tables without them
-- WARNING: This will lose referential integrity protection

-- Drop indexes first
DROP INDEX IF EXISTS idx_training_samples_client_id;
DROP INDEX IF EXISTS idx_training_samples_user_id;
DROP INDEX IF EXISTS idx_brand_dna_client_id;
DROP INDEX IF EXISTS idx_hubs_client_id;
DROP INDEX IF EXISTS idx_hubs_user_id;
DROP INDEX IF EXISTS idx_hubs_source_id;
DROP INDEX IF EXISTS idx_extracted_pillars_client_id;
DROP INDEX IF EXISTS idx_extracted_pillars_hub_id;
DROP INDEX IF EXISTS idx_extracted_pillars_source_id;

-- Recreate training_samples without FK constraints
CREATE TABLE training_samples_old (
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
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO training_samples_old SELECT * FROM training_samples;
DROP TABLE training_samples;
ALTER TABLE training_samples_old RENAME TO training_samples;

-- Recreate brand_dna without FK constraints
CREATE TABLE brand_dna_old (
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
  last_voice_recording_at INTEGER DEFAULT 0
);

INSERT INTO brand_dna_old SELECT * FROM brand_dna;
DROP TABLE brand_dna;
ALTER TABLE brand_dna_old RENAME TO brand_dna;

-- Recreate hubs without FK constraints
CREATE TABLE hubs_old (
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
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO hubs_old SELECT * FROM hubs;
DROP TABLE hubs;
ALTER TABLE hubs_old RENAME TO hubs;

-- Recreate extracted_pillars without FK constraints
CREATE TABLE extracted_pillars_old (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  hub_id TEXT,
  title TEXT NOT NULL,
  core_claim TEXT,
  psychological_angle TEXT,
  estimated_spoke_count INTEGER DEFAULT 0,
  supporting_points TEXT DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO extracted_pillars_old SELECT * FROM extracted_pillars;
DROP TABLE extracted_pillars;
ALTER TABLE extracted_pillars_old RENAME TO extracted_pillars;
