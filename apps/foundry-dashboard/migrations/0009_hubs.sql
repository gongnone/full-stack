-- Story 3.4: Hub Metadata & State Management
-- Creates hubs table for Hub registry and links pillars to Hubs

-- Main hubs table (D1 global registry)
CREATE TABLE IF NOT EXISTS hubs (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  source_id TEXT NOT NULL,

  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'text', 'url')),

  pillar_count INTEGER NOT NULL DEFAULT 0,
  spoke_count INTEGER NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('processing', 'ready', 'archived')),

  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES hub_sources(id) ON DELETE CASCADE
);

-- Indexes for client isolation and common queries
CREATE INDEX IF NOT EXISTS idx_hubs_client_id ON hubs(client_id);
CREATE INDEX IF NOT EXISTS idx_hubs_user_id ON hubs(user_id);
CREATE INDEX IF NOT EXISTS idx_hubs_status ON hubs(status);
CREATE INDEX IF NOT EXISTS idx_hubs_created_at ON hubs(created_at DESC);

-- Add hub_id column to extracted_pillars for Hub association
-- Note: SQLite ALTER TABLE has limited support, so we add column without FK constraint
-- Referential integrity enforced at application level
ALTER TABLE extracted_pillars ADD COLUMN hub_id TEXT;

-- Index for efficient pillar lookup by Hub
CREATE INDEX IF NOT EXISTS idx_extracted_pillars_hub_id ON extracted_pillars(hub_id);
