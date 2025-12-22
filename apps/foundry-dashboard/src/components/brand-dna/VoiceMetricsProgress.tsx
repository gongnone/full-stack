/**
 * Story 2.3: Brand DNA Analysis & Scoring
 * Task 8: VoiceMetrics Progress Bars Component (AC2)
 *
 * Displays individual score breakdown with animated progress bars.
 * Color-coded: green (>80%), yellow (60-80%), red (<60%)
 */

import type { BrandDNABreakdown } from '@/../../worker/types';

interface ProgressBarProps {
  label: string;
  value: number;
  testId?: string;
}

function ProgressBar({ label, value, testId }: ProgressBarProps) {
  const color =
    value >= 80 ? 'var(--approve)' : value >= 60 ? 'var(--warning)' : 'var(--kill)';

  return (
    <div className="mb-4" data-testid={testId}>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
          {value}%
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-hover)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

interface VoiceMetricsProgressProps {
  breakdown: BrandDNABreakdown;
  className?: string;
}

export function VoiceMetricsProgress({ breakdown, className = '' }: VoiceMetricsProgressProps) {
  return (
    <div className={className}>
      <h3
        className="text-sm font-medium mb-4"
        style={{ color: 'var(--text-secondary)' }}
      >
        Voice Metrics Breakdown
      </h3>
      <ProgressBar
        label="Tone Match"
        value={breakdown.tone_match}
        testId="progress-tone-match"
      />
      <ProgressBar
        label="Vocabulary"
        value={breakdown.vocabulary}
        testId="progress-vocabulary"
      />
      <ProgressBar
        label="Structure"
        value={breakdown.structure}
        testId="progress-structure"
      />
      <ProgressBar
        label="Topics"
        value={breakdown.topics}
        testId="progress-topics"
      />
    </div>
  );
}
