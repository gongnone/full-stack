/**
 * Integration Test Harness with Real D1
 * INFRA-04: Creates a test context with actual D1 database operations
 *
 * This harness uses Miniflare's D1 implementation to provide
 * real database operations without mocking.
 *
 * Usage:
 *   import { createIntegrationContext, setupTestDatabase } from './integration-harness';
 *
 *   describe('My Integration Test', () => {
 *     let ctx: IntegrationContext;
 *
 *     beforeAll(async () => {
 *       ctx = await createIntegrationContext();
 *       await setupTestDatabase(ctx.db);
 *     });
 *
 *     afterAll(async () => {
 *       await ctx.cleanup();
 *     });
 *
 *     it('should write to real D1', async () => {
 *       const result = await ctx.db.prepare('SELECT 1').first();
 *       expect(result).toBeDefined();
 *     });
 *   });
 */

import { Miniflare } from 'miniflare';
import fs from 'fs';
import path from 'path';
import type { Context } from '../../context';
import { initDatabase } from '../../../db';

// Use web crypto API (available in Cloudflare Workers and Node 19+)
const randomUUID = (): string => crypto.randomUUID();

export interface IntegrationContext extends Context {
  cleanup: () => Promise<void>;
  testAccountId: string;
  testUserId: string;
  secondAccountId: string; // For cross-tenant testing
  secondUserId: string;
  mf: Miniflare;
}

/**
 * Create an integration test context with real D1 database via Miniflare
 */
export async function createIntegrationContext(): Promise<IntegrationContext> {
  // Spin up local D1 with Miniflare
  const mf = new Miniflare({
    modules: true,
    script: '', // Dummy script as we only need the bindings
    d1Databases: ['DB'],
    // Use unique persistence for each context to avoid state leakage
    d1Persist: false, 
  });

  const db = await mf.getD1Database('DB');
  const drizzle = initDatabase(db);

  // Generate test IDs
  const testAccountId = randomUUID();
  const testUserId = randomUUID();
  const secondAccountId = randomUUID();
  const secondUserId = randomUUID();

  // Create context
  const ctx: IntegrationContext = {
    env: {
      DB: db,
      CONTENT_ENGINE: {
        fetch: async (request: Request) => {
          // Mock the content engine for integration tests
          const body = await request.json() as { method: string; params: any };
          return new Response(JSON.stringify({
            success: true,
            status: 'started',
            instances: [
              { instanceId: randomUUID(), spokeId: randomUUID(), platform: 'twitter' }
            ],
            ...body.params
          }));
        },
      },
    } as any,
    db,
    drizzle,
    mf,
    userId: testUserId,
    accountId: testAccountId,
    userRole: 'admin',
    callAgent: async <T = unknown>(clientId: string, method: string, params: any): Promise<T> => {
      // For integration tests, we simulate DO logic or return success
      // If we wanted real DO integration, we'd add Durable Objects to Miniflare
      if (method === 'getSpoke') {
        // Return a mock spoke for edit tests
        return { content: 'Original content', id: params.spokeId } as T;
      }
      return { success: true, method, params, clientId } as T;
    },
    callEngine: async <T = unknown>(path: string, options?: RequestInit): Promise<T> => {
      // For integration tests, simulate engine responses
      return { success: true, path } as T;
    },
    testAccountId,
    testUserId,
    secondAccountId,
    secondUserId,
    cleanup: async () => {
      await mf.dispose();
    },
  };

  return ctx;
}

/**
 * Set up the test database with schema and seed data
 */
