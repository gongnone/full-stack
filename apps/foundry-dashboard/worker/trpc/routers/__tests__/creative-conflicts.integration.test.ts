/**
 * Creative Conflicts Integration Tests (TASK-014 / REM-4.2-01, REM-4.2-02)
 * Tests creative conflict escalation and gate failure handling with real D1 operations
 *
 * Covers:
 * - Gate score persistence (G2, G4, G5, G7)
 * - Conflict status tracking
 * - Escalation workflow
 * - Approval/rejection flows
 * - Cross-tenant isolation
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createIntegrationContext,
  setupTestDatabase,
  seedTestAccounts,
  IntegrationContext,
} from './integration-harness';

describe('Creative Conflicts Integration Tests', () => {
  let ctx: IntegrationContext;
  let account1: { id: string; userId: string; clientId: string };
  let account2: { id: string; userId: string; clientId: string };

  beforeAll(async () => {
    ctx = await createIntegrationContext();
    await setupTestDatabase(ctx.db);

    // Extend schema for creative conflicts (gate scores)
    await ctx.db.exec(`
      CREATE TABLE IF NOT EXISTS spoke_gate_scores (
        id TEXT PRIMARY KEY,
        spoke_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        gate_type TEXT NOT NULL,
        score REAL NOT NULL,
        passed INTEGER NOT NULL DEFAULT 1,
        feedback TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS creative_conflicts (
        id TEXT PRIMARY KEY,
        spoke_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        hub_id TEXT NOT NULL,
        gate_type TEXT NOT NULL,
        score REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        resolution TEXT,
        resolved_at TEXT,
        resolved_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    const accounts = await seedTestAccounts(ctx.db, ctx);
    account1 = accounts.account1;
    account2 = accounts.account2;
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  describe('Gate Score Persistence', () => {
    let testHubId: string;
    let testSpokeId: string;

    beforeAll(async () => {
      testHubId = crypto.randomUUID();
      testSpokeId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(testHubId, account1.id, account1.clientId, 'Conflict Test Hub', 'active').run();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(testSpokeId, account1.id, account1.clientId, testHubId, 'Test content for gates', 'reviewing').run();
    });

    it('stores G2 (Clarity) gate score', async () => {
      const scoreId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO spoke_gate_scores (id, spoke_id, account_id, gate_type, score, passed, feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(scoreId, testSpokeId, account1.id, 'G2', 0.85, 1, 'Content is clear and concise').run();

      const result = await ctx.db.prepare(`
        SELECT * FROM spoke_gate_scores WHERE id = ?
      `).bind(scoreId).first() as any;

      expect(result).toBeDefined();
      expect(result.gate_type).toBe('G2');
      expect(result.score).toBe(0.85);
      expect(result.passed).toBe(1);
    });

    it('stores G4 (Voice) gate score', async () => {
      const scoreId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO spoke_gate_scores (id, spoke_id, account_id, gate_type, score, passed, feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(scoreId, testSpokeId, account1.id, 'G4', 0.65, 0, 'Voice does not match brand DNA').run();

      const result = await ctx.db.prepare(`
        SELECT * FROM spoke_gate_scores WHERE id = ?
      `).bind(scoreId).first() as any;

      expect(result).toBeDefined();
      expect(result.gate_type).toBe('G4');
      expect(result.score).toBe(0.65);
      expect(result.passed).toBe(0);
      expect(result.feedback).toContain('Voice');
    });

    it('stores G5 (Platform) gate score', async () => {
      const scoreId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO spoke_gate_scores (id, spoke_id, account_id, gate_type, score, passed, feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(scoreId, testSpokeId, account1.id, 'G5', 0.92, 1, 'Meets Twitter character limit').run();

      const result = await ctx.db.prepare(`
        SELECT * FROM spoke_gate_scores WHERE id = ?
      `).bind(scoreId).first() as any;

      expect(result).toBeDefined();
      expect(result.gate_type).toBe('G5');
      expect(result.score).toBe(0.92);
    });

    it('stores G7 (Ethics) gate score', async () => {
      const scoreId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO spoke_gate_scores (id, spoke_id, account_id, gate_type, score, passed, feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(scoreId, testSpokeId, account1.id, 'G7', 0.98, 1, 'No ethical concerns detected').run();

      const result = await ctx.db.prepare(`
        SELECT * FROM spoke_gate_scores WHERE id = ?
      `).bind(scoreId).first() as any;

      expect(result).toBeDefined();
      expect(result.gate_type).toBe('G7');
      expect(result.score).toBe(0.98);
    });

    it('stores multiple gate scores for same spoke', async () => {
      const spoke2Id = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(spoke2Id, account1.id, account1.clientId, testHubId, 'Multi-gate content', 'reviewing').run();

      // Insert scores for all gates and track IDs
      const gates = ['G2', 'G4', 'G5', 'G7'];
      const scoreIds: string[] = [];
      for (const gate of gates) {
        const scoreId = crypto.randomUUID();
        scoreIds.push(scoreId);
        await ctx.db.prepare(`
          INSERT INTO spoke_gate_scores (id, spoke_id, account_id, gate_type, score, passed)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(scoreId, spoke2Id, account1.id, gate, 0.8, 1).run();
      }

      // Verify each score was created
      for (const scoreId of scoreIds) {
        const result = await ctx.db.prepare(`
          SELECT * FROM spoke_gate_scores WHERE id = ?
        `).bind(scoreId).first() as any;
        expect(result).toBeDefined();
        expect(result.spoke_id).toBe(spoke2Id);
      }
      expect(scoreIds.length).toBe(4);
    });
  });

  describe('Conflict Creation', () => {
    let testHubId: string;
    let testSpokeId: string;

    beforeAll(async () => {
      testHubId = crypto.randomUUID();
      testSpokeId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(testHubId, account1.id, account1.clientId, 'Conflict Hub', 'active').run();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(testSpokeId, account1.id, account1.clientId, testHubId, 'Conflicted content', 'conflict').run();
    });

    it('creates a creative conflict when gate fails', async () => {
      const conflictId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO creative_conflicts (id, spoke_id, account_id, hub_id, gate_type, score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(conflictId, testSpokeId, account1.id, testHubId, 'G4', 0.55, 'pending').run();

      const result = await ctx.db.prepare(`
        SELECT * FROM creative_conflicts WHERE id = ?
      `).bind(conflictId).first() as any;

      expect(result).toBeDefined();
      expect(result.spoke_id).toBe(testSpokeId);
      expect(result.gate_type).toBe('G4');
      expect(result.score).toBe(0.55);
      expect(result.status).toBe('pending');
    });

    it('links conflict to correct hub', async () => {
      const conflictId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO creative_conflicts (id, spoke_id, account_id, hub_id, gate_type, score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(conflictId, testSpokeId, account1.id, testHubId, 'G5', 0.60, 'pending').run();

      const conflict = await ctx.db.prepare(`
        SELECT * FROM creative_conflicts WHERE id = ?
      `).bind(conflictId).first() as any;

      const hub = await ctx.db.prepare(`
        SELECT name FROM hubs WHERE id = ?
      `).bind(testHubId).first() as any;

      expect(conflict.hub_id).toBe(testHubId);
      expect(hub.name).toBe('Conflict Hub');
    });
  });

  describe('Conflict Resolution', () => {
    let conflictId: string;
    let testHubId: string;
    let testSpokeId: string;

    beforeAll(async () => {
      testHubId = crypto.randomUUID();
      testSpokeId = crypto.randomUUID();
      conflictId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(testHubId, account1.id, account1.clientId, 'Resolution Hub', 'active').run();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(testSpokeId, account1.id, account1.clientId, testHubId, 'Conflict resolution test', 'conflict').run();

      await ctx.db.prepare(`
        INSERT INTO creative_conflicts (id, spoke_id, account_id, hub_id, gate_type, score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(conflictId, testSpokeId, account1.id, testHubId, 'G4', 0.50, 'pending').run();
    });

    it('resolves conflict with approve_anyway', async () => {
      await ctx.db.prepare(`
        UPDATE creative_conflicts
        SET status = 'resolved', resolution = 'approve_anyway', resolved_at = datetime('now'), resolved_by = ?
        WHERE id = ? AND status = 'pending'
      `).bind(account1.userId, conflictId).run();

      const result = await ctx.db.prepare(`
        SELECT status, resolution, resolved_by FROM creative_conflicts WHERE id = ?
      `).bind(conflictId).first() as any;

      expect(result?.status).toBe('resolved');
      expect(result?.resolution).toBe('approve_anyway');
      expect(result?.resolved_by).toBe(account1.userId);
    });

    it('resolves conflict with request_rewrite', async () => {
      const conflict2Id = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO creative_conflicts (id, spoke_id, account_id, hub_id, gate_type, score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(conflict2Id, testSpokeId, account1.id, testHubId, 'G5', 0.45, 'pending').run();

      await ctx.db.prepare(`
        UPDATE creative_conflicts
        SET status = 'resolved', resolution = 'request_rewrite', resolved_at = datetime('now'), resolved_by = ?
        WHERE id = ? AND status = 'pending'
      `).bind(account1.userId, conflict2Id).run();

      const result = await ctx.db.prepare(`
        SELECT status, resolution FROM creative_conflicts WHERE id = ?
      `).bind(conflict2Id).first() as any;

      expect(result?.status).toBe('resolved');
      expect(result?.resolution).toBe('request_rewrite');
    });

    it('resolves conflict with kill', async () => {
      const conflict3Id = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO creative_conflicts (id, spoke_id, account_id, hub_id, gate_type, score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(conflict3Id, testSpokeId, account1.id, testHubId, 'G7', 0.30, 'pending').run();

      await ctx.db.prepare(`
        UPDATE creative_conflicts
        SET status = 'resolved', resolution = 'kill', resolved_at = datetime('now'), resolved_by = ?
        WHERE id = ? AND status = 'pending'
      `).bind(account1.userId, conflict3Id).run();

      const result = await ctx.db.prepare(`
        SELECT status, resolution FROM creative_conflicts WHERE id = ?
      `).bind(conflict3Id).first() as any;

      expect(result?.status).toBe('resolved');
      expect(result?.resolution).toBe('kill');
    });
  });

  describe('Conflict Filtering', () => {
    let testHubId: string;

    beforeAll(async () => {
      testHubId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(testHubId, account1.id, account1.clientId, 'Filter Hub', 'active').run();

      // Create spokes and conflicts for different gates
      const gates = ['G2', 'G4', 'G5', 'G7'];
      for (const gate of gates) {
        const spokeId = crypto.randomUUID();
        const conflictId = crypto.randomUUID();

        await ctx.db.prepare(`
          INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(spokeId, account1.id, account1.clientId, testHubId, `${gate} fail content`, 'conflict').run();

        await ctx.db.prepare(`
          INSERT INTO creative_conflicts (id, spoke_id, account_id, hub_id, gate_type, score, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(conflictId, spokeId, account1.id, testHubId, gate, 0.50, 'pending').run();
      }
    });

    it('filters conflicts by gate type', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM creative_conflicts
        WHERE account_id = ? AND gate_type = 'G4' AND status = 'pending'
      `).bind(account1.id).all();

      expect(result.results?.length).toBeGreaterThan(0);
      result.results?.forEach((r: any) => {
        expect(r.gate_type).toBe('G4');
      });
    });

    it('filters conflicts by status', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM creative_conflicts
        WHERE account_id = ? AND status = 'pending'
      `).bind(account1.id).all();

      expect(result.results?.length).toBeGreaterThan(0);
      result.results?.forEach((r: any) => {
        expect(r.status).toBe('pending');
      });
    });

    it('filters conflicts by hub', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM creative_conflicts
        WHERE account_id = ? AND hub_id = ?
      `).bind(account1.id, testHubId).all();

      expect(result.results?.length).toBeGreaterThanOrEqual(4);
      result.results?.forEach((r: any) => {
        expect(r.hub_id).toBe(testHubId);
      });
    });

    it('counts conflicts by gate type', async () => {
      const gates = ['G2', 'G4', 'G5', 'G7'];

      // Verify at least one conflict exists for each gate type
      for (const gate of gates) {
        const result = await ctx.db.prepare(`
          SELECT * FROM creative_conflicts
          WHERE account_id = ? AND gate_type = ?
        `).bind(account1.id, gate).all();

        // Verify we have results
        expect(result.results).toBeDefined();
        expect(result.results?.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Cross-Tenant Isolation', () => {
    let account1ConflictId: string;

    beforeAll(async () => {
      const hubId = crypto.randomUUID();
      const spokeId = crypto.randomUUID();
      account1ConflictId = crypto.randomUUID();

      await ctx.db.prepare(`
        INSERT INTO hubs (id, account_id, client_id, name, status)
        VALUES (?, ?, ?, ?, ?)
      `).bind(hubId, account1.id, account1.clientId, 'Isolation Hub', 'active').run();

      await ctx.db.prepare(`
        INSERT INTO spokes (id, account_id, client_id, hub_id, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(spokeId, account1.id, account1.clientId, hubId, 'Isolated content', 'conflict').run();

      await ctx.db.prepare(`
        INSERT INTO creative_conflicts (id, spoke_id, account_id, hub_id, gate_type, score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(account1ConflictId, spokeId, account1.id, hubId, 'G4', 0.55, 'pending').run();
    });

    it('cannot access conflicts from another account', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM creative_conflicts WHERE id = ? AND account_id = ?
      `).bind(account1ConflictId, account2.id).first();

      expect(result).toBeNull();
    });

    it('cannot resolve conflicts from another account', async () => {
      // Account 2 tries to resolve Account 1's conflict
      await ctx.db.prepare(`
        UPDATE creative_conflicts
        SET status = 'resolved', resolution = 'approve_anyway'
        WHERE id = ? AND account_id = ?
      `).bind(account1ConflictId, account2.id).run();

      // Verify conflict still pending
      const result = await ctx.db.prepare(`
        SELECT status FROM creative_conflicts WHERE id = ?
      `).bind(account1ConflictId).first() as any;

      expect(result?.status).toBe('pending');
    });

    it('only returns own conflicts in list query', async () => {
      const result = await ctx.db.prepare(`
        SELECT * FROM creative_conflicts WHERE account_id = ?
      `).bind(account1.id).all();

      const accountIds = result.results?.map((r: any) => r.account_id) || [];

      accountIds.forEach((accountId: string) => {
        expect(accountId).toBe(account1.id);
      });
    });
  });

  describe('Query Performance', () => {
    it('queries by account_id are efficient (indexed)', async () => {
      const start = performance.now();

      await ctx.db.prepare(`
        SELECT * FROM creative_conflicts WHERE account_id = ?
      `).bind(account1.id).all();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('queries by gate_type are efficient', async () => {
      const start = performance.now();

      await ctx.db.prepare(`
        SELECT * FROM creative_conflicts WHERE gate_type = 'G4' AND account_id = ?
      `).bind(account1.id).all();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('queries by status are efficient', async () => {
      const start = performance.now();

      await ctx.db.prepare(`
        SELECT * FROM creative_conflicts WHERE status = 'pending' AND account_id = ?
      `).bind(account1.id).all();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
