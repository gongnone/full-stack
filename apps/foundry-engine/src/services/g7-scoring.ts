/**
 * G7 Engagement Prediction Scoring Service (Story 12-1)
 * 
 * Heuristic v1 algorithm:
 * G7 = (0.4 * hook_similarity) + (0.3 * g2_quality) + (0.2 * platform_optimization) + (0.1 * timing)
 * 
 * Scores 0-10 scale. Golden Nuggets = G7 >= 9.
 */

// Platform-specific optimal content lengths
const PLATFORM_OPTIMAL_LENGTH: Record<string, { min: number; max: number; ideal: number }> = {
  twitter: { min: 100, max: 280, ideal: 220 },
  linkedin: { min: 500, max: 3000, ideal: 1500 },
  instagram: { min: 100, max: 2200, ideal: 800 },
  tiktok: { min: 50, max: 300, ideal: 150 },
};

// Platform-specific optimal posting hours (UTC)
const PLATFORM_OPTIMAL_HOURS: Record<string, number[]> = {
  twitter: [13, 14, 15, 17, 18], // 8-10 AM ET, 12-1 PM ET
  linkedin: [12, 13, 17, 18], // 7-8 AM ET, 12-1 PM ET
  instagram: [16, 17, 19], // 11 AM ET, 2 PM ET
  tiktok: [14, 15, 19, 20, 21], // evenings + lunch
};

export interface G7Input {
  spokeId: string;
  clientId: string;
  platform: string;
  hookText: string;
  contentText: string;
  g2Score?: number; // 0-10 from G2 gate
  publishHour?: number; // UTC hour
}

export interface G7Result {
  g7Score: number;
  hookSimilarityScore: number;
  g2QualityScore: number;
  platformOptimizationScore: number;
  timingScore: number;
  confidence: number;
  modelVersion: string;
}

/**
 * Calculate G7 prediction score using heuristic v1 model
 */
