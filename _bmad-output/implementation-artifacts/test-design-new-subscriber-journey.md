# Test Design: New Subscriber Journey

**Date:** 2025-12-27
**Author:** Williamshaw
**Avatar:** New Subscriber
**Status:** Draft

---

## Executive Summary

**Scope:** Critical User Journey - Landing → Google OAuth → Subscription Purchase

**Journey Goal:** User discovers Foundry, authenticates via Google, purchases subscription, accesses premium features.

**Risk Summary:**
- Total risks identified: 8
- High-priority risks (≥6): 3
- Critical categories: SEC, BUS, PERF

**Coverage Summary:**
- P0 scenarios: 6 (12 hours)
- P1 scenarios: 5 (5 hours)
- P2/P3 scenarios: 4 (2 hours)
- **Total effort**: 19 hours (~2.5 days)

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| R-001 | SEC | Google OAuth callback hijack | 2 | 3 | 6 | Validate redirect_uri, use state parameter | Dev |
| R-002 | BUS | Payment fails silently, user thinks subscribed | 2 | 3 | 6 | Webhook verification, status polling | Dev |
| R-003 | PERF | Landing page > 3s load time loses conversions | 3 | 2 | 6 | CDN, lazy loading, performance monitoring | Dev |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| R-004 | TECH | OAuth token expiry during checkout | 2 | 2 | 4 | Token refresh, session extension | Dev |
| R-005 | DATA | Subscription status not synced | 2 | 2 | 4 | Webhook retry, status reconciliation | Dev |
| R-006 | BUS | Pricing mismatch between display and charge | 1 | 3 | 3 | Price validation at checkout | QA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| R-007 | OPS | Stripe webhook delivery delay | 1 | 2 | 2 | Monitor |
| R-008 | BUS | User abandons at OAuth consent | 1 | 1 | 1 | Monitor |

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

| Requirement | Test Level | Risk Link | Test Count | Owner |
|-------------|------------|-----------|------------|-------|
| Landing page loads < 3s | E2E | R-003 | 1 | QA |
| Google OAuth initiates correctly | E2E | R-001 | 2 | QA |
| OAuth callback creates session | Integration | R-001 | 2 | Dev |
| Payment completes successfully | E2E | R-002 | 3 | QA |
| Subscription status updates | Integration | R-005 | 2 | Dev |
| Complete journey happy path | E2E | - | 1 | QA |

**Total P0**: 11 tests, 12 hours

### P1 (High) - Run on PR to main

| Requirement | Test Level | Risk Link | Test Count | Owner |
|-------------|------------|-----------|------------|-------|
| OAuth cancellation handling | E2E | - | 1 | QA |
| Payment declined handling | E2E | R-002 | 2 | QA |
| Premium feature unlocking | E2E | - | 2 | QA |
| Billing page displays correctly | E2E | - | 1 | QA |

**Total P1**: 6 tests, 5 hours

### P2 (Medium) - Run nightly

| Requirement | Test Level | Risk Link | Test Count | Owner |
|-------------|------------|-----------|------------|-------|
| Pricing display accuracy | Component | R-006 | 2 | Dev |
| OAuth error messages | E2E | - | 2 | QA |

**Total P2**: 4 tests, 2 hours

---

## Execution Order

### Smoke Tests (<5 min)
- [ ] Landing page loads (30s)
- [ ] Login page accessible (30s)
- [ ] Dashboard loads after auth (1min)

**Total**: 3 scenarios

### P0 Tests (<10 min)
- [ ] Complete journey happy path (E2E)
- [ ] Google OAuth flow (E2E)
- [ ] Payment success flow (E2E)

**Total**: 6 scenarios

### P1 Tests (<30 min)
- [ ] OAuth error handling (E2E)
- [ ] Payment error handling (E2E)
- [ ] Premium access verification (E2E)

**Total**: 5 scenarios

---

## Gherkin Feature Files

| File | Scenarios | Priority |
|------|-----------|----------|
| `e2e/features/new-subscriber-journey.feature` | 15 | P0 |

### Step Definitions

| File | Implementation |
|------|----------------|
| `e2e/steps/new-subscriber.steps.ts` | Playwright |

---

## Quality Gate Criteria

### Pass/Fail Thresholds
- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: ≥95%
- **Journey completion**: < 60 seconds

### Non-Negotiable Requirements
- [ ] All P0 tests pass
- [ ] OAuth flow completes without errors
- [ ] Payment processing works with test cards
- [ ] Subscription status updates correctly

---

## Prerequisites

### Test Data
- Test Google OAuth credentials (sandbox)
- Stripe test mode API keys
- Test card numbers (4242424242424242)

### Environment
- Google OAuth redirect URIs configured for test environment
- Stripe webhook endpoint configured
- D1 database accessible

---

## Approval

**Test Design Approved By:**
- [ ] Product Manager: _______________ Date: ___________
- [ ] Tech Lead: _______________ Date: ___________
- [ ] QA Lead: _______________ Date: ___________

---

**Generated by**: BMad TEA Agent - Test Architect Module
**Workflow**: `testarch-test-design`
