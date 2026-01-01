# Story 10.5: Iterative Pillar Refinement Implementation

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Status:** IMPLEMENTED
**Created:** 2026-01-01
**Lead:** @bmad-agent-bmm-dev

---

## 1. Summary

This document describes the implementation of the iterative feedback loop for pillar suggestions. This feature allows a client to reject the initial set of AI-generated brand pillars and provide feedback, which triggers the system to generate a new, revised set of suggestions. This closes the "human-in-the-loop" aspect of the AI strategy process.

This functionality builds directly upon the approval UI from Story 10-4.

## 2. Technical Implementation

### High-Level Architecture

The iteration loop is managed through a combination of frontend UI changes, a new tRPC mutation, and modifications to the existing `strategyAgent` to incorporate feedback. The database schema for `brand_pillar_suggestions` is leveraged to track versions and feedback history.

### Files Modified

| File Path | Change Description |
|-----------|--------------------|
| `apps/foundry-dashboard/src/routes/strategy.review.$token.tsx` | Modified |
| `apps/foundry-dashboard/worker/trpc/routers/onboarding.ts` | Modified |
| `packages/agent-logic/src/strategyAgent.ts` | Modified |
| `packages/agent-logic/src/prompts/strategyPrompts.ts`| Modified |
| `apps/foundry-dashboard/worker/db/schema.ts` | Modified |

### Implementation Details

**1. Frontend UI (`strategy.review.$token.tsx`):**
- The "Request Changes" button on the pillar review page is now enabled.
- Clicking this button opens a modal dialog.
- The modal contains a simple `textarea` for the client to enter their feedback (e.g., "These feel too corporate, can we be more edgy?").
- A "Submit Feedback" button within the modal calls a new tRPC mutation, `onboarding.requestPillarChanges`, passing the `token` and the `feedback` string.
- Upon successful submission, the UI shows a confirmation message like, "Thanks for the feedback! We're generating a new set of suggestions for you. You'll receive a new email shortly."

**2. Backend Logic (`onboarding.ts`):**
- A new mutation, `requestPillarChanges`, is added.
- **Input:** `{ token: string, feedback: string }`.
- **Actions:**
    1.  Validates the JWT `token`.
    2.  Finds the current `brand_pillar_suggestions` record.
    3.  **Updates the existing record:**
        - Sets its `status` to `rejected`.
        - Stores the client's `feedback` in a new `feedback_text` column.
    4.  **Triggers a new generation:** It asynchronously calls `strategyAgent.generatePillars`, but this time it includes the `feedback` text.
    5.  A notification is also sent to the agency owner, informing them that the client has requested changes and including the feedback provided.

**3. Database Schema (`schema.ts`):**
- The `brand_pillar_suggestions` table is modified:
    - A `feedback_text` (TEXT) column is added to store the client's feedback for a rejected version.
    - A `parent_suggestion_id` (FK) column is added to create a chain of suggestions, linking a new version to the one it's revising. This allows for a full history of the iteration process.
    - The `version` column will be used to display the iteration number to the user.

**4. Strategy Agent (`strategyAgent.ts` & `strategyPrompts.ts`):**
- The `generatePillars` function in the strategy agent is updated to accept an optional `feedback` string and `parent_suggestion_id`.
- The `getSynthesisPrompt` function in the prompt module is modified.
- **If `feedback` is present, it adds a new section to the prompt:**
    > The client reviewed the previous suggestions and was not satisfied. Here is their feedback:
    >
    > `[Client feedback is injected here]`
    >
    > Please generate a new, distinct set of pillar suggestions that addresses this feedback directly while still adhering to the original Brand DNA and Market Intelligence. Do not simply rephrase the old suggestions.

- When the new suggestions are saved, the `parent_suggestion_id` is set, preserving the chain of revisions. The `version` number is incremented.

### Conceptual Workflow (The Loop)

1.  Client clicks "Request Changes" and submits feedback.
2.  `onboarding.requestPillarChanges` mutation is called.
3.  Old suggestions are marked `rejected`, feedback is saved.
4.  `strategyAgent.generatePillars` is called with the feedback.
5.  Agent generates new pillars (V2).
6.  New `brand_pillar_suggestions` record is created (with `version: 2` and `parent_suggestion_id` pointing to V1).
7.  `sendStrategyReadyEmail` is called again, sending the client a **new review link** for the V2 suggestions.
8.  Client is back at the start of the approval flow, but now reviewing the revised pillars.

---
**END OF ARTIFACT**
