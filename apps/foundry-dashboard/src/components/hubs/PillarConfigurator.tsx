/**
 * Story 3-3: Interactive Pillar Configuration
 * Component for managing and configuring content pillars with drag-drop and editing
 * Provides pillar editing, deletion, undo, and validation
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { EditablePillarCard, UndoToast, type Pillar, type PsychologicalAngle } from '@/components/hub-wizard';
import { trpc } from '@/lib/trpc-client';

interface PillarConfiguratorProps {
  pillars: Pillar[];
  sourceId: string;
  clientId: string;
  onPillarsChange?: (pillars: Pillar[]) => void;
  minPillars?: number;
  maxPillars?: number;
  showWarnings?: boolean;
}

/**
 * PillarConfigurator - Interactive pillar management with editing and deletion
 *
 * Features:
 * - Inline editing of pillar title, core claim, and psychological angle
 * - Pillar deletion with 3-second undo window
 * - Minimum pillar count validation (default: 3)
 * - Optimistic UI updates with error rollback
 * - Real-time character count and validation
 * - Staggered animation for pillar cards
 *
 * Pillar Editing:
 * - Title: Click to edit inline with character limit
 * - Core Claim: Expandable textarea with 2000 char limit
 * - Psychological Angle: Dropdown with 8 predefined angles
 *   (Contrarian, Authority, Urgency, Aspiration, Fear, Curiosity, Transformation, Rebellion)
 *
 * Deletion Rules:
 * - Cannot delete if pillar count would drop below minimum (default: 3)
 * - 3-second undo window after deletion
 * - Soft delete with database rollback on undo
 *
 * @param pillars - Array of pillars to configure
 * @param sourceId - Source ID for pillar operations
 * @param clientId - Client ID for pillar operations
 * @param onPillarsChange - Callback when pillars are updated
 * @param minPillars - Minimum required pillars (default: 3)
 * @param maxPillars - Maximum allowed pillars (default: 20)
 * @param showWarnings - Whether to show pillar count warnings (default: true)
 */
export function PillarConfigurator({
  pillars: initialPillars,
  sourceId,
  clientId,
  onPillarsChange,
  minPillars = 3,
  maxPillars = 20,
  showWarnings = true,
}: PillarConfiguratorProps) {
  const [pillars, setPillars] = useState<Pillar[]>(initialPillars);
  const [deletingPillarId, setDeletingPillarId] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<{ pillar: Pillar; index: number } | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // tRPC mutations
  const updatePillarMutation = trpc.hubs.updatePillar.useMutation();
  const deletePillarMutation = trpc.hubs.deletePillar.useMutation();
  const restorePillarMutation = trpc.hubs.restorePillar.useMutation();

  // Sync with parent
  useEffect(() => {
    onPillarsChange?.(pillars);
  }, [pillars, onPillarsChange]);

  // Sync with external changes
  useEffect(() => {
    setPillars(initialPillars);
  }, [initialPillars]);

  /**
   * Handle pillar updates (title, claim, angle)
   * Uses optimistic UI with rollback on error
   */
  const handlePillarUpdate = useCallback((
    pillarId: string,
    updates: Partial<Pick<Pillar, 'title' | 'coreClaim' | 'psychologicalAngle'>>
  ) => {
    // Store original state for rollback
    const originalPillars = pillars;

    // Clear any previous error
    setUpdateError(null);

    // Optimistic update
    setPillars(prev => prev.map(p =>
      p.id === pillarId ? { ...p, ...updates } : p
    ));

    // Fire mutation
    updatePillarMutation.mutate(
      {
        pillarId,
        clientId,
        ...updates,
      },
      {
        onError: (error) => {
          // Rollback on error
          setPillars(originalPillars);
          setUpdateError(`Failed to save changes: ${error.message}`);
          // Auto-dismiss error after 5 seconds
          setTimeout(() => setUpdateError(null), 5000);
        },
      }
    );
  }, [pillars, clientId, updatePillarMutation]);

  /**
   * Handle pillar deletion with undo window
   * Shows animation, then removes from list with 3s undo option
   */
  const handlePillarDelete = useCallback((pillarId: string) => {
    // Prevent double-delete while animation is running
    if (deletingPillarId) return;

    // Find pillar and its index for undo
    const pillarIndex = pillars.findIndex(p => p.id === pillarId);
    const pillar = pillars[pillarIndex];
    if (!pillar) return;

    // Start fade animation
    setDeletingPillarId(pillarId);

    // After animation (300ms), remove from list and show undo toast
    setTimeout(() => {
      setPillars(prev => prev.filter(p => p.id !== pillarId));
      setDeletingPillarId(null);
      setUndoState({ pillar, index: pillarIndex });

      // Fire deletion mutation
      deletePillarMutation.mutate(
        {
          pillarId,
          sourceId,
          clientId,
        },
        {
          onError: (error) => {
            setUpdateError(`Failed to delete pillar: ${error.message}`);
            setTimeout(() => setUpdateError(null), 5000);
          },
        }
      );
    }, 300);
  }, [pillars, sourceId, clientId, deletingPillarId, deletePillarMutation]);

  /**
   * Handle undo - restores pillar to its original position
   */
  const handleUndo = useCallback(() => {
    if (!undoState) return;

    const { pillar, index } = undoState;

    // Restore to local state at original index
    setPillars(prev => {
      const newPillars = [...prev];
      newPillars.splice(index, 0, pillar);
      return newPillars;
    });

    // Restore in database
    restorePillarMutation.mutate({
      sourceId,
      clientId,
      pillar,
    });

    setUndoState(null);
  }, [undoState, sourceId, clientId, restorePillarMutation]);

  const canDeletePillars = pillars.length > minPillars;
  const isLowPillarCount = pillars.length < 5;
  const isAtMinimum = pillars.length === minPillars;

  return (
    <div className="space-y-6" data-testid="pillar-configurator">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Configure Content Pillars
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {pillars.length} pillar{pillars.length !== 1 ? 's' : ''}
            {pillars.length < minPillars && ` (minimum ${minPillars} required)`}
          </p>
        </div>

        {/* Warning badge for low pillar count */}
        {showWarnings && isLowPillarCount && (
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
      {showWarnings && isAtMinimum && (
        <div
          className="p-3 rounded-lg border flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(255, 173, 31, 0.1)',
            borderColor: 'var(--warning)',
          }}
        >
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--warning)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Minimum {minPillars} pillars required for Hub creation. Deletion is disabled.
          </p>
        </div>
      )}

      {/* Pillar cards grid with stagger animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((pillar, index) => (
          <div
            key={pillar.id}
            className={`animate-pillar-stagger-in pillar-stagger-${Math.min(index, 7)}`}
          >
            <EditablePillarCard
              pillar={pillar}
              isDeleting={deletingPillarId === pillar.id}
              canDelete={canDeletePillars}
              onUpdate={(updates) => handlePillarUpdate(pillar.id, updates)}
              onDelete={() => handlePillarDelete(pillar.id)}
            />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {pillars.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: 'var(--text-muted)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No pillars to configure. Start by extracting content themes.
          </p>
        </div>
      )}

      {/* Undo Toast */}
      {undoState && (
        <UndoToast
          message={`Deleted "${undoState.pillar.title}"`}
          onUndo={handleUndo}
          onDismiss={() => setUndoState(null)}
        />
      )}

      {/* Error Toast */}
      {updateError && (
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
            {updateError}
          </p>
          <button
            onClick={() => setUpdateError(null)}
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
