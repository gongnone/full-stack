# Test Design: Hub and Spoke Creation UI Flow

**Date:** Friday, December 27, 2025
**Author:** Williamshaw + Claude (TEA Agent)
**Status:** Complete
**Scope:** Epic 3 (Hub Creation) + Epic 4 (Spoke Generation) UI Integration

---

## Executive Summary

**Purpose:** Comprehensive test design covering the complete Hub and Spoke creation UI journey - from source upload through pillar extraction to spoke generation and display.

**Scope Coverage:**
- Epic 3: Hub Creation & Content Ingestion (FR1-FR7)
- Epic 4: Spoke Generation & Quality Assurance (FR8-FR22)
- Cross-epic integration: Data flow from DO → Engine → Dashboard → UI

**Risk Summary:**

| Category | High (≥6) | Medium (3-5) | Low (1-2) |
|----------|-----------|--------------|-----------|
| Security | 2 | 1 | 0 |
| Performance | 2 | 2 | 1 |
| Data Integrity | 2 | 1 | 0 |
| UX/UI | 0 | 3 | 2 |
| **Total** | **6** | **7** | **3** |

**Coverage Summary:**

| Priority | Scenarios | Estimated Hours |
|----------|-----------|-----------------|
| P0 (Critical) | 12 | 24 |
| P1 (High) | 18 | 18 |
| P2 (Medium) | 15 | 7.5 |
| P3 (Low) | 8 | 4 |
| **Total** | **53** | **53.5 hours (~7 days)** |

---

## User Journey Under Test

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           HUB AND SPOKE CREATION FLOW                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      │
│  │ 1. UPLOAD    │   │ 2. EXTRACT   │   │ 3. CONFIGURE │   │ 4. GENERATE  │      │
│  │   SOURCE     │──►│   THEMES     │──►│   PILLARS    │──►│   SPOKES     │      │
│  │              │   │              │   │              │   │              │      │
│  │ PDF/Text/URL │   │ AI Process   │   │ User Edits   │   │ Per-Platform │      │
│  │ → R2 Storage │   │ → Pillars    │   │ → Finalize   │   │ → Quality    │      │
│  └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘      │
│                                                                                  │
│                               ↓ DATA FLOW ↓                                      │
│                                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      │
│  │ 5. WORKFLOW  │   │ 6. DO STORE  │   │ 7. DASHBOARD │   │ 8. DISPLAY   │      │
│  │   STATUS     │──►│   SPOKES     │──►│   QUERY      │──►│   UI         │      │
│  │              │   │              │   │              │   │              │      │
│  │ Poll/Socket  │   │ camelCase    │   │ Transform    │   │ TreeView     │      │
│  │ → Progress   │   │ → SQLite     │   │ → snake_case │   │ → Pillars    │      │
│  └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Risk Assessment

### Critical Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Test Coverage |
|---------|----------|-------------|-------------|--------|-------|------------|---------------|
| R-UI-001 | DATA | **Case Mapping Mismatch** between DO (camelCase) and Frontend (snake_case). Spokes appear in stats but not under pillars. | 3 (Likely) | 3 (Critical) | **9** | Transform in tRPC router `spokes.list`. Add integration test verifying field mapping. | P0-01, P0-02 |
| R-UI-002 | SEC | **Cross-Client Hub Access** via URL manipulation or tRPC calls without proper clientId validation. | 2 (Possible) | 3 (Critical) | **6** | RBAC middleware on all hub/spoke routers. D1 queries MUST include `client_id` filter. | P0-03, P0-04 |
| R-UI-003 | PERF | **Polling Loop Exhaustion** - Infinite polling on workflow status causing 2000+ console messages and browser memory leak. | 3 (Likely) | 2 (Degraded) | **6** | Max poll count (200), increased interval (5s), cache invalidation before each fetch. | P0-05, P1-03 |
| R-UI-004 | DATA | **Pillar-Spoke Relationship Lost** - Spokes generated but `pillar_id` not correctly mapped, breaking TreeView grouping. | 2 (Possible) | 3 (Critical) | **6** | Verify `pillarId` in workflow params, test DO storage, test tRPC transformation. | P0-06, P1-01 |
| R-UI-005 | PERF | **Extraction Timeout** - Large documents exceed 30s Worker CPU limit, failing hub creation. | 3 (Likely) | 2 (Degraded) | **6** | Cloudflare Workflows for async processing. Chunking for large text. | P0-07, P1-04 |
| R-UI-006 | SEC | **Unvalidated File Upload** - Malicious files uploaded and stored in R2 without content validation. | 1 (Unlikely) | 3 (Critical) | **3** | Content-Type validation, file size limits, sandbox extraction. | P1-05 |

