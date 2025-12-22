# System-Level Test Design - The Agentic Content Foundry

**Date:** 2025-12-21
**Author:** Williamshaw
**Mode:** Phase 3 - Testability Review
**Status:** Draft

---

## Executive Summary

This document provides a **pre-implementation testability review** of the Agentic Content Foundry architecture. It evaluates the architecture's testability characteristics, identifies Architecturally Significant Requirements (ASRs), and recommends a test strategy for Sprint 0 and beyond.

**Key Findings:**
- Architecture is **highly testable** due to Cloudflare's edge-first design
- Multi-tenant isolation via Durable Objects enables parallel testing
- NFR validation requires k6 for performance, Playwright for E2E
- One testability concern: Durable Object mocking complexity

---

## Testability Assessment

### Controllability

**Assessment: PASS**

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Can we control system state for testing? | ✅ | D1 database supports test seeding via SQL migrations |
| Are external dependencies mockable? | ✅ | tRPC router allows procedure mocking; Service Bindings mockable |
| Can we trigger error conditions? | ✅ | Hono middleware supports fault injection; Cloudflare Workflows interruptible |
| Can we seed test data via API? | ✅ | tRPC procedures support batch creation |

**Details:**
- **D1 Database:** SQLite-compatible, supports direct SQL for test fixtures
- **Durable Objects:** Per-client isolation means tests can create dedicated DO instances
- **Workers AI:** AI Gateway supports caching (70%+ hit rate), can be mocked for deterministic tests
- **R2 Storage:** Test buckets can be created/destroyed per test run

**Recommendation:** Implement API-first test data factories using tRPC procedures for fast setup.

---

### Observability

**Assessment: PASS**

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Can we inspect system state? | ✅ | tRPC query procedures expose all entities |
| Are test results deterministic? | ⚠️ | AI generation is non-deterministic; requires seeding or mocking |
| Can we validate NFRs? | ✅ | Cloudflare analytics + custom metrics via Workers |
| Is logging structured? | ✅ | Hono middleware supports structured JSON logging |

**Details:**
- **Metrics:** Cloudflare Analytics for latency, Durable Objects for client-specific metrics
- **Tracing:** Request tracing via `cf-ray` header; can add custom trace IDs
- **Logs:** Workers logging to Logpush, structured JSON for searchability
- **AI Observability:** AI Gateway provides generation logs, cache hits, latency

**Concern:** AI generation (Creator/Critic agents) is inherently non-deterministic. Tests must either:
1. Mock AI responses for deterministic E2E tests
2. Use statistical validation for integration tests (e.g., "80% pass G2 gate")

**Recommendation:** Create AI mock fixtures with pre-generated responses for critical path E2E tests.

---

### Reliability

**Assessment: PASS with CONCERNS**

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Are tests isolated? | ✅ | Durable Objects provide physical per-client isolation |
| Can we parallelize tests? | ✅ | Each test can use dedicated client context (DO instance) |
| Are components loosely coupled? | ✅ | Service Bindings + tRPC enable clear boundaries |
| Can we reproduce failures? | ⚠️ | AI non-determinism; need HAR capture for network |

**Concerns:**

1. **Durable Object Mocking Complexity**
   - Durable Objects run in isolated V8 contexts
   - Mocking requires Miniflare or custom test harness
   - Recommendation: Use integration tests with real DOs, not mocked

2. **AI Non-Determinism**
   - Self-Healing Loop depends on AI generation
   - Cannot guarantee identical outputs across test runs
   - Mitigation: Seed prompts, temperature=0, capture baseline responses

---

## Architecturally Significant Requirements (ASRs)

### Performance ASRs

| ASR | Target | Risk Score | Testing Approach |
|-----|--------|------------|------------------|
| **NFR-P1:** Context switch | < 100ms | 6 (High) | k6 load test with client switching |
| **NFR-P2:** Hub ingestion | < 30s | 4 (Medium) | Workflow timing with real PDFs |
| **NFR-P3:** Spoke generation | < 60s for 25 | 6 (High) | Parallel generation stress test |
| **NFR-P4:** Bulk review | < 200ms | 4 (Medium) | Playwright + performance.mark() |
| **NFR-P5:** Dashboard load | < 3s | 3 (Low) | Lighthouse CI integration |

**Rationale:** NFR-P1 and NFR-P3 are high-risk because they directly impact agency workflow (47 clients, 25 spokes per Hub).

---

### Security ASRs

