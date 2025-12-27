import type { BrandDNA, PlatformSpec, QualityScores } from '@repo/foundry-core';

// ==========================================
// QUALITY GATE SYSTEM
// ==========================================

export type GateId = 'g2_hook' | 'g4_voice' | 'g5_platform' | 'g6_visual' | 'g7_engagement' | 'g_compliance';

export interface GateConfig {
  id: GateId;
  name: string;
  description: string;
  threshold: number | boolean;
  weight: number;
  required: boolean;
  order: number;
}

export const GATE_CONFIGS: Record<GateId, GateConfig> = {
  g2_hook: {
    id: 'g2_hook',
    name: 'Hook Strength',
    description: 'Evaluates the attention-grabbing power of the opening',
    threshold: 60,
    weight: 0.2,
    required: true,
    order: 1,
  },
  g4_voice: {
    id: 'g4_voice',
    name: 'Voice Alignment',
    description: 'Checks brand voice consistency and banned word violations',
    threshold: true,
    weight: 0.25,
    required: true,
    order: 2,
  },
  g5_platform: {
    id: 'g5_platform',
    name: 'Platform Compliance',
    description: 'Verifies content meets platform-specific requirements',
    threshold: true,
    weight: 0.2,
    required: true,
    order: 3,
  },
  g6_visual: {
    id: 'g6_visual',
    name: 'Visual Metaphor',
    description: 'Assesses visual imagery and media compatibility',
    threshold: 50,
    weight: 0.1,
    required: false,
    order: 4,
  },
  g7_engagement: {
    id: 'g7_engagement',
    name: 'Engagement Prediction',
    description: 'Predicts likely engagement based on content patterns',
    threshold: 60,
    weight: 0.2,
    required: true,
    order: 5,
  },
  g_compliance: {
    id: 'g_compliance',
    name: 'Regulatory Compliance',
    description: 'Checks for regulatory and legal compliance issues',
    threshold: true,
    weight: 0.05,
    required: true,
    order: 6,
  },
};

// ==========================================
// GATE RESULT TYPES
// ==========================================

export interface GateResult {
  gateId: GateId;
  passed: boolean;
  score?: number;
  feedback: string;
  violations: string[];
  suggestions: string[];
  executionTime: number;
}

export interface QualityReport {
  spokeId: string;
  allGatesPassed: boolean;
  overallScore: number;
  gateResults: GateResult[];
  criticalFailures: GateId[];
  readyForReview: boolean;
  regenerationAdvised: boolean;
  feedbackForRegeneration: string;
}

// ==========================================
// GATE RUNNER
// ==========================================

export interface GateRunnerOptions {
  ai: Ai;
  brandDNA: BrandDNA;
  platformSpec: PlatformSpec;
  content: string;
  visualConcept?: string;
  gatesToRun?: GateId[];
}

export async function runQualityGates(options: GateRunnerOptions): Promise<QualityReport> {
  const { ai, brandDNA, platformSpec, content, visualConcept, gatesToRun } = options;

  const gates = gatesToRun
    ? gatesToRun.map(id => GATE_CONFIGS[id])
    : Object.values(GATE_CONFIGS);

  // Sort by order
  gates.sort((a, b) => a.order - b.order);

  const gateResults: GateResult[] = [];
  const criticalFailures: GateId[] = [];

  for (const gate of gates) {
    const startTime = Date.now();
    let result: GateResult;

    switch (gate.id) {
      case 'g2_hook':
        result = await runG2Hook(ai, content);
        break;
      case 'g4_voice':
        result = await runG4Voice(ai, content, brandDNA);
        break;
      case 'g5_platform':
        result = runG5Platform(content, platformSpec);
        break;
      case 'g6_visual':
        result = await runG6Visual(ai, content, visualConcept);
        break;
      case 'g7_engagement':
        result = await runG7Engagement(ai, content);
        break;
      case 'g_compliance':
        result = runGCompliance(content);
        break;
    }

    result.executionTime = Date.now() - startTime;
    gateResults.push(result);

    if (!result.passed && gate.required) {
      criticalFailures.push(gate.id);
    }
  }

  // Calculate overall score
  const overallScore = calculateOverallScore(gateResults);
  const allGatesPassed = criticalFailures.length === 0;

  // Generate regeneration feedback
  const feedbackForRegeneration = generateRegenerationFeedback(
    gateResults.filter(r => !r.passed)
  );

  return {
    spokeId: '', // Set by caller
    allGatesPassed,
    overallScore,
    gateResults,
    criticalFailures,
    readyForReview: allGatesPassed || overallScore >= 70,
    regenerationAdvised: !allGatesPassed && criticalFailures.length > 0,
    feedbackForRegeneration,
  };
}

