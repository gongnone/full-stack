# Story 5.5: Clone Best & Variations

**Status:** done
**Story Points:** 8
**Sprint:** 4
**Epic:** 5 - Executive Producer Dashboard

## Story

As a **user**,
I want **to clone high-performing spokes and generate variations**,
So that **I can multiply my best content**.

## Acceptance Criteria

### AC1: "Clone Best" Trigger
**Given** I am viewing a spoke with G7 > 9.0 (High Confidence)
**When** I click the "Clone Best" action button
**Then** a modal opens to configure variations

### AC2: Variation Configuration
**Given** the Clone Modal is open
**When** I configure the options
**Then** I can select:
- Number of variations (1-5)
- Target platforms (multi-select)
- "Vary Psychological Angle" checkbox (slight variations in hook/angle)

### AC3: Variation Generation Workflow
**Given** I submit the Clone request
**When** the generation runs
**Then** the Creator Agent generates the requested number of variations
**And** each variation maintains the core message of the original
**And** each variation undergoes full Critic Agent evaluation (G2, G4, G5, G7)

### AC4: Hierarchical Display
**Given** variations have been generated
**When** I view the Spoke Tree View
**Then** variations appear as nested children of the original "Seed" spoke
**And** I can expand/collapse the variations list

### AC5: Independent Actions
**Given** I am viewing a variation
**When** I interact with it
**Then** I can approve, kill, or edit it independently of the parent or other variations

## Tasks / Subtasks

- [x] **Task 1: Schema Update**
  - [x] Add `parent_spoke_id` (TEXT) to `spokes` table in `packages/data-ops/src/schema.ts`
  - [x] Add `is_variation` (INTEGER) boolean to `spokes` table

- [x] **Task 2: Backend Workflow**
  - [x] Create `CloneSpokeWorkflow` in `apps/data-service/src/workflows/`
  - [x] Implement variation-specific prompts in `spoke-prompts.ts`
  - [x] Handle parallel generation and evaluation of variations

- [x] **Task 3: tRPC Integration**
  - [x] Create `generations.cloneSpoke` mutation to trigger workflow
  - [x] Update `generations.getSpokes` to return parent/child hierarchy or update frontend grouping logic

- [x] **Task 4: Frontend - Clone Modal**
  - [x] Create `CloneSpokeModal.tsx` component
  - [x] Implement platform multi-select and variation count slider

- [x] **Task 5: Frontend - UI Implementation**
  - [x] Add "Clone" button to `SpokeNode` in `SpokeTreeView.tsx`
  - [x] Implement nested rendering for variations in `SpokeTreeView.tsx`

- [ ] **Task 6: E2E Tests**
  - [ ] Test cloning a high-performing spoke
  - [ ] Verify variations appear correctly in the tree view
