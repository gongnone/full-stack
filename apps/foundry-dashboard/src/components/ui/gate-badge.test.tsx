/**
 * Story 4.2: GateBadge - Unit Tests
 * Quality gate badge with hover tooltips
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GateBadge } from './gate-badge';
import userEvent from '@testing-library/user-event';
import type { G2Breakdown, G4Details, G5Details } from './gate-badge';

describe('GateBadge', () => {
  describe('G2 Gate (Hook Strength)', () => {
    it('renders G2 badge with score', () => {
      render(<GateBadge gate="G2" score={85} />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('G2');
      expect(badge).toHaveTextContent('85');
      expect(badge).toHaveClass('text-[#00D26A]'); // Pass color for >80
    });

    it('renders G2 warning color for medium score', () => {
      render(<GateBadge gate="G2" score={75} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#FFAD1F]'); // Warning color
    });

    it('renders G2 fail color for low score', () => {
      render(<GateBadge gate="G2" score={50} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#F4212E]'); // Fail color
    });

    it('shows pass status for score >= 80', () => {
      render(<GateBadge gate="G2" score={80} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#00D26A]');
    });

    it('shows warning status for score 60-79', () => {
      render(<GateBadge gate="G2" score={60} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#FFAD1F]');
    });

    it('shows fail status for score < 60', () => {
      render(<GateBadge gate="G2" score={59} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-[#F4212E]');
    });

    it('defaults to 0 score when not provided', () => {
      render(<GateBadge gate="G2" />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('shows tooltip on hover', async () => {
      const user = userEvent.setup();
      render(
        <GateBadge
          gate="G2"
          score={85}
          breakdown={{ hook: 80, pattern: 30 }}
        />
      );

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('Hook Strength Analysis')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('Hook Strength:')).toBeInTheDocument();
      expect(screen.getByText('80/100')).toBeInTheDocument();
    });

    it('displays full breakdown in tooltip', async () => {
      const user = userEvent.setup();
      const breakdown: G2Breakdown = {
        hook: 35,
        pattern: 25,
        benefit: 15,
        curiosity: 10,
      };

      render(<GateBadge gate="G2" score={85} breakdown={breakdown} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('Hook Strength Analysis')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('Pattern Interrupt:')).toBeInTheDocument();
      expect(screen.getByText('25/40')).toBeInTheDocument();
      expect(screen.getByText('Benefit Signal:')).toBeInTheDocument();
      expect(screen.getByText('15/30')).toBeInTheDocument();
      expect(screen.getByText('Curiosity Gap:')).toBeInTheDocument();
      expect(screen.getByText('10/30')).toBeInTheDocument();
    });

    it('displays critic notes in tooltip', async () => {
      const user = userEvent.setup();
      const breakdown: G2Breakdown = {
        hook: 35,
        notes: 'Great hook, needs more curiosity gap',
      };

      render(<GateBadge gate="G2" score={85} breakdown={breakdown} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('"Great hook, needs more curiosity gap"')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('falls back to score when breakdown hook not provided', async () => {
      const user = userEvent.setup();
      render(<GateBadge gate="G2" score={75} breakdown={{}} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('75/100')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('G4 Gate (Voice Alignment)', () => {
    it('renders G4 pass badge', () => {
      render(<GateBadge gate="G4" passed={true} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('G4');
      expect(badge).toHaveTextContent('Pass');
      expect(badge).toHaveClass('text-[#00D26A]');
    });

    it('renders G4 fail badge', () => {
      render(<GateBadge gate="G4" passed={false} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('G4');
      expect(badge).toHaveTextContent('Fail');
      expect(badge).toHaveClass('text-[#F4212E]');
    });

    it('shows G4 details in tooltip', async () => {
      const user = userEvent.setup();
      render(
        <GateBadge
          gate="G4"
          passed={false}
          g4Details={{ violations: ['Too formal'], similarity: 0.5 }}
        />
      );

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('Voice Alignment')).toBeInTheDocument();
      });

      expect(screen.getByText('Too formal')).toBeInTheDocument();
      expect(screen.getByText('50.0%')).toBeInTheDocument();
    });

    it('displays similarity percentage in tooltip', async () => {
      const user = userEvent.setup();
      const g4Details: G4Details = { similarity: 0.92 };

      render(<GateBadge gate="G4" passed={true} g4Details={g4Details} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('Cosine Similarity:')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('92.0%')).toBeInTheDocument();
    });

    it('displays multiple violations', async () => {
      const user = userEvent.setup();
      const g4Details: G4Details = {
        violations: ['Too formal', 'Missing brand keywords'],
      };

      render(<GateBadge gate="G4" passed={false} g4Details={g4Details} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('Violations:')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('Too formal')).toBeInTheDocument();
      expect(screen.getByText('Missing brand keywords')).toBeInTheDocument();
    });
  });

  describe('G5 Gate (Platform Compliance)', () => {
    it('renders G5 pass badge', () => {
      render(<GateBadge gate="G5" passed={true} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('G5');
      expect(badge).toHaveTextContent('Pass');
      expect(badge).toHaveClass('text-[#00D26A]');
    });

    it('renders G5 fail badge', () => {
      render(<GateBadge gate="G5" passed={false} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('G5');
      expect(badge).toHaveTextContent('Fail');
      expect(badge).toHaveClass('text-[#F4212E]');
    });

    it('displays Platform Compliance tooltip', async () => {
      const user = userEvent.setup();
      render(<GateBadge gate="G5" passed={true} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('Platform Compliance')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('displays G5 violations in tooltip', async () => {
      const user = userEvent.setup();
      const g5Details: G5Details = {
        violations: ['Exceeds 280 chars', 'Missing hashtags'],
      };

      render(<GateBadge gate="G5" passed={false} g5Details={g5Details} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('Violations:')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('Exceeds 280 chars')).toBeInTheDocument();
      expect(screen.getByText('Missing hashtags')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      render(<GateBadge gate="G2" score={85} size="sm" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('h-5', 'px-1.5', 'text-[10px]');
    });

    it('renders medium size (default)', () => {
      render(<GateBadge gate="G2" score={85} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('h-6', 'px-2', 'text-xs');
    });

    it('renders large size', () => {
      render(<GateBadge gate="G2" score={85} size="lg" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('h-8', 'px-3', 'text-sm');
    });
  });

  describe('Accessibility', () => {
    it('has role="status"', () => {
      render(<GateBadge gate="G2" score={85} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has proper aria-label for G2', () => {
      render(<GateBadge gate="G2" score={85} />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'G2: 85');
    });

    it('has proper aria-label for G4 Pass', () => {
      render(<GateBadge gate="G4" passed={true} />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'G4: Pass');
    });

    it('has proper aria-label for G5 Fail', () => {
      render(<GateBadge gate="G5" passed={false} />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'G5: Fail');
    });

    it('has cursor-help for tooltip hint', () => {
      render(<GateBadge gate="G2" score={85} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('cursor-help');
    });
  });

  describe('Edge Cases', () => {
    it('handles score of 0', () => {
      render(<GateBadge gate="G2" score={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('text-[#F4212E]');
    });

    it('handles score of 100', () => {
      render(<GateBadge gate="G2" score={100} />);
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('text-[#00D26A]');
    });

    it('handles empty violations array', async () => {
      const user = userEvent.setup();
      const g4Details: G4Details = { violations: [], similarity: 0.95 };

      render(<GateBadge gate="G4" passed={true} g4Details={g4Details} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('Voice Alignment')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.queryByText('Violations:')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<GateBadge gate="G2" score={85} className="custom-class" />);
      expect(screen.getByRole('status')).toHaveClass('custom-class');
    });

    it('hides tooltip on mouse leave', async () => {
      const user = userEvent.setup();
      render(<GateBadge gate="G2" score={85} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      await waitFor(() => {
        expect(screen.getByText('Hook Strength Analysis')).toBeInTheDocument();
      }, { timeout: 1000 });

      await user.unhover(badge);

      await waitFor(() => {
        expect(screen.queryByText('Hook Strength Analysis')).not.toBeInTheDocument();
      });
    });
  });
});
