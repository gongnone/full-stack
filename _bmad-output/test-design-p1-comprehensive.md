# Test Design: P1 Comprehensive Test Coverage - Foundry MVP

**Date:** 2025-12-28
**Author:** Williamshaw
**Status:** Draft

---

## Executive Summary

**Scope:** Comprehensive P1 (Priority 1) test design covering all 8 epics of The Agentic Content Foundry MVP.

**Mode:** Epic-Level Mode (Phase 4 - All 8 epics complete, 44/44 stories verified)

**Risk Summary:**

- Total risks identified: 18
- High-priority risks (≥6): 6
- Critical categories: SEC (Security), PERF (Performance), DATA (Data Integrity)

**Coverage Summary:**

- P0 scenarios: 65 (already implemented in CI)
- P1 scenarios: 87 (this design - 42 new tests needed)
- P2/P3 scenarios: 45 (nightly/weekly)
- **Total effort**: ~52 hours (~6.5 days)

**Gap Analysis:**

Based on analysis of existing 65 E2E test files, the following P1 gaps were identified:
1. Brand DNA deep validation (Epic 2) - 8 scenarios
2. Quality Gates per-gate testing (Epic 4) - 15 scenarios
3. Self-Healing Loop mechanics (Epic 4) - 10 scenarios
4. Kill Chain cascade/undo (Epic 5) - 8 scenarios
5. Multi-Client RBAC & isolation (Epic 7) - 12 scenarios
6. Analytics accuracy validation (Epic 8) - 9 scenarios

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|-------------|--------|-------|------------|-------|----------|
| R-001 | SEC | Multi-tenant data leakage between clients via context switch | 2 | 3 | 6 | Cross-tenant E2E tests with isolated users | QA | Week 1 |
| R-002 | SEC | RBAC bypass allowing unauthorized role access | 2 | 3 | 6 | Role matrix E2E tests per permission | QA | Week 1 |
| R-003 | DATA | Self-Healing Loop infinite regeneration on edge cases | 3 | 2 | 6 | Max attempt validation + circuit breaker tests | Dev | Week 2 |
| R-004 | PERF | Durable Object cold start exceeds 100ms NFR-P1 | 2 | 3 | 6 | Warm-up routine validation + timing tests | Dev | Week 2 |
| R-005 | DATA | Kill Chain cascade deletes mutation-protected spokes | 2 | 3 | 6 | Mutation rule preservation tests | QA | Week 1 |
| R-006 | BUS | Brand DNA scoring inconsistent with voice samples | 3 | 2 | 6 | Scoring accuracy validation suite | QA | Week 2 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| R-007 | TECH | G2 Hook scoring drifts from calibrated baseline | 2 | 2 | 4 | Scoring regression tests with golden samples | Dev |
| R-008 | TECH | G4 Voice alignment false positives on edge phrases | 2 | 2 | 4 | Voice alignment edge case suite | Dev |
| R-009 | TECH | G5 Platform compliance misses new platform rules | 1 | 3 | 3 | Per-platform validation matrix | Dev |
| R-010 | PERF | Spoke generation exceeds 60s NFR-P3 on large batches | 2 | 2 | 4 | Batch size boundary tests | Dev |
| R-011 | DATA | Zero-Edit Rate calculation incorrect on edge cases | 2 | 2 | 4 | Calculation accuracy tests | Dev |
| R-012 | DATA | Drift detection threshold triggers false alerts | 2 | 2 | 4 | Threshold boundary tests | Dev |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| R-013 | OPS | Export CSV format inconsistent across browsers | 1 | 2 | 2 | Monitor |
| R-014 | OPS | Shareable link email verification UX unclear | 1 | 2 | 2 | Monitor |
| R-015 | BUS | Clone Best variations too similar to original | 1 | 2 | 2 | Monitor |
| R-016 | BUS | Executive Producer Report time-saved calculation off | 1 | 2 | 2 | Monitor |
| R-017 | OPS | Command palette search slow with many items | 1 | 1 | 1 | Monitor |
| R-018 | OPS | Visual regression in Midnight Command theme variants | 1 | 1 | 1 | Monitor |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit ✅ EXISTING

