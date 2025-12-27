/**
 * Story 3-2: Thematic Extraction Engine
 * Component for displaying extracted themes and progress from content analysis
 * Wraps the extraction progress and pillar discovery for hub creation flow
 */

import { useCallback } from 'react';
import {
  IngestionProgress,
  PillarDiscoveryList,
  IngestionError,
  type Pillar,
} from '@/components/hub-wizard';
import { trpc } from '@/lib/trpc-client';

interface ThemeExtractorProps {
  sourceId: string;
  clientId: string;
  onComplete?: (pillars: Pillar[]) => void;
  onError?: (error: string) => void;
  showDiscoveryList?: boolean;
}

/**
 * ThemeExtractor - Displays real-time thematic extraction from content sources
 *
 * Features:
 * - 4-stage extraction process visualization (parsing, themes, claims, pillars)
 * - Real-time progress tracking with weighted completion
 * - Live pillar discovery list showing extracted content pillars
 * - Error handling with retry capability
 * - Automatic polling for extraction progress
 *
 * Extraction Stages:
 * 1. Parsing: Reading and parsing document content
 * 2. Themes: Identifying core themes and topics
 * 3. Claims: Extracting key claims and assertions
 * 4. Pillars: Generating content pillars with psychological angles
 *
 * @param sourceId - ID of the source being extracted
 * @param clientId - ID of the client/tenant
 * @param onComplete - Callback when extraction completes with extracted pillars
 * @param onError - Callback when extraction fails with error message
 * @param showDiscoveryList - Whether to show the live pillar discovery sidebar (default: true)
 */
export function ThemeExtractor({
  sourceId,
  clientId,
  onComplete,
  onError,
  showDiscoveryList = true,
}: ThemeExtractorProps) {
  // Poll for pillars during extraction
  const { data: pillars, isLoading } = trpc.hubs.getPillars.useQuery(
    { sourceId, clientId },
    {
      enabled: !!sourceId && !!clientId,
      refetchInterval: 2000, // Poll every 2 seconds
    }
  );

  // Retry mutation
  const retryMutation = trpc.hubs.retryExtraction.useMutation();

  const handleRetry = useCallback(() => {
    retryMutation.mutate(
      { sourceId, clientId },
      {
        onSuccess: (result) => {
          if (result.success && result.pillars) {
            onComplete?.(result.pillars);
          } else if (result.error) {
            onError?.(result.error);
          }
        },
        onError: (error) => {
          onError?.(error.message);
        },
      }
    );
  }, [sourceId, clientId, retryMutation, onComplete, onError]);

  const handleComplete = useCallback((completedPillars: Pillar[]) => {
    onComplete?.(completedPillars);
  }, [onComplete]);

  const handleError = useCallback((error: string) => {
    onError?.(error);
  }, [onError]);

  return (
    <div className="space-y-6" data-testid="theme-extractor">
      {/* Main Content: Progress or Error */}
      <div className={showDiscoveryList ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>
        {/* Extraction Progress */}
        <div>
          <IngestionProgress
            sourceId={sourceId}
            clientId={clientId}
            onComplete={handleComplete}
            onError={handleError}
          />
        </div>

        {/* Real-time Pillar Discovery List */}
        {showDiscoveryList && (
          <div>
            <PillarDiscoveryList
              pillars={pillars || []}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Note: Error state is handled internally by IngestionProgress */}
      {/* If you need a custom error UI, use IngestionError component separately */}
    </div>
  );
}

/**
 * ThemeExtractorWithError - Variant that includes error state handling
 *
 * Use this when you need more control over the error display
 */
interface ThemeExtractorWithErrorProps extends ThemeExtractorProps {
  error: string | null;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ThemeExtractorWithError({
  sourceId,
  clientId,
  error,
  onRetry,
  isRetrying = false,
  onComplete,
  showDiscoveryList = true,
}: ThemeExtractorWithErrorProps) {
  const { data: pillars } = trpc.hubs.getPillars.useQuery(
    { sourceId, clientId },
    { enabled: !!sourceId && !!clientId }
  );

  if (error) {
    return (
      <IngestionError
        error={error}
        pillarsPreserved={pillars || undefined}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  return (
    <ThemeExtractor
      sourceId={sourceId}
      clientId={clientId}
      onComplete={onComplete}
      showDiscoveryList={showDiscoveryList}
    />
  );
}
