/**
 * Story 2.1: TrainingSamplesList - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrainingSamplesList } from './TrainingSamplesList';

describe('TrainingSamplesList', () => {
  const mockOnDelete = vi.fn();
  const mockSamples = [
    {
      sample: {
        id: '1',
        title: 'Sample 1',
        source_type: 'pdf' as const,
        word_count: 500,
        status: 'analyzed' as const,
        quality_score: 90,
        created_at: 1672531200,
      },
      qualityBadge: 'excellent' as const,
    },
    {
      sample: {
        id: '2',
        title: 'Sample 2',
        source_type: 'voice' as const,
        word_count: 200,
        status: 'processing' as const,
        quality_score: null,
        created_at: 1672617600,
      },
      qualityBadge: 'pending' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders list of samples', () => {
      render(<TrainingSamplesList samples={mockSamples} onDelete={mockOnDelete} />);

      expect(screen.getByText('Sample 1')).toBeInTheDocument();
      expect(screen.getByText('Sample 2')).toBeInTheDocument();
    });

    it('shows quality badge for analyzed samples', () => {
      render(<TrainingSamplesList samples={mockSamples} onDelete={mockOnDelete} />);

      // Quality badge shows "90% Excellent" for analyzed sample
      expect(screen.getByText(/90%\s*Excellent/)).toBeInTheDocument();
    });

    it('shows Processing status for processing samples', () => {
      render(<TrainingSamplesList samples={mockSamples} onDelete={mockOnDelete} />);

      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('shows word count', () => {
      render(<TrainingSamplesList samples={mockSamples} onDelete={mockOnDelete} />);

      expect(screen.getByText('500 words')).toBeInTheDocument();
      expect(screen.getByText('200 words')).toBeInTheDocument();
    });

    it('shows source type label', () => {
      render(<TrainingSamplesList samples={mockSamples} onDelete={mockOnDelete} />);

      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('Voice Note')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state message', () => {
      render(<TrainingSamplesList samples={[]} onDelete={mockOnDelete} />);

      expect(screen.getByText('No training samples yet')).toBeInTheDocument();
    });

    it('shows help text in empty state', () => {
      render(<TrainingSamplesList samples={[]} onDelete={mockOnDelete} />);

      expect(screen.getByText(/Upload content to start building/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading skeletons', () => {
      render(<TrainingSamplesList samples={[]} onDelete={mockOnDelete} isLoading={true} />);

      // Loading state shows animate-pulse divs
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Expand and Delete', () => {
    it('expands item on click', () => {
      render(<TrainingSamplesList samples={mockSamples} onDelete={mockOnDelete} />);

      const row = screen.getByText('Sample 1');
      fireEvent.click(row);

      // Delete button should be visible after expanding
      expect(screen.getByTestId('delete-sample-btn')).toBeInTheDocument();
    });

    it('shows Delete button when expanded', () => {
      render(<TrainingSamplesList samples={mockSamples} onDelete={mockOnDelete} />);

      fireEvent.click(screen.getByText('Sample 1'));

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls onDelete when Delete button clicked', () => {
      render(<TrainingSamplesList samples={mockSamples} onDelete={mockOnDelete} />);

      fireEvent.click(screen.getByText('Sample 1'));
      fireEvent.click(screen.getByTestId('delete-sample-btn'));

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('collapses item when clicked again', () => {
      render(<TrainingSamplesList samples={mockSamples} onDelete={mockOnDelete} />);

      const row = screen.getByText('Sample 1');
      fireEvent.click(row);
      fireEvent.click(row);

      // Delete button should no longer be visible
      expect(screen.queryByTestId('delete-sample-btn')).not.toBeInTheDocument();
    });
  });

  describe('Deleting State', () => {
    it('shows Deleting... text when deleting', () => {
      render(
        <TrainingSamplesList
          samples={mockSamples}
          onDelete={mockOnDelete}
          isDeleting="1"
        />
      );

      // First expand the item
      fireEvent.click(screen.getByText('Sample 1'));

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });

    it('disables delete button when deleting', () => {
      render(
        <TrainingSamplesList
          samples={mockSamples}
          onDelete={mockOnDelete}
          isDeleting="1"
        />
      );

      fireEvent.click(screen.getByText('Sample 1'));

      expect(screen.getByTestId('delete-sample-btn')).toBeDisabled();
    });
  });
});
