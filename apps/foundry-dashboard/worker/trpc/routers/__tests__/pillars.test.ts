// @ts-nocheck — stale test fixtures, needs rewrite to match current API
/**
 * Pillars Router Tests
 *
 * Epic 1.5-3: BrandDNA Agent - Pillars & Report
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pillarsRouter } from '../pillars';
import { createMockContext } from './utils';

describe('pillarsRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== Story 1.5-3-1: Topic Pillar Generation =====

  describe('generatePillars', () => {
    it('generates 3-5 pillars with AI', async () => {
      const { ctx, mockAIRun, mockDb } = createMockContext();

      // Mock empty existing data
      mockDb.get.mockResolvedValue(null);
      mockDb.all.mockResolvedValue([]);

      mockAIRun.mockResolvedValue({
        response: JSON.stringify([
          {
            title: 'Industry Disruption',
            description: 'Challenge conventional thinking',
            framework_type: 'catalyst',
            rationale: {
              voiceConnection: 'Aligns with bold tone',
              audienceAlignment: 'Addresses desire for innovation',
              competitorDifferentiation: 'Unique perspective',
            },
          },
          {
            title: 'Behind the Scenes',
            description: 'Share authentic lessons',
            framework_type: 'core_truth',
            rationale: {
              voiceConnection: 'Personal voice',
              audienceAlignment: 'Builds trust',
              competitorDifferentiation: 'Authentic approach',
            },
          },
        ]),
      });

      const caller = pillarsRouter.createCaller(ctx);

      const result = await caller.generatePillars({
        clientId: 'client-123',
      });

      expect(result.count).toBeGreaterThanOrEqual(2);
      expect(result.pillars[0].title).toBe('Industry Disruption');
      expect(result.pillars[0].frameworkType).toBe('catalyst');
      expect(result.meetsNFR).toBe(true); // Under 30 seconds
    });
  });

  // ===== Story 1.5-3-2: Pillar Rationale Display =====

  describe('getPillars', () => {
    it('returns pillars with rationale', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.all.mockResolvedValue([
        {
          id: '1',
          title: 'Test Pillar',
          description: 'Test description',
          rationale: JSON.stringify({
            voiceConnection: 'Voice connection',
            audienceAlignment: 'Audience alignment',
            competitorDifferentiation: 'Competitor diff',
          }),
          status: 'proposed',
          priority: 1,
          framework_type: 'catalyst',
          generated_by: 'ai',
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      ]);

      const caller = pillarsRouter.createCaller(ctx);

      const result = await caller.getPillars({
        clientId: 'client-123',
      });

      expect(result).toHaveLength(1);
      expect(result[0].rationale?.voiceConnection).toBe('Voice connection');
    });
  });

  describe('getPillar', () => {
    it('returns single pillar with expanded rationale', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
        title: 'Industry Disruption',
        description: 'Challenge the status quo',
        rationale: JSON.stringify({
          voiceConnection: 'Bold, contrarian voice',
          audienceAlignment: 'Addresses need for fresh ideas',
          competitorDifferentiation: 'Few competitors take this stance',
        }),
        status: 'proposed',
        priority: 1,
        framework_type: 'catalyst',
        generated_by: 'ai',
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      const caller = pillarsRouter.createCaller(ctx);

      const result = await caller.getPillar({
        clientId: 'client-123',
        pillarId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.title).toBe('Industry Disruption');
      expect(result.rationale?.competitorDifferentiation).toContain('Few competitors');
    });
  });

  // ===== Story 1.5-3-3: Pillar Approve/Edit/Regenerate =====

  describe('approvePillar', () => {
    it('marks pillar as approved', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
        title: 'Test Pillar',
        status: 'proposed',
      });

      const caller = pillarsRouter.createCaller(ctx);

      const result = await caller.approvePillar({
        clientId: 'client-123',
        pillarId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.status).toBe('approved');
    });
  });

  describe('updatePillar', () => {
    it('updates pillar title and marks as user-edited', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
        title: 'Original Title',
        description: 'Original description',
      });

      const caller = pillarsRouter.createCaller(ctx);

      const result = await caller.updatePillar({
        clientId: 'client-123',
        pillarId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Updated Title',
      });

      expect(result.message).toBe('Pillar updated');
    });
  });

  describe('regeneratePillar', () => {
    it('regenerates pillar with feedback', async () => {
      const { ctx, mockAIRun } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
        title: 'Original Pillar',
        description: 'Original description',
        framework_type: 'catalyst',
      });

      mockAIRun.mockResolvedValue({
        response: JSON.stringify({
          title: 'New Contrarian Angle',
          description: 'A bolder take on this topic',
          rationale: {
            voiceConnection: 'More provocative',
            audienceAlignment: 'Addresses deeper frustrations',
            competitorDifferentiation: 'Truly unique stance',
          },
        }),
      });

      const caller = pillarsRouter.createCaller(ctx);

      const result = await caller.regeneratePillar({
        clientId: 'client-123',
        pillarId: '550e8400-e29b-41d4-a716-446655440000',
        feedback: 'more contrarian',
      });

      expect(result.previous.title).toBe('Original Pillar');
      expect(result.new.title).toBe('New Contrarian Angle');
    });
  });

  describe('approveAllPillars', () => {
    it('approves all proposed pillars', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.all.mockResolvedValue([
        { id: '1', status: 'proposed' },
        { id: '2', status: 'proposed' },
        { id: '3', status: 'proposed' },
      ]);

      const caller = pillarsRouter.createCaller(ctx);

      const result = await caller.approveAllPillars({
        clientId: 'client-123',
      });

      expect(result.approvedCount).toBe(3);
      expect(result.message).toContain('3 pillars approved');
    });
  });

  // ===== Story 1.5-3-5: Generate Brand DNA Report =====

  describe('generateReport', () => {
    it('generates comprehensive report with score', async () => {
      const { ctx, mockDb } = createMockContext();

      // Mock data for report generation
      mockDb.get
        .mockResolvedValueOnce({ // brandDna
          primary_tone: 'Bold',
          writing_style: 'Direct',
          target_audience: 'Tech Leaders',
          voice_entities: JSON.stringify({ voiceMarkers: ['innovative'] }),
          sample_count: 5,
        })
        .mockResolvedValueOnce({ // mediums
          written_rank: 1,
          video_rank: 2,
        })
        .mockResolvedValueOnce(null); // existing report

      mockDb.all
        .mockResolvedValueOnce([{ // personas
          name: 'Tech Leader Tom',
          summary: 'Decision maker in tech',
          status: 'approved',
        }])
        .mockResolvedValueOnce([ // platforms
          { platform: 'LinkedIn', status: 'primary', rationale: 'Professional network', posting_cadence: '3x/week' },
          { platform: 'Twitter', status: 'secondary', rationale: 'Real-time', posting_cadence: 'daily' },
        ])
        .mockResolvedValueOnce([ // pillars
          { title: 'Thought Leadership', description: 'Industry insights', status: 'approved', framework_type: 'catalyst' },
          { title: 'Behind the Scenes', description: 'Authentic stories', status: 'approved', framework_type: 'core_truth' },
        ])
        .mockResolvedValueOnce([ // sessions
          { id: '1' },
        ]);

      const caller = pillarsRouter.createCaller(ctx);

      const result = await caller.generateReport({
        clientId: 'client-123',
      });

      expect(result.report.strengthScore).toBeGreaterThan(0);
      expect(result.report.toneSummary).toContain('Bold');
      expect(result.report.pillarsSummary).toHaveLength(2);
    });
  });

  // ===== Story 1.5-3-6: Brand DNA Strength Score =====

  describe('getStrengthScore', () => {
    it('returns score with breakdown', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        strength_score: 75,
        score_breakdown: JSON.stringify({
          voice: 25,
          audience: 20,
          pillars: 12,
          platform: 18,
        }),
        recommendations: JSON.stringify(['Add more voice samples']),
      });

      const caller = pillarsRouter.createCaller(ctx);

      const result = await caller.getStrengthScore({
        clientId: 'client-123',
      });

      expect(result.score).toBe(75);
      expect(result.status).toBe('good');
      expect(result.breakdown?.voice).toBe(25);
    });

    it('returns not-generated when no report', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue(null);

      const caller = pillarsRouter.createCaller(ctx);

      const result = await caller.getStrengthScore({
        clientId: 'client-123',
      });

      expect(result.status).toBe('not-generated');
      expect(result.recommendations).toContain('Generate your Brand DNA Report');
    });
  });
});
