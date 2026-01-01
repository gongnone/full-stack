import { env } from 'cloudflare:test';
import type { Context } from '../../context';
import { initDatabase } from '../../../db';

// Use web crypto API (available in Cloudflare Workers and Node 19+)
const randomUUID = (): string => crypto.randomUUID();

export interface IntegrationContext extends Context {
  testAccountId: string;
  testUserId: string;
  secondAccountId: string; // For cross-tenant testing
  secondUserId: string;
}

/**
 * Create an integration test context with real D1 database via native test env
 */
export function createIntegrationContext(): IntegrationContext {
  const db = env.DB;
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
    userId: testUserId,
    accountId: testAccountId,
    userRole: 'admin',
    callAgent: async <T = unknown>(clientId: string, method: string, params: any): Promise<T> => {
      // For integration tests, we simulate DO logic or return success
      // If we wanted real DO integration, we'd add Durable Objects to the pool
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
  };

  return ctx;
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

  // Create first user and client
  await db.prepare(`
    INSERT INTO user (id, email, emailVerified, name, createdAt, updatedAt)
    VALUES (?, ?, 0, ?, ?, ?)
  `).bind(ctx.testUserId, 'user1@test.local', 'User One', Date.now(), Date.now()).run();

  await db.prepare(`
    INSERT INTO clients (id, name, status)
    VALUES (?, ?, ?)
  `).bind(client1Id, 'Client 1', 'active').run();

  // Add user1 as agency_owner of client1 (grants full access)
  await db.prepare(`
    INSERT INTO client_members (id, client_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `).bind(randomUUID(), client1Id, ctx.testUserId, 'admin').run();

  // Create second user (for cross-tenant testing)
  await db.prepare(`
    INSERT INTO user (id, email, emailVerified, name, createdAt, updatedAt)
    VALUES (?, ?, 0, ?, ?, ?)
  `).bind(ctx.secondUserId, 'user2@test.local', 'User Two', Date.now(), Date.now()).run();

  await db.prepare(`
    INSERT INTO clients (id, name, status)
    VALUES (?, ?, ?)
  `).bind(client2Id, 'Client 2', 'active').run();

  // Add user2 as agency_owner of client2 (grants full access)
  await db.prepare(`
    INSERT INTO client_members (id, client_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `).bind(randomUUID(), client2Id, ctx.secondUserId, 'admin').run();

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
  clientId: string,
  userId: string,
  count: number = 5
): Promise<{ hubId: string; spokeIds: string[] }> {
  const hubId = randomUUID();
    const sourceId = randomUUID();
  const spokeIds: string[] = [];

  // Create hub
  await db.prepare(`
    INSERT INTO hubs (id, client_id, user_id, source_id, title, source_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(hubId, clientId, userId, sourceId, 'Test Hub', 'text').run();

  // Create spokes
  for (let i = 0; i < count; i++) {
    const spokeId = randomUUID();
    spokeIds.push(spokeId);

    await db.prepare(`
      INSERT INTO spokes (id, client_id, hub_id, content, status)
      VALUES (?, ?, ?, ?, ?)
    `).bind(spokeId, clientId, hubId, `Test spoke content ${i + 1}`, 'pending').run();
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