### Medium Risks (Score 3-5)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation |
|---------|----------|-------------|-------------|--------|-------|------------|
| R-UI-007 | PERF | **tRPC Query Caching** returning stale workflow status, showing "running" for completed workflows. | 3 (Likely) | 1 (Minor) | **3** | Cache invalidation before each fetch in polling loop. |
| R-UI-008 | UX | **Tab Switch Race Condition** - Query disabled when tab not active, refetch fails silently. | 2 (Possible) | 2 (Degraded) | **4** | Switch tab first, then invalidate queries. |
| R-UI-009 | DATA | **Duplicate Spoke Generation** - Multiple workflow instances created for same pillar×platform. | 2 (Possible) | 2 (Degraded) | **4** | Idempotency check in generation trigger. |
| R-UI-010 | UX | **WebSocket Disconnect** - Progress updates stop, user sees frozen UI. | 2 (Possible) | 2 (Degraded) | **4** | Polling fallback with reconnection logic. |
| R-UI-011 | PERF | **N+1 Query Pattern** in spoke listing - separate query per pillar instead of batch. | 2 (Possible) | 1 (Minor) | **2** | Single query with grouping in frontend. |
| R-UI-012 | UX | **Pillar Deletion Cascade** - User deletes pillar but spokes remain orphaned. | 1 (Unlikely) | 2 (Degraded) | **2** | Cascade delete in pillar.delete mutation. |

---

## Test Coverage Plan

### P0 (Critical) - Run on Every Commit

**Criteria:** Blocks core journey + High risk (≥6) + Security/Data integrity

#### Hub Creation Flow

| Test ID | Requirement | Test Type | Risk Link | Description |
|---------|-------------|-----------|-----------|-------------|
| P0-01 | FR5 | E2E | R-UI-001 | **Hub Created with Pillars** - Upload source → Extract → Verify hub in D1 with correct `client_id` |
| P0-02 | FR5 | E2E | R-UI-001 | **Pillar Extraction Display** - Verify extracted pillars appear in UI with title, claim, angle |
| P0-03 | FR45 | API | R-UI-002 | **Client Isolation - Hub** - Client A cannot fetch Client B's hub via tRPC |
| P0-04 | FR45 | API | R-UI-002 | **Client Isolation - Spoke** - Client A cannot fetch Client B's spokes via tRPC |

#### Spoke Generation Flow

| Test ID | Requirement | Test Type | Risk Link | Description |
|---------|-------------|-----------|-----------|-------------|
| P0-05 | FR14 | E2E | R-UI-003 | **Generation Progress Tracking** - Trigger generation → Progress bar updates → Completion |
| P0-06 | FR12 | E2E | R-UI-004 | **Spoke Display by Pillar** - Generated spokes appear under correct pillar in TreeView |
| P0-07 | NFR-P2 | Integration | R-UI-005 | **Async Workflow Completion** - Large source completes within 60s via Workflow |

#### Data Integrity

| Test ID | Requirement | Test Type | Risk Link | Description |
|---------|-------------|-----------|-----------|-------------|
| P0-08 | FR8 | Integration | R-UI-001 | **Case Mapping Transform** - Verify `pillar_id`, `hub_id`, `quality_scores` correctly mapped |
| P0-09 | FR12 | API | R-UI-004 | **Spoke-Pillar Relationship** - `spokes.list` returns spokes with valid `pillar_id` matching hub pillars |
| P0-10 | FR15-17 | Integration | - | **Quality Scores Populated** - Generated spokes have `g2_hook`, `g4_voice`, `g5_platform` scores |
| P0-11 | FR18 | Integration | - | **Self-Healing Loop** - Failed spoke regenerates with Critic feedback (max 3 attempts) |
| P0-12 | FR5 | E2E | - | **Hub Finalization** - User can edit pillars and finalize hub |

**P0 Total:** 12 tests, ~24 hours

---

### P1 (High) - Run on PR to Main

**Criteria:** Important features + Medium risk (3-5) + Common workflows

#### Pillar Management

