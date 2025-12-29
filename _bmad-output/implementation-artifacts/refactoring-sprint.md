# Story: Refactoring Sprint

**Story ID:** refactoring-sprint
**Status:** in-progress
**Priority:** High
**Effort:** ~12 hours total

---

## Description
This story covers a prioritized list of technical debt remediation, feature enhancements, and quality improvements identified for immediate execution. The goal is to clean up the codebase, improve security/UX, and ensure type safety before further feature development.

## Acceptance Criteria
- [x] Legacy imports removed and replaced with correct module paths
- [ ] Design tokens applied consistently across the UI (Midnight Command theme)
- [ ] Console logs removed from production builds (security)
- [ ] Spoke navigation improved for better UX
- [ ] "Clone Spoke" feature implemented and functional
- [ ] Real analytics integration (replacing mocks)
- [ ] Type safety improvements (strict mode, no any)

---

## Tasks/Subtasks

### R-7 Remove Legacy Imports (P0 BLOCKER)
- [x] Identify legacy imports (e.g., old relative paths, deprecated packages)
- [x] Replace with modern aliases (e.g., `@/components`, `@repo/data-ops`)
- [x] Verify build passes without import errors

### R-3 Design Tokens (Quick win)
- [ ] Audit UI for hardcoded hex values or arbitrary Tailwind classes
- [ ] Replace with semantic variables from `project-context.md` (e.g., `bg-[#0F1419]`)
- [ ] Ensure "Midnight Command" theme consistency

### R-6 Console Logs (Security)
- [ ] Scan codebase for `console.log`, `console.warn`, `console.error`
- [ ] Remove logs or replace with proper logging utility (if available)
- [ ] Ensure no sensitive data is logged in production

### R-5 Spoke Navigation (UX)
- [ ] Improve navigation between Spokes (previous/next or list view)
- [ ] Ensure breadcrumbs or back navigation works correctly
- [ ] Verify active state styling in navigation menus

### R-4 Clone Spoke (Feature)
- [ ] Implement "Clone" button in Spoke UI
- [ ] Create backend mutation to duplicate Spoke record
- [ ] Handle title/slug differentiation for cloned spoke
- [ ] Verify cloned spoke appears in lists

### R-2 Real Analytics (Data)
- [ ] Replace mocked analytics data with real DB queries
- [ ] Ensure analytics charts render actual data from `spokes` or `analytics` tables
- [ ] Verify data accuracy

### R-1 Type Safety (Quality)
- [ ] Run type checker (`tsc`) and identify errors
- [ ] Fix implicit `any` types
- [ ] Ensure strict null checks are respected where possible
- [ ] Improve return type definitions for API endpoints

---

## Dev Notes
- **Context:** Refer to `project-context.md` for strict design tokens and architectural rules.
- **Testing:** Add unit/integration tests for new features (Clone Spoke) and ensure no regressions for refactors.
- **Priority:** Follow the task order strictly (P0 first).

## Dev Agent Record

### Implementation Plan
- Will execute tasks in the order defined above.
- Will run tests after each task.

### Completion Notes
- **R-7 Completed:** Removed legacy `@repo/data-ops` imports and `../../worker` relative imports. Replaced with local schema definitions in `worker/db` and fixed Context types.
- **Note:** `typecheck` still reports errors in `calibration.test.ts` (legacy test rot) and `brand-dna.tsx` (type mismatch), which will be addressed in R-1.

## File List
- apps/foundry-dashboard/worker/db/index.ts
- apps/foundry-dashboard/worker/db/schema.ts
- apps/foundry-dashboard/worker/db/queries/brand.ts
- apps/foundry-dashboard/worker/trpc/context.ts
- apps/foundry-dashboard/worker/trpc/routers/calibration.ts
- apps/foundry-dashboard/src/routes/app/brand-dna.tsx
- apps/foundry-dashboard/worker/trpc/routers/__tests__/integration-harness.ts
- apps/foundry-dashboard/worker/trpc/routers/__tests__/utils.ts

## Change Log
- 2025-12-29: Replaced legacy imports with local implementations. Fixed D1 database typing in Context and Queries.