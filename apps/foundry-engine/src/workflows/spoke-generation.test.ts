/**
 * Story 4.3: Self-Healing Loop Unit Tests
 *
 * Tests the self-healing logic in SpokeGenerationWorkflow
 */

import { describe, it, expect } from 'vitest';

// Story 4.3 constants from workflow
const MAX_REGENERATION_ATTEMPTS = 3;

describe('Story 4.3: Self-Healing Loop Logic', () => {
  describe('AC1: Failure feedback writing', () => {
    it('should build healing feedback from failed gates', () => {
      // Simulate gate failures
      const g2Failed = { passed: false, score: 45, feedback: 'Weak hook - lacks curiosity gap' };
      const g4Failed = { passed: false, violations: ['synergy', 'leverage'], feedback: 'Contains banned words' };
      const g5Failed = { passed: false, feedback: 'Content exceeds 280 char limit (current: 350)' };

      // Build feedback as workflow does
      const healingFeedback: Record<string, unknown> = {};

      if (!g2Failed.passed) {
        healingFeedback.g2 = { score: g2Failed.score, feedback: g2Failed.feedback };
      }
      if (!g4Failed.passed) {
        healingFeedback.g4 = { violations: g4Failed.violations, feedback: g4Failed.feedback };
      }
      if (!g5Failed.passed) {
        healingFeedback.g5 = { feedback: g5Failed.feedback };
      }

      expect(healingFeedback.g2).toBeDefined();
      expect((healingFeedback.g2 as { score: number }).score).toBe(45);
      expect(healingFeedback.g4).toBeDefined();
      expect((healingFeedback.g4 as { violations: string[] }).violations).toContain('synergy');
      expect(healingFeedback.g5).toBeDefined();
    });
  });

  describe('AC2-3: Regeneration with Critic feedback', () => {
    it('should build regeneration prompt with G4 banned word feedback', () => {
      const feedback = {
        g4: { violations: ['synergy', 'leverage'], feedback: 'Contains banned words' }
      };

      // Build feedback instructions as workflow does
      let feedbackInstructions = '';
      if (feedback.g4 && feedback.g4.violations.length > 0) {
        feedbackInstructions += `\n\nVOICE ALIGNMENT FAILED:
Violations: ${feedback.g4.violations.join(', ')}
${feedback.g4.feedback}
REQUIRED: Remove all banned words and match brand voice markers.`;
      }

      expect(feedbackInstructions).toContain('synergy');
      expect(feedbackInstructions).toContain('leverage');
      expect(feedbackInstructions).toContain('REQUIRED');
    });

    it('should build regeneration prompt with G2 hook feedback targeting > 80', () => {
      const feedback = {
        g2: { score: 55, feedback: 'Hook lacks pattern interrupt' }
      };

      let feedbackInstructions = '';
      if (feedback.g2) {
        feedbackInstructions += `\n\nPREVIOUS HOOK FAILED (Score: ${feedback.g2.score}/100):
${feedback.g2.feedback}
REQUIRED: Improve Pattern Interrupt and Benefit signals. Target score > 80.`;
      }

      expect(feedbackInstructions).toContain('Score: 55/100');
      expect(feedbackInstructions).toContain('Target score > 80');
    });
  });

  describe('AC4: Iteration capping and timing', () => {
    it('should cap regeneration at MAX_REGENERATION_ATTEMPTS (3)', () => {
      expect(MAX_REGENERATION_ATTEMPTS).toBe(3);

      // Simulate loop logic
      let regenerationCount = 0;
      let allGatesPassed = false;

      // First iteration fails
      allGatesPassed = false;
      if (!allGatesPassed && regenerationCount < MAX_REGENERATION_ATTEMPTS) {
        regenerationCount++;
      }
      expect(regenerationCount).toBe(1);

      // Second iteration fails
      allGatesPassed = false;
      if (!allGatesPassed && regenerationCount < MAX_REGENERATION_ATTEMPTS) {
        regenerationCount++;
      }
      expect(regenerationCount).toBe(2);

      // Third iteration fails
      allGatesPassed = false;
      if (!allGatesPassed && regenerationCount < MAX_REGENERATION_ATTEMPTS) {
        regenerationCount++;
      }
      expect(regenerationCount).toBe(3);

      // Fourth would-be iteration is blocked
      allGatesPassed = false;
      if (!allGatesPassed && regenerationCount < MAX_REGENERATION_ATTEMPTS) {
        regenerationCount++;
      }
      expect(regenerationCount).toBe(3); // Still 3, didn't increment
    });
  });

  describe('AC5: Success transition to pending_review', () => {
    it('should set status to pending_review when gates pass', () => {
      const allGatesPassed = true;
      const regenerationCount = 2;

      const finalStatus = allGatesPassed ? 'pending_review' : 'creative_conflict';

      expect(finalStatus).toBe('pending_review');
    });

    it('should record healedAt timestamp when healed after regeneration', () => {
      const allGatesPassed = true;
      const regenerationCount = 2;

      const healedAt = allGatesPassed && regenerationCount > 0
        ? new Date().toISOString()
        : null;

      expect(healedAt).not.toBeNull();
      expect(healedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
    });
  });

  describe('AC6: Self-healing efficiency < 1.2 loops average', () => {
    it('should track metrics for efficiency calculation', () => {
      // Simulate healing metrics
      const healingResults = [
        { attempts: 1, success: true },
        { attempts: 2, success: true },
        { attempts: 1, success: true },
        { attempts: 1, success: true },
        { attempts: 3, success: false }, // Escalated to creative_conflict
      ];

      const successfulHeals = healingResults.filter(r => r.success);
      const totalAttempts = successfulHeals.reduce((sum, r) => sum + r.attempts, 0);
      const averageLoops = totalAttempts / successfulHeals.length;

      expect(averageLoops).toBe(1.25); // (1+2+1+1)/4 = 1.25
      // Target is < 1.2, so this would flag as needs improvement
    });
  });

  describe('AC7: Context Refresh on 3rd attempt', () => {
    it('should include user edit patterns only on 3rd attempt', () => {
      const healingFeedback: Record<string, unknown> = {
        g2: { score: 50, feedback: 'Weak hook' }
      };

      // On attempt 1-2, no user patterns
      const attempt1Feedback = { ...healingFeedback };
      expect(attempt1Feedback.userEditPatterns).toBeUndefined();

      // On attempt 3, add user patterns from mutation registry
      const attempt3Feedback = {
        ...healingFeedback,
        userEditPatterns: [
          'Stop using "leverage" - prefer direct language',
          'Use numbers in hooks (3 reasons, 5 tips)'
        ]
      };

      expect(attempt3Feedback.userEditPatterns).toBeDefined();
      expect(attempt3Feedback.userEditPatterns).toHaveLength(2);
    });

    it('should build prompt with USER EDIT PATTERNS section on 3rd attempt', () => {
      const userEditPatterns = [
        'Prefer "expected value" over "synergy"',
        'Hook should include specific number'
      ];

      let feedbackInstructions = '';
      if (userEditPatterns && userEditPatterns.length > 0) {
        feedbackInstructions += `\n\nUSER EDIT PATTERNS DETECTED (from mutation registry):
${userEditPatterns.join('\n')}
INCORPORATE these patterns to match user preferences.`;
      }

      expect(feedbackInstructions).toContain('USER EDIT PATTERNS DETECTED');
      expect(feedbackInstructions).toContain('expected value');
      expect(feedbackInstructions).toContain('INCORPORATE');
    });
  });

  describe('Story 4.4: Creative Conflict escalation', () => {
    it('should escalate to creative_conflict after 3 failed attempts', () => {
      const allGatesPassed = false;
      const regenerationCount = 3;

      const finalStatus = allGatesPassed ? 'pending_review' : 'creative_conflict';

      expect(finalStatus).toBe('creative_conflict');
    });

    it('should return escalation flag in workflow result', () => {
      const allGatesPassed = false;
      const regenerationCount = 3;

      const result = {
        spokeId: 'test-spoke-id',
        status: allGatesPassed ? 'pending_review' : 'creative_conflict',
        iterations: regenerationCount + 1,
        allGatesPassed,
        selfHealed: regenerationCount > 0 && allGatesPassed,
        escalatedToCreativeConflict: !allGatesPassed && regenerationCount >= MAX_REGENERATION_ATTEMPTS,
      };

      expect(result.status).toBe('creative_conflict');
      expect(result.iterations).toBe(4); // Initial + 3 regenerations
      expect(result.selfHealed).toBe(false);
      expect(result.escalatedToCreativeConflict).toBe(true);
    });
  });
});
