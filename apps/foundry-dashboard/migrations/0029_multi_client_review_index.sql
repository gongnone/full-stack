-- P0-2.1: Multi-Client Agency Sprint - Performance Indexes
-- Optimize multi-client review queries for fast sorting and filtering

-- Index on (client_id, status, g7_engagement) for top10/golden-nuggets filter
-- This supports queries like: SELECT * FROM spokes WHERE client_id IN (?, ?, ?) AND status = 'pending_review' ORDER BY g7_engagement DESC
CREATE INDEX IF NOT EXISTS idx_spokes_client_status_g7
ON spokes(client_id, status, g7_engagement DESC);

-- Index on (client_id, created_at) for chronological queries (all/just-generated filters)
-- This supports queries like: SELECT * FROM spokes WHERE client_id IN (?, ?, ?) ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_spokes_client_created
ON spokes(client_id, created_at DESC);
