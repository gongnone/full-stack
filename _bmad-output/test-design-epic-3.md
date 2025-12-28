# Test Design: Epic 3 - Hub Creation & Content Ingestion

**Date:** Saturday, December 27, 2025
**Author:** Williamshaw
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 3 (Hub Creation & Content Ingestion), covering source upload, AI thematic extraction, and pillar configuration.

**Risk Summary:**

- Total risks identified: 6
- High-priority risks (≥6): 3
- Critical categories: SEC (Isolation), PERF (AI Latency), BUS (Trust)

**Coverage Summary:**

- P0 scenarios: 8 (16 hours)
- P1 scenarios: 12 (12 hours)
- P2/P3 scenarios: 15 (7.5 hours)
- **Total effort:** 35.5 hours (~4.5 days)

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- | -------- |
| R-001 | SEC | **Cross-Client Data Leakage** during upload/storage. If R2 paths or D1 records aren't strictly namespaced, Client A could access Client B's sources. | 2 (Possible) | 3 (Critical) | **6** | Strict RBAC middleware + Row Level Security pattern in D1 queries + Random GUIDs for R2 paths. | Backend Lead | Sprint 1 |
| R-002 | BUS | **AI Hallucination in Extraction.** System invents pillars/claims not present in source, destroying user trust in "Source of Truth". | 3 (Likely) | 2 (Degraded) | **6** | Implement "Quote Verification" (checking claims against source text) + Manual Review Step (Story 3.3). | AI Eng | Sprint 1 |
| R-003 | PERF | **Extraction Timeout.** Large PDFs/Transcripts exceed Worker CPU time or AI Gateway timeout (30s limit), causing failure. | 3 (Likely) | 2 (Degraded) | **6** | Async Workflow pattern (Cloudflare Workflows) instead of blocking HTTP request + Chunking large text. | Backend Lead | Sprint 1 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- |
| R-004 | TECH | **WebSocket Reliability.** Progress updates fail to deliver, leaving user staring at spinner/stuck UI. | 2 (Possible) | 2 (Degraded) | **4** | Implement client-side polling fallback if socket disconnects + "Retry" UI action. | Frontend |
| R-005 | SEC | **Malicious File Upload.** User uploads executable/malware disguised as PDF. | 1 (Unlikely) | 3 (Critical) | **3** | Content-Type validation + Parse-only processing (never exec) + Sandbox extraction. | Backend Lead |
| R-006 | OPS | **URL Scraping Failure.** Target site blocks bot, returns 403/Captcha, failing ingestion. | 2 (Possible) | 2 (Degraded) | **4** | Use robust scraping proxy (if available) or graceful failure messaging "Cannot access URL". | Backend Lead |

### Risk Category Legend

- **TECH**: Technical/Architecture
- **SEC**: Security
- **PERF**: Performance
- **BUS**: Business Impact
- **OPS**: Operations

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey (Ingestion) + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| FR1: PDF Upload & Hub Creation | E2E | R-003 | 2 | QA | Happy path: Upload -> Extract -> Success |
| FR5: Hub Isolation (RBAC) | API | R-001 | 2 | QA | Verify Client B cannot fetch Client A's Hub |
| FR4: Thematic Extraction | Integration | R-002 | 2 | Dev | Mock AI response to verify parsing logic |
| FR2: Raw Text Ingestion | E2E | - | 1 | QA | Paste text -> Hub created |
| FR3: URL Ingestion | API | R-006 | 1 | Dev | Test scraper service with mocked target |

**Total P0**: 8 tests, 16 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features (Editing) + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| FR7: Edit Pillars (Rename/Add/Delete) | Component | R-002 | 5 | Dev | UI interaction testing (React state) |
| FR6: Real-time Progress (WebSocket) | E2E | R-004 | 2 | QA | Verify UI updates on socket events |
| FR1: Invalid File Types | API | R-005 | 2 | QA | Upload .exe, .sh -> Expect 400 |
| FR4: Extraction Retry Logic | Integration | R-003 | 2 | Dev | Simulate AI timeout -> Verify retry |
| FR5: Hub Metadata Persistence | API | - | 1 | Dev | Verify D1 records correct fields |

