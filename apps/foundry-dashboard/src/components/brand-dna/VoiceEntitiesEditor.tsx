/**
 * Story 2.5: Voice Marker and Banned Word Management
 * Task 7: VoiceEntitiesEditor component
 *
 * Main edit panel with two sections:
 * - Voice Markers (blue chips) - phrases that define your voice
 * - Banned Words (red chips) - words to never use
 */

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useToast } from '@/lib/toast';
import { EditableChipList } from './EditableChipList';
import { VALIDATION_LIMITS, UI_CONFIG } from '@/lib/constants';

interface VoiceEntitiesEditorProps {
  clientId: string;
  onClose: () => void;
}

export function VoiceEntitiesEditor({ clientId, onClose }: VoiceEntitiesEditorProps) {
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  // Query current voice entities
  const voiceEntitiesQuery = trpc.calibration.getVoiceEntities.useQuery(
    { clientId },
    { enabled: !!clientId }
  );

  // Mutations with optimistic updates - AC5: Toast says "Brand DNA updated" on success
  const addVoiceMarker = trpc.calibration.addVoiceMarker.useMutation({
    onMutate: async ({ phrase }) => {
      // Cancel outgoing refetches
      await utils.calibration.getVoiceEntities.cancel({ clientId });
      // Snapshot previous value
      const previousData = utils.calibration.getVoiceEntities.getData({ clientId });
      // Optimistically update
      utils.calibration.getVoiceEntities.setData({ clientId }, (old) => ({
        bannedWords: old?.bannedWords ?? [],
        voiceMarkers: [...(old?.voiceMarkers ?? []), phrase.toLowerCase().trim()],
        stances: old?.stances ?? [],
      }));
      return { previousData };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.calibration.getVoiceEntities.setData({ clientId }, context.previousData);
      }
      addToast(error.message || 'Failed to update Brand DNA', 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
    onSettled: () => {
      utils.calibration.getVoiceEntities.invalidate({ clientId });
    },
    onSuccess: () => {
      addToast('Brand DNA updated', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    },
  });

  const removeVoiceMarker = trpc.calibration.removeVoiceMarker.useMutation({
    onMutate: async ({ phrase }) => {
      await utils.calibration.getVoiceEntities.cancel({ clientId });
      const previousData = utils.calibration.getVoiceEntities.getData({ clientId });
      const normalizedPhrase = phrase.toLowerCase().trim();
      utils.calibration.getVoiceEntities.setData({ clientId }, (old) => ({
        bannedWords: old?.bannedWords ?? [],
        voiceMarkers: (old?.voiceMarkers ?? []).filter((p: string) => p.toLowerCase().trim() !== normalizedPhrase),
        stances: old?.stances ?? [],
      }));
      return { previousData };
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        utils.calibration.getVoiceEntities.setData({ clientId }, context.previousData);
      }
      addToast(error.message || 'Failed to update Brand DNA', 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
    onSettled: () => {
      utils.calibration.getVoiceEntities.invalidate({ clientId });
    },
    onSuccess: () => {
      addToast('Brand DNA updated', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    },
  });

  const addBannedWord = trpc.calibration.addBannedWord.useMutation({
    onMutate: async ({ word }) => {
      await utils.calibration.getVoiceEntities.cancel({ clientId });
      const previousData = utils.calibration.getVoiceEntities.getData({ clientId });
      utils.calibration.getVoiceEntities.setData({ clientId }, (old) => ({
        bannedWords: [...(old?.bannedWords ?? []), word.toLowerCase().trim()],
        voiceMarkers: old?.voiceMarkers ?? [],
        stances: old?.stances ?? [],
      }));
      return { previousData };
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        utils.calibration.getVoiceEntities.setData({ clientId }, context.previousData);
      }
      addToast(error.message || 'Failed to update Brand DNA', 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
    onSettled: () => {
      utils.calibration.getVoiceEntities.invalidate({ clientId });
    },
    onSuccess: () => {
      addToast('Brand DNA updated', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    },
  });

  const removeBannedWord = trpc.calibration.removeBannedWord.useMutation({
    onMutate: async ({ word }) => {
      await utils.calibration.getVoiceEntities.cancel({ clientId });
      const previousData = utils.calibration.getVoiceEntities.getData({ clientId });
      const normalizedWord = word.toLowerCase().trim();
      utils.calibration.getVoiceEntities.setData({ clientId }, (old) => ({
        bannedWords: (old?.bannedWords ?? []).filter((w: string) => w.toLowerCase().trim() !== normalizedWord),
        voiceMarkers: old?.voiceMarkers ?? [],
        stances: old?.stances ?? [],
      }));
      return { previousData };
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        utils.calibration.getVoiceEntities.setData({ clientId }, context.previousData);
      }
      addToast(error.message || 'Failed to update Brand DNA', 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
    onSettled: () => {
      utils.calibration.getVoiceEntities.invalidate({ clientId });
    },
    onSuccess: () => {
      addToast('Brand DNA updated', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    },
  });

  // Handlers
  const handleAddVoiceMarker = useCallback(
    (phrase: string) => {
      addVoiceMarker.mutate({ clientId, phrase });
    },
    [clientId, addVoiceMarker]
  );

  const handleRemoveVoiceMarker = useCallback(
    (phrase: string) => {
      removeVoiceMarker.mutate({ clientId, phrase });
    },
    [clientId, removeVoiceMarker]
  );

  const handleAddBannedWord = useCallback(
    (word: string) => {
      addBannedWord.mutate({ clientId, word });
    },
    [clientId, addBannedWord]
  );

  const handleRemoveBannedWord = useCallback(
    (word: string) => {
      removeBannedWord.mutate({ clientId, word });
    },
    [clientId, removeBannedWord]
  );

  const isLoading = voiceEntitiesQuery.isLoading;
  const isMutating =
    addVoiceMarker.isPending ||
    removeVoiceMarker.isPending ||
    addBannedWord.isPending ||
    removeBannedWord.isPending;

  return (
    <div
      className="rounded-xl border p-6 space-y-6"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
      data-testid="voice-entities-editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-lg font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Edit Voice Profile
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Fine-tune what the system learns about your brand voice
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors hover:bg-black/10"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Close editor"
          data-testid="close-editor"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Voice Markers Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--edit)' }}
          />
          <h4
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Voice Markers
          </h4>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Signature phrases and patterns that define your brand voice
        </p>
        <EditableChipList
          items={voiceEntitiesQuery.data?.voiceMarkers ?? []}
          onAdd={handleAddVoiceMarker}
          onRemove={handleRemoveVoiceMarker}
          placeholder="Add a signature phrase..."
          chipColor="blue"
          isLoading={isLoading}
          disabled={isMutating}
          maxLength={VALIDATION_LIMITS.MAX_VOICE_MARKER_LENGTH}
        />
      </div>

      {/* Banned Words Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--kill)' }}
          />
          <h4
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Banned Words
          </h4>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Words and phrases the system should never use in your content
        </p>
        <EditableChipList
          items={voiceEntitiesQuery.data?.bannedWords ?? []}
          onAdd={handleAddBannedWord}
          onRemove={handleRemoveBannedWord}
          placeholder="Add a word to ban..."
          chipColor="red"
          isLoading={isLoading}
          disabled={isMutating}
          maxLength={VALIDATION_LIMITS.MAX_BANNED_WORD_LENGTH}
        />
      </div>

      {/* Status indicator */}
      {isMutating && (
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Updating Brand DNA...
        </div>
      )}

      {/* Tip */}
      <div
        className="text-xs pt-4 border-t"
        style={{
          color: 'var(--text-muted)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <strong>Tip:</strong> Changes take effect immediately. The system will use
        these markers when generating and evaluating content.
      </div>
    </div>
  );
}
