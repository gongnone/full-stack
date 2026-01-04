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
 * No-op function for backwards compatibility.
 * Database setup is handled globally in test/setup.ts via beforeAll hook.
 * This function exists to satisfy imports in test files that reference it.
 */
export async function setupTestDatabase(_db: D1Database): Promise<void> {
  // Database is already initialized via test/setup.ts beforeAll hook
  // which runs all migrations. This is a no-op for compatibility.
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
    callEngine: async <T = unknown>(path: string, _options?: RequestInit): Promise<T> => {
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
  // Use unique emails per context to avoid UNIQUE constraint violations
  const uniqueSuffix = ctx.testUserId.substring(0, 8);

  // Create first user and client
  await db.prepare(`
    INSERT INTO user (id, email, email_verified, name, created_at, updated_at)
    VALUES (?, ?, 0, ?, ?, ?)
  `).bind(ctx.testUserId, `user1-${uniqueSuffix}@test.local`, 'User One', Date.now(), Date.now()).run();

  await db.prepare(`
    INSERT INTO clients (id, name, status)
    VALUES (?, ?, ?)
  `).bind(client1Id, 'Client 1', 'active').run();

  // Add user1 as agency_owner of client1 (grants full access for addMember, etc.)
  await db.prepare(`
    INSERT INTO client_members (id, client_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `).bind(randomUUID(), client1Id, ctx.testUserId, 'agency_owner').run();

  // Create second user (for cross-tenant testing)
  await db.prepare(`
    INSERT INTO user (id, email, email_verified, name, created_at, updated_at)
    VALUES (?, ?, 0, ?, ?, ?)
  `).bind(ctx.secondUserId, `user2-${uniqueSuffix}@test.local`, 'User Two', Date.now(), Date.now()).run();

  await db.prepare(`
    INSERT INTO clients (id, name, status)
    VALUES (?, ?, ?)
  `).bind(client2Id, 'Client 2', 'active').run();

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
  clientId: string,
  userId: string,
  count: number = 5
): Promise<{ hubId: string; spokeIds: string[]; pillarId: string }> {
  const hubId = randomUUID();
  const sourceId = randomUUID();
  const pillarId = randomUUID();
  const spokeIds: string[] = [];

  // Create hub_source first (required FK for hubs)
  await db.prepare(`
    INSERT INTO hub_sources (id, client_id, user_id, title, source_type, raw_content, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(sourceId, clientId, userId, 'Test Source', 'text', 'Test content for hub source', 'ready').run();

  // Create hub
  await db.prepare(`
    INSERT INTO hubs (id, client_id, user_id, source_id, title, source_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(hubId, clientId, userId, sourceId, 'Test Hub', 'text').run();

  // Create pillar (required FK for spokes)
  await db.prepare(`
    INSERT INTO extracted_pillars (id, source_id, client_id, title, core_claim, psychological_angle)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(pillarId, sourceId, clientId, 'Test Pillar', 'Test claim for integration testing', 'Authority').run();

  // Create spokes with all required fields
  const platforms = ['twitter', 'linkedin', 'tiktok', 'instagram', 'newsletter', 'thread', 'carousel'];
  const angles = ['Contrarian', 'Authority', 'Urgency', 'Aspiration', 'Fear', 'Curiosity', 'Transformation', 'Rebellion'];

  for (let i = 0; i < count; i++) {
    const spokeId = randomUUID();
    spokeIds.push(spokeId);
    const platform = platforms[i % platforms.length];
    const angle = angles[i % angles.length];

    await db.prepare(`
      INSERT INTO spokes (id, client_id, hub_id, pillar_id, platform, content, psychological_angle, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(spokeId, clientId, hubId, pillarId, platform, `Test spoke content ${i + 1}`, angle, 'pending').run();
  }

  return { hubId, spokeIds, pillarId };
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
