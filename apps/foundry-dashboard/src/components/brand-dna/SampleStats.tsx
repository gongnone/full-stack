interface SampleStatsProps {
  totalSamples: number;
  totalWords: number;
  averageQuality: number | null;
  analyzedCount: number;
  pendingCount: number;
  processingCount: number;
  failedCount: number;
  recommendation: string;
  isLoading?: boolean;
}

/**
 * SampleStats component for showing Brand DNA training sample statistics
 * Story 2.1: Multi-Source Content Ingestion for Brand Analysis
 */
export function SampleStats({
  totalSamples,
  totalWords,
  averageQuality,
  analyzedCount,
  pendingCount,
  processingCount,
  failedCount,
  recommendation,
  isLoading = false,
}: SampleStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Calculate DNA Strength based on samples and quality
  const getDNAStrength = () => {
    if (totalSamples === 0) return 0;
    if (totalSamples < 3) return Math.min(30, totalSamples * 10);
    if (averageQuality !== null) {
      return Math.min(100, Math.round(averageQuality * 0.6 + totalSamples * 2));
    }
    return Math.min(60, totalSamples * 5);
  };

  const dnaStrength = getDNAStrength();

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'var(--approve)';
    if (strength >= 60) return 'var(--edit)';
    if (strength >= 40) return 'var(--warning)';
    return 'var(--text-muted)';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return 'Strong';
    if (strength >= 60) return 'Good';
    if (strength >= 40) return 'Developing';
    return 'Getting Started';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-lg p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="h-8 rounded w-1/2 mb-2" style={{ backgroundColor: 'var(--bg-elevated)' }} />
            <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--bg-elevated)' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* DNA Strength */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-3xl font-bold" style={{ color: getStrengthColor(dnaStrength) }}>
              {dnaStrength}%
            </p>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: getStrengthColor(dnaStrength), opacity: 0.2 }}>
              <svg className="w-4 h-4" style={{ color: getStrengthColor(dnaStrength) }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            DNA Strength: {getStrengthLabel(dnaStrength)}
          </p>
        </div>

        {/* Total Samples */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {totalSamples}
            </p>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Training Samples
          </p>
        </div>

        {/* Total Words */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatNumber(totalWords)}
            </p>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Total Words
          </p>
        </div>

        {/* Average Quality */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-3xl font-bold" style={{ color: averageQuality !== null ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {averageQuality !== null ? `${Math.round(averageQuality)}%` : '—'}
            </p>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Avg Quality Score
          </p>
        </div>
      </div>

      {/* Processing Status */}
      {(pendingCount > 0 || processingCount > 0 || failedCount > 0) && (
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          {processingCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--edit)' }} />
              {processingCount} processing
            </span>
          )}
          {pendingCount > 0 && (
            <span>{pendingCount} pending</span>
          )}
          {failedCount > 0 && (
            <span style={{ color: 'var(--kill)' }}>{failedCount} failed</span>
          )}
        </div>
      )}

      {/* Recommendation */}
      <div className="flex items-start gap-3 rounded-lg px-4 py-3"
        style={{ backgroundColor: 'var(--bg-surface)' }}>
        <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--edit)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {recommendation}
        </p>
      </div>
    </div>
  );
}
