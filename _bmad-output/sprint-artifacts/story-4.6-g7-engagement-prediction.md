# Story 4.6: G7 Engagement Prediction Gate

Status: ready-for-dev

## Story

As a **content creator**,
I want **every spoke evaluated for predicted engagement before I review it**,
So that **I only invest time reviewing content that will actually grab attention**.

## Business Context

**Problem:** Current MVP validates "grammatically coherent + on-brand" (G2/G4/G5) but NOT "will this grab attention in feed."

**Impact:** Shipping 300 pieces/month that pass quality gates but flop in engagement defeats the "attention-grabbing" value proposition.

**Decision:** De-scoped Carousels and Threads from MVP to bring G7 into scope (per Williamshaw approval 2026-01-19).

**Enhancement:** Hybrid scoring approach with client-curated admired profiles taking priority over baseline generic hooks for personalized engagement prediction.

## Acceptance Criteria

### AC1: G7 Hybrid Scoring Logic
**Given** a spoke has passed G2/G4/G5 gates
**When** the Critic Agent evaluates for G7
**Then** the system:
- Extracts the spoke's hook/opening line
- Generates embedding vector using Workers AI
- **Queries TWO Vectorize namespaces:**
  - **Priority Tier:** `client_{id}_admired` (client's curated Instagram profiles)
  - **Baseline Tier:** `baseline_{niche}` (generic + synthetic hooks)
- **Calculates weighted blend:**
  - If client has 5+ admired profiles: 70% admired / 30% baseline
  - If client has 1-4 admired profiles: 50% admired / 50% baseline
  - If client has 0 admired profiles: 100% baseline
- For each tier, calculates:
  - Stopping Power score (similarity to proven winners: 0-10)
  - Novelty score (differentiation from overused patterns: 0-10)
- Computes final G7 score = (Stopping Power × 0.7) + (Novelty × 0.3)
- Stores G7 score in `spokes.g7_score` field
- Stores benchmark engagement rate in `spokes.g7_benchmark` field
- Stores scoring source in `spokes.g7_source` field (e.g., "70% admired, 30% baseline")

### AC2: G7 Gate Threshold
**Given** G7 scoring completes
**When** the score is evaluated
**Then**:
- If G7 ≥ 7.5 → spoke marked `ready_for_review`
- If G7 < 7.5 → spoke sent to Self-Healing Loop with feedback
- Feedback includes: "G7 Failed: Hook lacks stopping power. Top performers use [pattern examples]"

### AC3: Self-Healing Loop Integration
**Given** a spoke fails G7 with score 6.2
**When** the Self-Healing Loop regenerates
**Then**:
- Creator Agent receives feedback: "Improve hook's Pattern Interrupt. Avoid overused phrases like [cliché list]"
- New version generated with emphasis on novelty
- Critic re-evaluates with fresh G7 scoring
- Loop continues up to 3 attempts (consistent with Story 4.3)

### AC4: G7 Display in Review UI
**Given** I view a spoke in the Review Queue
**When** the spoke card renders
**Then** I see:
- G7 badge showing score (color-coded: <7 red, 7-8.5 yellow, >8.5 green)
- Hover tooltip shows: "Engagement Prediction: 8.2/10 - Matches top 15% of hooks in [niche]"
- Benchmark comparison: "Similar hooks avg 4.2% engagement rate"

### AC5: G7 Filter in Review Dashboard
**Given** I'm on the Review Dashboard
**When** I want to prioritize high-engagement content
**Then**:
- Filter option available: "Show Top 10% (G7 > 9.0)"
- Spokes sorted by G7 score descending
- Count updates to show filtered results

### AC6: Analytics Tracking
**Given** users approve and post G7-validated content
**When** I view Analytics Dashboard (Epic 8)
**Then**:
- G7 Prediction Accuracy metric shown
- Correlation coefficient (r) between G7 score and actual engagement
- Target: r > 0.6 (60% prediction accuracy)
- If r < 0.6 → trigger "Retrain G7 Model" alert

## Tasks / Subtasks

- [ ] Task 1: Create Vectorize indexes for hybrid scoring (AC1)
  - [ ] Subtask 1.1: Create **Baseline Namespace** (`baseline_{niche}`)
    - [ ] Generate 2k manually curated high-performing hooks across 5 niches
    - [ ] Generate 8k synthetic hooks using AI for niche coverage
    - [ ] Add metadata: `niche`, `platform`, `avg_engagement_rate`, `source: 'baseline'`
  - [ ] Subtask 1.2: Create **Admired Profiles Namespace** pattern (`client_{id}_admired`)
    - [ ] Configure per-client namespace isolation
    - [ ] Metadata fields: `instagram_handle`, `post_url`, `engagement_rate`, `source: 'admired'`
  - [ ] Subtask 1.3: Configure both indexes with dimension matching Workers AI text-embedding model (1536)
  - [ ] Subtask 1.4: Create seed script for baseline population (runs once on deploy)

- [ ] Task 2: Implement G7 hybrid scoring logic (AC1, AC2)
  - [ ] Subtask 2.1: Create `apps/foundry-engine/src/agents/critic/g7-scorer.ts`
  - [ ] Subtask 2.2: Implement `scoreEngagement(spoke, brandDNA, clientId)` function
  - [ ] Subtask 2.3: Query admired profiles count to determine weighting
  - [ ] Subtask 2.4: Execute parallel Vectorize queries:
    - [ ] Query `client_{id}_admired` namespace (topK=50)
    - [ ] Query `baseline_{niche}` namespace (topK=50)
  - [ ] Subtask 2.5: Calculate tier-specific scores for each result set:
    - [ ] Stopping Power (cosine similarity to top hooks: 0-10)
    - [ ] Novelty (differentiation from clichés: 0-10)
  - [ ] Subtask 2.6: Apply weighted blending:
    - [ ] 5+ profiles: 70% admired / 30% baseline
    - [ ] 1-4 profiles: 50% admired / 50% baseline
    - [ ] 0 profiles: 100% baseline
  - [ ] Subtask 2.7: Compute final G7 = (Stopping × 0.7) + (Novelty × 0.3)
  - [ ] Subtask 2.8: Return score + benchmark + source breakdown

- [ ] Task 3: Integrate G7 into Critic evaluation pipeline (AC1, AC2)
  - [ ] Subtask 3.1: Modify `apps/foundry-engine/src/agents/critic/index.ts`
  - [ ] Subtask 3.2: Add G7 scoring step after G2/G4/G5 gates
  - [ ] Subtask 3.3: Apply 7.5 threshold for pass/fail
  - [ ] Subtask 3.4: Store `g7_score`, `g7_benchmark`, and `g7_source` in spoke record
  - [ ] Subtask 3.5: Generate feedback message for G7 failures with pattern examples

- [ ] Task 4: Update database schema (AC1)
  - [ ] Subtask 4.1: Add migration for `spokes.g7_score REAL` column
  - [ ] Subtask 4.2: Add migration for `spokes.g7_benchmark REAL` column
  - [ ] Subtask 4.3: Add migration for `spokes.g7_source TEXT` column (stores "70% admired, 30% baseline")
  - [ ] Subtask 4.4: Run migration on `foundry-global-stage` D1 database
  - [ ] Subtask 4.5: Verify column additions with query test

- [ ] Task 5: Self-Healing Loop integration (AC3)
  - [ ] Subtask 5.1: Update feedback generation to include G7-specific guidance
  - [ ] Subtask 5.2: Add pattern examples from Vectorize top performers
  - [ ] Subtask 5.3: Include cliché avoidance list in regeneration prompt
  - [ ] Subtask 5.4: Test 3-attempt loop with G7 failures

- [ ] Task 6: Frontend G7 badge component (AC4)
  - [ ] Subtask 6.1: Create `apps/foundry-dashboard/src/components/review/G7Badge.tsx`
  - [ ] Subtask 6.2: Implement color-coding logic (<7 red, 7-8.5 yellow, >8.5 green)
  - [ ] Subtask 6.3: Add hover tooltip with:
    - [ ] Benchmark comparison ("Similar hooks avg 4.2% engagement")
    - [ ] Score source breakdown ("70% from @garyvee, 30% baseline")
  - [ ] Subtask 6.4: Display niche name from Brand DNA

- [ ] Task 7: Update Review Dashboard UI (AC4, AC5)
  - [ ] Subtask 7.1: Modify `apps/foundry-dashboard/src/components/review/SpokeCard.tsx`
  - [ ] Subtask 7.2: Add G7Badge to spoke card display
  - [ ] Subtask 7.3: Add G7 filter dropdown with "Top 10%" option
  - [ ] Subtask 7.4: Implement sort by G7 score descending
  - [ ] Subtask 7.5: Update count badge when filter applied

- [ ] Task 8: Update tRPC router for G7 data (AC4)
  - [ ] Subtask 8.1: Modify `apps/foundry-dashboard/src/server/routers/spokes.ts`
  - [ ] Subtask 8.2: Include `g7_score`, `g7_benchmark`, and `g7_source` in spoke response schema
  - [ ] Subtask 8.3: Add optional filter param: `g7_min_score`
  - [ ] Subtask 8.4: Add sort param: `order_by: 'g7_score'`

- [ ] Task 9: Analytics tracking (AC6)
  - [ ] Subtask 9.1: Create tracking table for actual engagement results
  - [ ] Subtask 9.2: Add correlation calculation for G7 vs actual engagement
  - [ ] Subtask 9.3: Display prediction accuracy metric in Analytics Dashboard
  - [ ] Subtask 9.4: Add alert trigger when r < 0.6

- [ ] Task 10: Testing (All ACs)
  - [ ] Subtask 10.1: Unit test G7 scoring logic with mock Vectorize responses
  - [ ] Subtask 10.2: Unit test threshold application (7.5 cutoff)
  - [ ] Subtask 10.3: E2E test spoke generation with G7 gate
  - [ ] Subtask 10.4: E2E test Self-Healing Loop with G7 failure
  - [ ] Subtask 10.5: E2E test Review Dashboard G7 filter
  - [ ] Subtask 10.6: Visual regression test for G7Badge component

## Dev Notes

### Architecture Patterns

**Adversarial Logic (Rule 4):**
- G7 is the FINAL gate before `ready_for_review` status
- Evaluation order: G2 → G4 → G5 → G7
- Self-Healing Loop applies to ALL gate failures including G7

**Multi-Tenant Isolation (Rule 1):**
- Vectorize queries MUST filter by `client_id` namespace
- Each client's hooks index is isolated
- Never query cross-client data

**Performance Budget (Rule 2):**
- Vectorize query < 200ms (per NFR-P6)
- G7 scoring adds ~250ms to spoke evaluation
- Batch generation still targets < 60s for 25 spokes

### File Paths

**Backend (foundry-engine):**
```
apps/foundry-engine/src/
├── agents/critic/
│   ├── g7-scorer.ts          [NEW]
│   └── index.ts               [MODIFY - add G7 step]
├── vectorize/
│   └── hooks-index.ts         [NEW - Vectorize client]
└── db/
    └── migrations/
        └── 2026-01-19-add-g7-columns.sql [NEW]
```

**Frontend (foundry-dashboard):**
```
apps/foundry-dashboard/src/
├── components/review/
│   ├── G7Badge.tsx            [NEW]
│   └── SpokeCard.tsx          [MODIFY - display G7]
├── server/routers/
│   └── spokes.ts              [MODIFY - include G7 fields]
└── routes/
    └── dashboard/review.tsx   [MODIFY - add G7 filter]
```

### Database Migration Commands

**Execute migrations:**
```bash
cd apps/foundry-dashboard
npx wrangler d1 execute foundry-global-stage --remote --command "$(cat apps/foundry-engine/src/db/migrations/2026-01-19-add-g7-columns.sql)"
```

**Verify migration:**
```bash
npx wrangler d1 execute foundry-global-stage --remote --command "PRAGMA table_info(spokes);"
```

**Fallback:** If wrangler fails with auth error (API token lacks D1 permissions), run SQL in Cloudflare Dashboard → D1 → foundry-global-stage → Console.

### Data Requirements

**Vectorize Seed Data:**
- Source: Top-performing social media content from public APIs
- Niches: Business, Fitness, Finance, Tech, Personal Development
- Minimum: 2,000 hooks per niche (10k total)
- Metadata required: `niche`, `platform`, `avg_engagement_rate`

**Hook Extraction Pattern:**
```typescript
// Extract first 1-2 sentences as "hook"
const extractHook = (spokeContent: string): string => {
  const sentences = spokeContent.split(/[.!?]/);
  return sentences.slice(0, 2).join('. ').trim();
};
```

### Testing Standards

**Unit Tests (Vitest):**
- Test G7 scoring with mock Vectorize responses
- Test threshold logic (edge cases: 7.49, 7.5, 7.51)
- Test feedback generation for failures

**E2E Tests (Playwright):**
- Generate spoke → verify G7 badge appears
- Filter by "Top 10%" → verify correct spokes shown
- Self-Healing Loop with G7 failure → verify regeneration

**Test Priority:** P0 (Critical path for MVP launch)

### Technical Constraints

**Vectorize Limitations:**
- Max 100k vectors per index (sufficient for MVP)
- Query latency ~150-200ms average
- Requires Workers AI text-embedding-ada-002 model

**Workers AI Model:**
- Embedding dimension: 1536
- Input token limit: 8192 tokens (plenty for hooks)
- Cost: $0.0001 per embedding

### Vectorize Namespace Constants

**Recommendation:** Centralize namespace patterns in `apps/foundry-engine/src/vectorize/namespaces.ts`

```typescript
export const VECTORIZE_NAMESPACES = {
  baseline: (niche: string) => `baseline_${niche}`,
  admiredProfiles: (clientId: string) => `client_${clientId}_admired`,
} as const;
```

**Benefits:**
- Prevents typos in namespace strings
- Single source of truth for namespace patterns
- Easier to refactor if pattern changes
- Shared between Story 4.6 and Story 4.7

### Project Structure Notes

**Alignment with project-context.md:**
- ✅ Follows Adversarial Logic (Rule 4)
- ✅ Enforces multi-tenant isolation (Rule 1)
- ✅ Meets performance budget (Rule 2)
- ✅ Uses Midnight Command design tokens (Rule 3)

**No conflicts detected.**

### References

- [Source: _bmad-output/prd.md#G7-Engagement-Prediction]
- [Source: _bmad-output/architecture.md#Quality-Gates]
- [Source: _bmad-output/epics.md#Epic-4-Quality-Assurance]
- [Source: project-context.md#Rule-4-Adversarial-Logic]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
