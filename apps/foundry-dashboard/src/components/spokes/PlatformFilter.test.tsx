/**
 * Story 4.1: PlatformFilter - Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlatformFilter } from './PlatformFilter';

describe('PlatformFilter', () => {
  const defaultProps = {
    value: 'all' as const,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders select element', () => {
      render(<PlatformFilter {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders all platform options', () => {
      render(<PlatformFilter {...defaultProps} />);

      expect(screen.getByText('All Platforms')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('TikTok')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('Newsletter')).toBeInTheDocument();
      expect(screen.getByText('Thread')).toBeInTheDocument();
      expect(screen.getByText('Carousel')).toBeInTheDocument();
    });

    it('shows correct number of options', () => {
      render(<PlatformFilter {...defaultProps} />);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(8);
    });
  });

  describe('Selected Value', () => {
    it('shows all as selected by default', () => {
      render(<PlatformFilter {...defaultProps} value="all" />);

      expect(screen.getByRole('combobox')).toHaveValue('all');
    });

    it('shows twitter as selected', () => {
      render(<PlatformFilter {...defaultProps} value="twitter" />);

      expect(screen.getByRole('combobox')).toHaveValue('twitter');
    });

    it('shows linkedin as selected', () => {
      render(<PlatformFilter {...defaultProps} value="linkedin" />);

      expect(screen.getByRole('combobox')).toHaveValue('linkedin');
    });
  });

  describe('onChange', () => {
    it('calls onChange with selected platform', () => {
      const onChange = vi.fn();
      render(<PlatformFilter {...defaultProps} onChange={onChange} />);

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'twitter' },
      });

      expect(onChange).toHaveBeenCalledWith('twitter');
    });

    it('calls onChange with all when selecting All Platforms', () => {
      const onChange = vi.fn();
      render(<PlatformFilter {...defaultProps} value="twitter" onChange={onChange} />);

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'all' },
      });

      expect(onChange).toHaveBeenCalledWith('all');
    });
  });

  describe('Spoke Counts', () => {
    it('displays count for platforms when provided', () => {
      const spokeCounts = {
        all: 100,
        twitter: 25,
        linkedin: 30,
        tiktok: 15,
      };

      render(<PlatformFilter {...defaultProps} spokeCounts={spokeCounts} />);

      expect(screen.getByText('All Platforms (100)')).toBeInTheDocument();
      expect(screen.getByText('Twitter (25)')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn (30)')).toBeInTheDocument();
      expect(screen.getByText('TikTok (15)')).toBeInTheDocument();
    });

    it('shows platforms without counts when count is undefined', () => {
      const spokeCounts = {
        twitter: 25,
      };

      render(<PlatformFilter {...defaultProps} spokeCounts={spokeCounts} />);

      expect(screen.getByText('Twitter (25)')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument(); // No count
    });

    it('shows 0 count', () => {
      const spokeCounts = {
        twitter: 0,
      };

      render(<PlatformFilter {...defaultProps} spokeCounts={spokeCounts} />);

      expect(screen.getByText('Twitter (0)')).toBeInTheDocument();
    });

    it('works without spokeCounts prop', () => {
      render(<PlatformFilter {...defaultProps} />);

      // All options should render without counts
      expect(screen.getByText('All Platforms')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });
  });
});
