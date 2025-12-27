# Story 5.1: Production Queue Dashboard

**Status:** ready-for-dev
**Story Points:** 8
**Sprint:** 4
**Epic:** 5 - Executive Producer Dashboard

## Story

As a **user**,
I want **to see my content organized into actionable buckets**,
So that **I can quickly enter "flow state" for review**.

## Acceptance Criteria

### AC1: Action Buckets Visualization
**Given** I navigate to `/app/review`
**When** the page loads
**Then** I see 4 Action Buckets:
- **High Confidence** (green border): G7 > 9.0, count badge
- **Needs Review** (yellow border): G7 5.0-9.0, count badge
- **Creative Conflicts** (red border): Failed 3x healing (status: failed_qa), count badge
- **Just Generated** (blue border): Real-time/Recently generated feed

### AC2: Bucket Navigation & Mode Trigger
**Given** I view the High Confidence bucket
**When** I click "Start Sprint"
**Then** I navigate to `/app/sprint?bucket=high_confidence`
**And** I enter Sprint Mode with only G7 > 9.0 content

### AC3: Global Keyboard Shortcuts
**Given** I am on the review dashboard
**When** I press `⌘+H`
**Then** I navigate to High Confidence Sprint directly

### AC4: Nuclear Operations (Batch Approve)
**Given** I want quick actions
**When** I press `⌘+A` (Nuclear Approve)
**Then** all G7 > 9.5 content across the project/hub is batch approved
**And** I see confirmation: "X spokes approved"

### AC5: Nuclear Operations (Batch Kill)
**Given** I want to clear low quality
**When** I press `⌘+Shift+K` (Nuclear Kill)
**Then** all G7 < 5.0 content is batch killed (status: discarded)
**And** I see confirmation with undo option

## Tasks / Subtasks

- [x] **Task 1: Database & API**
  - [x] Add `g7_score` column to `spoke_evaluations` table (if missing)
  - [x] Create `generations.getReviewBuckets` query
  - [x] Create `generations.bulkUpdateStatus` mutation

- [x] **Task 2: Frontend - Review Page**
  - [x] Create route `/app/_authed/review`
  - [x] Implement Bucket Card components with specific styling
  - [x] Implement bucket count logic

- [x] **Task 3: Global Keyboard Shortcuts**
  - [x] Implement `useKeyboardShortcuts` hook for review page
  - [x] Handle `⌘+H`, `⌘+A`, `⌘+Shift+K`

- [x] **Task 4: Batch Operations UI**
  - [x] Implement confirmation toasts for nuclear operations
  - [x] Implement undo logic (timed delay or optimistic update)

- [x] **Task 5: E2E Tests**
  - [ ] Test bucket counts and navigation
  - [ ] Test nuclear keyboard shortcuts
