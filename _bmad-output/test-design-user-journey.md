# Test Design: Full Post-Signup User Journey

**Project:** The Agentic Content Foundry
**Scope:** Complete user journey from signup through content export
**Date:** 2025-12-27
**Author:** TEA (Test Engineering Architect)
**Mode:** Epic-Level (Phase 4 - Implementation)

---

## 1. Executive Summary

This test design covers the complete post-signup user journey for The Agentic Content Foundry, validating the end-to-end experience from first login through content export. The journey comprises 8 integration stages with 15 critical handoff points where bugs have historically occurred.

**Journey Stages:**
1. Authentication & Session
2. Client Onboarding
3. Source Upload & Ingestion
4. Pillar Extraction & Configuration
5. Spoke Generation
6. TreeView Review & Display
7. Approval Workflow
8. Export & Download

**Test Coverage Target:**
- P0 (Blockers): 100% automated E2E
- P1 (Critical Path): 90% automated
- P2 (Important): 70% automated
- P3 (Nice-to-have): Manual verification

---

## 2. Risk Assessment Matrix

### 2.1 High-Risk Integration Points

| ID | Integration Point | Probability | Impact | Risk Score | Test Level |
|----|-------------------|-------------|--------|------------|------------|
| R01 | OAuth callback → Session creation | High | Critical | P0 | E2E |
| R02 | Session → Client context binding | Medium | Critical | P0 | E2E + API |
| R03 | File upload → R2 storage | Medium | High | P1 | API |
| R04 | Ingestion workflow → D1 persistence | High | Critical | P0 | API |
| R05 | AI extraction → Pillar creation | High | High | P0 | E2E |
| R06 | **Spoke generation → TreeView display** | High | Critical | P0 | E2E |
| R07 | **camelCase DO → snake_case frontend** | High | Critical | P0 | Unit + E2E |
| R08 | WebSocket → Progress updates | Medium | High | P1 | E2E |
| R09 | Quality gate scoring → UI badge display | Medium | Medium | P1 | Component |
| R10 | Approval action → State persistence | High | Critical | P0 | E2E |
| R11 | Kill Chain → Cascade deletion | Medium | Critical | P0 | E2E |
| R12 | Export → File download | Low | High | P1 | E2E |
| R13 | Multi-tenant isolation | High | Critical | P0 | Security |
| R14 | Platform character limits | Medium | Medium | P1 | Component |
| R15 | Tab/filter state management | High | Medium | P1 | E2E |

### 2.2 Known Bug Patterns (Regression Focus)

| Bug ID | Description | Root Cause | Regression Test |
|--------|-------------|------------|-----------------|
| BUG-001 | SpokeTreeView filter fails | camelCase→snake_case mismatch | P0-08 |
| BUG-002 | Generation polling infinite loop | Missing status check | P0-05 |
| BUG-003 | Tab switch race condition | Stale query cache | P1-06 |
| BUG-004 | Pillar extraction timeout | Large source content | P1-03 |
| BUG-005 | OAuth redirect loop | Misconfigured callback | P0-01 |

---

## 3. Test Scenario Inventory

### Stage 1: Authentication & Session (6 scenarios)

| ID | Scenario | Priority | Type | Automation |
|----|----------|----------|------|------------|
| AUTH-01 | Email/password signup creates account | P0 | E2E | Yes |
| AUTH-02 | OAuth Google login succeeds | P0 | E2E | Yes |
| AUTH-03 | OAuth GitHub login succeeds | P1 | E2E | Yes |
| AUTH-04 | Session persists across page refresh | P0 | E2E | Yes |
| AUTH-05 | Invalid credentials show error | P1 | E2E | Yes |
| AUTH-06 | Logout clears session and redirects | P1 | E2E | Yes |

### Stage 2: Client Onboarding (5 scenarios)

