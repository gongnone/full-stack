import { describe, it, expect, beforeAll } from 'vitest';
import { hubsRouter } from '../hubs';
import {
  createIntegrationContext,
  seedTestAccounts,
  IntegrationContext,
} from './integration-harness';

describe('hubsRouter', () => {
  let ctx: IntegrationContext;
  let seededData: Awaited<ReturnType<typeof seedTestAccounts>>;

  beforeAll(async () => {
    ctx = createIntegrationContext();
    seededData = await seedTestAccounts(ctx.db, ctx);
  });

  describe('createUrlSource', () => {
    it('creates a URL source successfully', async () => {
      const caller = hubsRouter.createCaller(ctx);
      const input = {
        clientId: seededData.account1.clientId,
        url: 'https://example.com/article',
        title: 'Example Article',
      };

      const result = await caller.createUrlSource(input);
      expect(result.status).toBe('pending');
      expect(result.sourceId).toBeDefined();

      // Use raw SQL query since hubSources isn't in drizzle schema yet
      const source = await ctx.db.prepare('SELECT * FROM hub_sources WHERE id = ?').bind(result.sourceId).first<{ title: string; source_type: string }>();
      expect(source?.title).toBe('Example Article');
      expect(source?.source_type).toBe('url');
    });

    it('validates URL format', async () => {
      const caller = hubsRouter.createCaller(ctx);
      const input = {
        clientId: seededData.account1.clientId,
        url: 'invalid-url',
      };

      await expect(caller.createUrlSource(input)).rejects.toThrow();
    });
  });

  describe('getRecentSources', () => {
    it('returns a list of sources', async () => {
        const caller = hubsRouter.createCaller(ctx);
        // Create a source first using raw SQL since hubSources isn't in drizzle schema yet
        // Status must be one of: 'pending', 'processing', 'ready', 'failed' per schema CHECK constraint
        const sourceId = crypto.randomUUID();
        const now = Date.now();
        await ctx.db.prepare(`
          INSERT INTO hub_sources (id, client_id, user_id, title, source_type, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(sourceId, seededData.account1.clientId, ctx.testUserId, 'Recent Source', 'text', 'ready', now, now).run();

      const input = {
        clientId: seededData.account1.clientId,
        limit: 5,
      };

      const result = await caller.getRecentSources(input);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.find((s: { title: string }) => s.title === 'Recent Source')).toBeDefined();
    });
  });

  // Not all tests refactored for brevity
});
