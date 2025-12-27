-- Story 4.1: Deterministic Spoke Fracturing
-- Creates spokes table for platform-specific content generated from pillars

-- Main spokes table
CREATE TABLE IF NOT EXISTS spokes (
  id TEXT PRIMARY KEY,
  hub_id TEXT NOT NULL,
  pillar_id TEXT NOT NULL,
  client_id TEXT NOT NULL,

  -- Content fields
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'tiktok', 'instagram', 'newsletter', 'thread', 'carousel')),
  content TEXT NOT NULL,
  psychological_angle TEXT NOT NULL CHECK (psychological_angle IN ('Contrarian', 'Authority', 'Urgency', 'Aspiration', 'Fear', 'Curiosity', 'Transformation', 'Rebellion')),

  -- Status and tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'approved', 'rejected', 'killed', 'failed')),
  generation_attempt INTEGER DEFAULT 0,

  -- Quality scores (populated in Story 4.2)
  g2_score INTEGER DEFAULT NULL,  -- Hook strength 0-100
  g4_status TEXT DEFAULT NULL,    -- Voice alignment pass/fail
  g5_status TEXT DEFAULT NULL,    -- Platform compliance pass/fail

  -- Metadata
  is_mutated INTEGER DEFAULT 0,   -- 1 if user-edited (survives Kill Chain)
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE,
  FOREIGN KEY (pillar_id) REFERENCES extracted_pillars(id) ON DELETE CASCADE
);

-- Indexes for efficient queries (Rule 1: Client isolation)
CREATE INDEX IF NOT EXISTS idx_spokes_client_id ON spokes(client_id);
CREATE INDEX IF NOT EXISTS idx_spokes_hub_id ON spokes(hub_id);
CREATE INDEX IF NOT EXISTS idx_spokes_pillar_id ON spokes(pillar_id);
CREATE INDEX IF NOT EXISTS idx_spokes_platform ON spokes(platform);
CREATE INDEX IF NOT EXISTS idx_spokes_status ON spokes(status);

-- Spoke generation progress tracking
CREATE TABLE IF NOT EXISTS spoke_generation_progress (
  hub_id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  total_pillars INTEGER NOT NULL DEFAULT 0,
  completed_pillars INTEGER NOT NULL DEFAULT 0,
  total_spokes INTEGER NOT NULL DEFAULT 0,
  completed_spokes INTEGER NOT NULL DEFAULT 0,
  current_pillar_id TEXT,
  current_pillar_name TEXT,
  error_message TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spoke_gen_progress_client ON spoke_generation_progress(client_id);
