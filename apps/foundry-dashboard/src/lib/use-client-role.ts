import { trpc } from './trpc-client';
import type { ClientRole } from './rbac';

/**
 * Hook to get the current user's role in the active client.
 * Used for RBAC UI - showing/hiding menu items based on permissions.
 *
 * @returns Object with role, loading state, and permission helpers
 */
export function useClientRole() {
  const { data: userData, isLoading } = trpc.auth.me.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  const role = (userData?.clientRole ?? null) as ClientRole | null;

  return {
    role,
    isLoading,
    // Permission helpers
    isAgencyOwner: role === 'agency_owner',
    isAccountManager: role === 'account_manager',
    isCreator: role === 'creator',
    isClientAdmin: role === 'client_admin',
    isClientReviewer: role === 'client_reviewer',
    // Role groups
    canManageTeam: role === 'agency_owner' || role === 'account_manager',
    canManageSettings: role === 'agency_owner' || role === 'account_manager',
    canCreateContent: role === 'agency_owner' || role === 'account_manager' || role === 'creator',
    canReview: role !== 'creator', // All except creator can review
    canAccessBilling: role === 'agency_owner',
    canViewAnalytics: role !== 'client_reviewer', // All except client_reviewer
  };
}
