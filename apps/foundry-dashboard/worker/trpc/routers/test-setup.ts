import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from '../context';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

/**
 * Test Setup Router
 * ONLY ENABLED IN NON-PRODUCTION ENVIRONMENTS
 * Provides endpoints to set up test data for E2E tests
 */
export const testSetupRouter = t.router({
  /**
   * Initialize test client and pillars for the authenticated user
   * Creates:
   * - A test client (test-client-001)
   * - client_members association
   * - 3 approved pillars (CATALYST, CORE_TRUTH, PROOF)
   */
  initializeTestData: procedure.mutation(async ({ ctx }) => {
    // Security: Only allow in non-production
    if (ctx.env.ENVIRONMENT === 'production') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Test setup not allowed in production',
      });
    }

    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const clientId = 'test-client-001';

    // 1. Create or verify test client exists
    const existingClient = await ctx.db
      .prepare('SELECT id FROM clients WHERE id = ?')
      .bind(clientId)
      .first<{ id: string }>();

    if (!existingClient) {
      await ctx.db
        .prepare(`
          INSERT INTO clients (id, name, status, industry, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(clientId, 'Test Client - E2E', 'active', 'Technology', now, now)
        .run();
    }

    // 2. Create client_members association (idempotent)
    const memberId = `test-member-${ctx.userId.slice(0, 8)}`;
    const existingMember = await ctx.db
      .prepare('SELECT id FROM client_members WHERE user_id = ? AND client_id = ?')
      .bind(ctx.userId, clientId)
      .first<{ id: string }>();

    if (!existingMember) {
      await ctx.db
        .prepare(`
          INSERT INTO client_members (id, client_id, user_id, role, created_at)
          VALUES (?, ?, ?, ?, ?)
        `)
        .bind(memberId, clientId, ctx.userId, 'owner', now)
        .run();
    }

    // 3. Create 3 approved pillars (idempotent)
    const pillars = [
      {
        id: 'test-pillar-catalyst-001',
        title: 'Industry Disruption Insights',
        description:
          'Challenge conventional wisdom and share contrarian insights that make audiences question industry norms.',
        rationale: 'Positions brand as thought leader willing to challenge status quo',
        framework_type: 'CATALYST',
        priority: 1,
      },
      {
        id: 'test-pillar-core-truth-001',
        title: 'Behind-the-Scenes Wisdom',
        description:
          'Share internal processes, mistakes, and lessons learned to build authentic connection.',
        rationale: 'Humanizes brand and builds trust through vulnerability',
        framework_type: 'CORE_TRUTH',
        priority: 2,
      },
      {
        id: 'test-pillar-proof-001',
        title: 'Results & Case Studies',
        description: 'Showcase tangible outcomes and real-world examples of success.',
        rationale: 'Provides social proof and demonstrates expertise',
        framework_type: 'PROOF',
        priority: 3,
      },
    ];

    for (const pillar of pillars) {
      const existing = await ctx.db
        .prepare('SELECT id FROM content_pillars WHERE id = ?')
        .bind(pillar.id)
        .first<{ id: string }>();

      if (!existing) {
        await ctx.db
          .prepare(`
            INSERT INTO content_pillars (
              id, client_id, title, description, rationale,
              status, priority, framework_type, generated_by,
              created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            pillar.id,
            clientId,
            pillar.title,
            pillar.description,
            pillar.rationale,
            'approved',
            pillar.priority,
            pillar.framework_type,
            'system',
            now,
            now
          )
          .run();
      }
    }

    return {
      success: true,
      clientId,
      pillarsCreated: pillars.length,
    };
  }),
});
