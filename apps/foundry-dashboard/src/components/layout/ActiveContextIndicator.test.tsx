import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActiveContextIndicator } from './ActiveContextIndicator';

const { mockClientQuery } = vi.hoisted(() => ({
  mockClientQuery: vi.fn(),
}));

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    clients: {
      getById: {
        useQuery: mockClientQuery,
      },
    },
  },
}));

vi.mock('@/lib/use-client-id', () => ({
  useClientId: vi.fn(),
}));

import { useClientId } from '@/lib/use-client-id';

describe('ActiveContextIndicator - Story 7-5: Active Context Indicator', () => {
  describe('AC1: Display Active Client in Header', () => {
    it('shows active client name and brand color in header', () => {
      vi.mocked(useClientId).mockReturnValue('client-1');
      mockClientQuery.mockReturnValue({
        data: {
          id: 'client-1',
          name: 'Acme Corp',
          brandColor: '#1D9BF0',
          status: 'active',
        },
        isLoading: false,
      });

      const { container } = render(<ActiveContextIndicator />);

      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Active Workspace')).toBeInTheDocument();

      // Check for brand color styling
      const brandIcon = container.querySelector('[style*="background-color"]');
      expect(brandIcon).toBeInTheDocument();
    });

    it('renders nothing when no client is active', () => {
      vi.mocked(useClientId).mockReturnValue(null);
      mockClientQuery.mockReturnValue({
        data: null,
        isLoading: false,
      });

      const { container } = render(<ActiveContextIndicator />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('AC2: Visual Active Indicator', () => {
    it('displays pulsing indicator to show active status', () => {
      vi.mocked(useClientId).mockReturnValue('client-1');
      mockClientQuery.mockReturnValue({
        data: {
          id: 'client-1',
          name: 'Acme Corp',
          brandColor: '#1D9BF0',
          status: 'active',
        },
        isLoading: false,
      });

      const { container } = render(<ActiveContextIndicator />);

      // Look for pulsing dot
      const pulsingDot = container.querySelector('.animate-pulse');
      expect(pulsingDot).toBeInTheDocument();
    });

    it('shows lightning icon to indicate active workspace', () => {
      vi.mocked(useClientId).mockReturnValue('client-1');
      mockClientQuery.mockReturnValue({
        data: {
          id: 'client-1',
          name: 'Acme Corp',
          brandColor: '#1D9BF0',
          status: 'active',
        },
        isLoading: false,
      });

      const { container } = render(<ActiveContextIndicator />);

      // Zap icon (lightning) should be present
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('AC3: Client Brand Integration', () => {
    it('uses client brand color for indicator styling', () => {
      vi.mocked(useClientId).mockReturnValue('client-1');
      mockClientQuery.mockReturnValue({
        data: {
          id: 'client-1',
          name: 'Acme Corp',
          brandColor: '#FF5733',
          status: 'active',
        },
        isLoading: false,
      });

      const { container } = render(<ActiveContextIndicator />);

      // The component should use the brand color in its styling
      const styledElements = container.querySelectorAll('[style*="background-color"]');
      expect(styledElements.length).toBeGreaterThan(0);
    });

    it('falls back to default color when brand color not set', () => {
      vi.mocked(useClientId).mockReturnValue('client-1');
      mockClientQuery.mockReturnValue({
        data: {
          id: 'client-1',
          name: 'Acme Corp',
          brandColor: null,
          status: 'active',
        },
        isLoading: false,
      });

      const { container } = render(<ActiveContextIndicator />);

      // Should still render with fallback color
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
  });

  describe('AC4: Responsive Display', () => {
    it('truncates long client names', () => {
      vi.mocked(useClientId).mockReturnValue('client-1');
      mockClientQuery.mockReturnValue({
        data: {
          id: 'client-1',
          name: 'Very Long Client Name That Should Be Truncated',
          brandColor: '#1D9BF0',
          status: 'active',
        },
        isLoading: false,
      });

      const { container } = render(<ActiveContextIndicator />);

      // Look for truncate class
      const nameElement = container.querySelector('.truncate');
      expect(nameElement).toBeInTheDocument();
      expect(nameElement?.textContent).toBe('Very Long Client Name That Should Be Truncated');
    });

    it('shows building icon for client identification', () => {
      vi.mocked(useClientId).mockReturnValue('client-1');
      mockClientQuery.mockReturnValue({
        data: {
          id: 'client-1',
          name: 'Acme Corp',
          brandColor: '#1D9BF0',
          status: 'active',
        },
        isLoading: false,
      });

      const { container } = render(<ActiveContextIndicator />);

      // Building2 icon should be present
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(2); // Building2 + Zap icons
    });
  });

  describe('AC5: Integration with Header', () => {
    it('renders within header context with proper styling', () => {
      vi.mocked(useClientId).mockReturnValue('client-1');
      mockClientQuery.mockReturnValue({
        data: {
          id: 'client-1',
          name: 'Acme Corp',
          brandColor: '#1D9BF0',
          status: 'active',
        },
        isLoading: false,
      });

      const { container } = render(<ActiveContextIndicator />);

      // Component should have border and elevated background
      const indicator = container.querySelector('.border');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('rounded-lg');
    });
  });
});
