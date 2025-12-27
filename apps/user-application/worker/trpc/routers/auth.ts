import { z } from 'zod';
import { t } from '../trpc-instance';
import { user, user_profiles } from '@repo/data-ops/schema';
import { eq, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const authRouter = t.router({
  // Get current user + profile
  me: t.procedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const userData = await ctx.db
      .select()
      .from(user)
      .where(eq(user.id, ctx.userId))
      .get();

    if (!userData) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    let profile = await ctx.db
      .select()
      .from(user_profiles)
      .where(eq(user_profiles.user_id, ctx.userId))
      .get();

    // Auto-create profile if missing
    if (!profile) {
      const profileId = crypto.randomUUID();
      await ctx.db.insert(user_profiles).values({
        id: profileId,
        user_id: ctx.userId,
        display_name: userData.name,
      }).run();

      profile = await ctx.db
        .select()
        .from(user_profiles)
        .where(eq(user_profiles.id, profileId))
        .get();
    }

    return { user: userData, profile };
  }),

  // Update profile
  updateProfile: t.procedure
    .input(z.object({
      displayName: z.string().min(2).max(50),
      avatarUrl: z.string().url().optional(),
      timezone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      await ctx.db
        .update(user_profiles)
        .set({
          display_name: input.displayName,
          avatar_url: input.avatarUrl,
          timezone: input.timezone,
          updated_at: new Date(),
        })
        .where(eq(user_profiles.user_id, ctx.userId))
        .run();

      return { success: true };
    }),
});
