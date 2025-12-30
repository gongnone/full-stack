# Story R-10: Fix Review Page Metrics Tracking

**Epic**: Remediation (Post-Epic 9)
**Priority**: P1 (UX Bug - Metrics Not Tracking)
**Status**: done
**Created**: 2025-12-29

## Problem Statement

The review page bucket tiles show incorrect metrics:

1. **Just Generated** tile always shows 0 or incorrect count
2. `getVolumeMetrics` accepts `periodDays` parameter but doesn't use it for filtering
3. Dashboard index and review page may show inconsistent numbers

## Root Cause Analysis

In `analytics.ts:432-451`:
```typescript
getVolumeMetrics: procedure
  .input(z.object({ clientId: z.string().min(1), periodDays: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    const spokes = await ctx.callAgent(input.clientId, 'listSpokes', { limit: 1000 }) as DOSpoke[];
    // BUG: periodDays is ignored - returns ALL spokes, not filtered by date
    return {
      spokesGenerated: totalSpokes,  // Should be filtered by periodDays
      hubsCreated: 0,  // Hardcoded placeholder
      trend: 5,  // Hardcoded placeholder
    };
  }),
```

## Acceptance Criteria

### AC1: Period-Filtered Spoke Count
- [x] `getVolumeMetrics` filters spokes by `createdAt` within `periodDays`
- [x] Default `periodDays` is 1 (last 24 hours) if not specified
- [x] Returns accurate count of spokes created within the period

### AC2: Hub Count Implementation
- [x] `hubsCreated` returns actual count of hubs created within period
- [x] Query hub data from Durable Object or add hub counting RPC

### AC3: Just Generated Filter Support
- [x] `just-generated` filter implemented in `review.getQueue`
- [x] Filter returns spokes with `status = 'generating'` OR created in last 24h
- [x] Review page can navigate to Just Generated sprint

### AC4: Trend Calculation
- [x] Calculate actual trend percentage (current period vs previous period)
- [x] Example: If 10 spokes today vs 8 yesterday = +25% trend

## Technical Tasks

### Task 1: Fix getVolumeMetrics Date Filtering
- [x] Implemented `getVolumeMetrics` with strict date filtering
- [x] Implemented pagination loop to support >2000 spokes
- [x] Optimized to fetch current + previous period in one go

### Task 2: Add createdAfter Filter to ClientAgent.listSpokes
- [x] Added `createdAfter` param to `listSpokes` and `listHubs`
- [x] Implemented proper SQL WHERE clause generation

### Task 3: Add just-generated Filter to Review Queue
- [x] Added `just-generated` filter case to `getReviewQueue`
- [x] Used parameterized queries to prevent SQL injection

### Task 4: Implement Hub Count
- [x] Added `countHubs` RPC method
- [x] Exposed via ClientAgent fetch handler

### Task 5: Calculate Trend Percentage
- [x] Implemented trend calculation logic (current - previous / previous)

## Test Plan

- [x] Unit test: getVolumeMetrics with periodDays=1 returns only today's spokes
- [x] Unit test: Pagination support verifies retrieving >2000 items
- [x] Unit test: Trend calculation handles positive, negative, and zero previous data
- [ ] Integration test: Review page tiles show accurate counts (Manual Verify)

## Files to Modify

1. `apps/foundry-dashboard/worker/trpc/routers/analytics.ts`
2. `apps/foundry-engine/src/durable-objects/client-agent.ts`
3. `apps/foundry-dashboard/worker/trpc/routers/review.ts`
4. `apps/foundry-dashboard/src/routes/app/review.tsx`
5. `apps/foundry-dashboard/worker/trpc/routers/__tests__/analytics.test.ts`

---

## Dev Agent Record

**Implemented**: 2025-12-29
**TypeScript**: Passes all typechecks
**Tests**: All unit tests passing (analytics.test.ts)

### Changes Made

1. **`apps/foundry-engine/src/durable-objects/client-agent.ts`**:
   - Added `createdAfter` parameters to listing methods
   - Implemented `countHubs` RPC
   - Added `just-generated` filter logic
   - **Fix**: Replaced string interpolation with bound parameters for `just-generated` filter to prevent SQL injection

2. **`apps/foundry-dashboard/worker/trpc/routers/analytics.ts`**:
   - Rewrote `getVolumeMetrics` for accurate date filtering
   - **Fix**: Implemented pagination loop to fetch ALL spokes (removing 2000 limit)
   - Optimized data fetching strategy (single call for current+previous periods)

3. **`apps/foundry-dashboard/worker/trpc/routers/__tests__/analytics.test.ts`**:
   - **Rewrite**: Replaced placeholder tests with real unit tests
   - Added proper database context mocking
   - Added tests for pagination logic
   - Added tests for trend calculation (increase/decrease)

### Code Review Remediation (2025-12-29)

**Issues Addressed:**
1.  **Fake Tests**: Rewrote `analytics.test.ts` to actually test the router logic using mocked context.
2.  **Scalability**: Removed the hardcoded 2000 limit in `getVolumeMetrics` by implementing a proper pagination loop.
3.  **Security**: Fixed potential SQL injection in `client-agent.ts` by using parameterized queries.

**Verification**:
- `pnpm --filter foundry-dashboard test worker/trpc/routers/__tests__/analytics.test.ts` ✅ PASSED