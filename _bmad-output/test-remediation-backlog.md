# Test Remediation Backlog

**Project:** The Agentic Content Foundry
**Generated:** 2025-12-27
**Analysis Type:** Traceability Matrix False-Green Detection

---

## Executive Summary

The traceability matrix shows **100% coverage**, but deeper analysis reveals **significant False Green patterns** that mask real gaps:

| Issue Type | Count | Impact |
|------------|-------|--------|
| `expect(true).toBe(true)` assertions | 4 | Tests always pass regardless of outcome |
| `test.skip()` data-dependent skips | 58+ | Tests skip when no data exists |
| `.catch(() => false)` error swallowing | 120+ | Errors don't cause test failures |
| `vi.mock()` / mocked dependencies | 95 | No real integration tested |
| `mockResolvedValue` fake data | 189 | Tests use synthetic responses |

**True Coverage Assessment:**
- **Declared Coverage:** 100%
- **Effective Coverage:** ~35-45% (accounting for skips, mocks, and false assertions)

---

## False Green Analysis by Priority

### P0 Stories - Critical False Greens

#### Story 4.3: Self-Healing Loop (CORE DIFFERENTIATOR)

**Declared:** 21 E2E tests, FULL coverage
**Reality:** Tests verify UI renders, not actual self-healing functionality

**False Green Patterns Found:**
```typescript
// e2e/story-4.3-self-healing-loop.spec.ts:109
expect(true).toBe(true); // Test passes if no error thrown

// e2e/story-4.3-self-healing-loop.spec.ts:78
test.skip(!hasItems, 'No review items to test');
```

**What's NOT Tested:**
- [ ] Backend Workflow: `spoke-regeneration` workflow actually triggers on gate failure
- [ ] D1 Database: Regeneration count increments in `spokes` table
- [ ] Durable Object: `SpokeGeneratorDO` receives and processes feedback
- [ ] Workers AI: Critic actually evaluates and returns scores

**Remediation Tasks:**

| Task ID | Priority | Description | Test Type |
|---------|----------|-------------|-----------|
| REM-4.3-01 | P0 | Create integration test for regeneration workflow trigger | Integration |
| REM-4.3-02 | P0 | Test D1 `regeneration_count` column updates | Integration |
| REM-4.3-03 | P0 | Test Durable Object state machine transitions | Unit |
| REM-4.3-04 | P1 | Test Workers AI critic scoring with mocked model | Integration |

---

#### Story 5.3: Keyboard-First Approval Flow (CORE UX)

**Declared:** 27 E2E tests, FULL coverage
**Reality:** Tests check if page loads, skip if no spokes exist

**False Green Patterns Found:**
```typescript
// e2e/story-5.3-keyboard-approval.spec.ts (multiple lines)
const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);
if (hasSpokes) { /* test runs */ } else { /* test passes anyway */ }
```

**What's NOT Tested:**
- [ ] tRPC mutation: `review.approve` actually writes to D1
- [ ] tRPC mutation: `review.kill` actually marks spoke as killed
- [ ] Database transaction: Approval cascades to `spoke_approvals` table
- [ ] Real-time: WebSocket/polling notifies other clients

**Remediation Tasks:**

| Task ID | Priority | Description | Test Type |
|---------|----------|-------------|-----------|
| REM-5.3-01 | P0 | Create data seeding script for E2E tests | Setup |
| REM-5.3-02 | P0 | Integration test for `review.approve` tRPC mutation | Integration |
| REM-5.3-03 | P0 | Integration test for `review.kill` tRPC mutation | Integration |
| REM-5.3-04 | P1 | Verify keyboard events trigger actual mutations | E2E |

---

#### Story 7.4: Context Isolation & Data Security (SECURITY)

**Declared:** 39 E2E tests, FULL coverage
**Reality:** UI-level tests, no actual cross-tenant data access validation

**False Green Patterns Found:**
```typescript
// e2e/story-7.4-context-isolation.spec.ts:97
const hasError = await page.locator('text=/not found|error|unauthorized/i').isVisible().catch(() => false);
expect(hasError || onHubsPage || onLoginPage).toBeTruthy(); // Multiple escape hatches
```

