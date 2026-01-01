# Story 12-2: Vectorize Hook Database

**Epic:** 12 - G7 Engagement Prediction Model
**Status:** ✅ Complete
**Date:** 2026-01-01

## Summary

Implemented the Vectorize hook database infrastructure for G7 engagement prediction. This enables cosine similarity scoring against 10K+ high-performing hooks to predict content engagement before publishing.

## Deliverables

### 1. Database Schema
**File:** `migrations/0022_hook_database.sql`
- `hooks` table for hook metadata (content, platform, category, performance tier)
- `hook_categories` table with 8 predefined categories
- `hook_similarity_log` table for analytics tracking
- Indexes for efficient queries by platform, category, and performance

### 2. HookDatabaseService
**File:** `worker/lib/hook-database.ts`
- Vectorize embedding generation using `@cf/baai/bge-base-en-v1.5`
- `addHook()` - Add single hook with auto-analysis
- `addHooksBatch()` - Batch insert with rate limiting
- `findSimilar()` - Cosine similarity search in Vectorize
- `getG7SimilarityScore()` - Weighted score based on match performance tiers
- `logSimilaritySearch()` - Analytics logging

### 3. tRPC Router
**File:** `worker/trpc/routers/hooks.ts`
- `hooks.findSimilar` - Find similar hooks for any content
- `hooks.getG7Score` - Get 0-10 G7 similarity score
- `hooks.addHook` - Add single hook (authenticated)
- `hooks.addHooksBatch` - Batch add hooks (authenticated)
- `hooks.getStats` - Database statistics
- `hooks.getCategories` - List categories with counts
- `hooks.promoteToHookDatabase` - Promote approved spokes

### 4. Enhanced G7 Prediction
**File:** `worker/lib/engagement-prediction.ts`
- `predictEngagementEnhanced()` - G7 with Vectorize similarity
- `vectorSimilarity` factor (0-2.5 contribution)
- Confidence levels based on match quality
- Feedback includes similarity to viral/high-performing content

### 5. Seed Data
**File:** `src/lib/hook-seed-data.ts`
- 77 curated hooks across platforms and categories
- Twitter (30), LinkedIn (20), TikTok/Instagram (20), YouTube (10), Carousel (10)
- Viral (15), High (40), Curated (22) performance tiers
- Pre-analyzed: word count, questions, numbers, CTAs, emotional intensity

### 6. Seeding Script
**File:** `scripts/seed-hooks.ts`
- Sample hooks for initial database population
- Batch processing with rate limiting

## G7 Algorithm (v2 with Vectorize)

```
G7 = (vectorSimilarity * 2.5) +
     (hookHeuristics * 2.5) +
     (platformOptimization * 2.5) +
     (contentSignals * 2.0) +
     (emotionalIntensity * 1.5) +
     (engagementDrivers * 1.5)

// Normalized to 0-10 scale (max raw = 12.5)
```

- **vectorSimilarity**: Cosine similarity to top performers, weighted by tier
- **Tier weights**: viral (1.0), high (0.85), curated (0.7), community (0.55)
- **Confidence levels**: high (≥3 top-tier, ≥0.75 avg), medium (≥1 top-tier, ≥0.65 avg), low (fallback)

## Acceptance Criteria

- [x] AC1: Vectorize binding exists in wrangler.jsonc
- [x] AC2: Hook metadata stored in D1 with proper schema
- [x] AC3: Embedding generation using Workers AI
- [x] AC4: Similarity search returns top-K matches
- [x] AC5: G7 score incorporates Vectorize similarity
- [x] AC6: Seed data includes 50+ curated hooks
- [x] AC7: tRPC endpoints for hook operations

## Next Steps

1. Run migration: `wrangler d1 migrations apply foundry-global-stage --env stage`
2. Seed hooks via tRPC endpoint or script
3. Monitor Vectorize query latency in production
4. Expand hook database as users approve content

## Technical Notes

- Vectorize index: `foundry-embeddings` (768 dimensions, cosine metric)
- Embedding model: `@cf/baai/bge-base-en-v1.5`
- Hook categories: business, tech, finance, health, lifestyle, marketing, creative, education
- Platform support: twitter, linkedin, instagram, tiktok, newsletter, thread, carousel
