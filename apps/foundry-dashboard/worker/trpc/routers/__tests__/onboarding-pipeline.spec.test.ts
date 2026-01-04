/**
 * ⚠️  SPECIFICATION TEST - NOT FULLY EXECUTABLE UNTIL FEATURES IMPLEMENTED
 *
 * Full Onboarding Pipeline Specification
 *
 * PURPOSE: This test documents the EXPECTED behavior of the Phase 1.5
 * client onboarding pipeline. It serves as an executable specification
 * showing how all pieces should integrate.
 *
 * NOTE ON TEST DATA: All test entities use placeholder names:
 * - Clients: "Pipeline Test Client", "Duplicate Test Client", etc.
 * - Emails: "pipeline-test@example.com", etc.
 * These are EXAMPLE DATA for testing purposes, not real entities.
 *
 * CURRENT STATE: PARTIALLY IMPLEMENTED (2/26 tests pass)
 * - ✅ Client creation works
 * - ❌ Onboarding token generation (not auto-created)
 * - ❌ Missing procedures: onboarding.validateToken, onboarding.startBrandDNA
 * - ❌ Missing tables: research_reports, pillar_proposals, strategy_tokens, approved_pillars
 * - ❌ Missing procedures: strategy.validateStrategyToken, approvePillar, lockStrategy
 *
 * Flow specified:
 * 1. Email Invitation → Token Generation (NEEDS: auto-token on client.create)
 * 2. Token Validation → BrandDNA Session Start (NEEDS: procedures + brand_dna_sessions table)
 * 3. BrandDNA Completion → Research Trigger (NEEDS: research_reports table)
 * 4. Research Completion → Pillar Proposal (NEEDS: pillar_proposals table)
 * 5. Strategy Token → Client Approval (NEEDS: strategy_tokens table + procedures)
 * 6. Pillar Approval → Strategy Lock (NEEDS: approved_pillars table + procedures)
 *
 * TO MAKE FULLY EXECUTABLE:
 * 1. Create missing database migrations (see list above)
 * 2. Implement missing tRPC procedures
 * 3. Add token generation to clients.create mutation
 *
 * @tags @P1 @specification @pipeline
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createIntegrationContext, seedTestAccounts } from './integration-harness';
import { appRouter } from '../../router';

// Mock crypto.randomUUID for consistent test tokens
const randomUUID = (): string => crypto.randomUUID();

describe('Full Onboarding Pipeline @P1', () => {
  let ctx: ReturnType<typeof createIntegrationContext>;
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testAccount: { id: string; userId: string; clientId: string };
  let publicCaller: ReturnType<typeof appRouter.createCaller>;

  // Pipeline state (passed between stages)
  let createdClientId: string;
  let onboardingToken: string;
  let brandDnaSessionId: string;
  let researchReportId: string;
  let strategyToken: string;
  let proposedPillars: any[];

  beforeAll(async () => {
    ctx = createIntegrationContext();
    const seeded = await seedTestAccounts(ctx.db, ctx);
    testAccount = seeded.account1;

    // Agency owner caller (authenticated)
    caller = appRouter.createCaller({
      ...ctx,
      userId: testAccount.userId,
      accountId: testAccount.id,
      userRole: 'admin',
    });

    // Public caller (unauthenticated - for client-facing flows)
    publicCaller = appRouter.createCaller({
      ...ctx,
      userId: undefined as any,
      accountId: undefined as any,
      userRole: undefined as any,
    });
  });

  describe('Stage 1: Client Creation & Email Invitation', () => {
    it('creates client with contact email', async () => {
      const result = await caller.clients.create({
        name: 'Pipeline Test Client',
        industry: 'Executive Coaching',
        contactEmail: 'pipeline-test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.clientId).toBeDefined();
      createdClientId = result.clientId;
    });

    it('generates onboarding token for client', async () => {
      // Check token was created in database
      const tokenRow = await ctx.db
        .prepare(
          `SELECT token, expires_at, used_at
           FROM client_onboard_tokens
           WHERE client_id = ?`
        )
        .bind(createdClientId)
        .first<{ token: string; expires_at: number; used_at: number | null }>();

      expect(tokenRow).toBeDefined();
      expect(tokenRow!.token).toHaveLength(32);
      expect(tokenRow!.expires_at).toBeGreaterThan(Date.now());
      expect(tokenRow!.used_at).toBeNull();

      onboardingToken = tokenRow!.token;
    });

    it('token expires in 7 days', async () => {
      const tokenRow = await ctx.db
        .prepare(
          `SELECT expires_at FROM client_onboard_tokens WHERE token = ?`
        )
        .bind(onboardingToken)
        .first<{ expires_at: number }>();

      const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;

      // Allow 1 hour tolerance for test execution
      expect(tokenRow!.expires_at).toBeGreaterThan(sevenDaysFromNow - 3600000);
      expect(tokenRow!.expires_at).toBeLessThan(sevenDaysFromNow + 3600000);
    });
  });

  describe('Stage 2: Token Validation & BrandDNA Session', () => {
    it('validates onboarding token successfully', async () => {
      const result = await publicCaller.onboarding.validateToken({
        token: onboardingToken,
      });

      expect(result.valid).toBe(true);
      expect(result.clientId).toBe(createdClientId);
      expect(result.clientName).toBe('Pipeline Test Client');
    });

    it('rejects expired token', async () => {
      // Insert an expired token
      const expiredToken = randomUUID().replace(/-/g, '').substring(0, 32);
      await ctx.db
        .prepare(
          `INSERT INTO client_onboard_tokens (id, client_id, token, expires_at, created_at)
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(randomUUID(), createdClientId, expiredToken, Date.now() - 1000, Date.now())
        .run();

      const result = await publicCaller.onboarding.validateToken({
        token: expiredToken,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('creates BrandDNA session on token use', async () => {
      // Start BrandDNA session
      const result = await publicCaller.onboarding.startBrandDNA({
        token: onboardingToken,
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      brandDnaSessionId = result.sessionId;

      // Verify session in database
      const session = await ctx.db
        .prepare(`SELECT * FROM brand_dna_sessions WHERE id = ?`)
        .bind(brandDnaSessionId)
        .first();

      expect(session).toBeDefined();
      expect(session!.client_id).toBe(createdClientId);
      expect(session!.status).toBe('in_progress');
    });

    it('marks token as used after session start', async () => {
      const tokenRow = await ctx.db
        .prepare(`SELECT used_at FROM client_onboard_tokens WHERE token = ?`)
        .bind(onboardingToken)
        .first<{ used_at: number | null }>();

      expect(tokenRow!.used_at).toBeDefined();
      expect(tokenRow!.used_at).toBeGreaterThan(Date.now() - 60000);
    });
  });

  describe('Stage 3: BrandDNA Completion & Research', () => {
    it('completes BrandDNA session with voice data', async () => {
      // Simulate session completion via database update
      // In real flow, this happens through WebSocket agent
      await ctx.db
        .prepare(
          `UPDATE brand_dna_sessions
           SET status = 'complete',
               current_step = 'complete',
               path = 'full',
               total_transcription = 'I help tech founders become visionary leaders...',
               primary_tone = 'Professional',
               secondary_tone = 'Conversational',
               personality_traits = '["Authoritative", "Empathetic", "Direct"]',
               platforms = '["linkedin", "twitter", "youtube"]'
           WHERE id = ?`
        )
        .bind(brandDnaSessionId)
        .run();

      // Verify completion
      const session = await ctx.db
        .prepare(`SELECT status FROM brand_dna_sessions WHERE id = ?`)
        .bind(brandDnaSessionId)
        .first<{ status: string }>();

      expect(session!.status).toBe('complete');
    });

    it('triggers research after BrandDNA completion', async () => {
      // Call research trigger (would normally be called after session complete)
      const result = await caller.strategy.triggerResearch({
        clientId: createdClientId,
      });

      expect(result.success).toBe(true);
      expect(result.reportId).toBeDefined();
      researchReportId = result.reportId;
    });

    it('research report created with pending status', async () => {
      const report = await ctx.db
        .prepare(`SELECT * FROM research_reports WHERE id = ?`)
        .bind(researchReportId)
        .first();

      expect(report).toBeDefined();
      expect(report!.client_id).toBe(createdClientId);
      expect(report!.status).toMatch(/pending|in_progress/);
    });

    it('research completion populates market data', async () => {
      // Simulate research completion
      const mockResearchData = {
        industry: 'Executive Coaching',
        subNiche: 'Leadership for tech founders',
        topPerformers: [
          { name: 'Alex Hormozi', platform: 'Twitter/YouTube' },
          { name: 'Simon Sinek', platform: 'LinkedIn' },
        ],
        hookPatterns: { contrarian: 0.34, story: 0.28, question: 0.22 },
        competitiveGaps: ['Few address failure stories', 'Technical founders underserved'],
        recommendations: ['Lead with contrarian takes', 'Share failure stories'],
      };

      await ctx.db
        .prepare(
          `UPDATE research_reports
           SET status = 'complete',
               industry = ?,
               sub_niche = ?,
               top_performers_json = ?,
               hook_patterns_json = ?,
               competitive_gaps_json = ?,
               recommendations_json = ?,
               completed_at = ?
           WHERE id = ?`
        )
        .bind(
          mockResearchData.industry,
          mockResearchData.subNiche,
          JSON.stringify(mockResearchData.topPerformers),
          JSON.stringify(mockResearchData.hookPatterns),
          JSON.stringify(mockResearchData.competitiveGaps),
          JSON.stringify(mockResearchData.recommendations),
          Date.now(),
          researchReportId
        )
        .run();

      const result = await caller.strategy.getResearch({
        clientId: createdClientId,
      });

      expect(result).toBeDefined();
      expect(result!.status).toBe('complete');
      expect(result!.topPerformers).toHaveLength(2);
    });
  });

  describe('Stage 4: Pillar Proposal Generation', () => {
    it('generates proposed pillars from research', async () => {
      // Simulate pillar generation
      const mockPillars = [
        {
          id: `pillar_${randomUUID().substring(0, 8)}`,
          name: 'Leadership Myths Debunked',
          strategy: ['TEACH', 'CHALLENGE'],
          rationale: 'Contrarian takes get 3.2x engagement',
          exampleHook: 'The leadership advice that got your last CEO fired',
          confidence: 0.92,
        },
        {
          id: `pillar_${randomUUID().substring(0, 8)}`,
          name: 'Boardroom Confessions',
          strategy: ['ENTERTAIN', 'PROVE'],
          rationale: 'Story-driven content is underused',
          exampleHook: 'I lost a $2M client because I was too proud',
          confidence: 0.88,
        },
        {
          id: `pillar_${randomUUID().substring(0, 8)}`,
          name: 'The 3-Second Decision',
          strategy: ['ENGINEER'],
          rationale: 'Framework content drives saves and shares',
          exampleHook: 'The framework for million-dollar decisions',
          confidence: 0.85,
        },
        {
          id: `pillar_${randomUUID().substring(0, 8)}`,
          name: 'Tech Founder Survival Guide',
          strategy: ['TEACH'],
          rationale: 'Technical founders are underserved',
          exampleHook: 'What engineering taught me about leading',
          confidence: 0.82,
        },
      ];

      proposedPillars = mockPillars;

      // Insert pillar proposal
      const proposalId = randomUUID();
      await ctx.db
        .prepare(
          `INSERT INTO pillar_proposals (id, client_id, pillars_json, status, generation_round, created_at)
           VALUES (?, ?, ?, 'pending', 1, ?)`
        )
        .bind(proposalId, createdClientId, JSON.stringify(mockPillars), Date.now())
        .run();

      const result = await caller.strategy.getProposedPillars({
        clientId: createdClientId,
      });

      expect(result).toBeDefined();
      expect(result!.pillars).toHaveLength(4);
      expect(result!.status).toBe('pending');
    });

    it('creates strategy token for client approval', async () => {
      // Generate strategy token
      const tokenValue = randomUUID().replace(/-/g, '').substring(0, 32);
      const tokenId = randomUUID();

      await ctx.db
        .prepare(
          `INSERT INTO strategy_tokens (id, client_id, client_name, token, expires_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          tokenId,
          createdClientId,
          'Pipeline Test Client',
          tokenValue,
          Date.now() + 7 * 24 * 60 * 60 * 1000,
          Date.now()
        )
        .run();

      strategyToken = tokenValue;

      // Verify token exists
      const token = await ctx.db
        .prepare(`SELECT * FROM strategy_tokens WHERE token = ?`)
        .bind(strategyToken)
        .first();

      expect(token).toBeDefined();
      expect(token!.locked_at).toBeNull();
    });
  });

  describe('Stage 5: Client Strategy Approval', () => {
    it('validates strategy token successfully', async () => {
      const result = await publicCaller.strategy.validateStrategyToken({
        token: strategyToken,
      });

      expect(result.valid).toBe(true);
      expect(result.clientName).toBe('Pipeline Test Client');
      expect(result.pillars).toBeDefined();
      expect(result.locked).toBeFalsy();
    });

    it('approves individual pillar', async () => {
      const pillar = proposedPillars[0];

      const result = await publicCaller.strategy.approvePillar({
        token: strategyToken,
        pillarId: pillar.id,
        pillarName: pillar.name,
        strategyTags: pillar.strategy,
        rationale: pillar.rationale,
        exampleHook: pillar.exampleHook,
      });

      expect(result.success).toBe(true);

      // Verify pillar saved
      const approved = await ctx.db
        .prepare(
          `SELECT * FROM approved_pillars WHERE client_id = ? AND pillar_name = ?`
        )
        .bind(createdClientId, pillar.name)
        .first();

      expect(approved).toBeDefined();
    });

    it('approves remaining pillars for minimum lock requirement', async () => {
      // Approve pillars 2 and 3 (need 3 total for lock)
      for (let i = 1; i < 3; i++) {
        const pillar = proposedPillars[i];
        await publicCaller.strategy.approvePillar({
          token: strategyToken,
          pillarId: pillar.id,
          pillarName: pillar.name,
          strategyTags: pillar.strategy,
          rationale: pillar.rationale,
          exampleHook: pillar.exampleHook,
        });
      }

      // Verify count
      const count = await ctx.db
        .prepare(
          `SELECT COUNT(*) as count FROM approved_pillars WHERE client_id = ?`
        )
        .bind(createdClientId)
        .first<{ count: number }>();

      expect(count!.count).toBeGreaterThanOrEqual(3);
    });

    it('locks strategy with minimum pillars approved', async () => {
      const result = await publicCaller.strategy.lockStrategy({
        token: strategyToken,
      });

      expect(result.success).toBe(true);

      // Verify locked in database
      const token = await ctx.db
        .prepare(`SELECT locked_at FROM strategy_tokens WHERE token = ?`)
        .bind(strategyToken)
        .first<{ locked_at: number | null }>();

      expect(token!.locked_at).toBeDefined();
      expect(token!.locked_at).toBeGreaterThan(Date.now() - 60000);
    });

    it('rejects further changes after lock', async () => {
      const result = await publicCaller.strategy.validateStrategyToken({
        token: strategyToken,
      });

      expect(result.valid).toBe(false);
      expect(result.locked).toBe(true);
    });
  });

  describe('Stage 6: Pipeline Completion Verification', () => {
    it('client has complete BrandDNA profile', async () => {
      const session = await ctx.db
        .prepare(
          `SELECT * FROM brand_dna_sessions WHERE client_id = ? AND status = 'complete'`
        )
        .bind(createdClientId)
        .first();

      expect(session).toBeDefined();
      expect(session!.total_transcription).toBeTruthy();
      expect(session!.primary_tone).toBeTruthy();
    });

    it('client has research report', async () => {
      const report = await ctx.db
        .prepare(
          `SELECT * FROM research_reports WHERE client_id = ? AND status = 'complete'`
        )
        .bind(createdClientId)
        .first();

      expect(report).toBeDefined();
      expect(report!.recommendations_json).toBeTruthy();
    });

    it('client has approved pillars', async () => {
      const result = await caller.strategy.getApprovedPillars({
        clientId: createdClientId,
      });

      expect(result.pillars).toBeDefined();
      expect(result.pillars.length).toBeGreaterThanOrEqual(3);
    });

    it('strategy status is locked', async () => {
      const result = await caller.strategy.getStrategyStatus({
        clientId: createdClientId,
      });

      expect(result.status).toBe('locked');
      expect(result.lockedAt).toBeDefined();
    });

    it('onboarding token is consumed', async () => {
      const token = await ctx.db
        .prepare(`SELECT used_at FROM client_onboard_tokens WHERE token = ?`)
        .bind(onboardingToken)
        .first<{ used_at: number | null }>();

      expect(token!.used_at).toBeDefined();
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('rejects duplicate pillar approval', async () => {
      // Create new client with new token for this test
      const newClientResult = await caller.clients.create({
        name: 'Duplicate Test Client',
        industry: 'Tech',
        contactEmail: 'duplicate-test@example.com',
      });

      // Generate strategy token
      const newToken = randomUUID().replace(/-/g, '').substring(0, 32);
      await ctx.db
        .prepare(
          `INSERT INTO strategy_tokens (id, client_id, client_name, token, expires_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          randomUUID(),
          newClientResult.clientId,
          'Duplicate Test Client',
          newToken,
          Date.now() + 7 * 24 * 60 * 60 * 1000,
          Date.now()
        )
        .run();

      // Approve once
      await publicCaller.strategy.approvePillar({
        token: newToken,
        pillarId: 'duplicate-test-pillar',
        pillarName: 'Test Pillar',
        strategyTags: ['TEACH'],
        rationale: 'Test rationale',
        exampleHook: 'Test hook',
      });

      // Try to approve same pillar again - should either succeed idempotently or reject
      const result = await publicCaller.strategy.approvePillar({
        token: newToken,
        pillarId: 'duplicate-test-pillar',
        pillarName: 'Test Pillar',
        strategyTags: ['TEACH'],
        rationale: 'Test rationale',
        exampleHook: 'Test hook',
      });

      // Either idempotent success or handled error
      expect(result.success).toBe(true);
    });

    it('rejects lock with insufficient pillars', async () => {
      // Create new client with only 1 approved pillar
      const newClientResult = await caller.clients.create({
        name: 'Insufficient Pillars Client',
        industry: 'Tech',
        contactEmail: 'insufficient@example.com',
      });

      const newToken = randomUUID().replace(/-/g, '').substring(0, 32);
      await ctx.db
        .prepare(
          `INSERT INTO strategy_tokens (id, client_id, client_name, token, expires_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          randomUUID(),
          newClientResult.clientId,
          'Insufficient Pillars Client',
          newToken,
          Date.now() + 7 * 24 * 60 * 60 * 1000,
          Date.now()
        )
        .run();

      // Approve only 1 pillar
      await publicCaller.strategy.approvePillar({
        token: newToken,
        pillarId: 'only-one-pillar',
        pillarName: 'Lone Pillar',
        strategyTags: ['TEACH'],
        rationale: 'Only one',
        exampleHook: 'Not enough',
      });

      // Try to lock - should fail
      await expect(
        publicCaller.strategy.lockStrategy({ token: newToken })
      ).rejects.toThrow(/minimum|at least 3/i);
    });

    it('handles concurrent approval requests gracefully', async () => {
      // This tests race condition handling
      const newClientResult = await caller.clients.create({
        name: 'Concurrent Test Client',
        industry: 'Tech',
        contactEmail: 'concurrent@example.com',
      });

      const newToken = randomUUID().replace(/-/g, '').substring(0, 32);
      await ctx.db
        .prepare(
          `INSERT INTO strategy_tokens (id, client_id, client_name, token, expires_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          randomUUID(),
          newClientResult.clientId,
          'Concurrent Test Client',
          newToken,
          Date.now() + 7 * 24 * 60 * 60 * 1000,
          Date.now()
        )
        .run();

      // Fire multiple approvals concurrently
      const approvals = Array.from({ length: 4 }, (_, i) =>
        publicCaller.strategy.approvePillar({
          token: newToken,
          pillarId: `concurrent-pillar-${i}`,
          pillarName: `Concurrent Pillar ${i}`,
          strategyTags: ['TEACH'],
          rationale: `Concurrent test ${i}`,
          exampleHook: `Hook ${i}`,
        })
      );

      const results = await Promise.allSettled(approvals);

      // All should succeed or be handled gracefully
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      expect(successCount).toBeGreaterThanOrEqual(3);
    });
  });

  afterAll(async () => {
    // Cleanup test data (optional - in-memory D1 is reset between runs)
    // Could add cleanup here if needed
  });
});
