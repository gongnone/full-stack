-- Migration: 0012_clients.sql
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    industry TEXT,
    contact_email TEXT,
    logo_url TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Add index for status and name
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_name ON clients(name);
