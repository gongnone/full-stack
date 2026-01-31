# Quality Remediation Sprint — "Quality In, Quality Out"

**Date:** 2026-01-31
**Status:** Planning
**Priority:** P0 — Blocks product-market readiness
**Methodology:** TDD — write tests first, implement to pass

---

## Executive Summary

Quality audit revealed that the content generation pipeline **works mechanically** (18/18 spokes in ~50s) but **fails to produce usable content**. Root causes: broken score mapping, test fixture leakage into source material, missing Brand DNA depth, and prompt leakage in outputs.

### Critical Defects Found

| # | Defect | Severity | Root Cause |
|---|--------|----------|------------|
| QR-1 | G2/G7 scores all null in review queue | P0 | Score field name mismatch: workflow sends `g7_score`, DO expects `g7_engagement` |
| QR-2 | Content about "platform validation" and "E2E testing" | P0 | Source material is test fixture text, not pillar content |
| QR-3 | Prompt leakage ("You didn't provide the source material") | P0 | Creator prompt lacks source content guard |
| QR-4 | No visual metadata on spokes | P1 | `visual_archetype`/`image_prompt`/`thumbnail_concept` mapping may be broken |
| QR-5 | Generic brand voice ("Professional yet approachable") | P1 | Test Brand DNA is fixture data, not calibrated |
| QR-6 | Missing tables in production (platform_recommendations, golden_nuggets column) | P0 | Schema drift — migrations not applied |
| QR-7 | Creative conflict spokes not surfaced properly | P2 | Only 1/50 in creative_conflict — may be suppressing escalation |

---

## Stories (TDD — Tests First)

### QR-1: Fix Quality Score Mapping (P0)
**As a** reviewer  
**I want** G2, G4, G5, G6, G7 scores visible on every spoke  
**So that** I can make informed approval decisions  

**Root Cause:** Workflow `spoke-generation.ts` stores `g7_score` but DO `updateSpoke` maps `qualityScores.g7_engagement`. Same issue potentially for other scores.

**Acceptance Criteria:**
- [ ] Unit test: `updateSpoke({qualityScores: {g2_hook: 85, g7_score: 8.5}})` correctly stores to `g2_hook` and `g7_engagement` columns
- [ ] Unit test: `getReviewQueue` returns spokes with `g2_hook`, `g7_engagement` populated
- [ ] Integration test: Full pipeline → review queue → scores visible
- [ ] Fix: Map `g7_score` → `g7_engagement` in DO's `updateSpoke`
- [ ] Fix: Verify all score field names match between workflow output and DO input

**Files:**
- `apps/foundry-engine/src/durable-objects/client-agent.ts` (updateSpoke)
- `apps/foundry-engine/src/workflows/spoke-generation.ts` (qualityScores output)

---

### QR-2: Fix Source Material Feeding (P0)
**As a** content creator  
**I want** generated content to be about my brand's topic, not test infrastructure  
**So that** the content is actually usable  

**Root Cause:** The `sourceContent` parameter in `SpokeGenerationParams` receives whatever text was in the hub's source. For test hubs created via `createPillarFirstHub`, the source content is likely the pillar descriptions themselves (which are test fixture text like "Industry Disruption Insights") or empty.

**Acceptance Criteria:**
- [ ] Unit test: Creator prompt includes meaningful source material (not empty/test text)
- [ ] Unit test: When source is empty, Creator uses pillar title + description as context
- [ ] Unit test: Generated content does NOT contain phrases from test fixtures
- [ ] Fix: `createPillarFirstHub` must populate source content from Brand DNA + pillar details
- [ ] Fix: Creator prompt includes pillar `supporting_points`, `core_claim`, Brand DNA `signature_patterns`
- [ ] Fix: Fallback: If no source content, synthesize from pillar + brand context

**Files:**
- `apps/foundry-dashboard/worker/trpc/routers/hubs.ts` (createPillarFirstHub, triggerSpokeGeneration)
- `apps/foundry-engine/src/workflows/spoke-generation.ts` (Creator prompt assembly)

---

### QR-3: Fix Prompt Leakage (P0)
**As a** user  
**I want** content that never contains AI meta-commentary or prompt instructions  
**So that** I can post it directly without editing  

**Root Cause:** The Creator model sometimes outputs meta-text like "Here is the generated content:", "You didn't provide the source material", "I'm ready to get started."

**Acceptance Criteria:**
- [ ] Unit test: Content output is stripped of known leakage patterns
- [ ] Unit test: Leakage phrases list includes: "Here is the", "I'm ready to", "You didn't provide", "Please share", "Let me", "Note:", "Output:", "Here's a rewritten"
- [ ] Fix: Post-processing step strips meta-commentary prefixes/suffixes
- [ ] Fix: Creator system prompt explicitly says "NEVER include meta-commentary"
- [ ] Fix: G2 critic penalizes content that starts with AI meta-phrases

