# Story R-2: Analytics Real Calculations

**Epic:** Remediation (Post-Audit)
**Priority:** High
**Effort:** 2-3 hours
**Status:** Done

---

## User Story

As a **content manager**, I want **the analytics dashboard to show real calculated metrics** so that **I can make data-driven decisions about content performance and team efficiency**.

---

## Background

The analytics router previously returned hardcoded fallback values instead of calculating real metrics. Now all analytics procedures query real data from Durable Objects.

**FIXED - Now calculates real metrics:**
```typescript
// worker/trpc/routers/analytics.ts
// Get spokes from Durable Object and calculate real pass rates
const spokes = await ctx.callAgent(input.clientId, 'listSpokes', { limit: 1000 });
// G2: Hook strength >= 80 is a pass
// G4: Voice alignment (boolean or number >= 80)
// G5: Platform compliance (boolean or number >= 80)
```

---

## Acceptance Criteria

- [x] **AC1:** `getCriticPassRate` calculates real G2/G4/G5 pass rates from spokes
- [x] **AC2:** `getReviewVelocity` calculates real bulk approve rate from spoke status
- [x] **AC3:** `getSelfHealingEfficiency` calculates real success rate from regeneration counts
- [x] **AC4:** Kill chain usage shows real count from spokes where `status = 'killed'`
- [x] **AC5:** All metrics respect client_id isolation (multi-tenant safe via callAgent)
- [x] **AC6:** Dashboard displays "No data" message when insufficient data exists

---

## Technical Notes

### Critic Pass Rate Calculation
```typescript
// Calculate from spokes table
const stats = await db
  .selectFrom('spokes')
  .select([
    sql`AVG(CASE WHEN g2_score >= 80 THEN 1 ELSE 0 END) * 100`.as('g2_pass'),
    sql`AVG(CASE WHEN g4_status = 'pass' THEN 1 ELSE 0 END) * 100`.as('g4_pass'),
    sql`AVG(CASE WHEN g5_status = 'pass' THEN 1 ELSE 0 END) * 100`.as('g5_pass'),
  ])
  .where('client_id', '=', clientId)
  .executeTakeFirst();
```

### Self-Healing Efficiency
```typescript
// Count regeneration attempts vs successes
const healing = await db
  .selectFrom('spoke_generations')
  .select([
    sql`COUNT(*)`.as('total_attempts'),
    sql`SUM(CASE WHEN healed = true THEN 1 ELSE 0 END)`.as('healed_count'),
  ])
  .where('client_id', '=', clientId)
  .executeTakeFirst();

const successRate = (healing.healed_count / healing.total_attempts) * 100;
```

---

## Files to Modify

| File | Procedure | Change |
|------|-----------|--------|
| `worker/trpc/routers/analytics.ts` | `getCriticPassRate` | Real D1 query |
| `worker/trpc/routers/analytics.ts` | `getReviewVelocity` | Real D1 query |
| `worker/trpc/routers/analytics.ts` | `getSelfHealingEfficiency` | Real D1 query |
| `worker/trpc/routers/analytics.ts` | `getKillChainAnalytics` | Real D1 query |

---

## Definition of Done

- [x] All analytics procedures query real data from Durable Objects
- [x] Hardcoded fallback values removed
- [x] Client isolation maintained in all queries (via callAgent)
- [x] Dashboard shows "No data" for empty datasets (GateMiniCard updated)
- [x] Integration/Unit tests verify real calculations (Fixed in AI Review)

---

## Dev Agent Record

### Implementation Date
2025-12-29

### Completion Notes
Replaced all hardcoded fake metrics with real calculations from Durable Object spoke data.

**AI Review Fixes (2025-12-29):**
1. **Real Trends**: Replaced `Math.random()` loops with real historical bucketing of `DOSpoke` data using `createdAt` timestamps.
2. **Performance Optimization**: Created `getSummaryMetrics` to consolidate summary card data into a single fetching operation, reducing DO roundtrips by 75%.
3. **Test Coverage**: Added `analytics.test.ts` verifying Zero-Edit Rate, boolean/number Gate Pass Rate logic, and Self-Healing Efficiency calculations.

### Key Decisions
- Grouping historical data by day in the router since DO doesn't support time-series aggregation natively yet.
- Consolidating summary queries to prevent "fetch storms" on dashboard load.

### File List
- `apps/foundry-dashboard/worker/trpc/routers/analytics.ts` (Refactored for real trends & performance)
- `apps/foundry-dashboard/src/routes/app/analytics.tsx` (Updated to use consolidated summary query)
- `apps/foundry-dashboard/worker/trpc/routers/__tests__/analytics.test.ts` (NEW: Unit tests)

### Change Log
| Date | Change |
|------|--------|
| 2025-12-29 | Replaced hardcoded metrics with real DO queries |
| 2025-12-29 | Added hasData/spokeCount fields to all responses |
| 2025-12-29 | AI Review: Fixed fake trends, optimized performance, added tests |
