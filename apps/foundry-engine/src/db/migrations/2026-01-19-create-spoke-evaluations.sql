-- Migration: Create spoke_evaluations table with G7 columns
-- Story: 4.6 - G7 Engagement Prediction Gate
-- Date: 2026-01-19

CREATE TABLE IF NOT EXISTS spoke_evaluations (
  id TEXT PRIMARY KEY,
  spoke_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  g2_score INTEGER NOT NULL,
  g2_breakdown TEXT,
  g4_result TEXT NOT NULL CHECK(g4_result IN ('pass', 'fail')),
  g4_violations TEXT,
  g4_similarity_score REAL,
  g5_result TEXT NOT NULL CHECK(g5_result IN ('pass', 'fail')),
  g5_violations TEXT,
  g7_score REAL,
  g7_benchmark REAL,
  g7_source TEXT,
  overall_pass INTEGER NOT NULL CHECK(overall_pass IN (0, 1)),
  critic_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (spoke_id) REFERENCES spokes(id),
  FOREIGN KEY (account_id) REFERENCES account(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Create index on spoke_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_spoke_evaluations_spoke_id ON spoke_evaluations(spoke_id);

-- Create index on client_id for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_spoke_evaluations_client_id ON spoke_evaluations(client_id);
