# Story P0-1: Review Sprint Investigation and Critical Fixes

Status: ready-for-dev

<!-- CRITICAL P0 BLOCKER - Review sprint content invisible to users -->

## Story

As a **development team**,
I want to **investigate why generated spokes are invisible in the review sprint and implement critical fixes**,
so that **users can see and interact with their generated content immediately after spoke generation**.

## Acceptance Criteria

### Phase 1: Root Cause Investigation (30 minutes)

**AC1.1: Database Spoke Status Verification**
- [ ] Query D1 database for spokes generated in last 24 hours
- [ ] GIVEN spoke generation completed successfully
- [ ] WHEN querying `SELECT id, status, platform, LENGTH(content) as len FROM spokes WHERE client_id = ? ORDER BY created_at DESC LIMIT 20`
- [ ] THEN verify spokes exist with populated content
- [ ] AND document actual status values found (draft/pending/ready)

**AC1.2: ClientAgent getReviewQueue Analysis**
- [ ] Locate and analyze `getReviewQueue` method in ClientAgent
- [ ] GIVEN review queue query executes
- [ ] WHEN examining SQL WHERE clause and status filtering
- [ ] THEN identify any mismatches between:
  - Status values spokes actually have in database
  - Status values the query filters for
  - Time window filtering (too narrow?)
  - Client ID filtering (missing or wrong?)

**AC1.3: Frontend Query Investigation**
- [ ] Verify `trpc.review.getQueue.useQuery()` parameters in review.tsx
- [ ] GIVEN user navigates to /app/review?filter=just-generated
- [ ] WHEN checking browser DevTools Network tab
- [ ] THEN verify:
  - tRPC request fires with correct clientId and filter
  - Response contains items array (not empty)
  - Response data structure matches frontend expectations

**AC1.4: Document Root Cause**
- [ ] Create investigation summary document
- [ ] GIVEN all diagnostic queries completed
- [ ] WHEN root cause identified
- [ ] THEN document:
  - Exact cause of invisible content
  - Which component/query is broken
  - Why it worked before (if regression)
  - Specific fix required

### Phase 2: P0 Critical Fixes (2-4 hours)

**AC2.1: Fix Data Loading Issue**
- [ ] Implement fix based on root cause findings
- [ ] SCENARIO A: Status filter mismatch
  - GIVEN spokes have status='draft' but query filters for status='pending'
  - WHEN updating ClientAgent.getReviewQueue SQL query
  - THEN include WHERE status IN ('draft', 'pending', 'ready') AND reviewed_at IS NULL
- [ ] SCENARIO B: Missing 'just-generated' filter logic
  - GIVEN filter='just-generated' passed to backend
  - WHEN implementing filter case in ClientAgent
  - THEN add WHERE created_at > Date.now() - 86400000 (last 24 hours)
- [ ] SCENARIO C: Client ID linkage broken
  - GIVEN spokes generated without proper client_id
  - WHEN fixing spoke generation workflow
  - THEN ensure client_id is set correctly on INSERT

**AC2.2: Add Frontend Defensive Guards**
- [ ] Disable keyboard shortcuts when no content visible
- [ ] GIVEN spokes array is empty or currentSpoke is undefined
- [ ] WHEN keyboard event fires
- [ ] THEN return early with console warning
- [ ] AND prevent blind approve/kill/edit actions

**AC2.3: Enhanced Loading State**
- [ ] Replace basic spinner with informative loading UI
- [ ] GIVEN queueQuery.isLoading === true
- [ ] WHEN rendering loading state
- [ ] THEN display:
  - Animated spinner
  - "Fetching spokes for review" message
  - Filter-specific context message
  - Brand-consistent styling

**AC2.4: Enhanced Empty State**
- [ ] Create helpful empty state for zero results
- [ ] GIVEN spokes.length === 0 after loading
- [ ] WHEN rendering empty state
- [ ] THEN display:
  - Clear "No Content Found" heading
  - Filter-specific explanation
  - Action buttons (Back to Dashboard, View Hubs)
  - Suggestions for next steps

