import { trpc } from './trpc-client';

/**
 * Hook to get the current client ID from the authenticated session.
 * For MVP, this returns the user's accountId or userId as their client workspace.
 * Epic 7 will add proper multi-client support with client selection.
 *
 * @returns clientId string or null if not authenticated
 */
export function useClientId(): string | null {
  const { data: userData } = trpc.auth.me.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  return userData?.clientId ?? null;
}

/**
 * Hook variant that throws an error if no clientId is available.
 * Use this in protected routes where authentication is guaranteed.
 */
export function useRequiredClientId(): string {
  const clientId = useClientId();

  if (!clientId) {
    throw new Error('Client ID required but user not authenticated');
  }

  return clientId;
}
