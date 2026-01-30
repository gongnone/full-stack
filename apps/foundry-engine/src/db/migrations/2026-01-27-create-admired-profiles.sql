-- Migration: Create admired_profiles table
-- Story: 4.7 - Admired Profiles Management
-- Date: 2026-01-27

CREATE TABLE IF NOT EXISTS admired_profiles (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  avatar_url TEXT,
  follower_count INTEGER DEFAULT 0,
  bio TEXT,
  post_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'syncing', 'active', 'error', 'rate_limited')),
  error_message TEXT,
  last_synced TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE(client_id, instagram_handle)
);

-- Index for querying profiles by client
CREATE INDEX IF NOT EXISTS idx_admired_profiles_client_id ON admired_profiles(client_id);

-- Index for finding profiles that need re-sync (weekly cron job)
CREATE INDEX IF NOT EXISTS idx_admired_profiles_status ON admired_profiles(status);

-- Index for finding stale profiles (last_synced + status)
CREATE INDEX IF NOT EXISTS idx_admired_profiles_last_synced ON admired_profiles(last_synced);
