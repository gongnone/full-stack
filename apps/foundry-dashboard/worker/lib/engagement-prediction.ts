/**
 * Epic 12-1: G7 Engagement Prediction Algorithm v1
 *
 * Predicts engagement potential for content using heuristics.
 * Future versions will use ML trained on actual performance data.
 *
 * Score Scale: 0-10 where 9+ = "Golden Nugget"
 */

export interface EngagementFactors {
  hook: number; // 0-2.5: Hook strength contribution
  platform: number; // 0-2.5: Platform optimization contribution
  signals: number; // 0-2.0: Content signals (questions, numbers, CTAs)
  emotional: number; // 0-1.5: Emotional intensity
  drivers: number; // 0-1.5: Engagement drivers (controversy, curiosity)
}

export interface EngagementPrediction {
  score: number; // 0-10
  confidence: 'low' | 'medium' | 'high';
  factors: EngagementFactors;
  isGoldenNugget: boolean; // score >= 9
  feedback: string;
}

export interface PredictionInput {
  content: string;
  platform: string;
  g2HookScore?: number; // If already calculated, 0-100
  psychologicalAngle?: string;
}

// Platform-specific optimal lengths (in characters)
const PLATFORM_OPTIMAL_LENGTH: Record<string, { min: number; max: number; sweet: number }> = {
  twitter: { min: 71, max: 280, sweet: 140 },
  linkedin: { min: 150, max: 1300, sweet: 600 },
  instagram: { min: 50, max: 300, sweet: 150 },
  tiktok: { min: 50, max: 150, sweet: 100 },
  newsletter: { min: 500, max: 2000, sweet: 800 },
  thread: { min: 200, max: 1000, sweet: 400 },
  carousel: { min: 50, max: 200, sweet: 100 },
};

// Emotional trigger words by intensity
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
    'heartbreaking',
    'terrifying',
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
    'master',
    'dominate',
  ],
  low: [
    'interesting',
    'useful',
    'helpful',
    'simple',
    'effective',
    'quick',
    'easy',
    'free',
    'new',
    'better',
  ],
};

// Controversy/curiosity gap patterns
const ENGAGEMENT_DRIVER_PATTERNS = [
  /\bwhy\s+(?:nobody|no\s+one|most\s+people|everyone)\b/i, // "Why nobody talks about..."
  /\bthe\s+truth\s+about\b/i, // "The truth about..."
  /\bunpopular\s+opinion\b/i, // Controversy signal
  /\bhot\s+take\b/i, // Controversy signal
  /\bcontroversial\b/i, // Explicit controversy
  /\bI\s+was\s+wrong\s+about\b/i, // Vulnerability hook
  /\bstop\s+(?:doing|using|saying)\b/i, // Command + negative
  /\bwhat\s+(?:nobody|no\s+one)\s+tells\s+you\b/i, // Insider knowledge
  /\bthe\s+real\s+reason\b/i, // Hidden truth
  /\bhere'?s?\s+(?:why|what|how)\b/i, // List setup
  /\bmistake(?:s)?\s+(?:I|you|we|they)\s+(?:made|make)\b/i, // Mistakes framing
  /\bin\s+\d+\s+(?:seconds?|minutes?|hours?|days?|weeks?)\b/i, // Time pressure
];

// CTA patterns
const CTA_PATTERNS = [
  /\bfollow\s+(?:me|for|to)\b/i,
  /\bshare\s+(?:this|if|with)\b/i,
  /\bsave\s+(?:this|for)\b/i,
  /\btag\s+(?:someone|a\s+friend)\b/i,
  /\bcomment\s+(?:below|if|with)\b/i,
  /\bclick\s+(?:the\s+)?link\b/i,
  /\bsubscribe\b/i,
  /\bDM\s+(?:me|for)\b/i,
  /\brepost\b/i,
  /\b(?:double\s+)?tap\b/i,
  /\bwhat\s+do\s+you\s+think\?/i,
  /\bagree\s+or\s+disagree\?/i,
];

// Number/statistic patterns (high engagement signals)
const NUMBER_PATTERNS = [
  /\d+%/,
  /\$\d+/,
  /\d+x/,
  /\d+\s*(?:million|billion|k|K)/,
  /top\s+\d+/i,
  /\d+\s+(?:tips|ways|reasons|steps|things|mistakes|secrets)/i,
];

/**
 * Calculate hook factor from G2 score or heuristics
 * Returns 0-2.5
 */
