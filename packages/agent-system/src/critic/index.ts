import type { BrandDNA, PlatformSpec, QualityScores } from '@repo/foundry-core';

export * from './CriticAgent';
export * from './gates/g2-hook-strength';
export * from './gates/g4-voice-alignment';
export * from './gates/g5-platform-compliance';


// ==========================================
// CRITIC AGENT - Convergent Evaluator
// ==========================================

export interface CriticContext {
  brandDNA: BrandDNA;
  platformSpec: PlatformSpec;
  content: string;
  gate: QualityGate;
}

export type QualityGate = 'g2_hook' | 'g4_voice' | 'g5_platform' | 'g6_visual' | 'g7_engagement' | 'g_compliance';

export interface CriticResult {
  gate: QualityGate;
  passed: boolean;
  score?: number;
  feedback: string;
  violations: string[];
  suggestions: string[];
}

// ==========================================
// GATE THRESHOLDS
// ==========================================

export const GATE_THRESHOLDS = {
  g2_hook: 60,      // Hook strength minimum score
  g4_voice: true,   // Binary pass/fail
  g5_platform: true, // Binary pass/fail
  g6_visual: 50,    // Visual metaphor minimum score
  g7_engagement: 60, // Engagement prediction minimum
  g_compliance: true, // Binary pass/fail
};

// ==========================================
// G2: HOOK STRENGTH EVALUATOR
// ==========================================

export function buildG2HookPrompt(content: string): string {
  return `You are a CRITIC agent evaluating HOOK STRENGTH.

CONTENT TO EVALUATE:
${content}

EVALUATION CRITERIA (score each 0-25, total 0-100):

1. CURIOSITY GAP (0-25)
- Does the opening create a knowledge gap?
- Does it make you NEED to know what comes next?
- Is there an unanswered question or incomplete pattern?

2. PATTERN INTERRUPT (0-25)
- Does it break expectations?
- Would it stop someone mid-scroll?
- Is it surprising or counterintuitive?

3. EMOTIONAL RESONANCE (0-25)
- Does it trigger an emotional response?
- Does it speak to a fear, desire, or frustration?
- Is there personal relevance?

4. VALUE PROMISE (0-25)
- Is there a clear benefit to reading on?
- Is the value proposition specific?
- Does it feel worth the reader's time?

OUTPUT JSON ONLY:
{
  "score": <total 0-100>,
  "passed": <true if score >= 60>,
  "breakdown": {
    "curiosity_gap": <0-25>,
    "pattern_interrupt": <0-25>,
    "emotional_resonance": <0-25>,
    "value_promise": <0-25>
  },
  "feedback": "<specific improvement suggestions>",
  "strongest": "<which element is strongest>",
  "weakest": "<which element needs most work>"
}`;
}

// ==========================================
// G4: VOICE ALIGNMENT EVALUATOR
// ==========================================

export function buildG4VoicePrompt(content: string, brandDNA: BrandDNA): string {
  return `You are a CRITIC agent evaluating VOICE ALIGNMENT.

CONTENT TO EVALUATE:
${content}

BRAND VOICE REQUIREMENTS:
${brandDNA.voiceMarkers.length > 0 ? `- Voice Markers (should appear naturally): ${brandDNA.voiceMarkers.join(', ')}` : '- No specific voice markers defined'}
${brandDNA.bannedWords.length > 0 ? `- Banned Words (MUST NOT appear):\n${brandDNA.bannedWords.map(b => `  • "${b.word}" (${b.severity}): ${b.reason || 'Not specified'}`).join('\n')}` : '- No banned words defined'}
${brandDNA.signaturePatterns.length > 0 ? `- Signature Patterns: ${brandDNA.signaturePatterns.join(', ')}` : ''}

TONE PROFILE TARGET:
${Object.entries(brandDNA.toneProfile || {}).map(([key, value]) => {
  const labels: Record<string, [string, string]> = {
    formal_casual: ['Formal', 'Casual'],
    serious_playful: ['Serious', 'Playful'],
    technical_accessible: ['Technical', 'Accessible'],
    reserved_expressive: ['Reserved', 'Expressive'],
  };
  const [low, high] = labels[key] || [key, key];
  return `- ${key}: ${value}/100 (${value < 40 ? low : value > 60 ? high : 'Balanced'})`;
}).join('\n') || '- Default balanced tone'}

EVALUATION CRITERIA:
1. Are there any banned word violations? (instant fail for 'hard' severity)
2. Does the tone match the profile?
3. Are voice markers used naturally (not forced)?
4. Does it feel authentic to the brand?

OUTPUT JSON ONLY:
{
  "passed": <true/false>,
  "bannedWordViolations": ["list of violations"],
  "toneAlignment": {
    "formal_casual": <detected value 0-100>,
    "serious_playful": <detected value 0-100>,
    "technical_accessible": <detected value 0-100>,
    "reserved_expressive": <detected value 0-100>
  },
  "voiceMarkersUsed": ["markers found"],
  "feedback": "<specific feedback>",
  "suggestions": ["improvement suggestions"]
}`;
}

// ==========================================
// G5: PLATFORM COMPLIANCE EVALUATOR
// ==========================================

