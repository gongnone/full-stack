-- Migration to add missing tables that were defined in schema.ts but never migrated
-- This fixes TD-1 integration test failures

-- brand_dna_sessions (used by clients.list query and onboarding flows)
CREATE TABLE IF NOT EXISTS brand_dna_sessions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL, -- 'active', 'completed', 'abandoned'
  mode TEXT DEFAULT 'voice' NOT NULL, -- 'voice', 'text-only', 'express'
  current_step TEXT DEFAULT 'welcome', -- tracks wizard progress
  voice_analysis TEXT, -- JSON: { tone, vocabulary, personality_markers }
  total_transcription TEXT,
  total_duration_seconds INTEGER DEFAULT 0,
  recording_count INTEGER DEFAULT 0,
  express_answers TEXT, -- JSON: { tagline, toneWords, platform }
  competitors TEXT, -- JSON: [{ name, url }] - max 3
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_brand_dna_sessions_client ON brand_dna_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_brand_dna_sessions_status ON brand_dna_sessions(status);

-- client_onboard_tokens (used by Story 10-1 for Brand DNA invitations)
CREATE TABLE IF NOT EXISTS client_onboard_tokens (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_onboard_tokens_token ON client_onboard_tokens(token);
CREATE INDEX IF NOT EXISTS idx_onboard_tokens_client ON client_onboard_tokens(client_id);

-- voice_recordings (used by brand DNA voice capture flows)
CREATE TABLE IF NOT EXISTS voice_recordings (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  transcription TEXT,
  duration_seconds INTEGER,
  file_size INTEGER NOT NULL,
  format TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'transcribing', 'completed', 'failed'
  error_message TEXT,
  created_at INTEGER NOT NULL,
  transcribed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_voice_recordings_session ON voice_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_client ON voice_recordings(client_id);
