/**
 * Story 5.1: BucketCard - Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BucketCard } from './BucketCard';

// Mock @tanstack/react-router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, search, className }: {
    children: React.ReactNode;
    to: string;
    search: { filter: string };
    className: string;
  }) => (
    <a
      href={`${to}?filter=${search.filter}`}
      className={className}
      data-testid="bucket-link"
    >
      {children}
    </a>
  ),
}));

describe('BucketCard', () => {
  const defaultProps = {
    title: 'High Confidence',
    count: 24,
    description: 'Ready to approve with minimal review',
    filter: 'high-confidence' as const,
    variant: 'green' as const,
  };

  describe('Rendering', () => {
    it('renders title', () => {
      render(<BucketCard {...defaultProps} />);

      expect(screen.getByText('High Confidence')).toBeInTheDocument();
    });

    it('renders count', () => {
      render(<BucketCard {...defaultProps} />);

      expect(screen.getByText('24')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<BucketCard {...defaultProps} />);

      expect(screen.getByText('Ready to approve with minimal review')).toBeInTheDocument();
    });

    it('renders Start Sprint link text', () => {
      render(<BucketCard {...defaultProps} />);

      expect(screen.getByText('Start Sprint')).toBeInTheDocument();
    });

    it('links to review page with filter', () => {
      render(<BucketCard {...defaultProps} />);

      const link = screen.getByTestId('bucket-link');
      expect(link).toHaveAttribute('href', '/app/review?filter=high-confidence');
    });
  });

  describe('Variant Styles', () => {
    it('applies green variant styles', () => {
      render(<BucketCard {...defaultProps} variant="green" />);

      const link = screen.getByTestId('bucket-link');
      expect(link).toHaveClass('border-[var(--approve)]');
    });

    it('applies yellow variant styles', () => {
      render(<BucketCard {...defaultProps} variant="yellow" />);

      const link = screen.getByTestId('bucket-link');
      expect(link).toHaveClass('border-[var(--warning)]');
    });

    it('applies red variant styles', () => {
      render(<BucketCard {...defaultProps} variant="red" />);

      const link = screen.getByTestId('bucket-link');
      expect(link).toHaveClass('border-[var(--kill)]');
    });

    it('applies blue variant styles', () => {
      render(<BucketCard {...defaultProps} variant="blue" />);

      const link = screen.getByTestId('bucket-link');
      expect(link).toHaveClass('border-[var(--edit)]');
    });
  });

  describe('Filter Values', () => {
    it('uses needs-review filter', () => {
      render(<BucketCard {...defaultProps} filter="needs-review" />);

      const link = screen.getByTestId('bucket-link');
      expect(link).toHaveAttribute('href', '/app/review?filter=needs-review');
    });

    it('uses conflicts filter', () => {
      render(<BucketCard {...defaultProps} filter="conflicts" />);

      const link = screen.getByTestId('bucket-link');
      expect(link).toHaveAttribute('href', '/app/review?filter=conflicts');
    });

    it('uses just-generated filter', () => {
      render(<BucketCard {...defaultProps} filter="just-generated" />);

      const link = screen.getByTestId('bucket-link');
      expect(link).toHaveAttribute('href', '/app/review?filter=just-generated');
    });
  });

  describe('Different Counts', () => {
    it('shows zero count', () => {
      render(<BucketCard {...defaultProps} count={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('shows large count', () => {
      render(<BucketCard {...defaultProps} count={999} />);

      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });
});