export function buildG5PlatformPrompt(content: string, platformSpec: PlatformSpec): string {
  return `You are a CRITIC agent evaluating PLATFORM COMPLIANCE.

CONTENT TO EVALUATE:
${content}

CONTENT LENGTH: ${content.length} characters

PLATFORM REQUIREMENTS:
- Max Length: ${platformSpec.maxLength} characters
- Format: ${platformSpec.format}
- Style: ${platformSpec.style}
- Hashtags: ${platformSpec.hashtagSupport ? 'Supported (check proper usage)' : 'NOT supported (should not appear)'}
- Mentions: ${platformSpec.mentionSupport ? 'Supported' : 'NOT supported'}
- Links: ${platformSpec.linkSupport ? 'Supported' : 'NOT supported (should not appear)'}
- Media: ${platformSpec.mediaRequired ? 'Required (content should reference or complement media)' : 'Optional'}

EVALUATION CRITERIA:
1. Character count within limit?
2. Format matches platform conventions?
3. Style appropriate for platform audience?
4. Proper use of platform-specific features?

OUTPUT JSON ONLY:
{
  "passed": <true/false>,
  "characterCount": ${content.length},
  "characterLimit": ${platformSpec.maxLength},
  "overBy": ${Math.max(0, content.length - platformSpec.maxLength)},
  "violations": ["list of violations"],
  "feedback": "<specific feedback>",
  "suggestions": ["how to fix"]
}`;
}

// ==========================================
// G7: ENGAGEMENT PREDICTION
// ==========================================

export function buildG7EngagementPrompt(content: string, platform: string): string {
  return `You are a CRITIC agent predicting ENGAGEMENT POTENTIAL.

CONTENT TO EVALUATE:
${content}

TARGET PLATFORM: ${platform}

EVALUATION CRITERIA (score each 0-25, total 0-100):

1. SHAREABILITY (0-25)
- Would someone share this with others?
- Does it make the sharer look good?
- Is it quotable or screenshot-worthy?

2. COMMENT-WORTHINESS (0-25)
- Does it invite discussion?
- Is there something to agree/disagree with?
- Does it ask a question or make a claim?

3. SAVE/BOOKMARK LIKELIHOOD (0-25)
- Is there reference value?
- Would someone want to come back to this?
- Is there actionable information?

4. PROFILE CLICK POTENTIAL (0-25)
- Does it make you curious about the author?
- Is there implied expertise or interesting perspective?
- Does it suggest more value on the profile?

OUTPUT JSON ONLY:
{
  "score": <total 0-100>,
  "passed": <true if score >= 60>,
  "breakdown": {
    "shareability": <0-25>,
    "comment_worthiness": <0-25>,
    "save_likelihood": <0-25>,
    "profile_click": <0-25>
  },
  "feedback": "<specific improvement suggestions>",
  "viralPotential": "<low/medium/high>",
  "predictedEngagementRate": "<percentage estimate>"
}`;
}

// ==========================================
// AGGREGATE EVALUATION
// ==========================================

export interface AggregateEvaluation {
  allGatesPassed: boolean;
  scores: QualityScores;
  criticalFailures: string[];
  overallScore: number;
  readyForReview: boolean;
  feedback: string[];
}

export function aggregateEvaluations(results: CriticResult[]): AggregateEvaluation {
  const scores: QualityScores = {};
  const criticalFailures: string[] = [];
  const feedback: string[] = [];

  for (const result of results) {
    // Collect scores
    if (result.gate === 'g2_hook' && result.score !== undefined) {
      scores.g2_hook = result.score;
    }
    if (result.gate === 'g4_voice') {
      scores.g4_voice = result.passed;
    }
    if (result.gate === 'g5_platform') {
      scores.g5_platform = result.passed;
    }
    if (result.gate === 'g6_visual' && result.score !== undefined) {
      scores.g6_visual = result.score;
    }
    if (result.gate === 'g7_engagement' && result.score !== undefined) {
      scores.g7_engagement = result.score;
    }

    // Collect failures
    if (!result.passed) {
      criticalFailures.push(`${result.gate}: ${result.feedback}`);
      feedback.push(result.feedback);
    }

    // Collect suggestions
    feedback.push(...result.suggestions);
  }

  // Calculate overall score (weighted average)
  const numericScores = [
    scores.g2_hook || 0,
    scores.g4_voice ? 100 : 0,
    scores.g5_platform ? 100 : 0,
    scores.g6_visual || 50, // Default neutral if not evaluated
    scores.g7_engagement || 0,
  ];

  const overallScore = Math.round(
    numericScores.reduce((a, b) => a + b, 0) / numericScores.length
  );

  const allGatesPassed = criticalFailures.length === 0;

  return {
    allGatesPassed,
    scores,
    criticalFailures,
    overallScore,
    readyForReview: allGatesPassed || overallScore >= 70,
    feedback: [...new Set(feedback)], // Deduplicate
  };
}

// ==========================================
// SELF-HEALING FEEDBACK GENERATOR
// ==========================================

export function generateSelfHealingFeedback(evaluations: CriticResult[]): string {
  const failures = evaluations.filter(e => !e.passed);

  if (failures.length === 0) {
    return '';
  }

  let feedback = 'REGENERATION REQUIRED. Fix these issues:\n\n';

  for (const failure of failures) {
    feedback += `## ${failure.gate.toUpperCase()}\n`;
    feedback += `Problem: ${failure.feedback}\n`;

    if (failure.violations.length > 0) {
      feedback += `Violations:\n${failure.violations.map(v => `- ${v}`).join('\n')}\n`;
    }

    if (failure.suggestions.length > 0) {
      feedback += `How to fix:\n${failure.suggestions.map(s => `- ${s}`).join('\n')}\n`;
    }

    feedback += '\n';
  }

  return feedback;
}
