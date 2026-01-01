-- Story 2.4: Brand DNA Report Dashboard
-- ROLLBACK migration for topics_to_avoid column
-- Run this if you need to revert migration 0006

-- WARNING: This will permanently delete all topics_to_avoid data
-- Backup your database before running this rollback

-- SQLite does not support DROP COLUMN directly
-- To rollback, you must:
-- 1. Create a new table without topics_to_avoid column
-- 2. Copy data from old table
-- 3. Drop old table
-- 4. Rename new table

-- This is a destructive operation - use with caution in production
-- For development: Just reset the database

-- Example rollback procedure (manual):
-- BEGIN TRANSACTION;
-- CREATE TABLE brand_dna_backup AS SELECT
--   id, client_id, strength_score, tone_profile, signature_patterns,
--   primary_tone, writing_style, target_audience,
--   last_calibration_at, calibration_source, sample_count,
--   created_at, updated_at
-- FROM brand_dna;
-- DROP TABLE brand_dna;
-- ALTER TABLE brand_dna_backup RENAME TO brand_dna;
-- COMMIT;
