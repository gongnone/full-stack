import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpokeTreeView } from './SpokeTreeView';

// Mock SpokeCard
vi.mock('./SpokeCard', () => ({
  SpokeCard: ({ spoke }: any) => <div data-testid={`spoke-${spoke.id}`}>{spoke.platform}</div>
}));

describe('SpokeTreeView', () => {
  const mockPillars = [
    { id: 'p1', title: 'Pillar 1', psychologicalAngle: 'Curiosity' },
    { id: 'p2', title: 'Pillar 2', psychologicalAngle: 'Fear' },
  ] as any[];

  const mockSpokes = [
    { id: 's1', pillar_id: 'p1', platform: 'twitter' },
    { id: 's2', pillar_id: 'p1', platform: 'linkedin' },
    { id: 's3', pillar_id: 'p2', platform: 'twitter' },
  ] as any[];

  const defaultProps = {
    hubTitle: 'Hub Test',
    pillars: mockPillars,
    spokes: mockSpokes,
    platformFilter: 'all' as const,
    onSpokeClick: vi.fn(),
  };

  it('renders hub title and stats', () => {
    render(<SpokeTreeView {...defaultProps} />);
    expect(screen.getByText('Hub Test')).toBeInTheDocument();
    expect(screen.getByText(/2 pillars/)).toBeInTheDocument();
    expect(screen.getByText(/3 spokes/)).toBeInTheDocument();
  });

  it('filters spokes by platform', () => {
    render(<SpokeTreeView {...defaultProps} platformFilter="linkedin" />);
    // Header stat should update - match the full header pattern to avoid ambiguity
    // with individual pillar counts
    expect(screen.getByText(/1 pillars.*1 spokes/)).toBeInTheDocument();
  });

  it('toggles pillar expansion', () => {
    render(<SpokeTreeView {...defaultProps} />);
    
    // Initially collapsed (no spokes visible)
    expect(screen.queryByTestId('spoke-s1')).not.toBeInTheDocument();
    
    // Click Pillar 1 header
    const p1Header = screen.getByText('Pillar 1').closest('button');
    fireEvent.click(p1Header!);
    
    // Spokes should appear
    expect(screen.getByTestId('spoke-s1')).toBeInTheDocument();
    expect(screen.getByTestId('spoke-s2')).toBeInTheDocument();
    // Pillar 2 spokes still hidden
    expect(screen.queryByTestId('spoke-s3')).not.toBeInTheDocument();
  });

  it('handles Expand All / Collapse All', () => {
    render(<SpokeTreeView {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Expand All'));
    expect(screen.getByTestId('spoke-s1')).toBeInTheDocument();
    expect(screen.getByTestId('spoke-s3')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Collapse All'));
    expect(screen.queryByTestId('spoke-s1')).not.toBeInTheDocument();
  });

  it('renders empty state when no spokes', () => {
    render(<SpokeTreeView {...defaultProps} spokes={[]} />);
    expect(screen.getByText('No spokes generated yet')).toBeInTheDocument();
  });
});
