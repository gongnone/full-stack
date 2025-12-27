-- Migration: 0002_better_auth
-- Description: Better Auth tables for authentication
-- Created: 2024-12-21

-- ==========================================
-- BETTER AUTH TABLES
-- ==========================================

-- Users table (extends our existing users table concept)
CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER DEFAULT 0,
  image TEXT,
  account_id TEXT,
  role TEXT DEFAULT 'editor',
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessions table
CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expiresAt TEXT NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Accounts table (OAuth providers)
CREATE TABLE IF NOT EXISTS auth_accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt TEXT,
  refreshTokenExpiresAt TEXT,
  scope TEXT,
  idToken TEXT,
  password TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Verification tokens (email verification, password reset)
CREATE TABLE IF NOT EXISTS auth_verifications (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_account_id ON auth_users(account_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(userId);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expiresAt);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_user ON auth_accounts(userId);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_provider ON auth_accounts(providerId, accountId);
CREATE INDEX IF NOT EXISTS idx_auth_verifications_identifier ON auth_verifications(identifier);
