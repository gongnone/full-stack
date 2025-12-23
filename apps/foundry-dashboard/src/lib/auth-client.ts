import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client for React frontend
 * Handles authentication state and API calls
 */
// For same-origin deployment (worker serves frontend + API), use empty baseURL
// This makes auth calls relative to current origin
const getBaseURL = () => {
  if (typeof window === 'undefined') return '';
  // In development with Vite proxy, use relative URLs
  // In production, frontend and API are same origin
  return import.meta.env.VITE_API_URL || '';
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

// Export commonly used hooks and methods
export const { useSession, signIn, signUp, signOut } = authClient;

// Type exports for use across the app
export type Session = NonNullable<ReturnType<typeof useSession>['data']>;
export type User = Session['user'];