| ASR | Target | Risk Score | Testing Approach |
|-----|--------|------------|------------------|
| **NFR-S1:** Multi-tenant isolation | Zero data leakage | 9 (Critical) | Cross-client query tests, audit logs |
| **NFR-S4:** RBAC | Role enforcement | 6 (High) | Permission matrix tests per role |
| **NFR-S5:** Session management | 24-hour max | 4 (Medium) | Session expiry tests |
| **NFR-S7:** OAuth 2.0 | Token validation | 6 (High) | Auth flow tests, token expiry |

**Critical:** NFR-S1 (isolation) is score 9 — any test proving data leakage between clients is a gate blocker.

---

### Reliability ASRs

| ASR | Target | Risk Score | Testing Approach |
|-----|--------|------------|------------------|
| **NFR-R1:** Uptime | 99.9% | 4 (Medium) | Health check monitoring |
| **NFR-R2:** Content recovery | No loss on failure | 6 (High) | Workflow interruption tests |
| **NFR-R3:** Workflow resume | Interrupted workflows | 4 (Medium) | Cloudflare Workflows retry tests |

---

### Accessibility ASRs

| ASR | Target | Risk Score | Testing Approach |
|-----|--------|------------|------------------|
| **NFR-A1:** Keyboard navigation | Full support | 4 (Medium) | Playwright keyboard tests |
| **NFR-A3:** Color contrast | WCAG 2.1 AA | 3 (Low) | axe-core integration |
| **NFR-A4:** Focus management | Visible focus | 3 (Low) | Focus trap tests |

---

## Test Levels Strategy

### Recommended Test Distribution

| Level | Target % | Rationale |
|-------|----------|-----------|
| **Unit** | 50% | Business logic, quality gate scoring (G2/G4/G5), price calculations |
| **Integration (API)** | 30% | tRPC procedures, Durable Object operations, database queries |
| **E2E** | 20% | Critical user journeys (Sprint flow, Hub creation, Kill Chain) |

**Justification:**
- **High unit %** because quality gates (G2 Hook Strength, G4 Voice Alignment, G5 Platform Compliance) are pure scoring functions
- **Moderate integration %** because multi-tenant isolation and tRPC contracts are critical
- **Low E2E %** because UI is relatively simple (swipe, tree view, report) — complexity is backend

---

### Test Environment Requirements

| Environment | Purpose | Infrastructure |
|-------------|---------|----------------|
| **Local** | Unit + Integration | Miniflare, in-memory D1, Vitest |
| **Preview** | E2E + API | Cloudflare Preview Deploys, staging D1 |
| **Staging** | Performance + Security | Full Cloudflare stack, k6, security scan |
| **Production** | Smoke only | Synthetic monitoring, Lighthouse |

---

## NFR Testing Approach

### Security (Playwright E2E + OWASP Tools)

**Test Types:**
- **Auth/Authz:** Unauthenticated access redirects, RBAC enforcement
- **Isolation:** Cross-client data access attempts (expect 403/404)
- **Input Validation:** SQL injection, XSS in Hub names/content
- **Token Handling:** Session expiry, OAuth flow completion

**Tools:**
- Playwright for auth flow E2E
- OWASP ZAP for security scan (CI integration)
- npm audit for dependency vulnerabilities

**Critical Test:**
```typescript
// Isolation test: User A cannot access User B's data
test('cross-client isolation blocks unauthorized access', async ({ request }) => {
  const clientA = await login(request, 'userA@agency.com');
  const response = await request.get('/api/clients/client-b-id/hubs', {
    headers: { Authorization: `Bearer ${clientA.token}` }
  });
  expect(response.status()).toBe(403); // Must fail
});
```

---

### Performance (k6 Load Testing)

**Test Types:**
- **Load Test:** 50 concurrent clients, context switching
- **Stress Test:** 100 clients, 2500 agents (Year 1 target)
- **Spike Test:** Sudden 10x traffic increase
- **Endurance Test:** 8-hour sustained load (memory leaks)

**SLO Thresholds (k6):**
```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],  // 95% requests < 500ms
  'context_switch_latency': ['p(99)<100'],  // NFR-P1
  errors: ['rate<0.01'],  // <1% error rate
}
```

**Tools:**
- k6 for load/stress/spike testing
- Cloudflare Analytics for real-time metrics
- Lighthouse for Core Web Vitals (dashboard load)

---

### Reliability (Playwright + API Tests)

**Test Types:**
- **Error Handling:** API 500 → graceful UI degradation
- **Retry Logic:** Self-Healing Loop retry behavior
- **Health Checks:** `/api/health` endpoint monitoring
- **Offline Handling:** Network disconnection recovery

