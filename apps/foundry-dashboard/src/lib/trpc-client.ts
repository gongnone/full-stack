import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../worker/trpc/router';

/**
 * tRPC React client for type-safe API calls
 * Connects to the backend tRPC server on localhost:8787
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Create tRPC client instance with authentication support
 * Uses httpBatchLink to batch multiple requests together
 */
export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/trpc`,

        // Send credentials (cookies) with every request for Better Auth sessions
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          } as RequestInit);
        },

        // Custom headers for additional context
        headers() {
          return {
            'Content-Type': 'application/json',
          };
        },
      }),
    ],
  });
}