**AC2.5: Error Handling**
- [ ] Add error state for failed queries
- [ ] GIVEN queueQuery.error exists
- [ ] WHEN rendering error state
- [ ] THEN display:
  - Error icon and heading
  - Error message from query
  - Retry button
  - Back to Dashboard button

**AC2.6: Deployment and Verification**
- [ ] Commit all P0 fixes with clear message
- [ ] Push to staging branch
- [ ] Wait for Cloudflare auto-deploy
- [ ] Test complete review flow:
  - Generate spokes for hub
  - Navigate to /app/review
  - Click "Just Generated" bucket
  - Verify content is visible
  - Test keyboard shortcuts work correctly
  - Test edit panel populates with content
  - Complete review of 5+ spokes
  - Verify sprint completion screen

## Tasks / Subtasks

- [ ] **Task 1: Investigation Phase** (AC: 1.1-1.4)
  - [ ] 1.1: Query staging D1 database via Cloudflare MCP
  - [ ] 1.2: Read ClientAgent.getReviewQueue method
  - [ ] 1.3: Test frontend query in browser DevTools
  - [ ] 1.4: Document findings in investigation summary

- [ ] **Task 2: Implement Data Loading Fix** (AC: 2.1)
  - [ ] 2.1: Identify correct scenario (A, B, or C)
  - [ ] 2.2: Update SQL query or filter logic
  - [ ] 2.3: Test query returns expected spokes
  - [ ] 2.4: Verify tRPC response includes items

- [ ] **Task 3: Add Frontend Guards** (AC: 2.2-2.5)
  - [ ] 3.1: Update keyboard shortcut handler with guards
  - [ ] 3.2: Implement enhanced loading state
  - [ ] 3.3: Implement enhanced empty state
  - [ ] 3.4: Implement error state handling
  - [ ] 3.5: Test all states render correctly

- [ ] **Task 4: Deploy and Verify** (AC: 2.6)
  - [ ] 4.1: Git commit with comprehensive message
  - [ ] 4.2: Push to stage branch
  - [ ] 4.3: Monitor Cloudflare deployment
  - [ ] 4.4: Execute full test checklist
  - [ ] 4.5: Document test results

## Dev Notes

### Critical Context: Phantom Interface Bug

**What's Happening:**
- Spokes generate successfully (workflow completes, no errors)
- Content exists in database with populated fields
- Review sprint page loads without errors
- BUT: No content visible to user
- Keyboard shortcuts still work (extremely dangerous - blind actions)
- Edit panel opens empty
- User completely confused and blocked

**User Impact:**
- 0% review completion rate (completely blocked)
- 100% user frustration
- Severe trust damage in entire product
- Users cannot verify content was actually generated

**Why This Is Critical:**
This is a P0 blocker because:
1. It breaks the core review workflow entirely
2. Creates dangerous phantom interface (invisible actions)
3. Happens AFTER user invested time in generation
4. Damages trust at critical moment of content delivery
5. No workaround available

### Technical Architecture

**Files to Investigate/Modify:**

**Frontend:**
- `apps/foundry-dashboard/src/routes/app/review.tsx` (Lines 61-71, 164-219, 300-346)
  - Query configuration and parameters
  - Keyboard shortcut handlers (need guards)
  - Loading/empty/error states (need enhancement)

**Backend:**
- `apps/foundry-dashboard/worker/trpc/routers/review.ts` (Lines 37-75)
  - `getQueue` procedure
  - Calls ClientAgent.getReviewQueue
  - Maps snake_case to camelCase

**ClientAgent:**
- `apps/foundry-engine/src/durable-objects/client-agent.ts`
  - `getReviewQueue` method (location TBD in investigation)
  - SQL query with WHERE clause filtering
  - Status filtering logic