**Total P1**: 12 tests, 12 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| FR3: URL Scrape Edge Cases | API | R-006 | 4 | QA | 404, 403, Empty page, Huge page |
| FR2: Text Paste Limits | Unit | - | 2 | Dev | Max char limit validation |
| FR7: Pillar Config Validation | Unit | - | 3 | Dev | Empty title, duplicate pillars |
| FR6: Progress Error States | Component | - | 2 | Dev | Socket error -> Error UI |
| FR5: Duplicate Hub Creation | API | - | 2 | QA | Idempotency checks |

**Total P2**: 13 tests, 6.5 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement | Test Level | Test Count | Owner | Notes |
| ----------- | ---------- | ---------- | ----- | ----- |
| NFR-P2: Ingestion Performance | Perf (k6) | 2 | QA | 50 concurrent uploads |

**Total P3**: 2 tests, 1 hour

---

## Execution Order

### Smoke Tests (<5 min)

- [ ] PDF Upload Happy Path (E2E)
- [ ] Raw Text Upload Happy Path (E2E)
- [ ] Cross-Client Access Check (API)

### P0 Tests (<10 min)

- [ ] URL Ingestion Mocked (API)
- [ ] Extraction Logic Verification (Integration)
- [ ] Hub Creation Persistence (API)

### P1 Tests (<30 min)

- [ ] Pillar Editing Interactions (Component)
- [ ] WebSocket Progress Updates (E2E)
- [ ] File Type Validation (API)

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
| -------- | ----- | ---------- | ----------- | ----- |
| P0 | 8 | 2.0 | 16 | Complex E2E + Security/Isolation setup |
| P1 | 12 | 1.0 | 12 | Standard Component/API tests |
| P2 | 13 | 0.5 | 6.5 | Edge cases, simple validation |
| P3 | 2 | 0.5 | 1 | Performance script setup |
| **Total** | **35** | **-** | **35.5** | **~4.5 days** |

### Prerequisites

**Test Data:**

- **Sample Files:** Valid PDF (small/large), Invalid file (.exe renamed to .pdf).
- **Mock AI Responses:** JSON fixtures for Workers AI output (Themes, Claims).
- **Test Users:** 2 distinct clients (Client A, Client B) for isolation testing.

**Tooling:**

- **Playwright** for E2E (Upload wizard).
- **Miniflare** for local Worker/DO testing.
- **Vitest** for Unit/Component tests.

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (No Critical/Security failures allowed).
- **P1 pass rate**: ≥95% (UI glitches acceptable if workaround exists).
- **High-risk mitigations**: R-001 (Isolation) and R-003 (Timeouts) must have regression tests.

### Non-Negotiable Requirements

- [ ] **Security:** Client A can NEVER see Client B's Hubs.
- [ ] **Reliability:** System handles >30s extraction without crashing (Async workflow).
- [ ] **Data:** Hubs always created with valid Pillars (never empty).

---

## Mitigation Plans

### R-001: Cross-Client Data Leakage (Score: 6)

**Mitigation Strategy:**
1.  **Middleware:** Enforce `clientId` in every tRPC context.
2.  **Query Wrappers:** Use `where('client_id', '=', ctx.clientId)` in ALL D1 queries.
3.  **DO Namespaces:** Verify DO `id` is derived from `clientId` (or mapped strictly).

**Verification:**
- Automated API test trying to fetch Hub ID `X` (belonging to Client B) using Client A's token. Must return 403/404.

### R-003: Extraction Timeout (Score: 6)

**Mitigation Strategy:**
1.  **Async Pattern:** Upload -> Returns `jobId` -> Poll/Socket for status.
2.  **Cloudflare Workflows:** Use Workflows for orchestration to handle long-running extraction steps robustly.

**Verification:**
- Integration test with `sleep(35s)` in mocked extraction step. Verify status eventually updates to "Complete".

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: __________________ Date: __________
- [ ] Tech Lead: __________________ Date: __________
- [ ] QA Lead: __________________ Date: __________

---

**Generated by:** BMad TEA Agent - Test Architect Module
**Workflow:** `_bmad/bmm/testarch/test-design` (Epic-Level Mode)
