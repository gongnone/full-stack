/**
 * Hook Database Service - Epic 12-2
 *
 * Manages high-performing hooks in Vectorize for G7 engagement prediction.
 * Uses semantic similarity to find hooks similar to generated content.
 */

import type { VectorizeIndex, VectorizeVectorMetadata, Ai, D1Database } from '@cloudflare/workers-types';

// Embedding model configuration (matches agent-logic/config.ts)
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const HOOK_NAMESPACE = 'hooks'; // Metadata type for filtering

export interface HookData {
  id: string;
  content: string;
  platform: string;
  category: string;
  engagementRate?: number;
  performanceTier: 'viral' | 'high' | 'curated' | 'community';
  wordCount: number;
  characterCount: number;
  hasQuestion: boolean;
  hasNumbers: boolean;
  hasCta: boolean;
  emotionalIntensity?: 'high' | 'medium' | 'low';
  psychologicalAngle?: string;
  source?: string;
  sourceUrl?: string;
}

export interface HookMatch {
  hookId: string;
  content: string;
  platform: string;
  category: string;
  performanceTier: string;
  score: number;
  engagementRate?: number;
}

export interface HookSearchResult {
  matches: HookMatch[];
  queryLatencyMs: number;
  topScore: number;
}

/**
 * Generate embedding for text using Workers AI
 */
export async function embedHookText(text: string, ai: Ai): Promise<number[]> {
  const response = await ai.run(EMBEDDING_MODEL, { text });
  return (response as { data: number[][] }).data[0];
}

/**
 * Ingest a single hook into Vectorize and D1
 */
export async function ingestHook(
  hook: HookData,
  vectorize: VectorizeIndex,
  db: D1Database,
  ai: Ai
): Promise<string> {
  const now = Date.now();

  // Generate embedding
  const embedding = await embedHookText(hook.content, ai);

  // Create vectorize ID
  const vectorizeId = `hook_${hook.id}`;

  // Upsert to Vectorize with metadata
  await vectorize.upsert([{
    id: vectorizeId,
    values: embedding,
    metadata: {
      type: HOOK_NAMESPACE,
      hookId: hook.id,
      content: hook.content.substring(0, 500), // Truncate for metadata limits
      platform: hook.platform,
      category: hook.category,
      performanceTier: hook.performanceTier,
      engagementRate: hook.engagementRate ?? 0,
    }
  }]);

  // Insert/update D1 record
  await db.prepare(`
    INSERT OR REPLACE INTO hooks (
      id, content, platform, category, engagement_rate, performance_tier,
      word_count, character_count, has_question, has_numbers, has_cta,
      emotional_intensity, psychological_angle, source, source_url,
      vectorize_id, embedding_model, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    hook.id,
    hook.content,
    hook.platform,
    hook.category,
    hook.engagementRate ?? null,
    hook.performanceTier,
    hook.wordCount,
    hook.characterCount,
    hook.hasQuestion ? 1 : 0,
    hook.hasNumbers ? 1 : 0,
    hook.hasCta ? 1 : 0,
    hook.emotionalIntensity ?? null,
    hook.psychologicalAngle ?? null,
    hook.source ?? 'seed_data',
    hook.sourceUrl ?? null,
    vectorizeId,
    EMBEDDING_MODEL,
    now,
    now
  ).run();

  return vectorizeId;
}

/**
 * Bulk ingest hooks (more efficient for seeding)
 */
export async function bulkIngestHooks(
  hooks: HookData[],
  vectorize: VectorizeIndex,
  db: D1Database,
  ai: Ai,
  batchSize = 50
): Promise<{ ingested: number; errors: string[] }> {
  const errors: string[] = [];
  let ingested = 0;

  // Process in batches
  for (let i = 0; i < hooks.length; i += batchSize) {
    const batch = hooks.slice(i, i + batchSize);

    // Generate embeddings for batch
    const vectors: Array<{
      id: string;
      values: number[];
      metadata: Record<string, VectorizeVectorMetadata>;
    }> = [];

    for (const hook of batch) {
      try {
        const embedding = await embedHookText(hook.content, ai);
        const vectorizeId = `hook_${hook.id}`;

        vectors.push({
          id: vectorizeId,
          values: embedding,
          metadata: {
            type: HOOK_NAMESPACE,
            hookId: hook.id,
            content: hook.content.substring(0, 500),
            platform: hook.platform,
            category: hook.category,
            performanceTier: hook.performanceTier,
            engagementRate: hook.engagementRate ?? 0,
          }
        });
      } catch (error) {
        errors.push(`Failed to embed hook ${hook.id}: ${error}`);
      }
    }

    // Upsert vectors to Vectorize
    if (vectors.length > 0) {
      await vectorize.upsert(vectors);
    }

    // Batch insert to D1
    const now = Date.now();
    const stmts = batch.map(hook =>
      db.prepare(`
        INSERT OR REPLACE INTO hooks (
          id, content, platform, category, engagement_rate, performance_tier,
          word_count, character_count, has_question, has_numbers, has_cta,
          emotional_intensity, psychological_angle, source, source_url,
          vectorize_id, embedding_model, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        hook.id,
        hook.content,
        hook.platform,
        hook.category,
        hook.engagementRate ?? null,
        hook.performanceTier,
        hook.wordCount,
        hook.characterCount,
        hook.hasQuestion ? 1 : 0,
        hook.hasNumbers ? 1 : 0,
        hook.hasCta ? 1 : 0,
        hook.emotionalIntensity ?? null,
        hook.psychologicalAngle ?? null,
        hook.source ?? 'seed_data',
        hook.sourceUrl ?? null,
        `hook_${hook.id}`,
        EMBEDDING_MODEL,
        now,
        now
      )
    );

    await db.batch(stmts);
    ingested += batch.length;
  }

  // Update category counts
  await db.prepare(`
    UPDATE hook_categories SET hook_count = (
      SELECT COUNT(*) FROM hooks WHERE category = hook_categories.name
    )
  `).run();

  return { ingested, errors };
}

