-- Migration: Add missing OAuth columns to account table
-- Issue: Better Auth OAuth flow fails with 500 because these columns don't exist
-- Better Auth expects: id_token, scope, refresh_token_expires_at
-- See: https://www.better-auth.com/docs/concepts/users-accounts

-- Add id_token column (stores the OIDC ID token from provider)
ALTER TABLE account ADD COLUMN id_token TEXT;

-- Add scope column (stores OAuth scopes granted by provider)
ALTER TABLE account ADD COLUMN scope TEXT;

-- Add refresh_token_expires_at column (when refresh token expires)
ALTER TABLE account ADD COLUMN refresh_token_expires_at INTEGER;
