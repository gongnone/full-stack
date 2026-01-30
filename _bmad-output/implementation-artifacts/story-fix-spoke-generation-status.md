# Story: Fix Spoke Generation Status — 16/18 Stuck on "GENERATING"

**Priority:** P0 — Pipeline Blocker
**Epic:** Epic 4 (Spoke Generation & Quality Assurance)
**Created:** 2026-01-29
**Reporter:** Molty (QA)

## Problem

After generating spokes for a hub, 16 of 18 spokes remain stuck showing "GENERATING" status in the UI, even after the generation progress bar completes. Only 2 spokes show actual content (status: PENDING). The hub detail page shows 18 spokes in the count, but expanding the Generated Spokes tab reveals most are empty with "GENERATING" status.

## Steps to Reproduce

1. Create a new account and client
2. Create a hub via Paste Text with any content (~100 words)
3. Complete the 4-step wizard (pillars extract successfully)
4. Click "Generate Spokes" on the hub detail page
5. Wait for generation to complete (progress bar reaches 100%)
6. View Generated Spokes tab → most spokes show "GENERATING" with no content

## Expected Behavior

All 18 spokes should show actual generated content after the generation workflow completes. Status should transition from GENERATING → PENDING (awaiting review).

## Actual Behavior

- 16/18 spokes stuck on "GENERATING" status
- Only 2 spokes (1 LinkedIn, 1 Instagram) show content with "PENDING" status
- All spokes show G2: 0, G4: Fail, G5: Fail quality scores
- Hub count shows "18 Spokes" but most are empty

## Acceptance Criteria

- [ ] All generated spokes transition to PENDING status with actual content
- [ ] No spokes remain in GENERATING state after workflow completion
- [ ] If a spoke fails to generate, show an error state (not perpetual "GENERATING")
- [ ] Content is visible for all generated spokes when expanded

## Investigation Notes

- The spoke-generation workflow in `apps/foundry-engine/src/workflows/spoke-generation.ts` handles generation
- The `foundry-dashboard/worker/trpc/routers/spokes.ts` serves spoke data
- Check if the workflow is completing but failing to write results to D1
- Check if there's a race condition between workflow steps and the DB writes
- The progress bar showed "2/18 spokes" at 11% and seemed to stall — may be related

## Test Environment

- Staging: foundry-stage.williamjshaw.ca
- Account: molty-qa@test.foundry.dev
- Hub ID: 9108ada5-b434-4eba-847f-75cbbcbdb1dc
