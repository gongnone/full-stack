-- Better Auth Schema
CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER DEFAULT 0 NOT NULL,
    image TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    account_id TEXT,
    role TEXT DEFAULT 'editor',
    stripe_customer_id TEXT,
    credits INTEGER DEFAULT 10 NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at INTEGER,
    refresh_token_expires_at INTEGER,
    scope TEXT,
    password TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
);

-- Application Schema
CREATE TABLE IF NOT EXISTS clients (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL,
	created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS client_members (
    id TEXT PRIMARY KEY NOT NULL,
    client_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor',
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    avatar_color TEXT,
    timezone TEXT DEFAULT 'UTC',
    email_notifications INTEGER DEFAULT 1,
    preferences_json TEXT,
    active_client_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (active_client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS hub_registry (
	id TEXT PRIMARY KEY NOT NULL,
	client_id TEXT,
	name TEXT NOT NULL,
	created_at INTEGER DEFAULT (unixepoch()),
	FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS extracted_pillars (
	id TEXT PRIMARY KEY NOT NULL,
	hub_id TEXT,
	client_id TEXT,
	name TEXT NOT NULL,
	psychological_angle TEXT,
	created_at INTEGER DEFAULT (unixepoch()),
	FOREIGN KEY (hub_id) REFERENCES hub_registry(id),
	FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS spokes (
	id TEXT PRIMARY KEY NOT NULL,
	hub_id TEXT NOT NULL,
	pillar_id TEXT NOT NULL,
	client_id TEXT NOT NULL,
	platform TEXT NOT NULL,
	content TEXT NOT NULL,
	psychological_angle TEXT NOT NULL,
	status TEXT DEFAULT 'pending',
	generation_attempt INTEGER DEFAULT 0,
	created_at INTEGER DEFAULT (unixepoch()),
	FOREIGN KEY (hub_id) REFERENCES hub_registry(id) ON DELETE CASCADE,
	FOREIGN KEY (pillar_id) REFERENCES extracted_pillars(id) ON DELETE CASCADE,
	FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS spoke_evaluations (
	id TEXT PRIMARY KEY NOT NULL,
	spoke_id TEXT NOT NULL,
	client_id TEXT NOT NULL,
	g2_score INTEGER,
	g2_breakdown TEXT,
	g4_result TEXT,
	g4_violations TEXT,
	g4_similarity_score REAL,
	g5_result TEXT,
	g5_violations TEXT,
	overall_pass INTEGER DEFAULT 0,
	evaluated_at INTEGER DEFAULT (unixepoch()),
	FOREIGN KEY (spoke_id) REFERENCES spokes(id) ON DELETE CASCADE,
	FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS feedback_log (
	id TEXT PRIMARY KEY NOT NULL,
	spoke_id TEXT NOT NULL,
	client_id TEXT NOT NULL,
	gate_type TEXT NOT NULL,
	score INTEGER,
	result TEXT,
	violations_json TEXT,
	suggestions TEXT,
	healing_attempt INTEGER DEFAULT 0,
	created_at INTEGER DEFAULT (unixepoch()),
	FOREIGN KEY (spoke_id) REFERENCES spokes(id) ON DELETE CASCADE,
	FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Seed data for E2E tests
INSERT OR IGNORE INTO clients (id, name) VALUES ('client-1', 'Test Client');
INSERT OR IGNORE INTO clients (id, name) VALUES ('client-2', 'Client B');