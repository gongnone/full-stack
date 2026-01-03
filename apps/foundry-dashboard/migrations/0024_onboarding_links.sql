-- Migration to add onboarding_links table
-- Story 1.5-7-6: Self-Serve Client Onboarding Links
-- This table was defined in schema.ts but never migrated

CREATE TABLE IF NOT EXISTS onboarding_links (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  prefill_name TEXT,
  expires_at INTEGER NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_onboarding_links_token ON onboarding_links(token);
CREATE INDEX IF NOT EXISTS idx_onboarding_links_creator ON onboarding_links(creator_id);

-- Also add testimonials table if missing (Story 1.5-8)
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'video', 'audio', 'text'
  content TEXT, -- Text content or transcript
  r2_key TEXT, -- Video/audio file
  thumbnail_url TEXT,
  duration INTEGER, -- Duration in seconds for video/audio
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'public'
  public_permission INTEGER DEFAULT 0, -- 1 = allowed for public use
  trigger_event TEXT, -- 'batch_approval', 'milestone', 'manual'
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  approved_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_testimonials_client ON testimonials(client_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