| ID | Scenario | Priority | Type | Automation |
|----|----------|----------|------|------------|
| CLIENT-01 | Create new client with required fields | P0 | E2E | Yes |
| CLIENT-02 | Client appears in ClientSelector after creation | P0 | E2E | Yes |
| CLIENT-03 | Switch between client contexts | P0 | E2E | Yes |
| CLIENT-04 | Client context persists in URL/storage | P1 | E2E | Yes |
| CLIENT-05 | Client isolation - no cross-client data access | P0 | Security | Yes |

### Stage 3: Source Upload & Ingestion (8 scenarios)

| ID | Scenario | Priority | Type | Automation |
|----|----------|----------|------|------------|
| SOURCE-01 | Upload PDF file → stored in R2 | P0 | E2E | Yes |
| SOURCE-02 | Paste raw text → creates hub source | P0 | E2E | Yes |
| SOURCE-03 | Enter URL → scrapes and stores content | P1 | E2E | Yes |
| SOURCE-04 | Large file (>10MB) shows error | P1 | E2E | Yes |
| SOURCE-05 | Upload progress indicator updates | P1 | E2E | Yes |
| SOURCE-06 | Cancel upload aborts operation | P2 | E2E | No |
| SOURCE-07 | Duplicate source detection | P2 | API | Yes |
| SOURCE-08 | Source content stored with client_id | P0 | API | Yes |

### Stage 4: Pillar Extraction & Configuration (10 scenarios)

| ID | Scenario | Priority | Type | Automation |
|----|----------|----------|------|------------|
| PILLAR-01 | AI extraction returns 3-7 pillars | P0 | E2E | Yes |
| PILLAR-02 | Extraction progress shows percentage | P1 | E2E | Yes |
| PILLAR-03 | Each pillar has title, core_claim, supporting_points | P0 | API | Yes |
| PILLAR-04 | User can edit pillar title inline | P1 | E2E | Yes |
| PILLAR-05 | User can edit pillar core_claim | P1 | E2E | Yes |
| PILLAR-06 | User can delete unwanted pillar | P1 | E2E | Yes |
| PILLAR-07 | User can reorder pillars | P2 | E2E | No |
| PILLAR-08 | Undo deletion within 5 seconds | P2 | E2E | Yes |
| PILLAR-09 | Extraction timeout shows error (>30s) | P1 | E2E | Yes |
| PILLAR-10 | Pillars persist to D1 on "Continue" | P0 | E2E | Yes |

### Stage 5: Spoke Generation (12 scenarios)

| ID | Scenario | Priority | Type | Automation |
|----|----------|----------|------|------------|
| GEN-01 | Generate spokes for selected platforms | P0 | E2E | Yes |
| GEN-02 | Generation creates spoke per pillar × platform | P0 | API | Yes |
| GEN-03 | Progress shows spoke count / total | P0 | E2E | Yes |
| GEN-04 | **Polling stops when all spokes complete** | P0 | E2E | Yes |
| GEN-05 | Failed spoke shows error status | P1 | E2E | Yes |
| GEN-06 | Self-healing loop retries failed spokes | P1 | API | Yes |
| GEN-07 | Max retry limit (3) triggers human review | P1 | API | Yes |
| GEN-08 | Twitter spoke respects 280 char limit | P1 | Component | Yes |
| GEN-09 | LinkedIn spoke uses professional tone | P2 | API | No |
| GEN-10 | Visual archetype applied to spoke | P2 | API | Yes |
| GEN-11 | Quality scores (G2/G4/G5) attached | P0 | API | Yes |
| GEN-12 | Spokes stored with correct hub_id, pillar_id | P0 | API | Yes |

### Stage 6: TreeView Review & Display (15 scenarios)

