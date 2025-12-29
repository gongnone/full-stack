# Story R-8: Sprint Review UI Consolidation

Status: ready-for-dev

<!-- Refactoring story to resolve UI collision and consolidate Sprint Review logic -->
<!-- Estimated implementation time: 4-6 hours -->
<!-- Priority: HIGH - Fixes "Split Brain" UI and Data Discrepancy -->

## Story

As a **platform engineer**,
I want **to consolidate the Sprint Review logic into the main `user-application`**,
so that **users have a single, high-velocity review experience that matches the design system and shows accurate data**.

## Context & Problem

Currently, two "Review" interfaces exist:
1.  **Legacy (Correct Logic):** `apps/foundry-dashboard/src/routes/app/review.tsx` - Has the complex Swipe/Keyboard logic, Kill Chain, and DO integration (verified "Executive Producer" UX).
2.  **Modern (Correct Shell):** `apps/user-application/src/routes/app/_authed/review.tsx` - Uses modern Tailwind v4/Shadcn but lacks the deep interaction logic and uses a different data source.

**The Discrepancy:** The "Modern" app shows different numbers because it queries D1 directly, while the "Legacy" app queries the Durable Object (the source of truth for the review queue state).

## Acceptance Criteria

1.  **AC1: Unified Sprint Logic** - Port the `SprintComplete`, `BucketCard`, `KillConfirmationModal`, and `CloneSpokeModal` components from `foundry-dashboard` to `user-application`, updated to Tailwind v4.
2.  **AC2: Source of Truth Alignment** - Update `user-application` to use `review.getQueue` (DO Proxy) instead of `generations.getReviewBuckets` (Direct D1) to ensure data consistency with the backend state machine.
3.  **AC3: Keyboard & Swipe Support** - Re-implement the keyboard-first approval flow (Arrow Keys, H-hold for Kill Hub) in the `user-application` review route.
4.  **AC4: Visual Consistency** - Ensure the ported Sprint View matches the "Midnight Command" theme of the new dashboard exactly.
5.  **AC5: Legacy Cleanup** - Mark `apps/foundry-dashboard` routes as deprecated or redirect them to the new app to prevent confusion.

## Tasks / Subtasks

- [ ] **Task 1: Port Review Components to User App**
    - [ ] 1.1 Copy & Refactor `BucketCard` to `apps/user-application/src/components/sprint/` (update to Tailwind v4)
    - [ ] 1.2 Copy & Refactor `SprintComplete` (with stats visualization)
    - [ ] 1.3 Copy & Refactor `KillConfirmationModal` (ensure H-hold logic works)
    - [ ] 1.4 Copy & Refactor `CloneSpokeModal`

- [ ] **Task 2: Align Data Layer (TRPC)**
    - [ ] 2.1 In `apps/user-application/worker/trpc/routers/review.ts` (create if missing), import/replicate `reviewRouter` logic from `foundry-dashboard` that calls `ctx.callAgent`.
    - [ ] 2.2 Expose `review.getQueue`, `review.swipeAction`, `review.bulkApprove`, `review.killHub` in the user-app router.
    - [ ] 2.3 Update `apps/user-application/src/routes/app/_authed/review.tsx` to use these new TRPC endpoints.

- [ ] **Task 3: Re-implement Sprint Interaction Logic**
    - [ ] 3.1 Port the state machine logic (currentIndex, direction, stats) from the legacy `review.tsx` to the new route.
    - [ ] 3.2 Port the `useEffect` keyboard listeners (ArrowRight, ArrowLeft, Cmd+A, Hold H).
    - [ ] 3.3 Ensure "Nuclear Approve" and "Nuclear Kill" logic uses the DO actions.

- [ ] **Task 4: Verify & Cleanup**
    - [ ] 4.1 Verify "Review Tax" velocity (UI response < 200ms).
    - [ ] 4.2 Verify data matches `apps/foundry-dashboard` (if still running).
    - [ ] 4.3 Add deprecation notice to `apps/foundry-dashboard/src/routes/app/review.tsx`.

## Dev Notes

**Component Porting Guide (Tailwind v4):**
- Legacy: `style={{ backgroundColor: 'var(--bg-elevated)' }}`
- Modern: `className="bg-card"` (mapped in globals.css)
- Legacy: `var(--approve)`
- Modern: `text-success` or `text-[var(--success)]`

**Data Source:**
We must switch `user-application` to use the **Durable Object** (`ClientAgent`) for review data. The DO maintains the "session" state and critical queue ordering that D1 queries might miss.

**Reference Files:**
- Source Logic: `apps/foundry-dashboard/src/routes/app/review.tsx`
- Target Shell: `apps/user-application/src/routes/app/_authed/review.tsx`
- Router Source: `apps/foundry-dashboard/worker/trpc/routers/review.ts`
