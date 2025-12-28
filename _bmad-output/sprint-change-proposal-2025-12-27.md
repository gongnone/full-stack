# Sprint Change Proposal - 2025-12-27

## Issue Summary

**Problem:** The Hub-to-Spoke generation engine is not producing output. Manual testing reveals 7 hubs exist with pillars extracted, but 0 spokes have been generated. This breaks the core value proposition: "1 Source of Truth → 25+ platform-specific assets."

**Discovery Context:** Post-implementation QA during manual testing. Status tracking showed "Feature Complete" but functional verification revealed the core engine is non-operational.

**Evidence:**
- D1 Database: 7 hubs with `pillar_count: 4`, `spoke_count: 0`
- Infrastructure healthy: D1, R2, Vectorize all connected
- Frontend deployed and serving
- Backend deployed but workflow not completing

---

## Impact Analysis

### Epic Impact

| Epic | Impact Level | Details |
|------|-------------|---------|
| Epic 4: Spoke Generation | **CRITICAL** | Core functionality broken |
| Epic 5: Executive Producer | **BLOCKED** | No spokes to review |
| Epic 6: Content Export | **BLOCKED** | No content to export |
| Epic 3: Hub Creation | **PARTIAL** | Hub/pillar creation works, but flow incomplete |

### Artifact Conflicts

| Artifact | Status | Change Needed |
|----------|--------|---------------|
| PRD | No conflict | MVP goal unchanged |
| Architecture | No conflict | Design is correct |
| Stories | **UPDATE** | Story 4.1 needs frontend fix |
| Tests | **ADD** | E2E for spoke generation flow |

---

## Root Cause Analysis

### RC1: Frontend Mock Instead of Real Polling (CRITICAL)

**Location:** `apps/foundry-dashboard/src/routes/app/hubs.$hubId.tsx:172-225`

```typescript
// Simulate generation progress (until we have real polling)
const simulateGeneration = () => {
  // ... FRONTEND-ONLY MOCK
  // This doesn't verify actual spoke creation!
}
```

**Problem:** After `spokes.generate` mutation succeeds, the frontend runs a mock simulation instead of polling for real workflow status. Users see "generation complete" without any actual spokes being verified.

### RC2: No Workflow Status Polling

**Problem:** The `spokes.getWorkflowStatus` endpoint exists but is never called. The frontend should:
1. Get `instanceId` from generate response
2. Poll `getWorkflowStatus(instanceId)` until complete/errored
3. Fetch `spokes.list` to display actual results

### RC3: D1 spoke_count Not Synced with DO

**Problem:** Spokes are stored in Durable Object SQLite (per-client isolation), but `hubs.spoke_count` in D1 is never updated. This causes the hub list to always show 0 spokes.

---

## Recommended Approach

**Selected Path: Option 1 - Direct Adjustment**

Fix the frontend flow without architectural changes. The backend appears to be correctly implemented.

**Effort:** Medium (4-6 hours)
**Risk:** Low (localized to frontend integration)
**Timeline Impact:** None (can be done immediately)

---

## Detailed Change Proposals

### Change 1: Replace Mock with Real Polling

**File:** `apps/foundry-dashboard/src/routes/app/hubs.$hubId.tsx`

**OLD (lines 159-169):**
```typescript
const generateMutation = trpc.spokes.generate.useMutation({
  onSuccess: () => {
    // Start polling for progress (mock for now)
    setIsGenerating(true);
    simulateGeneration();
  },
```

**NEW:**
```typescript
const generateMutation = trpc.spokes.generate.useMutation({
  onSuccess: (data) => {
    setIsGenerating(true);
    // Poll real workflow status
    if (data.instances.length > 0) {
      pollWorkflowStatus(data.instances);
    } else {
      // Fallback: no spokes queued (edge case)
      setIsGenerating(false);
    }
  },
```

**Rationale:** Use real workflow instance IDs to poll actual progress instead of simulating.

### Change 2: Add Real Polling Function

**File:** `apps/foundry-dashboard/src/routes/app/hubs.$hubId.tsx`

**ADD after line 169:**
```typescript
// Poll workflow status for spoke generation
const pollWorkflowStatus = async (instances: Array<{ instanceId: string; platform: string }>) => {
  const totalSpokes = instances.length;
  let completedSpokes = 0;
  let failedSpokes = 0;

  const pollInterval = setInterval(async () => {
    // Check each instance status
    const statuses = await Promise.all(
      instances.map(async (inst) => {
        try {
          const status = await trpc.spokes.getWorkflowStatus.query({ instanceId: inst.instanceId });
          return { ...inst, status: status.status };
        } catch {
          return { ...inst, status: 'errored' as const };
        }
      })
    );

    completedSpokes = statuses.filter(s => s.status === 'complete').length;
    failedSpokes = statuses.filter(s => s.status === 'errored').length;

    // Update progress UI
    setGenerationProgress({
      hub_id: hubId,
      client_id: clientId,
      status: completedSpokes + failedSpokes >= totalSpokes ? 'completed' : 'generating',
      total_pillars: hub?.pillars.length || 0,
      completed_pillars: Math.floor(completedSpokes / 6), // ~6 platforms per pillar
      total_spokes: totalSpokes,
      completed_spokes: completedSpokes,
      current_pillar_id: null,
      current_pillar_name: null,
      error_message: failedSpokes > 0 ? `${failedSpokes} spokes failed` : null,
      started_at: Date.now() / 1000 - 30,
      completed_at: completedSpokes + failedSpokes >= totalSpokes ? Date.now() / 1000 : null,
      updated_at: Date.now() / 1000,
    });

    // Check if all done
    if (completedSpokes + failedSpokes >= totalSpokes) {
      clearInterval(pollInterval);
      setIsGenerating(false);
      refetchHub();
      refetchSpokes();
      setActiveTab('spokes');
    }
  }, 3000); // Poll every 3 seconds
};
```

**Rationale:** Real polling mechanism that tracks actual workflow completion.

### Change 3: Delete simulateGeneration Function

**File:** `apps/foundry-dashboard/src/routes/app/hubs.$hubId.tsx`

**DELETE lines 172-225:** Remove the entire `simulateGeneration` function as it's no longer needed.

**Rationale:** Mock is replaced by real polling.

### Change 4: Sync spoke_count to D1 (Optional Enhancement)

**File:** `apps/foundry-engine/src/workflows/spoke-generation.ts`

**ADD at the end of the workflow (after line 457):**
```typescript
// Optional: Sync spoke count to D1 for hub list display
// This is a denormalization for performance
await step.do('sync-spoke-count', async () => {
  // This would require adding DB binding to the workflow
  // For MVP, the hub detail page can derive count from DO query
});
```

**Rationale:** D1 spoke_count stays at 0 because spokes live in DO. Either sync on write or derive count from DO query in the hub list endpoint. For MVP, the hub detail page already queries the DO for spokes, so this is a nice-to-have.

---

## Implementation Handoff

**Scope Classification:** Minor

**Handoff To:** Development team for direct implementation

**Tasks:**
1. [ ] Replace `simulateGeneration()` with real polling in `hubs.$hubId.tsx`
2. [ ] Add `pollWorkflowStatus()` function
3. [ ] Test end-to-end: Create hub → Generate spokes → Verify spokes appear
4. [ ] Add E2E test for spoke generation flow

**Success Criteria:**
- User clicks "Generate Spokes" and sees real progress
- Spokes actually appear in the Spoke Tree View
- hub.spoke_count reflects actual count (or derived from DO)

---

## Approval

**Status:** PENDING USER APPROVAL

Do you approve this Sprint Change Proposal for implementation? (yes/no/revise)