**Status**: Already implemented in CI (65 tests across 4 shards)

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Test Count | Status |
|-------------|------------|-----------|------------|--------|
| Authentication (login/OAuth/session) | E2E | - | 8 | ✅ Covered |
| Client context switching | E2E | R-001 | 5 | ✅ Covered |
| Hub creation happy path | E2E | - | 6 | ✅ Covered |
| Spoke generation happy path | E2E | - | 7 | ✅ Covered |
| Approval workflow (keyboard/swipe) | E2E | - | 9 | ✅ Covered |
| Export (CSV/JSON) | E2E | - | 5 | ✅ Covered |
| User journey complete flow | E2E | - | 25 | ✅ Covered |

**Total P0**: 65 tests (existing)

---

### P1 (High) - Run on PR to main 🎯 THIS DESIGN

**Criteria**: Important features + Medium risk (3-4) + Common workflows

#### Epic 2: Brand DNA Features (8 new tests)

| Test ID | Requirement | Test Level | Risk Link | Description | File Target |
|---------|-------------|------------|-----------|-------------|-------------|
| P1-DNA-01 | FR31 Voice markers CRUD | Integration | R-006 | Add/edit/delete voice markers persist to DO SQLite | `brand-dna.integration.test.ts` |
| P1-DNA-02 | FR34 Banned words extraction | Integration | R-006 | Upload content → banned words auto-detected | `brand-dna.integration.test.ts` |
| P1-DNA-03 | FR38 DNA Strength scoring | Integration | R-006 | Score calculation accuracy with known samples | `brand-dna.integration.test.ts` |
| P1-DNA-04 | FR38 DNA Strength thresholds | E2E | R-006 | < 70% shows recommendations, ≥ 80% shows "Strong" | `story-2.3-brand-dna-analysis.spec.ts` |
| P1-DNA-05 | FR33 Tone detection | Integration | R-007 | Primary tone matches expected from sample content | `brand-dna.integration.test.ts` |
| P1-DNA-06 | FR35 Manual marker override | E2E | - | User adds marker → reflected in subsequent generation | `story-2.5-voice-entities-editor.spec.ts` |
| P1-DNA-07 | FR32 Voice-to-Grounding | E2E | - | Voice note → transcription → entity extraction | `story-2.2-voice-to-grounding.spec.ts` |
| P1-DNA-08 | Vectorize namespace isolation | Integration | R-001 | Client A embeddings not searchable by Client B | `brand-dna.integration.test.ts` |

#### Epic 4: Quality Gates (15 new tests)

| Test ID | Requirement | Test Level | Risk Link | Description | File Target |
|---------|-------------|------------|-----------|-------------|-------------|
| P1-GATE-01 | FR15 G2 Hook scoring | Integration | R-007 | Score breakdown: Pattern Interrupt + Benefit + Curiosity Gap | `quality-gates.integration.test.ts` |
| P1-GATE-02 | FR15 G2 threshold validation | Integration | R-007 | Score < 70 triggers regeneration | `quality-gates.integration.test.ts` |
| P1-GATE-03 | FR16 G4 Voice alignment | Integration | R-008 | Banned word detection fails gate | `quality-gates.integration.test.ts` |
| P1-GATE-04 | FR16 G4 similarity threshold | Integration | R-008 | Cosine similarity < 0.75 fails gate | `quality-gates.integration.test.ts` |
| P1-GATE-05 | FR17 G5 Twitter compliance | Integration | R-009 | > 280 chars fails gate | `quality-gates.integration.test.ts` |
| P1-GATE-06 | FR17 G5 LinkedIn compliance | Integration | R-009 | > 3000 chars fails gate | `quality-gates.integration.test.ts` |
| P1-GATE-07 | FR17 G5 hashtag validation | Integration | R-009 | Missing required format fails | `quality-gates.integration.test.ts` |
| P1-GATE-08 | FR22 G6 Visual cliché detection | Integration | - | Handshake/lightbulb/puzzle flagged | `quality-gates.integration.test.ts` |
| P1-GATE-09 | FR20 Gate failure reason display | E2E | - | Hover shows Critic's notes within 300ms | `story-4.2-adversarial-critic.spec.ts` |
| P1-GATE-10 | FR21 Manual gate override | E2E | - | Force Approve sets `override: true` flag | `story-4.4-creative-conflicts.spec.ts` |

