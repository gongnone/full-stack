# Epic 12: G7 Engagement Prediction Model

**Phase:** 2B - The Learning Loop
**Status:** Planning
**Priority:** P1
**Goal:** Score content with predicted engagement before publishing, enabling "Golden Nugget" filtering.

---

## Business Value
The core Foundry promise: surface winning content BEFORE it's published. G7 uses engagement data + Vectorize similarity to predict which spokes will perform best, saving hours of manual review.

---

## Stories

### 12-1: G7 Scoring Algorithm (v1 Heuristic)
**Priority:** P1 | **Effort:** 6-8 hrs
**Description:** Initial G7 scoring using heuristic model. Combines hook similarity, G2 quality score, platform optimization, and timing factors.

**Algorithm:**
```
G7 = (0.4 * hook_similarity_to_winners) +
     (0.3 * G2_quality_score) +
     (0.2 * platform_length_optimization) +
     (0.1 * timing_factor)
```

**Acceptance Criteria:**
- AC1: G7 score (0-10) calculated for every spoke
- AC2: Score stored in spoke record (ClientAgent DO)
- AC3: Calculation runs as final pipeline step (after G6)
- AC4: Scores update when new engagement data arrives
- AC5: Score breakdown available (which factors contributed)

---

### 12-2: Vectorize Hook Database (10K+ hooks)
**Priority:** P1 | **Effort:** 4-6 hrs
**Description:** Seed Vectorize index with high-performing hooks from public datasets and client history.

**Acceptance Criteria:**
- AC1: Vectorize index `winning-hooks` created
- AC2: Seeded with 10K+ proven hooks (curated dataset)
- AC3: Client's own top performers added automatically
- AC4: Cosine similarity search returns top 5 similar winners
- AC5: Index updates as new engagement data arrives

---

### 12-3: Platform-Specific Prediction Models
**Priority:** P1 | **Effort:** 4-6 hrs
**Description:** Adjust G7 weights per platform (Twitter favors hooks, LinkedIn favors depth, etc.)

---

### 12-4: G7 Score Display in Review UI
**Priority:** P1 | **Effort:** 2-3 hrs
**Description:** Show G7 prediction score on spoke cards in review queue.

**Acceptance Criteria:**
- AC1: G7 score badge on each spoke card (color-coded)
- AC2: Score breakdown tooltip (hover to see factors)
- AC3: Sort by G7 score option in review queue
- AC4: "Beta" label while model is training

---

### 12-5: "Golden Nugget" Filter (G7 > 9)
**Priority:** P1 | **Effort:** 2-3 hrs
**Description:** One-click filter to show only top-predicted content.

**Acceptance Criteria:**
- AC1: "🏆 Golden Nuggets" filter button in review queue
- AC2: Shows only spokes with G7 > 9
- AC3: Bulk approve all Golden Nuggets action
- AC4: Count badge shows how many Golden Nuggets exist

---

### 12-6: Model Accuracy Tracking
**Priority:** P2 | **Effort:** 3-4 hrs
**Description:** Track predicted vs actual engagement to measure model accuracy over time.

---

## Dependencies
- Epic 11 (Engagement Data) must be partially complete (at least 11-4 schema)
- Existing Vectorize infrastructure (already in architecture)
- G2/G6 scores already in spoke pipeline

---

## Sprint Plan
- Start after Epic 11-4 (schema) is complete
- Stories 12-1, 12-4, 12-5 can begin with heuristic model (no engagement data needed)
- Stories 12-2, 12-3, 12-6 require engagement data flowing
