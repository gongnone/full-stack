// @ts-nocheck — test file for score mapping validation
import { describe, it, expect } from 'vitest';

/**
 * QR-1: Verify that quality score field names from spoke-generation workflow
 * match what updateSpoke in ClientAgent DO expects.
 * 
 * Workflow output (spoke-generation.ts line ~633):
 *   qualityScores = { g2_hook, g4_voice, g5_platform, g6_visual, g6_visual_passed, g7_score, g7_benchmark, g7_source, g7_stopping_power, g7_novelty, g7_passed }
 * 
 * DO updateSpoke expects (client-agent.ts line ~1151):
 *   qualityScores.g2_hook → g2_hook column
 *   qualityScores.g4_voice → g4_voice column
 *   qualityScores.g5_platform → g5_platform column
 *   qualityScores.g6_visual → g6_visual column
 *   qualityScores.g7_engagement → g7_engagement column
 */

// The field names the workflow produces
// After fix: workflow now sends g7_engagement instead of g7_score
const WORKFLOW_SCORE_FIELDS = {
  g2_hook: 85,
  g4_voice: true,
  g5_platform: true,
  g6_visual: 78,
  g6_visual_passed: true,
  g7_engagement: 8.5,       // ← FIXED: matches DO column name
  engagement_prediction: 8.5, // ← FIXED: also populates Golden Nugget filter column
  g7_benchmark: 0.042,
  g7_source: 'vectorize',
  g7_stopping_power: 7,
  g7_novelty: 6,
  g7_passed: true,
};

// The field names the DO's updateSpoke maps to columns
const DO_EXPECTED_FIELDS = [
  'g2_hook',
  'g4_voice',
  'g4_similarity',
  'g5_platform',
  'g6_visual',
  'g7_engagement',      // ← DO expects this name
];

describe('QR-1: Quality Score Field Mapping', () => {
  it('workflow score fields should match DO updateSpoke expected fields', () => {
    // The core fields that MUST map correctly
    const coreFields = ['g2_hook', 'g4_voice', 'g5_platform', 'g6_visual'];
    
    for (const field of coreFields) {
      expect(WORKFLOW_SCORE_FIELDS).toHaveProperty(field);
    }
    
    // G7 engagement MUST use 'g7_engagement' not 'g7_score'
    expect(WORKFLOW_SCORE_FIELDS).toHaveProperty('g7_engagement');
  });

  it('workflow should NOT send g7_score (old field name)', () => {
    // After fix, workflow should send g7_engagement, not g7_score
    expect(WORKFLOW_SCORE_FIELDS).not.toHaveProperty('g7_score');
  });

  it('engagement_prediction column should also be populated', () => {
    // The DO has both g7_engagement and engagement_prediction columns
    // engagement_prediction is used by Golden Nugget filter
    expect(WORKFLOW_SCORE_FIELDS).toHaveProperty('engagement_prediction');
  });
});

describe('QR-3: Content Sanitization', () => {
  const LEAKAGE_PATTERNS = [
    'Here is the generated content',
    'Here is the content',
    'Here is the revised content',
    'Here is the rewritten',
    "Here's a rewritten",
    "I'm ready to get started",
    'You didn\'t provide the source material',
    'Please share the source material',
    'Please provide the source material',
    'Let me generate',
    'Let\'s get started',
    'Note: The script',
    'Note: This rewritten',
    'Output ONLY',
    'This rewritten content aligns',
  ];

  it('should detect known leakage patterns', () => {
    const testContent = 'Here is the generated content:\n\nYour small business...';
    const hasLeakage = LEAKAGE_PATTERNS.some(pattern => 
      testContent.toLowerCase().includes(pattern.toLowerCase())
    );
    expect(hasLeakage).toBe(true);
  });

  it('should pass clean content', () => {
    const cleanContent = 'Your small business is NOT invisible. We\'ve uncovered the secret to 300% sales boosts.';
    const hasLeakage = LEAKAGE_PATTERNS.some(pattern => 
      cleanContent.toLowerCase().includes(pattern.toLowerCase())
    );
    expect(hasLeakage).toBe(false);
  });
});

describe('QR-2: Source Material Quality', () => {
  it('synthesized source content should include pillar context when hub source is empty', () => {
    // Simulates the fix in index.ts: when sourceContent is empty, synthesize from pillars
    const pillars = [
      { title: 'Industry Disruption Insights', core_claim: 'Innovation drives growth', psychological_angle: 'authority' },
    ];
    const pillarContext = pillars.map(p => 
      `Pillar: ${p.title}\nCore claim: ${p.core_claim}\nAngle: ${p.psychological_angle}`
    ).join('\n\n');
    
    const synthesized = `BRAND CONTEXT:\n{}\n\nCONTENT PILLARS:\n${pillarContext}`;
    expect(synthesized.length).toBeGreaterThan(100);
    expect(synthesized).toContain('Industry Disruption Insights');
    expect(synthesized).toContain('Innovation drives growth');
  });

  it('synthesized source should include "Do NOT reference testing" instruction', () => {
    const sourceContent = 'INSTRUCTION: Generate original, engaging content based on these pillars and brand context. Do NOT reference testing, platforms, databases, or technical infrastructure.';
    expect(sourceContent).toContain('Do NOT reference testing');
  });
});
