/**
 * Story 3.4: Hub Metadata & State Management
 * Hub Detail Route - Display Hub with pillars
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import type { Pillar } from '../../../worker/types';

export const Route = createFileRoute('/app/hubs/$hubId')({
  component: HubDetailPage,
});

// Source type labels
const SOURCE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF Document',
  text: 'Pasted Text',
  url: 'URL Content',
};

// Status badge colors
const STATUS_CONFIG = {
  processing: { label: 'Processing', bgColor: 'var(--warning)', textColor: '#000' },
  ready: { label: 'Ready', bgColor: 'var(--approve)', textColor: '#fff' },
  archived: { label: 'Archived', bgColor: 'var(--text-muted)', textColor: '#fff' },
} as const;

const DEFAULT_STATUS_CONFIG = STATUS_CONFIG.ready;

// Psychological angle badge colors
const ANGLE_COLORS: Record<string, string> = {
  Contrarian: '#E11D48',    // Rose
  Authority: '#2563EB',     // Blue
  Urgency: '#EA580C',       // Orange
  Aspiration: '#7C3AED',    // Violet
  Fear: '#DC2626',          // Red
  Curiosity: '#0891B2',     // Cyan
  Transformation: '#059669', // Emerald
  Rebellion: '#BE185D',     // Pink
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const angleColor = ANGLE_COLORS[pillar.psychologicalAngle] || 'var(--text-muted)';

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
          {pillar.title}
        </h3>
        <span
          className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: angleColor, color: '#fff' }}
        >
          {pillar.psychologicalAngle}
        </span>
      </div>

      {/* Core Claim */}
      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
        {pillar.coreClaim}
      </p>

      {/* Supporting Points */}
      {pillar.supportingPoints.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            Supporting Points
          </p>
          <ul className="space-y-1">
            {pillar.supportingPoints.slice(0, 3).map((point, idx) => (
              <li key={idx} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: angleColor }}>•</span>
                <span>{point}</span>
              </li>
            ))}
            {pillar.supportingPoints.length > 3 && (
              <li className="text-xs" style={{ color: 'var(--text-muted)' }}>
                +{pillar.supportingPoints.length - 3} more...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Estimated Spokes */}
      <div className="mt-3 pt-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
        <span>Estimated Spokes</span>
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
          {pillar.estimatedSpokeCount}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
        <div className="h-4 w-4" />
        <div className="h-4 w-32 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
      </div>
      <div className="h-8 w-64 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
      <div className="h-4 w-48 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />

      {/* Pillars skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-lg" style={{ backgroundColor: 'var(--bg-surface)' }} />
        ))}
      </div>
    </div>
  );
}

function HubDetailPage() {
  const { hubId } = Route.useParams();

  // Get client ID
  const { data: userData } = trpc.auth.me.useQuery();
  const clientId = userData?.user?.id || '';

  // Fetch Hub data
  const { data: hub, isLoading, error } = trpc.hubs.get.useQuery(
    { hubId, clientId },
    { enabled: !!clientId && !!hubId }
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/app/hubs"
          className="text-sm flex items-center gap-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Hubs
        </Link>
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--kill)' }}
        >
          <p style={{ color: 'var(--kill)' }}>
            {error.message === 'Hub not found' ? 'This Hub does not exist or you do not have access to it.' : `Error: ${error.message}`}
          </p>
        </div>
      </div>
    );
  }

  if (!hub) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[hub.status as keyof typeof STATUS_CONFIG] ?? DEFAULT_STATUS_CONFIG;
  const totalEstimatedSpokes = hub.pillars.reduce((sum: number, p: Pillar) => sum + p.estimatedSpokeCount, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/app/hubs" className="hover:underline">
          Hubs
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span style={{ color: 'var(--text-primary)' }}>{hub.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {hub.title}
            </h1>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }}
            >
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>{SOURCE_TYPE_LABELS[hub.source_type] || hub.source_type}</span>
            <span>•</span>
            <span>{formatDate(hub.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {hub.status === 'ready' && (
            <button
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--approve)', color: '#fff' }}
              onClick={() => {
                // TODO: Navigate to Spoke generation (Epic 4)
                alert('Spoke generation coming in Epic 4');
              }}
            >
              Generate Spokes
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div
          className="px-4 py-3 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {hub.pillar_count}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pillars</p>
        </div>
        <div
          className="px-4 py-3 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {hub.spoke_count}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Spokes</p>
        </div>
        <div
          className="px-4 py-3 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-secondary)' }}>
            ~{totalEstimatedSpokes}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Estimated Total</p>
        </div>
      </div>

      {/* Pillars Grid */}
      <div>
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Content Pillars
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hub.pillars.map((pillar: Pillar) => (
            <PillarCard key={pillar.id} pillar={pillar} />
          ))}
        </div>
      </div>
    </div>
  );
}
