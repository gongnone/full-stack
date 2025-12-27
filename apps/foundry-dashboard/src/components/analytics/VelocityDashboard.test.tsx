import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VelocityDashboard } from './VelocityDashboard';

const mockUseQuery = vi.fn();
const mockClientId = 'client-123';

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    analytics: {
      getVelocityTrend: {
        useQuery: (...args: any[]) => mockUseQuery(...args),
      },
    },
  },
}));

vi.mock('@/lib/use-client-id', () => ({
  useClientId: () => mockClientId,
}));

(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('VelocityDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    mockUseQuery.mockReturnValue({ isLoading: true });
    render(<VelocityDashboard />);
    expect(screen.getByText('Loading velocity data...')).toBeInTheDocument();
  });

  it('renders summary stats correctly', () => {
    mockUseQuery.mockReturnValue({
      data: {
        data: [
          { date: '2023-01-01', hubsCreated: 2, spokesGenerated: 10, spokesReviewed: 8, avgReviewTime: 30 },
          { date: '2023-01-02', hubsCreated: 3, spokesGenerated: 15, spokesReviewed: 12, avgReviewTime: 40 },
        ],
      },
      isLoading: false,
    });

    render(<VelocityDashboard />);

    expect(screen.getByText('Hubs Created')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // 2 + 3

    expect(screen.getByText('Spokes Generated')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument(); // 10 + 15

    expect(screen.getByText('Spokes Reviewed')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument(); // 8 + 12

    expect(screen.getByText('Review Rate')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument(); // 20 / 25

    expect(screen.getByText('Avg Review Time')).toBeInTheDocument();
    expect(screen.getByText('35s')).toBeInTheDocument(); // (30 + 40) / 2
  });
});