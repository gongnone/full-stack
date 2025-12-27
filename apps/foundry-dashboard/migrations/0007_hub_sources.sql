-- Story 3-1: Source Selection & Upload Wizard
-- Creates hub_sources table for tracking uploaded source materials before Hub extraction

CREATE TABLE IF NOT EXISTS hub_sources (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Source metadata
  title TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'text', 'url')),

  -- Storage (R2 for files, inline for text/URLs)
  r2_key TEXT,
  raw_content TEXT,
  url TEXT,

  -- Stats
  character_count INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,

  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  error_message TEXT,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
  -- Note: client_id FK not added - clients table doesn't exist yet (Epic 7)
  -- When Epic 7 implemented, add: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Indexes for client isolation and recent sources query
CREATE INDEX IF NOT EXISTS idx_hub_sources_client_id ON hub_sources(client_id);
CREATE INDEX IF NOT EXISTS idx_hub_sources_user_id ON hub_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_sources_created_at ON hub_sources(created_at DESC);
