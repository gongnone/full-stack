import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KillAnalytics } from './KillAnalytics';

const mockUseQuery = vi.fn();
const mockClientId = 'client-123';

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    analytics: {
      getKillChainTrend: {
        useQuery: (...args: any[]) => mockUseQuery(...args),
      },
    },
  },
}));

vi.mock('@/lib/use-client-id', () => ({
  useClientId: () => mockClientId,
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('KillAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    mockUseQuery.mockReturnValue({ isLoading: true });
    render(<KillAnalytics />);
    expect(screen.getByText('Loading kill analytics...')).toBeInTheDocument();
  });

  it('renders stats and trend', () => {
    // Need at least 7 days for trend calc in component logic (slice(0,7) and slice(-7))
    // We'll provide enough data
    const mockData = Array.from({ length: 14 }, (_, i) => ({
      date: `2023-01-${i + 1}`,
      totalKills: 10,
      hubKills: 2,
      spokeKills: 8,
    }));

    // Make last week slightly better (fewer kills) to test 'improving'
    for(let i=7; i<14; i++) {
        mockData[i].totalKills = 5;
    }

    mockUseQuery.mockReturnValue({
      data: {
        data: mockData,
        topReasons: [{ reason: 'Voice Mismatch', count: 50, percentage: 50 }],
      },
      isLoading: false,
    });

    render(<KillAnalytics />);

    expect(screen.getByText('Total Kills')).toBeInTheDocument();
    // First 7 days: 10*7 = 70. Last 7 days: 5*7 = 35. Total = 105.
    expect(screen.getByText('105')).toBeInTheDocument();

    expect(screen.getByText('Trend')).toBeInTheDocument();
    expect(screen.getByText(/↓ 50.0%/)).toBeInTheDocument(); // (5 - 10) / 10 = -0.5 -> 50% decrease (improving)

    expect(screen.getByText('Voice Mismatch')).toBeInTheDocument();
  });
});