**Critical Test:**
```typescript
// Self-Healing Loop should retry 3 times on G4 failure
test('self-healing loop retries 3 times', async ({ page, context }) => {
  let attempts = 0;
  await context.route('**/api/generate', route => {
    attempts++;
    if (attempts < 3) {
      route.fulfill({ status: 200, body: JSON.stringify({ g4Score: 50 }) }); // Fail
    } else {
      route.fulfill({ status: 200, body: JSON.stringify({ g4Score: 85 }) }); // Pass
    }
  });

  await page.goto('/hubs/123/generate');
  await expect(page.getByText('Generation complete')).toBeVisible();
  expect(attempts).toBe(3);
});
```

---

### Maintainability (CI Tools)

**Test Types:**
- **Coverage:** 80% target for critical paths (Vitest)
- **Duplication:** <5% code duplication (jscpd)
- **Vulnerabilities:** No critical/high (npm audit)
- **Observability:** Structured logging validation

**CI Pipeline:**
```yaml
jobs:
  test-coverage:
    run: pnpm test:coverage
    threshold: 80%

  security-audit:
    run: npm audit --json
    fail_on: critical, high

  duplication-check:
    run: npx jscpd src/
    threshold: 5%
```

---

## Testability Concerns

### Concern 1: Durable Object Mocking (Medium Severity)

**Issue:** Durable Objects run in isolated V8 contexts and are difficult to mock.

**Impact:** Unit testing DO-dependent logic requires Miniflare or real Worker execution.

**Recommendation:**
- Use Miniflare for local testing (supports D1, DOs)
- Integration tests with real DOs in Preview environment
- Extract pure functions from DO methods for unit testing

---

### Concern 2: AI Non-Determinism (Low Severity)

**Issue:** Creator/Critic agents produce different outputs each run.

**Impact:** Cannot assert exact content in tests; must use pattern matching or scoring thresholds.

**Recommendation:**
- Mock AI responses for deterministic E2E tests
- Use temperature=0 and seed prompts for reproducibility
- Test quality gate scoring (G2/G4/G5) as unit tests with fixed inputs

---

### Concern 3: Vectorize Query Timing (Low Severity)

**Issue:** Vectorize similarity search latency varies based on index size.

**Impact:** G7 Engagement Prediction tests may have variable timing.

**Recommendation:**
- Use test-only Vectorize index with controlled data
- Mock Vectorize responses for unit tests of G7 logic
- Performance test with full 10K hooks in staging

---

## Recommendations for Sprint 0

### Framework Setup (`testarch-framework` workflow)

1. **Install Playwright 1.57** (already present)
2. **Configure Vitest** for unit + integration tests
3. **Set up Miniflare** for local Worker testing
4. **Create test data factories** using tRPC procedures
5. **Integrate axe-core** for accessibility testing

### CI Pipeline (`testarch-ci` workflow)

1. **Smoke tests on push** (<2 min)
2. **P0 tests on PR** (<10 min)
3. **Full regression nightly** (<30 min)
4. **k6 performance weekly** (staging only)

### Test Data Strategy

1. **Factories:** Pure functions for User, Client, Hub, Spoke creation
2. **Fixtures:** Playwright fixtures for authenticated sessions
3. **Cleanup:** After-each hooks for DO/D1 cleanup
4. **Isolation:** Each test uses dedicated client context

---

## Gate Criteria for Implementation Readiness

| Criterion | Target | Validation |
|-----------|--------|------------|
| Testability Assessment | PASS | All 3 categories green |
| ASR Coverage | 100% | Every ASR has test approach |
| High-Risk ASRs (≥6) | Mitigated | Mitigation plan documented |
| Test Levels Strategy | Defined | Unit/Integration/E2E split approved |
| Sprint 0 Recommendations | Actionable | Framework + CI + Data strategy clear |

**Gate Decision: PASS**

The architecture is testable. Proceed to Sprint Planning with the framework setup tasks from Sprint 0 recommendations.

---

## Knowledge Base References

- `nfr-criteria.md` - NFR validation approach
- `test-levels-framework.md` - Test levels strategy guidance
- `risk-governance.md` - Risk scoring and gate decisions
- `test-quality.md` - Definition of Done for tests

---

**Generated by:** BMad TEA Agent - Test Architect Module
**Workflow:** `_bmad/bmm/testarch/test-design` (System-Level Mode)
**Version:** 4.0 (BMad v6)