export function calculateG7Score(input: G7Input, hookSimilarity?: number): G7Result {
  const hookSimilarityScore = hookSimilarity != null
    ? Math.min(hookSimilarity * 10, 10) // Normalize cosine similarity to 0-10
    : estimateHookQuality(input.hookText); // Fallback heuristic

  const g2QualityScore = input.g2Score != null
    ? Math.min(input.g2Score, 10)
    : estimateContentQuality(input.contentText);

  const platformOptimizationScore = calculatePlatformOptimization(
    input.platform,
    input.contentText
  );

  const timingScore = input.publishHour != null
    ? calculateTimingScore(input.platform, input.publishHour)
    : 5; // Default neutral timing

  // Weighted combination
  const g7Score = Math.min(10, Math.max(0,
    (0.4 * hookSimilarityScore) +
    (0.3 * g2QualityScore) +
    (0.2 * platformOptimizationScore) +
    (0.1 * timingScore)
  ));

  // Confidence based on data availability
  let confidence = 0.3; // Base confidence for heuristic
  if (hookSimilarity != null) confidence += 0.3; // Have real similarity data
  if (input.g2Score != null) confidence += 0.2; // Have real G2 score
  if (input.publishHour != null) confidence += 0.1; // Have timing data
  confidence = Math.min(confidence, 1);

  return {
    g7Score: Math.round(g7Score * 100) / 100,
    hookSimilarityScore: Math.round(hookSimilarityScore * 100) / 100,
    g2QualityScore: Math.round(g2QualityScore * 100) / 100,
    platformOptimizationScore: Math.round(platformOptimizationScore * 100) / 100,
    timingScore: Math.round(timingScore * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    modelVersion: 'v1-heuristic',
  };
}

/**
 * Estimate hook quality without Vectorize similarity data
 * Uses heuristic signals: length, question marks, numbers, power words, etc.
 */
function estimateHookQuality(hookText: string): number {
  if (!hookText) return 3;

  let score = 5; // Base score

  // Length sweet spot (40-100 chars for hooks)
  const len = hookText.length;
  if (len >= 40 && len <= 100) score += 1;
  else if (len < 20 || len > 200) score -= 1;

  // Starts with a question
  if (hookText.trim().endsWith('?')) score += 0.5;

  // Contains numbers (specificity)
  if (/\d/.test(hookText)) score += 0.5;

  // Power words
  const powerWords = ['secret', 'mistake', 'proven', 'surprising', 'actually', 'truth', 'never', 'always', 'stop', 'why', 'how', 'best', 'worst'];
  const lowerHook = hookText.toLowerCase();
  const powerWordCount = powerWords.filter(w => lowerHook.includes(w)).length;
  score += Math.min(powerWordCount * 0.5, 1.5);

  // Emotional intensity (exclamation, caps words)
  if (hookText.includes('!')) score += 0.3;
  const capsWords = hookText.split(' ').filter(w => w === w.toUpperCase() && w.length > 2).length;
  if (capsWords >= 1 && capsWords <= 3) score += 0.3;

  // Contrarian signal ("most people", "everyone thinks")
  if (lowerHook.includes('most people') || lowerHook.includes('everyone') || lowerHook.includes('nobody')) score += 0.5;

  return Math.min(10, Math.max(0, score));
}

/**
 * Estimate content quality without G2 score
 */
function estimateContentQuality(content: string): number {
  if (!content) return 3;

  let score = 5;

  // Length appropriateness
  const len = content.length;
  if (len >= 200 && len <= 3000) score += 1;
  else if (len < 50) score -= 2;

  // Paragraph structure
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  if (paragraphs.length >= 2 && paragraphs.length <= 8) score += 0.5;

  // Readability signals
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  const avgSentenceLen = content.length / Math.max(sentences.length, 1);
  if (avgSentenceLen >= 40 && avgSentenceLen <= 120) score += 0.5;

  // Call to action signals
  const ctaWords = ['comment', 'share', 'follow', 'click', 'link', 'dm', 'reply', 'agree', 'disagree', 'what do you think'];
  const lowerContent = content.toLowerCase();
  if (ctaWords.some(w => lowerContent.includes(w))) score += 0.5;

  return Math.min(10, Math.max(0, score));
}

/**
 * Score platform-specific optimization (content length, format, hashtags)
 */
function calculatePlatformOptimization(platform: string, content: string): number {
  const optimal = PLATFORM_OPTIMAL_LENGTH[platform];
  if (!optimal) return 5;

  let score = 5;
  const len = content.length;

  // Length optimization
  if (len >= optimal.min && len <= optimal.max) {
    // Within range — score based on closeness to ideal
    const distance = Math.abs(len - optimal.ideal) / optimal.ideal;
    score += Math.max(0, 3 * (1 - distance));
  } else {
    // Out of range
    score -= 2;
  }

  // Platform-specific signals
  const lowerContent = content.toLowerCase();

  if (platform === 'twitter') {
    // Thread potential (numbered lists, "1/")
    if (/\d+[./]/.test(content)) score += 0.5;
    // Hashtags (1-2 is optimal for Twitter)
    const hashtagCount = (content.match(/#\w+/g) || []).length;
    if (hashtagCount >= 1 && hashtagCount <= 2) score += 0.5;
    else if (hashtagCount > 5) score -= 0.5;
  }

  if (platform === 'linkedin') {
    // Line breaks for readability
    const lineBreaks = (content.match(/\n/g) || []).length;
    if (lineBreaks >= 3) score += 0.5;
    // Professional tone signals
    if (lowerContent.includes('lesson') || lowerContent.includes('learned') || lowerContent.includes('insight')) score += 0.3;
  }

  if (platform === 'instagram') {
    // Hashtags (5-15 optimal)
    const hashtagCount = (content.match(/#\w+/g) || []).length;
    if (hashtagCount >= 5 && hashtagCount <= 15) score += 1;
    // Emoji usage
    const emojiCount = (content.match(/[\u{1F300}-\u{1FAD6}]/gu) || []).length;
    if (emojiCount >= 1 && emojiCount <= 5) score += 0.5;
  }

  if (platform === 'tiktok') {
    // Short, punchy content
    if (len <= 200) score += 0.5;
    // Trending sound/format references
    if (lowerContent.includes('pov') || lowerContent.includes('storytime')) score += 0.3;
  }

  return Math.min(10, Math.max(0, score));
}

/**
 * Score posting time optimization
 */
function calculateTimingScore(platform: string, hour: number): number {
  const optimalHours = PLATFORM_OPTIMAL_HOURS[platform];
  if (!optimalHours) return 5;

  if (optimalHours.includes(hour)) return 9;

  // Adjacent hours get partial credit
  const minDistance = Math.min(...optimalHours.map(h => Math.min(Math.abs(h - hour), 24 - Math.abs(h - hour))));
  if (minDistance <= 1) return 7;
  if (minDistance <= 2) return 5;

  return 3;
}

/**
 * Batch score multiple spokes
 */
export function batchCalculateG7(inputs: G7Input[], hookSimilarities?: Map<string, number>): Map<string, G7Result> {
  const results = new Map<string, G7Result>();

  for (const input of inputs) {
    const similarity = hookSimilarities?.get(input.spokeId);
    results.set(input.spokeId, calculateG7Score(input, similarity));
  }

  return results;
}
