/**
 * Story 4.1: Generation Progress Display
 * Shows progress of spoke generation
 */

import type { SpokeGenerationProgress } from '../../../worker/types';

export interface GenerationProgressProps {
  progress: SpokeGenerationProgress | null;
  onComplete?: () => void;
}

export function GenerationProgress({ progress, onComplete }: GenerationProgressProps) {
  if (!progress) return null;

  const progressPercent = progress.total_spokes > 0
    ? Math.round((progress.completed_spokes / progress.total_spokes) * 100)
    : 0;

  return (
    <div
      className="p-4 rounded-lg space-y-3"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-[var(--text-primary)]">
          {progress.status === 'completed' ? 'Generation Complete' : 'Generating Spokes...'}
        </h3>
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {progressPercent}%
        </span>
      </div>

      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: 'var(--approve)',
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>
          {progress.completed_spokes} / {progress.total_spokes} spokes
        </span>
        <span>
          {progress.completed_pillars} / {progress.total_pillars} pillars
        </span>
      </div>
    </div>
  );
}
