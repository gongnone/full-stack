import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE,

    // Performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Session replay for debugging (optional, remove if not needed)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: import.meta.env.PROD ? 1.0 : 0,

    // Sentry is enabled in dev mode for testing, but logs instead of sending
    enabled: true,

    // Filter out noisy errors
    ignoreErrors: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Network errors users can't control
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      // User cancellation
      'AbortError',
    ],

    beforeSend(event) {
      // In development, log to console instead of sending to Sentry
      if (import.meta.env.DEV) {
        console.log('[Sentry] 📊 Would send error to Sentry:', event);
        console.log('[Sentry] 🔍 Error message:', event.exception?.values?.[0]?.value);
        console.log('[Sentry] 📍 Stack trace:', event.exception?.values?.[0]?.stacktrace);
        return null; // Don't actually send in dev mode
      }
      return event;
    },
  });

  console.log('[Sentry] ✅ Initialized', {
    dsn: SENTRY_DSN?.substring(0, 50) + '...',
    environment: import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE,
    mode: import.meta.env.MODE,
    enabled: true,
  });
}

// Re-export Sentry for use throughout the app
export { Sentry };
