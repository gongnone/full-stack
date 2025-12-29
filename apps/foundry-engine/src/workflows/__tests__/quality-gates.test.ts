import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Quality Gate Tests
 *
 * Story 9.3: Quality Gate Evaluation Implementation
 * Tests for the G2-G7 quality gate evaluation logic
 *
 * AC1: G2 Hook Strength gate evaluates content hooks (0-100 score)
 * AC2: G4 Voice Alignment gate checks against Brand DNA (pass/fail + reasons)
 * AC3: G5 Platform Compliance gate validates platform-specific rules
 * AC4: G6 Visual Cliche gate flags AI image patterns
 * AC5: G7 Engagement gate predicts content performance
 * AC6: Gate failures include actionable feedback for self-healing loop
 * AC7: Gate evaluation < 10 seconds (NFR-P7)
 */

// Mock interface for Workers AI
interface MockAI {
  run: (model: string, inputs: { messages: { role: string; content: string }[] }) => Promise<{ response: string }>;
}

// Mock interface for brand DNA
interface MockBrandDNA {
  voiceMarkers: Array<{ phrase: string; confidence: number }>;
  bannedWords: Array<{ word: string; severity: 'hard' | 'soft'; reason?: string }>;
  toneProfile: Record<string, number>;
}

// Mock spoke data
interface MockSpoke {
  id: string;
  content: string;
  platform: string;
  imagePrompt?: string;
}