| Test ID | Requirement | Test Type | Risk Link | Description |
|---------|-------------|-----------|-----------|-------------|
| P1-01 | FR7 | Component | R-UI-004 | **Pillar Edit - Rename** - Edit pillar title → Saved in D1 |
| P1-02 | FR7 | Component | - | **Pillar Delete** - Remove pillar → Cascade delete child spokes |
| P1-03 | FR7 | Component | - | **Pillar Add** - Add custom pillar → Appears in list |

#### Progress & Status

| Test ID | Requirement | Test Type | Risk Link | Description |
|---------|-------------|-----------|-----------|-------------|
| P1-04 | FR6 | E2E | R-UI-007 | **Polling Cache Invalidation** - Each poll returns fresh status |
| P1-05 | FR6 | E2E | R-UI-003 | **Polling Timeout** - After 200 polls, loop terminates gracefully |
| P1-06 | FR14 | Component | R-UI-008 | **Tab Switch Refetch** - Switching to Spokes tab triggers fresh query |

#### Upload Validation

| Test ID | Requirement | Test Type | Risk Link | Description |
|---------|-------------|-----------|-----------|-------------|
| P1-07 | FR1 | API | R-UI-006 | **PDF Upload - Valid** - Small PDF uploads successfully |
| P1-08 | FR1 | API | R-UI-006 | **PDF Upload - Large** - 10MB PDF handled via chunking |
| P1-09 | FR1 | API | R-UI-006 | **File Type Rejection** - .exe, .sh files rejected with 400 |
| P1-10 | FR2 | E2E | - | **Raw Text Paste** - Paste 5000 chars → Hub created |
| P1-11 | FR3 | API | - | **URL Scrape - Success** - Valid URL scraped and processed |
| P1-12 | FR3 | API | - | **URL Scrape - 404** - Invalid URL returns clear error |

#### Spoke Generation Details

| Test ID | Requirement | Test Type | Risk Link | Description |
|---------|-------------|-----------|-----------|-------------|
| P1-13 | FR8 | Integration | - | **Platform-Specific Content** - Twitter spoke ≤280 chars |
| P1-14 | FR8 | Integration | - | **Multiple Platforms** - Same pillar generates Twitter + LinkedIn spokes |
| P1-15 | FR11 | Integration | - | **Visual Metadata** - Spoke has `visual_archetype`, `image_prompt` fields |
| P1-16 | FR19 | Integration | - | **Creative Conflict Escalation** - After 3 failures, spoke marked `creative_conflict` |
| P1-17 | FR20 | E2E | - | **Gate Failure Display** - Failed gate shows reason in UI |
| P1-18 | FR13 | Component | - | **Platform Filter** - Filter by "LinkedIn" shows only LinkedIn spokes |

**P1 Total:** 18 tests, ~18 hours

---

### P2 (Medium) - Run Nightly

**Criteria:** Edge cases + Lower risk + Comprehensive coverage

| Test ID | Requirement | Test Type | Description |
|---------|-------------|-----------|-------------|
| P2-01 | FR7 | Unit | **Empty Pillar Title** - Validation prevents save |
| P2-02 | FR7 | Unit | **Duplicate Pillar Names** - Warning shown |
| P2-03 | FR2 | Unit | **Text Paste - Max Limit** - 50,000 char limit enforced |
| P2-04 | FR3 | API | **URL Scrape - 403 Blocked** - Clear error message |
| P2-05 | FR3 | API | **URL Scrape - Captcha** - Clear error message |
| P2-06 | FR6 | Component | **WebSocket Disconnect** - Fallback to polling |
| P2-07 | FR6 | Component | **Progress Error State** - Error shown with retry button |
| P2-08 | FR12 | Component | **Empty Hub** - "No pillars" state displayed |
| P2-09 | FR12 | Component | **Empty Pillar** - "No spokes generated" state |
| P2-10 | FR8 | Integration | **Thread Generation** - Multi-post thread structure |
| P2-11 | FR9 | Integration | **Carousel Generation** - Slide-by-slide structure |
| P2-12 | FR22 | Integration | **G6 Visual Cliche Detection** - Robot brain flagged |
| P2-13 | FR21 | E2E | **Gate Override** - Manual approval bypasses gate |
| P2-14 | FR5 | API | **Hub Idempotency** - Duplicate creation request handled |
| P2-15 | NFR-P3 | Perf | **Batch Generation Time** - 25 spokes in <60s |

