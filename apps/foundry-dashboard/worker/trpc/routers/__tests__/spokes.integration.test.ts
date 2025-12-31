import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spokesRouter } from '../spokes';
import { createIntegrationContext, setupTestDatabase } from './integration-harness';
import type { IntegrationContext } from './integration-harness';

const CLIENT_ID = '00000000-0000-0000-0000-000000000000';
const HUB_ID = '00000000-0000-0000-0000-000000000001';
const USER_ID = 'user-123';

describe('spokesRouter - Integration', () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await createIntegrationContext();
    await setupTestDatabase(ctx.db);
    
    // Seed required data for isolation checks
    await ctx.db.prepare('INSERT INTO clients (id, name) VALUES (?, ?)').bind(CLIENT_ID, 'Test Client').run();
    await ctx.db.prepare('INSERT INTO client_members (id, client_id, user_id, role) VALUES (?, ?, ?, ?)').bind('member-1', CLIENT_ID, ctx.userId, 'agency_owner').run();
  });

  afterAll(async () => {
    // Cleanup handled by worker pool
  });

  describe('list', () => {
    it('returns spokes from Durable Object via proxy', async () => {
      const caller = spokesRouter.createCaller(ctx);
      const input = {
        clientId: CLIENT_ID,
        hubId: HUB_ID,
        limit: 10,
      };

      // The callAgent in integration harness returns a mock success by default
      const result = await caller.list(input);

      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('generate', () => {
    it('triggers generation workflow using real D1 data', async () => {
      const caller = spokesRouter.createCaller(ctx);
      
      // 1. Seed real data into D1
      const sourceId = 'source-1';
      await ctx.db.prepare('INSERT INTO hub_sources (id, client_id, user_id, title, source_type, raw_content, status) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(
        sourceId, CLIENT_ID, ctx.userId, 'Source 1', 'text', 'Real content for extraction', 'ready'
      ).run();

      await ctx.db.prepare('INSERT INTO hubs (id, client_id, user_id, source_id, title, source_type) VALUES (?, ?, ?, ?, ?, ?)').bind(
        HUB_ID, CLIENT_ID, ctx.userId, sourceId, 'Hub 1', 'text'
      ).run();

      const pillarId = 'pillar-1';
      await ctx.db.prepare('INSERT INTO extracted_pillars (id, source_id, client_id, hub_id, title, core_claim) VALUES (?, ?, ?, ?, ?, ?)').bind(
        pillarId, sourceId, CLIENT_ID, HUB_ID, 'Pillar 1', 'Claim 1'
      ).run();

      // 2. Call generate
      const result = await caller.generate({
        clientId: CLIENT_ID,
        hubId: HUB_ID,
        platforms: ['twitter', 'linkedin']
      });

      // 3. Verify success
      expect(result.status).toBe('started');
      expect(result.hubId).toBe(HUB_ID);
      expect(result.pillarsCount).toBe(1);
      expect(result.spokesQueued).toBe(2); // 1 pillar * 2 platforms
    });

    it('enforces multi-tenant isolation (fails if no access)', async () => {
      const caller = spokesRouter.createCaller(ctx);
      const otherClientId = 'other-client-id';
      
      // Try to generate for a client user doesn't belong to
      await expect(caller.generate({
        clientId: otherClientId,
        hubId: HUB_ID
      })).rejects.toThrow(/Access denied|forbidden/i);
    });
  });

  describe('clone (Story 9.6)', () => {
    it('creates variations via CONTENT_ENGINE', async () => {
      const caller = spokesRouter.createCaller(ctx);
      const spokeId = 'spoke-to-clone';

      const result = await caller.clone({
        clientId: CLIENT_ID,
        spokeId: spokeId,
        count: 2
      });

      expect(result.status).toBe('processing');
      expect(result.variationsQueued).toBe(2);
      expect(result.newSpokeIds).toHaveLength(2);
    });
  });
});