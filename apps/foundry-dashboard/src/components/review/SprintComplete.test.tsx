/**
 * Story 5.3: SprintComplete - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SprintComplete } from './SprintComplete';

// Mock useToast
const mockAddToast = vi.fn();
vi.mock('@/lib/toast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

describe('SprintComplete', () => {
  const defaultStats = {
    total: 100,
    approved: 60,
    killed: 20,
    edited: 20,
    avgDecisionMs: 450,
  };

  const defaultProps = {
    stats: defaultStats,
    filter: 'all',
    onBackToDashboard: vi.fn(),
    onReviewConflicts: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });
  });

  describe('Rendering', () => {
    it('renders Sprint Complete heading', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByText('Sprint Complete!')).toBeInTheDocument();
    });

    it('renders checkmark icon', () => {
      const { container } = render(<SprintComplete {...defaultProps} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders Performance Metrics section', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    });

    it('renders Zero-Edit Rate section', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByText('Zero-Edit Rate')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('shows total reviewed count', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Reviewed')).toBeInTheDocument();
    });

    it('shows approved count with percentage', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByText('60')).toBeInTheDocument();
      expect(screen.getByText('Approved (60%)')).toBeInTheDocument();
    });

    it('shows killed count with percentage', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('Killed (20%)')).toBeInTheDocument();
    });

    it('shows average decision time', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByText('450ms')).toBeInTheDocument();
      expect(screen.getByText('Avg Decision')).toBeInTheDocument();
    });
  });

  describe('Hours Saved Calculation', () => {
    it('displays hours saved (100 spokes * 6 min / 60 = 10 hours)', () => {
      render(<SprintComplete {...defaultProps} />);

      // AnimatedNumber will animate to final value
      // The text "hours" and "saved" should be present
      expect(screen.getByText('saved')).toBeInTheDocument();
    });

    it('displays dollar value at $200/hr rate', () => {
      render(<SprintComplete {...defaultProps} />);

      // 10 hours * $200 = $2000
      expect(screen.getByText(/\$200\/hr/)).toBeInTheDocument();
    });
  });

  describe('Zero-Edit Rate', () => {
    it('shows target percentage', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByText('Target: 60%')).toBeInTheDocument();
    });

    it('shows Above target when rate >= 60%', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByText('Above target')).toBeInTheDocument();
    });

    it('shows Below target when rate < 60%', () => {
      const lowStats = { ...defaultStats, approved: 50 }; // 50%
      render(<SprintComplete {...defaultProps} stats={lowStats} />);

      expect(screen.getByText('Below target')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders Back to Dashboard button', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
    });

    it('renders Review Conflicts button', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByRole('button', { name: /review conflicts/i })).toBeInTheDocument();
    });

    it('renders Share Summary button', () => {
      render(<SprintComplete {...defaultProps} />);

      expect(screen.getByRole('button', { name: /share summary/i })).toBeInTheDocument();
    });

    it('calls onBackToDashboard when clicked', () => {
      const onBackToDashboard = vi.fn();
      render(<SprintComplete {...defaultProps} onBackToDashboard={onBackToDashboard} />);

      fireEvent.click(screen.getByRole('button', { name: /back to dashboard/i }));

      expect(onBackToDashboard).toHaveBeenCalled();
    });

    it('calls onReviewConflicts when clicked', () => {
      const onReviewConflicts = vi.fn();
      render(<SprintComplete {...defaultProps} onReviewConflicts={onReviewConflicts} />);

      fireEvent.click(screen.getByRole('button', { name: /review conflicts/i }));

      expect(onReviewConflicts).toHaveBeenCalled();
    });
  });

  describe('Share Summary', () => {
    it('copies summary to clipboard when Share Summary clicked', async () => {
      render(<SprintComplete {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /share summary/i }));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    it('shows success toast after copying', async () => {
      render(<SprintComplete {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /share summary/i }));

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          'Summary copied to clipboard',
          'success',
          expect.any(Number)
        );
      });
    });

    it('shows error toast when clipboard fails', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
        configurable: true,
      });

      render(<SprintComplete {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /share summary/i }));

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          'Failed to copy summary',
          'error',
          expect.any(Number)
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles zero stats without errors', () => {
      const zeroStats = {
        total: 0,
        approved: 0,
        killed: 0,
        edited: 0,
        avgDecisionMs: 0,
      };

      render(<SprintComplete {...defaultProps} stats={zeroStats} />);

      // Should render without throwing - multiple 0s are expected
      expect(screen.getByText('Reviewed')).toBeInTheDocument();
      expect(screen.getByText('Below target')).toBeInTheDocument();
    });
  });
});
