import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZeroEditChart } from './ZeroEditChart';

// Mock mocks
const mockUseQuery = vi.fn();
const mockClientId = 'client-123';

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    analytics: {
      getZeroEditTrend: {
        useQuery: (...args: any[]) => mockUseQuery(...args),
      },
    },
  },
}));

vi.mock('@/lib/use-client-id', () => ({
  useClientId: () => mockClientId,
}));

// Mock constants
vi.mock('@/lib/constants', () => ({
  UI_CONFIG: {
    CHART_COLORS: { PRIMARY: '#fff' },
  },
  ANALYTICS_CONFIG: {
    DEFAULT_PERIOD_DAYS: 30,
    TREND_WINDOW_DAYS: 7,
  },
}));

// ResizeObserver mock
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('ZeroEditChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<ZeroEditChart />);
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('shows no data message when data is empty', () => {
    mockUseQuery.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });

    render(<ZeroEditChart />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders chart and metrics when data is available', () => {
    const mockData = {
      data: Array(30).fill(0).map((_, i) => ({
        date: new Date().toISOString(),
        rate: 70 + (i % 5),
        count: 10,
      })),
    };

    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
    });

    render(<ZeroEditChart />);

    expect(screen.getByText('Zero-Edit Rate Trend')).toBeInTheDocument();
    expect(screen.getByText(/Content approved without modifications/i)).toBeInTheDocument();
    
    // Check if current rate is displayed (may appear in multiple places)
    const lastRate = mockData.data[mockData.data.length - 1]!.rate.toFixed(1) + '%';
    expect(screen.getAllByText(lastRate).length).toBeGreaterThan(0);

    // Check stats footer
    expect(screen.getByText('Avg Rate')).toBeInTheDocument();
    expect(screen.getByText('Best Day')).toBeInTheDocument();
    expect(screen.getByText('Total Items')).toBeInTheDocument();
  });
});
