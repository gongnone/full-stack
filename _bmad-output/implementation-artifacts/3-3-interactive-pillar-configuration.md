# Story 3.3: Interactive Pillar Configuration

**Status:** done
**Story Points:** 3
**Sprint:** 2
**Epic:** 3 - Hub Creation & Content Ingestion

## Story

As a **user**,
I want **to edit and refine the extracted pillars before finalizing**,
So that **I have control over the content direction**.

## Acceptance Criteria

### AC1: Editable Pillar List in Step 3
**Given** pillars have been extracted (Story 3.2)
**When** I view Step 3 (Configure Pillars)
**Then** I see all pillars in an editable list
**And** each pillar has: title input, claim textarea, angle dropdown

### AC2: Inline Title Editing with Modified Badge
**Given** I want to rename a pillar
**When** I edit the title field
**Then** the change is reflected immediately (optimistic UI)
**And** a "Modified" badge appears on the pillar card

### AC3: Pillar Deletion with Fade Animation
**Given** I want to remove a pillar
**When** I click the delete icon
**Then** the pillar is removed with a fade animation
**And** a confirmation toast appears with undo option (3 seconds)

### AC4: Psychological Angle Selection
**Given** I want to change a pillar's angle
**When** I click the angle dropdown
**Then** I see all 8 psychological angles as options:
- Contrarian, Authority, Urgency, Aspiration
- Fear, Curiosity, Transformation, Rebellion
**And** selecting a new angle updates the badge color immediately

### AC5: Minimum Pillar Validation
**Given** I have fewer than 3 pillars remaining
**When** I try to delete another pillar
**Then** the delete is blocked
**And** a warning message appears: "Minimum 3 pillars required for Hub creation"

### AC6: Save & Continue Flow
**Given** I have configured my pillars
**When** I click "Continue to Generate"
**Then** pillar updates are persisted to D1 (extracted_pillars table)
**And** I advance to Step 4 (Generate)

## Tasks / Subtasks

