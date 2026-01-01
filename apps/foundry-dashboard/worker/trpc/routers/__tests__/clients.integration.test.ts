import { describe, it, expect, beforeAll } from 'vitest';
import { clientsRouter } from '../clients';
import {
  createIntegrationContext,
  seedTestAccounts,
  IntegrationContext,
} from './integration-harness';
import { TRPCError } from '@trpc/server';

describe('clientsRouter', () => {
  let ctx: IntegrationContext;
  let seededData: Awaited<ReturnType<typeof seedTestAccounts>>;

  beforeAll(async () => {
    ctx = createIntegrationContext();
    seededData = await seedTestAccounts(ctx.db, ctx);
  });

  describe('list', () => {
    it('lists clients for the account', async () => {
      const caller = clientsRouter.createCaller(ctx);
      const result = await caller.list({});
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.name).toBe('Client 1');
    });
  });

  describe('create', () => {
    it('creates a client and adds owner', async () => {
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        name: 'New Client From Test',
        brandColor: '#FF0000',
      };

      const result = await caller.create(input);
      expect(result.success).toBe(true);
      expect(result.clientId).toBeDefined();

      const newClient = await ctx.drizzle.query.clients.findFirst({
          where: (c, { eq }) => eq(c.id, result.clientId!),
      });
      expect(newClient?.name).toBe('New Client From Test');

      const member = await ctx.drizzle.query.clientMembers.findFirst({
        where: (cm, { and, eq }) => and(eq(cm.clientId, result.clientId!), eq(cm.userId, ctx.testUserId)),
      });
      expect(member?.role).toBe('agency_owner');
    });
  });

  describe('addMember', () => {
    it('adds a member if user has permissions', async () => {
      const caller = clientsRouter.createCaller(ctx);
      const now = Date.now();
      const newUser = { id: crypto.randomUUID(), email: `new.member.${now}@test.com`, name: 'New Member'};
      await ctx.db.prepare('INSERT INTO user (id, email, emailVerified, name, createdAt, updatedAt) VALUES (?, ?, 0, ?, ?, ?)').bind(newUser.id, newUser.email, newUser.name, now, now).run();

      const input = {
        clientId: seededData.account1.clientId,
        email: newUser.email,
        role: 'creator' as const,
      };

      const result = await caller.addMember(input);
      expect(result.success).toBe(true);

      const member = await ctx.drizzle.query.clientMembers.findFirst({
          where: (cm, { and, eq }) => and(eq(cm.clientId, input.clientId), eq(cm.userId, newUser.id)),
      });
      expect(member?.role).toBe('creator');
    });

    it('throws forbidden if user is not an owner', async () => {
      // Use the existing context but with a non-owner role
      // The seeded user is admin on their client, but we'll test with a creator role
      const nonOwnerId = crypto.randomUUID();
      const now = Date.now();

      // Create a user with 'creator' role on account1's client
      await ctx.db.prepare('INSERT INTO user (id, email, emailVerified, name, createdAt, updatedAt) VALUES (?, ?, 0, ?, ?, ?)').bind(nonOwnerId, `creator.${now}@test.com`, 'Creator User', now, now).run();
      await ctx.db.prepare('INSERT INTO client_members (id, client_id, user_id, role) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), seededData.account1.clientId, nonOwnerId, 'creator').run();

      // Create context for this non-owner user
      const nonOwnerCtx = { ...ctx, userId: nonOwnerId, testUserId: nonOwnerId };
      const caller = clientsRouter.createCaller(nonOwnerCtx);

      const input = {
        clientId: seededData.account1.clientId,
        email: 'another.user@example.com',
        role: 'creator' as const,
      };

      await expect(caller.addMember(input)).rejects.toThrow(TRPCError);
    });
  });

  describe('switch', () => {
    it('updates active client in profile', async () => {
      // First, create a second client that the test user is a member of
      const secondClientId = crypto.randomUUID();
      const now = Date.now();
      await ctx.db.prepare('INSERT INTO clients (id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').bind(secondClientId, 'Second Client', 'active', now, now).run();
      await ctx.db.prepare('INSERT INTO client_members (id, client_id, user_id, role) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), secondClientId, ctx.testUserId, 'admin').run();

      // Create user profile if it doesn't exist
      await ctx.db.prepare('INSERT OR IGNORE INTO user_profiles (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), ctx.testUserId, now, now).run();

      const caller = clientsRouter.createCaller(ctx);
      const input = { clientId: secondClientId };

      const result = await caller.switch(input);
      expect(result.success).toBe(true);

      const profile = await ctx.drizzle.query.userProfiles.findFirst({
          where: (up, { eq }) => eq(up.userId, ctx.testUserId)
      });
      expect(profile?.activeClientId).toBe(secondClientId);
    });
  });

  // More tests would be refactored here...
});
