import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBadge } from './score-badge';

describe('ScoreBadge', () => {
  describe('quality scoring', () => {
    it('displays high quality (green) for scores >= 8.0', () => {
      render(<ScoreBadge score={8.0} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-[rgba(0,210,106,0.15)]');
      expect(badge).toHaveClass('text-[#00D26A]');
    });

    it('displays high quality for scores above 8.0', () => {
      render(<ScoreBadge score={9.5} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#00D26A]');
    });

    it('displays mid quality (yellow) for scores >= 5.0 and < 8.0', () => {
      render(<ScoreBadge score={5.0} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-[rgba(255,173,31,0.15)]');
      expect(badge).toHaveClass('text-[#FFAD1F]');
    });

    it('displays mid quality for scores in the middle range', () => {
      render(<ScoreBadge score={7.9} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#FFAD1F]');
    });

    it('displays low quality (red) for scores < 5.0', () => {
      render(<ScoreBadge score={4.9} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-[rgba(244,33,46,0.15)]');
      expect(badge).toHaveClass('text-[#F4212E]');
    });

    it('displays low quality for very low scores', () => {
      render(<ScoreBadge score={1.0} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#F4212E]');
    });

    it('displays low quality for zero score', () => {
      render(<ScoreBadge score={0} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#F4212E]');
    });
  });

  describe('score display', () => {
    it('formats score with one decimal place', () => {
      render(<ScoreBadge score={8.5} />);
      expect(screen.getByText('8.5')).toBeInTheDocument();
    });

    it('pads integer scores with .0', () => {
      render(<ScoreBadge score={9} />);
      expect(screen.getByText('9.0')).toBeInTheDocument();
    });

    it('handles decimal precision correctly', () => {
      render(<ScoreBadge score={7.777} />);
      expect(screen.getByText('7.8')).toBeInTheDocument();
    });
  });

  describe('gate label', () => {
    it('does not show gate by default', () => {
      render(<ScoreBadge score={8.0} gate="G2" />);
      expect(screen.queryByText('G2')).not.toBeInTheDocument();
    });

    it('shows gate when showGate is true', () => {
      render(<ScoreBadge score={8.0} gate="G2" showGate />);
      expect(screen.getByText('G2')).toBeInTheDocument();
    });

    it('does not show gate if gate prop is missing even with showGate', () => {
      render(<ScoreBadge score={8.0} showGate />);
      expect(screen.queryByText(/G\d/)).not.toBeInTheDocument();
    });

    it('supports all gate types', () => {
      const gates = ['G2', 'G4', 'G5', 'G7'] as const;
      gates.forEach((gate) => {
        const { unmount } = render(<ScoreBadge score={8.0} gate={gate} showGate />);
        expect(screen.getByText(gate)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('sizes', () => {
    it('renders sm size correctly', () => {
      render(<ScoreBadge score={8.0} size="sm" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('h-6');
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('text-xs');
    });

    it('renders md size correctly (default)', () => {
      render(<ScoreBadge score={8.0} size="md" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('h-8');
      expect(badge).toHaveClass('px-3');
      expect(badge).toHaveClass('text-sm');
    });

    it('renders lg size correctly', () => {
      render(<ScoreBadge score={8.0} size="lg" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('h-12');
      expect(badge).toHaveClass('px-4');
      expect(badge).toHaveClass('text-2xl');
    });
  });

  describe('accessibility', () => {
    it('has status role', () => {
      render(<ScoreBadge score={8.0} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-label with score only', () => {
      render(<ScoreBadge score={8.0} />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Score: 8.0');
    });

    it('has aria-label with gate and score', () => {
      render(<ScoreBadge score={8.0} gate="G2" />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'G2 Score: 8.0');
    });
  });

  describe('boundary conditions', () => {
    it('handles exact boundary at 8.0 as high', () => {
      render(<ScoreBadge score={8.0} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#00D26A]');
    });

    it('handles just below 8.0 as mid', () => {
      render(<ScoreBadge score={7.999} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#FFAD1F]');
    });

    it('handles exact boundary at 5.0 as mid', () => {
      render(<ScoreBadge score={5.0} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#FFAD1F]');
    });

    it('handles just below 5.0 as low', () => {
      render(<ScoreBadge score={4.999} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#F4212E]');
    });

    it('handles score of 10', () => {
      render(<ScoreBadge score={10} />);
      expect(screen.getByText('10.0')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('text-[#00D26A]');
    });
  });
});
