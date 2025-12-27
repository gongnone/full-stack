-- Migration: 0001_initial_schema
-- Description: Initial schema for The Agentic Content Foundry
-- Created: 2024-12-21

-- ==========================================
-- ACCOUNTS & AUTH
-- ==========================================

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  hubs_limit INTEGER NOT NULL DEFAULT 50,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ==========================================
-- CLIENTS (Multi-tenant isolation)
-- ==========================================

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  durable_object_id TEXT NOT NULL,
  vectorize_namespace TEXT NOT NULL,
  r2_path_prefix TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

-- ==========================================
-- GLOBAL METRICS (Aggregated from DOs)
-- ==========================================

CREATE TABLE IF NOT EXISTS global_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  metric_type TEXT NOT NULL,
  value REAL NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ==========================================
-- WORKFLOW INSTANCES (Tracking)
-- ==========================================

CREATE TABLE IF NOT EXISTS workflow_instances (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('hub_ingestion', 'spoke_generation', 'calibration')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  input_params TEXT,
  output_result TEXT,
  error_message TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

-- ==========================================
-- EXPORT JOBS
-- ==========================================

CREATE TABLE IF NOT EXISTS export_jobs (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('csv', 'json')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  r2_key TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_account ON users(account_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_clients_account ON clients(account_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_global_metrics_account ON global_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_global_metrics_client ON global_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_global_metrics_type ON global_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_global_metrics_period ON global_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_account ON workflow_instances(account_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_client ON workflow_instances(client_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_type ON workflow_instances(workflow_type);
CREATE INDEX IF NOT EXISTS idx_export_jobs_client ON export_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);
