-- Story 3.6: Pillar-First Hub Creation
-- Adds 'pillars' to hub_sources.source_type CHECK constraint
-- SQLite requires table recreation for CHECK constraint changes

-- Step 1: Create new table with updated CHECK constraint
CREATE TABLE hub_sources_new (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Source metadata
  title TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'text', 'url', 'pillars')),

  -- Storage (R2 for files, inline for text/URLs)
  r2_key TEXT,
  raw_content TEXT,
  url TEXT,

  -- Stats (optional for pillar sources)
  character_count INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,

  -- Extracted themes from AI processing
  extracted_themes TEXT,

  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  error_message TEXT,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Step 2: Copy existing data
INSERT INTO hub_sources_new (id, client_id, user_id, title, source_type, r2_key, raw_content, url, character_count, word_count, status, error_message, created_at, updated_at)
SELECT id, client_id, user_id, title, source_type, r2_key, raw_content, url, character_count, word_count, status, error_message, created_at, updated_at
FROM hub_sources;

-- Step 3: Drop old table
DROP TABLE hub_sources;

-- Step 4: Rename new table
ALTER TABLE hub_sources_new RENAME TO hub_sources;

-- Step 5: Recreate indexes for hub_sources
CREATE INDEX IF NOT EXISTS idx_hub_sources_client_id ON hub_sources(client_id);
CREATE INDEX IF NOT EXISTS idx_hub_sources_user_id ON hub_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_sources_created_at ON hub_sources(created_at DESC);

-- ============================================================
-- Also update hubs table to allow 'pillars' source_type
-- ============================================================

-- Step 6: Create new hubs table with updated CHECK constraint
CREATE TABLE hubs_new (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  source_id TEXT NOT NULL,

  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'text', 'url', 'pillars')),

  pillar_count INTEGER NOT NULL DEFAULT 0,
  spoke_count INTEGER NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('processing', 'ready', 'archived')),

  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES hub_sources(id) ON DELETE CASCADE
);

-- Step 7: Copy existing hubs data
INSERT INTO hubs_new (id, client_id, user_id, source_id, title, source_type, pillar_count, spoke_count, status, created_at, updated_at)
SELECT id, client_id, user_id, source_id, title, source_type, pillar_count, spoke_count, status, created_at, updated_at
FROM hubs;

-- Step 8: Drop old hubs table
DROP TABLE hubs;

-- Step 9: Rename new hubs table
ALTER TABLE hubs_new RENAME TO hubs;

-- Step 10: Recreate indexes for hubs
CREATE INDEX IF NOT EXISTS idx_hubs_client_id ON hubs(client_id);
CREATE INDEX IF NOT EXISTS idx_hubs_user_id ON hubs(user_id);
CREATE INDEX IF NOT EXISTS idx_hubs_status ON hubs(status);
CREATE INDEX IF NOT EXISTS idx_hubs_created_at ON hubs(created_at DESC);
