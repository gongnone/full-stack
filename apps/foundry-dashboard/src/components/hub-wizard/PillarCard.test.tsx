/**
 * Story 3.1/3.3: PillarCard - Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PillarCard } from './PillarCard';
import type { Pillar, PsychologicalAngle } from './ExtractionProgress';

const mockPillar: Pillar = {
  id: 'pillar-123',
  title: 'Test Pillar Title',
  coreClaim: 'This is the core claim of the pillar explaining the key message.',
  psychologicalAngle: 'Authority' as PsychologicalAngle,
  estimatedSpokeCount: 5,
  supportingPoints: ['Point one', 'Point two', 'Point three', 'Point four'],
};

describe('PillarCard', () => {
  describe('Default Variant', () => {
    it('renders pillar title', () => {
      render(<PillarCard pillar={mockPillar} />);

      expect(screen.getByText('Test Pillar Title')).toBeInTheDocument();
    });

    it('renders psychological angle badge', () => {
      render(<PillarCard pillar={mockPillar} />);

      expect(screen.getByText('Authority')).toBeInTheDocument();
    });

    it('renders core claim', () => {
      render(<PillarCard pillar={mockPillar} />);

      expect(screen.getByText('This is the core claim of the pillar explaining the key message.')).toBeInTheDocument();
    });

    it('renders estimated spoke count with tilde', () => {
      render(<PillarCard pillar={mockPillar} />);

      expect(screen.getByText('~5')).toBeInTheDocument();
      expect(screen.getByText('spokes')).toBeInTheDocument();
    });

    it('renders Supporting Points header', () => {
      render(<PillarCard pillar={mockPillar} />);

      expect(screen.getByText('Supporting Points')).toBeInTheDocument();
    });

    it('renders first 3 supporting points', () => {
      render(<PillarCard pillar={mockPillar} />);

      expect(screen.getByText('Point one')).toBeInTheDocument();
      expect(screen.getByText('Point two')).toBeInTheDocument();
      expect(screen.getByText('Point three')).toBeInTheDocument();
    });

    it('shows +N more points text when more than 3', () => {
      render(<PillarCard pillar={mockPillar} />);

      expect(screen.getByText('+1 more points')).toBeInTheDocument();
    });

    it('uses correct testid', () => {
      render(<PillarCard pillar={mockPillar} />);

      expect(screen.getByTestId('pillar-card-pillar-123')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<PillarCard pillar={mockPillar} onClick={onClick} />);

      fireEvent.click(screen.getByTestId('pillar-card-pillar-123'));

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Compact Variant', () => {
    it('renders title in compact mode', () => {
      render(<PillarCard pillar={mockPillar} variant="compact" />);

      expect(screen.getByText('Test Pillar Title')).toBeInTheDocument();
    });

    it('renders angle badge in compact mode', () => {
      render(<PillarCard pillar={mockPillar} variant="compact" />);

      expect(screen.getByText('Authority')).toBeInTheDocument();
    });

    it('uses compact testid', () => {
      render(<PillarCard pillar={mockPillar} variant="compact" />);

      expect(screen.getByTestId('pillar-card-compact-pillar-123')).toBeInTheDocument();
    });

    it('does not show core claim in compact mode', () => {
      render(<PillarCard pillar={mockPillar} variant="compact" />);

      expect(screen.queryByText('This is the core claim of the pillar explaining the key message.')).not.toBeInTheDocument();
    });
  });

  describe('Discovery Variant', () => {
    it('renders title in discovery mode', () => {
      render(<PillarCard pillar={mockPillar} variant="discovery" />);

      expect(screen.getByText('Test Pillar Title')).toBeInTheDocument();
    });

    it('renders angle badge in discovery mode', () => {
      render(<PillarCard pillar={mockPillar} variant="discovery" />);

      expect(screen.getByText('Authority')).toBeInTheDocument();
    });

    it('renders truncated core claim in discovery mode', () => {
      render(<PillarCard pillar={mockPillar} variant="discovery" />);

      expect(screen.getByText('This is the core claim of the pillar explaining the key message.')).toBeInTheDocument();
    });

    it('shows supporting points count', () => {
      render(<PillarCard pillar={mockPillar} variant="discovery" />);

      expect(screen.getByText('4 supporting points')).toBeInTheDocument();
    });

    it('uses discovery testid', () => {
      render(<PillarCard pillar={mockPillar} variant="discovery" />);

      expect(screen.getByTestId('pillar-card-discovery-pillar-123')).toBeInTheDocument();
    });
  });

  describe('Psychological Angles', () => {
    const angles: PsychologicalAngle[] = [
      'Contrarian',
      'Authority',
      'Urgency',
      'Aspiration',
      'Fear',
      'Curiosity',
      'Transformation',
      'Rebellion',
    ];

    angles.forEach((angle) => {
      it(`renders ${angle} angle`, () => {
        render(<PillarCard pillar={{ ...mockPillar, psychologicalAngle: angle }} />);

        expect(screen.getByText(angle)).toBeInTheDocument();
      });
    });
  });

  describe('Without Supporting Points', () => {
    it('does not render supporting points section when empty', () => {
      render(<PillarCard pillar={{ ...mockPillar, supportingPoints: [] }} />);

      expect(screen.queryByText('Supporting Points')).not.toBeInTheDocument();
    });

    it('does not render supporting points section when undefined', () => {
      const pillarWithoutPoints = { ...mockPillar };
      delete (pillarWithoutPoints as Partial<Pillar>).supportingPoints;

      render(<PillarCard pillar={pillarWithoutPoints as Pillar} />);

      expect(screen.queryByText('Supporting Points')).not.toBeInTheDocument();
    });
  });

  describe('Animation Classes', () => {
    it('applies stagger animation by default', () => {
      const { container } = render(<PillarCard pillar={mockPillar} index={2} />);

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('animate-pillar-stagger-in');
      expect(card.className).toContain('pillar-stagger-2');
    });

    it('does not apply animation when isAnimated is false', () => {
      const { container } = render(<PillarCard pillar={mockPillar} isAnimated={false} />);

      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain('animate-pillar-stagger-in');
    });

    it('applies prune animation when isPruning is true', () => {
      const { container } = render(<PillarCard pillar={mockPillar} isPruning={true} />);

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('animate-pillar-prune');
    });
  });
});
