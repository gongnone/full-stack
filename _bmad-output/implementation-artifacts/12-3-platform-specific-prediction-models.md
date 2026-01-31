# Story 12-3: Platform-Specific Prediction Models

**Epic:** Epic 12 - G7 Engagement Prediction Model
**Status:** ✅ PRODUCTION READY
**Implemented:** 2026-01-31

---

## Story

As a **system**,
I want **platform-specific G7 prediction weights and scoring**,
So that **predictions account for different success factors across Twitter, LinkedIn, Instagram, and TikTok**.

---

## Implementation

### Platform-Specific Configuration (g7-scoring.ts)

**Optimal Content Lengths:**
| Platform | Min | Ideal | Max |
|----------|-----|-------|-----|
| Twitter  | 100 | 220   | 280 |
| LinkedIn | 500 | 1500  | 3000 |
| Instagram| 100 | 800   | 2200 |
| TikTok   | 50  | 150   | 300 |

**Optimal Posting Hours (UTC):**
| Platform | Peak Hours |
|----------|-----------|
| Twitter  | 13, 14, 15, 17, 18 |
| LinkedIn | 12, 13, 17, 18 |
| Instagram| 16, 17, 19 |
| TikTok   | 14, 15, 19, 20, 21 |

**Platform-Specific Scoring Signals:**
- **Twitter:** Thread format detection, hashtag count (1-2 optimal)
- **LinkedIn:** Line breaks for readability, professional tone signals
- **Instagram:** Hashtag count (5-15 optimal), emoji usage
- **TikTok:** Short/punchy content, trending format references

### Existing G7 Scorer (g7-scorer.ts)
- Already uses platform as Vectorize namespace filter
- Admired profiles are per-client, per-platform
- Hook similarity scored against platform-specific winners

---

## Acceptance Criteria

### AC1: Different scoring weights per platform ✅
**Evidence:** `foundry-engine/src/services/g7-scoring.ts:calculatePlatformOptimization()`

### AC2: Platform optimal content lengths ✅
**Evidence:** `PLATFORM_OPTIMAL_LENGTH` config

### AC3: Platform optimal posting times ✅  
**Evidence:** `PLATFORM_OPTIMAL_HOURS` config + `calculateTimingScore()`

### AC4: Platform-specific content signals ✅
**Evidence:** Per-platform scoring in `calculatePlatformOptimization()` (hashtags, formatting, tone)

---

*Document created: 2026-01-31*
