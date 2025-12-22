# Story 4.4: Creative Conflict Escalation

**Status:** completed
**Story Points:** 5
**Sprint:** 3
**Epic:** 4 - Spoke Generation & Quality Assurance

## Story

As a **content manager**,
I want **a dedicated dashboard view for spokes that failed the self-healing loop**,
So that **I can manually review them, provide specific feedback, or approve them despite quality issues.**

## Acceptance Criteria

### AC1: "Creative Conflicts" Dashboard View
**Given** spokes have reached `failed_qa` status after the self-healing loop
**When** I navigate to the "Creative Conflicts" section of the dashboard
**Then** I see a list of all `failed_qa` spokes, grouped by hub/pillar
**And** each spoke clearly shows:
- Original content
- All quality gate evaluation results (G2, G4, G5 scores/status)
- Detailed `feedback_log` entries (violations, AI suggestions)
- Number of regeneration attempts

### AC2: Manual Review Actions
**Given** I am viewing a `failed_qa` spoke in the dashboard
**When** I select a spoke
**Then** I can choose one of the following actions:
- **Approve (Override):** Force status to `ready_for_review` (with optional note)
- **Request Manual Rewrite:** Change status to `pending_manual_rewrite` (with mandatory human feedback)
- **Discard:** Change status to `discarded` (with optional reason)

### AC3: Human Feedback Capture
**Given** I choose "Request Manual Rewrite"
**When** I submit the action
**Then** a new `feedback_log` entry is created with `gate_type: 'human_feedback'`
**And** the `suggestions` field contains my detailed instructions

### AC4: UI Indicators
**Given** a spoke has been manually approved or discarded
**When** I view the spoke later
**Then** there is a clear UI indicator (e.g., a badge) showing its manual status
**And** a link to the associated human feedback, if any

### AC5: Filtering and Sorting
**Given** I am in the "Creative Conflicts" dashboard view
**When** I interact with filtering and sorting controls
**Then** I can filter by:
- Hub
- Platform
- Specific gate failure (e.g., only G4 failures)
**And** I can sort by:
- Most recent failure
- Number of regeneration attempts (most attempts first)

## Tasks / Subtasks

- [x] **Task 1: Database Schema Updates**
  - [x] Add `manual_feedback_note` (TEXT) to `spokes` table
  - [x] Update `spokes` status enum to include `pending_manual_rewrite`, `discarded`

- [x] **Task 2: tRPC Router Procedures**
  - [x] Create `spokes.getCreativeConflicts` query (filters `failed_qa` spokes)
  - [x] Create `spokes.updateSpokeStatus` mutation (for Approve/Discard)
  - [x] Create `spokes.requestManualRewrite` mutation (updates status, adds `human_feedback` to `feedback_log`)

- [x] **Task 3: Frontend - Creative Conflicts Page**
  - [x] Create new route `/app/_authed/creative-conflicts`
  - [x] Implement main page structure with filters/sort
  - [x] Display list of `failed_qa` spokes using `SpokeCard` component (with enhancements)

- [x] **Task 4: Frontend - SpokeCard Enhancements**
  - [x] Add display for `feedback_log` entries associated with a spoke
  - [x] Implement action buttons (Approve, Rewrite, Discard) in `SpokeCard` context

- [x] **Task 5: E2E Tests**
  - [x] Test navigation to Creative Conflicts page
  - [x] Test filtering and sorting
  - [x] Test all manual review actions and status transitions

## Dev Notes

### UI Mockup (Textual)

**Creative Conflicts Page**

`[Filters: Hub | Platform | Gate Failures | Sort By]`

`Spoke Card 1: (failed_qa, 3 attempts)`
`  Platform: Twitter`
`  Content: "..."`
`  G2: 55 (Fail) - [Tooltip: Pattern Interrupt too low]`
`  G4: Fail - [Tooltip: Banned word 'synergy']`
`  Feedback Log: (Click to expand)`
`    - Attempt 1: G2/G4 failed.`
`    - Attempt 2: G4 failed again.`
`    - Attempt 3: G4 failed again.`
`  [Approve Button] [Request Manual Rewrite Button] [Discard Button]`

`Spoke Card 2: ...`

### Database Changes

```sql
-- Migration: 0012_add_manual_feedback.sql
ALTER TABLE spokes ADD COLUMN manual_feedback_note TEXT;
ALTER TABLE spokes ADD COLUMN status TEXT DEFAULT 'pending' NOT NULL; -- if it's not already there. if not, update ENUM
```