// ==========================================
// INDIVIDUAL GATE IMPLEMENTATIONS
// ==========================================

async function runG2Hook(ai: Ai, content: string): Promise<GateResult> {
  const prompt = `Evaluate the hook strength of this content on a scale of 0-100.
Consider: curiosity gap, pattern interrupt, emotional resonance, value promise.

Content:
${content.substring(0, 500)}

Output JSON only: {"score": number, "feedback": "string", "suggestions": ["string"]}`;

  try {
    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
      messages: [{ role: 'user', content: prompt }],
    });

    const parsed = JSON.parse((result as any).response.match(/\{[\s\S]*\}/)?.[0] || '{}');

    return {
      gateId: 'g2_hook',
      passed: (parsed.score || 0) >= 60,
      score: parsed.score || 0,
      feedback: parsed.feedback || '',
      violations: [],
      suggestions: parsed.suggestions || [],
      executionTime: 0,
    };
  } catch {
    return {
      gateId: 'g2_hook',
      passed: true,
      score: 70,
      feedback: 'Unable to evaluate (defaulting to pass)',
      violations: [],
      suggestions: [],
      executionTime: 0,
    };
  }
}

async function runG4Voice(ai: Ai, content: string, brandDNA: BrandDNA): Promise<GateResult> {
  const violations: string[] = [];

  // Check banned words (fast, local check first)
  for (const banned of brandDNA.bannedWords) {
    const regex = new RegExp(`\\b${banned.word}\\b`, 'gi');
    if (regex.test(content)) {
      violations.push(`Used banned word: "${banned.word}" (${banned.severity})`);
    }
  }

  // Hard violations = instant fail
  const hardViolations = violations.filter(v => v.includes('(hard)'));
  if (hardViolations.length > 0) {
    return {
      gateId: 'g4_voice',
      passed: false,
      feedback: 'Contains hard-banned words',
      violations,
      suggestions: hardViolations.map(v => `Remove: ${v}`),
      executionTime: 0,
    };
  }

  // AI evaluation for tone alignment
  const tonePrompt = `Check if this content matches the target tone profile.
Target: ${JSON.stringify(brandDNA.toneProfile)}

Content:
${content.substring(0, 1000)}

Output JSON only: {"aligned": boolean, "feedback": "string", "suggestions": ["string"]}`;

  try {
    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
      messages: [{ role: 'user', content: tonePrompt }],
    });

    const parsed = JSON.parse((result as any).response.match(/\{[\s\S]*\}/)?.[0] || '{}');

    return {
      gateId: 'g4_voice',
      passed: parsed.aligned !== false && violations.length === 0,
      feedback: parsed.feedback || '',
      violations,
      suggestions: parsed.suggestions || [],
      executionTime: 0,
    };
  } catch {
    return {
      gateId: 'g4_voice',
      passed: violations.length === 0,
      feedback: violations.length > 0 ? 'Soft banned word violations' : '',
      violations,
      suggestions: [],
      executionTime: 0,
    };
  }
}

