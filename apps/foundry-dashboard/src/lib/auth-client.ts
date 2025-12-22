import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client for React frontend
 * Handles authentication state and API calls
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8787',
});

// Export commonly used hooks and methods
export const { useSession, signIn, signUp, signOut } = authClient;

// Type exports for use across the app
export type Session = NonNullable<ReturnType<typeof useSession>['data']>;
export type User = Session['user'];
