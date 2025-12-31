/**
 * Audience Router Tests
 *
 * Epic 1.5-2: BrandDNA Agent - Audience & Strategy Discovery
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audienceRouter } from '../audience';
import { createMockContext } from './utils';

describe('audienceRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== Story 1.5-2-0: Import Existing Audience Persona =====

  describe('getPersonaUploadUrl', () => {
    it('returns upload URL for valid file type', async () => {
      const { ctx } = createMockContext();
      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.getPersonaUploadUrl({
        clientId: 'client-123',
        filename: 'persona.pdf',
        fileType: 'pdf',
      });

      expect(result.personaId).toBeDefined();
      expect(result.r2Key).toContain('persona-imports/client-123/');
      expect(result.uploadEndpoint).toContain('/api/upload/');
    });

    it('rejects mismatched file extension', async () => {
      const { ctx } = createMockContext();
      const caller = audienceRouter.createCaller(ctx);

      await expect(
        caller.getPersonaUploadUrl({
          clientId: 'client-123',
          filename: 'persona.pdf',
          fileType: 'txt',
        })
      ).rejects.toThrow('does not match declared type');
    });
  });

  describe('importPersonaFromText', () => {
    it('extracts persona from pasted text', async () => {
      const { ctx, mockAIRun, mockDb } = createMockContext();

      mockAIRun.mockResolvedValue({
        response: JSON.stringify({
          name: 'Marketing Manager Mike',
          age_range: '30-45',
          occupation: 'Marketing Manager',
          interests: ['Technology', 'Leadership'],
          pain_points: ['Not enough time', 'Budget constraints'],
        }),
      });

      mockDb.run.mockResolvedValue({});

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.importPersonaFromText({
        clientId: 'client-123',
        text: 'Our target audience is marketing managers aged 30-45 who work in technology companies. They are interested in leadership and struggle with time management and budget constraints.',
      });

      expect(result.personaId).toBeDefined();
      expect(result.status).toBe('draft');
      expect(result.extracted.name).toBe('Marketing Manager Mike');
    });
  });

  // ===== Story 1.5-2-1: Audience Demographics Questionnaire =====

  describe('createPersona', () => {
    it('creates a new persona from scratch', async () => {
      const { ctx } = createMockContext();
      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.createPersona({
        clientId: 'client-123',
        name: 'Professional Sarah',
      });

      expect(result.personaId).toBeDefined();
      expect(result.name).toBe('Professional Sarah');
      expect(result.status).toBe('draft');
    });
  });

  describe('updateDemographics', () => {
    it('updates demographic fields', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.updateDemographics({
        clientId: 'client-123',
        personaId: '550e8400-e29b-41d4-a716-446655440000',
        ageRange: '25-34',
        gender: 'Female',
        occupation: 'Software Engineer',
      });

      expect(result.message).toBe('Demographics updated');
    });

    it('throws error for non-existent persona', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue(null);

      const caller = audienceRouter.createCaller(ctx);

      await expect(
        caller.updateDemographics({
          clientId: 'client-123',
          personaId: '550e8400-e29b-41d4-a716-446655440000',
          ageRange: '25-34',
        })
      ).rejects.toThrow('Audience persona not found');
    });
  });

  // ===== Story 1.5-2-2: Audience Psychographics Deep Dive =====

  describe('updatePsychographics', () => {
    it('updates psychographic fields', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.updatePsychographics({
        clientId: 'client-123',
        personaId: '550e8400-e29b-41d4-a716-446655440000',
        values: ['Innovation', 'Work-life balance'],
        interests: ['Technology', 'Productivity'],
        painPoints: ['Not enough time', 'Information overload'],
        goals: ['Career growth', 'Stay informed'],
      });

      expect(result.message).toBe('Psychographics updated');
    });
  });

  // ===== Story 1.5-2-3: Content Consumption Habits =====

  describe('updateContentPreferences', () => {
    it('updates content preference fields', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.updateContentPreferences({
        clientId: 'client-123',
        personaId: '550e8400-e29b-41d4-a716-446655440000',
        preferredPlatforms: ['LinkedIn', 'Twitter'],
        contentTypes: ['Articles', 'Videos'],
        consumptionTime: 'Morning commute',
        engagementStyle: 'Likes to comment',
      });

      expect(result.message).toBe('Content preferences updated');
    });
  });

  // ===== Story 1.5-2-4: Generate Audience Persona =====

  describe('generatePersonaSummary', () => {
    it('generates AI summary for persona', async () => {
      const { ctx, mockAIRun } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
        name: 'Professional Sarah',
        age_range: '25-34',
        occupation: 'Marketing Manager',
        values: JSON.stringify(['Innovation']),
        interests: JSON.stringify(['Technology']),
        pain_points: JSON.stringify(['Not enough time']),
        goals: JSON.stringify(['Career growth']),
        preferred_platforms: JSON.stringify(['LinkedIn']),
        content_types: JSON.stringify(['Articles']),
      });

      mockAIRun.mockResolvedValue({
        response: 'Sarah is a 25-34 year old Marketing Manager who values innovation. She consumes content on LinkedIn during her commute, primarily seeking career growth insights.',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.generatePersonaSummary({
        clientId: 'client-123',
        personaId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.summary).toContain('Sarah');
      expect(result.message).toBe('Persona summary generated');
    });
  });

  // ===== Story 1.5-2-5: Review and Approve Persona =====

  describe('getPersona', () => {
    it('returns full persona details', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
        name: 'Professional Sarah',
        status: 'draft',
        source: 'manual',
        age_range: '25-34',
        gender: 'Female',
        location: 'Urban US',
        income_level: 'Middle to High',
        education: "Bachelor's degree",
        occupation: 'Marketing Manager',
        values: JSON.stringify(['Innovation']),
        interests: JSON.stringify(['Technology']),
        pain_points: JSON.stringify(['Not enough time']),
        goals: JSON.stringify(['Career growth']),
        preferred_platforms: JSON.stringify(['LinkedIn']),
        content_types: JSON.stringify(['Articles']),
        consumption_time: 'Morning commute',
        engagement_style: 'Likes to comment',
        summary: 'Test summary',
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.getPersona({
        clientId: 'client-123',
        personaId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.name).toBe('Professional Sarah');
      expect(result.demographics.ageRange).toBe('25-34');
      expect(result.psychographics.values).toContain('Innovation');
      expect(result.contentPreferences.preferredPlatforms).toContain('LinkedIn');
    });
  });

  describe('listPersonas', () => {
    it('returns all personas for client', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.all.mockResolvedValue([
        { id: '1', name: 'Sarah', status: 'approved', source: 'manual', summary: 'Test', created_at: Date.now(), updated_at: Date.now() },
        { id: '2', name: 'Mike', status: 'draft', source: 'imported', summary: null, created_at: Date.now(), updated_at: Date.now() },
      ]);

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.listPersonas({
        clientId: 'client-123',
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Sarah');
      expect(result[1].name).toBe('Mike');
    });
  });

  describe('approvePersona', () => {
    it('marks persona as approved', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
        status: 'draft',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.approvePersona({
        clientId: 'client-123',
        personaId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.status).toBe('approved');
    });
  });

  describe('deletePersona', () => {
    it('deletes persona and associated R2 object', async () => {
      const { ctx, mockR2Delete } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        r2_key: 'persona-imports/client-123/test.pdf',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.deletePersona({
        clientId: 'client-123',
        personaId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.success).toBe(true);
      expect(mockR2Delete).toHaveBeenCalledWith('persona-imports/client-123/test.pdf');
    });
  });

  // ===== Story 1.5-2-6: Competitor Input =====

  describe('saveCompetitors', () => {
    it('saves competitors to session', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.saveCompetitors({
        clientId: 'client-123',
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        competitors: [
          { name: 'Competitor A', url: 'https://competitor-a.com' },
          { name: 'Competitor B' },
        ],
      });

      expect(result.competitorCount).toBe(2);
      expect(result.message).toContain('2 competitors');
    });
  });

  describe('skipCompetitors', () => {
    it('sets empty competitors array', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.skipCompetitors({
        clientId: 'client-123',
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.message).toBe("No problem! We can focus on your unique strengths.");
    });
  });

  // ===== Story 1.5-2-7: Platform Recommendation =====

  describe('generatePlatformRecommendations', () => {
    it('generates platform recommendations', async () => {
      const { ctx, mockAIRun } = createMockContext();

      mockAIRun.mockResolvedValue({
        response: JSON.stringify([
          { platform: 'LinkedIn', status: 'primary', rationale: 'Great for B2B', contentTypes: ['Articles'], postingCadence: '3x/week' },
          { platform: 'Twitter', status: 'primary', rationale: 'Real-time engagement', contentTypes: ['Threads'], postingCadence: 'daily' },
        ]),
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.generatePlatformRecommendations({
        clientId: 'client-123',
      });

      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0].platform).toBe('LinkedIn');
    });
  });

  describe('getPlatformRecommendations', () => {
    it('returns categorized platforms', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.all.mockResolvedValue([
        { id: '1', platform: 'LinkedIn', status: 'primary', priority: 1, content_types: '["Articles"]', posting_cadence: '3x/week' },
        { id: '2', platform: 'Instagram', status: 'secondary', priority: 2, content_types: '["Reels"]', posting_cadence: 'daily' },
      ]);

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.getPlatformRecommendations({
        clientId: 'client-123',
      });

      expect(result.primary).toHaveLength(1);
      expect(result.secondary).toHaveLength(1);
      expect(result.primary[0].platform).toBe('LinkedIn');
    });
  });

  describe('togglePlatformStatus', () => {
    it('changes platform status', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
        status: 'primary',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.togglePlatformStatus({
        clientId: 'client-123',
        platformId: '550e8400-e29b-41d4-a716-446655440000',
        newStatus: 'excluded',
      });

      expect(result.newStatus).toBe('excluded');
    });
  });

  // ===== Story 1.5-2-8: Content Medium Preferences =====

  describe('getMediumPreferences', () => {
    it('returns default preferences when none set', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue(null);

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.getMediumPreferences({
        clientId: 'client-123',
      });

      expect(result.mediums).toHaveLength(4);
      expect(result.mediums[0].type).toBe('written');
      expect(result.mediums[0].rank).toBe(1);
    });
  });

  describe('updateMediumPreferences', () => {
    it('validates unique rankings', async () => {
      const { ctx } = createMockContext();

      const caller = audienceRouter.createCaller(ctx);

      await expect(
        caller.updateMediumPreferences({
          clientId: 'client-123',
          rankings: { written: 1, video: 1, audio: 2, visual: 3 }, // Duplicate rank 1
        })
      ).rejects.toThrow('unique rank');
    });

    it('saves preferences with valid rankings', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue(null);

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.updateMediumPreferences({
        clientId: 'client-123',
        rankings: { written: 2, video: 1, audio: 3, visual: 4 },
      });

      expect(result.message).toContain('saved');
    });
  });

  // ===== Story 1.5-2-9: Posting Cadence Proposal =====

  describe('generateCadenceRecommendations', () => {
    it('generates cadence for existing platforms', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.all
        .mockResolvedValueOnce([
          { id: '1', platform: 'LinkedIn', status: 'primary' },
        ])
        .mockResolvedValueOnce([
          { id: '2', platform: 'Instagram', status: 'secondary' },
        ]);

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.generateCadenceRecommendations({
        clientId: 'client-123',
      });

      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0].frequency).toBe('3x/week'); // LinkedIn default
      expect(result.isRealistic).toBe(true);
    });
  });

  describe('updatePlatformCadence', () => {
    it('updates cadence and warns if unrealistic', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
        platform: 'LinkedIn',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.updatePlatformCadence({
        clientId: 'client-123',
        platformId: '550e8400-e29b-41d4-a716-446655440000',
        frequency: '10x/day',
      });

      expect(result.weeklyPosts).toBe(70);
      expect(result.warning).toContain('ambitious');
    });
  });

  describe('getStrategyComplete', () => {
    it('returns incomplete status when missing components', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.all
        .mockResolvedValueOnce([]) // No personas
        .mockResolvedValueOnce([]); // No platforms

      ctx.drizzle.get = vi.fn().mockResolvedValue(null); // No medium prefs

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.getStrategyComplete({
        clientId: 'client-123',
      });

      expect(result.isComplete).toBe(false);
    });
  });

  // ===== Story 1.5-2-10: Single Audience Prompt =====

  describe('createQuickPersona', () => {
    it('expands one-sentence description to full persona', async () => {
      const { ctx, mockAIRun } = createMockContext();

      mockAIRun.mockResolvedValue({
        response: JSON.stringify({
          name: 'Scaling Sarah',
          age_range: '30-45',
          occupation: 'Tech Founder',
          values: ['Growth', 'Innovation'],
          interests: ['SaaS', 'Startups'],
          pain_points: ['Hiring', 'Scaling'],
          goals: ['$10M ARR'],
          preferred_platforms: ['LinkedIn', 'Twitter'],
          content_types: ['Articles', 'Threads'],
          summary: 'Tech founder scaling from seed to Series A',
        }),
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.createQuickPersona({
        clientId: 'client-123',
        description: 'Tech founders scaling from $1M to $10M ARR',
      });

      expect(result.personaId).toBeDefined();
      expect(result.name).toBe('Scaling Sarah');
      expect(result.source).toBe('generated');
      expect(result.note).toContain('AI-Expanded');
      expect(result.expanded.demographics.occupation).toBe('Tech Founder');
    });

    it('handles AI failure gracefully', async () => {
      const { ctx, mockAIRun } = createMockContext();

      mockAIRun.mockResolvedValue({
        response: 'Sorry, I cannot process this request.',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.createQuickPersona({
        clientId: 'client-123',
        description: 'Small business owners in retail',
      });

      expect(result.name).toBe('Target Audience');
      expect(result.expanded.summary).toBe('Small business owners in retail');
    });
  });

  describe('switchToGuidedFlow', () => {
    it('returns pre-filled data for editing', async () => {
      const { ctx } = createMockContext();

      ctx.drizzle.get = vi.fn().mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        client_id: 'client-123',
        name: 'Scaling Sarah',
        age_range: '30-45',
        occupation: 'Tech Founder',
        values: JSON.stringify(['Growth']),
        interests: JSON.stringify(['SaaS']),
        pain_points: JSON.stringify(['Hiring']),
        goals: JSON.stringify(['$10M ARR']),
        preferred_platforms: JSON.stringify(['LinkedIn']),
        content_types: JSON.stringify(['Articles']),
        consumption_time: 'Morning',
        engagement_style: 'Comments frequently',
      });

      const caller = audienceRouter.createCaller(ctx);

      const result = await caller.switchToGuidedFlow({
        clientId: 'client-123',
        personaId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.currentStep).toBe('demographics');
      expect(result.preFilledData.name).toBe('Scaling Sarah');
      expect(result.preFilledData.demographics.occupation).toBe('Tech Founder');
      expect(result.preFilledData.psychographics.values).toContain('Growth');
    });
  });
});
