-- Epic 10: Strategic Brand Onboarding Pipeline
-- Stories 10-2 through 10-5
-- Created: 2026-01-01

-- Story 10-2: Deep Research Agent
CREATE TABLE IF NOT EXISTS client_research_reports (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  industry TEXT,
  sub_niche TEXT,
  top_performers_json TEXT DEFAULT '[]',
  hook_patterns_json TEXT DEFAULT '{}',
  competitive_gaps_json TEXT DEFAULT '[]',
  framework_fit_json TEXT DEFAULT '{}',
  recommendations_json TEXT DEFAULT '[]',
  status TEXT DEFAULT 'pending', -- pending, researching, complete, failed
  started_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_research_reports_client ON client_research_reports(client_id);

-- Story 10-3: Strategic Pillar Synthesis
CREATE TABLE IF NOT EXISTS client_proposed_pillars (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  pillars_json TEXT NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'pending', -- pending, approved, modified, rejected
  generation_round INTEGER DEFAULT 1,
  approved_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_proposed_pillars_client ON client_proposed_pillars(client_id);

CREATE TABLE IF NOT EXISTS client_approved_pillars (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  pillar_name TEXT NOT NULL,
  strategy_tags TEXT NOT NULL DEFAULT '[]', -- JSON array e.g., ["TEACH", "CHALLENGE"]
  rationale TEXT,
  example_hook TEXT,
  is_active INTEGER DEFAULT 1,
  approved_at INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_approved_pillars_client ON client_approved_pillars(client_id);

-- Story 10-4: Strategy Approval Tokens
CREATE TABLE IF NOT EXISTS strategy_approval_tokens (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  locked_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_strategy_tokens_token ON strategy_approval_tokens(token);

-- Story 10-5: Pillar Modifications Tracking
CREATE TABLE IF NOT EXISTS pillar_modifications (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  pillar_id TEXT NOT NULL,
  original_json TEXT NOT NULL,
  modified_json TEXT NOT NULL,
  modification_type TEXT, -- renamed, replaced, refined
  feedback_text TEXT,
  voice_note_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_pillar_mods_client ON pillar_modifications(client_id);
