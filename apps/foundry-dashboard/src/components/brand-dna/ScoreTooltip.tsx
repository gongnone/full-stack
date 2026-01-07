/**
 * Story R-12: Brand DNA Tooltip Clarity
 * Task 1: ScoreTooltip Component
 *
 * Info icon tooltip explaining DNA Strength score impact on content quality.
 * Follows GateBadge tooltip pattern (300ms delay, custom hover state).
 */

import * as React from 'react';

// Constants inline per project pattern (NOT separate constants.ts)
const BRAND_VOICE_IMPACT = {
  tiers: [
    {
      range: [0, 49] as const,
      label: 'Needs Training',
      editingPercent: '~70%+',
      message: 'AI-generated content will need significant editing. Add training samples to establish your brand voice.',
    },
    {
      range: [50, 79] as const,
      label: 'Good',
      editingPercent: '~40%',
      message: 'AI content will need moderate editing. You\'re getting there!',
    },
    {
      range: [80, 100] as const,
      label: 'Strong',
      editingPercent: '~20% or less',
      message: 'AI reliably produces on-brand content. Expect minimal editing.',
    },
  ],
  improvements: [
    { icon: '🎤', label: 'Record voice note', gain: '+15-20%' },
    { icon: '📄', label: 'Add more samples', gain: '+10-15%' },
    { icon: '✏️', label: 'Edit voice markers', gain: '+5-10%' },
  ],
  target: 80,
};

interface ScoreTooltipProps {
  score: number;
}

type Tier = (typeof BRAND_VOICE_IMPACT.tiers)[number];

function getTierForScore(score: number): Tier {
  const tier = BRAND_VOICE_IMPACT.tiers.find(
    (t) => score >= t.range[0] && score <= t.range[1]
  );
  // Guaranteed to find a tier since tiers cover 0-100, fallback to first tier
  return tier ?? (BRAND_VOICE_IMPACT.tiers[0] as Tier);
}

export function ScoreTooltip({ score }: ScoreTooltipProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipTimeout, setTooltipTimeout] = React.useState<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = React.useId();
  const containerRef = React.useRef<HTMLSpanElement>(null);

  const tier = getTierForScore(score);

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
        aria-label="Learn about DNA Strength"
        aria-describedby={showTooltip ? tooltipId : undefined}
        data-testid="score-info-icon"
        className="cursor-help inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] transition-colors"
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
          width="14"
          height="14"
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
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg shadow-xl min-w-[280px] max-w-[calc(100vw-2rem)] animate-fadeIn"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Header */}
          <div
            className="text-xs font-bold border-b pb-2 mb-2"
            style={{
              color: 'var(--text-primary)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            DNA Strength Impact
          </div>

          {/* Current tier message */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Current Level:
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {tier.label}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {tier.message}
            </p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Editing needed:
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                {tier.editingPercent} of outputs
              </span>
            </div>
          </div>

          {/* Improvement actions */}
          <div
            className="border-t pt-2 mb-2"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              How to Improve:
            </div>
            <div className="space-y-1">
              {BRAND_VOICE_IMPACT.improvements.map((item) => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item.icon} {item.label}
                  </span>
                  <span className="font-mono" style={{ color: 'var(--approve)' }}>
                    {item.gain}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Target */}
          <div
            className="border-t pt-2 text-xs text-center"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              🎯 Target: {BRAND_VOICE_IMPACT.target}%+ for zero-edit content
            </span>
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
