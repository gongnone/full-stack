# Remediation Backlog

**Project:** The Agentic Content Foundry
**Generated:** 2025-12-27
**Source:** testarch-trace Traceability Matrix Analysis
**Purpose:** Convert "passing with mocks" tests to "passing with real services"

---

## Executive Summary

The traceability matrix identified **1,725 tests** with 97.3% coverage. However, deep analysis reveals:

| Issue Category | Count | Impact |
|----------------|-------|--------|
| **Stub-based tRPC tests** | 11 files | Pass in CI, may fail with real D1/DO |
| **E2E tests with `test.skip`** | 58+ instances | Skip when data doesn't exist |
| **Missing user journey E2E** | ~15 flows | Component tests exist, journey doesn't |

**BMAD Rule Violation:** A P0 feature is not "Done" until an E2E test runs against a deployed (or emulated) environment.

---

## Step A: Promote Stubs to Real Services (Integration)

### Priority: P0 - Critical Infrastructure

These tRPC router tests use `createMockContext()` which mocks:
- `mockDb` - Fake D1 database responses
- `mockCallAgent` - Fake Durable Object calls
- `mockFetch` - Fake CONTENT_ENGINE service binding

#### TASK-001: Refactor `spokes.test.ts` to Real D1 Integration

**File:** `worker/trpc/routers/__tests__/spokes.test.ts`

**Current Problem:**
```typescript
mockCallAgent.mockResolvedValue({ success: true });
await caller.approve(input);
expect(mockCallAgent).toHaveBeenCalledWith(/* ... */);
```

**Remediation:**
```typescript
// spokes.integration.test.ts
import { createIntegrationContext } from './integration-harness';

describe('spokesRouter - Integration', () => {
  let ctx: ReturnType<typeof createIntegrationContext>;

  beforeAll(async () => {
    ctx = await createIntegrationContext({
      d1: true,  // Use local D1
      durableObjects: true,  // Use miniflare DO
    });
  });

  it('approve mutation writes to D1 and updates DO state', async () => {
    const caller = spokesRouter.createCaller(ctx);

    // Seed real data
    await ctx.db.exec(`INSERT INTO spokes (id, client_id, status) VALUES (?, ?, 'pending')`, [spokeId, clientId]);

    // Call real endpoint
    const result = await caller.approve({ clientId, spokeId });

    // Verify D1 state changed
    const row = await ctx.db.first('SELECT status FROM spokes WHERE id = ?', [spokeId]);
    expect(row.status).toBe('approved');
  });
});
```

**Acceptance Criteria:**
- [x] Test must write to actual local D1 database
- [x] Test must read the record back and verify state change
- [ ] Test must not use `mockCallAgent` or `mockDb`
- [ ] Test must run in CI with `wrangler d1 execute --local`

**Estimated Effort:** 2-3 hours

---

#### TASK-002: Create Integration Harness for Real D1/DO

**File:** `worker/trpc/routers/__tests__/integration-harness.ts`

**Current State:** Exists but only has mock setup

**Remediation:**
```typescript
import { unstable_dev } from 'wrangler';
import { Miniflare } from 'miniflare';

export async function createIntegrationContext(options: {
  d1?: boolean;
  durableObjects?: boolean;
  contentEngine?: boolean;
}) {
  // Spin up local D1
  const mf = new Miniflare({
    modules: true,
    script: '',
    d1Databases: ['DB'],
    durableObjects: {
      CLIENT_AGENT: 'ClientAgent',
    },
  });

  const db = await mf.getD1Database('DB');

  // Apply migrations
  await db.exec(fs.readFileSync('migrations/0001_initial_schema.sql', 'utf-8'));

  return {
    env: { DB: db },
    db,
    userId: 'integration-test-user',
    accountId: 'integration-test-account',
    userRole: 'admin',
    callAgent: createRealAgentCaller(mf),
  };
}
```

**Acceptance Criteria:**
- [ ] Harness creates real local D1 database
- [ ] Harness applies migration files
- [ ] Harness can spawn Durable Objects via Miniflare
- [ ] Teardown cleans up resources

