# Story 3.5: Real-Time Ingestion Progress

**Status:** done
**Story Points:** 3
**Sprint:** 2
**Epic:** 3 - Hub Creation & Content Ingestion

## Story

As a **user**,
I want **to see real-time progress during Hub creation**,
So that **I feel in control and don't experience "loading spinner anxiety"**.

## Acceptance Criteria

### AC1: Polling-Powered Progress Indicator
**Given** Hub creation is in progress (extraction or finalization)
**When** I am on the wizard (Step 3 or Step 4)
**Then** I see a progress indicator that updates via polling (2-second intervals)
**And** stage updates appear without page refresh

**Note:** MVP uses polling instead of WebSocket (see MVP Exclusions in project-context.md)

### AC2: Stage Completion Visualization
**Given** the workflow is processing
**When** each stage completes
**Then** the UI updates with:
- Checkmark icon on completed stages
- Current stage highlighted with pulsing animation
- Percentage progress bar (0-100%)
- Estimated time remaining (optional)

### AC3: Pillar Discovery Animation
**Given** the extraction phase identifies pillars
**When** each pillar is found and stored in D1
**Then** it animates into view in the preview area
**And** the pillar count increments in real-time
**And** each pillar shows its psychological angle badge

### AC4: Error Handling with Retry
**Given** an error occurs during processing
**When** the workflow fails
**Then** I see a clear error message describing the issue
**And** a "Retry" button is available
**And** partial progress is preserved (pillars already extracted remain)
**And** retry restarts from the failed stage, not from beginning

### AC5: Success State with Celebration
**Given** Hub creation completes successfully
**When** the workflow finishes
**Then** I see a success state with:
- Green checkmark animation (Midnight Command --approve color)
- "Hub Created!" message in 24px typography
- Hub statistics (pillar count, estimated spokes)
- "View Hub" and "Start Generation" action buttons

### AC6: Unified Progress Component
**Given** the wizard has multiple processing stages
**When** I view the progress indicator
**Then** I see a single unified progress bar showing:
- Overall percentage (weighted by stage)
- Stage breakdown: Parsing (10%) → Themes (30%) → Claims (30%) → Pillars (30%)
- Animated transitions between stages

## Tasks / Subtasks

