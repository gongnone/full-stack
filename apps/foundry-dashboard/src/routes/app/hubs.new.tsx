/**
 * Story 3-1: Source Selection & Upload Wizard
 * Story 3-2: Thematic Extraction Engine (Step 3 integration)
 * Story 3-3: Interactive Pillar Configuration
 * Story 3-5: Real-Time Ingestion Progress
 * 4-step Hub creation wizard
 */

import { useState, useCallback } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import {
  WizardStepper,
  StepSelectClient,
  StepUploadSource,
  EditablePillarCard,
  UndoToast,
  // Story 3.5: Enhanced progress components
  IngestionProgress,
  PillarDiscoveryList,
  IngestionError,
  IngestionSuccess,
} from '@/components/hub-wizard';
import type { Step, Pillar, PsychologicalAngle } from '@/components/hub-wizard';
import { trpc } from '@/lib/trpc-client';
import { WIZARD_CONFIG, POLLING_CONFIG } from '@/lib/constants';

// Types for tRPC mutation results
interface RetryExtractionResult {
  success: boolean;
  pillars?: Pillar[];
  error?: string;
}

export const Route = createFileRoute('/app/hubs/new')({
  component: NewHubWizard,
});

const WIZARD_STEPS: Step[] = [
  { number: 1, label: 'Select Client' },
  { number: 2, label: 'Upload Source' },
  { number: 3, label: 'Configure Pillars' },
  { number: 4, label: 'Generate' },
];

// Source types that support extraction in MVP
const SUPPORTED_SOURCE_TYPES = ['text'] as const;
type SourceType = 'pdf' | 'text' | 'url';

function ArrowLeftIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function WarningIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function NewHubWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType | null>(null);
  const [extractedPillars, setExtractedPillars] = useState<Pillar[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Story 3-3: Pillar editing state
  const [deletingPillarId, setDeletingPillarId] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<{ pillar: Pillar; index: number } | null>(null);
  const [pillarUpdateError, setPillarUpdateError] = useState<string | null>(null);

  // Story 3-5: Extraction error state
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hubCreated, setHubCreated] = useState(false);

  // tRPC mutation for starting extraction
  const extractMutation = trpc.hubs.extract.useMutation();

  // Story 3-5: Retry extraction mutation
  const retryMutation = trpc.hubs.retryExtraction.useMutation();

  // Story 3-5: Polling for pillars during extraction (with smart auto-stop)
  const { data: polledPillars } = trpc.hubs.getPillars.useQuery(
    { sourceId: selectedSourceId!, clientId: selectedClientId! },
    {
      enabled: isExtracting && !!selectedSourceId && !!selectedClientId,
      refetchInterval: () => {
        // Auto-stop polling when extraction completes
        if (!isExtracting) return false;
        return POLLING_CONFIG.DEFAULT_INTERVAL_MS;
      },
    }
  );

  // Story 3-3: tRPC mutations for pillar management
  const updatePillarMutation = trpc.hubs.updatePillar.useMutation();
  const deletePillarMutation = trpc.hubs.deletePillar.useMutation();
  const restorePillarMutation = trpc.hubs.restorePillar.useMutation();

  // Story 3-4: Hub finalization
  const finalizeMutation = trpc.hubs.finalize.useMutation();
  const [hubTitle, setHubTitle] = useState('');

  const handleClientSelect = useCallback((clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentStep(2);
  }, []);

  const handleSourceSelect = useCallback((sourceId: string, sourceType: SourceType) => {
    setSelectedSourceId(sourceId);
    setSelectedSourceType(sourceType);
    setCurrentStep(3);

    // Auto-start extraction for supported source types
    if (SUPPORTED_SOURCE_TYPES.includes(sourceType as typeof SUPPORTED_SOURCE_TYPES[number]) && selectedClientId) {
      setIsExtracting(true);
      // Actually trigger the extraction workflow
      extractMutation.mutate(
        { sourceId, clientId: selectedClientId },
        {
          onError: (error) => {
            setIsExtracting(false);
            setExtractionError(error.message || 'Failed to start extraction');
          },
        }
      );
    }
  }, [selectedClientId, extractMutation]);

  const handleExtractionComplete = useCallback((pillars: Pillar[]) => {
    setExtractedPillars(pillars);
    setIsExtracting(false);
    setExtractionError(null);
  }, []);

  // Story 3-5: Handle extraction error
  const handleExtractionError = useCallback((error: string) => {
    setExtractionError(error);
    setIsExtracting(false);
  }, []);

  // Story 3-5: Handle retry extraction
  const handleRetryExtraction = useCallback(() => {
    if (!selectedSourceId || !selectedClientId) return;

    setIsRetrying(true);
    setExtractionError(null);

    retryMutation.mutate(
      { sourceId: selectedSourceId, clientId: selectedClientId },
      {
        onSuccess: (result: RetryExtractionResult) => {
          setIsRetrying(false);
          if (result.success && result.pillars) {
            setExtractedPillars(result.pillars);
            setIsExtracting(false);
          } else {
            setExtractionError(result.error || 'Retry failed');
            setIsExtracting(true); // Keep showing progress for polling
          }
        },
        onError: (error) => {
          setIsRetrying(false);
          setExtractionError(error.message);
        },
      }
    );
  }, [selectedSourceId, selectedClientId, retryMutation]);

  const handleStartExtraction = useCallback(() => {
    if (!selectedSourceId || !selectedClientId) return;
    setIsExtracting(true);
    setExtractionError(null); // Clear previous errors
    extractMutation.mutate(
      { sourceId: selectedSourceId, clientId: selectedClientId },
      {
        onError: (error) => {
          setIsExtracting(false);
          setExtractionError(error.message || 'Failed to start extraction');
        },
      }
    );
  }, [selectedSourceId, selectedClientId, extractMutation]);

  const handleStepClick = useCallback((step: number) => {
    // Only allow going back to completed steps
    if (step < currentStep) {
      setCurrentStep(step);
    }
  }, [currentStep]);

  // Story 3-3: Handle pillar updates (optimistic UI with error feedback)
  const handlePillarUpdate = useCallback((pillarId: string, updates: { title?: string; coreClaim?: string; psychologicalAngle?: PsychologicalAngle }) => {
    if (!selectedClientId) return;

    // Store original state for rollback
    const originalPillars = extractedPillars;

    // Clear any previous error
    setPillarUpdateError(null);

    // Optimistic update
    setExtractedPillars(prev => prev.map(p =>
      p.id === pillarId ? { ...p, ...updates } : p
    ));

    // Fire mutation
    updatePillarMutation.mutate({
      pillarId,
      clientId: selectedClientId,
      ...updates,
    }, {
      onError: (error) => {
        // Rollback on error
        setExtractedPillars(originalPillars);
        // Show error feedback
        setPillarUpdateError(`Failed to save changes: ${error.message}`);
        // Auto-dismiss error
        setTimeout(() => setPillarUpdateError(null), WIZARD_CONFIG.ERROR_TOAST_DURATION_MS);
      },
    });
  }, [selectedClientId, updatePillarMutation, extractedPillars]);

  // Story 3-3: Handle pillar deletion with undo and error handling
  const handlePillarDelete = useCallback((pillarId: string) => {
    if (!selectedClientId || !selectedSourceId) return;
    // Prevent double-delete while animation is running
    if (deletingPillarId) return;

    // Find pillar and its index for undo
    const pillarIndex = extractedPillars.findIndex(p => p.id === pillarId);
    const pillar = extractedPillars[pillarIndex];
    if (!pillar) return;

    // Start fade animation
    setDeletingPillarId(pillarId);

    // After animation, remove from list and show undo toast
    setTimeout(() => {
      setExtractedPillars(prev => prev.filter(p => p.id !== pillarId));
      setDeletingPillarId(null);
      setUndoState({ pillar, index: pillarIndex });

      // Fire deletion mutation with error handling
      deletePillarMutation.mutate({
        pillarId,
        sourceId: selectedSourceId,
        clientId: selectedClientId,
      }, {
        onError: (error) => {
          // Show error - user can use undo to restore if within window
          setPillarUpdateError(`Failed to delete pillar: ${error.message}`);
          setTimeout(() => setPillarUpdateError(null), WIZARD_CONFIG.ERROR_TOAST_DURATION_MS);
        },
      });
    }, WIZARD_CONFIG.ANIMATION_DELAY_MS);
  }, [selectedClientId, selectedSourceId, extractedPillars, deletePillarMutation, deletingPillarId]);

  // Story 3-3: Handle undo
  const handleUndo = useCallback(() => {
    if (!undoState || !selectedClientId || !selectedSourceId) return;

    const { pillar, index } = undoState;

    // Restore to local state
    setExtractedPillars(prev => {
      const newPillars = [...prev];
      newPillars.splice(index, 0, pillar);
      return newPillars;
    });

    // Restore in database
    restorePillarMutation.mutate({
      sourceId: selectedSourceId,
      clientId: selectedClientId,
      pillar,
    });

    setUndoState(null);
  }, [undoState, selectedClientId, selectedSourceId, restorePillarMutation]);

  // Story 3-3: Handle continue to generate
  const handleContinueToGenerate = useCallback(() => {
    if (extractedPillars.length >= WIZARD_CONFIG.MIN_PILLARS) {
      setCurrentStep(4);
    }
  }, [extractedPillars.length]);

  // Story 3-4: Handle Hub finalization
  const [createdHubId, setCreatedHubId] = useState<string | null>(null);

  const handleFinalizeHub = useCallback(() => {
    if (!selectedSourceId || !selectedClientId) return;

    finalizeMutation.mutate({
      sourceId: selectedSourceId,
      clientId: selectedClientId,
      title: hubTitle.trim() || undefined,
    }, {
      onSuccess: (result) => {
        setHubCreated(true);
        setCreatedHubId(result.hubId);
      },
    });
  }, [selectedSourceId, selectedClientId, hubTitle, finalizeMutation]);

  // Story 3-5: Navigation handlers for success state
  const handleViewHub = useCallback(() => {
    if (createdHubId) {
      navigate({ to: '/app/hubs/$hubId', params: { hubId: createdHubId } });
    }
  }, [createdHubId, navigate]);

  const handleStartGeneration = useCallback(() => {
    // Placeholder for Epic 4 - navigate to generation page
    if (createdHubId) {
      navigate({ to: '/app/hubs/$hubId', params: { hubId: createdHubId } });
    }
  }, [createdHubId, navigate]);

  const handleCancel = useCallback(() => {
    navigate({ to: '/app/hubs' });
  }, [navigate]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/app/hubs"
          className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <ArrowLeftIcon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Create New Hub
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Transform your content into a structured Hub with pillars and spokes
          </p>
        </div>
      </div>

      {/* Stepper */}
      <WizardStepper
        currentStep={currentStep}
        steps={WIZARD_STEPS}
        onStepClick={handleStepClick}
      />

      {/* Step content */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {currentStep === 1 && (
          <StepSelectClient
            selectedClientId={selectedClientId}
            onSelect={handleClientSelect}
          />
        )}

        {currentStep === 2 && selectedClientId && (
          <StepUploadSource
            clientId={selectedClientId}
            onSourceSelected={handleSourceSelect}
          />
        )}

        {currentStep === 3 && selectedClientId && selectedSourceId && (
          <div className="space-y-6">
            {/* Unsupported source type warning */}
            {selectedSourceType && !SUPPORTED_SOURCE_TYPES.includes(selectedSourceType as typeof SUPPORTED_SOURCE_TYPES[number]) && (
              <div
                className="p-4 rounded-lg border flex items-start gap-3"
                style={{
                  backgroundColor: 'rgba(255, 173, 31, 0.1)',
                  borderColor: 'var(--warning)',
                }}
              >
                <WarningIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--warning)' }}>
                    {selectedSourceType === 'pdf' ? 'PDF' : 'URL'} extraction not available in MVP
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Text sources are currently supported. Please go back and paste your content as text instead.
                  </p>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="mt-3 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Go Back to Upload
                  </button>
                </div>
              </div>
            )}

            {/* Story 3.5: Enhanced extraction progress with real-time pillar discovery */}
            {isExtracting && selectedSourceType === 'text' && !extractionError && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unified progress indicator */}
                <IngestionProgress
                  sourceId={selectedSourceId}
                  clientId={selectedClientId}
                  onComplete={handleExtractionComplete}
                  onError={handleExtractionError}
                />

                {/* Real-time pillar discovery list */}
                <PillarDiscoveryList
                  pillars={polledPillars || []}
                  isLoading={isExtracting}
                />
              </div>
            )}

            {/* Story 3.5: Error state with retry */}
            {extractionError && (
              <IngestionError
                error={extractionError}
                pillarsPreserved={polledPillars}
                onRetry={handleRetryExtraction}
                isRetrying={isRetrying}
              />
            )}

            {/* Editable pillar cards (Story 3-3) */}
            {!isExtracting && extractedPillars.length > 0 && (
              <div className="space-y-4">
                {/* Header with pillar count */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Configure Pillars
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {extractedPillars.length} pillar{extractedPillars.length !== 1 ? 's' : ''} ready for configuration
                    </p>
                  </div>
                  {extractedPillars.length < 5 && (
                    <span
                      className="px-3 py-1 text-xs font-medium rounded"
                      style={{
                        backgroundColor: 'rgba(255, 173, 31, 0.15)',
                        color: 'var(--warning)',
                      }}
                    >
                      Low pillar count
                    </span>
                  )}
                </div>

                {/* Minimum pillar warning */}
                {extractedPillars.length <= WIZARD_CONFIG.MIN_PILLARS && (
                  <div
                    className="p-3 rounded-lg border flex items-center gap-2"
                    style={{
                      backgroundColor: 'rgba(255, 173, 31, 0.1)',
                      borderColor: 'var(--warning)',
                    }}
                  >
                    <WarningIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--warning)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Minimum {WIZARD_CONFIG.MIN_PILLARS} pillars required for Hub creation. Deletion is disabled.
                    </p>
                  </div>
                )}

                {/* Pillar grid with stagger animation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extractedPillars.map((pillar, index) => (
                    <div
                      key={pillar.id}
                      className={`animate-pillar-stagger-in pillar-stagger-${Math.min(index, 7)}`}
                    >
                      <EditablePillarCard
                        pillar={pillar}
                        isDeleting={deletingPillarId === pillar.id}
                        canDelete={extractedPillars.length > WIZARD_CONFIG.MIN_PILLARS}
                        onUpdate={(updates) => handlePillarUpdate(pillar.id, updates)}
                        onDelete={() => handlePillarDelete(pillar.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Waiting state for supported sources before extraction starts */}
            {!isExtracting && extractedPillars.length === 0 && selectedSourceType === 'text' && (
              <div className="text-center py-8">
                <button
                  onClick={handleStartExtraction}
                  disabled={extractMutation.isPending}
                  className="px-6 py-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--edit)',
                    color: 'var(--bg-default)',
                  }}
                >
                  {extractMutation.isPending ? 'Starting...' : 'Start Extraction'}
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <>
            {/* Story 3.5: Success celebration when Hub is created */}
            {hubCreated ? (
              <IngestionSuccess
                hubTitle={hubTitle || undefined}
                pillars={extractedPillars}
                sourceType={selectedSourceType || undefined}
                onViewHub={handleViewHub}
                onStartGeneration={handleStartGeneration}
              />
            ) : (
              <div className="space-y-6">
                {/* Hub Summary */}
                <div className="text-center">
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'var(--approve)', opacity: 0.15 }}
                  >
                    <svg className="w-8 h-8" style={{ color: 'var(--approve)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    Ready to Create Hub
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Your Hub will contain {extractedPillars.length} content pillars
                  </p>
                </div>

                {/* Title Input */}
                <div className="max-w-md mx-auto">
                  <label
                    htmlFor="hubTitle"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Hub Title (optional)
                  </label>
                  <input
                    id="hubTitle"
                    type="text"
                    value={hubTitle}
                    onChange={(e) => setHubTitle(e.target.value)}
                    placeholder="Auto-generated from source title"
                    maxLength={255}
                    className="w-full px-4 py-3 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Leave blank to use the source title
                  </p>
                </div>

                {/* Pillar Preview */}
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                >
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                    Content Pillars
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedPillars.map((pillar) => (
                      <span
                        key={pillar.id}
                        className="px-3 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {pillar.title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Error State */}
                {finalizeMutation.isError && (
                  <div
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--kill)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--kill)' }}>
                      Failed to create Hub: {finalizeMutation.error?.message || 'Unknown error'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer actions - hidden when Hub is created (IngestionSuccess has its own buttons) */}
      {!hubCreated && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
            }}
          >
            Cancel
          </button>

          {/* Step 3: Continue to Generate button */}
          {currentStep === 3 && extractedPillars.length >= WIZARD_CONFIG.MIN_PILLARS && !isExtracting && !extractionError && (
            <button
              onClick={handleContinueToGenerate}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--approve)',
                color: 'white',
              }}
              data-testid="continue-to-generate-btn"
            >
              Continue to Generate
            </button>
          )}

          {/* Step 3: Disabled button when not ready */}
          {currentStep === 3 && (extractedPillars.length < WIZARD_CONFIG.MIN_PILLARS || isExtracting) && !extractionError && (
            <button
              disabled
              className="px-6 py-2 rounded-lg text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
              style={{
                backgroundColor: 'var(--approve)',
                color: 'white',
              }}
            >
              {isExtracting ? 'Extracting...' : `Need ${WIZARD_CONFIG.MIN_PILLARS}+ pillars`}
            </button>
          )}

          {/* Step 4: Create Hub button */}
          {currentStep === 4 && (
            <button
              onClick={handleFinalizeHub}
              disabled={finalizeMutation.isPending}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--approve)',
                color: 'white',
              }}
            >
              {finalizeMutation.isPending ? 'Creating Hub...' : 'Create Hub'}
            </button>
          )}
        </div>
      )}

      {/* Undo Toast (Story 3-3) */}
      {undoState && (
        <UndoToast
          message={`Deleted "${undoState.pillar.title}"`}
          onUndo={handleUndo}
          onDismiss={() => setUndoState(null)}
        />
      )}

      {/* Error Toast for pillar updates (Story 3-3 fix) */}
      {pillarUpdateError && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-up"
          style={{
            backgroundColor: 'rgba(244, 33, 46, 0.15)',
            border: '1px solid var(--kill)',
          }}
          data-testid="pillar-update-error"
        >
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--kill)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--kill)' }}>
            {pillarUpdateError}
          </p>
          <button
            onClick={() => setPillarUpdateError(null)}
            className="ml-2 p-1 rounded hover:bg-opacity-20"
            style={{ color: 'var(--kill)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
