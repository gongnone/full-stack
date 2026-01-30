import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';
import type { AdmiredProfile, AdmiredProfileWeighting } from '../../types';
import { nanoid } from 'nanoid';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

/**
 * Story 4.7: Admired Profiles Management Router
 * Manages Instagram profiles for personalized G7 engagement scoring
 */

// Validate Instagram handle format
function validateHandle(handle: string): string {
  // Remove @ prefix if present
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;

  // Instagram handles: 1-30 characters, alphanumeric + underscore + period
  const handleRegex = /^[a-zA-Z0-9_.]{1,30}$/;

  if (!handleRegex.test(cleanHandle)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid Instagram handle. Use only letters, numbers, underscores, and periods.',
    });
  }

  return cleanHandle;
}

// Calculate G7 weighting based on profile count (matches Story 4.6 AC1)
function calculateWeighting(profileCount: number): AdmiredProfileWeighting {
  let admiredWeight: number;
  let baselineWeight: number;
  let description: string;

  if (profileCount >= 5) {
    admiredWeight = 0.7;
    baselineWeight = 0.3;
    description = '70% admired, 30% baseline';
  } else if (profileCount >= 1) {
    admiredWeight = 0.5;
    baselineWeight = 0.5;
    description = '50% admired, 50% baseline';
  } else {
    admiredWeight = 0;
    baselineWeight = 1.0;
    description = '100% baseline';
  }

  return {
    profileCount,
    admiredWeight,
    baselineWeight,
    description,
  };
}

export const admiredProfilesRouter = t.router({
  /**
   * List all admired profiles for a client
   * AC4: Profile Card Display
   */
  list: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const profiles = await ctx.env.DB.prepare(
        `SELECT * FROM admired_profiles
         WHERE client_id = ?
         ORDER BY created_at DESC`
      )
        .bind(input.clientId)
        .all<AdmiredProfile>();

      return profiles.results || [];
    }),

  /**
   * Add a new admired profile
   * AC1: Add Admired Profile
   */
  add: procedure
    .input(z.object({
      clientId: z.string().min(1),
      instagramHandle: z.string().min(1).max(31), // Max 30 chars + @ prefix
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Validate and clean handle
      const cleanHandle = validateHandle(input.instagramHandle);

      // Check for duplicates
      const existing = await ctx.env.DB.prepare(
        `SELECT id FROM admired_profiles
         WHERE client_id = ? AND instagram_handle = ?`
      )
        .bind(input.clientId, cleanHandle)
        .first();

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This profile is already in your admired list.',
        });
      }

      const profileId = nanoid();
      const profileUrl = `https://www.instagram.com/${cleanHandle}/`;

      // Insert profile with pending status
      await ctx.env.DB.prepare(
        `INSERT INTO admired_profiles
         (id, client_id, instagram_handle, profile_url, status, created_at)
         VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`
      )
        .bind(profileId, input.clientId, cleanHandle, profileUrl)
        .run();

      // TODO: Enqueue Instagram scraping job
      // await ctx.env.ADMIRED_PROFILES_QUEUE.send({
      //   profileId,
      //   clientId: input.clientId,
      //   action: 'sync',
      // });

      return {
        id: profileId,
        instagram_handle: cleanHandle,
        profile_url: profileUrl,
        status: 'pending' as const,
      };
    }),

  /**
   * Remove an admired profile
   * AC6: Remove Profile
   */
  remove: procedure
    .input(z.object({
      clientId: z.string().min(1),
      profileId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Verify profile belongs to client
      const profile = await ctx.env.DB.prepare(
        `SELECT instagram_handle FROM admired_profiles
         WHERE id = ? AND client_id = ?`
      )
        .bind(input.profileId, input.clientId)
        .first<{ instagram_handle: string }>();

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found.',
        });
      }

      // Delete profile from database
      await ctx.env.DB.prepare(
        `DELETE FROM admired_profiles WHERE id = ?`
      )
        .bind(input.profileId)
        .run();

      // TODO: Delete vectors from Vectorize client_{clientId}_admired namespace
      // This requires Vectorize delete API which may need to be implemented
      // For now, vectors will remain but won't be queried (profile is deleted)

      return {
        success: true,
        handle: profile.instagram_handle,
      };
    }),

  /**
   * Manually re-sync an admired profile
   * AC5: Manual Re-sync
   */
  resync: procedure
    .input(z.object({
      clientId: z.string().min(1),
      profileId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Verify profile belongs to client
      const profile = await ctx.env.DB.prepare(
        `SELECT id FROM admired_profiles
         WHERE id = ? AND client_id = ?`
      )
        .bind(input.profileId, input.clientId)
        .first();

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found.',
        });
      }

      // Update status to syncing
      await ctx.env.DB.prepare(
        `UPDATE admired_profiles
         SET status = 'syncing', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
        .bind(input.profileId)
        .run();

      // TODO: Enqueue sync job
      // await ctx.env.ADMIRED_PROFILES_QUEUE.send({
      //   profileId: input.profileId,
      //   clientId: input.clientId,
      //   action: 'sync',
      // });

      return { success: true };
    }),

  /**
   * Get G7 weighting breakdown for client
   * AC9: G7 Weighting Impact Display
   */
  getWeighting: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Count active profiles
      const result = await ctx.env.DB.prepare(
        `SELECT COUNT(*) as count FROM admired_profiles
         WHERE client_id = ? AND status IN ('active', 'syncing')`
      )
        .bind(input.clientId)
        .first<{ count: number }>();

      const profileCount = result?.count || 0;

      return calculateWeighting(profileCount);
    }),
});