**Files:**
- `apps/foundry-engine/src/workflows/spoke-generation.ts` (Creator prompt + post-processing)
- New: `apps/foundry-engine/src/utils/content-sanitizer.ts`

---

### QR-4: Fix Visual Metadata Storage (P1)
**As a** reviewer  
**I want** visual archetype, thumbnail concept, and image prompt on each spoke  
**So that** I can evaluate the full creative package  

**Root Cause:** TBD — may be field mapping issue similar to QR-1.

**Acceptance Criteria:**
- [ ] Unit test: `updateSpoke({visualArchetype, imagePrompt, thumbnailConcept})` stores correctly
- [ ] Unit test: `getReviewQueue` returns spokes with visual metadata populated
- [ ] Integration test: Generated spoke has non-null visual fields

**Files:**
- `apps/foundry-engine/src/durable-objects/client-agent.ts`
- `apps/foundry-engine/src/workflows/spoke-generation.ts`

---

### QR-5: Enrich Brand DNA Context (P1)
**As a** brand owner  
**I want** generated content that reflects my actual brand voice  
**So that** the content is differentiated and on-brand  

**Root Cause:** Test Brand DNA is a fixture with generic values. Real onboarding via BrandDNA Agent would produce rich calibration data.

**Acceptance Criteria:**
- [ ] Unit test: Creator prompt includes Brand DNA tone profile, signature patterns, voice markers
- [ ] Unit test: G4 critic correctly evaluates against real Brand DNA
- [ ] Fix: Creator prompt template uses ALL available Brand DNA fields
- [ ] Fix: When Brand DNA is sparse, Creator prompt acknowledges limitations
- [ ] Seed: Create a realistic test Brand DNA fixture with rich voice data

**Files:**
- `apps/foundry-engine/src/workflows/spoke-generation.ts` (Creator prompt)
- `apps/foundry-dashboard/worker/trpc/routers/test-setup.ts` (rich Brand DNA fixture)

---

### QR-6: Schema Alignment (P0)
**As a** developer  
**I want** all tables and columns to exist in staging AND production  
**So that** features don't fail with "no such table/column" errors  

**Root Cause:** Schema defined in code but migrations never applied for `platform_recommendations` table and `golden_nuggets` column.

**Acceptance Criteria:**
- [ ] Migration file: `0031_schema_alignment.sql` with all missing tables/columns
- [ ] Applied to staging and production
- [ ] Health check validates all expected tables exist
- [ ] Test: `triggerSpokeGeneration` no longer fails on schema errors

**Files:**
- `apps/foundry-dashboard/migrations/0031_schema_alignment.sql`

---

## Implementation Order

1. **QR-6** (Schema) — unblocks everything, 30 min
2. **QR-1** (Score mapping) — most impactful quality fix, 2-3 hrs
3. **QR-3** (Prompt leakage) — sanitize output, 1-2 hrs
4. **QR-2** (Source material) — fix the input quality, 3-4 hrs
5. **QR-4** (Visual metadata) — verify after QR-1, 1-2 hrs
6. **QR-5** (Brand DNA) — enrich context, 2-3 hrs

**Total estimate: 10-15 hrs**

---

## Success Criteria

After remediation, re-run quality audit. All must pass:

- [ ] **Scores visible**: G2, G7 scores populate on all generated spokes
- [ ] **On-topic content**: 0/50 spokes reference "E2E testing", "platform validation", "Foundry"
- [ ] **No prompt leakage**: 0/50 spokes start with "Here is the" or similar meta-text
- [ ] **Visual metadata**: >90% spokes have archetype, thumbnail, image prompt
- [ ] **Brand voice**: Content reflects pillar themes and Brand DNA tone
- [ ] **Schema stable**: No "no such table/column" errors on any endpoint

---

## Testing Strategy

**TDD approach:**
1. Write failing test for each defect
2. Implement fix
3. Verify test passes
4. Re-run quality audit end-to-end

**Test files to create:**
- `apps/foundry-engine/src/workflows/__tests__/spoke-generation.test.ts` — workflow unit tests
- `apps/foundry-engine/src/utils/__tests__/content-sanitizer.test.ts` — sanitizer tests
- `apps/foundry-engine/src/durable-objects/__tests__/score-mapping.test.ts` — score mapping tests
- `apps/foundry-dashboard/e2e/quality-audit-automated.spec.ts` — E2E quality gate

---

*Created: 2026-01-31 by Molty (PM)*
