/**
 * Story R-12: Brand DNA Tooltip Clarity
 * Task 5: ScoreTooltip Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScoreTooltip } from './ScoreTooltip';

describe('ScoreTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Tier-based messaging', () => {
    it('shows "significant editing" message for scores < 50', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={35} />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/significant editing/i)).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('shows "moderate editing" message for scores 50-79', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={62} />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/moderate editing/i)).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('shows "minimal editing" message for scores >= 80', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={85} />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/reliably produces/i)).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('shows "Needs Training" label for scores < 50', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={30} />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Needs Training')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('shows "Good" label for scores 50-79', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={65} />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Good')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('shows "Strong" label for scores >= 80', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={90} />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Strong')).toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('Improvement actions', () => {
    it('displays improvement actions when tooltip is shown', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={60} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/Record voice note/i)).toBeInTheDocument();
        expect(screen.getByText(/Add more samples/i)).toBeInTheDocument();
        expect(screen.getByText(/Edit voice markers/i)).toBeInTheDocument();
      });
    });

    it('displays gain percentages for improvements', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={60} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('+15-20%')).toBeInTheDocument();
        expect(screen.getByText('+10-15%')).toBeInTheDocument();
        expect(screen.getByText('+5-10%')).toBeInTheDocument();
      });
    });

    it('displays target score', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={60} />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/Target: 80%\+ for zero-edit content/)).toBeInTheDocument();
      });
    });
  });

  describe('Hover delay behavior', () => {
    it('does not show tooltip immediately on hover', () => {
      render(<ScoreTooltip score={60} />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      // Should not show immediately
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip after 300ms delay', async () => {
      render(<ScoreTooltip score={60} />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      // Advance timer by 300ms
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', async () => {
      render(<ScoreTooltip score={60} />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.mouseLeave(screen.getByRole('button'));

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('cancels tooltip if mouse leaves before 300ms', () => {
      render(<ScoreTooltip score={60} />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      act(() => {
        vi.advanceTimersByTime(150);
      });

      fireEvent.mouseLeave(screen.getByRole('button'));

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Click/tap behavior', () => {
    it('toggles tooltip on click', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={60} />);

      const trigger = screen.getByRole('button');

      // First click shows tooltip
      fireEvent.click(trigger);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Second click hides tooltip
      fireEvent.click(trigger);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility attributes', () => {
      render(<ScoreTooltip score={60} />);

      const trigger = screen.getByRole('button');

      expect(trigger).toHaveAttribute('aria-label', 'Learn about DNA Strength');
      expect(trigger).toHaveAttribute('tabIndex', '0');
    });

    it('has aria-describedby when tooltip is visible', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={60} />);

      const trigger = screen.getByRole('button');

      // Initially no aria-describedby
      expect(trigger).not.toHaveAttribute('aria-describedby');

      fireEvent.click(trigger);

      // Should have aria-describedby when tooltip is visible
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-describedby');
      });
    });

    it('responds to keyboard Enter', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<ScoreTooltip score={60} />);

      const trigger = screen.getByRole('button');
      trigger.focus();

      await user.keyboard('{Enter}');

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('responds to keyboard Space', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<ScoreTooltip score={60} />);

      const trigger = screen.getByRole('button');
      trigger.focus();

      await user.keyboard(' ');

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('closes on Escape key', async () => {
      vi.useRealTimers();
      render(<ScoreTooltip score={60} />);

      const trigger = screen.getByRole('button');

      // Open tooltip
      fireEvent.click(trigger);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Close with Escape - use fireEvent for synchronous behavior
      fireEvent.keyDown(trigger, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('has data-testid for E2E testing', () => {
      render(<ScoreTooltip score={60} />);

      expect(screen.getByTestId('score-info-icon')).toBeInTheDocument();
    });
  });
});
