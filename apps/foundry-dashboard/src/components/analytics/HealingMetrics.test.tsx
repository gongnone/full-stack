/**
 * Story 8-3: Self-Healing Efficiency Metrics - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HealingMetrics } from './HealingMetrics';

// Mock tRPC
const { mockUseQuery, mockClientId } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
  mockClientId: 'client-123',
}));

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    analytics: {
      getHealingMetrics: {
        useQuery: mockUseQuery,
      },
    },
  },
}));

vi.mock('@/lib/use-client-id', () => ({
  useClientId: () => mockClientId,
}));

// ResizeObserver mock for recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('HealingMetrics - Story 8-3: Self-Healing Efficiency Metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading state while fetching data', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<HealingMetrics />);

      expect(screen.getByText('Self-Healing Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Loading metrics...')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows no data message when data is empty', () => {
      mockUseQuery.mockReturnValue({
        data: { data: [] },
        isLoading: false,
      });

      render(<HealingMetrics />);

      expect(screen.getByText('Self-Healing Efficiency')).toBeInTheDocument();
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('shows no data message when data is null', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<HealingMetrics />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    const mockData = {
      data: [
        { date: '2025-12-20', avgLoops: 2.1, successRate: 85, totalHeals: 42 },
        { date: '2025-12-21', avgLoops: 1.9, successRate: 88, totalHeals: 38 },
        { date: '2025-12-22', avgLoops: 1.7, successRate: 90, totalHeals: 45 },
        { date: '2025-12-23', avgLoops: 1.5, successRate: 92, totalHeals: 50 },
        { date: '2025-12-24', avgLoops: 1.4, successRate: 94, totalHeals: 55 },
      ],
      topFailureGates: [
        { gate: 'G2', count: 45 },
        { gate: 'G4', count: 32 },
        { gate: 'G5', count: 18 },
      ],
    };

    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        data: mockData,
        isLoading: false,
      });
    });

    it('renders the component title and description', () => {
      render(<HealingMetrics />);

      expect(screen.getByText('Self-Healing Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Automatic regeneration loop effectiveness')).toBeInTheDocument();
    });

    it('displays Avg Loops per Spoke stat', () => {
      render(<HealingMetrics />);

      expect(screen.getByText('Avg Loops per Spoke')).toBeInTheDocument();
      // Current loops is the last item's avgLoops (1.4)
      expect(screen.getByText('1.4')).toBeInTheDocument();
    });

    it('displays Success Rate stat', () => {
      render(<HealingMetrics />);

      expect(screen.getByText('Success Rate')).toBeInTheDocument();
      // Average success rate: (85+88+90+92+94)/5 = 89.8, rounded to 90%
      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText('Eventually passes')).toBeInTheDocument();
    });

    it('displays Total Heals stat', () => {
      render(<HealingMetrics />);

      expect(screen.getByText('Total Heals')).toBeInTheDocument();
      // Total: 42+38+45+50+55 = 230
      expect(screen.getByText('230')).toBeInTheDocument();
    });

    it('displays period days label', () => {
      render(<HealingMetrics periodDays={30} />);

      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('shows custom period days when provided', () => {
      render(<HealingMetrics periodDays={7} />);

      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    });

    it('shows loops per spoke trend chart section', () => {
      render(<HealingMetrics />);

      expect(screen.getByText('Loops per Spoke Trend (Lower is Better)')).toBeInTheDocument();
    });

    it('shows top healing triggers section when data exists', () => {
      render(<HealingMetrics />);

      expect(screen.getByText('Top Healing Triggers (by Gate)')).toBeInTheDocument();
    });

    it('calculates period average correctly', () => {
      render(<HealingMetrics />);

      // Period avg: (2.1+1.9+1.7+1.5+1.4)/5 = 1.72
      expect(screen.getByText('Period avg: 1.72')).toBeInTheDocument();
    });
  });

  describe('No Failure Gates', () => {
    it('hides top healing triggers when no failure gates data', () => {
      mockUseQuery.mockReturnValue({
        data: {
          data: [
            { date: '2025-12-24', avgLoops: 1.4, successRate: 94, totalHeals: 55 },
          ],
          topFailureGates: [],
        },
        isLoading: false,
      });

      render(<HealingMetrics />);

      expect(screen.queryByText('Top Healing Triggers (by Gate)')).not.toBeInTheDocument();
    });

    it('hides top healing triggers when topFailureGates is undefined', () => {
      mockUseQuery.mockReturnValue({
        data: {
          data: [
            { date: '2025-12-24', avgLoops: 1.4, successRate: 94, totalHeals: 55 },
          ],
        },
        isLoading: false,
      });

      render(<HealingMetrics />);

      expect(screen.queryByText('Top Healing Triggers (by Gate)')).not.toBeInTheDocument();
    });
  });

  describe('Query Configuration', () => {
    it('passes correct params to useQuery', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<HealingMetrics periodDays={14} />);

      expect(mockUseQuery).toHaveBeenCalledWith(
        { clientId: mockClientId, periodDays: 14 },
        { enabled: true }
      );
    });

    it('uses default periodDays of 30', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<HealingMetrics />);

      expect(mockUseQuery).toHaveBeenCalledWith(
        { clientId: mockClientId, periodDays: 30 },
        { enabled: true }
      );
    });
  });
});
