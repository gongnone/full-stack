// @ts-nocheck — stale test fixtures, needs rewrite to match current API
import { describe, it, expect, beforeAll } from 'vitest';
import { authRouter } from '../auth';
import * as schema from '../../../db/schema';
import {
  createIntegrationContext,
  seedTestAccounts,
  IntegrationContext,
} from './integration-harness';
import { TRPCError } from '@trpc/server';

describe('authRouter', () => {
  let ctx: IntegrationContext;
  let seededData: Awaited<ReturnType<typeof seedTestAccounts>>;

  beforeAll(async () => {
    ctx = createIntegrationContext();
    seededData = await seedTestAccounts(ctx.db, ctx);
  });

  describe('me', () => {
    it('returns user and profile when authenticated', async () => {
      const caller = authRouter.createCaller(ctx);
      const result = await caller.me();

      expect(result.user.id).toBe(ctx.testUserId);
      // The seed creates a user, the router is expected to create the profile
      expect(result.profile?.display_name).toBe('User One');
      expect(result.clientId).toBe(seededData.account1.clientId);
    });

    it('throws unauthorized if userId is missing', async () => {
      const unauthedCtx = { ...ctx, userId: '' };
      const caller = authRouter.createCaller(unauthedCtx);
      await expect(caller.me()).rejects.toThrow(TRPCError);
    });

    it('returns clientId: null when user has no clients', async () => {
        const noClientCtx = createIntegrationContext();
        const now = Date.now();
        await noClientCtx.db.prepare(`
            INSERT INTO user (id, email, emailVerified, name, createdAt, updatedAt) VALUES (?, ?, 0, ?, ?, ?)
        `).bind(noClientCtx.testUserId, 'no-client@test.com', 'No Client User', now, now).run();

        const caller = authRouter.createCaller(noClientCtx);
        const result = await caller.me();

        expect(result.clientId).toBeNull();
        expect(result.user.id).toBe(noClientCtx.testUserId);
    });

    it('returns clientId from active_client_id when set', async () => {
        const caller = authRouter.createCaller(ctx);

        // Set active_client_id on the user's profile
        await ctx.drizzle.insert(schema.userProfiles).values({
            userId: ctx.testUserId,
            activeClientId: seededData.account2.clientId,
            displayName: 'Test User',
            emailNotifications: false,
        }).onConflictDoUpdate({
            target: schema.userProfiles.userId,
            set: { activeClientId: seededData.account2.clientId }
        });

        const result = await caller.me();
        expect(result.clientId).toBe(seededData.account2.clientId);
    });

    it('falls back to first client membership when no active_client_id', async () => {
      const caller = authRouter.createCaller(ctx);
      // Ensure profile exists but has no active client
      await ctx.drizzle.insert(schema.userProfiles).values({
        userId: ctx.testUserId,
        displayName: 'Test User',
        emailNotifications: false,
        activeClientId: null,
      }).onConflictDoUpdate({
        target: schema.userProfiles.userId,
        set: { activeClientId: null }
      });

      const result = await caller.me();
      expect(result.clientId).toBe(seededData.account1.clientId);
    });
  });

  describe('updateProfile', () => {
    it('updates existing profile', async () => {
      const caller = authRouter.createCaller(ctx);
      const input = {
        displayName: 'New Name',
        emailNotifications: true,
      };

      const result = await caller.updateProfile(input);
      expect(result.success).toBe(true);

      const updatedProfile = await ctx.drizzle.query.userProfiles.findFirst({
        where: (up, { eq }) => eq(up.userId, ctx.testUserId),
      });

      expect(updatedProfile?.displayName).toBe('New Name');
      expect(updatedProfile?.emailNotifications).toBe(1);
    });

    it('creates profile if not existing during update', async () => {
        const newCtx = createIntegrationContext();
        const now = Date.now();
        await newCtx.db.prepare(`
            INSERT INTO user (id, email, emailVerified, name, createdAt, updatedAt) VALUES (?, ?, 0, ?, ?, ?)
        `).bind(newCtx.testUserId, 'new-user-profile@test.com', 'New Profile User', now, now).run();

      const caller = authRouter.createCaller(newCtx);
      const input = {
        displayName: 'A Whole New World',
      };

      const result = await caller.updateProfile(input);
      expect(result.success).toBe(true);

      const newProfile = await newCtx.drizzle.query.userProfiles.findFirst({
        where: (up, { eq }) => eq(up.userId, newCtx.testUserId),
      });
      expect(newProfile?.displayName).toBe('A Whole New World');
    });
  });
});