- [x] Backend: Pillar update mutations (AC: #2, #4, #6)
  - [x] Add `hubs.updatePillar` tRPC procedure (update title, claim, angle)
  - [x] Add `hubs.deletePillar` tRPC procedure with minimum 3 validation
  - [x] Add `hubs.restorePillar` tRPC procedure (for undo functionality)
  - [x] Ensure client_id filtering on all operations (Project Context Rule 1)

- [x] Frontend: Editable pillar cards (AC: #1, #2, #4)
  - [x] Create `EditablePillarCard.tsx` component in `src/components/hub-wizard/`
  - [x] Add inline title input with debounced save (300ms)
  - [x] Add claim textarea with character count (2000 max)
  - [x] Add psychological angle dropdown with color-coded options
  - [x] Add "Modified" badge that appears on any edit

- [x] Frontend: Pillar deletion flow (AC: #3, #5)
  - [x] Add delete button with confirmation on each card
  - [x] Implement fade-out animation using CSS transitions (300ms)
  - [x] Add undo toast with 3-second timer (UndoToast component)
  - [x] Add minimum pillar validation with warning message

- [x] Frontend: Step 3 integration (AC: #1, #6)
  - [x] Update `hubs.new.tsx` to render editable pillar list in Step 3
  - [x] Replace read-only PillarResults with editable EditablePillarCard components
  - [x] Add "Continue to Generate" button that persists and advances
  - [x] Add pillar count indicator with low pillar count warning

- [x] Testing: E2E test coverage
  - [x] Test inline title editing with Modified badge
  - [x] Test psychological angle dropdown selection
  - [x] Test pillar deletion with undo functionality
  - [x] Test minimum 3 pillar validation
  - [x] Test Save & Continue flow

## Dev Notes

### Dependencies

**Prerequisites (Story 3.2):**
- `extracted_pillars` D1 table exists (migration 0008)
- `ExtractionProgress.tsx` component complete
- `PillarResults.tsx` component complete (will be extended/replaced)
- Pillar type defined in `worker/types.ts`

**Database Schema (from 0008_extracted_pillars.sql):**
```sql
CREATE TABLE extracted_pillars (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  core_claim TEXT NOT NULL,
  psychological_angle TEXT NOT NULL,
  estimated_spoke_count INTEGER DEFAULT 5,
  supporting_points TEXT, -- JSON array
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (source_id) REFERENCES hub_sources(id) ON DELETE CASCADE
);
```

### Architecture Patterns

**Optimistic UI Pattern:**
- Update local state immediately on edit
- Fire tRPC mutation in background
- Rollback on error with error toast

**Psychological Angles (from Architecture.md):**
```typescript
const PSYCHOLOGICAL_ANGLES = [
  'Contrarian',  // Red (#F4212E)
  'Authority',   // Blue (#1D9BF0)
  'Urgency',     // Yellow (#FFAD1F)
  'Aspiration',  // Green (#00D26A)
  'Fear',        // Red (#F4212E)
  'Curiosity',   // Blue (#1D9BF0)
  'Transformation', // Green (#00D26A)
  'Rebellion',   // Red (#F4212E)
] as const;
```

### Component Structure

**New Files:**
- `apps/foundry-dashboard/src/components/hub-wizard/EditablePillarCard.tsx`
- `apps/foundry-dashboard/e2e/story-3.3-pillar-configuration.spec.ts`

**Modified Files:**
- `apps/foundry-dashboard/worker/trpc/routers/hubs.ts` - Add update/delete mutations
- `apps/foundry-dashboard/src/routes/app/hubs.new.tsx` - Integrate editable pillars
- `apps/foundry-dashboard/src/components/hub-wizard/index.ts` - Export new component

### UI/UX Specifications

**Midnight Command Styling:**
- Card background: `var(--bg-elevated)` (#1A1F26)
- Input background: `var(--bg-surface)` (#22272E)
- Border: `var(--border-subtle)` (#2A3038)
- Modified badge: `var(--edit)` (#1D9BF0) background

**Animations:**
- Fade-out on delete: `opacity 0→1, height collapse, 300ms ease-out`
- Modified badge appearance: `fade-in 200ms`

**Input Styling:**
```typescript
// Title input
className="text-lg font-semibold bg-transparent border-b border-transparent
           focus:border-[var(--edit)] transition-colors"

// Claim textarea
className="text-sm resize-none bg-[var(--bg-surface)] rounded border
           border-[var(--border-subtle)] focus:border-[var(--edit)]"
```

### References

**Technical:**
- [Source: _bmad-output/architecture.md#Hub-and-Spoke] - Pillar structure
- [Source: _bmad-output/epics.md#Story-3.3] - Original story definition
- [Source: project-context.md#Rule-1] - Client isolation requirement
- [Source: project-context.md#Rule-3] - Midnight Command design tokens

**Prerequisites:**
- [Story 3.1](./3-1-source-selection-and-upload-wizard.md) - Source upload complete
- [Story 3.2](./3-2-thematic-extraction-engine.md) - Extraction engine complete

**Next Story:**
- Story 3.4: Hub Metadata & State Management

## Estimation Notes

**Story Points: 3** (Medium complexity)

**Breakdown:**
- Backend mutations: 0.5 days
- EditablePillarCard component: 1 day
- Wizard integration: 0.5 days
- E2E tests: 0.5 days
- **Total: ~2.5 days**

**Risk Factors:**
- Optimistic UI rollback handling
- Animation performance on multiple cards
- Undo functionality with timer

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Implementation Summary

Story 3.3 implements interactive pillar configuration with full CRUD operations, optimistic UI updates, and undo functionality. Users can edit pillar titles, core claims, and psychological angles inline with immediate visual feedback via a "Modified" badge. Pillar deletion uses a fade animation and provides a 3-second undo toast.

### Acceptance Criteria Coverage

- **AC1** ✅: Editable pillar list in Step 3 with title input, claim textarea, angle dropdown
- **AC2** ✅: Inline title editing with debounced save (300ms) and "Modified" badge
- **AC3** ✅: Pillar deletion with fade animation (300ms) and undo toast (3 seconds)
- **AC4** ✅: Psychological angle dropdown with all 8 options and color-coded badges
- **AC5** ✅: Minimum 3 pillar validation with warning message and delete blocking
- **AC6** ✅: "Continue to Generate" button advances to Step 4 when 3+ pillars configured

### Key Technical Decisions

- **Optimistic UI**: Local state updated immediately, mutations fire in background
- **Debounced Updates**: 300ms debounce on title/claim changes to reduce API calls
- **Immediate Angle Updates**: Angle changes save immediately (no debounce)
- **Undo Architecture**: Deleted pillar stored in `undoState` with index for restoration
- **Type Safety**: PsychologicalAngle enum type shared between backend and frontend

### File List

**Backend:**
- `apps/foundry-dashboard/worker/trpc/routers/hubs.ts` - Added 3 mutations:
  - `updatePillar` - Update title, coreClaim, psychologicalAngle
  - `deletePillar` - Delete with minimum 3 validation
  - `restorePillar` - Restore for undo functionality

**Frontend:**
- `apps/foundry-dashboard/src/components/hub-wizard/EditablePillarCard.tsx` - NEW (230 lines)
  - Inline title input with debounce
  - Claim textarea with character count
  - Psychological angle dropdown with color-coded options
  - Delete confirmation UI
  - "Modified" badge
- `apps/foundry-dashboard/src/components/hub-wizard/UndoToast.tsx` - NEW (60 lines)
  - Countdown timer (3 seconds)
  - Slide-up animation
  - Undo button
- `apps/foundry-dashboard/src/components/hub-wizard/index.ts` - Updated exports
- `apps/foundry-dashboard/src/routes/app/hubs.new.tsx` - Integrated editable pillars
  - Added pillar update/delete/restore handlers
  - Added "Continue to Generate" button
  - Added pillar count indicator
  - Added minimum pillar warning

**CSS:**
- `apps/foundry-dashboard/src/index.css` - Added slideUp animation for toast

**Testing:**
- `apps/foundry-dashboard/e2e/story-3.3-pillar-configuration.spec.ts` - NEW (350+ lines)
  - AC1-AC6 test coverage
  - UI/UX integration tests
  - Undo functionality tests

### Known Limitations

- No drag-and-drop reordering (could be added in future enhancement)
- Error rollback shows console warning only (no error toast)
