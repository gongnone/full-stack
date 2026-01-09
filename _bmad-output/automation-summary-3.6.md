# Automation Summary - Story 3.6: Pillar-First Hub Creation

**Date:** 2026-01-08
**Story:** 3.6 Pillar-First Hub Creation
**Mode:** BMad-Integrated
**Coverage Target:** Comprehensive (all acceptance criteria)

---

## Tests Created

### E2E Tests

**File:** `apps/foundry-dashboard/e2e/story-3.6-pillar-first-hub-creation.spec.ts`

| Test | Priority | AC Coverage |
|------|----------|-------------|
| should display Core Pillars tab when client has approved pillars | P1 | AC1 |
| should show pillar count badge on Core Pillars tab | P1 | AC1 |
| should show target/bullseye icon on Core Pillars tab | P2 | AC1 |
| should only show 3 original tabs when client has no approved pillars | P1 | AC2 |
| should display list of approved pillars when tab is clicked | P1 | AC3 |
| should display pillar title on each card | P1 | AC3 |
| should display framework type badge on each card | P1 | AC3 |
| should display short description (truncated to 100 chars) | P1 | AC3 |
| should display "Use These Pillars" primary action button | P1 | AC3 |
| should show loading skeleton while pillars are being fetched | P2 | AC3 |
| should advance to Step 3 when "Use These Pillars" is clicked | P0 | AC4 |
| should pre-load approved pillars into pillar configuration | P0 | AC4 |
| should NOT run extraction process when using Core Pillars | P0 | AC4 |
| should allow proceeding to Step 4 immediately after pillar load | P1 | AC4 |
| should create Hub successfully using Core Pillars | P0 | AC5 |
| should display Hub in Hub list after creation | P1 | AC5 |
| should work normally with spoke generation after pillar-first hub creation | P2 | AC5 |
| should apply correct framework badge colors | P2 | UI/UX |
| should follow Midnight Command theme styling | P2 | UI/UX |
| should handle empty pillar description gracefully | P2 | Edge Case |
| should transform framework types correctly to psychological angles | P2 | Edge Case |

**Total Tests:** 21

---

## Test Coverage Matrix

| Acceptance Criteria | Tests | Priority |
|---------------------|-------|----------|
| AC1: Core Pillars tab appears when approved pillars exist | 3 | P1-P2 |
| AC2: Core Pillars tab hidden when no approved pillars | 1 | P1 |
| AC3: Core Pillars tab displays approved pillars preview | 6 | P1-P2 |
| AC4: Selecting Core Pillars skips extraction, loads pillars | 4 | P0-P1 |
| AC5: Hub created with synthetic source record | 3 | P0-P2 |
| UI/UX Integration | 2 | P2 |
| Edge Cases | 2 | P2 |

---

## Priority Breakdown

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 4 | Critical path - must always work |
| P1 | 10 | High priority - run on PR to main |
| P2 | 7 | Medium priority - nightly/edge cases |

---

## data-testid Coverage

Tests use the following `data-testid` attributes specified in the story:

| Selector | Tests Using |
|----------|-------------|
| `data-testid="core-pillars-tab"` | AC1, AC3, AC4 tests |
| `data-testid="core-pillars-list"` | AC3 tests |
| `data-testid="use-pillars-button"` | AC3, AC4 tests |
| `data-testid="pillar-card-{id}"` | AC3 tests |
| `data-testid="pillar-count-badge"` | AC1 tests |
| `data-testid="framework-badge"` | AC3, UI/UX tests |
| `data-testid="pillar-title"` | AC3 tests |
| `data-testid="pillar-description"` | AC3 tests |

---

## Test Execution Commands

```bash
# Run all Story 3.6 tests
cd apps/foundry-dashboard
pnpm exec playwright test story-3.6-pillar-first-hub-creation.spec.ts

# Run only P0 (critical) tests
pnpm exec playwright test story-3.6-pillar-first-hub-creation.spec.ts --grep "\[P0\]"

# Run P0 + P1 tests (pre-merge)
pnpm exec playwright test story-3.6-pillar-first-hub-creation.spec.ts --grep "\[P0\]|\[P1\]"

# Run in headed mode for debugging
pnpm exec playwright test story-3.6-pillar-first-hub-creation.spec.ts --headed

# Run with UI mode
pnpm exec playwright test story-3.6-pillar-first-hub-creation.spec.ts --ui
```

---

## Test Prerequisites

1. **Test User**: Must have `TEST_EMAIL` and `TEST_PASSWORD` environment variables set
2. **Client with Approved Pillars**: Test user's client must have at least 1 approved pillar in `content_pillars` table with `status = 'approved'`
3. **Brand DNA Completion**: Client should have completed Brand DNA onboarding (Epic 10)

### Database Setup (if needed)

```sql
-- Verify client has approved pillars
SELECT id, client_id, title, framework_type, status
FROM content_pillars
WHERE client_id = '<your-client-id>'
  AND status = 'approved';

-- If no approved pillars, create test data
INSERT INTO content_pillars (id, client_id, title, description, framework_type, status)
VALUES
  ('test-pillar-1', '<client-id>', 'Industry Disruption', 'Challenge conventional thinking...', 'catalyst', 'approved'),
  ('test-pillar-2', '<client-id>', 'Leadership Wisdom', 'Authentic lessons from your journey...', 'core_truth', 'approved'),
  ('test-pillar-3', '<client-id>', 'Results & Case Studies', 'Demonstrate expertise through concrete...', 'proof', 'approved');
```

---

## Quality Checklist

- [x] All tests follow Given-When-Then format
- [x] All tests have priority tags ([P0], [P1], [P2])
- [x] All tests use data-testid selectors
- [x] No hard waits or sleeps (uses explicit waits)
- [x] Tests are self-contained (login helper included)
- [x] TypeScript compilation passes
- [x] Follows existing project test patterns (story-3.3 reference)
- [x] File under 500 lines (458 lines)

---

## Important Notes

### Tests Cannot Run Until Implementation Complete

These tests are **pre-written** based on the story acceptance criteria. They will **fail** until the dev team implements:

1. `CorePillarsTab.tsx` component (Task 2)
2. `pillars.getApprovedPillarsForHub` tRPC query (Task 1)
3. Tab integration in `StepUploadSource.tsx` (Task 3)
4. `hubs.createPillarFirstHub` mutation (Task 5)
5. Database migration for `source_type = 'pillars'` (Task 6)

### Framework Type → Psychological Angle Mapping

Tests verify the correct transformation:

| Framework Type | Expected Psychological Angle |
|----------------|------------------------------|
| `catalyst` | Contrarian |
| `core_truth` | Authority |
| `proof` | Transformation |

---

## Next Steps

1. **Dev Team**: Complete implementation of Tasks 1-6
2. **After Implementation**: Run tests to verify feature works
3. **Fix Any Failures**: Heal failing tests if needed
4. **Code Review**: Include tests in PR with implementation
5. **CI Integration**: Tests auto-run on PR to main branch

---

## Workflow Reference

- **Workflow Used**: `testarch-automate`
- **Mode**: BMad-Integrated (story-driven)
- **Date Generated**: 2026-01-08
- **Test Patterns Applied**: Given-When-Then, Priority tagging, data-testid selectors
