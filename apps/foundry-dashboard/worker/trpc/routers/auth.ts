import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import type { User, UserProfile, UserWithProfile } from '../../types';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

/**
 * Helper to get the first available client ID for a user
 */
async function getFirstClientId(ctx: Context): Promise<string | null> {
  const membership = await ctx.db
    .prepare('SELECT client_id FROM client_members WHERE user_id = ? LIMIT 1')
    .bind(ctx.userId)
    .first<{ client_id: string }>();
  return membership?.client_id || null;
}

// Input validation schemas
// displayName is required for AC2 (update display name)
// Other fields are optional for future profile expansion
const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  avatarUrl: z.string().url('Invalid URL format').optional().nullable(),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  timezone: z.string().optional(),
  emailNotifications: z.boolean().optional(),
});

export const authRouter = t.router({
  /**
   * Get current authenticated user with their profile
   * AC1: View profile information (name, email, avatar)
   */
  me: procedure.query(async ({ ctx }): Promise<UserWithProfile> => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }

    // Get user from Better Auth user table
    // Note: DB columns are snake_case, must alias to camelCase for User type
    const userResult = await ctx.db
      .prepare(`SELECT id, email, name, email_verified as emailVerified, image,
                created_at as createdAt, updated_at as updatedAt FROM user WHERE id = ?`)
      .bind(ctx.userId)
      .first<User>();

    if (!userResult) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    // Get or create user profile
    let profile = await ctx.db
      .prepare('SELECT * FROM user_profiles WHERE user_id = ?')
      .bind(ctx.userId)
      .first<UserProfile>();

    // Auto-create profile if it doesn't exist (construct object directly to avoid redundant query)
    if (!profile) {
      const profileId = crypto.randomUUID().replace(/-/g, '');
      const now = Math.floor(Date.now() / 1000);
      const defaultAvatarColor = '#1D9BF0';

      await ctx.db
        .prepare(`
          INSERT INTO user_profiles (id, user_id, display_name, avatar_color, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(profileId, ctx.userId, userResult.name || null, defaultAvatarColor, now, now)
        .run();

      // Construct profile from known INSERT values (avoids redundant SELECT query)
      profile = {
        id: profileId,
        user_id: ctx.userId,
        display_name: userResult.name || null,
        avatar_url: null,
        avatar_color: defaultAvatarColor,
        timezone: 'UTC',
        email_notifications: 1,
        preferences_json: null,
        active_client_id: null,
        created_at: now,
        updated_at: now,
      };
    }

    // Priority: profile.active_client_id > first client in client_members > accountId
    const clientId = profile?.active_client_id || await getFirstClientId(ctx) || ctx.accountId || ctx.userId;

    return {
      user: userResult,
      profile: profile || null,
      clientId,
    };
  }),

  /**
   * Update user profile
   * AC2: Save changes to user_profiles table
   */
  updateProfile: procedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        });
      }

      const now = Math.floor(Date.now() / 1000);

      // Check if profile exists
      const existingProfile = await ctx.db
        .prepare('SELECT id FROM user_profiles WHERE user_id = ?')
        .bind(ctx.userId)
        .first<{ id: string }>();

      if (!existingProfile) {
        // Create new profile
        const profileId = crypto.randomUUID().replace(/-/g, '');
        await ctx.db
          .prepare(`
            INSERT INTO user_profiles (id, user_id, display_name, avatar_url, avatar_color, timezone, email_notifications, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            profileId,
            ctx.userId,
            input.displayName || null,
            input.avatarUrl || null,
            input.avatarColor || '#1D9BF0',
            input.timezone || 'UTC',
            input.emailNotifications === false ? 0 : 1,
            now,
            now
          )
          .run();
      } else {
        // Build dynamic update query
        const updates: string[] = [];
        const values: (string | number | null)[] = [];

        if (input.displayName !== undefined) {
          updates.push('display_name = ?');
          values.push(input.displayName);
        }
        if (input.avatarUrl !== undefined) {
          updates.push('avatar_url = ?');
          values.push(input.avatarUrl);
        }
        if (input.avatarColor !== undefined) {
          updates.push('avatar_color = ?');
          values.push(input.avatarColor);
        }
        if (input.timezone !== undefined) {
          updates.push('timezone = ?');
          values.push(input.timezone);
        }
        if (input.emailNotifications !== undefined) {
          updates.push('email_notifications = ?');
          values.push(input.emailNotifications ? 1 : 0);
        }

        // Early return if no fields to update
        if (updates.length === 0) {
          return { success: true, message: 'No changes to save' };
        }

        updates.push('updated_at = ?');
        values.push(now);
        values.push(ctx.userId);

        await ctx.db
          .prepare(`UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = ?`)
          .bind(...values)
          .run();
      }

      return { success: true, message: 'Profile updated' };
    }),

  /**
   * Get user profile only (lightweight query)
   */
  getProfile: procedure.query(async ({ ctx }): Promise<UserProfile | null> => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }

    const profile = await ctx.db
      .prepare('SELECT * FROM user_profiles WHERE user_id = ?')
      .bind(ctx.userId)
      .first<UserProfile>();

    return profile || null;
  }),
});
