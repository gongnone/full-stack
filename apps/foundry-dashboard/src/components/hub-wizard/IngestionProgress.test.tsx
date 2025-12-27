import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { IngestionProgress } from './IngestionProgress';

// Mock trpc
const mockUseQuery = vi.fn();
const mockGetPillars = vi.fn();

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    hubs: {
      getExtractionProgress: {
        useQuery: (...args: any[]) => mockUseQuery(...args),
      },
      getPillars: {
        useQuery: (...args: any[]) => mockGetPillars(...args),
      },
    },
  },
}));

// Mock constants
vi.mock('@/lib/constants', () => ({
  POLLING_CONFIG: {
    DEFAULT_INTERVAL_MS: 2000,
  },
}));

describe('IngestionProgress', () => {
  const defaultProps = {
    sourceId: 'src-123',
    clientId: 'client-123',
    onComplete: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPillars.mockReturnValue({ data: undefined });
  });

  it('renders initial loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<IngestionProgress {...defaultProps} />);
    expect(screen.getByText('Initializing extraction...')).toBeInTheDocument();
  });

  it('renders progress stages and updates bar', () => {
    mockUseQuery.mockReturnValue({
      data: {
        status: 'processing',
        currentStage: 'themes',
        progress: 35,
        stageMessage: 'Identifying themes...',
      },
      isLoading: false,
    });

    render(<IngestionProgress {...defaultProps} />);

    expect(screen.getByText('Extracting Content Pillars')).toBeInTheDocument();
    expect(screen.getByText('Identifying themes...')).toBeInTheDocument();
    
    // Weighted progress for 'themes' (Parsing=10 + partial Themes)
    // Themes weight is 30. Progress 35 % 25 = 10. (10/25)*30 = 12. 10 + 12 = 22%
    expect(screen.getByText('22% complete')).toBeInTheDocument();
    
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '22%' });
  });

  it('shows completed stages with check icons', () => {
    mockUseQuery.mockReturnValue({
      data: {
        status: 'processing',
        currentStage: 'claims',
        progress: 60,
      },
      isLoading: false,
    });

    render(<IngestionProgress {...defaultProps} />);

    // Parsing and Themes should be complete
    const parsingStage = screen.getByTestId('stage-parsing');
    const themesStage = screen.getByTestId('stage-themes');
    
    // Check icons are rendered in completed stages
    expect(parsingStage.querySelector('svg')).toBeInTheDocument();
    expect(themesStage.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onComplete when status is completed and pillars are loaded', async () => {
    mockUseQuery.mockReturnValue({
      data: {
        status: 'completed',
        currentStage: 'pillars',
        progress: 100,
      },
      isLoading: false,
    });

    const mockPillars = [{ id: '1', title: 'Pillar 1', description: 'Desc' }];
    mockGetPillars.mockReturnValue({ data: mockPillars });

    render(<IngestionProgress {...defaultProps} />);

    expect(screen.getByText('Extraction Complete!')).toBeInTheDocument();
    expect(screen.getByText('1 pillars generated successfully')).toBeInTheDocument();
    expect(screen.getByText('100% complete')).toBeInTheDocument();

    await waitFor(() => {
      expect(defaultProps.onComplete).toHaveBeenCalledWith(mockPillars);
    });
  });

  it('calls onError when status is failed', () => {
    const errorMessage = 'Something went wrong';
    mockUseQuery.mockReturnValue({
      data: {
        status: 'failed',
        error: errorMessage,
      },
      isLoading: false,
    });

    render(<IngestionProgress {...defaultProps} />);

    expect(screen.getByText('Extraction Failed')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    expect(defaultProps.onError).toHaveBeenCalledWith(errorMessage);
  });
});