**Database:**
- D1: `foundry-global-stage` (UUID: e35604ee-6e84-476f-a6ec-e6df6e12d81c)
- Table: `spokes`
- Relevant columns: id, client_id, status, content, created_at, reviewed_at

### Investigation Checklist

**Database Check:**
```sql
-- Run via Cloudflare MCP
SELECT
  id,
  hub_id,
  client_id,
  status,
  platform,
  LENGTH(content) as content_length,
  created_at,
  updated_at,
  reviewed_at
FROM spokes
WHERE client_id = '0a55a7d3-4cd5-45b1-9196-179d0423bab5'
ORDER BY created_at DESC
LIMIT 20;
```

**Expected Findings:**
- ✅ Spokes exist
- ✅ content_length > 0 (content populated)
- ✅ created_at within last 24 hours
- ✅ status = 'draft' or 'pending' or 'ready'

**Red Flags:**
- ❌ No spokes found → Generation actually failed
- ❌ content_length = 0 → Content not saved
- ❌ status = 'error' → Workflow failed
- ❌ client_id mismatch → Wrong client linkage

**Backend Query Check:**

Look for common SQL filtering issues:
```typescript
// WRONG - Too restrictive
WHERE status = 'pending'  // But spokes are 'draft'

// WRONG - Too narrow time window
WHERE created_at > unixepoch() - 3600  // Only 1 hour

// WRONG - Missing client filter
WHERE hub_id IN (SELECT id FROM hubs)  // No client_id check

// RIGHT - Inclusive filtering
WHERE status IN ('draft', 'pending', 'ready')
  AND client_id = ?
  AND reviewed_at IS NULL
  AND created_at > unixepoch() - 86400 * 7  // 7 days
```

**Frontend Query Check:**

Verify in browser DevTools:
1. Network tab → Filter for `trpc/review.getQueue`
2. Check request payload has `clientId` and `filter`
3. Check response has `items` array with data
4. Verify response structure matches expected format

### Likely Root Causes (Ranked by Probability)

**1. Status Filter Mismatch (70% probability)**
- Backend filters for `status = 'pending'`
- But spoke generation sets `status = 'draft'`
- Fix: Update WHERE clause to include multiple statuses

**2. 'just-generated' Filter Not Implemented (20% probability)**
- Filter value passed from frontend
- But no case handler in backend switch statement
- Fix: Add 'just-generated' case with date filter

**3. Client ID Linkage Issue (8% probability)**
- Spoke generation doesn't set client_id correctly
- Query filters by client_id and finds nothing
- Fix: Ensure client_id set on spoke INSERT

**4. Frontend Rendering Bug (2% probability)**
- Data arrives but component doesn't render
- Conditional rendering too aggressive
- Fix: Review rendering logic and conditions

### Testing Requirements

**P0 Verification Checklist:**
```
[ ] Generate 5+ spokes for test hub
[ ] Navigate to /app/review
[ ] Verify bucket cards show counts
[ ] Click "Just Generated" bucket
[ ] ✅ Content cards visible with text
[ ] ✅ Quality scores displayed
[ ] ✅ Platform icons shown
[ ] Press [E] to edit
[ ] ✅ Edit panel opens with content populated
[ ] ✅ Can modify and save content
[ ] Press [→] to approve
[ ] ✅ Visual feedback shown
[ ] ✅ Advances to next spoke
[ ] Press [←] to kill
[ ] ✅ Visual feedback shown
[ ] ✅ Advances to next spoke
[ ] Complete all spokes
[ ] ✅ Sprint complete screen shows accurate stats
[ ] Navigate back to dashboard
[ ] ✅ Counts updated correctly
```

### Project Structure Notes

**Database Schema (D1):**
- `spokes` table critical for review queue
- Status values must match between generation and query
- `reviewed_at` NULL indicates needs review
- `created_at` timestamp for time-based filtering

