# Story 11-4: Metric Storage Schema

**Epic:** Epic 11 - Engagement Data Pipeline
**Status:** ✅ PRODUCTION READY
**Implemented:** 2026-01-31
**Last Updated:** 2026-01-31

---

## Story

As a **system**,
I want **a robust schema for storing engagement metrics and platform connections**,
So that **the G7 prediction model can learn from real content performance data**.

---

## Acceptance Criteria

### AC1: platform_connections table
**Status:** ✅ IMPLEMENTED
**Evidence:** `migrations/0030_engagement_pipeline.sql:4-18`
- Stores OAuth tokens per client per platform
- Encrypted token storage
- Unique constraint: one active connection per client per platform

### AC2: engagement_metrics table
**Status:** ✅ IMPLEMENTED
**Evidence:** `migrations/0030_engagement_pipeline.sql:24-47`
- Per-spoke engagement data (impressions, likes, comments, shares, clicks, saves)
- Calculated engagement_rate
- Manual vs auto entry flag
- Deduplication index on (spoke_id, platform, external_post_id)

### AC3: engagement_snapshots table
**Status:** ✅ IMPLEMENTED
**Evidence:** `migrations/0030_engagement_pipeline.sql:53-65`
- Time-series snapshots for trend tracking
- Linked to engagement_metrics via foreign key

### AC4: Proper indexes
**Status:** ✅ IMPLEMENTED
- `idx_platform_connections_client` — client_id + platform
- `idx_platform_connections_unique` — unique active connection per platform
- `idx_engagement_metrics_spoke` — spoke_id lookup
- `idx_engagement_metrics_client_platform` — client filtering
- `idx_engagement_metrics_dedup` — deduplication
- `idx_engagement_snapshots_metric` — time-series queries
- `idx_g7_predictions_spoke` — prediction lookup
- `idx_g7_predictions_client_score` — leaderboard queries

### AC5: Migration runs cleanly
**Status:** ✅ IMPLEMENTED
- Applied via `wrangler d1 execute --file` on staging
- 14 queries executed, 24 rows written
- Database size: 3.28 MB after migration

---

## Additional Tables (Forward-looking)

### g7_predictions
- Stores G7 prediction scores per spoke per platform
- Score breakdown: hook_similarity, g2_quality, platform_optimization, timing
- Confidence and model version tracking

### winning_hooks
- Curated high-performing hooks for Vectorize similarity
- Source tracking: curated, client_history, import
- Platform-specific engagement rates

---

## File List

**New Files:**
- `apps/foundry-dashboard/migrations/0030_engagement_pipeline.sql`
- `apps/foundry-dashboard/worker/trpc/routers/engagement.ts`

**Modified Files:**
- `apps/foundry-dashboard/worker/trpc/router.ts` — Added engagement router

---

*Document created: 2026-01-31*
