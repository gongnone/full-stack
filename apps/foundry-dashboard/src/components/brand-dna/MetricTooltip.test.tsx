/**
 * Story R-12: Brand DNA Tooltip Clarity
 * Task 5: MetricTooltip Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricTooltip } from './MetricTooltip';

describe('MetricTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Metric explanations', () => {
    it('shows correct explanation for tone_match', async () => {
      vi.useRealTimers();
      render(<MetricTooltip metricKey="tone_match" />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/emotional tone/i)).toBeInTheDocument();
      });
    });

    it('shows correct explanation for vocabulary', async () => {
      vi.useRealTimers();
      render(<MetricTooltip metricKey="vocabulary" />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/signature phrases/i)).toBeInTheDocument();
      });
    });

    it('shows correct explanation for structure', async () => {
      vi.useRealTimers();
      render(<MetricTooltip metricKey="structure" />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/content formats/i)).toBeInTheDocument();
      });
    });

    it('shows correct explanation for topics', async () => {
      vi.useRealTimers();
      render(<MetricTooltip metricKey="topics" />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/emphasize or avoid/i)).toBeInTheDocument();
      });
    });
  });

  describe('Improvement suggestions', () => {
    it('shows improvement tip for tone_match', async () => {
      vi.useRealTimers();
      render(<MetricTooltip metricKey="tone_match" />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/voice notes/i)).toBeInTheDocument();
      });
    });

    it('shows improvement tip for vocabulary', async () => {
      vi.useRealTimers();
      render(<MetricTooltip metricKey="vocabulary" />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/written samples/i)).toBeInTheDocument();
      });
    });

    it('shows improvement tip for structure', async () => {
      vi.useRealTimers();
      render(<MetricTooltip metricKey="structure" />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/diverse content types/i)).toBeInTheDocument();
      });
    });

    it('shows improvement tip for topics', async () => {
      vi.useRealTimers();
      render(<MetricTooltip metricKey="topics" />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText(/banned words/i)).toBeInTheDocument();
      });
    });
  });

  describe('Hover delay behavior', () => {
    it('does not show tooltip immediately on hover', () => {
      render(<MetricTooltip metricKey="tone_match" />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip after 300ms delay', async () => {
      render(<MetricTooltip metricKey="tone_match" />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', async () => {
      render(<MetricTooltip metricKey="tone_match" />);

      fireEvent.mouseEnter(screen.getByRole('button'));

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.mouseLeave(screen.getByRole('button'));

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Click/tap behavior', () => {
    it('toggles tooltip on click', async () => {
      vi.useRealTimers();
      render(<MetricTooltip metricKey="vocabulary" />);

      const trigger = screen.getByRole('button');

      fireEvent.click(trigger);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.click(trigger);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label for tone_match', () => {
      render(<MetricTooltip metricKey="tone_match" />);

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Learn about Tone Match'
      );
    });

    it('has correct aria-label for vocabulary', () => {
      render(<MetricTooltip metricKey="vocabulary" />);

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Learn about Vocabulary'
      );
    });

    it('has correct aria-label for structure', () => {
      render(<MetricTooltip metricKey="structure" />);

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Learn about Structure'
      );
    });

    it('has correct aria-label for topics', () => {
      render(<MetricTooltip metricKey="topics" />);

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Learn about Topics'
      );
    });

    it('has tabIndex for keyboard access', () => {
      render(<MetricTooltip metricKey="tone_match" />);

      expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0');
    });

    it('responds to keyboard Enter', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<MetricTooltip metricKey="tone_match" />);

      const trigger = screen.getByRole('button');
      trigger.focus();

      await user.keyboard('{Enter}');

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('responds to keyboard Space', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<MetricTooltip metricKey="tone_match" />);

      const trigger = screen.getByRole('button');
      trigger.focus();

      await user.keyboard(' ');

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('closes on Escape key', async () => {
      vi.useRealTimers();
      render(<MetricTooltip metricKey="tone_match" />);

      const trigger = screen.getByRole('button');

      fireEvent.click(trigger);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Close with Escape - use fireEvent for synchronous behavior
      fireEvent.keyDown(trigger, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('has data-testid for E2E testing', () => {
      render(<MetricTooltip metricKey="tone_match" />);

      expect(screen.getByTestId('metric-info-tone_match')).toBeInTheDocument();
    });

    it('has unique data-testid for each metric', () => {
      const { rerender } = render(<MetricTooltip metricKey="vocabulary" />);
      expect(screen.getByTestId('metric-info-vocabulary')).toBeInTheDocument();

      rerender(<MetricTooltip metricKey="structure" />);
      expect(screen.getByTestId('metric-info-structure')).toBeInTheDocument();

      rerender(<MetricTooltip metricKey="topics" />);
      expect(screen.getByTestId('metric-info-topics')).toBeInTheDocument();
    });
  });
});
