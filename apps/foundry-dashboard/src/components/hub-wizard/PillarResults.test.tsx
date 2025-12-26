import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PillarResults } from './PillarResults';

describe('PillarResults', () => {
  const mockPillars = [
    { id: '1', title: 'P1', coreClaim: 'C1', psychologicalAngle: 'Curiosity', estimatedSpokeCount: 5, supportingPoints: [] },
    { id: '2', title: 'P2', coreClaim: 'C2', psychologicalAngle: 'Fear', estimatedSpokeCount: 5, supportingPoints: [] },
    { id: '3', title: 'P3', coreClaim: 'C3', psychologicalAngle: 'Authority', estimatedSpokeCount: 5, supportingPoints: [] },
    { id: '4', title: 'P4', coreClaim: 'C4', psychologicalAngle: 'Urgency', estimatedSpokeCount: 5, supportingPoints: [] },
    { id: '5', title: 'P5', coreClaim: 'C5', psychologicalAngle: 'Rebellion', estimatedSpokeCount: 5, supportingPoints: [] },
  ] as any[];

  it('renders insufficient state when pillars < 5', () => {
    render(<PillarResults pillars={mockPillars.slice(0, 3)} />);
    expect(screen.getByText(/Insufficient Pillars Extracted/i)).toBeInTheDocument();
    expect(screen.getByText(/3 pillars found/i)).toBeInTheDocument();
  });

  it('renders pillar cards when valid', () => {
    render(<PillarResults pillars={mockPillars} />);
    expect(screen.getByText('Content Pillars')).toBeInTheDocument();
    expect(screen.getAllByTestId(/pillar-card-/)).toHaveLength(5);
  });

  it('handles inline editing in child card', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<PillarResults pillars={mockPillars} onPillarEdit={onEdit} />);

    // Find "Edit" button for first card
    const firstCard = screen.getByTestId('pillar-card-1');
    const editBtn = firstCard.querySelector('[data-testid="edit-pillar-btn"]');
    await user.click(editBtn!);

    // Edit inputs should appear
    const titleInput = screen.getByDisplayValue('P1');
    await user.clear(titleInput);
    await user.type(titleInput, 'P1 Updated');

    // Save
    await user.click(screen.getByText('Save'));

    expect(onEdit).toHaveBeenCalledWith('1', expect.objectContaining({ title: 'P1 Updated' }));
  });
});
