# Story 5.4: Kill Chain Cascade

**Status:** done
**Story Points:** 8
**Sprint:** 4
**Epic:** 5 - Executive Producer Dashboard

## Story

As a **user**,
I want **to kill an entire Hub and cascade to all children**,
So that **I can clear bad content in 60 seconds instead of hours**.

## Acceptance Criteria

### AC1: Hub Kill Trigger (Hold H)
**Given** I am in Sprint Mode
**When** I hold the `H` key for 500ms
**Then** a "Kill Hub" confirmation modal appears

### AC2: Kill Confirmation Modal
**Given** the Kill Modal is open
**When** I view the details
**Then** I see:
- Hub title and total spoke count
- Warning that all non-edited spokes will be discarded
- "Can be undone within 30 seconds" notice
- **Confirm Kill** and **Cancel** buttons

### AC3: Mutation Rule (Survival)
**Given** I execute a Hub or Pillar Kill
**When** the system processes the spokes
**Then** any spoke with `is_mutated: 1` (manually edited) SURVIVES
**And** its status remains unchanged
**And** all other spokes move to `discarded` status

### AC4: Pillar Kill Action
**Given** I am in the Spoke Tree View
**When** I click the "Kill Pillar" button on a specific pillar
**Then** all non-mutated spokes in that pillar are discarded
**And** I see a confirmation toast with an "Undo" option

### AC5: Pruning Animation (UX Pattern 5)
**Given** a Kill operation is confirmed
**When** the UI updates
**Then** discarded items fade out with a staggered "pruning" effect (framer-motion)
**And** the progress bar updates immediately

### AC6: Undo Logic
**Given** I just killed a Hub or Pillar
**When** I click "Undo" in the toast within 30 seconds
**Then** all spokes affected by that specific operation are restored to their previous status

## Tasks / Subtasks

- [x] **Task 1: Backend Logic**
  - [x] Create `generations.killHub` mutation (handles mutation rule)
  - [x] Create `generations.killPillar` mutation
  - [x] Create `generations.undoKill` mutation

- [x] **Task 2: Frontend - Hold H Logic**
  - [x] Implement long-press detection for 'H' in `useSprintKeyboard.ts`
  - [x] State management for the Kill Confirmation modal

- [x] **Task 3: Frontend - UI Components**
  - [x] Create `KillConfirmationModal.tsx`
  - [x] Add "Kill Pillar" button to `PillarNode` in `SpokeTreeView.tsx`

- [x] **Task 4: Frontend - Animations**
  - [x] Implement staggered fade-out for discarded spokes in the tree view
  - [x] Implement "Red Pulse" effect for the Hub/Pillar being killed

- [ ] **Task 5: E2E Tests**
  - [ ] Test Hub Kill with mutation rule (verify edited spokes survive)
  - [ ] Test Undo functionality within the time window