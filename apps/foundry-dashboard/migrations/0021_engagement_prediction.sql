-- Epic 12-1: G7 Engagement Prediction Algorithm
-- Adds engagement prediction scoring to spokes for "Golden Nugget" filtering

-- Add engagement prediction fields to spokes table
ALTER TABLE spokes ADD COLUMN engagement_prediction REAL DEFAULT NULL;
-- Scale 0.0-10.0, where 9+ = "Golden Nugget"

ALTER TABLE spokes ADD COLUMN engagement_confidence TEXT DEFAULT NULL;
-- 'low' = heuristic only, 'medium' = some training data, 'high' = ML-trained

ALTER TABLE spokes ADD COLUMN engagement_factors TEXT DEFAULT NULL;
-- JSON: { hook: 2.5, platform: 2.0, signals: 1.8, emotional: 1.2, drivers: 1.0 }

-- Index for Golden Nugget filtering (engagement_prediction > 9)
CREATE INDEX IF NOT EXISTS idx_spokes_engagement ON spokes(client_id, engagement_prediction DESC);

-- Engagement training data (for future ML model)
CREATE TABLE IF NOT EXISTS engagement_training_data (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  spoke_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  content_hash TEXT NOT NULL, -- For deduplication

  -- Predicted scores (at generation time)
  predicted_engagement REAL NOT NULL,
  predicted_confidence TEXT NOT NULL,

  -- Actual performance (filled in after publishing)
  actual_engagement_rate REAL, -- (likes + comments + shares) / impressions
  actual_performance_tier TEXT, -- 'viral', 'high', 'average', 'low', 'flop'

  -- Timing
  predicted_at INTEGER NOT NULL,
  published_at INTEGER,
  metrics_recorded_at INTEGER,

  -- For model training
  feature_vector TEXT, -- JSON: normalized features used for prediction

  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_engagement_training_client ON engagement_training_data(client_id);
CREATE INDEX IF NOT EXISTS idx_engagement_training_performance ON engagement_training_data(actual_performance_tier);
