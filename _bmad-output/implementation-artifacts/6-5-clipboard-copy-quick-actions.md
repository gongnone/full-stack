# Story 6.5: Clipboard Copy & Quick Actions

**Status:** complete
**Story Points:** 2
**Sprint:** 4
**Epic:** 6 - Content Export & Publishing Prep

## Story

As a **user**,
I want **to quickly copy content to my clipboard**,
So that **I can manually post individual pieces without doing a full export**.

## Acceptance Criteria

### AC1: Clipboard Copy Keyboard Shortcut
**Given** I am in Sprint Mode
**When** I press the `C` key
**Then** the current spoke's content is copied to my clipboard
**And** I see a toast notification: "Copied to clipboard".

### AC2: Platform-Aware Formatting
**Given** I am copying a Thread or Carousel
**When** I trigger the copy action
**Then** the content is formatted reasonably for clipboard:
- Threads: Posts separated by double newlines and numbered (1/N)
- Carousels: Slides labeled with Title and Description.

### AC3: "Copy & Approve" Quick Action
**Given** I am in Sprint Mode
**When** I view the action bar or use a shortcut (e.g., `Shift + →`)
**Then** the system copies the content AND approves the spoke in one interaction.

### AC4: Spoke Card Copy Button
**Given** I am viewing spokes in the Hub Detail tree view
**When** I click the copy icon on a spoke card
**Then** the content is copied to my clipboard.

## Tasks / Subtasks

- [ ] **Task 1: Implement Copy Formatting Logic**
  - [ ] Create `formatContentForClipboard(item)` helper.
  - [ ] Handle strings, JSON arrays (threads), and JSON objects (carousels).

- [ ] **Task 2: Update useSprintKeyboard**
  - [ ] Add `onCopy` and `onCopyAndApprove` handlers.
  - [ ] Map `C` and `Shift + ArrowRight` shortcuts.

- [ ] **Task 3: Update SprintView**
  - [ ] Implement the `handleCopy` and `handleCopyAndApprove` functions.
  - [ ] Integrate with `navigator.clipboard.writeText`.

- [ ] **Task 4: Verification**
  - [ ] Verify formatting of copied threads and carousels in external apps (Notion, Slack).
  - [ ] Verify shortcut responsiveness.
