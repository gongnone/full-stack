import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeExtractor, ThemeExtractorWithError } from './ThemeExtractor';

// Mock trpc
const mockGetPillars = vi.fn();
const mockRetry = vi.fn();

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    hubs: {
      getPillars: { useQuery: (...args: any[]) => mockGetPillars(...args) },
      retryExtraction: { useMutation: () => ({ mutate: mockRetry }) },
    },
  },
}));

// Mock children
vi.mock('@/components/hub-wizard', () => ({
  IngestionProgress: ({ onComplete, onError }: any) => (
    <div data-testid="ingestion-progress">
      <button onClick={() => onComplete([{ id: 'p1', title: 'P1' }])}>Simulate Complete</button>
      <button onClick={() => onError('Extraction Failed')}>Simulate Error</button>
    </div>
  ),
  PillarDiscoveryList: ({ pillars }: any) => (
    <div data-testid="discovery-list">{pillars.length} pillars found</div>
  ),
  IngestionError: ({ error, onRetry }: any) => (
    <div data-testid="ingestion-error">
      <span>{error}</span>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

describe('ThemeExtractor', () => {
  const defaultProps = {
    sourceId: 's1',
    clientId: 'c1',
    onComplete: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPillars.mockReturnValue({ data: [], isLoading: false });
  });

  it('renders progress and discovery list', () => {
    mockGetPillars.mockReturnValue({ data: [{ id: 'p1' }], isLoading: false });
    render(<ThemeExtractor {...defaultProps} />);
    
    expect(screen.getByTestId('ingestion-progress')).toBeInTheDocument();
    expect(screen.getByText('1 pillars found')).toBeInTheDocument();
  });

  it('hides discovery list when prop set', () => {
    render(<ThemeExtractor {...defaultProps} showDiscoveryList={false} />);
    expect(screen.queryByTestId('discovery-list')).not.toBeInTheDocument();
  });

  it('propagates completion from child', () => {
    render(<ThemeExtractor {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Simulate Complete'));
    expect(defaultProps.onComplete).toHaveBeenCalledWith([{ id: 'p1', title: 'P1' }]);
  });

  it('propagates error from child', () => {
    render(<ThemeExtractor {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Simulate Error'));
    expect(defaultProps.onError).toHaveBeenCalledWith('Extraction Failed');
  });

  describe('ThemeExtractorWithError', () => {
    it('shows error component when error exists', () => {
      render(
        <ThemeExtractorWithError 
          {...defaultProps} 
          error="Fatal Error" 
          onRetry={vi.fn()} 
        />
      );
      
      expect(screen.getByTestId('ingestion-error')).toBeInTheDocument();
      expect(screen.getByText('Fatal Error')).toBeInTheDocument();
      expect(screen.queryByTestId('ingestion-progress')).not.toBeInTheDocument();
    });

    it('shows normal extractor when no error', () => {
      render(
        <ThemeExtractorWithError 
          {...defaultProps} 
          error={null} 
          onRetry={vi.fn()} 
        />
      );
      
      expect(screen.getByTestId('ingestion-progress')).toBeInTheDocument();
    });
  });
});
