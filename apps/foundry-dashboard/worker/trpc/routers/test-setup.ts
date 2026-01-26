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

  /**
   * Generate test spokes for review sprint E2E tests
   * Creates:
   * - 2 hub_sources (text type)
   * - 2 hubs linked to sources
   * - 10 spokes in 'ready' status for review (2 per platform across different pillars)
   */
  generateTestSpokes: procedure.mutation(async ({ ctx }) => {
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

    // Verify client exists
    const existingClient = await ctx.db
      .prepare('SELECT id FROM clients WHERE id = ?')
      .bind(clientId)
      .first<{ id: string }>();

    if (!existingClient) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Test client not found. Run initializeTestData first.',
      });
    }

    // Get or create extracted_pillars (linked to hubs)
    // First check if we already have extracted pillars
    const existingPillars = await ctx.db
      .prepare('SELECT id FROM extracted_pillars WHERE client_id = ? LIMIT 3')
      .bind(clientId)
      .all<{ id: string }>();

    let pillarIds: string[] = [];

    if (existingPillars.results && existingPillars.results.length >= 3) {
      pillarIds = existingPillars.results.map(p => p.id);
    } else {
      // Create extracted_pillars for the hubs we're about to create
      const extractedPillars = [
        {
          id: 'test-extracted-pillar-001',
          source_id: 'test-source-001',
          hub_id: 'test-hub-001',
          title: 'Innovation & Disruption',
          core_claim: 'Technology innovation drives market disruption',
          supporting_evidence: JSON.stringify(['Industry trends', 'Market data', 'Case studies']),
          confidence_score: 0.85,
        },
        {
          id: 'test-extracted-pillar-002',
          source_id: 'test-source-001',
          hub_id: 'test-hub-001',
          title: 'Authentic Leadership',
          core_claim: 'Authentic leadership builds trust and drives team performance',
          supporting_evidence: JSON.stringify(['Research findings', 'Expert insights']),
          confidence_score: 0.82,
        },
        {
          id: 'test-extracted-pillar-003',
          source_id: 'test-source-002',
          hub_id: 'test-hub-002',
          title: 'Data-Driven Results',
          core_claim: 'Data-driven decision making produces measurable outcomes',
          supporting_evidence: JSON.stringify(['Statistical analysis', 'Performance metrics']),
          confidence_score: 0.88,
        },
      ];

      for (const pillar of extractedPillars) {
        const existing = await ctx.db
          .prepare('SELECT id FROM extracted_pillars WHERE id = ?')
          .bind(pillar.id)
          .first<{ id: string }>();

        if (!existing) {
          await ctx.db
            .prepare(`
              INSERT INTO extracted_pillars (
                id, source_id, client_id, hub_id, title, core_claim,
                supporting_evidence, confidence_score, created_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
              pillar.id,
              pillar.source_id,
              clientId,
              pillar.hub_id,
              pillar.title,
              pillar.core_claim,
              pillar.supporting_evidence,
              pillar.confidence_score,
              now
            )
            .run();
        }
      }

      pillarIds = extractedPillars.map(p => p.id);
    }

    // 1. Create hub_sources (idempotent)
    const hubSources = [
      {
        id: 'test-source-001',
        title: 'E2E Test Content Source 1',
        source_type: 'text',
        raw_content: 'This is test content for E2E testing. It contains insights about technology innovation and disruption.',
        character_count: 105,
        word_count: 16,
      },
      {
        id: 'test-source-002',
        title: 'E2E Test Content Source 2',
        source_type: 'text',
        raw_content: 'Additional test content for generating varied spokes. Focus on authenticity and real-world results.',
        character_count: 103,
        word_count: 14,
      },
    ];

    for (const source of hubSources) {
      const existing = await ctx.db
        .prepare('SELECT id FROM hub_sources WHERE id = ?')
        .bind(source.id)
        .first<{ id: string }>();

      if (!existing) {
        await ctx.db
          .prepare(`
            INSERT INTO hub_sources (
              id, client_id, user_id, title, source_type, raw_content,
              character_count, word_count, status, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            source.id,
            clientId,
            ctx.userId,
            source.title,
            source.source_type,
            source.raw_content,
            source.character_count,
            source.word_count,
            'ready',
            now,
            now
          )
          .run();
      }
    }

    // 2. Create hubs (idempotent)
    const hubs = [
      {
        id: 'test-hub-001',
        source_id: 'test-source-001',
        title: 'E2E Test Hub 1 - Innovation',
        pillar_count: 2,
        spoke_count: 5,
      },
      {
        id: 'test-hub-002',
        source_id: 'test-source-002',
        title: 'E2E Test Hub 2 - Authenticity',
        pillar_count: 1,
        spoke_count: 5,
      },
    ];

    for (const hub of hubs) {
      const existing = await ctx.db
        .prepare('SELECT id FROM hubs WHERE id = ?')
        .bind(hub.id)
        .first<{ id: string }>();

      if (!existing) {
        await ctx.db
          .prepare(`
            INSERT INTO hubs (
              id, client_id, user_id, source_id, title, source_type,
              pillar_count, spoke_count, status, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            hub.id,
            clientId,
            ctx.userId,
            hub.source_id,
            hub.title,
            'text',
            hub.pillar_count,
            hub.spoke_count,
            'ready',
            now,
            now
          )
          .run();
      }
    }

    // 3. Create spokes in 'ready' status for review (idempotent)
    const platforms = ['twitter', 'linkedin', 'tiktok', 'instagram', 'newsletter'] as const;
    const psychAngles = ['Contrarian', 'Authority', 'Curiosity', 'Aspiration', 'Transformation'] as const;

    const spokes = [];
    let spokeIndex = 0;

    // Generate 2 spokes per platform (10 total)
    for (let i = 0; i < platforms.length; i++) {
      for (let j = 0; j < 2; j++) {
        spokeIndex++;
        const hubId = j === 0 ? 'test-hub-001' : 'test-hub-002';
        const pillarId = pillarIds[i % pillarIds.length];
        const platform = platforms[i];
        const psychAngle = psychAngles[i];

        spokes.push({
          id: `test-spoke-${String(spokeIndex).padStart(3, '0')}`,
          hub_id: hubId,
          pillar_id: pillarId,
          platform,
          content: `Test ${platform} post #${spokeIndex}: ${psychAngle} angle. This is compelling content that demonstrates ${pillarId.includes('catalyst') ? 'disruption' : pillarId.includes('core-truth') ? 'authenticity' : 'results'}. Engaging hook that captures attention and drives action. #testcontent #e2e`,
          psychological_angle: psychAngle,
          g2_score: 75 + (spokeIndex % 20), // Vary scores 75-95
          g4_status: 'pass',
          g5_status: 'pass',
        });
      }
    }

    // Create spokes via Durable Object (not D1 directly)
    // The DO manages spoke state in its own SQL storage
    for (const spoke of spokes) {
      try {
        await ctx.callAgent(clientId, 'createSpoke', {
          id: spoke.id,
          hubId: spoke.hub_id,
          pillarId: spoke.pillar_id,
          platform: spoke.platform,
          content: spoke.content,
          status: 'generating', // Use 'generating' for review queue visibility
          regenerationCount: 0,
          parentSpokeId: null,
        });
      } catch (error: any) {
        // Spoke might already exist, continue
        if (!error.message?.includes('UNIQUE constraint')) {
          console.error(`Failed to create spoke ${spoke.id}:`, error);
        }
      }
    }

    return {
      success: true,
      clientId,
      hubSourcesCreated: hubSources.length,
      hubsCreated: hubs.length,
      extractedPillarsCreated: pillarIds.length,
      spokesCreated: spokes.length,
      platforms: platforms,
    };
  }),
});
