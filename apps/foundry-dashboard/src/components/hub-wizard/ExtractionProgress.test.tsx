import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ExtractionProgress } from './ExtractionProgress';

// Mock trpc
const mockGetProgress = vi.fn();
const mockGetPillars = vi.fn();

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    hubs: {
      getExtractionProgress: {
        useQuery: (...args: any[]) => mockGetProgress(...args),
      },
      getPillars: {
        useQuery: (...args: any[]) => mockGetPillars(...args),
      },
    },
  },
}));

describe('ExtractionProgress', () => {
  const defaultProps = {
    sourceId: 'src-123',
    clientId: 'client-123',
    onComplete: vi.fn(),
    onRetry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPillars.mockReturnValue({ data: undefined });
  });

  it('shows loading spinner initially', () => {
    mockGetProgress.mockReturnValue({ isLoading: true });
    render(<ExtractionProgress {...defaultProps} />);
    expect(screen.getByText('Starting extraction...')).toBeInTheDocument();
  });

  it('displays current stage and progress', () => {
    mockGetProgress.mockReturnValue({
      data: {
        currentStage: 'themes',
        progress: 25,
        stageMessage: 'Finding themes',
        status: 'processing',
      },
      isLoading: false,
    });

    render(<ExtractionProgress {...defaultProps} />);

    expect(screen.getByText('Extracting Content Pillars')).toBeInTheDocument();
    expect(screen.getByText('Finding themes')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('triggers onComplete when finished', async () => {
    mockGetProgress.mockReturnValue({
      data: { status: 'completed', progress: 100 },
      isLoading: false,
    });
    
    const mockPillars = [{ id: 'p1', title: 'Pillar 1' }];
    mockGetPillars.mockReturnValue({ data: mockPillars });

    render(<ExtractionProgress {...defaultProps} />);

    expect(screen.getByText('Extraction Complete!')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(defaultProps.onComplete).toHaveBeenCalledWith(mockPillars);
    });
  });

  it('shows error state and retry button', () => {
    mockGetProgress.mockReturnValue({
      data: { status: 'failed', error: 'Server error' },
      isLoading: false,
    });

    render(<ExtractionProgress {...defaultProps} />);

    expect(screen.getByText('Extraction Failed')).toBeInTheDocument();
    expect(screen.getByText('Server error')).toBeInTheDocument();
    
    const retryBtn = screen.getByRole('button', { name: 'Try Again' });
    retryBtn.click();
    expect(defaultProps.onRetry).toHaveBeenCalled();
  });
});