function calculateHookFactor(content: string, g2Score?: number): number {
  if (g2Score !== undefined) {
    // Normalize G2 (0-100) to hook factor (0-2.5)
    return (g2Score / 100) * 2.5;
  }

  // Heuristic hook scoring if G2 not available
  let score = 0;

  // Question opener (high engagement)
  if (/^[^.!?]*\?/.test(content)) score += 0.6;

  // Contains numbers/statistics
  if (NUMBER_PATTERNS.some((p) => p.test(content))) score += 0.5;

  // Strong opening words
  if (/^(?:Stop|Warning|Secret|Revealed|Breaking|Urgent|Finally|Here's)/i.test(content))
    score += 0.5;

  // Short punchy first sentence
  const firstSentence = content.split(/[.!?]/)[0] || '';
  if (firstSentence.length > 0 && firstSentence.length < 60) score += 0.4;

  // Colon or dash pattern (listicle setup)
  if (/^[^:]+:\s*\n|^[^-]+\s*-\s*/m.test(content)) score += 0.3;

  // Direct "you" address
  if (/\byou\b/i.test(content.slice(0, 100))) score += 0.2;

  return Math.min(2.5, score);
}

/**
 * Calculate platform optimization factor
 * Returns 0-2.5
 */
function calculatePlatformFactor(content: string, platform: string): number {
  const optimal = PLATFORM_OPTIMAL_LENGTH[platform] || { min: 100, max: 500, sweet: 250 };
  const length = content.length;

  let score = 0;

  // Length optimization
  if (length >= optimal.min && length <= optimal.max) {
    // Within acceptable range
    const distanceFromSweet = Math.abs(length - optimal.sweet);
    const maxDistance = Math.max(optimal.sweet - optimal.min, optimal.max - optimal.sweet);
    score += 1.5 * (1 - distanceFromSweet / maxDistance);
  } else if (length < optimal.min) {
    score += 0.5; // Too short penalty
  } else {
    score += 0.3; // Too long penalty
  }

  // Platform-specific format bonuses
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  // Simple emoji detection using common emoji patterns
  const emojiPattern = /[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2600-\u27FF]|[\uFE00-\uFEFF]/gu;
  const emojiCount = (content.match(emojiPattern) || []).length;
  const lineBreaks = (content.match(/\n/g) || []).length;

  switch (platform) {
    case 'twitter':
      // Twitter: few hashtags, some emojis, concise
      if (hashtagCount >= 1 && hashtagCount <= 2) score += 0.3;
      if (emojiCount >= 1 && emojiCount <= 3) score += 0.2;
      break;
    case 'linkedin':
      // LinkedIn: professional, line breaks for readability, minimal emojis
      if (lineBreaks >= 2 && lineBreaks <= 6) score += 0.4;
      if (hashtagCount >= 2 && hashtagCount <= 5) score += 0.2;
      if (emojiCount <= 2) score += 0.2;
      break;
    case 'instagram':
      // Instagram: emojis encouraged, hashtags important
      if (emojiCount >= 2) score += 0.3;
      if (hashtagCount >= 5 && hashtagCount <= 15) score += 0.3;
      break;
    case 'tiktok':
      // TikTok: casual, emojis, few hashtags
      if (emojiCount >= 1) score += 0.2;
      if (hashtagCount >= 2 && hashtagCount <= 5) score += 0.3;
      if (length <= 100) score += 0.3;
      break;
    case 'newsletter':
      // Newsletter: structured, headers, minimal hashtags
      if (lineBreaks >= 3) score += 0.3;
      if (hashtagCount === 0) score += 0.2;
      break;
  }

  return Math.min(2.5, score);
}

/**
 * Calculate content signals factor (questions, numbers, CTAs)
 * Returns 0-2.0
 */
function calculateSignalsFactor(content: string): number {
  let score = 0;

  // Questions (engagement drivers)
  const questionCount = (content.match(/\?/g) || []).length;
  if (questionCount >= 1) score += 0.5;
  if (questionCount >= 2) score += 0.2;

  // Numbers and statistics
  if (NUMBER_PATTERNS.some((p) => p.test(content))) score += 0.5;

  // CTAs present
  const ctaCount = CTA_PATTERNS.filter((p) => p.test(content)).length;
  if (ctaCount >= 1) score += 0.4;
  if (ctaCount >= 2) score += 0.2;

  // List format (numbered or bullet)
  if (/^\d+\.\s+|\n\d+\.\s+|^\s*[-•]\s+|\n\s*[-•]\s+/m.test(content)) score += 0.2;

  return Math.min(2.0, score);
}

/**
 * Calculate emotional intensity factor
 * Returns 0-1.5
 */
function calculateEmotionalFactor(content: string): number {
  const contentLower = content.toLowerCase();
  let score = 0;

  // High intensity words
  const highCount = EMOTIONAL_TRIGGERS.high.filter((w) => contentLower.includes(w)).length;
  score += Math.min(0.8, highCount * 0.4);

  // Medium intensity words
  const mediumCount = EMOTIONAL_TRIGGERS.medium.filter((w) => contentLower.includes(w)).length;
  score += Math.min(0.5, mediumCount * 0.15);

  // Low intensity words (smaller contribution)
  const lowCount = EMOTIONAL_TRIGGERS.low.filter((w) => contentLower.includes(w)).length;
  score += Math.min(0.2, lowCount * 0.05);

  return Math.min(1.5, score);
}

/**
 * Calculate engagement drivers factor (controversy, curiosity)
 * Returns 0-1.5
 */
function calculateDriversFactor(content: string, psychologicalAngle?: string): number {
  let score = 0;

  // Pattern matches for controversy/curiosity
  const driverMatches = ENGAGEMENT_DRIVER_PATTERNS.filter((p) => p.test(content)).length;
  score += Math.min(1.0, driverMatches * 0.3);

  // Psychological angle bonuses
  if (psychologicalAngle) {
    switch (psychologicalAngle) {
      case 'Contrarian':
      case 'Rebellion':
        score += 0.4; // High engagement angles
        break;
      case 'Curiosity':
      case 'Fear':
        score += 0.3;
        break;
      case 'Urgency':
      case 'Transformation':
        score += 0.2;
        break;
      case 'Authority':
      case 'Aspiration':
        score += 0.1;
        break;
    }
  }

  return Math.min(1.5, score);
}

/**
 * Generate feedback based on factors
 */
function generateFeedback(factors: EngagementFactors, score: number): string {
  const weakAreas: string[] = [];
  const strongAreas: string[] = [];

  if (factors.hook < 1.5) weakAreas.push('hook strength');
  else if (factors.hook >= 2.0) strongAreas.push('strong hook');

  if (factors.platform < 1.5) weakAreas.push('platform optimization');
  else if (factors.platform >= 2.0) strongAreas.push('well-formatted');

  if (factors.signals < 1.0) weakAreas.push('engagement signals');
  else if (factors.signals >= 1.5) strongAreas.push('good CTAs');

  if (factors.emotional < 0.8) weakAreas.push('emotional appeal');
  else if (factors.emotional >= 1.2) strongAreas.push('emotionally compelling');

  if (factors.drivers < 0.8) weakAreas.push('curiosity gap');
  else if (factors.drivers >= 1.2) strongAreas.push('creates curiosity');

  if (score >= 9) {
    return `Golden Nugget! ${strongAreas.slice(0, 2).join(', ')}`;
  } else if (score >= 7) {
    return `Strong: ${strongAreas.slice(0, 2).join(', ') || 'balanced content'}`;
  } else if (score >= 5) {
    return `Consider improving: ${weakAreas.slice(0, 2).join(', ')}`;
  } else {
    return `Needs work: ${weakAreas.join(', ')}`;
  }
}

/**
 * Main prediction function
 */
export function predictEngagement(input: PredictionInput): EngagementPrediction {
  const factors: EngagementFactors = {
    hook: calculateHookFactor(input.content, input.g2HookScore),
    platform: calculatePlatformFactor(input.content, input.platform),
    signals: calculateSignalsFactor(input.content),
    emotional: calculateEmotionalFactor(input.content),
    drivers: calculateDriversFactor(input.content, input.psychologicalAngle),
  };

  // Calculate total score (0-10)
  const rawScore = factors.hook + factors.platform + factors.signals + factors.emotional + factors.drivers;
  const score = Math.round(rawScore * 10) / 10; // Round to 1 decimal

  // Determine confidence based on data availability
  // v1 is all heuristic, so confidence is always 'low'
  // Future versions with training data will be 'medium' or 'high'
  const confidence: 'low' | 'medium' | 'high' = 'low';

  return {
    score,
    confidence,
    factors,
    isGoldenNugget: score >= 9,
    feedback: generateFeedback(factors, score),
  };
}

/**
 * Batch predict engagement for multiple pieces of content
 */
export function predictEngagementBatch(
  inputs: PredictionInput[]
): EngagementPrediction[] {
  return inputs.map(predictEngagement);
}

/**
 * Convert prediction to DB-friendly format
 */
export function predictionToDbFormat(prediction: EngagementPrediction): {
  engagement_prediction: number;
  engagement_confidence: string;
  engagement_factors: string;
} {
  return {
    engagement_prediction: prediction.score,
    engagement_confidence: prediction.confidence,
    engagement_factors: JSON.stringify(prediction.factors),
  };
}
