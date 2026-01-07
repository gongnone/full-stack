/**
 * Story R-12: Brand DNA Tooltip Clarity
 * Task 2: MetricTooltip Component
 *
 * Info icon tooltip explaining individual voice metric scores.
 * Follows GateBadge tooltip pattern (300ms delay, custom hover state).
 */

import * as React from 'react';

// Constants inline per project pattern (NOT separate constants.ts)
const METRIC_TOOLTIPS = {
  tone_match: {
    label: 'Tone Match',
    explanation: 'How consistently AI will match your brand\'s emotional tone',
    improvement: 'Record voice notes to capture your natural speaking style',
  },
  vocabulary: {
    label: 'Vocabulary',
    explanation: 'Recognition of signature phrases and industry terminology',
    improvement: 'Add more written samples with your unique phrases',
  },
  structure: {
    label: 'Structure',
    explanation: 'Understanding of preferred content formats and flow',
    improvement: 'Upload diverse content types (blogs, emails, social)',
  },
  topics: {
    label: 'Topics',
    explanation: 'Awareness of subjects to emphasize or avoid',
    improvement: 'Edit banned words list to refine topic awareness',
  },
} as const;

export type MetricKey = keyof typeof METRIC_TOOLTIPS;

interface MetricTooltipProps {
  metricKey: MetricKey;
}

export function MetricTooltip({ metricKey }: MetricTooltipProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipTimeout, setTooltipTimeout] = React.useState<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = React.useId();
  const containerRef = React.useRef<HTMLSpanElement>(null);

  const metric = METRIC_TOOLTIPS[metricKey];

  // Close tooltip when clicking outside (mobile UX)
  React.useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => setShowTooltip(true), 300);
    setTooltipTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    setShowTooltip(false);
  };

  const handleClick = () => {
    // Mobile tap-to-reveal behavior
    // Clear pending hover timeout to prevent race condition
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    setShowTooltip((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Clear pending hover timeout to prevent race condition
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      setShowTooltip((prev) => !prev);
    }
    if (e.key === 'Escape') {
      // Clear pending hover timeout to prevent race condition
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      setShowTooltip(false);
    }
  };

  return (
    <span ref={containerRef} className="relative inline-flex items-center ml-1">
      {/* Info icon trigger */}
      <span
        role="button"
        tabIndex={0}
        aria-label={`Learn about ${metric.label}`}
        aria-describedby={showTooltip ? tooltipId : undefined}
        data-testid={`metric-info-${metricKey}`}
        className="cursor-help inline-flex items-center justify-center w-3.5 h-3.5 rounded-full transition-colors"
        style={{
          color: 'var(--text-muted)',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </span>

      {/* Tooltip - follows GateBadge pattern */}
      {showTooltip && (
        <div
          id={tooltipId}
          role="tooltip"
          aria-live="polite"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg shadow-xl min-w-[220px] max-w-[calc(100vw-2rem)] animate-fadeIn"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Header */}
          <div
            className="text-xs font-bold border-b pb-1.5 mb-2"
            style={{
              color: 'var(--text-primary)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {metric.label}
          </div>

          {/* Explanation */}
          <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
            {metric.explanation}
          </p>

          {/* Improvement suggestion */}
          <div
            className="border-t pt-2 text-xs"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <span style={{ color: 'var(--text-muted)' }}>💡 Tip: </span>
            <span style={{ color: 'var(--text-secondary)' }}>{metric.improvement}</span>
          </div>

          {/* Tooltip arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid var(--border-subtle)',
            }}
          />
        </div>
      )}
    </span>
  );
}
