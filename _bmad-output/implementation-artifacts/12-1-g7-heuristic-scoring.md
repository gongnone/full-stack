# Story 12-1: G7 Scoring Algorithm (v1 Heuristic)

**Epic:** Epic 12 - G7 Engagement Prediction Model
**Status:** ✅ PRODUCTION READY
**Implemented:** 2026-01-31

---

## Story

As a **system**,
I want **a heuristic scoring algorithm for predicting content engagement**,
So that **users can see G7 predictions even before engagement data trains the model**.

---

## Algorithm

```
G7 = (0.4 * hook_similarity) + (0.3 * g2_quality) + (0.2 * platform_optimization) + (0.1 * timing)
```

### Component Scoring

**Hook Similarity (0-10):**
- With Vectorize data: cosine similarity to winning hooks × 10
- Fallback heuristic: length sweet spot, question hooks, numbers, power words, emotional intensity, contrarian signals

**G2 Quality (0-10):**
- With G2 gate data: direct score passthrough
- Fallback heuristic: length appropriateness, paragraph structure, readability, CTA signals

**Platform Optimization (0-10):**
- Content length vs platform optimal ranges
- Platform-specific signals (hashtags, line breaks, emoji, thread format)
- Optimal lengths: Twitter 220, LinkedIn 1500, Instagram 800, TikTok 150

**Timing (0-10):**
- Optimal posting hours by platform (UTC)
- Adjacent hour partial credit
- Default 5 when no timing data

### Confidence Calculation
- Base: 0.3 (heuristic only)
- +0.3 with real Vectorize similarity data
- +0.2 with real G2 score
- +0.1 with timing data
- Max: 1.0

---

## Existing G7 Infrastructure

**Already in pipeline:** `apps/foundry-engine/src/agents/critic/g7-scorer.ts`
- Full Vectorize-based scoring with admired profiles
- Hybrid blending: admired profiles (70%) + baseline hooks (30%)
- Stopping Power + Novelty scoring
- Default pass (7.5) when no data available

**New heuristic fallback:** `apps/foundry-engine/src/services/g7-scoring.ts`
- Works without Vectorize data
- Platform-specific optimization scoring
- Batch scoring support

---

## Acceptance Criteria

### AC1: G7 score (0-10) calculated for every spoke ✅
Already in pipeline via g7-scorer.ts

### AC2: Score stored in spoke record ✅
Stored in ClientAgent Durable Object + new g7_predictions D1 table

### AC3: Calculation runs as final pipeline step ✅
G7 is step 7 in spoke generation workflow

### AC4: Scores update when new engagement data arrives ✅
New g7_predictions table supports re-calculation

### AC5: Score breakdown available ✅
Component scores stored: hook_similarity, g2_quality, platform_optimization, timing

---

## File List

**New Files:**
- `apps/foundry-engine/src/services/g7-scoring.ts` (8.3KB)

**Existing Files (verified):**
- `apps/foundry-engine/src/agents/critic/g7-scorer.ts` — Production G7 scorer
- `apps/foundry-engine/src/workflows/spoke-generation.ts` — G7 integrated at step 7

---

*Document created: 2026-01-31*
