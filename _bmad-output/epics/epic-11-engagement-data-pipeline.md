# Epic 11: Engagement Data Pipeline

**Phase:** 2B - The Learning Loop
**Status:** In Progress (4/6 stories complete)
**Priority:** P1
**Goal:** Import actual performance metrics from published content to train the G7 engagement prediction model.

---

## Business Value
Without real engagement data, G7 predictions are pure heuristic. This epic closes the feedback loop: content goes out → metrics come back → model learns → predictions improve.

---

## Stories

### 11-1: Twitter/X OAuth Integration
**Priority:** P1 | **Effort:** 4-6 hrs
**Description:** OAuth 2.0 PKCE flow for Twitter API v2. Users connect their Twitter account to pull engagement metrics automatically.

**Acceptance Criteria:**
- AC1: "Connect Twitter" button in client settings
- AC2: OAuth 2.0 PKCE flow redirects to Twitter and back
- AC3: Access token stored securely (encrypted in D1)
- AC4: Token refresh handled automatically
- AC5: Connection status shown in UI (connected/disconnected)

**Technical Notes:**
- Twitter API v2 with OAuth 2.0 PKCE (no client secret needed for public clients)
- Scopes needed: `tweet.read`, `users.read`, `offline.access`
- Rate limit: 300 requests/15 min
- Store encrypted tokens in D1 `platform_connections` table

---

### 11-2: LinkedIn OAuth Integration
**Priority:** P1 | **Effort:** 4-6 hrs
**Description:** OAuth 2.0 flow for LinkedIn API. Pull post engagement metrics.

**Acceptance Criteria:**
- AC1: "Connect LinkedIn" button in client settings
- AC2: OAuth 2.0 flow with authorization code grant
- AC3: Access token stored securely (encrypted in D1)
- AC4: Refresh token rotation handled
- AC5: Connection status shown in UI

**Technical Notes:**
- LinkedIn Marketing API or Community Management API
- Scopes: `r_organization_social`, `r_1st_connections_size`
- Rate limit: 100 requests/day
- Requires LinkedIn developer app approval (2-3 days)

---

### 11-3: Engagement Webhook Receivers
**Priority:** P1 | **Effort:** 3-4 hrs
**Description:** Webhook endpoints to receive engagement updates. Fallback for platforms without pull APIs.

**Acceptance Criteria:**
- AC1: POST `/api/webhooks/engagement` endpoint
- AC2: Validates webhook signatures
- AC3: Stores metrics in engagement_metrics table
- AC4: Deduplicates incoming data
- AC5: Returns 200 quickly, processes async

---

### 11-4: Metric Storage Schema
**Priority:** P1 | **Effort:** 2-3 hrs
**Description:** D1 schema for storing engagement metrics linked to spokes.

**Acceptance Criteria:**
- AC1: `platform_connections` table (OAuth tokens per client per platform)
- AC2: `engagement_metrics` table (metrics per spoke per platform)
- AC3: `engagement_snapshots` table (time-series for trend tracking)
- AC4: Indexes on client_id, spoke_id, platform, created_at
- AC5: Migration runs cleanly on staging

**Schema:**
```sql
-- Platform OAuth connections
CREATE TABLE platform_connections (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'instagram'
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at INTEGER,
  platform_user_id TEXT,
  platform_username TEXT,
  status TEXT DEFAULT 'active',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Per-spoke engagement metrics
CREATE TABLE engagement_metrics (
  id TEXT PRIMARY KEY,
  spoke_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  external_post_id TEXT, -- platform's post ID
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate REAL DEFAULT 0,
  published_at INTEGER,
  fetched_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Time-series snapshots for trend analysis
CREATE TABLE engagement_snapshots (
  id TEXT PRIMARY KEY,
  metric_id TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  snapshot_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (metric_id) REFERENCES engagement_metrics(id) ON DELETE CASCADE
);
```

---

### 11-5: Engagement Dashboard Widget
**Priority:** P2 | **Effort:** 3-4 hrs
**Description:** Dashboard widget showing engagement metrics overview.

---

### 11-6: Manual Metric Entry (Fallback)
**Priority:** P2 | **Effort:** 2-3 hrs
**Description:** Manual entry form for platforms without API access.

---

## Sprint Plan

### Sprint 3A (First 2 weeks)
1. **11-4:** Metric Storage Schema (foundation - do first)
2. **11-1:** Twitter/X OAuth Integration
3. **11-6:** Manual Metric Entry (fallback while waiting for API approvals)

### Sprint 3B (Next 2 weeks)
4. **11-2:** LinkedIn OAuth Integration
5. **11-3:** Engagement Webhook Receivers
6. **11-5:** Engagement Dashboard Widget

---

## Dependencies
- Twitter Developer Account (apply ASAP - 1-2 day approval)
- LinkedIn Developer App (apply ASAP - 2-3 day approval)
- Encryption key for token storage (Cloudflare secrets)
