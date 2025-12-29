import { TRPCError } from '@trpc/server';
import type { Context } from '../context';

/**
 * Security helper to verify user has access to a client.
 * MUST be called at the start of every procedure that takes clientId from input.
 *
 * @param ctx - tRPC context with db and userId
 * @param clientId - The client ID to verify access for
 * @param requiredRoles - Optional array of roles that are allowed (e.g., ['agency_owner', 'account_manager'])
 * @returns The user's membership including their role
 * @throws TRPCError with FORBIDDEN if user is not a member or doesn't have required role
 */
export async function assertClientAccess(
  ctx: Context,
  clientId: string,
  requiredRoles?: string[]
): Promise<{ role: string }> {
  const membership = await ctx.db
    .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
    .bind(clientId, ctx.userId)
    .first<{ role: string }>();

  if (!membership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied. You are not a member of this client.',
    });
  }

  if (requiredRoles && !requiredRoles.includes(membership.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied. Insufficient permissions.',
    });
  }

  return membership;
}

/**
 * Check if user has read-only access to a client (any member role).
 */
export async function assertClientReadAccess(
  ctx: Context,
  clientId: string
): Promise<{ role: string }> {
  return assertClientAccess(ctx, clientId);
}

/**
 * Check if user has write access to a client (owner or manager roles).
 */
export async function assertClientWriteAccess(
  ctx: Context,
  clientId: string
): Promise<{ role: string }> {
  return assertClientAccess(ctx, clientId, ['agency_owner', 'account_manager']);
}

/**
 * Check if user has admin access to a client (owner only).
 */
export async function assertClientAdminAccess(
  ctx: Context,
  clientId: string
): Promise<{ role: string }> {
  return assertClientAccess(ctx, clientId, ['agency_owner']);
}
