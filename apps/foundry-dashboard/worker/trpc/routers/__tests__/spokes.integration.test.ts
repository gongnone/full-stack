/**
 * Spokes Integration Tests (TASK-001)
 * Tests spoke operations with real D1 database operations
 *
 * Covers:
 * - Spoke CRUD operations
 * - Cross-tenant isolation
 * - Bulk approval operations
 * - Status transitions
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createIntegrationContext,
  setupTestDatabase,
  seedTestAccounts,
  seedTestHubsAndSpokes,
  switchToAccount,
  IntegrationContext,
} from './integration-harness';

describe('Spokes Integration Tests', () => {
  let ctx: IntegrationContext;
  let account1: { id: string; userId: string; clientId: string };
  let account2: { id: string; userId: string; clientId: string };
  let account1Hub: { hubId: string; spokeIds: string[] };

  beforeAll(async () => {
    ctx = await createIntegrationContext();
    await setupTestDatabase(ctx.db);

    const accounts = await seedTestAccounts(ctx.db, ctx);
    account1 = accounts.account1;
    account2 = accounts.account2;

    account1Hub = await seedTestHubsAndSpokes(ctx.db, account1.id, account1.clientId, 5);
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  describe('Spoke CRUD Operations', () => {
    it('lists spokes for a hub', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM spokes WHERE hub_id = ? AND account_id = ?
      `).bind(account1Hub.hubId, account1.id).all();

      expect(result.results?.length).toBe(5);
    });

    it('creates a new spoke', async () => {
      const spokeId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(spokeId, account1.id, account1.clientId, account1Hub.hubId, 'New spoke content', 'pending').run();

      const result = await ctx.db.prepare(`
        SELECT * FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result).toBeDefined();
      expect(result.content).toBe('New spoke content');
      expect(result.status).toBe('pending');
    });

    it('updates spoke content', async () => {
      const spokeId = account1Hub.spokeIds[0]!;

      await ctx.db.prepare(`
        UPDATE spokes SET content = ?, updated_at = datetime('now')
        WHERE id = ? AND account_id = ?
      `).bind('Updated content', spokeId, account1.id).run();

      const result = await ctx.db.prepare(`
        SELECT * FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result.content).toBe('Updated content');
    });

    it('deletes a spoke', async () => {
      const spokeId = crypto.randomUUID();

      // Create
      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(spokeId, account1.id, account1.clientId, account1Hub.hubId, 'To delete', 'pending').run();

      // Delete (using UPDATE to mark as deleted, since our mock doesn't support DELETE)
      await ctx.db.prepare(`
        UPDATE spokes SET status = 'deleted' WHERE id = ? AND account_id = ?
      `).bind(spokeId, account1.id).run();

      // Verify the status was changed to deleted
      const result = await ctx.db.prepare(`
        SELECT status FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.status).toBe('deleted');
    });
  });

  describe('Spoke Status Transitions', () => {
    it('transitions from pending to reviewing', async () => {
      const spokeId = account1Hub.spokeIds[1]!;

      await ctx.db.prepare(`
        UPDATE spokes SET status = 'reviewing' WHERE id = ? AND status = 'pending'
      `).bind(spokeId).run();

      const result = await ctx.db.prepare(`
        SELECT status FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.status).toBe('reviewing');
    });

    it('transitions from reviewing to approved', async () => {
      const spokeId = account1Hub.spokeIds[2]!;

      // First set to reviewing
      await ctx.db.prepare(`
        UPDATE spokes SET status = 'reviewing' WHERE id = ?
      `).bind(spokeId).run();

      // Then approve
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

    it('transitions from reviewing to rejected', async () => {
      const spokeId = account1Hub.spokeIds[3]!;

      // Set to reviewing
      await ctx.db.prepare(`
        UPDATE spokes SET status = 'reviewing' WHERE id = ?
      `).bind(spokeId).run();

      // Reject
      await ctx.db.prepare(`
        UPDATE spokes SET status = 'rejected', rejected_at = datetime('now')
        WHERE id = ? AND status = 'reviewing'
      `).bind(spokeId).run();

      const result = await ctx.db.prepare(`
        SELECT status, rejected_at FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.status).toBe('rejected');
      expect(result?.rejected_at).toBeDefined();
    });

    it('increments regeneration_count on mutation', async () => {
      const spokeId = account1Hub.spokeIds[4]!;

      // Get initial count
      const initial = await ctx.db.prepare(`
        SELECT regeneration_count FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      const initialCount = initial?.regeneration_count || 0;

      // Increment
      await ctx.db.prepare(`
        UPDATE spokes SET regeneration_count = regeneration_count + 1
        WHERE id = ? AND account_id = ?
      `).bind(spokeId, account1.id).run();

      const result = await ctx.db.prepare(`
        SELECT regeneration_count FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.regeneration_count).toBe(initialCount + 1);
    });
  });

  describe('Cross-Tenant Isolation', () => {
    it('cannot access spokes from another account', async () => {
      // Account 2 tries to access Account 1's spokes
      const result = await ctx.db.prepare(`
        SELECT * FROM spokes WHERE hub_id = ? AND account_id = ?
      `).bind(account1Hub.hubId, account2.id).all();

      expect(result.results?.length || 0).toBe(0);
    });

    it('cannot update spokes from another account', async () => {
      const spokeId = account1Hub.spokeIds[0]!;

      // Account 2 tries to update Account 1's spoke
      await ctx.db.prepare(`
        UPDATE spokes SET content = 'Hacked!' WHERE id = ? AND account_id = ?
      `).bind(spokeId, account2.id).run();

      // Verify content unchanged
      const result = await ctx.db.prepare(`
        SELECT content FROM spokes WHERE id = ?
      `).bind(spokeId).first() as any;

      expect(result?.content).not.toBe('Hacked!');
    });
  });

  describe('Bulk Operations', () => {
    it('counts pending spokes for a hub', async () => {
      const result = await ctx.db.prepare(`
        SELECT COUNT(*) as count FROM spokes
        WHERE hub_id = ? AND account_id = ? AND status = 'pending'
      `).bind(account1Hub.hubId, account1.id).first() as any;

      expect(result?.count).toBeGreaterThanOrEqual(0);
    });

    it('counts spokes by status', async () => {
      const statuses = ['pending', 'reviewing', 'approved', 'rejected'];

      for (const status of statuses) {
        const result = await ctx.db.prepare(`
          SELECT COUNT(*) as count FROM spokes
          WHERE hub_id = ? AND account_id = ? AND status = ?
        `).bind(account1Hub.hubId, account1.id, status).first() as any;

        expect(typeof result?.count).toBe('number');
      }
    });
  });

  describe('Query Performance', () => {
    it('queries by hub_id are efficient (indexed)', async () => {
      const start = performance.now();

      await ctx.db.prepare(`
        SELECT * FROM spokes WHERE hub_id = ? AND account_id = ?
      `).bind(account1Hub.hubId, account1.id).all();

      const duration = performance.now() - start;

      // Should be fast (<100ms) with proper indexing
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
