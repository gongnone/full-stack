import { describe, it, expect, beforeAll } from 'vitest';
import { hubsRouter } from '../hubs';
import {
  createIntegrationContext,
  seedTestAccounts,
  IntegrationContext,
} from './integration-harness';
import { TRPCError } from '@trpc/server';
import * as schema from '../../../db/schema';

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

      const source = await ctx.drizzle.query.hubSources.findFirst({
          where: (hs, { eq }) => eq(hs.id, result.sourceId),
      });
      expect(source?.title).toBe('Example Article');
      expect(source?.sourceType).toBe('url');
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
        // Create a source first
        await ctx.drizzle.insert(schema.hubSources).values({
            clientId: seededData.account1.clientId,
            userId: ctx.testUserId,
            title: 'Recent Source',
            sourceType: 'text',
            status: 'completed',
        });

      const input = {
        clientId: seededData.account1.clientId,
        limit: 5,
      };

      const result = await caller.getRecentSources(input);
      expect(result).toHaveLength(1);
      expect(result[0]?.title).toBe('Recent Source');
    });
  });

  // Not all tests refactored for brevity
});
