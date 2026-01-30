# Story: Streamline Hub Creation — Reduce Clicks from 5 to 2

**Priority:** P1 — UX Blocker
**Epic:** Epic 3 (Hub Creation & Content Ingestion)
**Created:** 2026-01-29
**Reporter:** Molty (QA)

## Problem

Creating a hub and generating content requires 5 separate user actions across 4 wizard steps plus a separate generation trigger. This is too much friction for the core workflow of the product.

## Current Flow (5 clicks)

1. Select Client (auto if only one) ✓
2. Upload/Paste source → click "Use This Content"
3. Wait for pillar extraction → click "Continue to Generate"
4. Review summary → click "Create Hub"
5. Land on hub detail → click "Generate Spokes"

Steps 3-5 are unnecessary friction. The user already committed at step 2.

## Proposed Flow (2 clicks)

1. Upload/Paste source → click "Use This Content"
2. Pillars extract → user reviews/edits → click **"Create Hub & Generate"**

After clicking, the system should:
- Create the hub
- Start spoke generation automatically
- Redirect to the hub detail page showing live progress

## Acceptance Criteria

- [ ] Merge "Continue to Generate" + "Create Hub" + "Generate Spokes" into one action
- [ ] After pillar configuration, a single "Create Hub & Generate" button creates the hub AND starts spoke generation
- [ ] User is redirected to hub detail page with real-time progress bar
- [ ] Hub title auto-generates from source content (not "Untitled")
- [ ] The separate "Generate Spokes" button on hub detail remains for re-generation

## Technical Notes

- Hub creation: `worker/trpc/routers/hubs.ts`
- Spoke generation trigger: likely calls foundry-engine workflow
- The wizard is in `src/routes/app/hubs.new.tsx`
- Step 4 "Generate" currently just shows a summary — fold this into Step 3's CTA
