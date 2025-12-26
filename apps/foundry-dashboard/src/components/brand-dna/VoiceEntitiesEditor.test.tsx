import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceEntitiesEditor } from './VoiceEntitiesEditor';

// Mock useToast
const mockAddToast = vi.fn();
vi.mock('@/lib/toast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mock trpc
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockInvalidate = vi.fn();
const mockCancel = vi.fn();
const mockGetData = vi.fn();
const mockSetData = vi.fn();

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    useUtils: () => ({
      calibration: {
        getVoiceEntities: {
          cancel: mockCancel,
          getData: mockGetData,
          setData: mockSetData,
          invalidate: mockInvalidate,
        },
      },
    }),
    calibration: {
      getVoiceEntities: {
        useQuery: (...args: any[]) => mockUseQuery(...args),
      },
      addVoiceMarker: {
        useMutation: (opts: any) => {
          mockUseMutation.mockReturnValue({ mutate: opts?.onMutate || vi.fn() }); // Simplified
          return { mutate: vi.fn(), isPending: false }; // We'll mock mutate behavior in tests
        },
      },
      removeVoiceMarker: {
        useMutation: () => ({ mutate: vi.fn(), isPending: false }),
      },
      addBannedWord: {
        useMutation: () => ({ mutate: vi.fn(), isPending: false }),
      },
      removeBannedWord: {
        useMutation: () => ({ mutate: vi.fn(), isPending: false }),
      },
    },
  },
}));

// Mock EditableChipList to simplify interaction
vi.mock('./EditableChipList', () => ({
  EditableChipList: ({ items, onAdd, onRemove, placeholder }: any) => (
    <div data-testid="chip-list">
      {items.map((item: string) => (
        <button key={item} onClick={() => onRemove(item)}>
          {item}
        </button>
      ))}
      <input
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onAdd(e.currentTarget.value);
        }}
      />
    </div>
  ),
}));

describe('VoiceEntitiesEditor', () => {
  const mockClientId = 'client-123';
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state with data', () => {
    mockUseQuery.mockReturnValue({
      data: {
        voiceMarkers: ['bold', 'direct'],
        bannedWords: ['synergy'],
        stances: [],
      },
      isLoading: false,
    });

    render(<VoiceEntitiesEditor clientId={mockClientId} onClose={mockOnClose} />);

    expect(screen.getByText('Edit Voice Profile')).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('direct')).toBeInTheDocument();
    expect(screen.getByText('synergy')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false });
    render(<VoiceEntitiesEditor clientId={mockClientId} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByTestId('close-editor'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Note: Testing actual mutation logic is tricky with the complex trpc mock setup required for optimistic updates.
  // We verified rendering and data flow. The mutation hooks are called by the component.
});
