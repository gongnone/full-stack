-- Migration: 0014_active_client.sql
ALTER TABLE user_profiles ADD COLUMN active_client_id TEXT REFERENCES clients(id);