**What's NOT Tested:**
- [ ] D1 Query: SQL queries include `account_id` filter
- [ ] tRPC Context: `ctx.accountId` is enforced on all procedures
- [ ] API: Direct API call with wrong tenant ID returns 403
- [ ] Database: No rows from other tenants are ever returned

**Remediation Tasks:**

| Task ID | Priority | Description | Test Type |
|---------|----------|-------------|-----------|
| REM-7.4-01 | P0 | Adversarial API test: Cross-tenant data access | Security |
| REM-7.4-02 | P0 | Database audit: All queries filter by account_id | Code Review |
| REM-7.4-03 | P0 | Integration test with 2 test accounts | Integration |
| REM-7.4-04 | P1 | Add middleware to log/block cross-tenant attempts | Implementation |

---

### P1 Stories - High Priority False Greens

#### Story 2.2: Voice-to-Grounding Pipeline

**False Green:** Component tests mock MediaRecorder, Whisper API
**Gap:** No test verifies audio actually reaches Whisper and entities are extracted

| Task ID | Priority | Description | Test Type |
|---------|----------|-------------|-----------|
| REM-2.2-01 | P1 | Integration test with real audio file → Whisper | Integration |
| REM-2.2-02 | P1 | Test entity extraction writes to `voice_entities` table | Integration |

---

#### Story 3.1-3.5: Hub Creation Pipeline

**False Green:** Component tests render forms, API tests mock D1
**Gap:** No test verifies hub creation workflow from source to pillars

| Task ID | Priority | Description | Test Type |
|---------|----------|-------------|-----------|
| REM-3.X-01 | P1 | E2E: Create hub from URL source end-to-end | E2E |
| REM-3.X-02 | P1 | Integration: Verify `hub_sources` → `hubs` → `pillars` chain | Integration |
| REM-3.X-03 | P2 | Test extraction workflow with real content | Integration |

---

#### Story 4.1-4.2: Spoke Generation & Critic

**False Green:** Tests skip when no hubs/spokes exist
**Gap:** No test verifies spoke fracturing algorithm or critic scoring

| Task ID | Priority | Description | Test Type |
|---------|----------|-------------|-----------|
| REM-4.1-01 | P1 | Integration: Spoke fracturing creates correct count | Integration |
| REM-4.2-01 | P1 | Integration: Critic returns valid G2/G4/G5/G7 scores | Integration |
| REM-4.2-02 | P1 | Test gate scores persist to database | Integration |

---

## Test Infrastructure Gaps

### Gap 1: No Data Seeding Strategy

**Problem:** E2E tests skip when data doesn't exist
**Impact:** Tests only pass in empty state, never validate full functionality

**Remediation:**

| Task ID | Priority | Description |
|---------|----------|-------------|
| INFRA-01 | P0 | Create `setup-stage-data.ts` Playwright fixture |
| INFRA-02 | P0 | Seed test account with hub, pillars, spokes before E2E run |
| INFRA-03 | P1 | Add `beforeAll` hook to create required data |

---

### Gap 2: No Integration Test Layer

**Problem:** API tests mock D1, so no real database interaction is tested
**Impact:** SQL errors, constraint violations, schema issues not caught

**Remediation:**

| Task ID | Priority | Description |
|---------|----------|-------------|
| INFRA-04 | P0 | Create integration test harness with local D1 |
| INFRA-05 | P0 | Add `wrangler d1 execute` for test database setup |
| INFRA-06 | P1 | Create integration test for each tRPC router |

---

### Gap 3: No Backend Workflow Tests

**Problem:** Cloudflare Workflows (`hub-ingestion`, `spoke-generation`, `calibration`) have no tests
**Impact:** Core AI orchestration is untested

**Remediation:**

| Task ID | Priority | Description |
|---------|----------|-------------|
| INFRA-07 | P1 | Create workflow test harness using `wrangler dev` |
| INFRA-08 | P1 | Test `hub-ingestion` workflow with mock content |
| INFRA-09 | P1 | Test `spoke-generation` workflow produces valid spokes |