#### Epic 4: Self-Healing Loop (10 new tests)

| Test ID | Requirement | Test Level | Risk Link | Description | File Target |
|---------|-------------|------------|-----------|-------------|-------------|
| P1-HEAL-01 | FR18 Feedback loop writes | Integration | R-003 | Failed spoke writes to `feedback_log` table | `self-healing.integration.test.ts` |
| P1-HEAL-02 | FR18 Regeneration with feedback | Integration | R-003 | Creator queries feedback, excludes banned word | `self-healing.integration.test.ts` |
| P1-HEAL-03 | FR18 Loop iteration timing | Integration | R-003 | Single iteration < 10 seconds (NFR-P7) | `self-healing.integration.test.ts` |
| P1-HEAL-04 | FR18 Max attempts (3) | Integration | R-003 | After 3 fails → status: creative_conflict | `self-healing.integration.test.ts` |
| P1-HEAL-05 | FR18 Context Refresh | Integration | R-003 | 3rd attempt queries mutation_registry | `self-healing.integration.test.ts` |
| P1-HEAL-06 | FR18 Healing success logging | Integration | - | Successful fix logged for learning | `self-healing.integration.test.ts` |
| P1-HEAL-07 | FR19 Creative Conflict bucket | E2E | - | Failed 3x appears in Conflicts bucket | `story-4.4-creative-conflicts.spec.ts` |
| P1-HEAL-08 | FR19 Director's Cut panel | E2E | - | Shows all 3 drafts with tabs | `story-4.4-creative-conflicts.spec.ts` |
| P1-HEAL-09 | Rubric failure highlighting | E2E | - | Inline red highlights on violation points | `story-4.4-creative-conflicts.spec.ts` |
| P1-HEAL-10 | Voice Calibrate action | E2E | - | Triggers Epic 2 Voice-to-Grounding | `story-4.4-creative-conflicts.spec.ts` |

#### Epic 5: Kill Chain (8 new tests)

| Test ID | Requirement | Test Level | Risk Link | Description | File Target |
|---------|-------------|------------|-----------|-------------|-------------|
| P1-KILL-01 | FR26 Hub Kill cascade | Integration | R-005 | Kill Hub → all child pillars/spokes deleted | `kill-chain.integration.test.ts` |
| P1-KILL-02 | FR27 Pillar Kill isolation | Integration | R-005 | Kill Pillar → only that pillar's spokes deleted | `kill-chain.integration.test.ts` |
| P1-KILL-03 | FR28 Mutation Rule | Integration | R-005 | Edited spoke survives parent Hub kill | `kill-chain.integration.test.ts` |
| P1-KILL-04 | FR28 Manual Assets category | E2E | R-005 | Mutated spoke moved to Manual Assets | `story-5.4-kill-chain.spec.ts` |
| P1-KILL-05 | Undo toast timing | E2E | - | "Undo" available for 30 seconds | `story-5.4-kill-chain.spec.ts` |
| P1-KILL-06 | H key hold 500ms | E2E | - | Hold H 500ms → Hub Kill modal | `story-5.4-kill-chain.spec.ts` |
| P1-KILL-07 | Pillar Pruning animation | E2E | - | Staggered fade animation on cascade | `story-5.4-kill-chain.spec.ts` |
| P1-KILL-08 | Progress bar update | E2E | - | Kill updates progress bar immediately | `story-5.4-kill-chain.spec.ts` |

#### Epic 7: Multi-Client Operations (12 new tests)

