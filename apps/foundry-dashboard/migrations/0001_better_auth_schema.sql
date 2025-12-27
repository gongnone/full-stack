-- Better Auth Schema for D1 (SQLite)
-- Creates tables required for Better Auth authentication system

-- Users table - stores user account information
CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    name TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    -- Custom fields from Better Auth config
    accountId TEXT,
    role TEXT DEFAULT 'editor'
);

CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);

-- Sessions table - manages user sessions
CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);

-- Accounts table - stores OAuth provider accounts linked to users
CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    expiresAt INTEGER,
    password TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_provider ON account(providerId, accountId);

-- Verification table - email verification tokens
CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);
