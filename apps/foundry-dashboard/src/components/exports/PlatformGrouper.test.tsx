/**
 * Story 6.2: PlatformGrouper - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlatformGrouper } from './PlatformGrouper';

describe('PlatformGrouper', () => {
  const mockTogglePlatform = vi.fn();
  const mockToggleGrouping = vi.fn();

  const defaultProps = {
    selectedPlatforms: [] as ('twitter' | 'linkedin' | 'tiktok' | 'instagram' | 'carousel' | 'thread' | 'youtube_thumbnail')[],
    onTogglePlatform: mockTogglePlatform,
    groupByPlatform: false,
    onToggleGrouping: mockToggleGrouping,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders Select Platforms label', () => {
      render(<PlatformGrouper {...defaultProps} />);

      expect(screen.getByText('Select Platforms')).toBeInTheDocument();
    });

    it('renders all platform options', () => {
      render(<PlatformGrouper {...defaultProps} />);

      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('TikTok')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('Carousel')).toBeInTheDocument();
      expect(screen.getByText('Thread')).toBeInTheDocument();
      expect(screen.getByText('YouTube')).toBeInTheDocument();
    });

    it('renders platform icons', () => {
      render(<PlatformGrouper {...defaultProps} />);

      expect(screen.getByText('X')).toBeInTheDocument(); // Twitter icon
      expect(screen.getByText('in')).toBeInTheDocument(); // LinkedIn icon
      expect(screen.getByText('TT')).toBeInTheDocument(); // TikTok icon
      expect(screen.getByText('IG')).toBeInTheDocument(); // Instagram icon
      expect(screen.getByText('C')).toBeInTheDocument(); // Carousel icon
      expect(screen.getByText('T')).toBeInTheDocument(); // Thread icon
      expect(screen.getByText('YT')).toBeInTheDocument(); // YouTube icon
    });

    it('renders Group by Platform toggle', () => {
      render(<PlatformGrouper {...defaultProps} />);

      expect(screen.getByText('Group by Platform')).toBeInTheDocument();
      expect(screen.getByTestId('group-by-platform-toggle')).toBeInTheDocument();
    });

    it('renders grouping description', () => {
      render(<PlatformGrouper {...defaultProps} />);

      expect(screen.getByText('Organize export into separate files per platform')).toBeInTheDocument();
    });
  });

  describe('Platform Selection', () => {
    it('calls onTogglePlatform when twitter clicked', () => {
      render(<PlatformGrouper {...defaultProps} />);

      fireEvent.click(screen.getByTestId('platform-twitter'));

      expect(mockTogglePlatform).toHaveBeenCalledWith('twitter');
    });

    it('calls onTogglePlatform when linkedin clicked', () => {
      render(<PlatformGrouper {...defaultProps} />);

      fireEvent.click(screen.getByTestId('platform-linkedin'));

      expect(mockTogglePlatform).toHaveBeenCalledWith('linkedin');
    });

    it('calls onTogglePlatform when tiktok clicked', () => {
      render(<PlatformGrouper {...defaultProps} />);

      fireEvent.click(screen.getByTestId('platform-tiktok'));

      expect(mockTogglePlatform).toHaveBeenCalledWith('tiktok');
    });

    it('calls onTogglePlatform when instagram clicked', () => {
      render(<PlatformGrouper {...defaultProps} />);

      fireEvent.click(screen.getByTestId('platform-instagram'));

      expect(mockTogglePlatform).toHaveBeenCalledWith('instagram');
    });
  });

  describe('Selected State', () => {
    it('applies selected styling to selected platforms', () => {
      render(
        <PlatformGrouper
          {...defaultProps}
          selectedPlatforms={['twitter', 'linkedin']}
        />
      );

      const twitterBtn = screen.getByTestId('platform-twitter');
      const linkedinBtn = screen.getByTestId('platform-linkedin');
      const tiktokBtn = screen.getByTestId('platform-tiktok');

      // Selected platforms should have edit color
      expect(twitterBtn).toHaveClass('border-[var(--edit)]');
      expect(linkedinBtn).toHaveClass('border-[var(--edit)]');
      // Unselected should have subtle border
      expect(tiktokBtn).toHaveClass('border-[var(--border-subtle)]');
    });
  });

  describe('Grouping Toggle', () => {
    it('calls onToggleGrouping with true when toggle clicked (was false)', () => {
      render(<PlatformGrouper {...defaultProps} groupByPlatform={false} />);

      fireEvent.click(screen.getByTestId('group-by-platform-toggle'));

      expect(mockToggleGrouping).toHaveBeenCalledWith(true);
    });

    it('calls onToggleGrouping with false when toggle clicked (was true)', () => {
      render(<PlatformGrouper {...defaultProps} groupByPlatform={true} />);

      fireEvent.click(screen.getByTestId('group-by-platform-toggle'));

      expect(mockToggleGrouping).toHaveBeenCalledWith(false);
    });

    it('shows active state when groupByPlatform is true', () => {
      render(<PlatformGrouper {...defaultProps} groupByPlatform={true} />);

      const toggle = screen.getByTestId('group-by-platform-toggle');
      expect(toggle).toHaveClass('bg-[var(--approve)]');
    });

    it('shows inactive state when groupByPlatform is false', () => {
      render(<PlatformGrouper {...defaultProps} groupByPlatform={false} />);

      const toggle = screen.getByTestId('group-by-platform-toggle');
      expect(toggle).toHaveClass('bg-[var(--bg-elevated)]');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <PlatformGrouper {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