| Test ID | Requirement | Test Level | Risk Link | Description | File Target |
|---------|-------------|------------|-----------|-------------|-------------|
| P1-RBAC-01 | FR44 Creator restrictions | E2E | R-002 | Creator cannot access client settings | `story-7.2-rbac-team-assignment.spec.ts` |
| P1-RBAC-02 | FR43 Client Admin permissions | E2E | R-002 | Client Admin can review but not edit settings | `story-7.2-rbac-team-assignment.spec.ts` |
| P1-RBAC-03 | FR42 Creator client scope | Integration | R-002 | Creator API calls scoped to assigned clients only | `rbac.integration.test.ts` |
| P1-RBAC-04 | Agency Owner full access | E2E | R-002 | Agency Owner can access all CRUD operations | `story-7.2-rbac-team-assignment.spec.ts` |
| P1-ISO-01 | FR45 Context isolation | Integration | R-001 | Client A data invisible to Client B queries | `security-isolation.integration.test.ts` |
| P1-ISO-02 | FR45 R2 path isolation | Integration | R-001 | Client A assets not accessible via Client B path | `security-isolation.integration.test.ts` |
| P1-ISO-03 | FR45 URL manipulation blocked | E2E | R-001 | Direct URL to Client B returns 403 | `story-7.4-context-isolation.spec.ts` |
| P1-ISO-04 | NFR-P1 Context switch timing | E2E | R-004 | Switch between clients < 100ms | `story-7.3-multi-client-workspace.spec.ts` |
| P1-ISO-05 | DO warm-up routine | Integration | R-004 | 5 recent clients pre-warmed on session start | `multi-client.integration.test.ts` |
| P1-LINK-01 | FR47 Shareable link expiry | E2E | - | Expired link shows "Link Expired" | `story-7.6-shareable-review-links.spec.ts` |
| P1-LINK-02 | FR47 Email restriction | E2E | - | Non-whitelisted email blocked | `story-7.6-shareable-review-links.spec.ts` |
| P1-LINK-03 | NFR-S6 Link security | Integration | - | Time-limited token validation | `shareable-links.integration.test.ts` |

#### Epic 8: Analytics Accuracy (9 new tests)

| Test ID | Requirement | Test Level | Risk Link | Description | File Target |
|---------|-------------|------------|-----------|-------------|-------------|
| P1-ANA-01 | FR48 Zero-Edit Rate calculation | Integration | R-011 | Rate = approved_without_edit / total_approved | `analytics.integration.test.ts` |
| P1-ANA-02 | FR48 Per-client breakdown | E2E | R-011 | Filter by client shows correct rates | `story-8.1-zero-edit-rate.spec.ts` |
| P1-ANA-03 | FR36 Drift detection threshold | Integration | R-012 | Alert when similarity drops 15% below baseline | `analytics.integration.test.ts` |
| P1-ANA-04 | FR37 Grounding Audit trigger | E2E | R-012 | Drift alert → "Start Grounding Audit" available | `story-8.6-drift-detection.spec.ts` |
| P1-ANA-05 | FR50 Self-healing efficiency | Integration | - | Average loops calculation accuracy | `analytics.integration.test.ts` |
| P1-ANA-06 | FR54 Time-to-DNA tracking | Integration | - | Hubs to reach 60% Zero-Edit accurate | `analytics.integration.test.ts` |
| P1-ANA-07 | FR49 Critic pass rate trends | E2E | - | Chart shows correct G2/G4/G5 pass rates | `story-8.2-critic-trends.spec.ts` |
| P1-ANA-08 | FR53 Kill Chain analytics | E2E | - | Hub/Pillar/Spoke kill percentages correct | `story-8.5-kill-analytics.spec.ts` |
| P1-ANA-09 | FR52 Review velocity | E2E | - | Average decision time calculation | `story-8.4-velocity-dashboard.spec.ts` |

**Total P1 NEW**: 62 tests, ~42 hours

---

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| Export format variations | API | R-013 | 8 | QA | CSV/JSON edge cases |
| Clone Best similarity | E2E | R-015 | 4 | QA | Variation quality |
| Executive Report accuracy | E2E | R-016 | 6 | QA | Time calculation |
| Command palette performance | E2E | R-017 | 3 | Dev | Search timing |
| Visual regression | Visual | R-018 | 12 | QA | Theme snapshots |
| Accessibility deep dive | E2E | - | 12 | QA | WCAG 2.1 AA full |

**Total P2**: 45 tests, ~22 hours

---

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement | Test Level | Test Count | Owner | Notes |
|-------------|------------|------------|-------|-------|
| Load testing (100 concurrent) | Perf | 5 | Dev | k6 scripts |
| Stress testing (edge limits) | Perf | 5 | Dev | Boundary conditions |
| Chaos testing (DO failures) | Chaos | 3 | Dev | Resilience |
| Mobile responsive (< 768px) | E2E | 8 | QA | Post-MVP |

