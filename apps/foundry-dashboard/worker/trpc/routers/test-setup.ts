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
        pillar_name: 'Industry Disruption Insights',
        strategy_tags: JSON.stringify(['CATALYST', 'thought-leadership', 'contrarian']),
        rationale: 'Positions brand as thought leader willing to challenge status quo',
        example_hook: 'Challenge conventional wisdom and share contrarian insights that make audiences question industry norms.',
      },
      {
        id: 'test-pillar-core-truth-001',
        pillar_name: 'Behind-the-Scenes Wisdom',
        strategy_tags: JSON.stringify(['CORE_TRUTH', 'authenticity', 'vulnerability']),
        rationale: 'Humanizes brand and builds trust through vulnerability',
        example_hook: 'Share internal processes, mistakes, and lessons learned to build authentic connection.',
      },
      {
        id: 'test-pillar-proof-001',
        pillar_name: 'Results & Case Studies',
        strategy_tags: JSON.stringify(['PROOF', 'social-proof', 'results']),
        rationale: 'Provides social proof and demonstrates expertise',
        example_hook: 'Showcase tangible outcomes and real-world examples of success.',
      },
    ];

    for (const pillar of pillars) {
      const existing = await ctx.db
        .prepare('SELECT id FROM client_approved_pillars WHERE id = ?')
        .bind(pillar.id)
        .first<{ id: string }>();

      if (!existing) {
        await ctx.db
          .prepare(`
            INSERT INTO client_approved_pillars (
              id, client_id, pillar_name, strategy_tags, rationale, example_hook, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            pillar.id,
            clientId,
            pillar.pillar_name,
            pillar.strategy_tags,
            pillar.rationale,
            pillar.example_hook,
            now
          )
          .run();
      }
    }

    // 4. Create Brand DNA data for R-13/R-14 tests
    const existingDna = await ctx.db
      .prepare('SELECT client_id FROM brand_dna WHERE client_id = ?')
      .bind(clientId)
      .first<{ client_id: string }>();

    if (!existingDna) {
      await ctx.db
        .prepare(`
          INSERT INTO brand_dna (
            client_id, primary_tone, writing_style, target_audience,
            tone_profile, signature_patterns, voice_entities,
            strength_score, sample_count, last_calibration_at,
            calibration_source, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          clientId,
          'Professional yet approachable',
          'Clear and concise technical writing',
          'Tech-savvy business leaders',
          JSON.stringify({
            formal_casual: 65,
            serious_playful: 70,
            technical_accessible: 75,
            reserved_expressive: 60,
          }),
          JSON.stringify([
            { phrase: 'cutting-edge innovation', example: 'Our cutting-edge innovation drives results' },
            { phrase: 'data-driven decisions', example: 'We make data-driven decisions' },
            { phrase: 'seamless integration', example: 'Providing seamless integration' },
          ]),
          JSON.stringify({
            bannedWords: ['buzzwords', 'jargon overload', 'empty promises'],
            voiceMarkers: [],
            stances: []
          }),
          82, // strength_score
          5, // sample_count
          now, // last_calibration_at (Unix timestamp)
          'voice_recording',
          now, // created_at
          now  // updated_at
        )
        .run();
    }

    return {
      success: true,
      clientId,
      pillarsCreated: pillars.length,
      brandDnaCreated: !existingDna,
    };
  }),
});