---

### Gap 4: No Durable Object Tests

**Problem:** Durable Objects (`SpokeGeneratorDO`, etc.) have no isolated tests
**Impact:** State machine logic untested

**Remediation:**

| Task ID | Priority | Description |
|---------|----------|-------------|
| INFRA-10 | P2 | Create DO test harness with miniflare |
| INFRA-11 | P2 | Test `SpokeGeneratorDO` state transitions |
| INFRA-12 | P2 | Test `IngestionTrackerDO` progress tracking |

---

## Prioritized Remediation Backlog

### Sprint 1: Critical P0 Fixes (Week 1)

| ID | Story | Task | Effort |
|----|-------|------|--------|
| INFRA-01 | - | Create E2E data seeding fixture | 2h |
| INFRA-02 | - | Seed test data for E2E runs | 2h |
| INFRA-04 | - | Create integration test harness with local D1 | 4h |
| REM-7.4-01 | 7.4 | Adversarial cross-tenant security test | 4h |
| REM-7.4-03 | 7.4 | Two-account integration test | 2h |
| REM-5.3-02 | 5.3 | `review.approve` integration test | 2h |
| REM-5.3-03 | 5.3 | `review.kill` integration test | 2h |
| REM-4.3-01 | 4.3 | Regeneration workflow trigger test | 4h |

**Sprint 1 Total:** ~22 hours

---

### Sprint 2: P1 Integration Tests (Week 2)

| ID | Story | Task | Effort |
|----|-------|------|--------|
| INFRA-05 | - | D1 test database setup script | 2h |
| INFRA-06 | - | Integration test per tRPC router (8 routers) | 8h |
| REM-4.3-02 | 4.3 | D1 regeneration_count update test | 2h |
| REM-4.1-01 | 4.1 | Spoke fracturing integration test | 3h |
| REM-4.2-01 | 4.2 | Critic scoring integration test | 3h |
| REM-2.2-01 | 2.2 | Whisper integration with real audio | 4h |
| REM-3.X-01 | 3.X | Hub creation E2E with data | 4h |

**Sprint 2 Total:** ~26 hours

---

### Sprint 3: Backend & Workflow Tests (Week 3)

| ID | Story | Task | Effort |
|----|-------|------|--------|
| INFRA-07 | - | Workflow test harness | 4h |
| INFRA-08 | - | Hub-ingestion workflow test | 4h |
| INFRA-09 | - | Spoke-generation workflow test | 4h |
| INFRA-10 | - | Durable Object test harness | 4h |
| INFRA-11 | - | SpokeGeneratorDO state tests | 3h |
| REM-4.3-03 | 4.3 | DO state machine transitions | 3h |

**Sprint 3 Total:** ~22 hours

---

## Acceptance Criteria for Remediation

A remediation task is **DONE** when:

1. **Integration tests run against real D1** (not mocked)
2. **E2E tests have data fixtures** (no more `test.skip` for missing data)
3. **No `expect(true).toBe(true)` assertions** in the codebase
4. **Error paths are tested** (not caught and swallowed)
5. **CI runs tests in isolated environment** with fresh database

---

## Metrics to Track

| Metric | Current | Target |
|--------|---------|--------|
| Tests with `test.skip()` | 58 | 0 |
| Tests with `.catch(() => false)` | 120+ | 10 (legitimate error handling only) |
| `expect(true).toBe(true)` | 4 | 0 |
| Integration tests (non-mocked) | 0 | 30+ |
| E2E tests with data fixtures | 0 | All E2E tests |

---

## Related Documents

- **Traceability Matrix:** `_bmad-output/traceability-matrix.md`
- **Test Automation Gaps:** `_bmad-output/test-automation-gaps.md`
- **Sprint Status:** `_bmad-output/implementation-artifacts/sprint-status.yaml`

---

**Next Step:** Create first integration test for Story 7.4 (Context Isolation) to prove the pattern, then replicate across P0 stories.

---

<!-- Powered by BMAD-CORE -->
