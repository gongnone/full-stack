import { createFileRoute } from '@tanstack/react-router';
import { Sentry } from '@/lib/sentry';

export const Route = createFileRoute('/sentry-test')({
  component: SentryTestPage,
});

function SentryTestPage() {
  const triggerError = () => {
    throw new Error('🧪 Test Error: Frontend exception triggered manually');
  };

  const triggerAsyncError = () => {
    setTimeout(() => {
      throw new Error('🧪 Test Error: Async exception after 1 second');
    }, 1000);
  };

  const triggerRejection = () => {
    Promise.reject(new Error('🧪 Test Error: Unhandled promise rejection'));
  };

  const triggerSentryCapture = () => {
    Sentry.captureException(new Error('🧪 Test Error: Manually captured exception'));
    alert('Error sent to Sentry! Check console and Sentry dashboard.');
  };

  const triggerComponentError = () => {
    // This will be caught by error boundary
    const BrokenComponent = () => {
      throw new Error('🧪 Test Error: Component render error');
    };
    return <BrokenComponent />;
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Sentry Error Testing</h1>
        <p className="text-gray-600 mb-8">
          Trigger different types of errors to test Sentry integration.
        </p>

        {/* Environment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="font-semibold mb-2">Current Environment</h2>
          <div className="text-sm space-y-1">
            <p>
              <strong>Mode:</strong>{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                {import.meta.env.MODE}
              </code>
            </p>
            <p>
              <strong>Environment:</strong>{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                {import.meta.env.VITE_ENVIRONMENT || 'development'}
              </code>
            </p>
            <p>
              <strong>Sentry DSN:</strong>{' '}
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                {import.meta.env.VITE_SENTRY_DSN
                  ? `${import.meta.env.VITE_SENTRY_DSN.substring(0, 50)}...`
                  : 'Not configured'}
              </code>
            </p>
            <p>
              <strong>Production:</strong>{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                {import.meta.env.PROD ? 'Yes' : 'No'}
              </code>
            </p>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong>{' '}
              {import.meta.env.DEV ? (
                <>
                  In development mode, errors are <strong>logged to console</strong>{' '}
                  but <strong>NOT sent to Sentry</strong> (to avoid polluting
                  dashboard).
                </>
              ) : (
                <>
                  In production mode, errors are <strong>sent to Sentry</strong>{' '}
                  immediately.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">1. Simple Error</h3>
            <p className="text-sm text-gray-600 mb-4">
              Throws a synchronous error that will be caught by Sentry.
            </p>
            <button
              onClick={triggerError}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Trigger Simple Error
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">2. Async Error</h3>
            <p className="text-sm text-gray-600 mb-4">
              Throws an error after 1 second delay.
            </p>
            <button
              onClick={triggerAsyncError}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
            >
              Trigger Async Error (1s delay)
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">3. Promise Rejection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Triggers an unhandled promise rejection.
            </p>
            <button
              onClick={triggerRejection}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Trigger Promise Rejection
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">4. Manual Capture</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manually captures an exception using Sentry.captureException().
            </p>
            <button
              onClick={triggerSentryCapture}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Trigger Manual Capture
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h3 className="font-semibold mb-2">5. Browser Console Test</h3>
            <p className="text-sm text-gray-600 mb-4">
              Open browser console (F12) and run this command:
            </p>
            <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm">
              throw new Error("🧪 Console test error");
            </code>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">✅ What to Check</h3>
          <ul className="text-sm space-y-2">
            <li>
              <strong>In Development:</strong> Check browser console for{' '}
              <code className="bg-green-100 px-2 py-1 rounded text-xs">
                [Sentry] 📊 Would send error to Sentry
              </code>
            </li>
            <li>
              <strong>In Production/Staging:</strong> Check Sentry dashboard at{' '}
              <a
                href="https://sentry.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                sentry.io
              </a>{' '}
              → Issues
            </li>
            <li>
              <strong>Verify:</strong> Stack traces show{' '}
              <code className="bg-green-100 px-2 py-1 rounded text-xs">
                sentry-test.tsx
              </code>{' '}
              (not minified .js)
            </li>
            <li>
              <strong>Filter:</strong> Use{' '}
              <code className="bg-green-100 px-2 py-1 rounded text-xs">
                environment:stage
              </code>{' '}
              or{' '}
              <code className="bg-green-100 px-2 py-1 rounded text-xs">
                environment:production
              </code>
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <a
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
