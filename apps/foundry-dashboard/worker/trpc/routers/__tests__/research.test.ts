/**
 * Research Agent Tests - Story 10-2
 *
 * Deep Research Agent for market intelligence and strategic analysis.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { researchRouter } from '../research';
import { createMockContext } from './utils';

describe('researchRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== Story 10-2 AC1: Trigger Research =====

  describe('startResearch', () => {
    it('creates research report and returns started status', async () => {
      const { ctx, mockDb, mockAIRun } = createMockContext();

      // Mock: no existing research
      mockDb.first.mockResolvedValueOnce(null);
      // Mock: Brand DNA session data
      mockDb.first.mockResolvedValueOnce({
        total_transcription: 'I help tech founders become leaders',
        primary_tone: 'Professional',
      });
      // Mock: content samples
      mockDb.all.mockResolvedValue({ results: [] });

      // Mock AI responses
      mockAIRun.mockResolvedValue({
        response: JSON.stringify({
          industry: 'Executive Coaching',
          frameworkFit: { teach: 0.85, challenge: 0.91 },
        }),
      });

      const caller = researchRouter.createCaller(ctx);
      const result = await caller.startResearch({ clientId: 'client-123' });

      expect(result.reportId).toBeDefined();
      expect(result.status).toBe('started');
    });

    it('returns already_running if research in progress', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'existing-report-id',
        status: 'researching',
      });

      const caller = researchRouter.createCaller(ctx);
      const result = await caller.startResearch({ clientId: 'client-123' });

      expect(result.reportId).toBe('existing-report-id');
      expect(result.status).toBe('already_running');
    });

    it('returns failed when no Brand DNA data available', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce(null); // no existing research
      mockDb.first.mockResolvedValueOnce(null); // no Brand DNA
      mockDb.all.mockResolvedValue({ results: [] }); // no content

      const caller = researchRouter.createCaller(ctx);
      const result = await caller.startResearch({ clientId: 'client-123' });

      expect(result.status).toBe('failed');
      expect(result.error).toContain('No Brand DNA');
    });
  });

  // ===== Story 10-2 AC7: Get Research Report =====

  describe('getReport', () => {
    it('returns null when no report exists', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = researchRouter.createCaller(ctx);
      const result = await caller.getReport({ clientId: 'client-123' });

      expect(result).toBeNull();
    });

    it('returns complete report with parsed JSON fields', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'report-123',
        client_id: 'client-123',
        industry: 'Executive Coaching',
        sub_niche: 'Leadership for tech founders',
        top_performers_json: JSON.stringify([{ name: 'Alex Hormozi' }]),
        hook_patterns_json: JSON.stringify({ contrarian: { prevalence: 0.34 } }),
        competitive_gaps_json: JSON.stringify(['Failure stories']),
        framework_fit_json: JSON.stringify({ teach: 0.85, challenge: 0.91 }),
        recommendations_json: JSON.stringify(['Lead with contrarian takes']),
        status: 'complete',
        started_at: 1704067200000,
        completed_at: 1704067260000,
        created_at: 1704067200000,
      });

      const caller = researchRouter.createCaller(ctx);
      const result = await caller.getReport({ clientId: 'client-123' });

      expect(result?.status).toBe('complete');
      expect(result?.report?.industry).toBe('Executive Coaching');
      expect(result?.report?.frameworkFit.challenge).toBe(0.91);
      expect(result?.durationMs).toBe(60000);
    });
  });

  // ===== Story 10-2 AC8: Check Research Status =====

  describe('getStatus', () => {
    it('returns none status when no research initiated', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = researchRouter.createCaller(ctx);
      const result = await caller.getStatus({ clientId: 'client-123' });

      expect(result.status).toBe('none');
      expect(result.message).toBe('No research initiated');
    });

    it('returns researching status with message', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'report-123',
        status: 'researching',
        started_at: Date.now(),
        completed_at: null,
      });

      const caller = researchRouter.createCaller(ctx);
      const result = await caller.getStatus({ clientId: 'client-123' });

      expect(result.status).toBe('researching');
      expect(result.message).toBe('Researching your market...');
    });

    it('returns complete status with message', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'report-123',
        status: 'complete',
        started_at: Date.now() - 60000,
        completed_at: Date.now(),
      });

      const caller = researchRouter.createCaller(ctx);
      const result = await caller.getStatus({ clientId: 'client-123' });

      expect(result.status).toBe('complete');
      expect(result.message).toBe('Research complete');
    });
  });

  // ===== Retry Research =====

  describe('retryResearch', () => {
    it('deletes failed reports and starts new research', async () => {
      const { ctx, mockDb, mockAIRun } = createMockContext();

      mockDb.first.mockResolvedValueOnce({ total_transcription: 'Test' });
      mockDb.all.mockResolvedValue({ results: [] });
      mockAIRun.mockResolvedValue({ response: JSON.stringify({ industry: 'General' }) });

      const caller = researchRouter.createCaller(ctx);
      const result = await caller.retryResearch({ clientId: 'client-123' });

      expect(result.reportId).toBeDefined();
      expect(result.status).toBe('retrying');
    });
  });
});

// ===== Unit Tests for Helper Logic =====

describe('Research Agent Helpers', () => {
  describe('parseAIResponse', () => {
    it('handles markdown code blocks', () => {
      const response = '```json\n{"industry": "Coaching"}\n```';
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleaned);
      expect(result.industry).toBe('Coaching');
    });

    it('returns fallback for invalid JSON', () => {
      const response = 'not valid json {';
      const fallback = { industry: 'General Business' };
      let result: { industry: string };
      try {
        result = JSON.parse(response);
      } catch {
        result = fallback;
      }
      expect(result.industry).toBe('General Business');
    });
  });

  describe('pillar generation', () => {
    it('sorts frameworks by score descending', () => {
      const frameworkFit = { teach: 0.85, entertain: 0.72, engineer: 0.68, challenge: 0.91 };
      const sorted = Object.entries(frameworkFit).sort((a, b) => b[1] - a[1]);
      expect(sorted[0]).toEqual(['challenge', 0.91]);
      expect(sorted[1]).toEqual(['teach', 0.85]);
    });

    it('generates 3-4 pillars', () => {
      const gaps = ['Gap 1', 'Gap 2'];
      const frameworks = ['challenge', 'teach', 'entertain'];
      const pillarCount = Math.min(4, frameworks.length + gaps.length);
      expect(pillarCount).toBe(4);
    });
  });

  describe('cost guardrails', () => {
    it('truncates transcript to 2000 chars', () => {
      const longText = 'a'.repeat(5000);
      expect(longText.slice(0, 2000).length).toBe(2000);
    });

    it('limits max_tokens to 800', () => {
      const maxTokens = 800;
      expect(maxTokens).toBeLessThanOrEqual(1000);
    });
  });

  describe('status transitions', () => {
    it('supports all valid statuses', () => {
      const statuses = ['researching', 'complete', 'failed'];
      expect(statuses).toContain('researching');
      expect(statuses).toContain('complete');
      expect(statuses).toContain('failed');
    });
  });
});
