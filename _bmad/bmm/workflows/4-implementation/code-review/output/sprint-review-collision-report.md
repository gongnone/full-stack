# Investigation Report: Sprint Review UI Collision

## Problem Statement
The user reported a discrepancy between the Sprint Review UI and the Dashboard UI. Specifically, the numbers (counts) might be wrong, and the visual style is inconsistent.

## Findings

### 1. The "Split Brain" Architecture
The codebase has two distinct applications that both implement "Review" functionality, but in completely different ways:

| Feature | `apps/user-application` (Dashboard) | `apps/foundry-dashboard` (Sprint Review) |
| :--- | :--- | :--- |
| **Path** | `/app/_authed/review` | `/app/review` |
| **Tech** | React + Tailwind v4 + Shadcn | React + Legacy CSS Variables + Manual Styles |
| **Data Source** | `trpc.generations.getReviewBuckets` | `trpc.review.getReviewQueue` |
| **Status** | **Modern / In-Progress** | **Legacy / "Verified"** |
| **Visuals** | Matches Dashboard (Midnight Command) | Mimics Midnight Command (Legacy CSS) |

### 2. The Collision
- **Routes:** Both apps define routes that sound similar (`/app/_authed/review` vs `/app/review`), leading to confusion about which is the "real" one.
- **Data Logic:**
    - `user-application` uses `trpc.generations.getReviewBuckets` which queries `spokes` table directly with simple filters.
    - `foundry-dashboard` uses `trpc.review.getReviewQueue` which proxies to a Durable Object (`ClientAgent`) that maintains a specialized queue state.
- **Why Numbers Might Differ:**
    - `user-application` counts spokes based on *current* status in D1 (`ready_for_review`).
    - `foundry-dashboard` counts items in the Durable Object's memory/storage, which *should* sync with D1 but might be out of sync if the synchronization logic (e.g., in `ClientAgent`) is flawed or lagging. Or if the `getReviewBuckets` query is filtering differently (e.g. `g7_score > 9.0`) compared to the DO's logic.

### 3. Technical Debt
- **`apps/user-application`** appears to be the intended **unified UI** for the future, using modern Tailwind and shared components.
- **`apps/foundry-dashboard`** appears to be the **incumbent** application where most of the complex logic (Sprint Review, Kill Chain, etc.) was originally implemented and "Verified".
- The project documentation (`project-context.md`) states `apps/user-application` is the "user-facing dashboard", confirming `foundry-dashboard` contains legacy/duplicate views that should likely be migrated or deprecated.

## Recommendations

1.  **Immediate Fix (Data Integrity):**
    - Verify if `trpc.generations.getReviewBuckets` (User App) and `trpc.review.getReviewQueue` (Foundry Dashboard) are querying the *exact same* data source. If one hits D1 direct and the other hits a DO, they will drift.
    - **Action:** Ensure `user-application` also uses the `ClientAgent` DO for review data to ensure consistency with the "verified" backend logic, OR update the DO to ensure it perfectly reflects D1 state.

2.  **Strategic Fix (Consolidation):**
    - The "Sprint Review" features (Swipe UI, Keyboard Shortcuts, Kill Chain) from `foundry-dashboard` need to be fully ported to `user-application`.
    - Once ported, the `foundry-dashboard` routes should be removed or redirected to `user-application`.

## Next Steps for This Session
We should focus on **why the numbers are wrong** first, as requested.

1.  Compare the query logic in `generations.ts` (User App) vs `review.ts` (Foundry Dashboard).
2.  Determine which one is the "Source of Truth".
