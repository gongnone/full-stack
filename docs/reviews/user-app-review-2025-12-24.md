# Self-Correction Review: User Application (2025-12-24)

## Feature Overview
System-wide audit for hardcoded values, magic numbers, and error-handling gaps in `apps/user-application`.

## Findings

### 1. Hardcoded Magic Numbers & Timeouts
- **Location:** `apps/user-application/worker/trpc/routers/hubs.ts`
  - `setTimeout(resolve, 1000)` (Line 14) - Simulated extraction delay.
  - `limit: 50` (Line 27) - Default listing limit.

### 2. Lack of Centralized Constants
- **Location:** `apps/user-application/src/components/common/nav-main.tsx`
  - Hardcoded route paths (`/app`, `/app/projects`, etc.) in the `items` array.
- **Location:** `apps/user-application/src/routes/app/_authed.tsx`
  - Hardcoded sidebar width and header height variables (Line 22-23).

### 3. Error Handling Gaps
- **Location:** `apps/user-application/worker/trpc/routers/hubs.ts`
  - `update` mutation (Line 100) doesn't use `mutateAsync` style catch blocks in the potential UI caller (need to check callers).
  - `extractThemes` simulation doesn't handle failures.

### 4. Code Quality & Maintenance
- **Location:** `apps/user-application/src/components/common/nav-main.tsx`
  - Use of `as any` for navigation (Line 40, 46, 64) due to TanStack Router typing gaps.

## Recommended Fixes

### Critical
- [ ] Centralize route paths into a `ROUTES` constant (shared with `foundry-dashboard` if possible, or local).
- [ ] Centralize UI dimensions (Sidebar width).
- [ ] Add standardized error handling for worker mutations.

### Structural
- [ ] Align `user-application` constants with `foundry-dashboard` for consistency in the monorepo.
