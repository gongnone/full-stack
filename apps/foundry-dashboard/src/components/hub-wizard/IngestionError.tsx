/**
 * Story 3.5: Real-Time Ingestion Progress
 * Error state component with retry functionality
 */

import type { Pillar } from './ExtractionProgress';

interface IngestionErrorProps {
  error: string;
  pillarsPreserved?: Pillar[];
  onRetry?: () => void;
  isRetrying?: boolean;
}

function AlertCircleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RefreshIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export function IngestionError({ error, pillarsPreserved, onRetry, isRetrying }: IngestionErrorProps) {
  const preservedCount = pillarsPreserved?.length || 0;

  return (
    <div
      className="p-6 space-y-6"
      data-testid="ingestion-error"
      role="alert"
      aria-live="assertive"
    >
      {/* Error header */}
      <div className="text-center">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(244, 33, 46, 0.15)' }}
        >
          <AlertCircleIcon className="w-8 h-8" style={{ color: 'var(--kill)' }} />
        </div>
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Extraction Failed
        </h3>
        <p
          className="text-sm mt-2 max-w-md mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          {error}
        </p>
      </div>

      {/* Error details panel */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: 'rgba(244, 33, 46, 0.05)',
          borderColor: 'var(--kill)',
        }}
      >
        <div className="flex items-start space-x-3">
          <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--kill)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--kill)' }}>
              What happened?
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              The extraction process encountered an error. This could be due to:
            </p>
            <ul className="text-xs mt-2 space-y-1" style={{ color: 'var(--text-muted)' }}>
              <li>• Document format issues</li>
              <li>• Processing timeout</li>
              <li>• Temporary service disruption</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preserved pillars notice */}
      {preservedCount > 0 && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: 'rgba(0, 210, 106, 0.05)',
            borderColor: 'var(--approve)',
          }}
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(0, 210, 106, 0.15)' }}
            >
              <span className="text-sm font-bold" style={{ color: 'var(--approve)' }}>
                {preservedCount}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--approve)' }}>
                Pillars Preserved
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Previously extracted pillars have been saved and will not be lost.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Retry action */}
      {onRetry && (
        <div className="flex justify-center">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: 'var(--edit)',
              color: 'var(--bg-base)',
            }}
            data-testid="retry-button"
            aria-label={isRetrying ? 'Retrying extraction' : 'Retry extraction'}
            aria-busy={isRetrying}
          >
            <RefreshIcon className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Retry Extraction'}</span>
          </button>
        </div>
      )}

      {/* Help text */}
      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        Retry will continue from the last successful stage, preserving your progress.
      </p>
    </div>
  );
}
