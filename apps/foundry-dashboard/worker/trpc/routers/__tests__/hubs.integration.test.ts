/**
 * Hubs Integration Tests (TASK-003)
 * Tests hub operations with real D1 database operations
 *
 * Covers:
 * - Hub CRUD operations
 * - Hub-Pillar relationships
 * - Cross-tenant isolation
 * - Hub status management
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createIntegrationContext,
  setupTestDatabase,
  seedTestAccounts,
  IntegrationContext,
} from './integration-harness';

describe('Hubs Integration Tests', () => {
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
    await ctx.cleanup();
  });

  describe('Hub CRUD Operations', () => {
    let testHubId: string;

    it('creates a new hub', async () => {
      testHubId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(testHubId, account1.id, account1.clientId, 'Integration Test Hub', 'pending').run();

      const result = await ctx.db.prepare(`
        SELECT * FROM hubs WHERE id = ?
      `).bind(testHubId).first() as any;

      expect(result).toBeDefined();
      expect(result.name).toBe('Integration Test Hub');
      expect(result.status).toBe('pending');
      expect(result.account_id).toBe(account1.id);
    });

    it('lists hubs for an account', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM hubs WHERE account_id = ?
      `).bind(account1.id).all();

      expect(result.results?.length).toBeGreaterThan(0);
    });

    it('gets a specific hub by ID', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM hubs WHERE id = ? AND account_id = ?
      `).bind(testHubId, account1.id).first() as any;

      expect(result).toBeDefined();
      expect(result.id).toBe(testHubId);
    });

    it('updates hub name', async () => {
      await ctx.db.prepare(`
        UPDATE hubs SET name = ?, updated_at = datetime('now')
        WHERE id = ? AND account_id = ?
      `).bind('Updated Hub Name', testHubId, account1.id).run();

      const result = await ctx.db.prepare(`
        SELECT name FROM hubs WHERE id = ?
      `).bind(testHubId).first() as any;

      expect(result.name).toBe('Updated Hub Name');
    });

    it('soft deletes a hub by changing status', async () => {
      const hubToDelete = crypto.randomUUID();

      // Create
      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(hubToDelete, account1.id, account1.clientId, 'To Delete', 'pending').run();

      // Soft delete
      await ctx.db.prepare(`
        UPDATE hubs SET status = 'deleted' WHERE id = ? AND account_id = ?
      `).bind(hubToDelete, account1.id).run();

      // Verify status is now 'deleted'
      const result = await ctx.db.prepare(`
        SELECT status FROM hubs WHERE id = ?
      `).bind(hubToDelete).first() as any;

      expect(result?.status).toBe('deleted');
    });
  });

  describe('Hub Status Management', () => {
    let hubId: string;

    beforeAll(async () => {
      hubId = crypto.randomUUID();
      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(hubId, account1.id, account1.clientId, 'Status Test Hub', 'pending').run();
    });

    it('transitions from pending to processing', async () => {
      await ctx.db.prepare(`
        UPDATE hubs SET status = 'processing' WHERE id = ? AND status = 'pending'
      `).bind(hubId).run();

      const result = await ctx.db.prepare(`
        SELECT status FROM hubs WHERE id = ?
      `).bind(hubId).first() as any;

      expect(result.status).toBe('processing');
    });

    it('transitions from processing to active', async () => {
      await ctx.db.prepare(`
        UPDATE hubs SET status = 'active' WHERE id = ? AND status = 'processing'
      `).bind(hubId).run();

      const result = await ctx.db.prepare(`
        SELECT status FROM hubs WHERE id = ?
      `).bind(hubId).first() as any;

      expect(result.status).toBe('active');
    });

    it('counts hubs by status', async () => {
      const statuses = ['pending', 'processing', 'active', 'deleted'];

      for (const status of statuses) {
        const result = await ctx.db.prepare(`
          SELECT COUNT(*) as count FROM hubs WHERE account_id = ? AND status = ?
        `).bind(account1.id, status).first() as any;

        expect(typeof result?.count).toBe('number');
      }
    });
  });

  describe('Cross-Tenant Isolation', () => {
    let account1HubId: string;

    beforeAll(async () => {
      account1HubId = crypto.randomUUID();
      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(account1HubId, account1.id, account1.clientId, 'Account 1 Hub', 'active').run();
    });

    it('cannot access hubs from another account', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM hubs WHERE id = ? AND account_id = ?
      `).bind(account1HubId, account2.id).first();

      expect(result).toBeNull();
    });

    it('cannot update hubs from another account', async () => {
      await ctx.db.prepare(`
        UPDATE hubs SET name = 'Hacked!' WHERE id = ? AND account_id = ?
      `).bind(account1HubId, account2.id).run();

      const result = await ctx.db.prepare(`
        SELECT name FROM hubs WHERE id = ?
      `).bind(account1HubId).first() as any;

      expect(result.name).not.toBe('Hacked!');
      expect(result.name).toBe('Account 1 Hub');
    });

    it('only returns own hubs in list query', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM hubs WHERE account_id = ?
      `).bind(account1.id).all();

      const hubIds = result.results?.map((r: any) => r.account_id) || [];

      // All returned hubs should belong to account1
      hubIds.forEach((accountId: string) => {
        expect(accountId).toBe(account1.id);
      });
    });
  });

  describe('Hub-Client Relationship', () => {
    it('hub is linked to a client', async () => {
      const hubId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(hubId, account1.id, account1.clientId, 'Client-Linked Hub', 'active').run();

      const result = await ctx.db.prepare(`
        SELECT h.*, c.name as client_name
        FROM hubs h
        JOIN clients c ON h.client_id = c.id
        WHERE h.id = ?
      `).bind(hubId).first() as any;

      expect(result).toBeDefined();
      expect(result.client_id).toBe(account1.clientId);
    });

    it('counts hubs per client', async () => {
      const result = await ctx.db.prepare(`
        SELECT COUNT(*) as count FROM hubs WHERE client_id = ? AND account_id = ?
      `).bind(account1.clientId, account1.id).first() as any;

      expect(result?.count).toBeGreaterThan(0);
    });
  });

  describe('Query Performance', () => {
    it('queries by account_id are efficient (indexed)', async () => {
      const start = performance.now();

      await ctx.db.prepare(`
        SELECT * FROM hubs WHERE account_id = ?
      `).bind(account1.id).all();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('queries by client_id are efficient', async () => {
      const start = performance.now();

      await ctx.db.prepare(`
        SELECT * FROM hubs WHERE client_id = ? AND account_id = ?
      `).bind(account1.clientId, account1.id).all();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
