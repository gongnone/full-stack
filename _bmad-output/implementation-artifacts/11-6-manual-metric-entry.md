# Story 11-6: Manual Metric Entry (Fallback)

**Epic:** Epic 11 - Engagement Data Pipeline
**Status:** ✅ PRODUCTION READY
**Implemented:** 2026-01-31

---

## Story

As a **user**,
I want **to manually enter engagement metrics for published content**,
So that **the G7 model can learn even without platform API integration**.

---

## Acceptance Criteria

### AC1: Manual entry modal with platform selection
**Status:** ✅ IMPLEMENTED
**Evidence:** `src/routes/app/engagement.tsx:ManualEntryModal`
- Platform selector (Twitter/X, LinkedIn, Instagram, TikTok)
- Visual platform buttons with brand colors

### AC2: Spoke selection dropdown
**Status:** ✅ IMPLEMENTED
**Evidence:** `src/routes/app/engagement.tsx:ManualEntryModal`
- Pulls available spokes from review queue via tRPC
- Shows spoke title/hook for identification

### AC3: Metrics input (impressions, likes, comments, shares, clicks)
**Status:** ✅ IMPLEMENTED
- Number inputs with validation (min: 0)
- Real-time engagement rate calculation preview

### AC4: Post URL field (optional)
**Status:** ✅ IMPLEMENTED
- URL validation
- Links to original post for reference

### AC5: Data stored with is_manual_entry flag
**Status:** ✅ IMPLEMENTED
**Evidence:** `worker/trpc/routers/engagement.ts:addManualMetrics`
- `is_manual_entry = 1` flag set on all manual entries
- Engagement rate auto-calculated: (likes + comments + shares) / impressions

---

## Full Engagement Dashboard

Built `/app/engagement` route with:
- **Stats overview** — Total posts, avg engagement rate, total impressions, Golden Nuggets count
- **Platform filter** — Filter metrics by platform with visual buttons
- **Platform breakdown** — Per-platform stats cards
- **G7 Predictions section** — Shows prediction scores with component breakdown
- **Metrics table** — Full table with engagement rate badges and G7 scores
- **Empty state** — Guides users to add their first metrics

---

## File List

**New Files:**
- `apps/foundry-dashboard/src/routes/app/engagement.tsx` (22KB)

**Modified Files:**
- `apps/foundry-dashboard/src/components/layout/Sidebar.tsx` — Added Engagement nav item
- `apps/foundry-dashboard/src/lib/rbac.ts` — Added 'engagement' to MenuItemId and MENU_VISIBILITY

---

*Document created: 2026-01-31*
