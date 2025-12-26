/**
 * RecentSourcesList - Unit Tests
 * Tests loading, empty, and populated states for recent sources display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentSourcesList } from './RecentSourcesList';

// Mock trpc
const mockUseQuery = vi.fn();
vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    hubs: {
      getRecentSources: {
        useQuery: (...args: unknown[]) => mockUseQuery(...args),
      },
    },
  },
}));

describe('RecentSourcesList', () => {
  const defaultProps = {
    clientId: 'client-123',
    onSourceSelected: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('renders loading skeleton when loading', () => {
      mockUseQuery.mockReturnValue({ data: undefined, isLoading: true });
      const { container } = render(<RecentSourcesList {...defaultProps} />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(3);
    });
  });

  describe('Empty State', () => {
    it('shows empty state message when no sources', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false });
      render(<RecentSourcesList {...defaultProps} />);

      expect(screen.getByText('No recent sources')).toBeInTheDocument();
      expect(screen.getByText(/Upload a PDF, paste text/)).toBeInTheDocument();
    });
  });

  describe('Populated State', () => {
    const mockSources = [
      {
        id: 'source-1',
        title: 'Test Document',
        sourceType: 'pdf' as const,
        status: 'ready',
        wordCount: 1500,
        characterCount: 7500,
        createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      },
      {
        id: 'source-2',
        title: 'Pasted Text',
        sourceType: 'text' as const,
        status: 'ready',
        wordCount: 500,
        characterCount: 2500,
        createdAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
      },
      {
        id: 'source-3',
        title: 'Processing Source',
        sourceType: 'url' as const,
        status: 'pending',
        wordCount: 0,
        characterCount: 0,
        createdAt: Math.floor(Date.now() / 1000) - 60, // 1 min ago
      },
    ];

    beforeEach(() => {
      mockUseQuery.mockReturnValue({ data: mockSources, isLoading: false });
    });

    it('renders recent sources header', () => {
      render(<RecentSourcesList {...defaultProps} />);
      expect(screen.getByText('Recent Sources')).toBeInTheDocument();
    });

    it('displays source titles', () => {
      render(<RecentSourcesList {...defaultProps} />);
      expect(screen.getByText('Test Document')).toBeInTheDocument();
      expect(screen.getByText('Pasted Text')).toBeInTheDocument();
      expect(screen.getByText('Processing Source')).toBeInTheDocument();
    });

    it('formats word count correctly', () => {
      render(<RecentSourcesList {...defaultProps} />);
      expect(screen.getByText('1.5k words')).toBeInTheDocument();
      expect(screen.getByText('500 words')).toBeInTheDocument();
    });

    it('shows processing status for pending sources', () => {
      render(<RecentSourcesList {...defaultProps} />);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('calls onSourceSelected when clicking a source', () => {
      render(<RecentSourcesList {...defaultProps} />);

      fireEvent.click(screen.getByText('Test Document'));
      expect(defaultProps.onSourceSelected).toHaveBeenCalledWith('source-1', 'pdf');
    });

    it('disables pending sources', () => {
      render(<RecentSourcesList {...defaultProps} />);

      const pendingButton = screen.getByText('Processing Source').closest('button');
      expect(pendingButton).toBeDisabled();
    });

    it('disables all sources when disabled prop is true', () => {
      render(<RecentSourcesList {...defaultProps} disabled />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('renders data-testid for container', () => {
      render(<RecentSourcesList {...defaultProps} />);
      expect(screen.getByTestId('recent-sources')).toBeInTheDocument();
    });
  });

  describe('Query Configuration', () => {
    it('passes correct params to query', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false });
      render(<RecentSourcesList {...defaultProps} />);

      expect(mockUseQuery).toHaveBeenCalledWith(
        { clientId: 'client-123', limit: 3 },
        { enabled: true }
      );
    });

    it('disables query when clientId is empty', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false });
      render(<RecentSourcesList {...defaultProps} clientId="" />);

      expect(mockUseQuery).toHaveBeenCalledWith(
        { clientId: '', limit: 3 },
        { enabled: false }
      );
    });
  });
});