/**
 * Search for similar hooks using Vectorize
 */
export async function searchSimilarHooks(
  queryContent: string,
  vectorize: VectorizeIndex,
  ai: Ai,
  options: {
    platform?: string;
    category?: string;
    topK?: number;
    minScore?: number;
  } = {}
): Promise<HookSearchResult> {
  const startTime = Date.now();
  const { platform, category, topK = 10, minScore = 0.5 } = options;

  // Generate query embedding
  const queryEmbedding = await embedHookText(queryContent, ai);

  // Build filter
  const filter: Record<string, unknown> = { type: HOOK_NAMESPACE };
  if (platform) filter.platform = platform;
  if (category) filter.category = category;

  // Query Vectorize
  const results = await vectorize.query(queryEmbedding, {
    topK,
    returnMetadata: 'all',
    filter,
  });

  const queryLatencyMs = Date.now() - startTime;

  // Transform results
  const matches: HookMatch[] = results.matches
    .filter(match => match.score >= minScore)
    .map(match => ({
      hookId: (match.metadata as Record<string, unknown>)?.hookId as string || match.id,
      content: (match.metadata as Record<string, unknown>)?.content as string || '',
      platform: (match.metadata as Record<string, unknown>)?.platform as string || '',
      category: (match.metadata as Record<string, unknown>)?.category as string || '',
      performanceTier: (match.metadata as Record<string, unknown>)?.performanceTier as string || 'curated',
      score: match.score,
      engagementRate: (match.metadata as Record<string, unknown>)?.engagementRate as number | undefined,
    }));

  return {
    matches,
    queryLatencyMs,
    topScore: matches.length > 0 ? matches[0].score : 0,
  };
}

/**
 * Calculate G7 hook similarity component
 * Returns a score 0-10 based on similarity to high-performing hooks
 */
export async function calculateHookSimilarity(
  content: string,
  platform: string,
  vectorize: VectorizeIndex,
  ai: Ai
): Promise<{
  score: number;
  confidence: 'low' | 'medium' | 'high';
  topMatch?: HookMatch;
}> {
  const result = await searchSimilarHooks(content, vectorize, ai, {
    platform,
    topK: 5,
    minScore: 0.3,
  });

  if (result.matches.length === 0) {
    return { score: 5.0, confidence: 'low' }; // Neutral score if no matches
  }

  // Weight by performance tier
  const tierWeights: Record<string, number> = {
    viral: 1.5,
    high: 1.2,
    curated: 1.0,
    community: 0.8,
  };

  // Calculate weighted average similarity
  let totalWeight = 0;
  let weightedSum = 0;

  for (const match of result.matches) {
    const tierWeight = tierWeights[match.performanceTier] || 1.0;
    const weight = match.score * tierWeight;
    weightedSum += match.score * 10 * weight; // Scale to 0-10
    totalWeight += weight;
  }

  const score = totalWeight > 0 ? weightedSum / totalWeight : 5.0;

  // Determine confidence based on match quality
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (result.matches.length >= 3 && result.topScore >= 0.7) {
    confidence = 'high';
  } else if (result.matches.length >= 2 && result.topScore >= 0.5) {
    confidence = 'medium';
  }

  return {
    score: Math.min(10, Math.max(0, score)),
    confidence,
    topMatch: result.matches[0],
  };
}

/**
 * Log a similarity search for analytics
 */
export async function logSimilaritySearch(
  clientId: string,
  queryContent: string,
  queryPlatform: string | null,
  result: HookSearchResult,
  db: D1Database
): Promise<void> {
  await db.prepare(`
    INSERT INTO hook_similarity_log (
      id, client_id, query_content, query_platform,
      top_match_id, top_match_score, match_count, latency_ms, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    clientId,
    queryContent.substring(0, 1000), // Truncate for storage
    queryPlatform,
    result.matches.length > 0 ? result.matches[0].hookId : null,
    result.topScore,
    result.matches.length,
    result.queryLatencyMs,
    Date.now()
  ).run();
}

/**
 * Get hook statistics
 */
export async function getHookStats(db: D1Database): Promise<{
  totalHooks: number;
  byPlatform: Record<string, number>;
  byCategory: Record<string, number>;
  byTier: Record<string, number>;
}> {
  const [total, platforms, categories, tiers] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM hooks').first<{ count: number }>(),
    db.prepare('SELECT platform, COUNT(*) as count FROM hooks GROUP BY platform').all<{ platform: string; count: number }>(),
    db.prepare('SELECT category, COUNT(*) as count FROM hooks GROUP BY category').all<{ category: string; count: number }>(),
    db.prepare('SELECT performance_tier, COUNT(*) as count FROM hooks GROUP BY performance_tier').all<{ performance_tier: string; count: number }>(),
  ]);

  return {
    totalHooks: total?.count ?? 0,
    byPlatform: Object.fromEntries(platforms.results.map(r => [r.platform, r.count])),
    byCategory: Object.fromEntries(categories.results.map(r => [r.category, r.count])),
    byTier: Object.fromEntries(tiers.results.map(r => [r.performance_tier, r.count])),
  };
}
