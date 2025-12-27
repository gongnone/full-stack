/**
 * Story 3.3: Interactive Pillar Configuration
 * Undo toast with countdown timer for deleted pillars
 */

import { useEffect, useState } from 'react';
import { WIZARD_CONFIG } from '@/lib/constants';

interface UndoToastProps {
  message: string;
  duration?: number; // in seconds
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({
  message,
  duration = WIZARD_CONFIG.UNDO_DURATION_SECONDS,
  onUndo,
  onDismiss,
}: UndoToastProps) {
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-up"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
      }}
      data-testid="undo-toast"
    >
      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
        {message}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {remainingTime}s
        </span>

        <button
          onClick={onUndo}
          className="px-3 py-1 text-xs font-medium rounded transition-colors"
          style={{
            backgroundColor: 'var(--edit)',
            color: 'white',
          }}
          data-testid="undo-btn"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
