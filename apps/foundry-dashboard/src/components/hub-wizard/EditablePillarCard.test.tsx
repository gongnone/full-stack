import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditablePillarCard } from './EditablePillarCard';

// Mock Debounce constant to speed up tests
vi.mock('@/lib/constants', () => ({
  WIZARD_CONFIG: { DEBOUNCE_MS: 10 },
}));

describe('EditablePillarCard', () => {
  const mockPillar = {
    id: 'p1',
    title: 'Test Pillar',
    coreClaim: 'This is a claim',
    psychologicalAngle: 'Curiosity' as const,
    estimatedSpokeCount: 10,
    supportingPoints: ['Point A', 'Point B'],
  };

  const defaultProps = {
    pillar: mockPillar,
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<EditablePillarCard {...defaultProps} />);
    expect(screen.getByTestId('pillar-title-input')).toHaveValue('Test Pillar');
    expect(screen.getByTestId('pillar-claim-textarea')).toHaveValue('This is a claim');
    expect(screen.getByText('Curiosity')).toBeInTheDocument();
    expect(screen.getByText('~10')).toBeInTheDocument();
    expect(screen.getByText('Point A')).toBeInTheDocument();
  });

  it('updates title with debounce', async () => {
    const user = userEvent.setup();
    render(<EditablePillarCard {...defaultProps} />);

    const input = screen.getByTestId('pillar-title-input');
    await user.clear(input);
    await user.type(input, 'New Title');

    expect(input).toHaveValue('New Title');
    expect(screen.getByTestId('modified-badge')).toBeInTheDocument();

    // Wait for debounce (10ms mock + buffer)
    await waitFor(() => {
      expect(defaultProps.onUpdate).toHaveBeenCalledWith({ title: 'New Title' });
    }, { timeout: 100 });
  });

  it('updates angle via dropdown', async () => {
    const user = userEvent.setup();
    render(<EditablePillarCard {...defaultProps} />);

    // Open dropdown
    await user.click(screen.getByTestId('angle-dropdown-trigger'));
    expect(screen.getByTestId('angle-dropdown-menu')).toBeInTheDocument();

    // Select new angle
    await user.click(screen.getByText('Authority'));

    expect(screen.getByTestId('angle-dropdown-trigger')).toHaveTextContent('Authority');
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ psychologicalAngle: 'Authority' });
  });

  it('handles delete flow', async () => {
    const user = userEvent.setup();
    render(<EditablePillarCard {...defaultProps} />);

    // Click delete
    await user.click(screen.getByTestId('delete-pillar-btn'));

    // Check confirmation
    expect(screen.getByTestId('confirm-delete-btn')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-delete-btn')).toBeInTheDocument();

    // Confirm
    await user.click(screen.getByTestId('confirm-delete-btn'));
    expect(defaultProps.onDelete).toHaveBeenCalled();
  });

  it('cancels delete', async () => {
    const user = userEvent.setup();
    render(<EditablePillarCard {...defaultProps} />);

    await user.click(screen.getByTestId('delete-pillar-btn'));
    await user.click(screen.getByTestId('cancel-delete-btn'));

    expect(screen.queryByTestId('confirm-delete-btn')).not.toBeInTheDocument();
    expect(defaultProps.onDelete).not.toHaveBeenCalled();
  });

  it('disables delete when canDelete is false', () => {
    render(<EditablePillarCard {...defaultProps} canDelete={false} />);
    expect(screen.getByTestId('delete-pillar-btn')).toBeDisabled();
  });
});
