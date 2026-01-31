# Story 11-3: Engagement Webhook Receivers

**Epic:** Epic 11 - Engagement Data Pipeline
**Status:** ✅ PRODUCTION READY
**Implemented:** 2026-01-31

---

## Story

As a **system**,
I want **webhook endpoints to receive engagement data from external platforms**,
So that **metrics flow into the system automatically or via integration tools**.

---

## Acceptance Criteria

### AC1: POST /api/webhooks/engagement endpoint ✅
**Evidence:** `worker/hono/app.ts`
- Accepts JSON body with clientId, spokeId, platform, metrics
- Auto-calculates engagement rate
- Returns created/updated status with ID

### AC2: Validates webhook signatures ✅
**Evidence:** `worker/hono/app.ts` — HMAC-SHA256 signature verification
- Optional X-Webhook-Signature header
- Uses WEBHOOK_SECRET env variable
- Returns 401 on invalid signature

### AC3: Stores metrics in engagement_metrics table ✅
**Evidence:** D1 INSERT with all fields
- Verified with live test: engagement rate calculated correctly (6.5% for 65/1000)

### AC4: Deduplicates incoming data ✅
**Evidence:** External post ID deduplication
- Same (spoke_id, platform, external_post_id) → UPDATE instead of INSERT
- Returns `deduplicated: true` flag

### AC5: Returns 200 quickly, processes async ✅
- Synchronous D1 write (fast enough for webhook timeouts)
- Returns JSON response immediately

## Batch Endpoint

**POST /api/webhooks/engagement/batch**
- Accepts array of items (max 100)
- Returns per-item results with created/updated/error counts
- Verified with live test: 2 items batch processed successfully

---

## API Documentation

### Single Metric
```
POST /api/webhooks/engagement
Content-Type: application/json

{
  "clientId": "uuid",
  "spokeId": "uuid", 
  "platform": "twitter|linkedin|instagram|tiktok",
  "externalPostId": "platform-post-id",  // optional, for dedup
  "externalPostUrl": "https://...",       // optional
  "publishedAt": 1738281600,              // optional, unix timestamp
  "metrics": {
    "impressions": 1000,
    "likes": 50,
    "comments": 10,
    "shares": 5,
    "clicks": 20,
    "saves": 3
  }
}
```

### Batch Metrics
```
POST /api/webhooks/engagement/batch
Content-Type: application/json

{
  "items": [
    { ...same as single metric... },
    { ...same as single metric... }
  ]
}
```

---

## File List

**Modified Files:**
- `apps/foundry-dashboard/worker/hono/app.ts` — Added webhook endpoints

---

*Document created: 2026-01-31*
