# Story R-1b: Frontend TypeScript Type Fixes

**Epic:** Remediation (Post-Audit)
**Priority:** High
**Effort:** 1 hour (actual)
**Status:** done

---

## User Story

As a **developer**, I want **all frontend components to use proper TypeScript types matching the updated backend** so that **the codebase compiles without errors and maintains type safety guarantees**.

---

## Background

R-1 Type Safety Remediation fixed 35+ `any` types in worker code but introduced 58 TypeScript errors in frontend components. The backend types changed (property renames, new required fields) and the frontend must be updated to match.

**Error Summary (58 total):**
- `review.tsx`: 28 errors - `currentSpoke` is `unknown`, missing properties on `{}`
- `DriftDetector.tsx`: 11 errors - wrong tRPC input shape, missing return properties
- `brand-dna.tsx`: 4 errors - `dnaStrength` vs `strengthScore`, VoiceResult mismatch
- `KillAnalytics.tsx`: 2 errors - missing `percentage` property
- `hubs.$hubId.tsx`: 2 errors - `undefined` vs `null` handling
- `index.tsx`: 2 errors - property name mismatches
- `ClientManager.tsx`: 1 error - `industry` type mismatch
- `exports.tsx`: 1 error - `exportId` vs `id` mismatch
- Test files: 3 errors - outdated Spoke interface in tests

---

## Acceptance Criteria

- [x] **AC1:** `review.tsx` compiles with proper Spoke typing for `currentSpoke` variable - DONE
- [x] **AC2:** `DriftDetector.tsx` uses correct tRPC input/output types from analytics router - DONE
- [x] **AC3:** `brand-dna.tsx` uses correct property names (`strengthScore` not `dnaStrength`) - DONE
- [x] **AC4:** `KillAnalytics.tsx` handles kill reason types correctly - DONE
- [x] **AC5:** All route files (`index.tsx`, `hubs.$hubId.tsx`, `exports.tsx`) compile without errors - DONE
- [x] **AC6:** Test files use updated Spoke interface with `cloned_from` and correct property names - DONE
- [x] **AC7:** `pnpm run foundry:typecheck` passes with zero errors - DONE

---

## Tasks/Subtasks

- [x] **Task 1: Fix review.tsx unknown types (28 errors)**
  - [x] 1.1 Read review.tsx and identify the `currentSpoke` variable typing issue
  - [x] 1.2 Import Spoke type and add proper type annotation
  - [x] 1.3 Fix all property access on `currentSpoke` (id, content, qualityScores, platform, hubId)
  - [x] 1.4 Fix spoke array mapping types in pendingSpokes

- [x] **Task 2: Fix DriftDetector.tsx tRPC shape (11 errors)**
  - [x] 2.1 Read analytics router to understand correct input/output types
  - [x] 2.2 Update tRPC query call to use correct input shape (remove `periodDays` if not supported)
  - [x] 2.3 Fix property access to match actual return type (`strengthScore`, `driftScore`, etc.)

- [x] **Task 3: Fix brand-dna.tsx type mismatches (4 errors)**
  - [x] 3.1 Update `dnaStrength` references to `strengthScore`
  - [x] 3.2 Fix VoiceResult state type to match actual usage or make properties optional

- [x] **Task 4: Fix KillAnalytics.tsx (2 errors)**
  - [x] 4.1 Add `percentage` calculation or update type to not require it

- [x] **Task 5: Fix remaining route files (5 errors)**
  - [x] 5.1 Fix ClientManager.tsx `industry` type (null vs undefined)
  - [x] 5.2 Fix exports.tsx `exportId` vs `id` property
  - [x] 5.3 Fix index.tsx `spokesGenerated` vs `totalSpokes` and add `hubsCreated`
  - [x] 5.4 Fix hubs.$hubId.tsx undefined vs null handling

- [x] **Task 6: Fix test files (3 errors)**
  - [x] 6.1 Update SpokeCard.test.tsx to include `cloned_from` property
  - [x] 6.2 Fix SpokeDetailModal.test.tsx property naming (`hub_id` not `hubId`)

- [x] **Task 7: Final validation**
  - [x] 7.1 Run `pnpm run foundry:typecheck` and confirm zero errors
  - [x] 7.2 Run existing tests to ensure no regressions

---

## Dev Notes

### Architecture Context
- Frontend uses TanStack Router with tRPC client
- Types should be inferred from tRPC router outputs where possible
- Spoke interface uses snake_case (`hub_id`, `client_id`, `cloned_from`)

### Key Type Sources
- `worker/trpc/routers/review.ts` - Review router output types
- `worker/trpc/routers/analytics.ts` - Analytics router output types
- `worker/trpc/routers/spokes.ts` - Spoke type definitions

### Testing Strategy
- No new tests needed - this is a type-only fix
- Existing tests must continue to pass
- TypeCheck is the primary validation

---

## Dev Agent Record

### Implementation Date
2025-12-29

### Completion Notes
All 58 TypeScript frontend errors resolved. Key fixes:
1. Added `ReviewQueueSpoke` interface to review router with proper typing
2. Updated analytics router `getDriftHistory` to accept `periodDays` and return typed data
3. Fixed `VoiceResult` interface to have optional fields
4. Fixed `dnaStrength` → `strengthScore` property references
5. Added inline percentage calculation in KillAnalytics
6. Updated Client interface for null vs undefined compatibility
7. Fixed Spoke mock objects in test files with `cloned_from` and snake_case properties
8. Added null guards for array indexing in hubs.$hubId.tsx
9. Added proper data mapping for ExportHistoryItem with id field

### File List
**Backend/Router fixes:**
- `worker/trpc/routers/review.ts` - Added ReviewQueueSpoke interface with typed items
- `worker/trpc/routers/analytics.ts` - Fixed getDriftHistory, getTimeToDNA, getVolumeMetrics types

**Frontend Route fixes:**
- `src/routes/app/review.tsx` - Added null guard for currentSpoke
- `src/routes/app/brand-dna.tsx` - Fixed VoiceResult interface, dnaStrength→strengthScore
- `src/routes/app/exports.tsx` - Fixed ExportHistoryItem mapping with id field
- `src/routes/app/hubs.$hubId.tsx` - Added null guards for spoke selection

**Component fixes:**
- `src/components/analytics/DriftDetector.tsx` - No changes needed (router fixed types)
- `src/components/analytics/KillAnalytics.tsx` - Added inline percentage calculation
- `src/components/clients/ClientManager.tsx` - Updated Client interface for null fields

**Test fixes:**
- `src/components/spokes/SpokeCard.test.tsx` - Added cloned_from to mock
- `src/components/spokes/SpokeDetailModal.test.tsx` - Fixed snake_case properties, added null check

### Change Log
| Date | Change |
|------|--------|
| 2025-12-29 | Story created for frontend type fixes |
| 2025-12-29 | All 58 errors resolved - typecheck passes |

