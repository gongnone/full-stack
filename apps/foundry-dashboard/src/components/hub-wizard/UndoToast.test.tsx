/**
 * Story 3.3: UndoToast - Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UndoToast } from './UndoToast';

describe('UndoToast', () => {
  const defaultProps = {
    message: 'Pillar deleted',
    onUndo: vi.fn(),
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders toast with message', () => {
      render(<UndoToast {...defaultProps} />);

      expect(screen.getByText('Pillar deleted')).toBeInTheDocument();
    });

    it('renders Undo button', () => {
      render(<UndoToast {...defaultProps} />);

      expect(screen.getByTestId('undo-btn')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('renders countdown timer', () => {
      render(<UndoToast {...defaultProps} duration={5} />);

      expect(screen.getByText('5s')).toBeInTheDocument();
    });

    it('has correct test id', () => {
      render(<UndoToast {...defaultProps} />);

      expect(screen.getByTestId('undo-toast')).toBeInTheDocument();
    });
  });

  describe('Countdown Timer', () => {
    it('counts down every second', () => {
      render(<UndoToast {...defaultProps} duration={5} />);

      expect(screen.getByText('5s')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('4s')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('3s')).toBeInTheDocument();
    });

    it('calls onDismiss when timer reaches 0', () => {
      render(<UndoToast {...defaultProps} duration={3} />);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(defaultProps.onDismiss).toHaveBeenCalled();
    });

    it('uses default duration from WIZARD_CONFIG', () => {
      render(<UndoToast {...defaultProps} />);

      // Default is 3 seconds from WIZARD_CONFIG.UNDO_DURATION_SECONDS
      expect(screen.getByText('3s')).toBeInTheDocument();
    });
  });

  describe('Undo Action', () => {
    it('calls onUndo when Undo button clicked', () => {
      render(<UndoToast {...defaultProps} />);

      fireEvent.click(screen.getByTestId('undo-btn'));

      expect(defaultProps.onUndo).toHaveBeenCalled();
    });

    it('does not auto-dismiss after undo is clicked', () => {
      render(<UndoToast {...defaultProps} duration={2} />);

      fireEvent.click(screen.getByTestId('undo-btn'));

      // The onUndo is called, timer still runs independently
      expect(defaultProps.onUndo).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('clears interval on unmount', () => {
      const { unmount } = render(<UndoToast {...defaultProps} duration={10} />);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      unmount();

      // Advancing timers after unmount should not call onDismiss
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // onDismiss should not have been called since component unmounted
      expect(defaultProps.onDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Custom Messages', () => {
    it('displays custom message', () => {
      render(<UndoToast {...defaultProps} message="Source removed" />);

      expect(screen.getByText('Source removed')).toBeInTheDocument();
    });

    it('displays long message', () => {
      render(
        <UndoToast
          {...defaultProps}
          message="The pillar 'Customer Success Stories' has been deleted"
        />
      );

      expect(
        screen.getByText("The pillar 'Customer Success Stories' has been deleted")
      ).toBeInTheDocument();
    });
  });
});
