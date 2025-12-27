import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PillarConfigurator } from './PillarConfigurator';

// Mock trpc
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockRestore = vi.fn();

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    hubs: {
      updatePillar: { useMutation: () => ({ mutate: mockUpdate }) },
      deletePillar: { useMutation: () => ({ mutate: mockDelete }) },
      restorePillar: { useMutation: () => ({ mutate: mockRestore }) },
    },
  },
}));

// Mock child components to simplify integration
vi.mock('@/components/hub-wizard', () => ({
  EditablePillarCard: ({ pillar, onUpdate, onDelete, canDelete }: any) => (
    <div data-testid={`pillar-${pillar.id}`}>
      <span>{pillar.title}</span>
      <button onClick={() => onUpdate({ title: 'Updated' })}>Simulate Update</button>
      <button onClick={onDelete} disabled={!canDelete} data-testid={`del-${pillar.id}`}>Simulate Delete</button>
    </div>
  ),
  UndoToast: ({ onUndo, onDismiss }: any) => (
    <div data-testid="undo-toast">
      <button onClick={onUndo}>Undo</button>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  ),
}));

describe('PillarConfigurator', () => {
  const mockPillars = [
    { id: '1', title: 'P1' },
    { id: '2', title: 'P2' },
    { id: '3', title: 'P3' },
    { id: '4', title: 'P4' },
  ] as any[];

  const defaultProps = {
    pillars: mockPillars,
    sourceId: 's1',
    clientId: 'c1',
    onPillarsChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all pillars', () => {
    render(<PillarConfigurator {...defaultProps} />);
    // Use specific pillar IDs to avoid matching pillar-configurator
    expect(screen.getByTestId('pillar-1')).toBeInTheDocument();
    expect(screen.getByTestId('pillar-2')).toBeInTheDocument();
    expect(screen.getByTestId('pillar-3')).toBeInTheDocument();
    expect(screen.getByTestId('pillar-4')).toBeInTheDocument();
  });

  it('handles update from child', () => {
    render(<PillarConfigurator {...defaultProps} />);

    // Trigger update on first pillar
    const updateButtons = screen.getAllByText('Simulate Update');
    fireEvent.click(updateButtons[0]);
    
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        pillarId: '1',
        title: 'Updated'
      }),
      expect.anything() // Options object with onError
    );
  });

  it('handles delete with undo flow', async () => {
    vi.useFakeTimers();
    render(<PillarConfigurator {...defaultProps} />);
    
    // Trigger delete
    fireEvent.click(screen.getByTestId('del-1'));
    
    // Fast forward animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Check UI updated optimistically
    expect(screen.queryByTestId('pillar-1')).not.toBeInTheDocument();
    
    // Check Undo Toast appeared
    expect(screen.getByTestId('undo-toast')).toBeInTheDocument();
    
    // Trigger Undo
    fireEvent.click(screen.getByText('Undo'));
    
    // Check restored
    expect(screen.getByTestId('pillar-1')).toBeInTheDocument();
    expect(mockRestore).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('enforces minimum pillar count', () => {
    const minPillars = mockPillars.slice(0, 3);
    render(<PillarConfigurator {...defaultProps} pillars={minPillars} minPillars={3} />);
    
    // Check delete buttons are disabled (passed to mock via canDelete)
    const delBtn = screen.getByTestId('del-1');
    expect(delBtn).toBeDisabled();
    
    expect(screen.getByText(/Minimum 3 pillars required/)).toBeInTheDocument();
  });
});
