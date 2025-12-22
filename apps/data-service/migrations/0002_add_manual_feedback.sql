-- Migration: 0002_add_manual_feedback.sql

ALTER TABLE spokes ADD COLUMN manual_feedback_note TEXT;

-- Update the status column to include new states
-- Drizzle's SQLite dialect does not support ALTER COLUMN TYPE for enums directly.
-- The recommended approach for Drizzle D1 with enums is to either:
-- 1. Create a new column with the desired type, copy data, drop old, rename new.
-- 2. Use a CHECK constraint if only client-side validation is needed, or manage in app logic.
-- For simplicity, and since `status` is already TEXT, we will rely on app-level validation
-- for the new states: 'pending_manual_rewrite' and 'discarded'.
