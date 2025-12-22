# Story 5.2: Sprint View with Signal Header

**Status:** done
**Story Points:** 5
**Sprint:** 4
**Epic:** 5 - Executive Producer Dashboard

## Story

As a **user**,
I want **to review content at high velocity with clear quality signals**,
So that **I can make confident decisions in < 6 seconds**.

## Acceptance Criteria

### AC1: Signal Header Display
**Given** I enter Sprint Mode
**When** a content card loads
**Then** I see the Signal Header (UX Pattern 1):
- G2 (Hook) score in 48px bold typography
- G7 (Engagement Prediction) score in 48px bold typography
- Scores color-coded: green (>8), yellow (5-8), red (<5)

### AC2: Context Bar Integration
**Given** I view the content card
**When** I examine the layout
**Then** I see:
- Context Bar: Client › Platform › Hub › Pillar breadcrumb
- Content Preview: Full text with platform formatting
- Gate Status: G4 ✓, G5 ✓ badges
- Action Bar: Kill (←) | Edit (E) | Approve (→)

### AC3: G2 Tooltip (`Why` Hover)
**Given** I hover over the G2 score
**When** the tooltip appears (UX Pattern 2: "Why" Hover)
**Then** I see Critic's rubric notes within 300ms

### AC4: Progress Footer
**Given** I am reviewing
**When** I check the footer
**Then** I see:
- Progress bar: X% complete (approve-colored)
- Counter: Y/Z (current/total)
- Keyboard hints: ← Kill | → Approve | E Edit | H Hub Kill

## Tasks / Subtasks

- [x] **Task 1: Signal Header Component**
  - [x] Update `SignalHeader.tsx` to display G2 and G7 scores in 48px bold typography.
  - [x] Implement color-coding logic for G2 and G7 scores (green >8, yellow 5-8, red <5).

- [x] **Task 2: Context Bar Integration**
  - [x] Update `ContextBar.tsx` to display Client › Platform › Hub › Pillar breadcrumb.
  - [x] Fetch necessary data (Client, Hub, Pillar names) via tRPC.

- [x] **Task 3: Content Preview & Gate Status**
  - [x] Ensure `ContentCard.tsx` displays full text with platform formatting.
  - [x] Ensure `ContentCard.tsx` displays G4 ✓, G5 ✓ badges.

- [x] **Task 4: G2 Tooltip**
  - [x] Implement hover tooltip for G2 score in `SignalHeader.tsx`, showing critic's rubric notes. (Leverage existing `GateBadge` tooltip functionality)

- [x] **Task 5: Progress Footer Update**
  - [x] Update `ProgressFooter.tsx` to display accurate progress bar, counter (current/total), and keyboard hints.

- [ ] **Task 6: E2E Tests**
  - [ ] Test Signal Header score display and color-coding.
  - [ ] Test Context Bar breadcrumb accuracy.
  - [ ] Test G2 tooltip display.
  - [ ] Test Progress Footer updates.
