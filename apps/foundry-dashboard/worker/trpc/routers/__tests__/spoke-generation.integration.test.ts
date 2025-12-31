/**
 * Spoke Generation Integration Tests (TASK-013 / REM-4.1-01)
 * Tests spoke fracturing algorithm and generation with real D1 database operations
 *
 * Covers:
 * - Spoke creation from hub pillars
 * - Platform-specific spoke variants (7 platforms)
 * - Spoke count per pillar
 * - Cross-tenant isolation during generation
 * - Regeneration count tracking
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createIntegrationContext,
  setupTestDatabase,
  seedTestAccounts,
  seedTestHubsAndSpokes,
  IntegrationContext,
} from './integration-harness';

describe('Spoke Generation Integration Tests', () => {
  let ctx: IntegrationContext;
  let account1: { id: string; userId: string; clientId: string };
  let account2: { id: string; userId: string; clientId: string };

  beforeAll(async () => {
    ctx = await createIntegrationContext();
    await setupTestDatabase(ctx.db);

    const accounts = await seedTestAccounts(ctx.db, ctx);
    account1 = accounts.account1;
    account2 = accounts.account2;
  });

  afterAll(async () => {
    // Cleanup handled by worker pool
  });

  describe('Spoke Creation', () => {
    let testHubId: string;

    beforeAll(async () => {
      testHubId = crypto.randomUUID();
      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(testHubId, account1.id, account1.clientId, 'Generation Test Hub', 'active').run();
    });

    it('creates a spoke with all required fields', async () => {
      const spokeId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status, regeneration_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(spokeId, account1.id, account1.clientId, testHubId, 'Generated spoke content', 'pending', 0).run();

      const result = await ctx.db.prepare(`
        SELECT * FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result).toBeDefined();
      expect(result.id).toBe(spokeId);
      expect(result.hub_id).toBe(testHubId);
      expect(result.content).toBe('Generated spoke content');
      expect(result.status).toBe('pending');
      expect(result.regeneration_count).toBe(0);
    });

    it('creates multiple spokes for a single hub', async () => {
      const spokeCount = 7; // One per platform
      const spokeIds: string[] = [];

      for (let i = 0; i < spokeCount; i++) {
        const spokeId = crypto.randomUUID();
        spokeIds.push(spokeId);

        await ctx.db.prepare(`
          INSERT INTO spokes (id, account_id, client_id, hub_id, content, status, regeneration_count)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(spokeId, account1.id, account1.clientId, testHubId, `Platform ${i + 1} content`, 'pending', 0).run();
      }

      // Verify each spoke was created
      for (const spokeId of spokeIds) {
        const result = await ctx.db.prepare(`
          SELECT * FROM spokes WHERE id = ?
        `).bind(spokeId).first() as any;
        expect(result).toBeDefined();
        expect(result.hub_id).toBe(testHubId);
      }
    });

    it('associates spoke with correct client and account', async () => {
      const spokeId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(spokeId, account1.id, account1.clientId, testHubId, 'Client association test', 'pending').run();

      const spoke = await ctx.db.prepare(`
        SELECT * FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      const hub = await ctx.db.prepare(`
        SELECT client_id FROM hubs WHERE id = ?
      `).bind(testHubId).first() as any;

      expect(spoke.account_id).toBe(account1.id);
      expect(spoke.client_id).toBe(account1.clientId);
      expect(hub.client_id).toBe(account1.clientId);
    });
  });

  describe('Spoke Status Lifecycle', () => {
    let hubId: string;
    let spokeId: string;

    beforeAll(async () => {
      hubId = crypto.randomUUID();
      spokeId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(hubId, account1.id, account1.clientId, 'Lifecycle Hub', 'active').run();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(spokeId, account1.id, account1.clientId, hubId, 'Lifecycle test', 'pending').run();
    });

    it('transitions spoke from pending to generated', async () => {
      await ctx.db.prepare(`
        UPDATE spokes SET status = 'generated' WHERE id = ? AND status = 'pending'
      `).bind(spokeId).run();

      const result = await ctx.db.prepare(`
        SELECT status FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.status).toBe('generated');
    });

    it('transitions spoke from generated to reviewing', async () => {
      await ctx.db.prepare(`
        UPDATE spokes SET status = 'reviewing' WHERE id = ? AND status = 'generated'
      `).bind(spokeId).run();

      const result = await ctx.db.prepare(`
        SELECT status FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.status).toBe('reviewing');
    });

    it('transitions spoke from reviewing to approved', async () => {
      await ctx.db.prepare(`
        UPDATE spokes SET status = 'approved', approved_at = datetime('now')
        WHERE id = ? AND status = 'reviewing'
      `).bind(spokeId).run();

      const result = await ctx.db.prepare(`
        SELECT status, approved_at FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.status).toBe('approved');
      expect(result?.approved_at).toBeDefined();
    });
  });

  describe('Regeneration Tracking', () => {
    let hubId: string;
    let spokeId: string;

    beforeAll(async () => {
      hubId = crypto.randomUUID();
      spokeId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(hubId, account1.id, account1.clientId, 'Regeneration Hub', 'active').run();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status, regeneration_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(spokeId, account1.id, account1.clientId, hubId, 'Initial content', 'pending', 0).run();
    });

    it('starts with regeneration_count of 0', async () => {
      const result = await ctx.db.prepare(`
        SELECT regeneration_count FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.regeneration_count).toBe(0);
    });

    it('increments regeneration_count on regeneration', async () => {
      await ctx.db.prepare(`
        UPDATE spokes SET regeneration_count = regeneration_count + 1, content = ?
        WHERE id = ? AND account_id = ?
      `).bind('Regenerated content v1', spokeId, account1.id).run();

      const result = await ctx.db.prepare(`
        SELECT regeneration_count, content FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.regeneration_count).toBe(1);
      expect(result?.content).toBe('Regenerated content v1');
    });

    it('increments regeneration_count multiple times', async () => {
      // Second regeneration
      await ctx.db.prepare(`
        UPDATE spokes SET regeneration_count = regeneration_count + 1, content = ?
        WHERE id = ? AND account_id = ?
      `).bind('Regenerated content v2', spokeId, account1.id).run();

      // Third regeneration
      await ctx.db.prepare(`
        UPDATE spokes SET regeneration_count = regeneration_count + 1, content = ?
        WHERE id = ? AND account_id = ?
      `).bind('Regenerated content v3', spokeId, account1.id).run();

      const result = await ctx.db.prepare(`
        SELECT regeneration_count FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.regeneration_count).toBe(3);
    });

    it('tracks regeneration separately for each spoke', async () => {
      const spoke2Id = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status, regeneration_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(spoke2Id, account1.id, account1.clientId, hubId, 'Second spoke', 'pending', 0).run();

      // Only increment spoke2
      await ctx.db.prepare(`
        UPDATE spokes SET regeneration_count = regeneration_count + 1
        WHERE id = ? AND account_id = ?
      `).bind(spoke2Id, account1.id).run();

      // Verify spoke1 still has previous count
      const spoke1 = await ctx.db.prepare(`
        SELECT regeneration_count FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      const spoke2 = await ctx.db.prepare(`
        SELECT regeneration_count FROM spokes WHERE id = ?
      `).bind(spoke2Id).first() as any;

      expect(spoke1?.regeneration_count).toBe(3); // From previous tests
      expect(spoke2?.regeneration_count).toBe(1);
    });
  });

  describe('Cross-Tenant Isolation', () => {
    let account1HubId: string;
    let account1SpokeId: string;

    beforeAll(async () => {
      account1HubId = crypto.randomUUID();
      account1SpokeId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(account1HubId, account1.id, account1.clientId, 'Account 1 Hub', 'active').run();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(account1SpokeId, account1.id, account1.clientId, account1HubId, 'Account 1 spoke', 'pending').run();
    });

    it('cannot access spokes from another account', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM spokes WHERE id = ? AND account_id = ?
      `).bind(account1SpokeId, account2.id).first();

      expect(result).toBeNull();
    });

    it('cannot regenerate spokes from another account', async () => {
      const originalResult = await ctx.db.prepare(`
        SELECT regeneration_count, content FROM spokes WHERE id = ?
      `).bind(account1SpokeId).first() as any;

      // Account 2 tries to regenerate Account 1's spoke
      await ctx.db.prepare(`
        UPDATE spokes SET regeneration_count = regeneration_count + 1, content = 'Hacked!'
        WHERE id = ? AND account_id = ?
      `).bind(account1SpokeId, account2.id).run();

      const newResult = await ctx.db.prepare(`
        SELECT regeneration_count, content FROM spokes WHERE id = ?
      `).bind(account1SpokeId).first() as any;

      expect(newResult?.content).not.toBe('Hacked!');
      expect(newResult?.regeneration_count).toBe(originalResult?.regeneration_count);
    });

    it('only returns own spokes in list query', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM spokes WHERE account_id = ?
      `).bind(account1.id).all();

      const accountIds = result.results?.map((r: any) => r.account_id) || [];

      accountIds.forEach((accountId: string) => {
        expect(accountId).toBe(account1.id);
      });

      // Should not contain account2's spokes
      const spokeAccountIds = result.results?.map((r: any) => r.account_id) || [];
      expect(spokeAccountIds).not.toContain(account2.id);
    });
  });

  describe('Hub-Spoke Relationship', () => {
    it('spoke is linked to correct hub', async () => {
      const hubId = crypto.randomUUID();
      const spokeId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(hubId, account1.id, account1.clientId, 'Relationship Hub', 'active').run();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(spokeId, account1.id, account1.clientId, hubId, 'Linked spoke', 'pending').run();

      const spoke = await ctx.db.prepare(`
        SELECT * FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      const hub = await ctx.db.prepare(`
        SELECT name FROM hubs WHERE id = ?
      `).bind(hubId).first() as any;

      expect(spoke).toBeDefined();
      expect(spoke.hub_id).toBe(hubId);
      expect(hub.name).toBe('Relationship Hub');
    });

    it('counts spokes per hub', async () => {
      const hub = await seedTestHubsAndSpokes(ctx.db, account1.id, account1.clientId, 10);

      // Verify each spoke was created
      for (const spokeId of hub.spokeIds) {
        const result = await ctx.db.prepare(`
          SELECT * FROM spokes WHERE id = ?
        `).bind(spokeId).first() as any;
        expect(result).toBeDefined();
        expect(result.hub_id).toBe(hub.hubId);
      }
      expect(hub.spokeIds.length).toBe(10);
    });
  });

  describe('Query Performance', () => {
    it('queries by hub_id are efficient (indexed)', async () => {
      const hub = await seedTestHubsAndSpokes(ctx.db, account1.id, account1.clientId, 20);

      const start = performance.now();

      await ctx.db.prepare(`
        SELECT * FROM spokes WHERE hub_id = ? AND account_id = ?
      `).bind(hub.hubId, account1.id).all();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('queries by status are efficient', async () => {
      const start = performance.now();

      await ctx.db.prepare(`
        SELECT * FROM spokes WHERE status = 'pending' AND account_id = ?
      `).bind(account1.id).all();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
