-- Epic 11: Engagement Data Pipeline
-- Enables importing actual performance metrics from publishing platforms to train G7 model

-- ============================================
-- Story 11-4: Metric Storage Schema
-- ============================================

-- Platform OAuth connections (11-1, 11-2)
-- Stores OAuth tokens for connected social accounts
CREATE TABLE IF NOT EXISTS platform_connections (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'instagram', 'tiktok'

  -- OAuth credentials (encrypted at rest via Cloudflare)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at INTEGER, -- Unix timestamp

  -- Platform-specific identifiers
  platform_user_id TEXT NOT NULL, -- e.g., Twitter user ID
  platform_username TEXT, -- e.g., @handle
  platform_display_name TEXT,
  platform_avatar_url TEXT,

  -- Connection metadata
  scopes TEXT, -- JSON array: ['tweet.read', 'users.read']
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'revoked', 'error'
  last_sync_at INTEGER,
  sync_error TEXT,

  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE (client_id, platform, platform_user_id)
);

CREATE INDEX IF NOT EXISTS idx_platform_connections_client ON platform_connections(client_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_status ON platform_connections(status);

-- Published content tracking
-- Links spokes to their published posts on social platforms
CREATE TABLE IF NOT EXISTS published_posts (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  spoke_id TEXT NOT NULL,
  connection_id TEXT NOT NULL, -- References platform_connections

  -- Post identifiers
  platform TEXT NOT NULL,
  platform_post_id TEXT NOT NULL, -- e.g., Tweet ID, LinkedIn post URN
  post_url TEXT,

  -- Content snapshot (in case spoke is edited/deleted)
  content_snapshot TEXT NOT NULL,
  media_urls TEXT, -- JSON array of media URLs

  -- Timing
  published_at INTEGER NOT NULL,

  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (connection_id) REFERENCES platform_connections(id) ON DELETE CASCADE,
  UNIQUE (platform, platform_post_id)
);

CREATE INDEX IF NOT EXISTS idx_published_posts_spoke ON published_posts(spoke_id);
CREATE INDEX IF NOT EXISTS idx_published_posts_connection ON published_posts(connection_id);

-- Engagement metrics (11-3, 11-4)
-- Stores performance metrics pulled from platforms
CREATE TABLE IF NOT EXISTS engagement_metrics (
  id TEXT PRIMARY KEY,
  published_post_id TEXT NOT NULL,

  -- Core metrics (all platforms)
  impressions INTEGER,
  engagements INTEGER, -- Total interactions
  engagement_rate REAL, -- engagements / impressions * 100

  -- Reaction metrics
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0, -- Retweets for Twitter
  saves INTEGER DEFAULT 0,

  -- Reach metrics
  reach INTEGER, -- Unique accounts reached
  profile_visits INTEGER,
  link_clicks INTEGER,

  -- Video metrics (if applicable)
  video_views INTEGER,
  video_watch_time INTEGER, -- Total seconds

  -- Platform-specific (JSON for flexibility)
  platform_metrics TEXT, -- JSON: { quotes, replies, bookmarks, etc. }

  -- Timing
  recorded_at INTEGER NOT NULL,
  metrics_updated_at INTEGER NOT NULL,

  FOREIGN KEY (published_post_id) REFERENCES published_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_engagement_metrics_post ON engagement_metrics(published_post_id);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_recorded ON engagement_metrics(recorded_at DESC);

-- Manual metric entry (11-6)
-- Fallback for when OAuth isn't available
CREATE TABLE IF NOT EXISTS manual_metrics (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  spoke_id TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Who entered the metrics

  platform TEXT NOT NULL,

  -- Self-reported metrics
  impressions INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,

  -- Self-assessment
  performed_well INTEGER, -- 1 = yes, 0 = no
  notes TEXT,

  -- Timing
  published_at INTEGER, -- When user says they posted
  recorded_at INTEGER NOT NULL,

  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_manual_metrics_client ON manual_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_manual_metrics_spoke ON manual_metrics(spoke_id);

-- Webhook events (11-3)
-- Stores incoming webhook payloads for debugging/replay
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'metrics_update', 'post_created', etc.
  payload TEXT NOT NULL, -- JSON: raw webhook payload
  processed INTEGER NOT NULL DEFAULT 0, -- 1 = processed
  error TEXT,
  received_at INTEGER NOT NULL,
  processed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_platform ON webhook_events(platform, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_unprocessed ON webhook_events(processed) WHERE processed = 0;

-- API rate limit tracking
-- Prevents hitting platform rate limits
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  endpoint TEXT NOT NULL, -- e.g., 'tweets/search', 'posts/analytics'
  limit_count INTEGER NOT NULL,
  remaining_count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL, -- Unix timestamp when limit resets
  last_request_at INTEGER NOT NULL,

  UNIQUE (platform, endpoint)
);

-- Engagement sync queue
-- Tracks which posts need metrics fetched
CREATE TABLE IF NOT EXISTS engagement_sync_queue (
  id TEXT PRIMARY KEY,
  published_post_id TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0, -- Higher = more urgent
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at INTEGER,
  next_attempt_at INTEGER,
  error TEXT,

  FOREIGN KEY (published_post_id) REFERENCES published_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON engagement_sync_queue(status, next_attempt_at);
