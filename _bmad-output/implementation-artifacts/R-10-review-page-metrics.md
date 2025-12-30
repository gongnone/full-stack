# Story R-10: Fix Review Page Metrics Tracking

**Epic**: Remediation (Post-Epic 9)
**Priority**: P1 (UX Bug - Metrics Not Tracking)
**Status**: ready
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
- [ ] `getVolumeMetrics` filters spokes by `createdAt` within `periodDays`
- [ ] Default `periodDays` is 1 (last 24 hours) if not specified
- [ ] Returns accurate count of spokes created within the period

### AC2: Hub Count Implementation
- [ ] `hubsCreated` returns actual count of hubs created within period
- [ ] Query hub data from Durable Object or add hub counting RPC

### AC3: Just Generated Filter Support
- [ ] Add `just-generated` filter to `review.getQueue` router
- [ ] Filter returns spokes with `status = 'generating'` OR created in last 24h
- [ ] Review page can navigate to Just Generated sprint

### AC4: Trend Calculation
- [ ] Calculate actual trend percentage (current period vs previous period)
- [ ] Example: If 10 spokes today vs 8 yesterday = +25% trend

## Technical Tasks

### Task 1: Fix getVolumeMetrics Date Filtering
**File**: `apps/foundry-dashboard/worker/trpc/routers/analytics.ts`

```typescript
getVolumeMetrics: procedure
  .input(z.object({
    clientId: z.string().min(1),
    periodDays: z.number().min(1).max(90).default(1)
  }))
  .query(async ({ ctx, input }) => {
    await assertClientAccess(ctx, input.clientId);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - input.periodDays);
    const cutoffISO = cutoffDate.toISOString();

    const spokes = await ctx.callAgent(input.clientId, 'listSpokes', {
      limit: 1000,
      createdAfter: cutoffISO  // New parameter needed in DO
    }) as DOSpoke[];

    // ... rest of implementation
  }),
```

### Task 2: Add createdAfter Filter to ClientAgent.listSpokes
**File**: `apps/foundry-engine/src/durable-objects/client-agent.ts`

Add optional `createdAfter` parameter to filter spokes by creation date.

### Task 3: Add just-generated Filter to Review Queue
**File**: `apps/foundry-dashboard/worker/trpc/routers/review.ts`

Add handling for `filter: 'just-generated'` that returns recently created spokes.

### Task 4: Implement Hub Count
**File**: `apps/foundry-engine/src/durable-objects/client-agent.ts`

Add `countHubs` RPC or include hub count in existing response.

### Task 5: Calculate Trend Percentage
Compare current period spokesGenerated vs previous period.

## Test Plan

- [ ] Unit test: getVolumeMetrics with periodDays=1 returns only today's spokes
- [ ] Unit test: getVolumeMetrics with periodDays=7 returns week's spokes
- [ ] Unit test: just-generated filter returns correct spokes
- [ ] Integration test: Review page tiles show accurate counts
- [ ] E2E test: Just Generated tile count matches actual recent spokes

## Dependencies

- ClientAgent DO must support date filtering on listSpokes
- May need schema update if createdAt is not indexed

## Estimated Effort

- **Implementation**: 2-3 hours
- **Testing**: 1 hour
- **Total**: 3-4 hours

## Files to Modify

1. `apps/foundry-dashboard/worker/trpc/routers/analytics.ts` - Fix date filtering
2. `apps/foundry-engine/src/durable-objects/client-agent.ts` - Add createdAfter param
3. `apps/foundry-dashboard/worker/trpc/routers/review.ts` - Add just-generated filter
4. `apps/foundry-dashboard/src/routes/app/review.tsx` - Wire up just-generated navigation