**Estimated Effort:** 4-6 hours

---

#### TASK-003: Refactor `hubs.test.ts` to Real D1 Integration

**File:** `worker/trpc/routers/__tests__/hubs.test.ts`

**Current Problem:** Uses `mockDb.all.mockResolvedValue([{ id: 'hub-1' }])`

**Remediation:**
- Create `hubs.integration.test.ts` that:
  1. Seeds a real hub via D1 insert
  2. Calls `hubs.list` and verifies response
  3. Calls `hubs.get` and verifies full hub data
  4. Calls `hubs.createUrlSource` and verifies D1 write

**Acceptance Criteria:**
- [ ] Test reads from actual D1 tables
- [ ] Test writes create real D1 records
- [ ] No mocks for database layer

**Estimated Effort:** 2-3 hours

---

#### TASK-004: Refactor `clients.test.ts` to Real D1 Integration

**File:** `worker/trpc/routers/__tests__/clients.test.ts`

**Current Problem:** Client creation/listing uses mocked responses

**Remediation:**
- Create `clients.integration.test.ts`
- Verify D1 `clients` table insertions
- Verify multi-tenant isolation (User A can't see User B's clients)

**Acceptance Criteria:**
- [ ] Create client writes to D1
- [ ] List clients reads from D1
- [ ] Isolation test: Two users, separate clients

**Estimated Effort:** 2-3 hours

---

### Integration Tests Summary (Step A)

| Task ID | Router | Priority | Status | Effort |
|---------|--------|----------|--------|--------|
| TASK-001 | spokes | P0 | TODO | 2-3h |
| TASK-002 | harness | P0 | TODO | 4-6h |
| TASK-003 | hubs | P0 | TODO | 2-3h |
| TASK-004 | clients | P0 | TODO | 2-3h |
| TASK-005 | calibration | P1 | TODO | 2h |
| TASK-006 | review | P1 | TODO | 2h |
| TASK-007 | exports | P2 | TODO | 1-2h |
| TASK-008 | analytics | P3 | TODO | 1-2h |

**Total Estimated Effort:** 16-24 hours

---

## Step B: Fill E2E Gaps (User Journeys)

### Priority: P0 - Self-Healing Loop Flow

The `story-4.3-self-healing-loop.spec.ts` has **12 `test.skip` calls**. These tests don't run when:
- No review items exist
- No spokes in queue
- Login fails

#### TASK-010: Self-Healing Loop - Guaranteed Data E2E

**Current Problem:**
```typescript
test('ArrowRight approves spoke', async ({ page }) => {
  const hasItems = await hasReviewItems(page);
  test.skip(!hasItems, 'No review items for keyboard test');
  // Test never runs because data doesn't exist
});
```

**Remediation:**
```typescript
import { test, expect, SeededData } from '../fixtures/seed-test-data';

test.describe('Story 4.3: Self-Healing Loop - Full Journey', () => {
  test('Complete self-healing flow: generate -> fail -> regenerate -> approve', async ({ page, seededData }) => {
    // GIVEN: A hub with source content exists
    expect(seededData.hubId).toBeTruthy();

    // WHEN: User triggers spoke generation
    await page.goto(`/app/hubs/${seededData.hubId}`);
    await page.click('button:has-text("Generate Spokes")');

    // THEN: Generation workflow starts
    await expect(page.locator('text=/generating|processing/i')).toBeVisible();

    // WAIT: For workflow to complete (with timeout)
    await page.waitForSelector('text=/\\d+ spokes/i', { timeout: 60000 });

    // NAVIGATE: To review queue
    await page.goto('/app/review');

    // VERIFY: Spokes appear in queue (not skipped!)
    await expect(page.locator('.whitespace-pre-wrap')).toBeVisible();

    // ACTION: Approve with keyboard
    await page.keyboard.press('ArrowRight');

    // VERIFY: Transition occurred
    await expect(page.locator('text=/\\d+ \\/ \\d+/')).toBeVisible();
  });
});
```

**Acceptance Criteria:**
- [ ] Test NEVER uses `test.skip`
- [ ] Test creates its own hub/spokes via seed fixture
- [ ] Test runs in CI with guaranteed data
- [ ] Test covers: Generate -> Review -> Approve flow