| ID | Scenario | Priority | Type | Automation |
|----|----------|----------|------|------------|
| TREE-01 | Hub displays as root node | P0 | E2E | Yes |
| TREE-02 | Pillars display as second level | P0 | E2E | Yes |
| TREE-03 | Spokes display under correct pillar | P0 | E2E | Yes |
| TREE-04 | **Spoke pillar_id defined (not undefined)** | P0 | Unit | Yes |
| TREE-05 | **Spoke grouping filter works correctly** | P0 | E2E | Yes |
| TREE-06 | Platform filter shows only selected platform | P1 | E2E | Yes |
| TREE-07 | Status filter shows only selected status | P1 | E2E | Yes |
| TREE-08 | G7 score filter shows top performers | P1 | E2E | Yes |
| TREE-09 | **Tab switch triggers fresh data fetch** | P1 | E2E | Yes |
| TREE-10 | Spoke card shows G2 hook score | P0 | Component | Yes |
| TREE-11 | Spoke card shows platform icon | P1 | Component | Yes |
| TREE-12 | Spoke card shows truncated content | P1 | Component | Yes |
| TREE-13 | Expand spoke shows full content | P1 | E2E | Yes |
| TREE-14 | Empty state when no spokes exist | P1 | E2E | Yes |
| TREE-15 | Loading skeleton during data fetch | P2 | E2E | No |

### Stage 7: Approval Workflow (14 scenarios)

| ID | Scenario | Priority | Type | Automation |
|----|----------|----------|------|------------|
| APPROVE-01 | Approve button changes spoke status | P0 | E2E | Yes |
| APPROVE-02 | Reject button changes spoke status | P0 | E2E | Yes |
| APPROVE-03 | Keyboard shortcut A approves | P0 | E2E | Yes |
| APPROVE-04 | Keyboard shortcut K rejects | P0 | E2E | Yes |
| APPROVE-05 | Bulk approve all visible spokes | P1 | E2E | Yes |
| APPROVE-06 | Reject reason captured in modal | P1 | E2E | Yes |
| APPROVE-07 | Edited spoke marked as mutated | P0 | API | Yes |
| APPROVE-08 | Mutated spoke survives Hub Kill | P0 | E2E | Yes |
| APPROVE-09 | Hub Kill cascades to all spokes | P0 | E2E | Yes |
| APPROVE-10 | Pillar Kill removes only pillar's spokes | P1 | E2E | Yes |
| APPROVE-11 | Clone Best creates variations | P1 | E2E | Yes |
| APPROVE-12 | Gate override allows approval | P2 | E2E | Yes |
| APPROVE-13 | Approval persists to D1 | P0 | API | Yes |
| APPROVE-14 | Status change reflects in TreeView | P0 | E2E | Yes |

### Stage 8: Export & Download (8 scenarios)

| ID | Scenario | Priority | Type | Automation |
|----|----------|----------|------|------------|
| EXPORT-01 | Export approved spokes as CSV | P0 | E2E | Yes |
| EXPORT-02 | Export approved spokes as JSON | P1 | E2E | Yes |
| EXPORT-03 | CSV contains all required columns | P1 | Unit | Yes |
| EXPORT-04 | Export filtered by platform | P1 | E2E | Yes |
| EXPORT-05 | Export includes scheduling metadata | P2 | E2E | No |
| EXPORT-06 | Download visual assets (R2) | P1 | E2E | Yes |
| EXPORT-07 | Clipboard copy spoke content | P1 | E2E | Yes |
| EXPORT-08 | Export only client's own data | P0 | Security | Yes |

---

## 4. Coverage Summary

### By Priority

| Priority | Total | Automated | Coverage |
|----------|-------|-----------|----------|
| P0 | 31 | 31 | 100% |
| P1 | 32 | 28 | 87.5% |
| P2 | 12 | 5 | 41.7% |
| P3 | 3 | 0 | 0% |
| **Total** | **78** | **64** | **82.1%** |

### By Stage

| Stage | Scenarios | P0 Count | E2E Tests |
|-------|-----------|----------|-----------|
| Authentication | 6 | 3 | 6 |
| Client Onboarding | 5 | 4 | 5 |
| Source Upload | 8 | 3 | 6 |
| Pillar Extraction | 10 | 3 | 8 |
| Spoke Generation | 12 | 5 | 6 |
| TreeView Display | 15 | 4 | 11 |
| Approval Workflow | 14 | 6 | 12 |
| Export | 8 | 2 | 5 |
| **Total** | **78** | **30** | **59** |

