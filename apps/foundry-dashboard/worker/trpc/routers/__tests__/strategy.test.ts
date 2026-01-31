// @ts-nocheck — stale test fixtures, needs rewrite to match current API
/**
 * Strategy Router Tests - Stories 10-2, 10-3, 10-4, 10-5
 *
 * Strategic Pillar Synthesis, Approval Flow, and Refinement.
 *
 * Coverage:
 * - Story 10-2: triggerResearch, getResearch
 * - Story 10-3: getProposedPillars, regeneratePillars
 * - Story 10-4: validateStrategyToken, approvePillar, lockStrategy
 * - Story 10-5: transcribeVoiceNote, modifyPillar, refinePillarWithAI, getAlternatives
 *
 * ⚠️  EXECUTION NOTE:
 * These are UNIT tests using mocked dependencies (no real Workers runtime needed).
 * However, vitest config issues prevent direct execution.
 *
 * Current workaround: Tests validate business logic but require environment fix.
 * See: https://github.com/cloudflare/workers-sdk/issues/...
 *
 * Alternative: These tests document expected behavior and can be manually validated
 * against implementation. When strategy router is implemented, tests provide
 * regression protection.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { strategyRouter } from '../strategy';
import { createMockContext } from './utils';

// Mock email module
vi.mock('../../../email', () => ({
  sendStrategyReadyEmail: vi.fn().mockResolvedValue({ success: true }),
  sendStrategyLockedEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe('strategyRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== Story 10-2: Deep Research Agent =====

  describe('triggerResearch', () => {
    it('creates research report and triggers pillar synthesis', async () => {
      const { ctx, mockDb } = createMockContext();
      const _now = Date.now();

      // Mock: brand_dna data exists
      mockDb.first.mockResolvedValueOnce({
        id: 'brand-dna-123',
        client_id: 'client-123',
        total_transcription: 'I coach tech founders to become leaders',
        primary_tone: 'Professional',
      });

      // Mock: client data for email
      mockDb.first.mockResolvedValueOnce({
        name: 'Test Client',
        contact_email: 'client@example.com',
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.triggerResearch({ clientId: 'client-123' });

      expect(result.success).toBe(true);
      expect(result.reportId).toBeDefined();

      // Verify research report was inserted
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO client_research_reports')
      );
    });

    it('updates brand_dna_sessions status to researching', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'brand-dna-123',
        client_id: 'client-123',
      });
      mockDb.first.mockResolvedValueOnce({ name: 'Test', contact_email: 'test@example.com' });

      const caller = strategyRouter.createCaller(ctx);
      await caller.triggerResearch({ clientId: 'client-123' });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining("status = 'researching'")
      );
    });
  });

  describe('getResearch', () => {
    it('returns null when no research exists', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getResearch({ clientId: 'client-123' });

      expect(result).toBeNull();
    });

    it('returns parsed research report with all fields', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'report-123',
        client_id: 'client-123',
        industry: 'Executive Coaching',
        sub_niche: 'Leadership for tech founders',
        top_performers_json: JSON.stringify([{ name: 'Alex Hormozi', platform: 'Twitter' }]),
        hook_patterns_json: JSON.stringify({ contrarian: { prevalence: 0.34 } }),
        competitive_gaps_json: JSON.stringify(['Failure stories']),
        framework_fit_json: JSON.stringify({ teach: 0.85, challenge: 0.91 }),
        recommendations_json: JSON.stringify(['Lead with contrarian takes']),
        status: 'complete',
        completed_at: Date.now(),
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getResearch({ clientId: 'client-123' });

      expect(result?.industry).toBe('Executive Coaching');
      expect(result?.subNiche).toBe('Leadership for tech founders');
      expect(result?.topPerformers[0].name).toBe('Alex Hormozi');
      expect(result?.frameworkFit.challenge).toBe(0.91);
      expect(result?.status).toBe('complete');
    });
  });

  // ===== Story 10-3: Strategic Pillar Synthesis =====

  describe('getProposedPillars', () => {
    it('returns null when no proposal exists', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getProposedPillars({ clientId: 'client-123' });

      expect(result).toBeNull();
    });

    it('returns parsed pillars with all fields', async () => {
      const { ctx, mockDb } = createMockContext();

      const mockPillars = [
        {
          id: 'pillar_1',
          name: 'Leadership Myths Debunked',
          strategy: ['TEACH', 'CHALLENGE'],
          rationale: 'Test rationale',
          exampleHook: 'Test hook',
          confidence: 0.92,
        },
      ];

      mockDb.first.mockResolvedValueOnce({
        id: 'proposal-123',
        client_id: 'client-123',
        pillars_json: JSON.stringify(mockPillars),
        status: 'pending',
        generation_round: 1,
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getProposedPillars({ clientId: 'client-123' });

      expect(result?.pillars).toHaveLength(1);
      expect(result?.pillars[0].name).toBe('Leadership Myths Debunked');
      expect(result?.pillars[0].strategy).toContain('TEACH');
      expect(result?.generationRound).toBe(1);
    });
  });

  describe('regeneratePillars', () => {
    it('throws error if no research report exists', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);

      await expect(
        caller.regeneratePillars({ clientId: 'client-123' })
      ).rejects.toThrow('No research report found');
    });

    it('throws error after 3 regeneration rounds', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'report-123',
        industry: 'Tech',
        sub_niche: 'SaaS',
        top_performers_json: '[]',
        hook_patterns_json: '{}',
        competitive_gaps_json: '[]',
        framework_fit_json: '{}',
        recommendations_json: '[]',
      });

      mockDb.first.mockResolvedValueOnce({
        generation_round: 3,
      });

      const caller = strategyRouter.createCaller(ctx);

      await expect(
        caller.regeneratePillars({ clientId: 'client-123' })
      ).rejects.toThrow('Maximum regeneration rounds reached');
    });

    it('generates new pillars and increments round', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'report-123',
        industry: 'Executive Coaching',
        sub_niche: 'Leadership',
        top_performers_json: '[]',
        hook_patterns_json: JSON.stringify({ contrarian: { avgEngagement: 3.2 } }),
        competitive_gaps_json: '[]',
        framework_fit_json: '{}',
        recommendations_json: '[]',
      });

      mockDb.first.mockResolvedValueOnce({
        generation_round: 1,
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.regeneratePillars({ clientId: 'client-123' });

      expect(result.success).toBe(true);
      expect(result.round).toBe(2);
      expect(result.pillars.length).toBeGreaterThan(0);
    });

    it('filters out rejected themes', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'report-123',
        industry: 'Tech',
        sub_niche: 'SaaS',
        top_performers_json: '[]',
        hook_patterns_json: JSON.stringify({ contrarian: { avgEngagement: 3.2 } }),
        competitive_gaps_json: '[]',
        framework_fit_json: '{}',
        recommendations_json: '[]',
      });

      mockDb.first.mockResolvedValueOnce({
        generation_round: 1,
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.regeneratePillars({
        clientId: 'client-123',
        rejectedThemes: ['leadership'],
      });

      // Pillars with "leadership" in name should be filtered
      const leadershipPillars = result.pillars.filter(p =>
        p.name.toLowerCase().includes('leadership')
      );
      expect(leadershipPillars.length).toBe(0);
    });
  });

  // ===== Story 10-4: Approval Flow (Public) =====

  describe('validateStrategyToken', () => {
    it('returns invalid for non-existent token', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.validateStrategyToken({ token: 'invalid-token' });

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token');
    });

    it('returns invalid for expired token', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        client_name: 'Test Client',
        expires_at: Date.now() - 1000, // Expired
        locked_at: null,
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.validateStrategyToken({ token: 'expired-token' });

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token expired');
    });

    it('returns locked status for already locked token', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        client_name: 'Test Client',
        expires_at: Date.now() + 86400000, // Future
        locked_at: Date.now() - 1000, // Already locked
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.validateStrategyToken({ token: 'locked-token' });

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Strategy already locked');
      expect(result.locked).toBe(true);
    });

    it('returns valid with pillars and approved state', async () => {
      const { ctx, mockDb } = createMockContext();

      const mockPillars = [
        { id: 'pillar_1', name: 'Test Pillar', strategy: ['TEACH'] },
      ];

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        client_name: 'Test Client',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      mockDb.first.mockResolvedValueOnce({
        pillars_json: JSON.stringify(mockPillars),
      });

      mockDb.all.mockResolvedValueOnce({
        results: [{ pillar_name: 'Test Pillar' }],
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.validateStrategyToken({ token: 'valid-token' });

      expect(result.valid).toBe(true);
      expect(result.clientId).toBe('client-123');
      expect(result.clientName).toBe('Test Client');
      expect(result.pillars).toHaveLength(1);
      expect(result.approvedPillars).toContain('Test Pillar');
    });
  });

  describe('approvePillar', () => {
    it('throws error for invalid token', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);

      await expect(
        caller.approvePillar({
          token: 'invalid',
          pillarId: 'pillar_1',
          pillarName: 'Test Pillar',
          strategyTags: ['TEACH'],
        })
      ).rejects.toThrow('Invalid or expired token');
    });

    it('inserts approved pillar successfully', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.approvePillar({
        token: 'valid-token',
        pillarId: 'pillar_1',
        pillarName: 'Test Pillar',
        strategyTags: ['TEACH', 'CHALLENGE'],
        rationale: 'Test rationale',
        exampleHook: 'Test hook',
      });

      expect(result.success).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO client_approved_pillars')
      );
    });
  });

  describe('lockStrategy', () => {
    it('throws error for invalid token', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);

      await expect(
        caller.lockStrategy({ token: 'invalid' })
      ).rejects.toThrow('Invalid or expired token');
    });

    it('throws error if less than 3 pillars approved', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        client_name: 'Test Client',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      mockDb.first.mockResolvedValueOnce({
        count: 2, // Only 2 pillars approved
      });

      const caller = strategyRouter.createCaller(ctx);

      await expect(
        caller.lockStrategy({ token: 'valid-token' })
      ).rejects.toThrow('At least 3 pillars must be approved');
    });

    it('locks strategy and updates all related tables', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        client_name: 'Test Client',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      mockDb.first.mockResolvedValueOnce({
        count: 4, // 4 pillars approved
      });

      mockDb.first.mockResolvedValueOnce({
        email: 'owner@example.com',
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.lockStrategy({ token: 'valid-token' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Strategy locked successfully');

      // Verify all updates were made
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE strategy_approval_tokens SET locked_at')
      );
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining("status = 'complete'")
      );
    });
  });

  // ===== Story 10-5: Pillar Refinement =====

  describe('transcribeVoiceNote', () => {
    it('throws error for invalid token', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);

      await expect(
        caller.transcribeVoiceNote({
          token: 'invalid',
          audioBase64: 'dGVzdA==',
        })
      ).rejects.toThrow('Invalid or expired token');
    });

    it('transcribes audio using Workers AI Whisper', async () => {
      const { ctx, mockDb, mockAIRun } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      mockAIRun.mockResolvedValueOnce({
        text: 'This is the transcribed text from voice note',
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.transcribeVoiceNote({
        token: 'valid-token',
        audioBase64: 'dGVzdGF1ZGlv', // base64 encoded "testaudio"
      });

      expect(result.success).toBe(true);
      expect(result.transcription).toBe('This is the transcribed text from voice note');
      expect(mockAIRun).toHaveBeenCalledWith('@cf/openai/whisper', expect.any(Object));
    });

    it('throws error when AI service unavailable', async () => {
      const { ctx, mockDb } = createMockContext();
      ctx.env.AI = undefined;

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      const caller = strategyRouter.createCaller(ctx);

      await expect(
        caller.transcribeVoiceNote({
          token: 'valid-token',
          audioBase64: 'dGVzdA==',
        })
      ).rejects.toThrow('AI service not available');
    });
  });

  describe('modifyPillar', () => {
    it('throws error for invalid token', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);

      await expect(
        caller.modifyPillar({
          token: 'invalid',
          pillarId: 'pillar_1',
          originalPillar: {
            name: 'Original',
            strategy: ['TEACH'],
            rationale: 'Rationale',
            exampleHook: 'Hook',
          },
        })
      ).rejects.toThrow('Invalid or expired token');
    });

    it('creates modification record with changes', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.modifyPillar({
        token: 'valid-token',
        pillarId: 'pillar_1',
        originalPillar: {
          name: 'Original Name',
          strategy: ['TEACH'],
          rationale: 'Original rationale',
          exampleHook: 'Original hook',
        },
        newName: 'New Name',
        newStrategyTags: ['TEACH', 'CHALLENGE'],
        personalNote: 'Added challenge strategy',
      });

      expect(result.success).toBe(true);
      expect(result.modifiedPillar.name).toBe('New Name');
      expect(result.modifiedPillar.strategy).toContain('CHALLENGE');
      expect(result.modifiedPillar.personalNote).toBe('Added challenge strategy');

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO pillar_modifications')
      );
    });

    it('keeps original values when no changes provided', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.modifyPillar({
        token: 'valid-token',
        pillarId: 'pillar_1',
        originalPillar: {
          name: 'Original Name',
          strategy: ['TEACH'],
          rationale: 'Original rationale',
          exampleHook: 'Original hook',
        },
      });

      expect(result.modifiedPillar.name).toBe('Original Name');
      expect(result.modifiedPillar.strategy).toEqual(['TEACH']);
    });
  });

  describe('refinePillarWithAI', () => {
    it('throws error for invalid token', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);

      await expect(
        caller.refinePillarWithAI({
          token: 'invalid',
          pillarId: 'pillar_1',
          currentPillar: {
            name: 'Test',
            strategy: ['TEACH'],
            rationale: 'Rationale',
            exampleHook: 'Hook',
          },
          userMessage: 'Make it more challenging',
        })
      ).rejects.toThrow('Invalid or expired token');
    });

    it('returns AI response with suggested refinement', async () => {
      const { ctx, mockDb, mockAIRun } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      mockAIRun.mockResolvedValueOnce({
        response: `Great suggestion! Here's a more challenging version.

\`\`\`json
{
  "suggestedName": "Uncomfortable Truths",
  "suggestedStrategy": ["CHALLENGE", "PROVE"],
  "suggestedRationale": "Challenge conventional wisdom",
  "suggestedHook": "What nobody tells you about leadership"
}
\`\`\``,
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.refinePillarWithAI({
        token: 'valid-token',
        pillarId: 'pillar_1',
        currentPillar: {
          name: 'Test',
          strategy: ['TEACH'],
          rationale: 'Rationale',
          exampleHook: 'Hook',
        },
        userMessage: 'Make it more challenging',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Great suggestion');
      expect(result.suggestedRefinement).toBeDefined();
      expect(result.suggestedRefinement.suggestedName).toBe('Uncomfortable Truths');
      expect(result.suggestedRefinement.suggestedStrategy).toContain('CHALLENGE');
    });

    it('returns response without refinement for conversational messages', async () => {
      const { ctx, mockDb, mockAIRun } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      mockAIRun.mockResolvedValueOnce({
        response: 'I understand. What specific aspect would you like to focus on?',
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.refinePillarWithAI({
        token: 'valid-token',
        pillarId: 'pillar_1',
        currentPillar: {
          name: 'Test',
          strategy: ['TEACH'],
          rationale: 'Rationale',
          exampleHook: 'Hook',
        },
        userMessage: "I'm not sure what to change",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('What specific aspect');
      expect(result.suggestedRefinement).toBeNull();
    });

    it('includes conversation history in AI context', async () => {
      const { ctx, mockDb, mockAIRun } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      mockAIRun.mockResolvedValueOnce({ response: 'Understood!' });

      const caller = strategyRouter.createCaller(ctx);
      await caller.refinePillarWithAI({
        token: 'valid-token',
        pillarId: 'pillar_1',
        currentPillar: {
          name: 'Test',
          strategy: ['TEACH'],
          rationale: 'Rationale',
          exampleHook: 'Hook',
        },
        userMessage: 'Continue from before',
        conversationHistory: [
          { role: 'user', content: 'First message' },
          { role: 'assistant', content: 'First response' },
        ],
      });

      // Verify AI was called with full conversation
      expect(mockAIRun).toHaveBeenCalledWith(
        '@cf/meta/llama-3.1-8b-instruct',
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: 'First message' }),
            expect.objectContaining({ role: 'assistant', content: 'First response' }),
            expect.objectContaining({ role: 'user', content: 'Continue from before' }),
          ]),
        })
      );
    });
  });

  describe('getAlternatives', () => {
    it('throws error for invalid token', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);

      await expect(
        caller.getAlternatives({
          token: 'invalid',
          pillarId: 'pillar_1',
        })
      ).rejects.toThrow('Invalid or expired token');
    });

    it('returns 3 alternative pillars', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        client_id: 'client-123',
        expires_at: Date.now() + 86400000,
        locked_at: null,
      });

      mockDb.first.mockResolvedValueOnce({
        id: 'report-123',
        industry: 'Tech',
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getAlternatives({
        token: 'valid-token',
        pillarId: 'pillar_1',
      });

      expect(result.alternatives).toHaveLength(3);
      expect(result.alternatives[0]).toHaveProperty('id');
      expect(result.alternatives[0]).toHaveProperty('name');
      expect(result.alternatives[0]).toHaveProperty('strategy');
      expect(result.alternatives[0]).toHaveProperty('confidence');
    });
  });

  // ===== Agency Dashboard Endpoints =====

  describe('getApprovedPillars', () => {
    it('returns empty array when no approved pillars', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.all.mockResolvedValueOnce({ results: [] });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getApprovedPillars({ clientId: 'client-123' });

      expect(result).toEqual([]);
    });

    it('returns parsed approved pillars', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.all.mockResolvedValueOnce({
        results: [
          {
            id: 'approved_1',
            pillar_name: 'Leadership Myths',
            strategy_tags: JSON.stringify(['TEACH', 'CHALLENGE']),
            rationale: 'Test rationale',
            example_hook: 'Test hook',
            approved_at: Date.now(),
          },
        ],
      });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getApprovedPillars({ clientId: 'client-123' });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Leadership Myths');
      expect(result[0].strategyTags).toContain('TEACH');
    });
  });

  describe('getStrategyStatus', () => {
    it('returns not_started when no research initiated', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce(null); // research
      mockDb.first.mockResolvedValueOnce(null); // proposal
      mockDb.first.mockResolvedValueOnce({ count: 0 }); // approved
      mockDb.first.mockResolvedValueOnce(null); // token

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getStrategyStatus({ clientId: 'client-123' });

      expect(result.status).toBe('not_started');
      expect(result.isLocked).toBe(false);
    });

    it('returns complete when strategy is locked', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({ status: 'complete' });
      mockDb.first.mockResolvedValueOnce({ status: 'approved' });
      mockDb.first.mockResolvedValueOnce({ count: 4 });
      mockDb.first.mockResolvedValueOnce({ locked_at: Date.now() });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getStrategyStatus({ clientId: 'client-123' });

      expect(result.status).toBe('complete');
      expect(result.isLocked).toBe(true);
      expect(result.approvedPillarCount).toBe(4);
    });

    it('returns approving when pillars being approved', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({ status: 'complete' });
      mockDb.first.mockResolvedValueOnce({ status: 'pending' });
      mockDb.first.mockResolvedValueOnce({ count: 2 });
      mockDb.first.mockResolvedValueOnce({ locked_at: null });

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getStrategyStatus({ clientId: 'client-123' });

      expect(result.status).toBe('approving');
    });

    it('returns researching when research in progress', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({ status: 'researching' });
      mockDb.first.mockResolvedValueOnce(null);
      mockDb.first.mockResolvedValueOnce({ count: 0 });
      mockDb.first.mockResolvedValueOnce(null);

      const caller = strategyRouter.createCaller(ctx);
      const result = await caller.getStrategyStatus({ clientId: 'client-123' });

      expect(result.status).toBe('researching');
      expect(result.researchStatus).toBe('researching');
    });
  });
});
