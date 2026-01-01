/**
 * Epic 12-2: Vectorize Hook Database Service
 *
 * Manages the 10K+ hook database used for G7 engagement prediction.
 * Hooks are stored in:
 * - D1: Metadata (content, platform, category, performance)
 * - Vectorize: Embeddings for similarity search
 *
 * The G7 algorithm uses cosine similarity against top-performing hooks
 * to predict engagement potential before publishing.
 */

// Use crypto.randomUUID() for ID generation (available in Workers runtime)

// Types for hook database
export type HookPlatform =
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'tiktok'
  | 'newsletter'
  | 'thread'
  | 'carousel';

export type HookCategory =
  | 'business'
  | 'tech'
  | 'finance'
  | 'health'
  | 'lifestyle'
  | 'marketing'
  | 'creative'
  | 'education';

export type PerformanceTier = 'viral' | 'high' | 'curated' | 'community';

export type EmotionalIntensity = 'high' | 'medium' | 'low';

export type PsychologicalAngle =
  | 'Contrarian'
  | 'Authority'
  | 'Urgency'
  | 'Aspiration'
  | 'Fear'
  | 'Curiosity'
  | 'Transformation'
  | 'Rebellion';

export interface Hook {
  id: string;
  content: string;
  platform: HookPlatform;
  category: HookCategory;
  engagementRate: number | null;
  performanceTier: PerformanceTier;
  wordCount: number;
  characterCount: number;
  hasQuestion: boolean;
  hasNumbers: boolean;
  hasCta: boolean;
  emotionalIntensity: EmotionalIntensity | null;
  psychologicalAngle: PsychologicalAngle | null;
  source: 'external' | 'user_approved' | 'generated';
  sourceUrl: string | null;
  vectorizeId: string;
  createdAt: number;
}

export interface HookSimilarityMatch {
  hookId: string;
  content: string;
  platform: HookPlatform;
  category: HookCategory;
  performanceTier: PerformanceTier;
  similarity: number; // 0-1 cosine similarity
  engagementRate: number | null;
}

export interface SimilaritySearchResult {
  matches: HookSimilarityMatch[];
  avgSimilarity: number;
  topTierMatches: number; // Count of viral/high tier matches
  queryLatencyMs: number;
}

export interface AddHookInput {
  content: string;
  platform: HookPlatform;
  category: HookCategory;
  engagementRate?: number;
  performanceTier?: PerformanceTier;
  source?: 'external' | 'user_approved' | 'generated';
  sourceUrl?: string;
  psychologicalAngle?: PsychologicalAngle;
}

// Content analysis patterns (shared with engagement-prediction.ts)
const NUMBER_PATTERNS = [
  /\d+%/,
  /\$\d+/,
  /\d+x/,
  /\d+\s*(?:million|billion|k|K)/,
  /top\s+\d+/i,
  /\d+\s+(?:tips|ways|reasons|steps|things|mistakes|secrets)/i,
];

const CTA_PATTERNS = [
  /\bfollow\s+(?:me|for|to)\b/i,
  /\bshare\s+(?:this|if|with)\b/i,
  /\bsave\s+(?:this|for)\b/i,
  /\btag\s+(?:someone|a\s+friend)\b/i,
  /\bcomment\s+(?:below|if|with)\b/i,
  /\bsubscribe\b/i,
  /\brepost\b/i,
];

const EMOTIONAL_TRIGGERS = {
  high: [
    'shocking',
    'devastating',
    'incredible',
    'breakthrough',
    'urgent',
    'warning',
    'crisis',
    'explosive',
    'revolutionary',
    'game-changing',
    'life-changing',
    'must-see',
    'jaw-dropping',
  ],
  medium: [
    'amazing',
    'powerful',
    'surprising',
    'important',
    'essential',
    'proven',
    'secret',
    'revealed',
    'finally',
    'exclusive',
    'discover',
    'transform',
    'unlock',
  ],
  low: ['interesting', 'useful', 'helpful', 'simple', 'effective', 'quick', 'easy', 'free', 'new'],
};

/**
 * Analyze content for hook characteristics
 */
function analyzeContent(content: string): {
  wordCount: number;
  characterCount: number;
  hasQuestion: boolean;
  hasNumbers: boolean;
  hasCta: boolean;
  emotionalIntensity: EmotionalIntensity;
} {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const contentLower = content.toLowerCase();

  // Check emotional intensity
  const highCount = EMOTIONAL_TRIGGERS.high.filter((w) => contentLower.includes(w)).length;
  const mediumCount = EMOTIONAL_TRIGGERS.medium.filter((w) => contentLower.includes(w)).length;

  let emotionalIntensity: EmotionalIntensity = 'low';
  if (highCount >= 1) emotionalIntensity = 'high';
  else if (mediumCount >= 2) emotionalIntensity = 'medium';

  return {
    wordCount: words.length,
    characterCount: content.length,
    hasQuestion: /\?/.test(content),
    hasNumbers: NUMBER_PATTERNS.some((p) => p.test(content)),
    hasCta: CTA_PATTERNS.some((p) => p.test(content)),
    emotionalIntensity,
  };
}