**P2 Total:** 15 tests, ~7.5 hours

---

### P3 (Low) - Run On-Demand

**Criteria:** Performance benchmarks + Exploratory + Nice-to-have

| Test ID | Test Type | Description |
|---------|-----------|-------------|
| P3-01 | Performance | **Concurrent Uploads** - 10 simultaneous hub creations |
| P3-02 | Performance | **Large Transcript** - 60-minute podcast extraction |
| P3-03 | Performance | **Spoke Generation Scale** - 10 pillars × 5 platforms = 50 spokes |
| P3-04 | Accessibility | **Keyboard Navigation** - Full hub creation via keyboard |
| P3-05 | Accessibility | **Screen Reader** - Hub creation flow narrated correctly |
| P3-06 | Exploratory | **Mobile Responsiveness** - Hub view on tablet |
| P3-07 | Visual Regression | **Midnight Command Theme** - Color tokens correct |
| P3-08 | Visual Regression | **TreeView Rendering** - Pillar/spoke hierarchy display |

**P3 Total:** 8 tests, ~4 hours

---

## Test Scenarios (Detailed)

### P0-01: Hub Created with Pillars (E2E)

**Preconditions:**
- User logged in with valid session
- Client context selected

**Steps:**
1. Navigate to `/app/hubs/new`
2. Upload sample PDF (test-source.pdf)
3. Wait for extraction to complete
4. Verify pillars displayed in configuration step
5. Click "Create Hub"

**Expected Results:**
- Hub appears in `/app/hubs` list
- D1 `hubs` table has record with correct `client_id`
- D1 `extracted_pillars` table has 3-10 pillar records
- Each pillar has `hub_id` matching created hub

**Test Data:**
```typescript
// fixtures/test-source.pdf - Multi-topic document with clear themes
// Expected pillars: Quality, Performance, Security (minimum 3)
```

---

### P0-06: Spoke Display by Pillar (E2E)

**Preconditions:**
- Hub with pillars exists
- User on hub detail page

**Steps:**
1. Click "Generate Spokes" button
2. Wait for progress to reach 100%
3. Click "Spokes" tab
4. Expand first pillar in TreeView

**Expected Results:**
- TreeView shows all pillars from hub
- Each pillar shows spoke count badge (e.g., "(4)")
- Expanding pillar reveals platform-specific spokes
- Each spoke has `platform` label (Twitter, LinkedIn, etc.)
- Spoke content is visible in preview

**Verification Query:**
```sql
-- Verify spokes have correct pillar_id
SELECT s.id, s.pillar_id, p.title as pillar_title
FROM spokes s
JOIN extracted_pillars p ON s.pillar_id = p.id
WHERE s.hub_id = ?
```

---

### P0-08: Case Mapping Transform (Integration)

**Purpose:** Verify the root cause fix for "0 spokes displayed" bug

**Test Location:** `apps/foundry-dashboard/worker/trpc/routers/spokes.test.ts`

**Steps:**
1. Mock DO response with camelCase fields:
   ```typescript
   const doResponse = [{
     id: 'spoke-1',
     hubId: 'hub-1',
     pillarId: 'pillar-1',  // camelCase
     platform: 'twitter',
     qualityScores: { g2_hook: 85 },
     visualArchetype: 'Bold Contrast',
     // ... other camelCase fields
   }];
   ```
2. Call `spokes.list` procedure
3. Verify response uses snake_case:
   ```typescript
   expect(result.items[0]).toMatchObject({
     pillar_id: 'pillar-1',  // snake_case
     hub_id: 'hub-1',
     quality_scores: { g2_hook: 85 },
     visual_archetype: 'Bold Contrast',
   });
   ```

**Expected Results:**
- All field names transformed to snake_case
- No undefined values for required fields
- `SpokeTreeView` filter `s.pillar_id === pillar.id` works correctly

---

### P0-11: Self-Healing Loop (Integration)

**Purpose:** Verify adversarial quality improvement works

**Test Location:** `apps/foundry-engine/src/workflows/spoke-generation.test.ts`

**Steps:**
1. Configure mock AI to fail G4 (Voice Alignment) on first attempt
2. Configure mock to pass on second attempt
3. Trigger spoke generation workflow
4. Verify workflow steps executed

