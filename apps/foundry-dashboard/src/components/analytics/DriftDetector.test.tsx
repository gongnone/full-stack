import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DriftDetector } from './DriftDetector';

const mockGetDriftHistory = vi.fn();
const mockGetTimeToDNA = vi.fn();
const mockClientId = 'client-123';

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    analytics: {
      getDriftHistory: {
        useQuery: (...args: any[]) => mockGetDriftHistory(...args),
      },
      getTimeToDNA: {
        useQuery: (...args: any[]) => mockGetTimeToDNA(...args),
      },
    },
  },
}));

vi.mock('@/lib/use-client-id', () => ({
  useClientId: () => mockClientId,
}));

vi.mock('@/lib/constants', () => ({
  ANALYTICS_CONFIG: { DEFAULT_PERIOD_DAYS: 30 },
  BRAND_DNA_CONFIG: { STRENGTH_THRESHOLDS: { STRONG: 80 } },
  UI_CONFIG: {
    CHART_COLORS: {
      PRIMARY: '#fff',
      DRIFT: '#f00',
      THRESHOLD: '#ccc',
    },
  },
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('DriftDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    mockGetDriftHistory.mockReturnValue({ isLoading: true });
    mockGetTimeToDNA.mockReturnValue({ data: null });
    render(<DriftDetector />);
    expect(screen.getByText('Loading drift analysis...')).toBeInTheDocument();
  });

  it('renders drift stats and alert if drift detected', () => {
    mockGetDriftHistory.mockReturnValue({
      data: {
        data: [
          { date: '2023-01-01', dnaStrength: 70, driftScore: 5, sampleCount: 10 },
          { date: '2023-01-02', dnaStrength: 75, driftScore: 25, sampleCount: 12 },
        ],
        currentStrength: 75,
        driftDetected: true,
        driftThreshold: 20,
      },
      isLoading: false,
    });

    mockGetTimeToDNA.mockReturnValue({
      data: { hubsToTarget: 5 },
    });

    render(<DriftDetector />);

    // Alert
    expect(screen.getByText('Voice Drift Detected')).toBeInTheDocument();

    // Stats
    expect(screen.getByText('DNA Strength')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();

    expect(screen.getByText('Avg Drift')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // (5+25)/2

    expect(screen.getByText('Hubs to DNA')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});