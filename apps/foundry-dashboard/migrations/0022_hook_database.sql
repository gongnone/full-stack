-- Epic 12-2: Vectorize Hook Database for G7 Engagement Prediction
-- Stores metadata for high-performing hooks used in similarity scoring

-- Hook metadata table (vectors stored in Vectorize)
CREATE TABLE IF NOT EXISTS hooks (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  platform TEXT NOT NULL, -- twitter, linkedin, instagram, tiktok, etc.
  category TEXT NOT NULL, -- business, lifestyle, tech, health, finance, etc.

  -- Performance metrics (from training data)
  engagement_rate REAL, -- likes+comments+shares / impressions
  performance_tier TEXT NOT NULL DEFAULT 'curated', -- viral, high, curated, community

  -- Content analysis
  word_count INTEGER NOT NULL,
  character_count INTEGER NOT NULL,
  has_question INTEGER NOT NULL DEFAULT 0,
  has_numbers INTEGER NOT NULL DEFAULT 0,
  has_cta INTEGER NOT NULL DEFAULT 0,
  emotional_intensity TEXT, -- high, medium, low
  psychological_angle TEXT, -- Contrarian, Authority, Urgency, etc.

  -- Source tracking
  source TEXT, -- external, user_approved, generated
  source_url TEXT,
  contributor_id TEXT, -- user who contributed (if applicable)

  -- Vectorize reference
  vectorize_id TEXT NOT NULL, -- ID in Vectorize index for lookups
  embedding_model TEXT NOT NULL DEFAULT 'bge-base-en-v1.5',

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_hooks_platform ON hooks(platform);
CREATE INDEX IF NOT EXISTS idx_hooks_category ON hooks(category);
CREATE INDEX IF NOT EXISTS idx_hooks_performance ON hooks(performance_tier, engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_hooks_vectorize ON hooks(vectorize_id);

-- Hook categories for filtering
CREATE TABLE IF NOT EXISTS hook_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  hook_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Seed initial categories
INSERT OR IGNORE INTO hook_categories (id, name, display_name, description) VALUES
  ('cat_business', 'business', 'Business & Entrepreneurship', 'Hooks for business, startups, and entrepreneurship content'),
  ('cat_tech', 'tech', 'Technology & AI', 'Hooks for technology, software, and AI content'),
  ('cat_finance', 'finance', 'Finance & Investing', 'Hooks for personal finance, investing, and money content'),
  ('cat_health', 'health', 'Health & Wellness', 'Hooks for fitness, nutrition, and mental health content'),
  ('cat_lifestyle', 'lifestyle', 'Lifestyle & Productivity', 'Hooks for productivity, habits, and life optimization'),
  ('cat_marketing', 'marketing', 'Marketing & Sales', 'Hooks for marketing, copywriting, and sales content'),
  ('cat_creative', 'creative', 'Creative & Design', 'Hooks for design, art, and creative content'),
  ('cat_education', 'education', 'Education & Learning', 'Hooks for teaching, courses, and educational content');

-- Track similarity searches for analytics
CREATE TABLE IF NOT EXISTS hook_similarity_log (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  query_content TEXT NOT NULL,
  query_platform TEXT,
  top_match_id TEXT,
  top_match_score REAL,
  match_count INTEGER NOT NULL,
  latency_ms INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),

  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_similarity_log_client ON hook_similarity_log(client_id, created_at DESC);