**Total P3**: 21 tests, ~16 hours

---

## Execution Order

### Smoke Tests (<5 min) ✅ EXISTING

**Purpose**: Fast feedback, catch build-breaking issues

- [x] Public landing page loads (30s)
- [x] Login page renders (30s)
- [x] Authenticated dashboard loads (45s)
- [x] Navigation works (1min)
- [x] API health check (30s)

**Total**: 5 scenarios (existing in accessibility.spec.ts)

### P0 Tests (<10 min) ✅ EXISTING

**Purpose**: Critical path validation

**Total**: 65 scenarios (existing across 4 shards)

### P1 Tests (<30 min) 🎯 NEW

**Purpose**: Important feature coverage (this design)

**Recommended Run Order:**
1. Security tests (R-001, R-002) - 8 tests - FIRST
2. Data integrity tests (R-003, R-005, R-006) - 22 tests
3. Performance timing tests (R-004) - 5 tests
4. Feature deep tests (remaining) - 27 tests

**Total**: 62 new scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

**Total**: 66 scenarios (run nightly)

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
|----------|-------|------------|-------------|-------|
| P0 | 65 | - | - | Already implemented |
| P1 | 62 | 0.7 | 42 | Standard coverage |
| P2 | 45 | 0.5 | 22 | Simple scenarios |
| P3 | 21 | 0.75 | 16 | Complex setup |
| **Total NEW** | **128** | **-** | **80** | **~10 days** |

### Prerequisites

**Test Data:**

- `ClientFactory` - Creates isolated test clients with DO instances
- `HubFactory` - Creates hubs with pillars for cascade testing
- `SpokeFactory` - Creates spokes with known gate scores
- `UserFactory` - Creates users with specific RBAC roles

**Tooling:**

- Playwright for E2E tests (existing)
- Vitest for integration tests (existing)
- D1 local database for integration harness (existing)
- `@axe-core/playwright` for accessibility (existing)

**Environment:**

- `TEST_EMAIL` / `TEST_PASSWORD` for authenticated tests
- Local D1 database for integration tests
- Cloudflare Workers dev environment for API tests

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: ≥95% (waivers required for failures)
- **P2/P3 pass rate**: ≥90% (informational)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical paths**: ≥80% ✅ (P0 covers)
- **Security scenarios**: 100% (P1-ISO, P1-RBAC)
- **Business logic**: ≥70% (P1 gates, analytics)
- **Edge cases**: ≥50% (P2 covers)

### Non-Negotiable Requirements

- [x] All P0 tests pass (CI enforced)
- [ ] No high-risk (≥6) items unmitigated
- [ ] Security tests (SEC category) pass 100%
- [ ] Performance targets met (PERF category)

---

## Mitigation Plans

### R-001: Multi-tenant data leakage between clients (Score: 6)

**Mitigation Strategy:** Implement cross-tenant E2E tests that:
1. Create two isolated test users (User A, User B) each with their own client
2. User A creates Hub with sensitive content
3. User B attempts to access User A's data via API and URL manipulation
4. Verify 403 responses and zero data in search results

**Owner:** QA
**Timeline:** Week 1
**Status:** Planned
**Verification:** P1-ISO-01, P1-ISO-02, P1-ISO-03 tests pass

### R-002: RBAC bypass allowing unauthorized role access (Score: 6)

**Mitigation Strategy:** Implement role matrix E2E tests:
1. Create test users for each role (Creator, Client Admin, Client Reviewer, Account Manager, Agency Owner)
2. For each role, attempt all CRUD operations
3. Verify permissions match RBAC matrix exactly
4. Log and fail on any permission violation

**Owner:** QA
**Timeline:** Week 1
**Status:** Planned
**Verification:** P1-RBAC-01 through P1-RBAC-04 tests pass

### R-003: Self-Healing Loop infinite regeneration (Score: 6)

**Mitigation Strategy:** Implement circuit breaker tests:
1. Create spoke that will always fail G4 (contains permanent banned word)
2. Verify loop stops at exactly 3 attempts
3. Verify status changes to `creative_conflict`
4. Verify no 4th regeneration attempt