export async function setupTestDatabase(db: D1Database): Promise<void> {
  // In a real environment, we'd read migration files
  // For now, we apply the core schema needed for tests
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      email_verified INTEGER DEFAULT 0,
      image TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plan TEXT DEFAULT 'starter',
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      industry TEXT,
      contact_email TEXT,
      brand_color TEXT,
      drift_threshold INTEGER DEFAULT 25,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS client_members (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at INTEGER,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
      UNIQUE(client_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS hubs (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      title TEXT NOT NULL,
      source_type TEXT NOT NULL,
      pillar_count INTEGER DEFAULT 0,
      spoke_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ready',
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS extracted_pillars (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      hub_id TEXT,
      title TEXT NOT NULL,
      core_claim TEXT,
      psychological_angle TEXT,
      supporting_points TEXT DEFAULT '[]',
      created_at INTEGER,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hub_sources (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT,
      source_type TEXT NOT NULL,
      raw_content TEXT,
      status TEXT DEFAULT 'pending',
      created_at INTEGER,
      updated_at INTEGER
    );
  `);
}

/**
 * Seed test accounts for cross-tenant testing
 */
export async function seedTestAccounts(
  db: D1Database,
  ctx: IntegrationContext
): Promise<{
  account1: { id: string; userId: string; clientId: string };
  account2: { id: string; userId: string; clientId: string };
}> {
  const client1Id = randomUUID();
  const client2Id = randomUUID();

  // Create first account
  await db.prepare(`
    INSERT INTO accounts (id, name, plan) VALUES (?, ?, ?)
  `).bind(ctx.testAccountId, 'Test Account 1', 'pro').run();

  await db.prepare(`
    INSERT INTO users (id, account_id, email, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).bind(ctx.testUserId, ctx.testAccountId, 'user1@test.local', 'User One', 'admin').run();

  await db.prepare(`
    INSERT INTO clients (id, account_id, name, durable_object_id, vectorize_namespace, r2_path_prefix, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(client1Id, ctx.testAccountId, 'Client 1', 'do-1', 'ns-1', 'r2/1', 'active').run();

  // Add user1 as agency_owner of client1 (grants full access)
  await db.prepare(`
    INSERT INTO client_members (id, client_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `).bind(randomUUID(), client1Id, ctx.testUserId, 'agency_owner').run();

  // Create second account (for cross-tenant testing)
  await db.prepare(`
    INSERT INTO accounts (id, name, plan) VALUES (?, ?, ?)
  `).bind(ctx.secondAccountId, 'Test Account 2', 'pro').run();

  await db.prepare(`
    INSERT INTO users (id, account_id, email, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).bind(ctx.secondUserId, ctx.secondAccountId, 'user2@test.local', 'User Two', 'admin').run();

  await db.prepare(`
    INSERT INTO clients (id, account_id, name, durable_object_id, vectorize_namespace, r2_path_prefix, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(client2Id, ctx.secondAccountId, 'Client 2', 'do-2', 'ns-2', 'r2/2', 'active').run();

  // Add user2 as agency_owner of client2 (grants full access)
  await db.prepare(`
    INSERT INTO client_members (id, client_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `).bind(randomUUID(), client2Id, ctx.secondUserId, 'agency_owner').run();

  return {
    account1: { id: ctx.testAccountId, userId: ctx.testUserId, clientId: client1Id },
    account2: { id: ctx.secondAccountId, userId: ctx.secondUserId, clientId: client2Id },
  };
}

/**
 * Seed test hubs and spokes for review testing
 */
export async function seedTestHubsAndSpokes(
  db: D1Database,
  accountId: string,
  clientId: string,
  count: number = 5
): Promise<{ hubId: string; spokeIds: string[] }> {
  const hubId = randomUUID();
  const spokeIds: string[] = [];

  // Create hub
  await db.prepare(`
    INSERT INTO hubs (id, account_id, client_id, name, status)
    VALUES (?, ?, ?, ?, ?)
  `).bind(hubId, accountId, clientId, 'Test Hub', 'active').run();

  // Create spokes
  for (let i = 0; i < count; i++) {
    const spokeId = randomUUID();
    spokeIds.push(spokeId);

    await db.prepare(`
      INSERT INTO spokes (id, account_id, client_id, hub_id, content, status, regeneration_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(spokeId, accountId, clientId, hubId, `Test spoke content ${i + 1}`, 'pending', 0).run();
  }

  return { hubId, spokeIds };
}

/**
 * Helper to switch context to a different account (for adversarial testing)
 */
export function switchToAccount(ctx: IntegrationContext, accountId: string, userId: string): Context {
  return {
    ...ctx,
    accountId,
    userId,
  };
}
