# Story TD-1: Migrate to Vitest Pool Workers

Status: in-progress

## Story

As a **developer maintaining the Foundry codebase**,
I want **to migrate our integration test suite to `@cloudflare/vitest-pool-workers`**,
so that **tests run reliably in CI/CD environments and correctly simulate the Cloudflare runtime**.

## Problem Statement

Current integration tests use a custom Miniflare harness that fails in GitHub Actions (Ubuntu) due to D1 proxy initialization issues. This prevents reliable CI/CD verification of backend logic.

**Root Cause:** The `better-sqlite3` binding used by the standalone Miniflare proxy has compatibility issues in certain CI environments, and the custom harness is brittle.

## Acceptance Criteria

| # | Criteria | Priority |
|---|----------|----------|
| AC1 | `@cloudflare/vitest-pool-workers` is installed and configured | P0 |
| AC2 | Custom `integration-harness.ts` logic is replaced by native worker pool `env` injection | P0 |
| AC3 | `applyD1Migrations` is used to seed the test database automatically | P0 |
| AC4 | All existing integration tests pass locally without `miniflare` CLI wrappers | P0 |
| AC5 | `vitest.config.ts` correctly isolates unit vs. integration tests | P1 |
| AC6 | `package.json` scripts are updated to use the new runner | P1 |

## Tasks / Subtasks

### Task 1: Install and Configure Runner (AC: 1, 5, 6)

- [ ] 1.1 Install `@cloudflare/vitest-pool-workers` as dev dependency
- [ ] 1.2 Update `vitest.config.ts` to add `poolOptions.workers` configuration
  - Configure `main` entry point
  - Configure `miniflare` compatibility flags (compatibility_date, compatibility_flags)
  - Map `wrangler.jsonc` bindings
- [ ] 1.3 Update `package.json` test scripts (`test:int`, `test:ci`)

### Task 2: Setup Test Environment (AC: 3)

- [ ] 2.1 Create `apps/foundry-dashboard/test/env.d.ts` for type safety of `env`
- [ ] 2.2 Create `apps/foundry-dashboard/test/setup.ts`
- [ ] 2.3 Implement `applyD1Migrations` in setup to ensure fresh DB for tests

### Task 3: Refactor Integration Tests (AC: 2, 4)

- [ ] 3.1 Refactor `apps/foundry-dashboard/worker/trpc/routers/__tests__/integration-harness.ts`
  - Remove manual Miniflare instance creation
  - Export helper to access `env` from test context
- [ ] 3.2 Update `auth.test.ts` to use new harness/env
- [ ] 3.3 Update `clients.test.ts` to use new harness/env
- [ ] 3.4 Update `hubs.test.ts` to use new harness/env
- [ ] 3.5 Update `spokes.test.ts` to use new harness/env
- [ ] 3.6 Update `analytics.test.ts` to use new harness/env
- [ ] 3.7 Update `calibration.test.ts` to use new harness/env

### Task 4: Verification (AC: 4)

- [ ] 4.1 Run full integration test suite locally
- [ ] 4.2 Verify no "D1 proxy" errors occur

## Dev Notes

### Reference Configuration

**vitest.config.ts:**
```typescript
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          compatibilityDate: '2024-04-05',
          compatibilityFlags: ['nodejs_compat'],
        },
      },
    },
  },
});
```

### Migration Strategy
The new pool worker exposes `env` directly in the test context. We no longer need to spin up a server.
Use `cloudflare:test` to import `env`.

## Dev Agent Record

### Agent Model Used
(To be filled)

### File List

**Modify:**
- `apps/foundry-dashboard/package.json`
- `apps/foundry-dashboard/vitest.config.ts`
- `apps/foundry-dashboard/worker/trpc/routers/__tests__/integration-harness.ts`
- All test files in `apps/foundry-dashboard/worker/trpc/routers/__tests__/`

**Create:**
- `apps/foundry-dashboard/test/setup.ts`
- `apps/foundry-dashboard/test/env.d.ts`