**Expected Results:**
- Step `creator-generate` called
- Step `critic-g4-iteration-0` fails (returns `passed: false`)
- Step `regenerate-iteration-1` called with feedback
- Step `critic-g4-iteration-1` passes
- Final spoke status is `reviewing` (not `creative_conflict`)
- `regenerationCount` is 1

---

## Execution Order

### Smoke Tests (<5 min) - CI on every push

```bash
# Run from apps/foundry-dashboard
pnpm exec playwright test --grep "@smoke"
```

1. [P0-01] Hub creation happy path
2. [P0-06] Spoke display happy path
3. [P0-03] Client isolation check

### P0 Suite (<30 min) - CI on PR

```bash
pnpm exec playwright test --grep "@P0"
```

### P1 Suite (<60 min) - CI on merge to main

```bash
pnpm exec playwright test --grep "@P1"
```

### Full Suite - Nightly

```bash
pnpm exec playwright test
```

---

## Resource Requirements

### Test Data

| Asset | Location | Purpose |
|-------|----------|---------|
| test-source.pdf | `e2e/fixtures/` | Valid PDF for upload |
| large-transcript.txt | `e2e/fixtures/` | 60-minute podcast text |
| malicious.exe.pdf | `e2e/fixtures/` | Renamed executable for security test |
| mock-ai-responses.json | `e2e/fixtures/` | Workers AI mock data |

### Test Users

| User | Role | Client Access |
|------|------|---------------|
| test-owner@agency.com | Agency Owner | Client A, Client B |
| test-manager@agency.com | Account Manager | Client A only |
| test-creator@agency.com | Creator | Client A only |
| clientb-admin@clientb.com | Client Admin | Client B only |

### Environment

| Environment | Purpose | Database |
|-------------|---------|----------|
| Local | Development testing | foundry-local |
| Stage | E2E integration | foundry-global-stage |
| CI | Automated testing | foundry-global-stage |

---

## Quality Gate Criteria

### Pass/Fail Thresholds

| Priority | Required Pass Rate | Notes |
|----------|--------------------|-------|
| P0 | 100% | Any failure blocks merge |
| P1 | ≥95% | Minor UI issues acceptable |
| P2 | ≥90% | Edge cases may flake |
| P3 | N/A | Informational only |

### Non-Negotiable Requirements

- [ ] **Data Integrity:** Spokes ALWAYS display under correct pillar
- [ ] **Security:** Client A NEVER sees Client B's content
- [ ] **Performance:** Hub creation completes in <30s
- [ ] **Performance:** Spoke generation completes in <60s
- [ ] **UX:** Progress bar never stuck indefinitely (max 10 min timeout)

---

## Defect Found During Development

### BUG-001: Case Mapping Mismatch (FIXED)

**Symptom:** Stats show "20 Spokes" but TreeView shows "0 spokes" per pillar

**Root Cause:** DO returns `pillarId` (camelCase), frontend expects `pillar_id` (snake_case). `SpokeTreeView` filter `s.pillar_id === pillar.id` fails because `s.pillar_id` is `undefined`.

**Fix:** Transform response in `spokes.ts` router:
```typescript
const items = spokes.map((s) => ({
  pillar_id: s.pillarId,  // Transform camelCase → snake_case
  hub_id: s.hubId,
  // ... other fields
}));
```

**Regression Test:** P0-08

### BUG-002: Polling Infinite Loop (FIXED)

**Symptom:** 2000+ console messages, progress stuck at 2%, browser memory leak

**Root Cause:** tRPC caching returned stale "running" status for completed workflows

**Fix:**
1. Invalidate cache before each fetch
2. Add max poll count (200)
3. Reduce console spam (log every 10th poll)

**Regression Test:** P0-05, P1-05

### BUG-003: Tab Switch Race Condition (FIXED)

**Symptom:** Refetch fails silently when switching tabs

**Root Cause:** `refetchSpokes()` called before `setActiveTab('spokes')`, query runs while disabled

**Fix:** Switch tab first, then invalidate queries:
```typescript
setActiveTab('spokes');  // Enable query first
await trpcUtils.spokes.list.invalidate({ clientId, hubId });
```

**Regression Test:** P1-06

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: __________________ Date: __________
- [ ] Tech Lead: __________________ Date: __________
- [ ] QA Lead: __________________ Date: __________

---

**Generated by:** Claude (TEA Agent) - Test Architecture Module
**Workflow:** BMAD Test Design (Epic-Level Mode)
**Last Updated:** 2025-12-27
