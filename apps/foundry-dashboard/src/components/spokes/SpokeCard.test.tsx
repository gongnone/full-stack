/**
 * Story 4.1/4.2: SpokeCard - Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpokeCard } from './SpokeCard';
import type { Spoke } from '../../../worker/types';

describe('SpokeCard', () => {
  const mockSpoke: Spoke = {
    id: 'spoke-123',
    hub_id: 'hub-456',
    pillar_id: 'pillar-789',
    account_id: 'account-001',
    platform: 'twitter',
    status: 'ready',
    content: 'This is a test spoke content for Twitter',
    psychological_angle: 'curiosity',
    g2_score: 8.5,
    g4_status: 'pass',
    g5_status: 'pass',
    generation_attempt: 1,
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  describe('Rendering', () => {
    it('renders spoke content', () => {
      render(<SpokeCard spoke={mockSpoke} />);

      expect(screen.getByText('This is a test spoke content for Twitter')).toBeInTheDocument();
    });

    it('renders platform label', () => {
      render(<SpokeCard spoke={mockSpoke} />);

      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });

    it('renders status badge', () => {
      render(<SpokeCard spoke={mockSpoke} />);

      expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    it('renders psychological angle', () => {
      render(<SpokeCard spoke={mockSpoke} />);

      expect(screen.getByText('curiosity')).toBeInTheDocument();
    });
  });

  describe('Platform Variants', () => {
    it('shows LinkedIn platform', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, platform: 'linkedin' }} />);

      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('shows TikTok platform', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, platform: 'tiktok' }} />);

      expect(screen.getByText('TikTok')).toBeInTheDocument();
    });

    it('shows Instagram platform', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, platform: 'instagram' }} />);

      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });

    it('shows Newsletter platform', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, platform: 'newsletter' }} />);

      expect(screen.getByText('Newsletter')).toBeInTheDocument();
    });
  });

  describe('Status Variants', () => {
    it('shows Pending status', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, status: 'pending' }} />);

      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('shows Approved status', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, status: 'approved' }} />);

      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('shows Rejected status', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, status: 'rejected' }} />);

      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('shows Killed status', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, status: 'killed' }} />);

      expect(screen.getByText('Killed')).toBeInTheDocument();
    });
  });

  describe('Gate Badges', () => {
    it('renders G2 badge', () => {
      render(<SpokeCard spoke={mockSpoke} />);

      expect(screen.getByText('G2')).toBeInTheDocument();
    });

    it('renders G4 badge', () => {
      render(<SpokeCard spoke={mockSpoke} />);

      expect(screen.getByText('G4')).toBeInTheDocument();
    });

    it('renders G5 badge', () => {
      render(<SpokeCard spoke={mockSpoke} />);

      expect(screen.getByText('G5')).toBeInTheDocument();
    });
  });

  describe('Generation Attempt', () => {
    it('does not show attempt badge for first attempt', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, generation_attempt: 1 }} />);

      expect(screen.queryByText(/Attempt/)).not.toBeInTheDocument();
    });

    it('shows attempt badge for retry', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, generation_attempt: 2 }} />);

      expect(screen.getByText('Attempt #2')).toBeInTheDocument();
    });

    it('shows attempt badge for multiple retries', () => {
      render(<SpokeCard spoke={{ ...mockSpoke, generation_attempt: 5 }} />);

      expect(screen.getByText('Attempt #5')).toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<SpokeCard spoke={mockSpoke} onClick={onClick} />);

      fireEvent.click(screen.getByText('This is a test spoke content for Twitter'));

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Expanded State', () => {
    it('applies expanded styling when isExpanded is true', () => {
      const { container } = render(<SpokeCard spoke={mockSpoke} isExpanded={true} />);

      const card = container.querySelector('.spoke-node');
      expect(card).toHaveClass('bg-[var(--bg-elevated)]');
    });

    it('applies collapsed styling when isExpanded is false', () => {
      const { container } = render(<SpokeCard spoke={mockSpoke} isExpanded={false} />);

      const card = container.querySelector('.spoke-node');
      expect(card).toHaveClass('bg-[var(--bg-surface)]');
    });

    it('shows line clamp when collapsed', () => {
      const { container } = render(<SpokeCard spoke={mockSpoke} isExpanded={false} />);

      const content = container.querySelector('.line-clamp-3');
      expect(content).toBeInTheDocument();
    });

    it('removes line clamp when expanded', () => {
      const { container } = render(<SpokeCard spoke={mockSpoke} isExpanded={true} />);

      const content = container.querySelector('.line-clamp-3');
      expect(content).not.toBeInTheDocument();
    });
  });
});
