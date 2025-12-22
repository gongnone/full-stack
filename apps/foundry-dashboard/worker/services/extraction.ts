/**
 * Story 3.2: Thematic Extraction Engine
 * Service for extracting themes, claims, and psychological angles from content using Workers AI
 */

import type {
  Pillar,
  PsychologicalAngle,
  ExtractionResult,
  ExtractionProgress,
  ExtractionStage,
} from '../types';

// ============================================================================
// AI Configuration Constants
// ============================================================================

/**
 * Workers AI model for thematic extraction
 * Llama 3.2 3B Instruct chosen for:
 * - Optimal balance between speed (~2-5s per call) and quality
 * - Strong structured output (JSON) compliance
 * - Good summarization and key point extraction
 * - Fits within Workers AI rate limits for concurrent requests
 *
 * Alternatives considered:
 * - DeepSeek-R1-Distill-Qwen-32B: Better reasoning but 3-5x slower
 * - Llama 3.1: Similar quality, slightly older instruction following
 */
const AI_MODEL = '@cf/meta/llama-3.2-3b-instruct' as const;

/**
 * Maximum tokens for AI response
 * Set to 2048 to allow for 8-10 pillars with full supporting points
 * Each pillar averages ~150-200 tokens (title, claim, angle, 3-5 points)
 */
const AI_MAX_TOKENS = 2048;

/**
 * AI temperature controls response randomness
 * 0.7 chosen as balance between:
 * - Creativity (variety in pillar titles, claim phrasing)
 * - Consistency (reliable JSON structure, valid angles)
 *
 * Lower values (0.3-0.5): More deterministic, may produce repetitive titles
 * Higher values (0.8-1.0): More creative but risk malformed JSON
 */
const AI_TEMPERATURE = 0.7;

/**
 * Content chunking configuration for long documents
 * Prevents context overflow in Workers AI (8K token context window)
 *
 * CHUNK_SIZE: 8000 words = ~10K tokens (assuming 1.25 tokens/word)
 * Leaves headroom for prompt template (~500 tokens)
 *
 * OVERLAP: 500 words ensures themes spanning chunk boundaries are captured
 * Tradeoff: Higher overlap = better continuity but more AI calls
 */
const CHUNK_SIZE_WORDS = 8000;
const CHUNK_OVERLAP_WORDS = 500;

// ============================================================================

interface ExtractionContext {
  ai: Ai;
  content: string;
  sourceId: string;
  onProgress?: (progress: ExtractionProgress) => void;
}

interface AIExtractionResponse {
  pillars: Array<{
    title: string;
    core_claim: string;
    psychological_angle: string;
    supporting_points: string[];
  }>;
}

/**
 * Extract content pillars using Workers AI (Llama 3.2)
 * Implements chunking strategy for long documents >10K words
 */