**Estimated Effort:** 4-6 hours

---

#### TASK-011: Context Isolation - Guaranteed Multi-User E2E

**Current Problem:** Tests check isolation but don't create multiple users

**Remediation:**
```typescript
test('User A cannot see User B data', async ({ browser }) => {
  // Create two isolated browser contexts (two users)
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();

  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  // Login as User A, create hub
  await loginAs(pageA, 'user-a@test.com');
  await createHub(pageA, 'User A Secret Hub');

  // Login as User B, verify can't see User A's hub
  await loginAs(pageB, 'user-b@test.com');
  await pageB.goto('/app/hubs');
  await expect(pageB.locator('text=User A Secret Hub')).not.toBeVisible();
});
```

**Acceptance Criteria:**
- [ ] Two browser contexts, two users
- [ ] User A creates data
- [ ] User B cannot see User A's data
- [ ] No mocks, real authentication

**Estimated Effort:** 3-4 hours

---

#### TASK-012: Keyboard-First Approval - Performance E2E

**Current Problem:** Tests check < 200ms but don't enforce it

**Remediation:**
```typescript
test('Approval completes within 200ms (NFR-P4)', async ({ page, seededData }) => {
  await page.goto('/app/review');
  await expect(page.locator('.whitespace-pre-wrap')).toBeVisible();

  // Measure actual response time
  const startTime = performance.now();
  await page.keyboard.press('ArrowRight');

  // Wait for visual transition to start
  await page.waitForFunction(() => {
    const card = document.querySelector('.transition-all');
    return card && card.classList.contains('translate-x-');
  });

  const endTime = performance.now();
  const responseTime = endTime - startTime;

  // ENFORCE NFR-P4
  expect(responseTime).toBeLessThan(200);

  // Log for monitoring
  console.log(`[NFR-P4] Approval response time: ${responseTime}ms`);
});
```

**Acceptance Criteria:**
- [ ] Test measures actual response time
- [ ] Test FAILS if > 200ms
- [ ] Test logs metric for trend analysis

**Estimated Effort:** 1-2 hours

---

### E2E Journey Tests Summary (Step B)

| Task ID | Journey | Priority | Current Skips | Status |
|---------|---------|----------|---------------|--------|
| TASK-010 | Self-Healing Loop | P0 | 0 | ✅ DONE |
| TASK-011 | Context Isolation | P0 | 0 | ✅ DONE |
| TASK-012 | Keyboard Approval | P0 | 0 | ✅ DONE |
| TASK-013 | Spoke Generation | P1 | 8 | TODO |
| TASK-014 | Creative Conflicts | P1 | 11 | TODO |
| TASK-015 | Export Engine | P2 | 4 | TODO |
| TASK-016 | Brand DNA Analysis | P2 | 5 | TODO |
| TASK-017 | Visual Concepts | P3 | 3 | TODO |

**Total E2E Skips to Fix:** 31 (was 52, fixed 21)

---

## Step C: Production Smoke Tests

### Priority: P0 - Post-Deploy Verification

Create a minimal smoke test suite that runs after every production deploy.

#### TASK-020: Production Smoke Test Suite

**File:** `e2e/smoke/production.spec.ts`

