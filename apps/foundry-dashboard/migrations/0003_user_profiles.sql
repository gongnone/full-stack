-- Migration: Add user_profiles table for profile customization
-- Story: 1-5-user-profile-and-settings
-- Date: 2025-12-21

-- Create user_profiles table for storing editable profile data
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  avatar_color TEXT DEFAULT '#1D9BF0',
  timezone TEXT DEFAULT 'UTC',
  email_notifications INTEGER DEFAULT 1,
  preferences_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Create index for fast user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Trigger to auto-create profile when user is created
-- Note: Better Auth creates users, so we need to handle profile creation in application code
