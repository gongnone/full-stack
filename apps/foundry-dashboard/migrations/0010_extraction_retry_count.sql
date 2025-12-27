-- Story 3.5: Real-Time Ingestion Progress
-- Add retry_count tracking to extraction_progress table

ALTER TABLE extraction_progress ADD COLUMN retry_count INTEGER DEFAULT 0;
