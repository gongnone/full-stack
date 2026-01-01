# Story 12-2: Vectorize Hook Database (10K+ Hooks)

**Epic:** 12 - G7 Engagement Prediction Model
**Priority:** P1
**Status:** in_progress
**Effort:** 4-6 hours
**Created:** 2026-01-01

---

## User Story

**As a** content creator,
**I want** the system to compare my content hooks against a database of 10,000+ high-performing hooks,
**So that** I can get accurate engagement predictions before publishing.

## Context

The G7 Engagement Prediction algorithm (Story 12-1) uses cosine similarity against a Vectorize index of top-performing hooks. This story creates and seeds that hook database, providing the foundation for accurate engagement prediction.

From the architecture document:
> G7 uses cosine similarity against Vectorize index of top performers

## Acceptance Criteria

### AC1: Hook Database Schema
- [ ] Create `hooks` table in D1 to store hook metadata
- [ ] Schema includes: id, platform, hook_text, engagement_score, source_url, created_at
- [ ] Platform enum: twitter, linkedin, tiktok, instagram, youtube
- [ ] Engagement score normalized 0-100

### AC2: Vectorize Index for Hooks
- [ ] Create shared namespace `hooks` in foundry-embeddings Vectorize index
- [ ] Embeddings generated using @cf/baai/bge-base-en-v1.5 (same as existing)
- [ ] Metadata includes: platform, engagement_score, hook_id
- [ ] Can query by platform filter + vector similarity

### AC3: Seed Data Pipeline
- [ ] Create seed script that imports curated high-performing hooks
- [ ] Initial seed: 1,000+ hooks across platforms (Twitter, LinkedIn, TikTok)
- [ ] Each hook has verified engagement score (likes/RTs/shares normalized)
- [ ] Script can be re-run to add more hooks incrementally

### AC4: Hook Query Service
- [ ] tRPC endpoint: `hooks.findSimilar({ text, platform?, limit: 5 })`
- [ ] Returns top N similar hooks with similarity scores
- [ ] Optional platform filter for platform-specific comparison
- [ ] Used by G7 scoring algorithm (Story 12-1)

### AC5: Hook Similarity Calculation
- [ ] Generate embedding for input text
- [ ] Query Vectorize with vector + optional platform metadata filter
- [ ] Return similarity scores (0-1 cosine similarity)
- [ ] Average similarity across top 5 = hook_similarity_score for G7

### AC6: Hook Management API (Admin Only)
- [ ] Admin-only tRPC mutation: `hooks.add({ platform, hook_text, engagement_score })`
- [ ] Generates embedding on insert
- [ ] Upserts to both D1 and Vectorize
- [ ] Bulk import endpoint for seeding

## Technical Implementation

### Database Migration
```sql
-- Migration: 0021_hooks_database.sql
CREATE TABLE hooks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'tiktok', 'instagram', 'youtube')),
  hook_text TEXT NOT NULL,
  engagement_score INTEGER NOT NULL CHECK (engagement_score >= 0 AND engagement_score <= 100),
  source_url TEXT,
  category TEXT, -- optional: question, statistic, story, controversial, etc.
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_hooks_platform ON hooks(platform);
CREATE INDEX idx_hooks_engagement ON hooks(engagement_score DESC);
```

### Vectorize Upsert Pattern
```typescript
// worker/services/hooks.ts
async function addHook(hook: { platform: string; hook_text: string; engagement_score: number }) {
  const id = crypto.randomUUID();

  // Generate embedding
  const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: hook.hook_text,
  });

  // Store in D1
  await db.insertInto('hooks').values({ id, ...hook }).execute();

  // Store in Vectorize (shared namespace for all hooks)
  await env.EMBEDDINGS.upsert([{
    id: `hook-${id}`,
    values: embedding.data[0],
    metadata: {
      platform: hook.platform,
      engagement_score: hook.engagement_score,
      hook_id: id,
    },
    namespace: 'hooks',  // Shared namespace, not per-client
  }]);
}
```

### Query Similar Hooks
```typescript
async function findSimilarHooks(text: string, platform?: string, limit = 5) {
  // Generate embedding for query text
  const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text,
  });

  // Query Vectorize
  const results = await env.EMBEDDINGS.query(embedding.data[0], {
    topK: limit,
    namespace: 'hooks',
    filter: platform ? { platform: { $eq: platform } } : undefined,
    returnMetadata: true,
  });

  return results.matches.map(match => ({
    hookId: match.metadata?.hook_id,
    platform: match.metadata?.platform,
    engagementScore: match.metadata?.engagement_score,
    similarity: match.score,
  }));
}
```

## Seed Data Categories

Initial 1,000 hooks sourced from:
1. **Viral Twitter threads** - Opening hooks from threads with 10K+ likes
2. **LinkedIn top posts** - Opening lines from posts with 1K+ reactions
3. **TikTok trends** - Captions from videos with 100K+ views
4. **Content marketing studies** - Published hook effectiveness research

Categories to include:
- Questions (curiosity gaps)
- Statistics/numbers
- Controversial statements
- Story openers ("I almost quit...")
- Pattern interrupts
- Authority signals

## Dependencies

- Story 12-1 (G7 Algorithm) uses this hook database for similarity scoring
- Existing Vectorize index `foundry-embeddings` (already configured)
- Workers AI @cf/baai/bge-base-en-v1.5 (already in use)

## Testing

### Integration Tests
- [ ] Hook insertion persists to D1 and Vectorize
- [ ] Similar hook query returns ranked results
- [ ] Platform filter works correctly
- [ ] Similarity scores are valid (0-1 range)

### Performance
- [ ] Hook query < 200ms (Vectorize is fast)
- [ ] Bulk insert 100 hooks < 30 seconds

## Notes

- Start with 1,000 curated hooks, expand to 10K+ post-MVP
- Hooks are global (not per-client) - this is intentional for G7
- Consider adding hook categories for more nuanced scoring later
- Engagement scores should be normalized per-platform (Twitter scale != LinkedIn scale)
