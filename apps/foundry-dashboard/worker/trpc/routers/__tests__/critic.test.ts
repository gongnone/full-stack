/**
 * Critic Router Tests
 *
 * Epic 1.5-5: Critic Agent - Quality Scoring Lite
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { criticRouter } from '../critic';
import { createMockContext } from './utils';

describe('criticRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== Story 1.5-5-1: G2 Hook Strength Scoring =====

  describe('scoreHook', () => {
    it('scores hook strength with AI', async () => {
      const { ctx, mockAIRun, mockCallAgent } = createMockContext();

      mockAIRun.mockResolvedValue({
        response: JSON.stringify({ score: 85, feedback: 'Strong opening question' }),
      });
      mockCallAgent.mockResolvedValue({ success: true });

      const caller = criticRouter.createCaller(ctx);

      const result = await caller.scoreHook({
        clientId: 'client-123',
        spokeId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'What if everything you knew about marketing was wrong?',
      });

      expect(result.score).toBe(85);
      expect(result.status).toBe('excellent');
      expect(mockCallAgent).toHaveBeenCalledWith('client-123', 'updateSpokeScores', expect.any(Object));
    });

    it('falls back to heuristics on AI failure', async () => {
      const { ctx, mockAIRun } = createMockContext();

      mockAIRun.mockRejectedValue(new Error('AI unavailable'));

      const caller = criticRouter.createCaller(ctx);

      const result = await caller.scoreHook({
        clientId: 'client-123',
        spokeId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Stop making this mistake with your content strategy.',
      });

      // Should use heuristic scoring
      expect(result.score).toBeGreaterThan(0);
      expect(result.feedback).toBe('Scored using heuristics');
    });
  });

  // ===== Story 1.5-5-2: G4 Brand Voice Alignment =====

  describe('scoreVoiceAlignment', () => {
    it('flags banned words immediately', async () => {
      const { ctx, mockDb, mockCallAgent } = createMockContext();

      mockDb.first.mockResolvedValue({
        primary_tone: 'Professional',
        writing_style: 'Direct',
        voice_entities: JSON.stringify({
          voiceMarkers: ['innovative', 'data-driven'],
          bannedWords: ['synergy', 'leverage'],
        }),
      });
      mockCallAgent.mockResolvedValue({ success: true });

      const caller = criticRouter.createCaller(ctx);

      const result = await caller.scoreVoiceAlignment({
        clientId: 'client-123',
        spokeId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Let\'s leverage synergy to maximize results.',
      });

      expect(result.score).toBe(0);
      expect(result.status).toBe('flagged');
      expect(result.bannedWordsFound).toContain('synergy');
      expect(result.bannedWordsFound).toContain('leverage');
    });

    it('returns uncalibrated when no Brand DNA', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValue(null);

      const caller = criticRouter.createCaller(ctx);

      const result = await caller.scoreVoiceAlignment({
        clientId: 'client-123',
        spokeId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Some content to analyze.',
      });

      expect(result.status).toBe('uncalibrated');
      expect(result.score).toBe(50);
    });
  });

  // ===== Story 1.5-5-3: G5 Platform Compliance =====

  describe('scorePlatformCompliance', () => {
    it('penalizes content over character limit', async () => {
      const { ctx, mockCallAgent } = createMockContext();

      mockCallAgent.mockResolvedValue({ success: true });

      const caller = criticRouter.createCaller(ctx);

      // Create content over Twitter's 280 char limit
      const longContent = 'A'.repeat(350);

      const result = await caller.scorePlatformCompliance({
        clientId: 'client-123',
        spokeId: '550e8400-e29b-41d4-a716-446655440000',
        content: longContent,
        platform: 'twitter',
      });

      expect(result.score).toBeLessThan(100);
      expect(result.issues).toContain(expect.stringContaining('over limit'));
      expect(result.status).not.toBe('compliant');
    });

    it('flags excessive hashtags', async () => {
      const { ctx, mockCallAgent } = createMockContext();

      mockCallAgent.mockResolvedValue({ success: true });

      const caller = criticRouter.createCaller(ctx);

      const result = await caller.scorePlatformCompliance({
        clientId: 'client-123',
        spokeId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Content #one #two #three #four #five #six #seven',
        platform: 'twitter', // Limit is 2
      });

      expect(result.issues).toContain(expect.stringContaining('hashtags'));
    });

    it('passes compliant content', async () => {
      const { ctx, mockCallAgent } = createMockContext();

      mockCallAgent.mockResolvedValue({ success: true });

      const caller = criticRouter.createCaller(ctx);

      const result = await caller.scorePlatformCompliance({
        clientId: 'client-123',
        spokeId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Short tweet #topic',
        platform: 'twitter',
      });

      expect(result.score).toBe(100);
      expect(result.status).toBe('compliant');
    });
  });

  // ===== Story 1.5-5-5: Flag Low Scoring Spokes =====

  describe('getFlaggedSpokes', () => {
    it('returns spokes below threshold', async () => {
      const { ctx, mockCallAgent } = createMockContext();

      mockCallAgent.mockResolvedValue([
        { id: 'spoke-1', content: 'Weak hook...', platform: 'twitter', qualityScores: { g2_hook: 30 }, flagReason: 'Low hook score' },
        { id: 'spoke-2', content: 'Bad voice...', platform: 'linkedin', qualityScores: { g4_voice: 25 }, flagReason: 'Voice mismatch' },
      ]);

      const caller = criticRouter.createCaller(ctx);

      const result = await caller.getFlaggedSpokes({
        clientId: 'client-123',
        threshold: 50,
      });

      expect(result.items).toHaveLength(2);
      expect(result.threshold).toBe(50);
    });
  });

  // ===== Story 1.5-5-7: Critic Calibration =====

  describe('recordApprovalFeedback', () => {
    it('records approval and returns calibration stats', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.run.mockResolvedValue({ success: true });
      mockDb.first.mockResolvedValue({
        total: 100,
        approved: 75,
        edited: 20,
      });

      const caller = criticRouter.createCaller(ctx);

      const result = await caller.recordApprovalFeedback({
        clientId: 'client-123',
        spokeId: '550e8400-e29b-41d4-a716-446655440000',
        wasApproved: true,
      });

      expect(result.recorded).toBe(true);
      expect(result.calibrationStats.approvalRate).toBe(75);
      expect(result.calibrationStats.editRate).toBe(20);
    });
  });

  // ===== Story 1.5-5-8: Suggest Rewrites =====

  describe('suggestRewrite', () => {
    it('generates rewrite suggestions for weak hooks', async () => {
      const { ctx, mockDb, mockAIRun } = createMockContext();

      mockDb.first.mockResolvedValue({
        primary_tone: 'Bold',
        writing_style: 'Direct',
        target_audience: 'Entrepreneurs',
      });

      mockAIRun.mockResolvedValue({
        response: JSON.stringify({
          suggestions: [
            'Stop scrolling. This will change how you think about growth.',
            'Warning: This advice contradicts everything you\'ve been told.',
          ],
          explanation: 'Added urgency and curiosity gap',
        }),
      });

      const caller = criticRouter.createCaller(ctx);

      const result = await caller.suggestRewrite({
        clientId: 'client-123',
        spokeId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Here is some content about growth.',
        platform: 'linkedin',
        issue: 'weak-hook',
      });

      expect(result.suggestions).toHaveLength(2);
      expect(result.explanation).toContain('curiosity');
    });
  });

  // ===== Batch Scoring =====

  describe('scoreAll', () => {
    it('scores all metrics and calculates G7 overall', async () => {
      const { ctx, mockDb, mockAIRun, mockCallAgent } = createMockContext();

      mockDb.first.mockResolvedValue({
        primary_tone: 'Professional',
      });

      mockAIRun.mockResolvedValue({
        response: JSON.stringify({ score: 80, feedback: 'Good' }),
      });
      mockCallAgent.mockResolvedValue({ success: true });

      const caller = criticRouter.createCaller(ctx);

      const result = await caller.scoreAll({
        clientId: 'client-123',
        spokeId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Quality content for testing',
        platform: 'linkedin',
      });

      expect(result.scores.g2_hook).toBeDefined();
      expect(result.scores.g4_voice).toBeDefined();
      expect(result.scores.g5_platform).toBeDefined();
      expect(result.scores.g7_overall).toBeDefined();
      expect(result.overallStatus).toBeDefined();
    });
  });
});
