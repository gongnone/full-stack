-- Migration: Cleanup Duplicate Auth Tables
-- Issue: Database had 17 tables instead of 4 due to multiple auth migrations
-- Solution: Drop duplicate auth_* prefixed tables and unused plural tables
-- Keep: Better Auth singular tables (user, session, account, verification)

-- Drop auth_* prefixed duplicate tables
DROP TABLE IF EXISTS auth_verifications;
DROP TABLE IF EXISTS auth_sessions;
DROP TABLE IF EXISTS auth_accounts;
DROP TABLE IF EXISTS auth_users;

-- Drop unused application tables (these will be recreated if needed in Epic 7)
DROP TABLE IF EXISTS workflow_instances;
DROP TABLE IF EXISTS export_jobs;
DROP TABLE IF EXISTS global_metrics;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS accounts;

-- Note: sqlite_sequence and _cf_KV are system tables and cannot be dropped

-- Result: Database should have ONLY 4 tables:
-- 1. user
-- 2. session
-- 3. account
-- 4. verification
