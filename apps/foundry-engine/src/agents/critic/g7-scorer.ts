/**
 * G7 Engagement Prediction Scorer
 *
 * Hybrid scoring approach:
 * - Priority Tier: Client-curated admired profiles (Instagram)
 * - Baseline Tier: Generic high-performing hooks by niche
 *
 * Weighted blending:
 * - 5+ profiles: 70% admired / 30% baseline
 * - 1-4 profiles: 50% admired / 50% baseline
 * - 0 profiles: 100% baseline
 */

import { VECTORIZE_NAMESPACES } from '../../vectorize/namespaces';

export interface G7ScoringResult {
  g7Score: number; // Final score 0-10
  g7Benchmark: number; // Avg engagement rate from similar hooks
  g7Source: string; // e.g., "70% admired, 30% baseline"
  stoppingPower: number; // Similarity to proven winners 0-10
  novelty: number; // Differentiation from clichés 0-10
}

export interface BrandDNA {
  niche: string; // e.g., 'business', 'fitness', 'finance'
  [key: string]: unknown;
}

export interface Spoke {
  id: string;
  content: string;
  platform: string;
  [key: string]: unknown;
}

/**
 * Extract hook (first 1-2 sentences) from spoke content
 * Preserves original punctuation marks
 */
export function extractHook(spokeContent: string): string {
  // Match sentences ending with . ! or ? (including trailing space)
  const sentenceRegex = /[^.!?]+[.!?]+\s*/g;
  const sentences = spokeContent.match(sentenceRegex) || [spokeContent];

  // Return first 2 sentences, trim to remove trailing space from last sentence
  return sentences.slice(0, 2).join('').trim();
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Calculate Stopping Power score (similarity to top performers)
 * @param hookEmbedding - Embedding vector of the spoke's hook
 * @param topHooks - Top matching hooks from Vectorize
 * @returns Score 0-10
 */
function calculateStoppingPower(
  hookEmbedding: number[],
  topHooks: Array<{ values?: number[]; metadata: Record<string, unknown>; score: number }>
): number {
  if (topHooks.length === 0) return 5; // Default mid-score if no data

  // Use Vectorize similarity scores directly (already cosine similarity)
  const topSimilarities = topHooks
    .slice(0, 10)
    .map(hook => hook.score);

  // Average similarity * 10 = score 0-10
  const avgSimilarity = topSimilarities.reduce((sum, sim) => sum + sim, 0) / topSimilarities.length;

  // Scale from [0, 1] to [0, 10]
  return Math.min(10, Math.max(0, avgSimilarity * 10));
}

/**
 * Calculate Novelty score (differentiation from overused patterns)
 * @param hookEmbedding - Embedding vector of the spoke's hook
 * @param allHooks - All matching hooks from Vectorize
 * @returns Score 0-10
 */
function calculateNovelty(
  hookEmbedding: number[],
  allHooks: Array<{ values?: number[]; metadata: Record<string, unknown>; score: number }>
): number {
  if (allHooks.length === 0) return 5; // Default mid-score if no data

  // Check similarity to bottom-scoring hooks (least similar = potential clichés)
  const bottomHooks = allHooks.slice(-20);
  const clicheSimilarities = bottomHooks.map(hook => hook.score);

  const avgClicheSimilarity = clicheSimilarities.reduce((sum, sim) => sum + sim, 0) / clicheSimilarities.length;

  // Novelty is inverse of cliché similarity
  // High similarity to clichés = low novelty
  const novelty = 1 - avgClicheSimilarity;

  // Scale from [0, 1] to [0, 10]
  return Math.min(10, Math.max(0, novelty * 10));
}

/**
 * Calculate average engagement rate from top hooks
 */
function calculateBenchmark(
  topHooks: Array<{ metadata: Record<string, unknown>; score: number }>
): number {
  const engagementRates = topHooks
    .map(hook => hook.metadata?.engagementRate as number | undefined)
    .filter((rate): rate is number => rate !== undefined);

  if (engagementRates.length === 0) return 0.042; // Default 4.2%

  return engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length;
}

export interface VectorizeClient {
  query: (params: {
    namespace: string;
    vector: number[];
    topK: number;
  }) => Promise<Array<{ values: number[]; metadata: Record<string, unknown> }>>;
}

export interface WorkersAI {
  run: (model: string, params: { text: string }) => Promise<{ data: number[][] }>;
}

/**
 * Score engagement for a spoke using hybrid approach
 *
 * @param spoke - The spoke to evaluate
 * @param brandDNA - Brand DNA containing niche information
 * @param clientId - Client ID for namespace isolation
 * @param vectorize - Vectorize client
 * @param ai - Workers AI client
 * @returns G7 scoring result
 */
export async function scoreEngagement(
  spoke: Spoke,
  brandDNA: BrandDNA,
  clientId: string,
  vectorize: VectorizeClient,
  ai: WorkersAI
): Promise<G7ScoringResult> {
  // Extract hook from spoke content
  const hook = extractHook(spoke.content);

  // Generate embedding for the hook
  const embeddingResult = await ai.run('@cf/baai/bge-base-en-v1.5', {
    text: hook,
  });
  const hookEmbedding = embeddingResult.data[0];

  // Query admired profiles namespace
  const admiredNamespace = VECTORIZE_NAMESPACES.admiredProfiles(clientId);
  const admiredResult = await vectorize.query(hookEmbedding, {
    namespace: admiredNamespace,
    topK: 50,
    returnMetadata: 'all',
  });
  let admiredHooks = (admiredResult.matches || []).map(m => ({
    values: m.values || hookEmbedding, // fallback if values not returned
    metadata: (m.metadata || {}) as Record<string, unknown>,
    score: m.score,
  }));

  // Query baseline namespace
  const baselineNamespace = VECTORIZE_NAMESPACES.baseline(brandDNA.niche);
  const baselineResult = await vectorize.query(hookEmbedding, {
    namespace: baselineNamespace,
    topK: 50,
    returnMetadata: 'all',
  });
  let baselineHooks = (baselineResult.matches || []).map(m => ({
    values: m.values || hookEmbedding,
    metadata: (m.metadata || {}) as Record<string, unknown>,
    score: m.score,
  }));

  console.log(`[G7] admired=${admiredHooks.length} baseline=${baselineHooks.length} admiredRaw=${JSON.stringify(admiredResult).substring(0,200)} baselineRaw=${JSON.stringify(baselineResult).substring(0,200)}`);

  // QR-1 fix: If namespaced queries return empty, fall back to global hook database
  if (admiredHooks.length === 0 && baselineHooks.length === 0) {
    const globalResult = await vectorize.query(hookEmbedding, {
      topK: 50,
      returnMetadata: 'all',
    });
    console.log(`[G7] globalFallback matches=${globalResult.matches?.length} count=${globalResult.count} raw=${JSON.stringify(globalResult).substring(0,300)}`);
    const globalHooks = (globalResult.matches || []).map(m => ({
      values: m.values || hookEmbedding,
      metadata: (m.metadata || {}) as Record<string, unknown>,
      score: m.score,
    }));
    if (globalHooks.length > 0) {
      baselineHooks = globalHooks;
    }
  }

  // If still no data, default pass
  if (admiredHooks.length === 0 && baselineHooks.length === 0) {
    return {
      g7Score: 7.5,
      g7Benchmark: 0.042,
      g7Source: 'no-data-default-pass',
      stoppingPower: 7.5,
      novelty: 7.5,
    };
  }

  // Determine weighting based on admired profile count
  const admiredCount = admiredHooks.length;
  let admiredWeight: number;
  let baselineWeight: number;

  if (admiredCount >= 5) {
    admiredWeight = 0.7;
    baselineWeight = 0.3;
  } else if (admiredCount >= 1) {
    admiredWeight = 0.5;
    baselineWeight = 0.5;
  } else {
    admiredWeight = 0;
    baselineWeight = 1.0;
  }

  // Calculate tier-specific scores
  const admiredStoppingPower = admiredCount > 0
    ? calculateStoppingPower(hookEmbedding, admiredHooks)
    : 0;
  const admiredNovelty = admiredCount > 0
    ? calculateNovelty(hookEmbedding, admiredHooks)
    : 0;

  const baselineStoppingPower = calculateStoppingPower(hookEmbedding, baselineHooks);
  const baselineNovelty = calculateNovelty(hookEmbedding, baselineHooks);

  // Weighted blending of scores
  const stoppingPower =
    (admiredStoppingPower * admiredWeight) +
    (baselineStoppingPower * baselineWeight);

  const novelty =
    (admiredNovelty * admiredWeight) +
    (baselineNovelty * baselineWeight);

  // Final G7 score = (Stopping Power × 0.7) + (Novelty × 0.3)
  const g7Score = (stoppingPower * 0.7) + (novelty * 0.3);

  // Calculate benchmark from both tiers
  const admiredBenchmark = admiredCount > 0
    ? calculateBenchmark(admiredHooks)
    : 0;
  const baselineBenchmark = calculateBenchmark(baselineHooks);
  const g7Benchmark =
    (admiredBenchmark * admiredWeight) +
    (baselineBenchmark * baselineWeight);

  // Format source breakdown
  const g7Source = admiredCount === 0
    ? '100% baseline'
    : `${Math.round(admiredWeight * 100)}% admired, ${Math.round(baselineWeight * 100)}% baseline`;

  return {
    g7Score,
    g7Benchmark,
    g7Source,
    stoppingPower,
    novelty,
  };
}
