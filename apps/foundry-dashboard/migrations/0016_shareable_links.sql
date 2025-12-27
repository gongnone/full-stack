-- Migration: 0016_shareable_links.sql
CREATE TABLE IF NOT EXISTS shareable_links (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    permissions TEXT DEFAULT 'view',
    allowed_emails TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_shareable_links_token ON shareable_links(token);
CREATE INDEX idx_shareable_links_client ON shareable_links(client_id);
