/**
 * useSprintKeyboard Hook
 *
 * Keyboard navigation for Sprint View.
 * Handles all keyboard shortcuts for high-velocity content review.
 */

import { useEffect, useCallback } from 'react';

export interface UseSprintKeyboardProps {
  onApprove: () => void;
  onCopy: () => void;
  onCopyAndApprove: () => void;
  onKill: () => void;
  onHubKill: () => void;
  onEdit: () => void;
  onSkip: () => void;
  onToggleNotes: () => void;
  onExit: () => void;
  disabled?: boolean;
}

export function useSprintKeyboard({
  onApprove,
  onCopy,
  onCopyAndApprove,
  onKill,
  onHubKill,
  onEdit,
  onSkip,
  onToggleNotes,
  onExit,
  disabled = false,
}: UseSprintKeyboardProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Prevent when typing in inputs or textareas
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Don't handle if disabled (e.g., during animation)
      if (disabled) return;

      if (event.repeat) return; // Ignore native repeats

      switch (event.key) {
        // Approve: Right Arrow or L
        case 'ArrowRight':
        case 'l':
        case 'L':
          event.preventDefault();
          if (event.shiftKey) {
            onCopyAndApprove();
          } else {
            onApprove();
          }
          break;

        // Copy: C
        case 'c':
        case 'C':
          event.preventDefault();
          onCopy();
          break;

        // Kill: Left Arrow or H (tap)
        case 'ArrowLeft':
        case 'h':
        case 'H':
          event.preventDefault();
          // We handle long-press H via keyup/keydown timers if needed, 
          // but simpler is to check if it's a hold.
          // For now, let's implement the timer.
          break;

        // Edit: E
        case 'e':
        case 'E':
          event.preventDefault();
          onEdit();
          break;

        // Skip: Space
        case ' ':
          event.preventDefault();
          onSkip();
          break;

        // Toggle Critic Notes: ?
        case '?':
          event.preventDefault();
          onToggleNotes();
          break;

        // Exit: Escape
        case 'Escape':
          event.preventDefault();
          onExit();
          break;
      }
    },
    [onApprove, onKill, onEdit, onSkip, onToggleNotes, onExit, disabled]
  );

  useEffect(() => {
    let hTimer: number | null = null;
    let isHLongPress = false;

    const onKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'h' || e.key === 'ArrowLeft') {
        if (!hTimer) {
          hTimer = window.setTimeout(() => {
            if (e.key.toLowerCase() === 'h') {
              isHLongPress = true;
              onHubKill();
            }
          }, 500);
        }
      }
      handleKeyDown(e);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h' || e.key === 'ArrowLeft') {
        if (hTimer) {
          window.clearTimeout(hTimer);
          hTimer = null;
        }
        
        if (e.key.toLowerCase() === 'h' || e.key === 'ArrowLeft') {
          if (!isHLongPress) {
            onKill();
          }
          isHLongPress = false;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (hTimer) window.clearTimeout(hTimer);
    };
  }, [handleKeyDown, onKill, onHubKill, disabled]);
}

// Keyboard hint data for display
export const KEYBOARD_HINTS = [
  { keys: ['←', 'H'], action: 'Kill', color: 'kill' },
  { keys: ['Hold H'], action: 'Kill Hub', color: 'kill' },
  { keys: ['E'], action: 'Edit', color: 'edit' },
  { keys: ['C'], action: 'Copy', color: 'info' },
  { keys: ['⇧+→'], action: 'Copy & Appr', color: 'approve' },
  { keys: ['→', 'L'], action: 'Approve', color: 'approve' },
  { keys: ['Space'], action: 'Skip', color: 'warning' },
  { keys: ['?'], action: 'Notes', color: 'muted' },
  { keys: ['ESC'], action: 'Exit', color: 'muted' },
] as const;