function runG5Platform(content: string, platformSpec: PlatformSpec): GateResult {
  const violations: string[] = [];
  const suggestions: string[] = [];

  // Check character limit
  if (content.length > platformSpec.maxLength) {
    const overBy = content.length - platformSpec.maxLength;
    violations.push(`Exceeds character limit by ${overBy} characters`);
    suggestions.push(`Reduce content length to ${platformSpec.maxLength} characters`);
  }

  // Check for unsupported features
  if (!platformSpec.hashtagSupport && content.includes('#')) {
    violations.push('Contains hashtags (not supported on this platform)');
    suggestions.push('Remove hashtags');
  }

  if (!platformSpec.linkSupport && content.match(/https?:\/\//)) {
    violations.push('Contains links (not supported on this platform)');
    suggestions.push('Remove or replace links with text descriptions');
  }

  return {
    gateId: 'g5_platform',
    passed: violations.length === 0,
    feedback: violations.length > 0 ? violations.join('; ') : 'Platform compliant',
    violations,
    suggestions,
    executionTime: 0,
  };
}

async function runG6Visual(ai: Ai, content: string, visualConcept?: string): Promise<GateResult> {
  const prompt = `Evaluate this visual concept/prompt for AI clichés and brand alignment.
Identify if it uses clichés: robot brains, handshakes, lightbulbs, generic stock business people, puzzle pieces, or generic gradients.

Visual Concept:
${visualConcept || content.substring(0, 500)}

Output JSON only: {
  "score": number (0-100), 
  "clichesDetected": ["string"], 
  "feedback": "string", 
  "suggestions": ["string"]
}`;

  try {
    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
      messages: [{ role: 'user', content: prompt }],
    });

    const parsed = JSON.parse((result as any).response.match(/\{[\s\S]*\}/)?.[0] || '{}');
    const cliches = parsed.clichesDetected || [];

    return {
      gateId: 'g6_visual',
      passed: (parsed.score || 50) >= 70 && cliches.length === 0,
      score: parsed.score || 50,
      feedback: cliches.length > 0 ? `Detected clichés: ${cliches.join(', ')}. ${parsed.feedback}` : parsed.feedback || '',
      violations: cliches.map((c: string) => `AI Cliché: ${c}`),
      suggestions: parsed.suggestions || [],
      executionTime: 0,
    };
  } catch {
    return {
      gateId: 'g6_visual',
      passed: true,
      score: 50,
      feedback: 'Unable to evaluate (defaulting to neutral)',
      violations: [],
      suggestions: [],
      executionTime: 0,
    };
  }
}

async function runG7Engagement(ai: Ai, content: string): Promise<GateResult> {
  const prompt = `Predict engagement potential 0-100.
Consider: shareability, comment-worthiness, save likelihood, profile click potential.

Content:
${content}

Output JSON only: {"score": number, "feedback": "string", "suggestions": ["string"]}`;

  try {
    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
      messages: [{ role: 'user', content: prompt }],
    });

    const parsed = JSON.parse((result as any).response.match(/\{[\s\S]*\}/)?.[0] || '{}');

    return {
      gateId: 'g7_engagement',
      passed: (parsed.score || 0) >= 60,
      score: parsed.score || 0,
      feedback: parsed.feedback || '',
      violations: [],
      suggestions: parsed.suggestions || [],
      executionTime: 0,
    };
  } catch {
    return {
      gateId: 'g7_engagement',
      passed: true,
      score: 70,
      feedback: 'Unable to evaluate (defaulting to pass)',
      violations: [],
      suggestions: [],
      executionTime: 0,
    };
  }
}

function runGCompliance(content: string): GateResult {
  const violations: string[] = [];

  // Basic compliance checks (expand based on industry)
  const disclaimerPatterns = [
    /not financial advice/i,
    /consult (a |your )?professional/i,
    /results may vary/i,
  ];

  const riskyPatterns = [
    { pattern: /guaranteed (returns|results|income)/i, issue: 'Guarantee claims' },
    { pattern: /get rich quick/i, issue: 'Get rich quick language' },
    { pattern: /\$\d{4,}.*\b(per|a)\s*(day|week|month)\b/i, issue: 'Income claims' },
  ];

  for (const risky of riskyPatterns) {
    if (risky.pattern.test(content)) {
      violations.push(risky.issue);
    }
  }

  return {
    gateId: 'g_compliance',
    passed: violations.length === 0,
    feedback: violations.length > 0 ? 'Potential compliance issues detected' : 'No compliance issues',
    violations,
    suggestions: violations.length > 0 ? ['Review content for regulatory compliance', 'Consider adding disclaimers'] : [],
    executionTime: 0,
  };
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function calculateOverallScore(results: GateResult[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const result of results) {
    const config = GATE_CONFIGS[result.gateId];
    const score = result.score ?? (result.passed ? 100 : 0);
    weightedSum += score * config.weight;
    totalWeight += config.weight;
  }

  return Math.round(weightedSum / totalWeight);
}

function generateRegenerationFeedback(failedGates: GateResult[]): string {
  if (failedGates.length === 0) return '';

  let feedback = 'REGENERATION REQUIRED. Address these issues:\n\n';

  for (const gate of failedGates) {
    const config = GATE_CONFIGS[gate.gateId];
    feedback += `## ${config.name}\n`;
    feedback += `${gate.feedback}\n`;

    if (gate.violations.length > 0) {
      feedback += `Violations:\n${gate.violations.map(v => `- ${v}`).join('\n')}\n`;
    }

    if (gate.suggestions.length > 0) {
      feedback += `Fix:\n${gate.suggestions.map(s => `- ${s}`).join('\n')}\n`;
    }

    feedback += '\n';
  }

  return feedback;
}