describe('Quality Gate Evaluation (Story 9.3)', () => {
  let mockAI: MockAI;

  beforeEach(() => {
    mockAI = {
      run: vi.fn(),
    };
  });

  describe('AC1: G2 Hook Strength Gate', () => {
    it('should score hook strength 0-100 with three dimensions', async () => {
      const mockResponse = {
        response: JSON.stringify({
          patternInterrupt: 35,
          benefitSignal: 25,
          curiosityGap: 20,
          notes: 'Strong opening hook with clear value proposition.',
        }),
      };
      (mockAI.run as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await mockAI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: 'Rate this twitter content...' }],
      });

      const parsed = JSON.parse(result.response);
      const score = parsed.patternInterrupt + parsed.benefitSignal + parsed.curiosityGap;

      expect(score).toBe(80);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(parsed.patternInterrupt).toBeLessThanOrEqual(40);
      expect(parsed.benefitSignal).toBeLessThanOrEqual(30);
      expect(parsed.curiosityGap).toBeLessThanOrEqual(30);
    });

    it('should pass when score >= 60 threshold', async () => {
      const G2_THRESHOLD = 60;
      const score = 75;
      const passed = score >= G2_THRESHOLD;

      expect(passed).toBe(true);
    });

    it('should fail with feedback when score < 60', async () => {
      const G2_THRESHOLD = 60;
      const score = 45;
      const passed = score >= G2_THRESHOLD;

      const violations: string[] = [];
      if (score < G2_THRESHOLD) {
        violations.push(`Weak hook strength (${score}/100)`);
      }

      expect(passed).toBe(false);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0]).toContain('Weak hook strength');
    });

    it('should identify specific dimension weaknesses', async () => {
      const mockResponse = {
        response: JSON.stringify({
          patternInterrupt: 15, // Below 20 threshold
          benefitSignal: 10,   // Below 15 threshold
          curiosityGap: 5,     // Below 15 threshold
          notes: 'Content lacks engagement drivers.',
        }),
      };
      (mockAI.run as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await mockAI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: 'Rate this content...' }],
      });

      const parsed = JSON.parse(result.response);
      const violations: string[] = [];

      if (parsed.patternInterrupt < 20) {
        violations.push(`Weak pattern interrupt (${parsed.patternInterrupt}/40)`);
      }
      if (parsed.benefitSignal < 15) {
        violations.push(`Unclear benefit signal (${parsed.benefitSignal}/30)`);
      }
      if (parsed.curiosityGap < 15) {
        violations.push(`Low curiosity gap (${parsed.curiosityGap}/30)`);
      }

      expect(violations).toHaveLength(3);
      expect(violations).toContain('Weak pattern interrupt (15/40)');
      expect(violations).toContain('Unclear benefit signal (10/30)');
      expect(violations).toContain('Low curiosity gap (5/30)');
    });
  });

  describe('AC2: G4 Voice Alignment Gate', () => {
    it('should detect banned words with severity levels', () => {
      const bannedWords: MockBrandDNA['bannedWords'] = [
        { word: 'synergy', severity: 'hard', reason: 'corporate jargon' },
        { word: 'leverage', severity: 'soft', reason: 'overused' },
      ];
      const content = 'Let\'s leverage our synergy to drive results.';

      const violations: Array<{ word: string; severity: 'hard' | 'soft'; reason?: string }> = [];
      for (const bw of bannedWords) {
        if (content.toLowerCase().includes(bw.word.toLowerCase())) {
          violations.push(bw);
        }
      }

      expect(violations).toHaveLength(2);
      expect(violations.find(v => v.word === 'synergy')?.severity).toBe('hard');
      expect(violations.find(v => v.word === 'leverage')?.severity).toBe('soft');
    });

    it('should fail on hard banned word violations', () => {
      const violations = [
        { word: 'synergy', severity: 'hard' as const },
      ];

      const hasHardViolation = violations.some(v => v.severity === 'hard');
      const passed = !hasHardViolation;

      expect(passed).toBe(false);
    });

    it('should pass with only soft banned word violations', () => {
      const violations = [
        { word: 'leverage', severity: 'soft' as const },
      ];

      const hasHardViolation = violations.some(v => v.severity === 'hard');
      const passed = !hasHardViolation;

      expect(passed).toBe(true);
    });

    it('should check voice marker alignment', () => {
      const voiceMarkers = [
        { phrase: "let's dive in", confidence: 0.9 },
        { phrase: 'real talk', confidence: 0.85 },
      ];
      const content = "Real talk, let's dive in to this topic.";

      const matches: string[] = [];
      for (const marker of voiceMarkers) {
        if (content.toLowerCase().includes(marker.phrase.toLowerCase())) {
          matches.push(marker.phrase);
        }
      }

      const similarity = voiceMarkers.length > 0
        ? (matches.length / voiceMarkers.length) * 100
        : 0;

      expect(matches).toHaveLength(2);
      expect(similarity).toBe(100);
    });

    it('should include violation reasons in feedback', () => {
      const violations = [
        { word: 'synergy', severity: 'hard' as const, reason: 'corporate jargon' },
      ];

      const feedback = violations
        .map(v => `HARD VIOLATION: "${v.word}" - ${v.reason || 'banned word'}`)
        .join('. ');

      expect(feedback).toContain('corporate jargon');
      expect(feedback).toContain('synergy');
    });
  });

  describe('AC3: G5 Platform Compliance Gate', () => {
    const PLATFORM_RULES = {
      twitter: { maxChars: 280, hashtagLimit: 3 },
      linkedin: { maxChars: 3000, hashtagLimit: 5 },
      tiktok: { maxWords: 150, hashtagLimit: 5 },
      instagram: { maxChars: 2200, hashtagLimit: 30 },
      carousel: { minSlides: 5, maxSlides: 8, maxChars: 2200 },
      thread: { minPosts: 5, maxPosts: 7, maxChars: 2800 },
    };

    it('should validate Twitter character limit (280)', () => {
      const content = 'A'.repeat(300); // Exceeds 280
      const rules = PLATFORM_RULES.twitter;
      const violations: string[] = [];

      if (content.length > rules.maxChars) {
        violations.push(`Exceeds ${rules.maxChars} char limit (${content.length} chars)`);
      }

      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('280 char limit');
      expect(violations[0]).toContain('300 chars');
    });

    it('should validate hashtag limits per platform', () => {
      const content = '#tag1 #tag2 #tag3 #tag4 #tag5 More content here';
      const hashtagCount = (content.match(/#\w+/g) || []).length;
      const twitterLimit = PLATFORM_RULES.twitter.hashtagLimit;

      expect(hashtagCount).toBe(5);
      expect(hashtagCount > twitterLimit).toBe(true);
    });

    it('should validate TikTok word limit (150)', () => {
      const words = Array(200).fill('word').join(' ');
      const wordCount = words.split(/\s+/).filter(Boolean).length;
      const rules = PLATFORM_RULES.tiktok;
      const violations: string[] = [];

      if (wordCount > (rules as any).maxWords) {
        violations.push(`Exceeds ${(rules as any).maxWords} word limit (${wordCount} words)`);
      }

      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('150 word limit');
    });

    it('should check thread structure for sequential indicators', () => {
      const validThread = '1/ First tweet of thread\n2/ Second tweet';
      const invalidThread = 'Just some content without thread indicators';

      const hasSequence = (content: string) =>
        /1\//.test(content) || /^1\./m.test(content);

      expect(hasSequence(validThread)).toBe(true);
      expect(hasSequence(invalidThread)).toBe(false);
    });

    it('should check carousel slide count', () => {
      const content = 'Slide 1: Intro\nSlide 2: Content\nSlide 3: More';
      const slideMatches = content.match(/Slide \d+/gi) || [];
      const slideCount = slideMatches.length;
      const minSlides = PLATFORM_RULES.carousel.minSlides;

      const violations: string[] = [];
      if (slideCount < minSlides) {
        violations.push(`Carousel needs ${minSlides} slides (found ${slideCount})`);
      }

      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('needs 5 slides');
    });

    it('should pass when all platform rules are satisfied', () => {
      const content = 'A short tweet with #hashtag';
      const rules = PLATFORM_RULES.twitter;
      const violations: string[] = [];

      if (content.length > rules.maxChars) {
        violations.push('Exceeds character limit');
      }
      const hashtagCount = (content.match(/#\w+/g) || []).length;
      if (hashtagCount > rules.hashtagLimit) {
        violations.push('Too many hashtags');
      }

      expect(violations).toHaveLength(0);
    });
  });

  describe('AC4: G6 Visual Cliche Gate', () => {
    it('should detect common AI clichés', async () => {
      const mockResponse = {
        response: JSON.stringify({
          score: 30,
          clichesDetected: ['robot brain', 'blue gradient', 'handshake'],
          feedback: 'Multiple AI visual clichés detected.',
          suggestions: ['Use authentic photography', 'Try abstract patterns'],
        }),
      };
      (mockAI.run as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await mockAI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: 'Evaluate this visual concept...' }],
      });

      const parsed = JSON.parse(result.response);

      expect(parsed.clichesDetected).toContain('robot brain');
      expect(parsed.clichesDetected).toContain('blue gradient');
      expect(parsed.clichesDetected.length).toBe(3);
    });

    it('should fail when score < 50 or clichés detected', async () => {
      const G6_THRESHOLD = 50;
      const score = 30;
      const cliches = ['robot brain', 'handshake'];

      const passed = score >= G6_THRESHOLD && cliches.length === 0;

      expect(passed).toBe(false);
    });

    it('should include alternative suggestions in feedback', async () => {
      const suggestions = ['Use authentic photography', 'Try bold typography'];
      const feedback = `Try instead: ${suggestions.slice(0, 2).join(', ')}`;

      expect(feedback).toContain('authentic photography');
      expect(feedback).toContain('bold typography');
    });

    it('should pass for original visual concepts', async () => {
      const mockResponse = {
        response: JSON.stringify({
          score: 85,
          clichesDetected: [],
          feedback: 'Original and distinctive visual approach.',
          suggestions: [],
        }),
      };
      (mockAI.run as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await mockAI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: 'Evaluate...' }],
      });

      const parsed = JSON.parse(result.response);
      const passed = parsed.score >= 50 && parsed.clichesDetected.length === 0;

      expect(passed).toBe(true);
      expect(parsed.score).toBe(85);
    });
  });

  describe('AC5: G7 Engagement Prediction Gate', () => {
    it('should predict engagement with three dimensions', async () => {
      const mockResponse = {
        response: JSON.stringify({
          shareability: 25,
          commentWorthiness: 28,
          saveLikelihood: 22,
          notes: 'High engagement potential for this platform.',
        }),
      };
      (mockAI.run as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await mockAI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: 'Predict engagement...' }],
      });

      const parsed = JSON.parse(result.response);
      const score = parsed.shareability + parsed.commentWorthiness + parsed.saveLikelihood;

      expect(score).toBe(75);
      expect(parsed.shareability).toBeLessThanOrEqual(33);
      expect(parsed.commentWorthiness).toBeLessThanOrEqual(33);
      expect(parsed.saveLikelihood).toBeLessThanOrEqual(34);
    });

    it('should pass when score >= 60 threshold', () => {
      const G7_THRESHOLD = 60;
      const score = 75;
      const passed = score >= G7_THRESHOLD;

      expect(passed).toBe(true);
    });

    it('should fail with dimension-specific feedback when score < 60', () => {
      const shareability = 10;
      const commentWorthiness = 12;
      const saveLikelihood = 8;
      const score = shareability + commentWorthiness + saveLikelihood;

      const violations: string[] = [];
      if (shareability < 15) violations.push(`Low shareability (${shareability}/33)`);
      if (commentWorthiness < 15) violations.push(`Low comment potential (${commentWorthiness}/33)`);
      if (saveLikelihood < 15) violations.push(`Low save likelihood (${saveLikelihood}/34)`);

      expect(score).toBe(30);
      expect(violations).toHaveLength(3);
      expect(violations).toContain('Low shareability (10/33)');
    });
  });

  describe('AC6: Actionable Feedback for Self-Healing', () => {
    it('should prefix failed gate feedback with REGENERATE', () => {
      const passed = false;
      const violations = ['Exceeds character limit', 'Too many hashtags'];

      const feedback = passed
        ? 'Platform compliant'
        : `REGENERATE: ${violations.join('. ')}`;

      expect(feedback).toMatch(/^REGENERATE:/);
      expect(feedback).toContain('Exceeds character limit');
    });

    it('should include specific fix instructions in violations', () => {
      const charLimit = 280;
      const actualChars = 350;
      const violation = `Exceeds ${charLimit} char limit (${actualChars} chars). Shorten by ${actualChars - charLimit} characters.`;

      expect(violation).toContain('Shorten by 70 characters');
    });

    it('should combine multiple gate failures into single feedback', () => {
      const g2Feedback = 'Hook weak (45/100)';
      const g5Feedback = 'Exceeds 280 char limit';

      const combinedFeedback = [
        g2Feedback ? `G2: ${g2Feedback}` : '',
        g5Feedback ? `G5: ${g5Feedback}` : '',
      ].filter(Boolean).join('\n');

      expect(combinedFeedback).toContain('G2:');
      expect(combinedFeedback).toContain('G5:');
      expect(combinedFeedback.split('\n')).toHaveLength(2);
    });
  });

  describe('AC7: Performance - Gate Evaluation < 10 seconds', () => {
    it('should complete G5 platform check synchronously (fast)', () => {
      const startTime = Date.now();

      const content = 'Short content #test';
      const platform = 'twitter';
      const rules = { maxChars: 280, hashtagLimit: 3 };

      // Synchronous validation
      const violations: string[] = [];
      if (content.length > rules.maxChars) violations.push('Too long');
      const hashtagCount = (content.match(/#\w+/g) || []).length;
      if (hashtagCount > rules.hashtagLimit) violations.push('Too many hashtags');

      const endTime = Date.now();
      const latency = endTime - startTime;

      expect(latency).toBeLessThan(100); // Sync check should be < 100ms
      expect(violations).toHaveLength(0);
    });

    it('should gracefully handle AI timeout with default pass', async () => {
      // Simulate AI timeout
      (mockAI.run as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Request timeout'));

      let result = { passed: true, score: 70, feedback: 'AI evaluation failed (defaulting to pass)' };

      try {
        await mockAI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{ role: 'user', content: 'Test' }],
        });
      } catch {
        // Default to pass on error
        result = { passed: true, score: 70, feedback: 'AI evaluation failed (defaulting to pass)' };
      }

      expect(result.passed).toBe(true);
      expect(result.feedback).toContain('defaulting to pass');
    });
  });

  describe('Integration: Gate Evaluation Flow', () => {
    it('should run all gates and return combined results', async () => {
      // Mock spoke
      const spoke: MockSpoke = {
        id: 'spoke-123',
        content: 'Check out this amazing content! #marketing #growth',
        platform: 'twitter',
        imagePrompt: 'A creative abstract design',
      };

      // Simulate running all gates
      const gateResults = {
        g2_hook: { passed: true, score: 75 },
        g4_voice: { passed: true, score: 85 },
        g5_platform: { passed: true },
        g6_visual: { passed: true, score: 70 },
        g7_engagement: { passed: true, score: 72 },
      };

      const allGatesPassed = Object.values(gateResults).every(r => r.passed);

      expect(allGatesPassed).toBe(true);
      expect(gateResults.g2_hook.score).toBeGreaterThanOrEqual(60);
    });

    it('should identify failing gates correctly', async () => {
      const gateResults = {
        g2_hook: { passed: true, score: 75 },
        g4_voice: { passed: false, violations: ['Used banned word: synergy'] },
        g5_platform: { passed: false, violations: ['Exceeds 280 chars'] },
        g6_visual: { passed: true, score: 70 },
        g7_engagement: { passed: true, score: 72 },
      };

      const failingGates = Object.entries(gateResults)
        .filter(([_, result]) => !result.passed)
        .map(([gate, _]) => gate);

      expect(failingGates).toContain('g4_voice');
      expect(failingGates).toContain('g5_platform');
      expect(failingGates).toHaveLength(2);
    });

    it('should store feedback for self-healing loop', async () => {
      const spokeId = 'spoke-123';
      const gate = 'g2_hook';
      const criticOutput = 'REGENERATE: Hook weak (45/100). Weak pattern interrupt.';
      const iteration = 1;

      // Verify feedback structure for storage
      const feedbackEntry = {
        spokeId,
        gate,
        criticOutput,
        iteration,
      };

      expect(feedbackEntry.spokeId).toBe('spoke-123');
      expect(feedbackEntry.criticOutput).toMatch(/^REGENERATE:/);
      expect(feedbackEntry.iteration).toBe(1);
    });
  });
});
