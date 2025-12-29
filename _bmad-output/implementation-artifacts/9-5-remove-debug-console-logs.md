# Story 9.5: Remove Debug Console Logs from Production Code

## Status: review

## Story Summary
Remove 20+ debug console.log statements from production code paths. These logs leak debugging information to browser consoles and pollute server logs.

## Business Value
Debug logs in production are unprofessional and may expose internal implementation details to users. They also add noise to production monitoring and make debugging real issues harder.

## Acceptance Criteria

| AC | Description | Status |
|----|-------------|--------|
| AC1 | All `console.log` statements removed from `hubs.$hubId.tsx` (10+ instances) | DONE |
| AC2 | All `console.log` statements removed from workflow files (9+ instances) | DONE |
| AC3 | Production build has zero debug console.log statements | DONE |
| AC4 | Proper logging infrastructure used where logging is needed | DONE |

## Technical Details

### Locations Cleaned

**Frontend - `apps/foundry-dashboard/src/routes/app/hubs.$hubId.tsx`:**
- Removed 10 debug console.log statements (Spokes Debug, Spoke Gen polling logs)
- Kept 1 console.error for error handling

**Frontend - `apps/foundry-dashboard/src/routes/app/review.tsx`:**
- Removed 1 debug console.log (Clone options)

**Backend - `apps/foundry-engine/src/workflows/hub-ingestion.ts`:**
- Removed 6 debug console.log statements
- Kept structured `logMetric` function for NFR-P2 (30s SLA) monitoring

**Backend - `apps/foundry-engine/src/workflows/calibration.ts`:**
- Already clean (no debug logs)

**Worker - `apps/foundry-dashboard/worker/hono/app.ts`:**
- Removed 7 debug console.log statements (auth, upload)
- Kept console.error for error handling

**Worker - `apps/foundry-dashboard/worker/email/index.ts`:**
- Removed 3 debug console.log statements (success, dev mode)
- Kept console.error for error handling

**Worker - `apps/foundry-dashboard/worker/trpc/routers/calibration.ts`:**
- Removed 2 debug console.log statements (registerFileSample)

### Logging Strategy
- **console.error**: Kept for genuine error conditions
- **Structured logging (logMetric)**: Kept for NFR-P2 SLA monitoring (JSON format)
- **Debug console.log**: Removed from all production paths
- Test files, scripts, and load tests retain console.log (acceptable)

## Tasks

- [x] Remove all console.log from hubs.$hubId.tsx
- [x] Remove all console.log from hub-ingestion.ts
- [x] Remove all console.log from calibration.ts
- [x] Audit other route files for debug logs
- [x] Create logger utility with dev/prod modes (optional) - Not needed; structured logging via logMetric already exists
- [x] Verify no console.log in production build

## Dev Agent Record

### Implementation Plan
1. Remove debug logs from hubs.$hubId.tsx (10 instances)
2. Remove debug logs from hub-ingestion.ts (6 instances, keep logMetric)
3. Verify calibration.ts is clean
4. Audit and clean other worker files
5. Run TypeScript check to verify no regressions

### Completion Notes
- **Total removed**: 29 debug console.log statements
- **Kept**:
  - console.error for error handling (3 locations)
  - Structured logMetric for NFR-P2 monitoring (1 location)
- **TypeScript**: Compiles successfully
- **Test files**: Retain console.log (acceptable for debugging tests)

## File List
- apps/foundry-dashboard/src/routes/app/hubs.$hubId.tsx
- apps/foundry-dashboard/src/routes/app/review.tsx
- apps/foundry-dashboard/worker/hono/app.ts
- apps/foundry-dashboard/worker/email/index.ts
- apps/foundry-dashboard/worker/trpc/routers/calibration.ts
- apps/foundry-engine/src/workflows/hub-ingestion.ts

## Change Log
| Date | Change |
|------|--------|
| 2025-12-28 | Story created from codebase audit findings |
| 2025-12-28 | Implementation complete - 29 debug logs removed, TypeScript passing |
