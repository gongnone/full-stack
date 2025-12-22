/**
 * Story 3.2: Thematic Extraction Engine
 * Progress UI component showing 4-stage extraction process
 */

import { useEffect } from 'react';
import { trpc } from '@/lib/trpc-client';

// Psychological angle enum type
export type PsychologicalAngle = 'Contrarian' | 'Authority' | 'Urgency' | 'Aspiration' | 'Fear' | 'Curiosity' | 'Transformation' | 'Rebellion';

// Pillar type definition (matches worker/types.ts)
export interface Pillar {
  id: string;
  title: string;
  coreClaim: string;
  psychologicalAngle: PsychologicalAngle;
  estimatedSpokeCount: number;
  supportingPoints: string[];
}

interface ExtractionProgressProps {
  sourceId: string;
  clientId: string;
  onComplete?: (pillars: Pillar[]) => void;
  onRetry?: () => void;
}

const STAGES = [
  { key: 'parsing', label: 'Parsing document...', progress: 0 },
  { key: 'themes', label: 'Identifying themes...', progress: 25 },
  { key: 'claims', label: 'Extracting claims...', progress: 50 },
  { key: 'pillars', label: 'Generating pillars...', progress: 75 },
] as const;

export function ExtractionProgress({ sourceId, clientId, onComplete, onRetry }: ExtractionProgressProps) {
  // Poll extraction progress every 2 seconds
  const { data: progress, isLoading } = trpc.hubs.getExtractionProgress.useQuery(
    { sourceId, clientId },
    {
      refetchInterval: (query) => {
        const data = query.state.data;
        // Stop polling when completed or failed
        if (data?.status === 'completed' || data?.status === 'failed') {
          return false;
        }
        return 2000; // Poll every 2 seconds
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

  // Call onComplete with actual pillars when available
  useEffect(() => {
    if (progress?.status === 'completed' && pillars && pillars.length > 0 && onComplete) {
      onComplete(pillars);
    }
  }, [progress?.status, pillars, onComplete]);

  if (isLoading || !progress) {
    return (
      <div className="flex flex-col items-center justify-center p-8" data-testid="extraction-progress">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{
            borderColor: 'var(--bg-elevated)',
            borderTopColor: 'var(--edit)',
          }}
        />
        <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Starting extraction...
        </p>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === progress.currentStage);

  return (
    <div className="p-6 space-y-6" data-testid="extraction-progress">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Extracting Content Pillars
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {progress.stageMessage}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <div
            className="h-full transition-all duration-300 ease-in-out"
            style={{
              width: `${progress.progress}%`,
              backgroundColor: progress.status === 'failed' ? 'var(--kill)' : 'var(--edit)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {progress.progress}%
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {progress.status === 'completed' ? 'Complete' : 'Processing...'}
          </span>
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="grid grid-cols-4 gap-4">
        {STAGES.map((stage, index) => {
          const isActive = index === currentStageIndex;
          const isComplete = index < currentStageIndex || progress.status === 'completed';

          return (
            <div key={stage.key} className="flex flex-col items-center space-y-2">
              {/* Stage Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  isActive ? 'animate-pulse' : ''
                }`}
                style={{
                  backgroundColor: isComplete || isActive ? 'var(--edit)' : 'var(--bg-elevated)',
                  color: isComplete || isActive ? 'var(--bg-default)' : 'var(--text-muted)',
                }}
              >
                {isComplete ? '✓' : index + 1}
              </div>

              {/* Stage Label */}
              <p
                className="text-xs text-center"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {progress.status === 'failed' && progress.error && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: 'rgba(244, 33, 46, 0.1)',
            borderColor: 'var(--kill)',
          }}
          data-testid="extraction-error"
        >
          <p className="text-sm font-medium" style={{ color: 'var(--kill)' }}>
            Extraction Failed
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {progress.error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 text-sm font-medium rounded-md transition-colors"
              style={{
                backgroundColor: 'var(--edit)',
                color: 'var(--bg-default)',
              }}
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Success Message */}
      {progress.status === 'completed' && (
        <div
          className="p-4 rounded-lg border text-center"
          style={{
            backgroundColor: 'rgba(0, 210, 106, 0.1)',
            borderColor: 'var(--approve)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--approve)' }}>
            Extraction Complete!
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {pillars?.length || 0} content pillars generated successfully
          </p>
        </div>
      )}
    </div>
  );
}