- [x] **Task 1: Unified Progress Component** (AC: #1, #2, #6)
  - [x] Create `IngestionProgress.tsx` component in `src/components/hub-wizard/`
  - [x] Display 4-stage progress bar with weighted percentages
  - [x] Add checkmark animation for completed stages
  - [x] Add pulsing animation for current stage (CSS keyframes)
  - [x] Show overall percentage with animated counter
  - [x] Use Midnight Command design tokens (--approve, --bg-elevated, --text-primary)

- [x] **Task 2: Pillar Discovery Animation** (AC: #3)
  - [x] Create `PillarDiscoveryList.tsx` component
  - [x] Poll `hubs.getPillars` to detect new pillars
  - [x] Animate each pillar entry with slide-in + fade-in (300ms)
  - [x] Show psychological angle badge with correct color
  - [x] Display pillar count counter with animated increment

- [x] **Task 3: Error State Component** (AC: #4)
  - [x] Create `IngestionError.tsx` component
  - [x] Display error message with --kill color border
  - [x] Add "Retry" button that calls `hubs.retryExtraction`
  - [x] Preserve extracted pillars on retry (don't clear state)
  - [x] Add `hubs.retryExtraction` tRPC mutation if not exists

- [x] **Task 4: Success State Component** (AC: #5)
  - [x] Create `IngestionSuccess.tsx` component
  - [x] Green checkmark animation using CSS keyframes
  - [x] Display Hub statistics (title, pillar count, source type)
  - [x] Add "View Hub" button (navigates to /app/hubs/:hubId)
  - [x] Add "Start Generation" button (placeholder for Epic 4)

- [x] **Task 5: Wizard Integration** (AC: #1, #2, #3, #4, #5, #6)
  - [x] Update `hubs.new.tsx` Step 3 to use `IngestionProgress` component
  - [x] Replace current `ExtractionProgress` with unified progress UI
  - [x] Add `PillarDiscoveryList` alongside progress indicator
  - [x] Handle transitions between states (processing → success/error)
  - [x] Ensure smooth animations during state changes

- [x] **Task 6: Backend Progress Enhancement** (AC: #4)
  - [x] Add `hubs.retryExtraction` tRPC mutation
  - [x] Preserve existing pillars on retry (don't delete)
  - [x] Reset progress state to last successful stage
  - [x] Add `retry_count` tracking to `extraction_progress` table

- [x] **Task 7: E2E Tests** (AC: All)
  - [x] Test progress indicator updates during extraction
  - [x] Test pillar discovery animation as pillars appear
  - [x] Test error state display and retry functionality
  - [x] Test success state navigation
  - [x] Test stage completion animations

## Dev Notes

### Relevant Architecture Patterns and Constraints

**MVP Constraint (Critical):**
From project-context.md line 131: "❌ WebSocket real-time sync"
- Use **polling** (2-second intervals) instead of WebSocket
- Reuse pattern from Story 3-2's `ExtractionProgress.tsx`

**Performance Budget:**
- NFR-P2: Hub ingestion processing < 30 seconds
- Polling interval: 2 seconds (already established in Story 3-2)
- Animation duration: 200-400ms (Midnight Command motion system)

**Midnight Command Design Tokens:**
```typescript
// Colors
--approve: #00D26A  // Success states
--kill: #F4212E     // Error states
--edit: #1D9BF0     // Interactive elements
--bg-elevated: #1A1F26  // Card backgrounds
--text-primary: #E7E9EA

// Motion (from UX spec)
transition: 150-400ms
animation: spring easing for pulses
```

### Dependencies (From Stories 3-1 through 3-4)

**Existing Components to Extend/Replace:**
- `ExtractionProgress.tsx` - Current progress component (Story 3-2)
- `PillarResults.tsx` - Current pillar display (Story 3-2)
- `EditablePillarCard.tsx` - Editable pillar component (Story 3-3)

**Existing tRPC Procedures:**
- `hubs.extract` - Start extraction
- `hubs.getExtractionProgress` - Poll progress
- `hubs.getPillars` - Get extracted pillars
- `hubs.finalize` - Create Hub (Story 3-4, in progress by another agent)

**Database Tables (from migrations 0007, 0008):**
- `hub_sources` - Source document tracking
- `extraction_progress` - Stage tracking
- `extracted_pillars` - Pillar storage

### Source Tree Components to Touch

**New Files:**
- `apps/foundry-dashboard/src/components/hub-wizard/IngestionProgress.tsx` - Unified progress UI
- `apps/foundry-dashboard/src/components/hub-wizard/PillarDiscoveryList.tsx` - Animated pillar list
- `apps/foundry-dashboard/src/components/hub-wizard/IngestionError.tsx` - Error state
- `apps/foundry-dashboard/src/components/hub-wizard/IngestionSuccess.tsx` - Success state
- `apps/foundry-dashboard/e2e/story-3.5-ingestion-progress.spec.ts` - E2E tests

**Modified Files:**
- `apps/foundry-dashboard/src/routes/app/hubs.new.tsx` - Integrate new components
- `apps/foundry-dashboard/worker/trpc/routers/hubs.ts` - Add retryExtraction mutation
- `apps/foundry-dashboard/src/components/hub-wizard/index.ts` - Export new components
- `apps/foundry-dashboard/src/index.css` - Add animation keyframes

### Animation Specifications

**Stage Completion:**
```css
@keyframes stageComplete {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
```

**Pillar Discovery:**
```css
@keyframes pillarSlideIn {
  0% { transform: translateX(-20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
```

**Current Stage Pulse:**
```css
@keyframes stagePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

**Success Checkmark:**
```css
@keyframes successCheck {
  0% { transform: scale(0) rotate(-45deg); }
  50% { transform: scale(1.2) rotate(0deg); }
  100% { transform: scale(1) rotate(0deg); }
}
```

### Testing Standards Summary

**E2E Testing (Playwright):**
- Test progress indicator visibility during extraction
- Test stage transitions with correct checkmarks
- Test pillar discovery animation timing
- Test error state display and retry button functionality
- Test success state navigation to Hub detail page

**Integration Testing:**
- Test retryExtraction preserves existing pillars
- Test progress polling stops on completion/error
- Test pillar count increments correctly

### Project Structure Notes

**Component Organization:**
- All progress-related components in `src/components/hub-wizard/`
- Follow existing component patterns from Story 3-2 and 3-3
- Export via `index.ts` barrel file

**Naming Conventions:**
- Components: PascalCase (IngestionProgress, PillarDiscoveryList)
- CSS animations: kebab-case (stage-complete, pillar-slide-in)
- Test IDs: kebab-case (data-testid="ingestion-progress")

### References

**Technical Details:**
- [Source: _bmad-output/architecture.md#Hub-Ingestion-Flow] - Request flow with progress updates
- [Source: _bmad-output/epics.md#Story-3.5] - Original story definition
- [Source: _bmad-output/project-context.md#Rule-3] - Midnight Command design tokens
- [Source: _bmad-output/project-context.md#MVP-Exclusions] - WebSocket excluded, use polling
- [Source: _bmad-output/ux-design-specification.md] - Motion system (150-400ms)

**Related Stories:**
- [Story 3-1](./3-1-source-selection-and-upload-wizard.md) - Source upload (DONE)
- [Story 3-2](./3-2-thematic-extraction-engine.md) - Extraction with progress polling (DONE)
- [Story 3-3](./3-3-interactive-pillar-configuration.md) - Pillar editing (DONE)
- [Story 3-4](./3-4-hub-metadata-and-state-management.md) - Hub finalization (IN PROGRESS by other agent)

**Functional Requirements:**
- FR6: Users can view the processing status of source material during ingestion

### Previous Story Intelligence

**From Story 3-2 (ExtractionProgress.tsx):**
- 2-second polling interval established
- 4-stage progress model: parsing → themes → claims → pillars
- Progress stored in D1 `extraction_progress` table
- Auto-stop polling on `status: completed` or `status: failed`

**From Story 3-3 (EditablePillarCard.tsx):**
- Psychological angle colors already defined
- Pillar card styling established
- Fade animations for delete/restore

**Git Intelligence (Recent Commits):**
- Story 3-3 complete with E2E tests
- Midnight Command theme system established
- Brand DNA components provide animation patterns

### Estimation Notes

**Story Points: 3** (Medium complexity)

**Breakdown:**
- IngestionProgress component: 0.5 days
- PillarDiscoveryList animation: 0.5 days
- Error/Success states: 0.5 days
- Wizard integration: 0.5 days
- E2E tests: 0.5 days
- **Total: ~2.5 days**

**Risk Factors:**
- Animation performance with many pillars
- Coordination with Story 3-4 (Hub finalization)
- Progress percentage calculation accuracy

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Implementation Summary

Story 3.5 implements real-time ingestion progress with enhanced animations, pillar discovery visualization, error handling with retry, and success celebration. Uses polling (2-second intervals) per MVP exclusions - WebSocket is not used.

### Acceptance Criteria Coverage

- **AC1** ✅: Polling-powered progress indicator using `trpc.hubs.getExtractionProgress` with 2-second intervals
- **AC2** ✅: Stage completion visualization with checkmarks and pulsing animation
- **AC3** ✅: Pillar discovery animation with slide-in effect and counter pop
- **AC4** ✅: Error handling with `retryExtraction` mutation and preserved pillars
- **AC5** ✅: Success celebration with animated checkmark and action buttons
- **AC6** ✅: Unified progress component with weighted stage percentages (10/30/30/30)

### Key Technical Decisions

- **Polling over WebSocket**: MVP constraint requires polling (2s intervals)
- **Weighted Progress**: Stage weights (parsing 10%, themes/claims/pillars 30% each)
- **Optimistic Stage Tracking**: Track completed stages locally for immediate animation
- **Retry Logic**: Uses `retryExtraction` mutation with `retry_count` tracking in D1

### File List

**Frontend Components (New):**
- `apps/foundry-dashboard/src/components/hub-wizard/IngestionProgress.tsx` - Unified progress with stage animations
- `apps/foundry-dashboard/src/components/hub-wizard/PillarDiscoveryList.tsx` - Animated pillar list during extraction
- `apps/foundry-dashboard/src/components/hub-wizard/IngestionError.tsx` - Error state with retry button
- `apps/foundry-dashboard/src/components/hub-wizard/IngestionSuccess.tsx` - Success celebration with action buttons

**Backend (Modified):**
- `apps/foundry-dashboard/worker/trpc/routers/hubs.ts` - Added `retryExtraction` mutation

**Exports (Modified):**
- `apps/foundry-dashboard/src/components/hub-wizard/index.ts` - Export new components

**Wizard Integration (Modified):**
- `apps/foundry-dashboard/src/routes/app/hubs.new.tsx` - Integrated all Story 3.5 components

**CSS Animations (Modified):**
- `apps/foundry-dashboard/src/index.css` - Added 6 animation keyframes:
  - `stageComplete` - Stage completion checkmark bounce
  - `pillarSlideIn` - Pillar discovery slide-in
  - `stagePulse` - Current stage pulsing
  - `successCheck` - Success checkmark bounce
  - `progressFill` - Progress bar fill
  - `counterPop` - Counter increment pop

**Database Migration (New):**
- `apps/foundry-dashboard/migrations/0010_extraction_retry_count.sql` - Add `retry_count` column

**Testing (New):**
- `apps/foundry-dashboard/e2e/story-3.5-ingestion-progress.spec.ts` - 25+ E2E test cases

### Animation Specifications

| Animation | Duration | Easing | Purpose |
|-----------|----------|--------|---------|
| stageComplete | 400ms | ease-out | Checkmark bounce on stage completion |
| pillarSlideIn | 300ms | ease-out | Pillar cards sliding in |
| stagePulse | 1500ms | ease-in-out | Current stage breathing effect |
| successCheck | 600ms | ease-out | Success celebration bounce |
| counterPop | 300ms | ease-out | Counter increment emphasis |

### Completion Notes

- All 6 acceptance criteria implemented
- TypeScript compiles without errors
- E2E tests cover all AC scenarios
- Components integrate cleanly with existing wizard
- Follows Midnight Command design tokens
- Compatible with polling pattern (MVP constraint)
