/**
 * Story 2.3: RecommendationsSection - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecommendationsSection } from './RecommendationsSection';

describe('RecommendationsSection', () => {
  const mockOnAddSamples = vi.fn();
  const mockOnRecordVoice = vi.fn();

  const defaultProps = {
    status: 'weak' as const,
    strengthScore: 45,
    recommendations: [
      { type: 'add_samples' as const, message: 'Add more content samples' },
      { type: 'voice_note' as const, message: 'Record a voice note' },
    ],
    onAddSamples: mockOnAddSamples,
    onRecordVoice: mockOnRecordVoice,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Strong Status', () => {
    it('renders strong status message', () => {
      render(<RecommendationsSection {...defaultProps} status="strong" strengthScore={85} />);

      expect(screen.getByText('Strong Brand DNA Profile')).toBeInTheDocument();
    });

    it('shows success description for strong status', () => {
      render(<RecommendationsSection {...defaultProps} status="strong" strengthScore={85} />);

      expect(screen.getByText(/well-calibrated/i)).toBeInTheDocument();
    });
  });

  describe('Weak Status', () => {
    it('renders weak status title', () => {
      render(<RecommendationsSection {...defaultProps} status="weak" strengthScore={45} />);

      expect(screen.getByText('Needs More Training')).toBeInTheDocument();
    });

    it('shows recommendations list', () => {
      render(<RecommendationsSection {...defaultProps} />);

      expect(screen.getByText('Add more content samples')).toBeInTheDocument();
      expect(screen.getByText('Record a voice note')).toBeInTheDocument();
    });
  });

  describe('Good Status', () => {
    it('renders good progress title for good status', () => {
      render(<RecommendationsSection {...defaultProps} status="good" strengthScore={65} />);

      expect(screen.getByText('Good Progress')).toBeInTheDocument();
    });

    it('shows encouraging description for good status', () => {
      render(<RecommendationsSection {...defaultProps} status="good" strengthScore={75} />);

      expect(screen.getByText(/A few more samples/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders Add samples button for add_samples recommendation', () => {
      render(<RecommendationsSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Add samples' })).toBeInTheDocument();
    });

    it('renders Record voice button for voice_note recommendation', () => {
      render(<RecommendationsSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Record voice' })).toBeInTheDocument();
    });

    it('calls onAddSamples when Add samples clicked', () => {
      render(<RecommendationsSection {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Add samples' }));

      expect(mockOnAddSamples).toHaveBeenCalled();
    });

    it('calls onRecordVoice when Record voice clicked', () => {
      render(<RecommendationsSection {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Record voice' }));

      expect(mockOnRecordVoice).toHaveBeenCalled();
    });
  });

  describe('Empty Recommendations', () => {
    it('renders nothing when no recommendations', () => {
      const { container } = render(
        <RecommendationsSection {...defaultProps} recommendations={[]} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Low Score Message', () => {
    it('shows low score description when under 70', () => {
      render(<RecommendationsSection {...defaultProps} strengthScore={50} />);

      expect(screen.getByText(/Add more samples to improve/i)).toBeInTheDocument();
    });
  });
});
