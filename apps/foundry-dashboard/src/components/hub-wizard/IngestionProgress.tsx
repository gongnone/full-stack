/**
 * Story 3.5: Real-Time Ingestion Progress
 * Unified progress component with enhanced animations
 */

import { useEffect, useState, useRef } from 'react';
import { trpc } from '@/lib/trpc-client';
import type { Pillar } from './ExtractionProgress';

interface IngestionProgressProps {
  sourceId: string;
  clientId: string;
  onComplete?: (pillars: Pillar[]) => void;
  onError?: (error: string) => void;
}

const STAGES = [
  { key: 'parsing', label: 'Parsing', description: 'Reading document...', weight: 10 },
  { key: 'themes', label: 'Themes', description: 'Identifying themes...', weight: 30 },
  { key: 'claims', label: 'Claims', description: 'Extracting claims...', weight: 30 },
  { key: 'pillars', label: 'Pillars', description: 'Generating pillars...', weight: 30 },
] as const;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IngestionProgress({ sourceId, clientId, onComplete, onError }: IngestionProgressProps) {
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const prevStageRef = useRef<string | null>(null);

  // Poll extraction progress every 2 seconds
  const { data: progress, isLoading } = trpc.hubs.getExtractionProgress.useQuery(
    { sourceId, clientId },
    {
      refetchInterval: (query) => {
        const data = query.state.data;
        if (data?.status === 'completed' || data?.status === 'failed') {
          return false;
        }
        return 2000;
      },
      enabled: !!sourceId,
    }
  );

  // Fetch pillars when extraction completes
  const { data: pillars } = trpc.hubs.getPillars.useQuery(
    { sourceId, clientId },
    {
      enabled: progress?.status === 'completed',
    }
  );

  // Track completed stages for animations
  useEffect(() => {
    if (progress?.currentStage && progress.currentStage !== prevStageRef.current) {
      const currentIndex = STAGES.findIndex(s => s.key === progress.currentStage);

      // Mark all previous stages as completed
      const newCompleted = new Set(completedStages);
      for (let i = 0; i < currentIndex; i++) {
        const stage = STAGES[i];
        if (stage) newCompleted.add(stage.key);
      }
      setCompletedStages(newCompleted);
      prevStageRef.current = progress.currentStage;
    }

    // Mark all stages complete when done
    if (progress?.status === 'completed') {
      setCompletedStages(new Set(STAGES.map(s => s.key)));
    }
  }, [progress?.currentStage, progress?.status, completedStages]);

  // Trigger callbacks
  useEffect(() => {
    if (progress?.status === 'completed' && pillars && pillars.length > 0 && onComplete) {
      onComplete(pillars);
    }
    if (progress?.status === 'failed' && progress.error && onError) {
      onError(progress.error);
    }
  }, [progress?.status, pillars, progress?.error, onComplete, onError]);

  // Loading state
  if (isLoading || !progress) {
    return (
      <div className="flex flex-col items-center justify-center p-8" data-testid="ingestion-progress">
        <div
          className="w-16 h-16 rounded-full border-4 animate-spin"
          style={{
            borderColor: 'var(--bg-elevated)',
            borderTopColor: 'var(--edit)',
          }}
        />
        <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Initializing extraction...
        </p>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex(s => s.key === progress.currentStage);
  const isComplete = progress.status === 'completed';
  const isFailed = progress.status === 'failed';

  // Calculate weighted progress
  const calculateWeightedProgress = () => {
    if (isComplete) return 100;
    if (currentStageIndex < 0) return 0;

    let totalProgress = 0;
    for (let i = 0; i < currentStageIndex; i++) {
      const stage = STAGES[i];
      if (stage) totalProgress += stage.weight;
    }

    // Add partial progress for current stage based on overall progress
    const currentStage = STAGES[currentStageIndex];
    if (currentStage) {
      const stageProgress = progress.progress % 25;
      const currentStageContribution = (stageProgress / 25) * currentStage.weight;
      totalProgress += currentStageContribution;
    }

    return Math.min(100, Math.round(totalProgress));
  };

  const weightedProgress = calculateWeightedProgress();

  return (
    <div className="p-6 space-y-8" data-testid="ingestion-progress">
      {/* Header with overall progress */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {isComplete ? 'Extraction Complete!' : isFailed ? 'Extraction Failed' : 'Extracting Content Pillars'}
        </h3>
        <p
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {isComplete
            ? `${pillars?.length || 0} pillars generated successfully`
            : isFailed
              ? progress.error
              : progress.stageMessage || STAGES[currentStageIndex]?.description
          }
        </p>
      </div>

      {/* Main progress bar */}
      <div className="space-y-2">
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
          role="progressbar"
          aria-valuenow={weightedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Content extraction progress"
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${weightedProgress}%`,
              backgroundColor: isFailed ? 'var(--kill)' : isComplete ? 'var(--approve)' : 'var(--edit)',
            }}
            data-testid="progress-bar"
          />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{weightedProgress}% complete</span>
          <span aria-live="polite">
            {isComplete ? 'Done' : isFailed ? 'Error' : 'Processing...'}
          </span>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex justify-between items-start">
        {STAGES.map((stage, index) => {
          const isCurrentStage = index === currentStageIndex && !isComplete;
          const isStageComplete = completedStages.has(stage.key) || isComplete;
          const isPending = index > currentStageIndex && !isComplete;

          return (
            <div
              key={stage.key}
              className="flex flex-col items-center space-y-3 flex-1"
              data-testid={`stage-${stage.key}`}
            >
              {/* Stage circle */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-all duration-300
                  ${isCurrentStage ? 'animate-stage-pulse' : ''}
                  ${isStageComplete ? 'animate-stage-complete' : ''}
                `}
                style={{
                  backgroundColor: isStageComplete
                    ? 'var(--approve)'
                    : isCurrentStage
                      ? 'var(--edit)'
                      : 'var(--bg-elevated)',
                  color: isStageComplete || isCurrentStage
                    ? 'var(--bg-base)'
                    : 'var(--text-muted)',
                }}
              >
                {isStageComplete ? (
                  <CheckIcon className="w-6 h-6" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Stage label */}
              <div className="text-center">
                <p
                  className="text-sm font-medium"
                  style={{
                    color: isCurrentStage || isStageComplete
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                  }}
                >
                  {stage.label}
                </p>
                {isCurrentStage && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--edit)' }}>
                    In progress...
                  </p>
                )}
              </div>

              {/* Connector line (not on last item) */}
              {index < STAGES.length - 1 && (
                <div
                  className="absolute h-0.5 w-full top-6 left-1/2 -z-10"
                  style={{
                    backgroundColor: isStageComplete ? 'var(--approve)' : 'var(--bg-elevated)',
                    transform: 'translateX(50%)',
                    width: 'calc(100% - 3rem)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Pillar count indicator */}
      {!isFailed && (
        <div
          className="flex items-center justify-center space-x-3 py-4 rounded-lg"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <span
              className="text-lg font-bold animate-counter-pop"
              style={{ color: 'var(--edit)' }}
              key={pillars?.length || 0}
            >
              {pillars?.length || 0}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Pillars Discovered
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {isComplete ? 'Ready for configuration' : 'Analyzing content...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
