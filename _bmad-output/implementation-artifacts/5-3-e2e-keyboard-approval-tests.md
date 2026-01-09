# Story 5.3.5: E2E Tests for Keyboard-First Approval Flow

**Status:** ready-for-dev
**Story Points:** 3
**Sprint:** Post-MVP Quality
**Epic:** 5 - Executive Producer Dashboard
**Parent Story:** 5-3-keyboard-first-approval-flow

## Story

As a **QA engineer**,
I want **comprehensive E2E tests for keyboard approval flow**,
So that **we catch regressions before users experience broken keyboard navigation**.

## Acceptance Criteria

### AC1: Arrow Key Navigation Tests
**Given** I am on `/app/review?filter=high-confidence` with spokes in queue
**When** I press `ArrowRight`
**Then** the current spoke is approved
**And** the next spoke is displayed
**And** the progress counter increments

**When** I press `ArrowLeft`
**Then** the current spoke is killed
**And** the next spoke is displayed

### AC2: Decision Persistence Tests
**Given** I approve a spoke via keyboard
**When** I refresh the page
**Then** the approved spoke is NOT in the pending queue
**And** it appears in approved content

### AC3: Keyboard Shortcut Coverage
**Given** I am in sprint review mode
**Then** all shortcuts work:
- `→` / `Enter` → approve
- `←` / `Backspace` → kill
- `E` → opens edit modal
- `C` → opens clone modal (if G7 >= 9.0)
- `Hold H` (500ms) → opens kill hub modal
- `Cmd+A` → nuclear approve (G7 >= 9.5)

### AC4: Visual Feedback Tests
**Given** I press `ArrowRight`
**Then** green flash animation plays
**And** card animates right with rotation

**Given** I press `ArrowLeft`
**Then** red flash animation plays
**And** card animates left with rotation

### AC5: Sprint Complete Flow
**Given** I approve/kill all spokes in queue
**When** the last decision is made
**Then** SprintComplete component renders
**And** stats show correct counts

### AC6: Empty Queue Handling
**Given** I navigate to a filter with no spokes
**Then** I see "No Items Found" message
**And** "Back to Dashboard" button works

## Tasks / Subtasks

- [ ] **Task 1: Test Setup & Fixtures** (AC: all)
  - [ ] Create `e2e/review-keyboard.spec.ts`
  - [ ] Create test fixtures with seeded spokes in different states
  - [ ] Create helper function `seedSpokesForReview(count, filter)`

- [ ] **Task 2: Core Navigation Tests** (AC: 1, 2)
  - [ ] Test ArrowRight approves and advances
  - [ ] Test ArrowLeft kills and advances
  - [ ] Test Enter as approve alias
  - [ ] Test Backspace as kill alias
  - [ ] Verify spoke status persists in D1

- [ ] **Task 3: Shortcut Coverage Tests** (AC: 3)
  - [ ] Test E opens edit modal
  - [ ] Test C opens clone modal (with G7 >= 9.0 spoke)
  - [ ] Test C does nothing for low G7 spokes
  - [ ] Test Hold H (500ms) opens kill hub modal
  - [ ] Test Cmd+A nuclear approve

- [ ] **Task 4: Visual Feedback Tests** (AC: 4)
  - [ ] Test green glow on approve
  - [ ] Test red glow on kill
  - [ ] Test card animation direction
  - [ ] Verify animations complete in < 200ms

- [ ] **Task 5: Edge Case Tests** (AC: 5, 6)
  - [ ] Test sprint complete renders after last decision
  - [ ] Test stats accuracy (approved/killed counts)
  - [ ] Test empty queue message
  - [ ] Test back to dashboard navigation

## Dev Notes

### Implementation Files
- **Route:** `apps/foundry-dashboard/src/routes/app/review.tsx` (674 lines)
- **Components:** `src/components/review/BucketCard.tsx`, `SprintComplete.tsx`, `KillConfirmationModal.tsx`, `CloneSpokeModal.tsx`
- **UI Components:** `src/components/ui/KeyboardHint.tsx`, `ActionButton.tsx`, `ScoreBadge.tsx`

### Existing Keyboard Handler (lines 164-219)
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (rawFilter && !isComplete && currentSpoke) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleAction('approve');
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') handleAction('kill');
      // Hold H for kill hub
      if (e.key === 'h' || e.key === 'H') {
        holdTimerRef.current = setTimeout(() => setShowKillModal(true), 500);
      }
      // C for clone (high confidence only)
      if ((e.key === 'c' || e.key === 'C') && (currentSpoke.qualityScores?.g7_engagement || 0) >= 9.0) {
        setShowCloneModal(true);
      }
      // E for edit
      if (e.key === 'e' || e.key === 'E') {
        setEditedContent(currentSpoke.content);
        setShowEditModal(true);
      }
    }
    // Global shortcuts
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'a' && !e.shiftKey) {
        e.preventDefault();
        handleNuclearApprove();
      }
    }
  };
  // ... keyup handler for hold H
}, [handleAction, isComplete, currentSpoke, rawFilter, navigate, handleNuclearApprove]);
```

### Test Data Requirements
1. **High Confidence Spokes:** G7 >= 9.0 for clone testing
2. **Mixed Queue:** Various G7 scores for filter testing
3. **Isolated Client:** Dedicated test client to avoid data pollution

### Playwright Patterns
```typescript
// Keyboard navigation
await page.keyboard.press('ArrowRight');
await expect(page.locator('[data-testid="spoke-card"]')).toHaveClass(/translate-x-\[100px\]/);

// Hold key for 500ms
await page.keyboard.down('h');
await page.waitForTimeout(600);
await page.keyboard.up('h');
await expect(page.locator('[data-testid="kill-hub-modal"]')).toBeVisible();

// Meta key combo
await page.keyboard.press('Meta+a');
```

### Animation Assertions
```typescript
// Check visual feedback classes
const card = page.locator('[data-testid="spoke-card"]');
await page.keyboard.press('ArrowRight');
await expect(card).toHaveClass(/bg-\[var\(--approve-glow\)\]/);
await expect(card).toHaveClass(/translate-x-\[100px\]/);
```

### Project Structure Notes
- Test file location: `apps/foundry-dashboard/e2e/review-keyboard.spec.ts`
- Use existing E2E test patterns from `e2e/` directory
- Leverage `e2e/setup/test-fixtures.ts` for data seeding
- Follow tagging convention: `@P0` for critical, `@keyboard` for feature tag

### References
- [Source: apps/foundry-dashboard/src/routes/app/review.tsx:164-219] - Keyboard handler
- [Source: _bmad-output/implementation-artifacts/5-3-keyboard-first-approval-flow.md] - Parent story
- [Source: apps/foundry-dashboard/e2e/QUICK-REFERENCE.md] - E2E test patterns

## Dev Agent Record

### Agent Model Used
(To be filled by dev agent)

### Debug Log References
(To be filled during implementation)

### Completion Notes List
(To be filled on completion)

### File List
- [ ] `apps/foundry-dashboard/e2e/review-keyboard.spec.ts` (new)
- [ ] `apps/foundry-dashboard/e2e/fixtures/review-fixtures.ts` (new or extend)