```typescript
/**
 * Production Smoke Tests
 * Run after every deploy to verify critical paths work.
 *
 * @tags @smoke @production @P0
 */

import { test, expect } from '@playwright/test';

const PROD_URL = process.env.PROD_URL || 'https://foundry.williamjshaw.ca';

test.describe('Production Smoke Tests', () => {
  test('Homepage loads', async ({ page }) => {
    const response = await page.goto(PROD_URL);
    expect(response?.status()).toBe(200);
  });

  test('Login page accessible', async ({ page }) => {
    await page.goto(`${PROD_URL}/login`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('API health check', async ({ request }) => {
    const response = await request.get(`${PROD_URL}/api/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('D1 database connectivity', async ({ request }) => {
    const response = await request.get(`${PROD_URL}/api/health/db`);
    expect(response.status()).toBe(200);
  });

  test('Authenticated user can access dashboard', async ({ page }) => {
    // Login
    await page.goto(`${PROD_URL}/login`);
    await page.fill('input[type="email"]', process.env.SMOKE_TEST_EMAIL!);
    await page.fill('input[type="password"]', process.env.SMOKE_TEST_PASSWORD!);
    await page.click('button[type="submit"]');

    // Verify dashboard loads
    await page.waitForURL(/\/app/);
    await expect(page.locator('aside')).toBeVisible();
  });
});
```

**Acceptance Criteria:**
- [ ] Runs in < 30 seconds
- [ ] Covers: Homepage, Login, API, D1, Auth
- [ ] Fails fast on any critical issue
- [ ] Integrated into GitHub Actions deploy workflow

**Estimated Effort:** 2-3 hours

---

## Prioritized Task List

### P0 - Must Fix Before Production

| Task | Description | Effort | Blocker? | Status |
|------|-------------|--------|----------|--------|
| TASK-002 | Integration harness for D1/DO | 4-6h | Yes | ✅ DONE |
| TASK-001 | spokes.integration.test.ts | 2-3h | Yes | TODO |
| TASK-010 | Self-Healing E2E journey | 4-6h | Yes | ✅ DONE |
| TASK-011 | Context Isolation E2E | 3-4h | Yes | ✅ DONE |
| TASK-012 | Keyboard NFR-P4 enforcement | 1-2h | Yes | ✅ DONE |
| TASK-020 | Production smoke tests | 2-3h | Yes | ✅ DONE |

**Total P0 Effort:** 15-22 hours (80% complete)

### P1 - Should Fix This Sprint

| Task | Description | Effort |
|------|-------------|--------|
| TASK-003 | hubs.integration.test.ts | 2-3h |
| TASK-004 | clients.integration.test.ts | 2-3h |
| TASK-012 | Keyboard NFR-P4 enforcement | 1-2h |
| TASK-013 | Spoke Generation E2E | 3-4h |
| TASK-014 | Creative Conflicts E2E | 3-4h |

**Total P1 Effort:** 11-16 hours

### P2/P3 - Deferred

| Task | Description | Effort | Priority |
|------|-------------|--------|----------|
| TASK-005 | calibration.integration.test.ts | 2h | P2 |
| TASK-006 | review.integration.test.ts | 2h | P2 |
| TASK-007 | exports.integration.test.ts | 1-2h | P2 |
| TASK-008 | analytics.integration.test.ts | 1-2h | P3 |
| TASK-015 | Export Engine E2E | 2-3h | P2 |
| TASK-016 | Brand DNA E2E | 2-3h | P2 |
| TASK-017 | Visual Concepts E2E | 2h | P3 |

---

## Implementation Order

1. **TASK-002** - Create integration harness (unlocks all other integration tests)
2. **TASK-020** - Production smoke tests (fast win, immediate value)
3. **TASK-001** - spokes.integration.test.ts (P0 feature)
4. **TASK-010** - Self-Healing E2E journey (P0 differentiator)
5. **TASK-011** - Context Isolation E2E (P0 security)

---

## Definition of Done

A feature is truly **Done** when:

1. **Unit tests pass** - Component/function level (existing)
2. **Integration tests pass** - Real D1/DO, no mocks (new requirement)
3. **E2E journey passes** - Full user flow, no `test.skip` (new requirement)
4. **Production smoke passes** - Post-deploy verification (new requirement)

---

## Metrics to Track

| Metric | Current | Target | Progress |
|--------|---------|--------|----------|
| `test.skip` count in E2E | 31 | 0 | 47% reduction |
| Integration tests (real D1) | 3 | 11 | 27% |
| E2E journey tests | ~35 | 44 | 80% |
| Production smoke tests | 12 | 5+ | ✅ 240% |
| Test suite stability | ~95% | 99%+ | On track |

**Updated:** 2025-12-27 - Completed TASK-010, TASK-011, TASK-012, TASK-020

---

**Report Generated:** 2025-12-27
**Next Review:** Before next sprint planning
