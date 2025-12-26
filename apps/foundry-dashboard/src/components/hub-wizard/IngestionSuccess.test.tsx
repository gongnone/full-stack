/**
 * Story 3.5: IngestionSuccess - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IngestionSuccess } from './IngestionSuccess';

describe('IngestionSuccess', () => {
  const mockPillars = [
    { id: '1', title: 'Content Strategy', coreClaim: 'Claim 1', estimatedSpokeCount: 5 },
    { id: '2', title: 'Brand Voice', coreClaim: 'Claim 2', estimatedSpokeCount: 8 },
    { id: '3', title: 'Audience Engagement', coreClaim: 'Claim 3', estimatedSpokeCount: 6 },
  ];

  const defaultProps = {
    pillars: mockPillars as never,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders success container with testid', () => {
      render(<IngestionSuccess {...defaultProps} />);

      expect(screen.getByTestId('ingestion-success')).toBeInTheDocument();
    });

    it('renders with status role for accessibility', () => {
      render(<IngestionSuccess {...defaultProps} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders Hub Created heading', () => {
      render(<IngestionSuccess {...defaultProps} />);

      expect(screen.getByText('Hub Created!')).toBeInTheDocument();
    });

    it('displays hub title when provided', () => {
      render(<IngestionSuccess {...defaultProps} hubTitle="My Marketing Hub" />);

      expect(screen.getByText('My Marketing Hub')).toBeInTheDocument();
    });

    it('displays Your Content Pillars section', () => {
      render(<IngestionSuccess {...defaultProps} />);

      expect(screen.getByText('Your Content Pillars')).toBeInTheDocument();
    });

    it('renders next steps hint', () => {
      render(<IngestionSuccess {...defaultProps} />);

      expect(screen.getByText(/your content pillars are ready/i)).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('displays pillar count', () => {
      render(<IngestionSuccess {...defaultProps} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Pillars')).toBeInTheDocument();
    });

    it('displays estimated spokes (sum of all pillar estimates)', () => {
      render(<IngestionSuccess {...defaultProps} />);

      // 5 + 8 + 6 = 19
      expect(screen.getByText('~19')).toBeInTheDocument();
      expect(screen.getByText('Est. Spokes')).toBeInTheDocument();
    });

    it('displays source type', () => {
      render(<IngestionSuccess {...defaultProps} sourceType="pdf" />);

      expect(screen.getByText('pdf')).toBeInTheDocument();
      expect(screen.getByText('Source')).toBeInTheDocument();
    });

    it('shows Doc as default source type', () => {
      render(<IngestionSuccess {...defaultProps} />);

      expect(screen.getByText('Doc')).toBeInTheDocument();
    });
  });

  describe('Pillar Tags', () => {
    it('renders all pillar titles as tags', () => {
      render(<IngestionSuccess {...defaultProps} />);

      expect(screen.getByText('Content Strategy')).toBeInTheDocument();
      expect(screen.getByText('Brand Voice')).toBeInTheDocument();
      expect(screen.getByText('Audience Engagement')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('does not render View Hub button when onViewHub not provided', () => {
      render(<IngestionSuccess {...defaultProps} />);

      expect(screen.queryByTestId('view-hub-button')).not.toBeInTheDocument();
    });

    it('renders View Hub button when onViewHub is provided', () => {
      const onViewHub = vi.fn();
      render(<IngestionSuccess {...defaultProps} onViewHub={onViewHub} />);

      expect(screen.getByTestId('view-hub-button')).toBeInTheDocument();
    });

    it('calls onViewHub when View Hub clicked', () => {
      const onViewHub = vi.fn();
      render(<IngestionSuccess {...defaultProps} onViewHub={onViewHub} />);

      fireEvent.click(screen.getByTestId('view-hub-button'));

      expect(onViewHub).toHaveBeenCalled();
    });

    it('does not render Start Generation button when onStartGeneration not provided', () => {
      render(<IngestionSuccess {...defaultProps} />);

      expect(screen.queryByTestId('start-generation-button')).not.toBeInTheDocument();
    });

    it('renders Start Generation button when onStartGeneration is provided', () => {
      const onStartGeneration = vi.fn();
      render(<IngestionSuccess {...defaultProps} onStartGeneration={onStartGeneration} />);

      expect(screen.getByTestId('start-generation-button')).toBeInTheDocument();
    });

    it('calls onStartGeneration when Start Generation clicked', () => {
      const onStartGeneration = vi.fn();
      render(<IngestionSuccess {...defaultProps} onStartGeneration={onStartGeneration} />);

      fireEvent.click(screen.getByTestId('start-generation-button'));

      expect(onStartGeneration).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles pillars without estimatedSpokeCount (defaults to 5)', () => {
      const pillarsNoEstimate = [
        { id: '1', title: 'Pillar 1', coreClaim: 'Claim' },
        { id: '2', title: 'Pillar 2', coreClaim: 'Claim' },
      ];

      render(<IngestionSuccess pillars={pillarsNoEstimate as never} />);

      // Should show ~10 (2 pillars * 5 default)
      expect(screen.getByText('~10')).toBeInTheDocument();
    });

    it('handles empty pillars array', () => {
      render(<IngestionSuccess pillars={[]} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('~0')).toBeInTheDocument();
    });

    it('handles single pillar', () => {
      const singlePillar = [
        { id: '1', title: 'Only Pillar', coreClaim: 'Claim', estimatedSpokeCount: 7 },
      ];

      render(<IngestionSuccess pillars={singlePillar as never} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('~7')).toBeInTheDocument();
      expect(screen.getByText('Only Pillar')).toBeInTheDocument();
    });
  });

  describe('Source Types', () => {
    it('displays text source type', () => {
      render(<IngestionSuccess {...defaultProps} sourceType="text" />);

      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('displays url source type', () => {
      render(<IngestionSuccess {...defaultProps} sourceType="url" />);

      expect(screen.getByText('url')).toBeInTheDocument();
    });
  });
});
