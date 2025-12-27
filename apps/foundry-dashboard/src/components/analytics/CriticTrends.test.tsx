import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CriticTrends } from './CriticTrends';

// Mock trpc
const mockUseQuery = vi.fn();
const mockClientId = 'client-123';

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    analytics: {
      getCriticPassTrend: {
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
    CHART_COLORS: {
      G2: '#FF0000',
      G4: '#00FF00',
      G5: '#0000FF',
      G7: '#FFFF00',
    },
  },
  ANALYTICS_CONFIG: {
    DEFAULT_PERIOD_DAYS: 30,
  },
}));

// ResizeObserver mock
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CriticTrends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<CriticTrends />);
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('shows no data message when data is empty', () => {
    mockUseQuery.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });

    render(<CriticTrends />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders chart and gate cards when data is available', () => {
    const mockData = {
      data: [
        { date: '2023-01-01', g2: 80, g4: 85, g5: 90, g7: 75 },
        { date: '2023-01-02', g2: 82, g4: 87, g5: 92, g7: 78 },
      ],
    };

    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
    });

    render(<CriticTrends />);

    expect(screen.getByText('Critic Pass Rate Trends')).toBeInTheDocument();
    expect(screen.getByText(/First-pass approval rates by quality gate/i)).toBeInTheDocument();
    
    // Check gate cards (latest values)
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('87%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    
    // Check gate labels in cards (Legend is SVG-based, not visible to Testing Library)
    expect(screen.getByText('G2 Hook')).toBeInTheDocument();
    expect(screen.getByText('G4 Voice')).toBeInTheDocument();
    expect(screen.getByText('G5 Platform')).toBeInTheDocument();
    expect(screen.getByText('G7 Predicted')).toBeInTheDocument();
  });
});
