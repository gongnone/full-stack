/**
 * Story 3.6: Pillar-First Hub Creation
 * CorePillarsTab - Display approved Brand DNA pillars for hub creation
 */

import { trpc } from '@/lib/trpc-client';
import type { Pillar } from './ExtractionProgress';

interface CorePillarsTabProps {
  clientId: string;
  onPillarsSelected: (pillars: Pillar[]) => void;
  disabled?: boolean;
}

// Framework type badge colors (from story spec)
const FRAMEWORK_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  catalyst: { bg: 'rgba(255, 173, 31, 0.15)', color: 'var(--warning)', label: 'CATALYST' },
  core_truth: { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--edit)', label: 'CORE TRUTH' },
  proof: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--approve)', label: 'PROOF' },
};

function TargetIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="6" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="2" strokeWidth={1.5} />
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" data-testid="core-pillars-loading">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-20 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
          </div>
          <div className="h-4 w-3/4 rounded mb-2" style={{ backgroundColor: 'var(--bg-hover)' }} />
          <div className="h-3 w-full rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
        </div>
      ))}
    </div>
  );
}

export function CorePillarsTab({ clientId, onPillarsSelected, disabled }: CorePillarsTabProps) {
  const { data: pillars, isLoading, error } = trpc.pillars.getApprovedPillarsForHub.useQuery(
    { clientId },
    { enabled: !!clientId }
  );

  const handleUsePillars = () => {
    if (!pillars || pillars.length === 0) return;

    // Transform to Pillar[] format expected by wizard
    const transformedPillars: Pillar[] = pillars.map(p => ({
      id: p.id,
      title: p.title,
      coreClaim: p.coreClaim,
      psychologicalAngle: p.psychologicalAngle as Pillar['psychologicalAngle'],
      estimatedSpokeCount: p.estimatedSpokeCount,
      supportingPoints: p.supportingPoints,
    }));

    onPillarsSelected(transformedPillars);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div
        className="p-4 rounded-lg text-center"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--kill)' }}
      >
        <p className="text-sm" style={{ color: 'var(--kill)' }}>
          Failed to load pillars: {error.message}
        </p>
      </div>
    );
  }

  if (!pillars || pillars.length === 0) {
    return (
      <div
        className="p-6 rounded-lg text-center"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <TargetIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          No Approved Pillars Yet
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Complete Brand DNA onboarding to create pillars, then approve them to use here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="core-pillars-tab">
      {/* Header */}
      <div>
        <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          Your Approved Brand Pillars
        </h4>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Use your strategic content pillars from Brand DNA to create a Hub without uploading content.
        </p>
      </div>

      {/* Pillar list */}
      <div className="space-y-3" data-testid="core-pillars-list">
        {pillars.map((pillar) => {
          const framework = FRAMEWORK_COLORS[pillar.frameworkType || 'core_truth'] ?? FRAMEWORK_COLORS.core_truth;

          return (
            <div
              key={pillar.id}
              data-testid={`pillar-card-${pillar.id}`}
              className="p-4 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {/* Framework badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  data-testid="framework-badge"
                  className="px-2 py-0.5 text-xs font-semibold rounded"
                  style={{ backgroundColor: framework?.bg, color: framework?.color }}
                >
                  {framework?.label}
                </span>
              </div>

              {/* Pillar title */}
              <h5 data-testid="pillar-title" className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {pillar.title}
              </h5>

              {/* Description (truncated to 100 chars as per AC3) */}
              <p data-testid="pillar-description" className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {pillar.coreClaim.length > 100
                  ? `${pillar.coreClaim.substring(0, 100)}...`
                  : pillar.coreClaim}
              </p>
            </div>
          );
        })}
      </div>

      {/* Use These Pillars button */}
      <button
        onClick={handleUsePillars}
        disabled={disabled || pillars.length === 0}
        data-testid="use-pillars-button"
        className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          backgroundColor: 'var(--approve)',
          color: 'white',
        }}
      >
        <TargetIcon className="w-4 h-4" style={{ color: 'white' }} />
        Use These Pillars
      </button>
    </div>
  );
}
