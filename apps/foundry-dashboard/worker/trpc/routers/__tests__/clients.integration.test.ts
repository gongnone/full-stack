import { describe, it, expect, beforeAll } from 'vitest';
import { clientsRouter } from '../clients';
import {
  createIntegrationContext,
  seedTestAccounts,
  IntegrationContext,
} from './integration-harness';
import { TRPCError } from '@trpc/server';
import * as schema from '../../../db/schema';
import { eq } from 'drizzle-orm';

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
      expect(member?.role).toBe('admin');
    });
  });

  describe('addMember', () => {
    it('adds a member if user has permissions', async () => {
      const caller = clientsRouter.createCaller(ctx);
      const newUser = { id: 'new-member-id', email: 'new.member@test.com', name: 'New Member'};
      await ctx.db.prepare('INSERT INTO user (id, email, name) VALUES (?, ?, ?)').bind(newUser.id, newUser.email, newUser.name).run();

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
        const nonOwnerCtx = createIntegrationContext();
        await seedTestAccounts(nonOwnerCtx.db, nonOwnerCtx);
        // Manually set a different role
        await nonOwnerCtx.drizzle.update(schema.clientMembers).set({ role: 'creator' }).where(
            eq(schema.clientMembers.userId, nonOwnerCtx.testUserId)
        );

      const caller = clientsRouter.createCaller(nonOwnerCtx);
      const input = {
        clientId: 'any-client-id',
        email: 'test@example.com',
        role: 'creator' as const,
      };

      await expect(caller.addMember(input)).rejects.toThrow(TRPCError);
    });
  });

  describe('switch', () => {
    it('updates active client in profile', async () => {
      const caller = clientsRouter.createCaller(ctx);
      const input = { clientId: seededData.account2.clientId };

      const result = await caller.switch(input);
      expect(result.success).toBe(true);

      const profile = await ctx.drizzle.query.userProfiles.findFirst({
          where: (up, { eq }) => eq(up.userId, ctx.testUserId)
      });
      expect(profile?.activeClientId).toBe(seededData.account2.clientId);
    });
  });

  // More tests would be refactored here...
});
