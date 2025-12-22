# Story 5.3: Keyboard-First Approval Flow

**Status:** done
**Story Points:** 5
**Sprint:** 4
**Epic:** 5 - Executive Producer Dashboard

## Story

As a **user**,
I want **to approve and reject content using only my keyboard**,
So that **I never break flow to reach for my mouse**.

## Acceptance Criteria

### AC1: Keyboard Triage Actions
**Given** I am in Sprint Mode (`/app/sprint`)
**When** I press `→` (Right Arrow)
**Then** the current card is approved (status: ready)
**And** visual feedback (green flash) is shown
**And** the next card is displayed automatically

**When** I press `←` (Left Arrow)
**Then** the current card is killed (status: discarded)
**And** visual feedback (red flash) is shown

### AC2: Skip Logic
**Given** I am in Sprint Mode
**When** I press `Space`
**Then** yellow flash plays
**And** card moves to the end of the queue

### AC3: Decision Latency (NFR-P4)
**Given** I make any decision via keyboard
**Then** visual feedback appears in < 200ms
**And** the UI remains responsive during the next card transition

### AC4: Help Overlay
**Given** I press `?`
**When** the keyboard shortcut guide toggles
**Then** I see all available sprint commands

## Tasks / Subtasks

- [x] **Task 1: Sprint Mode Foundation**
  - [x] Create route `/app/_authed/sprint`
  - [x] Implement card stack / queue management state (Zustand or local)

- [x] **Task 2: Hotkey Engine**
  - [x] Implement `useSprintHotkeys` hook
  - [x] Map arrows and space to status mutations

- [x] **Task 3: Visual Feedback Animations**
  - [x] Add `framer-motion` transitions for card swipes
  - [x] Implement flash overlays for approve/kill/skip

- [x] **Task 4: Critic Panel Toggle**
  - [x] Implement `?` shortcut to show/hide detailed rubric

- [ ] **Task 5: E2E Tests**
  - [ ] Test keyboard navigation sequence
  - [ ] Test decision persistence
