/**
 * Story 3.5: IngestionError - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IngestionError } from './IngestionError';

describe('IngestionError', () => {
  const defaultProps = {
    error: 'Failed to process document: timeout exceeded',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders error container with testid', () => {
      render(<IngestionError {...defaultProps} />);

      expect(screen.getByTestId('ingestion-error')).toBeInTheDocument();
    });

    it('renders with alert role for accessibility', () => {
      render(<IngestionError {...defaultProps} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders Extraction Failed heading', () => {
      render(<IngestionError {...defaultProps} />);

      expect(screen.getByText('Extraction Failed')).toBeInTheDocument();
    });

    it('displays error message', () => {
      render(<IngestionError {...defaultProps} />);

      expect(screen.getByText('Failed to process document: timeout exceeded')).toBeInTheDocument();
    });

    it('renders What happened section', () => {
      render(<IngestionError {...defaultProps} />);

      expect(screen.getByText('What happened?')).toBeInTheDocument();
    });

    it('displays potential causes', () => {
      render(<IngestionError {...defaultProps} />);

      expect(screen.getByText(/Document format issues/)).toBeInTheDocument();
      expect(screen.getByText(/Processing timeout/)).toBeInTheDocument();
      expect(screen.getByText(/Temporary service disruption/)).toBeInTheDocument();
    });

    it('renders help text', () => {
      render(<IngestionError {...defaultProps} />);

      expect(screen.getByText(/Retry will continue from the last successful stage/)).toBeInTheDocument();
    });
  });

  describe('Retry Button', () => {
    it('does not render retry button when onRetry not provided', () => {
      render(<IngestionError {...defaultProps} />);

      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided', () => {
      const onRetry = vi.fn();
      render(<IngestionError {...defaultProps} onRetry={onRetry} />);

      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('shows Retry Extraction text on button', () => {
      const onRetry = vi.fn();
      render(<IngestionError {...defaultProps} onRetry={onRetry} />);

      expect(screen.getByText('Retry Extraction')).toBeInTheDocument();
    });

    it('calls onRetry when clicked', () => {
      const onRetry = vi.fn();
      render(<IngestionError {...defaultProps} onRetry={onRetry} />);

      fireEvent.click(screen.getByTestId('retry-button'));

      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Retrying State', () => {
    it('shows Retrying... text when isRetrying is true', () => {
      const onRetry = vi.fn();
      render(<IngestionError {...defaultProps} onRetry={onRetry} isRetrying={true} />);

      expect(screen.getByText('Retrying...')).toBeInTheDocument();
    });

    it('disables button when isRetrying', () => {
      const onRetry = vi.fn();
      render(<IngestionError {...defaultProps} onRetry={onRetry} isRetrying={true} />);

      expect(screen.getByTestId('retry-button')).toBeDisabled();
    });

    it('has aria-busy when retrying', () => {
      const onRetry = vi.fn();
      render(<IngestionError {...defaultProps} onRetry={onRetry} isRetrying={true} />);

      expect(screen.getByTestId('retry-button')).toHaveAttribute('aria-busy', 'true');
    });

    it('has correct aria-label when retrying', () => {
      const onRetry = vi.fn();
      render(<IngestionError {...defaultProps} onRetry={onRetry} isRetrying={true} />);

      expect(screen.getByTestId('retry-button')).toHaveAttribute('aria-label', 'Retrying extraction');
    });

    it('has correct aria-label when not retrying', () => {
      const onRetry = vi.fn();
      render(<IngestionError {...defaultProps} onRetry={onRetry} isRetrying={false} />);

      expect(screen.getByTestId('retry-button')).toHaveAttribute('aria-label', 'Retry extraction');
    });
  });

  describe('Preserved Pillars', () => {
    const mockPillars = [
      { id: '1', title: 'Pillar One', coreClaim: 'Claim 1' },
      { id: '2', title: 'Pillar Two', coreClaim: 'Claim 2' },
      { id: '3', title: 'Pillar Three', coreClaim: 'Claim 3' },
    ];

    it('does not show preserved section when no pillars', () => {
      render(<IngestionError {...defaultProps} />);

      expect(screen.queryByText('Pillars Preserved')).not.toBeInTheDocument();
    });

    it('does not show preserved section for empty array', () => {
      render(<IngestionError {...defaultProps} pillarsPreserved={[]} />);

      expect(screen.queryByText('Pillars Preserved')).not.toBeInTheDocument();
    });

    it('shows preserved section when pillars exist', () => {
      render(<IngestionError {...defaultProps} pillarsPreserved={mockPillars as never} />);

      expect(screen.getByText('Pillars Preserved')).toBeInTheDocument();
    });

    it('displays correct pillar count', () => {
      render(<IngestionError {...defaultProps} pillarsPreserved={mockPillars as never} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows preservation message', () => {
      render(<IngestionError {...defaultProps} pillarsPreserved={mockPillars as never} />);

      expect(screen.getByText(/Previously extracted pillars have been saved/)).toBeInTheDocument();
    });
  });

  describe('Custom Error Messages', () => {
    it('displays custom error message', () => {
      render(<IngestionError error="Network connection lost" />);

      expect(screen.getByText('Network connection lost')).toBeInTheDocument();
    });

    it('displays long error message', () => {
      const longError = 'This is a very long error message that explains in detail what went wrong during the extraction process and provides helpful context for debugging.';
      render(<IngestionError error={longError} />);

      expect(screen.getByText(longError)).toBeInTheDocument();
    });
  });
});