### By Test Level

| Level | Count | Tooling |
|-------|-------|---------|
| E2E | 59 | Playwright |
| API | 12 | Vitest + msw |
| Component | 5 | Vitest + Testing Library |
| Unit | 2 | Vitest |
| Security | 3 | Playwright + Custom |

---

## 5. Critical User Journey Tests

### 5.1 Happy Path E2E Test

```typescript
/**
 * @tags @P0 @smoke @user-journey
 * Complete user journey: signup → export
 */
test('complete user journey from signup to export', async ({ page }) => {
  // Stage 1: Authentication
  await page.goto('/signup');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/app');

  // Stage 2: Client Onboarding
  await page.click('[data-testid="create-client-btn"]');
  await page.fill('[name="clientName"]', 'Test Client');
  await page.fill('[name="industry"]', 'Technology');
  await page.click('[data-testid="save-client"]');
  await expect(page.locator('[data-testid="client-selector"]')).toContainText('Test Client');

  // Stage 3: Source Upload
  await page.click('[data-testid="create-hub-btn"]');
  await page.fill('[data-testid="text-input"]', 'Sample content about AI...');
  await page.click('[data-testid="continue-btn"]');

  // Stage 4: Pillar Extraction
  await expect(page.locator('[data-testid="pillar-card"]')).toHaveCount({ min: 3, max: 7 });
  await page.click('[data-testid="continue-btn"]');

  // Stage 5: Spoke Generation
  await page.check('[data-testid="platform-twitter"]');
  await page.check('[data-testid="platform-linkedin"]');
  await page.click('[data-testid="generate-btn"]');
  await expect(page.locator('[data-testid="generation-progress"]')).toBeVisible();
  await expect(page.locator('[data-testid="generation-complete"]')).toBeVisible({ timeout: 60000 });

  // Stage 6: TreeView Display
  await page.click('[data-testid="view-spokes-btn"]');
  await expect(page.locator('[data-testid="spoke-tree"]')).toBeVisible();
  const spokes = page.locator('[data-testid="spoke-card"]');
  await expect(spokes).toHaveCount({ min: 6 }); // 3 pillars × 2 platforms

  // Stage 7: Approval
  await spokes.first().click();
  await page.keyboard.press('a'); // Approve shortcut
  await expect(spokes.first()).toHaveAttribute('data-status', 'approved');

  // Stage 8: Export
  await page.click('[data-testid="export-btn"]');
  await page.click('[data-testid="export-csv"]');
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toContain('.csv');
});
```

### 5.2 Critical Regression Tests

```typescript
/**
 * P0-08: Case Mapping Transform
 * @tags @P0 @regression @data-integrity
 */
test('spoke pillar_id is defined for TreeView grouping', async ({ page }) => {
  // Navigate to hub with generated spokes
  await page.goto('/app/hubs/test-hub-id');

  // Get spokes from page and verify pillar_id
  const spokes = await page.evaluate(() => {
    return window.__SPOKE_DATA__; // Exposed by test harness
  });

  for (const spoke of spokes) {
    expect(spoke.pillar_id).toBeDefined();
    expect(spoke.pillar_id).not.toBeNull();
  }
});

/**
 * P0-05: Polling Timeout Protection
 * @tags @P0 @regression @generation
 */
test('generation polling stops after completion or timeout', async ({ page }) => {
  await page.goto('/app/hubs/test-hub/generate');
  await page.click('[data-testid="generate-btn"]');

  // Monitor network requests
  let pollCount = 0;
  page.on('request', (req) => {
    if (req.url().includes('getWorkflowStatus')) pollCount++;
  });

  // Wait for completion
  await expect(page.locator('[data-testid="generation-complete"]')).toBeVisible({ timeout: 60000 });

  // Wait additional time to ensure polling stopped
  await page.waitForTimeout(5000);
  const finalPollCount = pollCount;

  await page.waitForTimeout(5000);
  expect(pollCount).toBe(finalPollCount); // No new polls
});
```