export async function extractPillars(ctx: ExtractionContext): Promise<ExtractionResult> {
  const startTime = Date.now();

  try {
    // Stage 1: Parsing document (0-25%)
    await updateProgress(ctx, 'parsing', 10, 'Parsing document structure...');

    const chunks = chunkContent(ctx.content);
    await updateProgress(ctx, 'parsing', 25, `Document parsed into ${chunks.length} section(s)`);

    // Stage 2: Identifying themes (25-50%)
    await updateProgress(ctx, 'themes', 30, 'Identifying key themes...');

    // Process each chunk and collect pillars
    const allPillars: Pillar[] = [];
    const chunkCount = chunks.length;
    let hadFallback = false;

    for (let i = 0; i < chunkCount; i++) {
      const chunk = chunks[i]!; // We know i < chunkCount so this is safe
      const chunkProgress = 30 + Math.floor((i / chunkCount) * 20); // 30-50%
      await updateProgress(ctx, 'themes', chunkProgress, `Analyzing chunk ${i + 1}/${chunkCount}...`);

      const prompt = buildExtractionPrompt(chunk);

      // Stage 3: Extracting claims (50-75%)
      const claimsProgress = 50 + Math.floor((i / chunkCount) * 25); // 50-75%
      await updateProgress(ctx, 'claims', claimsProgress, `Extracting claims from chunk ${i + 1}/${chunkCount}...`);

      const aiResponse = await ctx.ai.run(AI_MODEL, {
        prompt,
        max_tokens: AI_MAX_TOKENS,
        temperature: AI_TEMPERATURE,
      }) as { response: string };

      const parseResult = parseAIResponse(aiResponse.response);
      allPillars.push(...parseResult.pillars);
      if (parseResult.isFallback) {
        hadFallback = true;
      }
    }

    await updateProgress(ctx, 'claims', 75, 'Claims extracted successfully');

    // Stage 4: Generating pillars (75-100%)
    await updateProgress(ctx, 'pillars', 80, 'Deduplicating and merging pillars...');

    // Deduplicate pillars across chunks by psychological angle
    const uniquePillars = deduplicatePillars(allPillars);
    await updateProgress(ctx, 'pillars', 100, `${uniquePillars.length} pillars generated`);

    const extractionDuration = Date.now() - startTime;

    // If any chunk used fallback, mark extraction as partial failure
    if (hadFallback) {
      return {
        sourceId: ctx.sourceId,
        pillars: uniquePillars,
        extractionDuration,
        success: false,
        error: 'AI response parsing failed for one or more chunks - manual review recommended',
      };
    }

    return {
      sourceId: ctx.sourceId,
      pillars: uniquePillars,
      extractionDuration,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown extraction error';

    await updateProgress(ctx, 'pillars', 0, 'Extraction failed', errorMessage);

    return {
      sourceId: ctx.sourceId,
      pillars: [],
      extractionDuration: Date.now() - startTime,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Deduplicate pillars from multiple chunks
 * Keeps the best pillar for each psychological angle
 */
function deduplicatePillars(pillars: Pillar[]): Pillar[] {
  const angleMap = new Map<string, Pillar>();

  for (const pillar of pillars) {
    const existing = angleMap.get(pillar.psychologicalAngle);

    // Keep pillar with more supporting points (richer content)
    if (!existing || pillar.supportingPoints.length > existing.supportingPoints.length) {
      angleMap.set(pillar.psychologicalAngle, pillar);
    }
  }

  return Array.from(angleMap.values());
}

/**
 * Chunk content for documents >10K words to prevent context overflow
 * Implements overlap strategy to prevent theme loss at chunk boundaries
 * Uses CHUNK_SIZE_WORDS and CHUNK_OVERLAP_WORDS constants defined above
 */
function chunkContent(content: string): string[] {
  const words = content.split(/\s+/);

  if (words.length <= CHUNK_SIZE_WORDS) {
    return [content];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + CHUNK_SIZE_WORDS, words.length);
    const chunk = words.slice(start, end).join(' ');
    chunks.push(chunk);

    start = end - CHUNK_OVERLAP_WORDS;
    if (start >= words.length - CHUNK_OVERLAP_WORDS) {
      break; // Avoid tiny final chunk
    }
  }

  return chunks;
}

/**
 * Build extraction prompt for Workers AI
 * Optimized for Llama 3.2 with structured JSON output
 */
function buildExtractionPrompt(content: string): string {
  // Truncate content if > 10K words for single-chunk processing
  const words = content.split(/\s+/);
  const truncatedContent = words.slice(0, 10000).join(' ');

  return `You are a content strategist analyzing source material to identify distinct content pillars.

CONTENT TO ANALYZE:
${truncatedContent}

TASK:
Extract 5-10 distinct content pillars from this source. Each pillar represents a unique theme, angle, or perspective that can be expanded into multiple pieces of content.

For each pillar, provide:
1. **title**: A compelling pillar name (e.g., "The Rebellious Gambler", "Authority Without Arrogance")
2. **core_claim**: The main argument or insight (1-2 sentences)
3. **psychological_angle**: The primary emotional driver (choose ONE: Contrarian, Authority, Urgency, Aspiration, Fear, Curiosity, Transformation, Rebellion)
4. **supporting_points**: 3-5 key points that support this pillar

CRITICAL REQUIREMENTS:
- Identify at least 8 pillars for long-form content (>5000 words)
- Each pillar MUST have a unique psychological angle (no duplicates)
- Pillars should represent DISTINCT themes (no overlap)
- Core claims should be specific and actionable

Return ONLY valid JSON (no markdown, no explanation):
{
  "pillars": [
    {
      "title": "string",
      "core_claim": "string",
      "psychological_angle": "string",
      "supporting_points": ["point1", "point2", "point3"]
    }
  ]
}`;
}

interface ParseResult {
  pillars: Pillar[];
  isFallback: boolean;
}

/**
 * Parse Workers AI response into Pillar objects
 * Implements deduplication and validation
 * Returns isFallback=true if parsing failed and fallback pillar was returned
 */
function parseAIResponse(response: string): ParseResult {
  try {
    // Extract JSON from response (AI might wrap in markdown)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as AIExtractionResponse;

    if (!Array.isArray(parsed.pillars) || parsed.pillars.length === 0) {
      throw new Error('No pillars extracted from response');
    }

    const pillars: Pillar[] = [];
    const usedAngles = new Set<string>();

    for (const pillar of parsed.pillars) {
      // Validate psychological angle
      const angle = normalizeAngle(pillar.psychological_angle);

      // Skip duplicates
      if (usedAngles.has(angle)) {
        continue;
      }

      usedAngles.add(angle);

      // Estimate spoke count based on supporting points
      const spokeCount = Math.max(5, pillar.supporting_points.length * 3);

      pillars.push({
        id: crypto.randomUUID(),
        title: pillar.title,
        coreClaim: pillar.core_claim,
        psychologicalAngle: angle as PsychologicalAngle,
        estimatedSpokeCount: spokeCount,
        supportingPoints: pillar.supporting_points,
      });
    }

    return { pillars, isFallback: false };
  } catch (_error) {
    // AI response parsing failed - return fallback pillar with isFallback flag
    return {
      pillars: [{
        id: crypto.randomUUID(),
        title: 'Content Analysis',
        coreClaim: 'Analysis failed - manual pillar creation required',
        psychologicalAngle: 'Curiosity',
        estimatedSpokeCount: 5,
        supportingPoints: ['Extraction encountered an error'],
      }],
      isFallback: true,
    };
  }
}

/**
 * Normalize psychological angle from AI response to typed enum
 */
function normalizeAngle(angle: string): string {
  const normalized = angle.toLowerCase().trim();
  const mapping: Record<string, PsychologicalAngle> = {
    'contrarian': 'Contrarian',
    'authority': 'Authority',
    'urgency': 'Urgency',
    'aspiration': 'Aspiration',
    'fear': 'Fear',
    'curiosity': 'Curiosity',
    'transformation': 'Transformation',
    'rebellion': 'Rebellion',
  };

  return mapping[normalized] || 'Curiosity';
}

/**
 * Update extraction progress
 */
async function updateProgress(
  ctx: ExtractionContext,
  stage: ExtractionStage,
  progress: number,
  message: string,
  error?: string
): Promise<void> {
  if (ctx.onProgress) {
    ctx.onProgress({
      sourceId: ctx.sourceId,
      status: error ? 'failed' : progress === 100 ? 'completed' : 'processing',
      currentStage: stage,
      progress,
      stageMessage: message,
      error,
    });
  }
}
