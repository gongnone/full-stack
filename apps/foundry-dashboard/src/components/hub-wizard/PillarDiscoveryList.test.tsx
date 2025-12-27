/**
 * Story 3.5: PillarDiscoveryList - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PillarDiscoveryList } from './PillarDiscoveryList';
import type { Pillar, PsychologicalAngle } from './ExtractionProgress';

describe('PillarDiscoveryList', () => {
  const createPillar = (overrides: Partial<Pillar> = {}): Pillar => ({
    id: `pillar-${Math.random().toString(36).slice(2)}`,
    title: 'Test Pillar Title',
    coreClaim: 'This is the core claim for this pillar.',
    psychologicalAngle: 'Authority' as PsychologicalAngle,
    estimatedSpokeCount: 5,
    supportingPoints: ['Point 1', 'Point 2', 'Point 3'],
    ...overrides,
  });

  const mockPillars: Pillar[] = [
    createPillar({ id: 'p1', title: 'Content Strategy', psychologicalAngle: 'Authority' }),
    createPillar({ id: 'p2', title: 'Brand Voice', psychologicalAngle: 'Aspiration' }),
    createPillar({ id: 'p3', title: 'Audience Engagement', psychologicalAngle: 'Curiosity' }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading state when loading with no pillars', () => {
      render(<PillarDiscoveryList pillars={[]} isLoading={true} />);

      expect(screen.getByText('Discovering content pillars...')).toBeInTheDocument();
    });

    it('renders testid container in loading state', () => {
      render(<PillarDiscoveryList pillars={[]} isLoading={true} />);

      expect(screen.getByTestId('pillar-discovery-list')).toBeInTheDocument();
    });

    it('shows animated dots in loading state', () => {
      const { container } = render(<PillarDiscoveryList pillars={[]} isLoading={true} />);

      const bouncingDots = container.querySelectorAll('.animate-bounce');
      expect(bouncingDots.length).toBe(3);
    });
  });

  describe('Pillars List', () => {
    it('renders testid container with pillars', () => {
      render(<PillarDiscoveryList pillars={mockPillars} />);

      expect(screen.getByTestId('pillar-discovery-list')).toBeInTheDocument();
    });

    it('renders Pillars Discovered header', () => {
      render(<PillarDiscoveryList pillars={mockPillars} />);

      expect(screen.getByText('Pillars Discovered')).toBeInTheDocument();
    });

    it('displays pillar count badge', () => {
      render(<PillarDiscoveryList pillars={mockPillars} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders all pillar titles', () => {
      render(<PillarDiscoveryList pillars={mockPillars} />);

      expect(screen.getByText('Content Strategy')).toBeInTheDocument();
      expect(screen.getByText('Brand Voice')).toBeInTheDocument();
      expect(screen.getByText('Audience Engagement')).toBeInTheDocument();
    });

    it('renders pillar core claims', () => {
      render(<PillarDiscoveryList pillars={mockPillars} />);

      // All pillars have same coreClaim in mock
      const claimElements = screen.getAllByText('This is the core claim for this pillar.');
      expect(claimElements.length).toBe(3);
    });

    it('renders pillar item testids', () => {
      render(<PillarDiscoveryList pillars={mockPillars} />);

      expect(screen.getByTestId('pillar-discovery-item-p1')).toBeInTheDocument();
      expect(screen.getByTestId('pillar-discovery-item-p2')).toBeInTheDocument();
      expect(screen.getByTestId('pillar-discovery-item-p3')).toBeInTheDocument();
    });
  });

  describe('Psychological Angle Badges', () => {
    it('renders Authority badge', () => {
      render(<PillarDiscoveryList pillars={mockPillars} />);

      expect(screen.getByText('Authority')).toBeInTheDocument();
    });

    it('renders Aspiration badge', () => {
      render(<PillarDiscoveryList pillars={mockPillars} />);

      expect(screen.getByText('Aspiration')).toBeInTheDocument();
    });

    it('renders Curiosity badge', () => {
      render(<PillarDiscoveryList pillars={mockPillars} />);

      expect(screen.getByText('Curiosity')).toBeInTheDocument();
    });

    it('renders all angle types correctly', () => {
      const allAnglePillars: Pillar[] = [
        createPillar({ id: '1', psychologicalAngle: 'Contrarian' }),
        createPillar({ id: '2', psychologicalAngle: 'Urgency' }),
        createPillar({ id: '3', psychologicalAngle: 'Fear' }),
        createPillar({ id: '4', psychologicalAngle: 'Transformation' }),
        createPillar({ id: '5', psychologicalAngle: 'Rebellion' }),
      ];

      render(<PillarDiscoveryList pillars={allAnglePillars} />);

      expect(screen.getByText('Contrarian')).toBeInTheDocument();
      expect(screen.getByText('Urgency')).toBeInTheDocument();
      expect(screen.getByText('Fear')).toBeInTheDocument();
      expect(screen.getByText('Transformation')).toBeInTheDocument();
      expect(screen.getByText('Rebellion')).toBeInTheDocument();
    });
  });

  describe('Supporting Points', () => {
    it('shows supporting points count when available', () => {
      render(<PillarDiscoveryList pillars={mockPillars} />);

      const pointsElements = screen.getAllByText('3 supporting points');
      expect(pointsElements.length).toBe(3);
    });

    it('does not show supporting points section when empty', () => {
      const pillarNoPoints = createPillar({ id: 'no-points', supportingPoints: [] });

      render(<PillarDiscoveryList pillars={[pillarNoPoints]} />);

      expect(screen.queryByText(/supporting points/)).not.toBeInTheDocument();
    });
  });

  describe('Loading More Pillars', () => {
    it('shows more pillars indicator when loading with existing pillars', () => {
      render(<PillarDiscoveryList pillars={mockPillars} isLoading={true} />);

      expect(screen.getByText('Discovering more pillars...')).toBeInTheDocument();
    });

    it('does not show more pillars indicator when not loading', () => {
      render(<PillarDiscoveryList pillars={mockPillars} isLoading={false} />);

      expect(screen.queryByText('Discovering more pillars...')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders header with zero count when no pillars and not loading', () => {
      render(<PillarDiscoveryList pillars={[]} isLoading={false} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Pillars Discovered')).toBeInTheDocument();
    });
  });

  describe('Single Pillar', () => {
    it('handles single pillar correctly', () => {
      const singlePillar = [createPillar({ id: 'single', title: 'Only Pillar' })];

      render(<PillarDiscoveryList pillars={singlePillar} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Only Pillar')).toBeInTheDocument();
    });
  });
});
