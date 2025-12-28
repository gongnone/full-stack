/**
 * Story 3.4: Hub Metadata & State Management
 * Hubs Index Route - List all Hubs with filtering
 */

import { createFileRoute, Link, Outlet, useMatch } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { HubCard } from '@/components/hubs';
import type { HubListItem } from '../../../worker/types';

export const Route = createFileRoute('/app/hubs')({
  component: HubsLayout,
});

// Layout component that renders child routes OR the hubs list
function HubsLayout() {
  // Check if we're on a child route (like /app/hubs/new)
  const childMatch = useMatch({ from: '/app/hubs/new', shouldThrow: false });
  const hubDetailMatch = useMatch({ from: '/app/hubs/$hubId', shouldThrow: false });

  // If on a child route, render the Outlet (child content)
  if (childMatch || hubDetailMatch) {
    return <Outlet />;
  }

  // Otherwise render the hubs list
  return <HubsPage />;
}

// Loading skeleton for Hub cards
function HubCardSkeleton() {
  return (
    <div
      className="rounded-lg p-4 animate-pulse"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          />
          <div>
            <div className="h-4 w-32 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
            <div className="h-3 w-20 rounded mt-2" style={{ backgroundColor: 'var(--bg-hover)' }} />
          </div>
        </div>
        <div className="h-5 w-16 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
      </div>
      <div className="flex gap-4 mt-3">
        <div className="h-4 w-20 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
        <div className="h-4 w-16 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
        No hubs yet
      </h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
        Create your first hub to start generating content
      </p>
      <Link
        to="/app/hubs/new"
        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
        style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Hub
      </Link>
    </div>
  );
}

function HubsPage() {
  // Get client ID using shared hook for consistency with hub creation wizard
  const clientId = useClientId() || '';

  // Fetch Hubs list
  const {
    data: hubsData,
    isLoading,
    error,
  } = trpc.hubs.list.useQuery(
    { clientId, limit: 50 },
    { enabled: !!clientId }
  );

  // Get hubs from data
  const hubs = hubsData?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Content Hubs
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage your content sources and pillars
          </p>
        </div>
        <Link
          to="/app/hubs/new"
          data-testid="new-hub-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Hub
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <HubCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--kill)' }}
        >
          <p style={{ color: 'var(--kill)' }}>
            Failed to load hubs: {error.message}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && hubs.length === 0 && <EmptyState />}

      {/* Hub grid */}
      {!isLoading && hubs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hubs.map((hub: HubListItem) => (
            <HubCard key={hub.id} hub={hub} />
          ))}
        </div>
      )}
    </div>
  );
}