/**
 * Hook Database Service
 * Manages hooks in D1 + Vectorize for G7 similarity scoring
 */
export class HookDatabaseService {
  constructor(
    private db: D1Database,
    private vectorize: VectorizeIndex,
    private ai: Ai
  ) {}

  /**
   * Generate embedding for content using Workers AI
   */
  private async generateEmbedding(content: string): Promise<number[]> {
    const result = (await this.ai.run('@cf/baai/bge-base-en-v1.5', {
      text: [content],
    })) as { data: number[][] };

    if (!result.data || result.data.length === 0 || !result.data[0]) {
      throw new Error('Failed to generate embedding');
    }

    return result.data[0];
  }

  /**
   * Add a new hook to the database
   */
  async addHook(input: AddHookInput): Promise<Hook> {
    const id = `hook_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const vectorizeId = `vec_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const now = Date.now();

    // Analyze content
    const analysis = analyzeContent(input.content);

    // Generate embedding
    const embedding = await this.generateEmbedding(input.content);

    // Insert into Vectorize
    await this.vectorize.insert([
      {
        id: vectorizeId,
        values: embedding,
        metadata: {
          hookId: id,
          platform: input.platform,
          category: input.category,
          performanceTier: input.performanceTier || 'curated',
        },
      },
    ]);

    // Insert into D1
    await this.db
      .prepare(
        `INSERT INTO hooks (
        id, content, platform, category,
        engagement_rate, performance_tier,
        word_count, character_count,
        has_question, has_numbers, has_cta,
        emotional_intensity, psychological_angle,
        source, source_url, vectorize_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        input.content,
        input.platform,
        input.category,
        input.engagementRate || null,
        input.performanceTier || 'curated',
        analysis.wordCount,
        analysis.characterCount,
        analysis.hasQuestion ? 1 : 0,
        analysis.hasNumbers ? 1 : 0,
        analysis.hasCta ? 1 : 0,
        analysis.emotionalIntensity,
        input.psychologicalAngle || null,
        input.source || 'external',
        input.sourceUrl || null,
        vectorizeId,
        now,
        now
      )
      .run();

    // Update category count
    await this.db
      .prepare(`UPDATE hook_categories SET hook_count = hook_count + 1 WHERE name = ?`)
      .bind(input.category)
      .run();

    return {
      id,
      content: input.content,
      platform: input.platform,
      category: input.category,
      engagementRate: input.engagementRate || null,
      performanceTier: input.performanceTier || 'curated',
      wordCount: analysis.wordCount,
      characterCount: analysis.characterCount,
      hasQuestion: analysis.hasQuestion,
      hasNumbers: analysis.hasNumbers,
      hasCta: analysis.hasCta,
      emotionalIntensity: analysis.emotionalIntensity,
      psychologicalAngle: input.psychologicalAngle || null,
      source: input.source || 'external',
      sourceUrl: input.sourceUrl || null,
      vectorizeId,
      createdAt: now,
    };
  }

  /**
   * Add multiple hooks in batch
   */
  async addHooksBatch(inputs: AddHookInput[]): Promise<{ added: number; failed: number }> {
    let added = 0;
    let failed = 0;

    // Process in batches of 10 for rate limiting
    const batchSize = 10;
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const results = await Promise.allSettled(batch.map((input) => this.addHook(input)));

      for (const result of results) {
        if (result.status === 'fulfilled') {
          added++;
        } else {
          failed++;
          console.error('Failed to add hook:', result.reason);
        }
      }
    }

    return { added, failed };
  }

  /**
   * Find similar hooks using Vectorize
   */
  async findSimilar(
    content: string,
    options: {
      platform?: HookPlatform;
      category?: HookCategory;
      topK?: number;
      minScore?: number;
    } = {}
  ): Promise<SimilaritySearchResult> {
    const startTime = Date.now();
    const { topK = 10, minScore = 0.5 } = options;

    // Generate embedding for query content
    const embedding = await this.generateEmbedding(content);

    // Build filter for Vectorize query
    const filter: Record<string, string> = {};
    if (options.platform) {
      filter.platform = options.platform;
    }
    if (options.category) {
      filter.category = options.category;
    }

    // Query Vectorize
    const vectorResults = await this.vectorize.query(embedding, {
      topK,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      returnMetadata: 'all',
    });

    // Filter by minimum score and get hook details from D1
    const matches: HookSimilarityMatch[] = [];
    let topTierCount = 0;
    let totalSimilarity = 0;

    for (const match of vectorResults.matches) {
      if (match.score < minScore) continue;

      const hookId = match.metadata?.hookId as string;
      if (!hookId) continue;

      // Get full hook data from D1
      const hookRow = await this.db
        .prepare(`SELECT * FROM hooks WHERE id = ?`)
        .bind(hookId)
        .first<{
          id: string;
          content: string;
          platform: string;
          category: string;
          performance_tier: string;
          engagement_rate: number | null;
        }>();

      if (hookRow) {
        const tier = hookRow.performance_tier as PerformanceTier;
        if (tier === 'viral' || tier === 'high') {
          topTierCount++;
        }

        totalSimilarity += match.score;

        matches.push({
          hookId: hookRow.id,
          content: hookRow.content,
          platform: hookRow.platform as HookPlatform,
          category: hookRow.category as HookCategory,
          performanceTier: tier,
          similarity: match.score,
          engagementRate: hookRow.engagement_rate,
        });
      }
    }

    const queryLatencyMs = Date.now() - startTime;

    return {
      matches,
      avgSimilarity: matches.length > 0 ? totalSimilarity / matches.length : 0,
      topTierMatches: topTierCount,
      queryLatencyMs,
    };
  }

  /**
   * Get hook similarity score for G7 calculation
   * Returns 0-1 score based on similarity to top performers
   */
  async getG7SimilarityScore(
    content: string,
    platform: HookPlatform
  ): Promise<{
    score: number; // 0-1
    topMatch: HookSimilarityMatch | null;
    matchCount: number;
    confidence: 'low' | 'medium' | 'high';
  }> {
    const result = await this.findSimilar(content, {
      platform,
      topK: 5,
      minScore: 0.6, // Only consider reasonably similar hooks
    });

    if (result.matches.length === 0) {
      return {
        score: 0.5, // Neutral score if no matches
        topMatch: null,
        matchCount: 0,
        confidence: 'low',
      };
    }

    // Weight similarity by performance tier
    const tierWeights: Record<PerformanceTier, number> = {
      viral: 1.0,
      high: 0.85,
      curated: 0.7,
      community: 0.55,
    };

    let weightedScore = 0;
    let totalWeight = 0;

    for (const match of result.matches) {
      const tierWeight = tierWeights[match.performanceTier];
      weightedScore += match.similarity * tierWeight;
      totalWeight += tierWeight;
    }

    const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0.5;

    // Determine confidence based on match quality
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (result.topTierMatches >= 3 && result.avgSimilarity >= 0.75) {
      confidence = 'high';
    } else if (result.topTierMatches >= 1 && result.avgSimilarity >= 0.65) {
      confidence = 'medium';
    }

    return {
      score: Math.min(1, Math.max(0, finalScore)),
      topMatch: result.matches[0] || null,
      matchCount: result.matches.length,
      confidence,
    };
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalHooks: number;
    byPlatform: Record<string, number>;
    byCategory: Record<string, number>;
    byTier: Record<string, number>;
  }> {
    const [totalResult, platformResult, categoryResult, tierResult] = await Promise.all([
      this.db.prepare(`SELECT COUNT(*) as count FROM hooks`).first<{ count: number }>(),
      this.db
        .prepare(`SELECT platform, COUNT(*) as count FROM hooks GROUP BY platform`)
        .all<{ platform: string; count: number }>(),
      this.db
        .prepare(`SELECT category, COUNT(*) as count FROM hooks GROUP BY category`)
        .all<{ category: string; count: number }>(),
      this.db
        .prepare(`SELECT performance_tier, COUNT(*) as count FROM hooks GROUP BY performance_tier`)
        .all<{ performance_tier: string; count: number }>(),
    ]);

    const byPlatform: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byTier: Record<string, number> = {};

    for (const row of platformResult.results || []) {
      byPlatform[row.platform] = row.count;
    }
    for (const row of categoryResult.results || []) {
      byCategory[row.category] = row.count;
    }
    for (const row of tierResult.results || []) {
      byTier[row.performance_tier] = row.count;
    }

    return {
      totalHooks: totalResult?.count || 0,
      byPlatform,
      byCategory,
      byTier,
    };
  }

  /**
   * Log a similarity search for analytics
   */
  async logSimilaritySearch(
    clientId: string,
    queryContent: string,
    platform: HookPlatform | undefined,
    result: SimilaritySearchResult
  ): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO hook_similarity_log (
        id, client_id, query_content, query_platform,
        top_match_id, top_match_score, match_count, latency_ms,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        `log_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
        clientId,
        queryContent.slice(0, 500), // Truncate for storage
        platform || null,
        result.matches[0]?.hookId || null,
        result.matches[0]?.similarity || null,
        result.matches.length,
        result.queryLatencyMs,
        Date.now()
      )
      .run();
  }
}
