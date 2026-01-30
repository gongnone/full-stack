-- Migration: Add G7 engagement prediction columns to spoke_evaluations table
-- Story: 4.6 - G7 Engagement Prediction Gate
-- Date: 2026-01-19

-- Alter g7_score from INTEGER to REAL for decimal precision
-- Note: SQLite doesn't support ALTER COLUMN TYPE directly
-- We need to use a temporary column approach

-- Step 1: Add new REAL column with temporary name
ALTER TABLE spoke_evaluations ADD COLUMN g7_score_new REAL;

-- Step 2: Copy existing data (converting INTEGER to REAL)
UPDATE spoke_evaluations SET g7_score_new = CAST(g7_score AS REAL);

-- Step 3: Drop old INTEGER column (SQLite limitation workaround)
-- CREATE a new table with the correct schema
CREATE TABLE spoke_evaluations_new (
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
  updated_at TEXT
);

-- Step 4: Copy data from old table to new table
INSERT INTO spoke_evaluations_new
SELECT
  id,
  spoke_id,
  account_id,
  client_id,
  g2_score,
  g2_breakdown,
  g4_result,
  g4_violations,
  g4_similarity_score,
  g5_result,
  g5_violations,
  g7_score_new, -- Use the converted REAL value
  NULL, -- g7_benchmark (new column)
  NULL, -- g7_source (new column)
  overall_pass,
  critic_notes,
  created_at,
  updated_at
FROM spoke_evaluations;

-- Step 5: Drop old table
DROP TABLE spoke_evaluations;

-- Step 6: Rename new table to original name
ALTER TABLE spoke_evaluations_new RENAME TO spoke_evaluations;

-- Step 7: Recreate foreign key constraints (if any)
-- Note: SQLite foreign keys are preserved in the CREATE TABLE statement above

-- Verification query (uncomment to test):
-- PRAGMA table_info(spoke_evaluations);