**tRPC Router Pattern:**
- Frontend calls `trpc.review.getQueue.useQuery()`
- Backend procedure at `routers/review.ts`
- Delegates to ClientAgent via `ctx.callAgent()`
- Response includes pagination (cursor, nextCursor, totalCount)

**ClientAgent Pattern:**
- Durable Object managing client state
- Holds SQL database connection
- All client-specific queries go through ClientAgent
- Returns data in snake_case (must map to camelCase)

**Frontend State Management:**
- React Query (tRPC) manages server state
- Local state for currentIndex, direction, stats
- Keyboard handlers attached to window
- Effects must depend on spokes.length to prevent stale closures

### Git Intelligence

**Recent Commits Related to Review:**
```bash
# Check recent work patterns
git log --oneline -10 --grep="review"
```

**Files Recently Modified:**
- apps/foundry-dashboard/src/routes/app/review.tsx (review interface)
- apps/foundry-dashboard/worker/trpc/routers/review.ts (review queries)
- apps/foundry-engine/src/workflows/spoke-generation.ts (spoke creation)

**Code Patterns to Follow:**
- Use `trpc.review.*` for all review queries
- Filter patterns: 'top10', 'flagged', 'needs-review', 'just-generated', 'golden-nuggets'
- Keyboard shortcuts use window event listeners in useEffect
- Action handlers use useCallback with proper dependencies
- Loading states show spinner with context message

### References

- [Remediation Plan: Phase 1 & Phase 2](/home/william_john_shaw/full-stack/_bmad-output/remediation-plan-review-sprint.md#phase-1-root-cause-investigation-30-minutes)
- [UX Trace: Phantom Interface Problem](/home/william_john_shaw/full-stack/_bmad-output/ux-trace-spoke-review-sprint.md#step-2-the-phantom-interface--critical-ux-failure)
- [Review Page Component](/home/william_john_shaw/full-stack/apps/foundry-dashboard/src/routes/app/review.tsx)
- [Review Router](/home/william_john_shaw/full-stack/apps/foundry-dashboard/worker/trpc/routers/review.ts)
- [ClientAgent Source](/home/william_john_shaw/full-stack/apps/foundry-engine/src/durable-objects/client-agent.ts)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

- Investigation findings: `_bmad-output/p0-1-investigation-summary.md` (to be created)
- Test results: `_bmad-output/p0-1-test-results.md` (to be created)

### Completion Notes List

- [ ] Root cause identified and documented
- [ ] SQL query fix implemented and tested
- [ ] Frontend guards prevent blind actions
- [ ] All three states (loading, empty, error) enhanced
- [ ] Full test checklist passed
- [ ] Content now visible in review sprint
- [ ] Trust restored in review workflow

### File List

**Modified:**
- `apps/foundry-engine/src/durable-objects/client-agent.ts` - Fixed getReviewQueue filter
- `apps/foundry-dashboard/src/routes/app/review.tsx` - Added guards and enhanced states
- `apps/foundry-dashboard/worker/trpc/routers/review.ts` - (if filter logic needed)

**Created:**
- `_bmad-output/p0-1-investigation-summary.md` - Root cause documentation
- `_bmad-output/p0-1-test-results.md` - Verification test results

---

## Success Criteria

**Before Fix:**
- ❌ Review completion rate: 0%
- ❌ User frustration: 100%
- ❌ Content visible: NO
- ❌ Keyboard shortcuts safe: NO
- ❌ User trust: Severely damaged

**After Fix:**
- ✅ Review completion rate: >80%
- ✅ User frustration: <20%
- ✅ Content visible: YES
- ✅ Keyboard shortcuts safe: YES
- ✅ User trust: Restored
- ✅ Feature unblocked: YES

**Definition of Done:**
1. Root cause documented with evidence
2. Fix implemented and code committed
3. All test checklist items pass
4. Content visible immediately after spoke generation
5. No blind keyboard actions possible
6. Professional loading/empty/error states
7. Deployed to staging and verified working
