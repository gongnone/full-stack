import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance for React Query / tRPC
 * Exported separately to allow cache clearing on logout/login
 *
 * Story R-13: Session Cache Isolation
 * - queryClient.clear() MUST be called on signOut to prevent data leakage
 * - queryClient.clear() MUST be called on signIn to clear stale cached data
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * Clear all cached data - call on session boundaries (login/logout)
 * Prevents user A's data from being visible to user B in same browser
 */
export function clearSessionCache(): void {
  queryClient.clear();
}
