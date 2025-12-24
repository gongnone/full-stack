import { ActionButton } from '@/components/ui';

interface KillConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'hub' | 'pillar';
  title: string;
  spokeCount: number;
  editedCount: number;
  isLoading?: boolean;
}

export function KillConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  spokeCount,
  editedCount,
  isLoading,
}: KillConfirmationModalProps) {
  if (!isOpen) return null;

  const affectedCount = spokeCount - editedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-elevated)] border border-[var(--kill)] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-fadeIn">
        {/* Red pulse effect */}
        <div className="absolute inset-0 rounded-2xl bg-[var(--kill-glow)] animate-pulse opacity-30" />

        <div className="relative">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--kill-glow)] flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[var(--kill)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
            Kill {type === 'hub' ? 'Hub' : 'Pillar'}?
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-6">
            {title}
          </p>

          {/* Stats */}
          <div className="bg-[var(--bg-surface)] rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Total spokes</span>
              <span className="font-semibold text-[var(--text-primary)]">{spokeCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Will be discarded</span>
              <span className="font-semibold text-[var(--kill)]">{affectedCount}</span>
            </div>
            {editedCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Protected (edited)</span>
                <span className="font-semibold text-[var(--approve)]">{editedCount}</span>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-[var(--bg-surface)] rounded-lg p-3 mb-6 border border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--warning)]">Note:</span> Edited spokes will survive.
              Can be undone within 30 seconds.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <ActionButton
              variant="ghost"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </ActionButton>
            <ActionButton
              variant="kill"
              className="flex-1"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Killing...' : 'Confirm Kill'}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
