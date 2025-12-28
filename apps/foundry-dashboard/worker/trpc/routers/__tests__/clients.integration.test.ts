/**
 * Clients Integration Tests (TASK-004)
 * Tests client (multi-tenant) operations with real D1 database operations
 *
 * Covers:
 * - Client CRUD operations
 * - Multi-tenant isolation
 * - Client resource binding
 * - Client status management
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createIntegrationContext,
  setupTestDatabase,
  seedTestAccounts,
  IntegrationContext,
} from './integration-harness';

describe('Clients Integration Tests', () => {
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

  describe('Client CRUD Operations', () => {
    let testClientId: string;

    it('creates a new client with all required fields', async () => {
      testClientId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO clients (id, account_id, name, durable_object_id, vectorize_namespace, r2_path_prefix, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        testClientId,
        account1.id,
        'Integration Test Client',
        `do-${testClientId}`,
        `ns-${testClientId}`,
        `r2/${testClientId}`,
        'active'
      ).run();

      const result = await ctx.db.prepare(`
        SELECT * FROM clients WHERE id = ?
      `).bind(testClientId).first() as any;

      expect(result).toBeDefined();
      expect(result.name).toBe('Integration Test Client');
      expect(result.status).toBe('active');
      expect(result.durable_object_id).toBe(`do-${testClientId}`);
      expect(result.vectorize_namespace).toBe(`ns-${testClientId}`);
      expect(result.r2_path_prefix).toBe(`r2/${testClientId}`);
    });

    it('lists clients for an account', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM clients WHERE account_id = ?
      `).bind(account1.id).all();

      expect(result.results?.length).toBeGreaterThan(0);
    });

    it('gets a specific client by ID', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM clients WHERE id = ? AND account_id = ?
      `).bind(account1.clientId, account1.id).first() as any;

      expect(result).toBeDefined();
      expect(result.id).toBe(account1.clientId);
    });

    it('updates client name', async () => {
      await ctx.db.prepare(`
        UPDATE clients SET name = ?, updated_at = datetime('now')
        WHERE id = ? AND account_id = ?
      `).bind('Updated Client Name', account1.clientId, account1.id).run();

      const result = await ctx.db.prepare(`
        SELECT name FROM clients WHERE id = ?
      `).bind(account1.clientId).first() as any;

      expect(result.name).toBe('Updated Client Name');
    });
  });

  describe('Client Status Management', () => {
    let clientId: string;

    beforeAll(async () => {
      clientId = crypto.randomUUID();
      await ctx.db.prepare(`
        INSERT INTO clients (id, account_id, name, durable_object_id, vectorize_namespace, r2_path_prefix, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(clientId, account1.id, 'Status Test Client', 'do-test', 'ns-test', 'r2/test', 'active').run();
    });

    it('pauses a client', async () => {
      await ctx.db.prepare(`
        UPDATE clients SET status = 'paused' WHERE id = ? AND status = 'active'
      `).bind(clientId).run();

      const result = await ctx.db.prepare(`
        SELECT status FROM clients WHERE id = ?
      `).bind(clientId).first() as any;

      expect(result.status).toBe('paused');
    });

    it('reactivates a paused client', async () => {
      await ctx.db.prepare(`
        UPDATE clients SET status = 'active' WHERE id = ? AND status = 'paused'
      `).bind(clientId).run();

      const result = await ctx.db.prepare(`
        SELECT status FROM clients WHERE id = ?
      `).bind(clientId).first() as any;

      expect(result.status).toBe('active');
    });

    it('archives a client', async () => {
      await ctx.db.prepare(`
        UPDATE clients SET status = 'archived' WHERE id = ?
      `).bind(clientId).run();

      const result = await ctx.db.prepare(`
        SELECT status FROM clients WHERE id = ?
      `).bind(clientId).first() as any;

      expect(result.status).toBe('archived');
    });

    it('counts clients by status', async () => {
      const statuses = ['active', 'paused', 'archived'];

      for (const status of statuses) {
        const result = await ctx.db.prepare(`
          SELECT COUNT(*) as count FROM clients WHERE account_id = ? AND status = ?
        `).bind(account1.id, status).first() as any;

        expect(typeof result?.count).toBe('number');
      }
    });
  });

  describe('Cross-Tenant Isolation', () => {
    it('cannot access clients from another account', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM clients WHERE id = ? AND account_id = ?
      `).bind(account1.clientId, account2.id).first();

      expect(result).toBeNull();
    });

    it('cannot update clients from another account', async () => {
      await ctx.db.prepare(`
        UPDATE clients SET name = 'Hacked!' WHERE id = ? AND account_id = ?
      `).bind(account1.clientId, account2.id).run();

      const result = await ctx.db.prepare(`
        SELECT name FROM clients WHERE id = ?
      `).bind(account1.clientId).first() as any;

      expect(result.name).not.toBe('Hacked!');
    });

    it('only returns own clients in list query', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM clients WHERE account_id = ?
      `).bind(account1.id).all();

      const accountIds = result.results?.map((r: any) => r.account_id) || [];

      accountIds.forEach((accountId: string) => {
        expect(accountId).toBe(account1.id);
      });

      // Should not contain account2's client
      const clientIds = result.results?.map((r: any) => r.id) || [];
      expect(clientIds).not.toContain(account2.clientId);
    });
  });

  describe('Resource Binding', () => {
    it('each client has unique durable_object_id', async () => {
      // Get all clients and verify uniqueness in code
      const result = await ctx.db.prepare(`
        SELECT durable_object_id FROM clients WHERE account_id = ?
      `).bind(account1.id).all();

      const doIds = (result.results as any[])?.map(r => r.durable_object_id) || [];
      const uniqueIds = new Set(doIds);

      // All IDs should be unique
      expect(uniqueIds.size).toBe(doIds.length);
    });

    it('each client has unique vectorize_namespace', async () => {
      const result = await ctx.db.prepare(`
        SELECT vectorize_namespace FROM clients WHERE account_id = ?
      `).bind(account1.id).all();

      const namespaces = (result.results as any[])?.map(r => r.vectorize_namespace) || [];
      const uniqueNamespaces = new Set(namespaces);

      expect(uniqueNamespaces.size).toBe(namespaces.length);
    });

    it('each client has unique r2_path_prefix', async () => {
      const result = await ctx.db.prepare(`
        SELECT r2_path_prefix FROM clients WHERE account_id = ?
      `).bind(account1.id).all();

      const prefixes = (result.results as any[])?.map(r => r.r2_path_prefix) || [];
      const uniquePrefixes = new Set(prefixes);

      expect(uniquePrefixes.size).toBe(prefixes.length);
    });
  });

  describe('Account-Client Hierarchy', () => {
    it('account can have multiple clients', async () => {
      // Create additional clients for account1 with unique values
      const client2Id = crypto.randomUUID();
      const client3Id = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO clients (id, account_id, name, durable_object_id, vectorize_namespace, r2_path_prefix, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(client2Id, account1.id, 'Multi Client 2', `do-multi-2-${client2Id}`, `ns-multi-2-${client2Id}`, `r2/multi-2-${client2Id}`, 'active').run();

      await ctx.db.prepare(`
        INSERT INTO clients (id, account_id, name, durable_object_id, vectorize_namespace, r2_path_prefix, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(client3Id, account1.id, 'Multi Client 3', `do-multi-3-${client3Id}`, `ns-multi-3-${client3Id}`, `r2/multi-3-${client3Id}`, 'active').run();

      // Query all clients for this account
      const result = await ctx.db.prepare(`
        SELECT * FROM clients WHERE account_id = ?
      `).bind(account1.id).all();

      expect((result.results?.length || 0)).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Query Performance', () => {
    it('queries by account_id are efficient (indexed)', async () => {
      const start = performance.now();

      await ctx.db.prepare(`
        SELECT * FROM clients WHERE account_id = ?
      `).bind(account1.id).all();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('queries by status are efficient', async () => {
      const start = performance.now();

      await ctx.db.prepare(`
        SELECT * FROM clients WHERE status = 'active' AND account_id = ?
      `).bind(account1.id).all();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