---

## 6. Test Data Requirements

### 6.1 Seed Data

| Entity | Count | Purpose |
|--------|-------|---------|
| Test User | 3 | Auth flows, multi-user |
| Test Client | 2 | Isolation testing |
| Hub with Pillars | 2 | TreeView display |
| Generated Spokes | 20 | Approval/export flows |
| Approved Spokes | 10 | Export testing |

### 6.2 Test Fixtures

```typescript
// fixtures/test-data.ts
export const testUser = {
  email: 'e2e-test@foundry.local',
  password: 'E2E-SecurePass-123!',
};

export const testClient = {
  id: 'test-client-uuid',
  name: 'E2E Test Client',
  industry: 'Technology',
};

export const testHub = {
  id: 'test-hub-uuid',
  title: 'E2E Test Hub',
  sourceContent: 'Sample source content for testing...',
  pillars: [
    { id: 'pillar-1', title: 'Key Theme 1', core_claim: 'Claim 1' },
    { id: 'pillar-2', title: 'Key Theme 2', core_claim: 'Claim 2' },
    { id: 'pillar-3', title: 'Key Theme 3', core_claim: 'Claim 3' },
  ],
};
```

---

## 7. Implementation Plan

### Phase 1: P0 Blockers (Week 1)
- [ ] AUTH-01, AUTH-02, AUTH-04 (Session tests)
- [ ] CLIENT-01, CLIENT-02, CLIENT-05 (Isolation tests)
- [ ] SOURCE-01, SOURCE-02 (Upload tests)
- [ ] PILLAR-01, PILLAR-03, PILLAR-10 (Extraction tests)
- [ ] GEN-01, GEN-04, GEN-11, GEN-12 (Generation tests)
- [ ] TREE-03, TREE-04, TREE-05 (Display tests)
- [ ] APPROVE-01, APPROVE-02, APPROVE-09, APPROVE-13 (Workflow tests)
- [ ] EXPORT-01, EXPORT-08 (Export tests)

### Phase 2: P1 Critical Path (Week 2)
- [ ] Remaining auth scenarios
- [ ] Platform/status filters
- [ ] Bulk approval flows
- [ ] Visual asset export

### Phase 3: P2 Important (Week 3)
- [ ] Edge cases
- [ ] Error handling
- [ ] Undo/redo flows

---

## 8. Acceptance Criteria

### Test Suite Health
- [ ] P0 pass rate: 100%
- [ ] P1 pass rate: > 95%
- [ ] Flaky test rate: < 2%
- [ ] Average test duration: < 30s

### Coverage Metrics
- [ ] Statement coverage: > 70%
- [ ] Branch coverage: > 60%
- [ ] Integration points: 100% of P0

### Regression Prevention
- [ ] All BUG-001 through BUG-005 have automated tests
- [ ] Case mapping transform tested at unit + E2E levels
- [ ] Polling timeout tested with mock timers

---

## 9. Appendix: Test File Locations

| Test Category | Location |
|---------------|----------|
| E2E User Journey | `apps/foundry-dashboard/e2e/user-journey.spec.ts` |
| E2E Hub-Spoke | `apps/foundry-dashboard/e2e/hub-spoke-integration.spec.ts` |
| API Spokes | `apps/foundry-dashboard/worker/trpc/routers/__tests__/spokes.test.ts` |
| Component TreeView | `apps/foundry-dashboard/src/components/spokes/__tests__/` |
| Security Isolation | `apps/foundry-dashboard/e2e/security-isolation.spec.ts` |

---

**Document Status:** Complete
**Next Action:** Implement P0 test scenarios per Phase 1 plan
