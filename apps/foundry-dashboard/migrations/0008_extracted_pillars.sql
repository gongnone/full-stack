-- Story 3.2: Thematic Extraction Engine
-- Add tables for persistent extraction progress and pillars

-- Extracted pillars from hub sources
CREATE TABLE IF NOT EXISTS extracted_pillars (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  core_claim TEXT NOT NULL,
  psychological_angle TEXT NOT NULL CHECK (psychological_angle IN ('Contrarian', 'Authority', 'Urgency', 'Aspiration', 'Fear', 'Curiosity', 'Transformation', 'Rebellion')),
  estimated_spoke_count INTEGER DEFAULT 5,
  supporting_points TEXT, -- JSON array of strings
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (source_id) REFERENCES hub_sources(id) ON DELETE CASCADE
);

CREATE INDEX idx_extracted_pillars_source_id ON extracted_pillars(source_id);
CREATE INDEX idx_extracted_pillars_client_id ON extracted_pillars(client_id);

-- Extraction progress tracking
CREATE TABLE IF NOT EXISTS extraction_progress (
  source_id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  current_stage TEXT DEFAULT 'parsing' CHECK (current_stage IN ('parsing', 'themes', 'claims', 'pillars')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  stage_message TEXT,
  error_message TEXT,
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (source_id) REFERENCES hub_sources(id) ON DELETE CASCADE
);