**Owner:** Dev
**Timeline:** Week 2
**Status:** Planned
**Verification:** P1-HEAL-04, P1-HEAL-05 tests pass

### R-004: Durable Object cold start exceeds 100ms (Score: 6)

**Mitigation Strategy:** Implement timing validation tests:
1. Measure context switch timing from first client to 6th (cold)
2. Verify warm-up routine pre-warms 5 most recent clients
3. Implement LRU eviction test when accessing 6th client
4. Add timing assertions < 100ms

**Owner:** Dev
**Timeline:** Week 2
**Status:** Planned
**Verification:** P1-ISO-04, P1-ISO-05 tests pass

### R-005: Kill Chain cascade deletes mutation-protected spokes (Score: 6)

**Mitigation Strategy:** Implement mutation rule preservation tests:
1. Create Hub with 10 spokes
2. Manually edit 2 spokes (mark as mutated)
3. Kill the Hub
4. Verify 8 spokes deleted, 2 mutated spokes survive
5. Verify mutated spokes moved to "Manual Assets"

**Owner:** QA
**Timeline:** Week 1
**Status:** Planned
**Verification:** P1-KILL-01 through P1-KILL-04 tests pass

### R-006: Brand DNA scoring inconsistent (Score: 6)

**Mitigation Strategy:** Implement scoring accuracy tests:
1. Create golden sample content with known voice characteristics
2. Upload to Brand DNA
3. Verify Tone, Vocabulary, Structure, Topics scores match expected
4. Verify DNA Strength score calculation is deterministic

**Owner:** QA
**Timeline:** Week 2
**Status:** Planned
**Verification:** P1-DNA-01 through P1-DNA-05 tests pass

---

## Assumptions and Dependencies

### Assumptions

1. Test user `e2e-test@foundry.local` exists with known password
2. Stage environment (foundry-stage.williamjshaw.ca) is available for E2E tests
3. Local D1 database can be used for integration tests
4. All 8 epics are feature complete (verified from sprint-status.yaml)

### Dependencies

1. `security-isolation.integration.test.ts` must complete before RBAC tests - Week 1
2. `brand-dna.integration.test.ts` must complete before self-healing tests - Week 1
3. CI workflow update to include P1 tests on PR to main - Week 2

### Risks to Plan

- **Risk**: Stage environment unavailable
  - **Impact**: E2E tests blocked
  - **Contingency**: Use local dev environment with mock APIs

- **Risk**: Test user credentials invalid
  - **Impact**: All authenticated tests fail
  - **Contingency**: Run `create-test-user.spec.ts` to recreate

---

## CI Integration Recommendations

### Update `.github/workflows/e2e-tests.yaml`

```yaml
# Add P1 test run on PR to main
on:
  pull_request:
    branches: [main]

jobs:
  p1-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run P1 Tests
        run: pnpm exec playwright test --grep "@P1"
```

### Test Filter Usage

```bash
# Run all P1 tests
pnpm exec playwright test --grep "@P1"

# Run specific P1 category
pnpm exec playwright test --grep "P1-DNA"
pnpm exec playwright test --grep "P1-GATE"
pnpm exec playwright test --grep "P1-HEAL"
pnpm exec playwright test --grep "P1-KILL"
pnpm exec playwright test --grep "P1-RBAC"
pnpm exec playwright test --grep "P1-ISO"
pnpm exec playwright test --grep "P1-ANA"
```

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: _________________ Date: _______
- [ ] Tech Lead: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______

**Comments:**

---

## Appendix

### Existing Test Coverage Summary

| Category | Files | Tests | Status |
|----------|-------|-------|--------|
| User Journey P0 | 10 | 65 | ✅ CI |
| Story-level specs | 43 | ~200 | ✅ Available |
| Integration tests | 3 | 47 | ✅ Available |
| Accessibility | 1 | 3 | ✅ CI default |

### Related Documents

- PRD: `_bmad-output/prd.md`
- Epics: `_bmad-output/epics.md`
- Architecture: `_bmad-output/architecture.md`
- Sprint Status: `_bmad-output/implementation-artifacts/sprint-status.yaml`

---

**Generated by**: BMad TEA Agent - Test Architect Module
**Workflow**: `_bmad/bmm/testarch/test-design`
**Version**: 4.0 (BMad v6)
