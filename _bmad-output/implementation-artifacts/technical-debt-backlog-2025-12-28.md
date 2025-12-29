# Technical Debt Backlog - 2025-12-28

## Overview
This document captures medium and low severity issues discovered during the 2025-12-28 codebase audit. These are not blocking production but should be addressed for long-term maintainability.

## Medium Severity (6 Issues)

### TD-M1: Unsafe JSON Parsing
**File:** `apps/foundry-dashboard/worker/trpc/routers/spokes.ts:190`
**Issue:** JSON parsing of `supporting_points` without error handling
**Risk:** Uncaught exception if JSON is malformed
**Fix:** Wrap in try-catch with fallback to empty array
```typescript
hooks: p.supporting_points
  ? (() => { try { return JSON.parse(p.supporting_points); } catch { return []; }})()
  : [],
```
**Priority:** Medium
**Effort:** 15 minutes

---

### TD-M2: Hub Creation Wizard Placeholder Navigation
**File:** `apps/foundry-dashboard/src/routes/app/hubs.new.tsx:323`
**Issue:** "Start Generation" button just navigates instead of starting generation
**Risk:** User confusion - button implies action that doesn't happen
**Fix:** Either implement auto-generation or update UI copy to clarify
**Priority:** Medium
**Effort:** 1-2 hours

---

### TD-M3: Console.log Pollution in Workflows
**File:** `apps/foundry-engine/src/workflows/hub-ingestion.ts:60-163`
**Issue:** Multiple console.log statements for structured logging
**Risk:** Log pollution in production, no structured log querying
**Fix:** Replace with proper logging infrastructure
**Priority:** Medium
**Effort:** 2 hours

---

### TD-M4: Missing Error Context in Error Handling
**Files:** `apps/foundry-dashboard/src/routes/app/brand-dna.tsx:135,208,236,260,312`
**Issue:** Error handlers log to console but don't notify users
**Risk:** Silent failures - users don't know something went wrong
**Fix:** Add toast notifications and graceful error states
**Priority:** Medium
**Effort:** 2-3 hours

---

### TD-M5: Missing Zod Validation for AI Responses
**File:** `apps/foundry-engine/src/workflows/calibration.ts:109`
**Issue:** AI response JSON parsing without schema validation
**Risk:** Invalid AI responses could crash or corrupt data
**Fix:** Add Zod schema validation for ExtractedEntities
**Priority:** Medium
**Effort:** 1 hour

---

### TD-M6: Time-to-DNA Test Placeholder
**File:** `apps/foundry-engine/src/durable-objects/client-agent.test.ts:21`
**Issue:** Test has placeholder comment for Time-to-DNA implementation
**Risk:** Missing test coverage for critical metric
**Fix:** Implement actual Time-to-DNA calculation tests
**Priority:** Medium
**Effort:** 2 hours

---

## Low Severity (4 Issues)

### TD-L1: Excessive `any` Types in Components
**Files:**
- `ClientManager.tsx`
- `ShareLinkModal.tsx`
- `TeamAssignment.tsx`
- `test/setup.tsx`
**Issue:** `any` type in map callbacks and component props
**Risk:** Type errors not caught at compile time
**Fix:** Create proper TypeScript interfaces
**Priority:** Low
**Effort:** 3-4 hours

---

### TD-L2: Missing Skeleton Loading States
**Files:** Various route files (`exports.tsx`, `analytics.tsx`, `creative-conflicts.tsx`)
**Issue:** Loading states could be improved with skeleton screens
**Risk:** Poor perceived performance during data loading
**Fix:** Add skeleton components for better UX
**Priority:** Low
**Effort:** 4-6 hours

---

### TD-L3: Incomplete Exports Router
**File:** `apps/foundry-dashboard/worker/trpc/routers/exports.ts`
**Issue:** Basic router (60 lines) may be missing advanced features
**Risk:** Limited export functionality for power users
**Fix:** Review requirements and implement missing endpoints
**Priority:** Low
**Effort:** 4-8 hours

---

### TD-L4: Incomplete Analytics Router
**File:** `apps/foundry-dashboard/worker/trpc/routers/analytics.ts`
**Issue:** Basic metrics but may lack advanced analytics
**Risk:** Dashboard not showing all needed insights
**Fix:** Review analytics requirements and expand
**Priority:** Low
**Effort:** 4-8 hours

---

## Summary

| Severity | Count | Total Effort |
|----------|-------|--------------|
| Medium   | 6     | ~10 hours    |
| Low      | 4     | ~20 hours    |
| **Total**| 10    | ~30 hours    |

## Recommended Approach

1. **Address Medium issues during Epic 9** - They're quick wins (10 hours total)
2. **Schedule Low issues for post-MVP** - They're nice-to-have improvements
3. **Create Epic 10 (Technical Debt)** if issues accumulate further

## Related Documents
- `sprint-status.yaml` - Epic 9 stories track critical issues
- `9-1` through `9-8` - Story files for high/critical issues
