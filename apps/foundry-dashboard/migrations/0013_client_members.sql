-- Migration: 0013_client_members.sql
CREATE TABLE IF NOT EXISTS client_members (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Unique constraint to prevent duplicate memberships
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_members_unique ON client_members(client_id, user_id);
CREATE INDEX IF NOT EXISTS idx_client_members_user ON client_members(user_id);
