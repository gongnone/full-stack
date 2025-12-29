# Story R-8: Fix Review Queue Query Logic

Status: done

<!-- Remediation story to fix data consistency in the Sprint Review queue -->
<!-- Estimated implementation time: 1 hour -->
<!-- Priority: HIGH - User reported inaccurate numbers -->

## Story

As a **platform user**,
I want **the Review Queue counts to match the actual number of pending items**,
so that **I trust the dashboard metrics and don't miss content requiring review**.

## Context & Problem

The Foundry Dashboard (`apps/foundry-dashboard`) showed incorrect counts in the Review Queue.
**Root Cause:** The `ClientAgent` Durable Object was using legacy/incorrect SQL queries to filter items:
- It looked for `status='reviewing'` (Legacy status), missing items marked `ready_for_review` (Foundry status).
- It didn't correctly implement the "High Confidence" (G7 > 90) or "Needs Review" (G7 50-90) logic.

## Acceptance Criteria

1.  **AC1: Accurate Filtering** - `getReviewQueue` correctly filters by status `ready_for_review` OR `reviewing` (backward compatibility).
2.  **AC2: Correct Buckets** -
    - **High Confidence:** G7 > 90
    - **Needs Review:** G7 50-90
    - **Conflicts:** status `failed_qa` or `creative_conflict`
3.  **AC3: API Support** - `reviewRouter` supports the `needs-review` filter.

## Tasks / Subtasks

- [x] **Task 1: Audit & Fix `ClientAgent` Query Logic**
    - [x] 1.1 Read `apps/foundry-engine/src/durable-objects/client-agent.ts` to inspect `getReviewQueue` implementation.
    - [x] 1.2 Updated the DO query matches the definition of buckets.

- [x] **Task 2: Update TRPC Router**
    - [x] 2.1 Updated `apps/foundry-dashboard/worker/trpc/routers/review.ts` to support `needs-review` filter.

- [x] **Task 3: Verify with Integration Test**
    - [x] 3.1 Ran `worker/trpc/routers/__tests__/review.test.ts` (Passed).

## Dev Notes

**Architectural Correction:**
The `ClientAgent` DO is the **write master** for client data in Foundry. There is no external D1 to "sync" from. The issue was purely query logic within the master DO.

**Files Modified:**
- `apps/foundry-engine/src/durable-objects/client-agent.ts`
- `apps/foundry-dashboard/worker/trpc/routers/review.ts`