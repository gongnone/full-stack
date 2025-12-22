/**
 * Story 3.5: Real-Time Ingestion Progress
 * Success celebration state with Hub statistics
 */

import type { Pillar } from './ExtractionProgress';

interface IngestionSuccessProps {
  hubTitle?: string;
  pillars: Pillar[];
  sourceType?: 'pdf' | 'text' | 'url';
  onViewHub?: () => void;
  onStartGeneration?: () => void;
}

function CheckCircleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

export function IngestionSuccess({
  hubTitle,
  pillars,
  sourceType,
  onViewHub,
  onStartGeneration,
}: IngestionSuccessProps) {
  const totalEstimatedSpokes = pillars.reduce((sum, p) => sum + (p.estimatedSpokeCount || 5), 0);

  return (
    <div
      className="p-6 space-y-8"
      data-testid="ingestion-success"
      role="status"
      aria-live="polite"
    >
      {/* Success celebration */}
      <div className="text-center">
        {/* Animated checkmark */}
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 animate-success-check"
          style={{ backgroundColor: 'rgba(0, 210, 106, 0.15)' }}
        >
          <CheckCircleIcon className="w-12 h-12" style={{ color: 'var(--approve)' }} />
        </div>

        {/* Success message - 24px typography per AC5 */}
        <h3
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Hub Created!
        </h3>

        {hubTitle && (
          <p
            className="text-lg mt-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {hubTitle}
          </p>
        )}
      </div>

      {/* Statistics panel */}
      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Pillar count */}
          <div className="space-y-1">
            <p
              className="text-3xl font-bold animate-counter-pop"
              style={{ color: 'var(--approve)' }}
            >
              {pillars.length}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Pillars
            </p>
          </div>

          {/* Estimated spokes */}
          <div className="space-y-1">
            <p
              className="text-3xl font-bold"
              style={{ color: 'var(--edit)' }}
            >
              ~{totalEstimatedSpokes}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Est. Spokes
            </p>
          </div>

          {/* Source type */}
          <div className="space-y-1">
            <p
              className="text-3xl font-bold capitalize"
              style={{ color: 'var(--text-primary)' }}
            >
              {sourceType || 'Doc'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Source
            </p>
          </div>
        </div>
      </div>

      {/* Pillar summary */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium px-1" style={{ color: 'var(--text-primary)' }}>
          Your Content Pillars
        </h4>
        <div className="flex flex-wrap gap-2">
          {pillars.map((pillar, index) => (
            <span
              key={pillar.id}
              className="px-3 py-1.5 text-sm rounded-full animate-fadeIn"
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                animationDelay: `${Math.min(index * 100, 1000)}ms`,
              }}
            >
              {pillar.title}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onViewHub && (
          <button
            onClick={onViewHub}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
            data-testid="view-hub-button"
          >
            <span>View Hub</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        )}

        {onStartGeneration && (
          <button
            onClick={onStartGeneration}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all btn-approve hover:scale-105"
            style={{
              backgroundColor: 'var(--approve)',
              color: 'var(--bg-base)',
            }}
            data-testid="start-generation-button"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Start Generation</span>
          </button>
        )}
      </div>

      {/* Next steps hint */}
      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        Your content pillars are ready. Start generation to create spokes for each pillar.
      </p>
    </div>
  );
}
