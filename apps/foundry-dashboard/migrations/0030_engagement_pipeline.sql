-- Migration 0030: Engagement Data Pipeline (Epic 11)
-- Stores platform OAuth connections and engagement metrics for the G7 prediction model

-- Platform OAuth connections (Twitter, LinkedIn, etc.)
CREATE TABLE IF NOT EXISTS platform_connections (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'instagram', 'tiktok'
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at INTEGER,
  platform_user_id TEXT,
  platform_username TEXT,
  scopes TEXT, -- comma-separated scopes granted
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'revoked'
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_platform_connections_client 
  ON platform_connections(client_id, platform);

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_connections_unique 
  ON platform_connections(client_id, platform) 
  WHERE status = 'active';

-- Per-spoke engagement metrics (one row per spoke per platform)
CREATE TABLE IF NOT EXISTS engagement_metrics (
  id TEXT PRIMARY KEY,
  spoke_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  external_post_id TEXT, -- platform's post ID (for deduplication)
  external_post_url TEXT, -- direct link to the post
  impressions INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  engagement_rate REAL NOT NULL DEFAULT 0, -- (likes+comments+shares) / impressions
  is_manual_entry INTEGER NOT NULL DEFAULT 0, -- 1 if manually entered
  published_at INTEGER,
  fetched_at INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_engagement_metrics_spoke 
  ON engagement_metrics(spoke_id);

CREATE INDEX IF NOT EXISTS idx_engagement_metrics_client_platform 
  ON engagement_metrics(client_id, platform);

CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_metrics_dedup 
  ON engagement_metrics(spoke_id, platform, external_post_id) 
  WHERE external_post_id IS NOT NULL;

-- Time-series snapshots for trend analysis
CREATE TABLE IF NOT EXISTS engagement_snapshots (
  id TEXT PRIMARY KEY,
  metric_id TEXT NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  engagement_rate REAL NOT NULL DEFAULT 0,
  snapshot_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (metric_id) REFERENCES engagement_metrics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_engagement_snapshots_metric 
  ON engagement_snapshots(metric_id, snapshot_at);

-- G7 prediction scores (Epic 12 - created now to avoid future migration)
CREATE TABLE IF NOT EXISTS g7_predictions (
  id TEXT PRIMARY KEY,
  spoke_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  g7_score REAL NOT NULL DEFAULT 0, -- 0-10 predicted engagement score
  hook_similarity_score REAL DEFAULT 0, -- component: similarity to winning hooks
  g2_quality_score REAL DEFAULT 0, -- component: G2 content quality
  platform_optimization_score REAL DEFAULT 0, -- component: platform-specific optimization
  timing_score REAL DEFAULT 0, -- component: posting time optimization
  confidence REAL DEFAULT 0, -- 0-1 confidence in prediction
  model_version TEXT NOT NULL DEFAULT 'v1-heuristic',
  calculated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_g7_predictions_spoke 
  ON g7_predictions(spoke_id, platform);

CREATE INDEX IF NOT EXISTS idx_g7_predictions_client_score 
  ON g7_predictions(client_id, g7_score DESC);

-- Winning hooks index tracking (for Vectorize sync)
CREATE TABLE IF NOT EXISTS winning_hooks (
  id TEXT PRIMARY KEY,
  client_id TEXT, -- NULL for global hooks
  hook_text TEXT NOT NULL,
  platform TEXT NOT NULL,
  engagement_rate REAL NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'curated', -- 'curated', 'client_history', 'import'
  vectorize_id TEXT, -- ID in Vectorize index
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_winning_hooks_platform 
  ON winning_hooks(platform, engagement_rate DESC);
