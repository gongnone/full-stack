/**
 * Story 3.4: HubCard - Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HubCard } from './HubCard';
import type { HubListItem } from '../../../worker/types';

// Mock @tanstack/react-router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    params: { hubId: string };
    className?: string;
    activeProps?: object;
  }) => (
    <a href={`${to.replace('$hubId', params.hubId)}`} className={className} data-testid="hub-link">
      {children}
    </a>
  ),
}));

describe('HubCard', () => {
  const mockHub: HubListItem = {
    id: 'hub-123',
    title: 'My Test Hub',
    sourceType: 'pdf',
    status: 'ready',
    pillarCount: 5,
    spokeCount: 25,
    createdAt: 1703980800, // Dec 31, 2023
  };

  describe('Rendering', () => {
    it('renders hub title', () => {
      render(<HubCard hub={mockHub} />);

      expect(screen.getByText('My Test Hub')).toBeInTheDocument();
    });

    it('renders as a link to hub detail page', () => {
      render(<HubCard hub={mockHub} />);

      const link = screen.getByTestId('hub-link');
      expect(link).toHaveAttribute('href', '/app/hubs/hub-123');
    });

    it('renders formatted date', () => {
      render(<HubCard hub={mockHub} />);

      // Timezone-agnostic: check date format pattern (Month Day, Year)
      expect(screen.getByText(/\w{3} \d{1,2}, \d{4}/)).toBeInTheDocument();
    });

    it('renders pillar count', () => {
      render(<HubCard hub={mockHub} />);

      expect(screen.getByText('5 pillars')).toBeInTheDocument();
    });

    it('renders spoke count', () => {
      render(<HubCard hub={mockHub} />);

      expect(screen.getByText('25 spokes')).toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('shows Ready badge for ready status', () => {
      render(<HubCard hub={{ ...mockHub, status: 'ready' }} />);

      expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    it('shows Processing badge for processing status', () => {
      render(<HubCard hub={{ ...mockHub, status: 'processing' }} />);

      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('shows Archived badge for archived status', () => {
      render(<HubCard hub={{ ...mockHub, status: 'archived' }} />);

      expect(screen.getByText('Archived')).toBeInTheDocument();
    });
  });

  describe('Source Type Icons', () => {
    it('renders PDF icon for pdf source type', () => {
      const { container } = render(<HubCard hub={{ ...mockHub, sourceType: 'pdf' }} />);

      // SVG icon is present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders text icon for text source type', () => {
      const { container } = render(<HubCard hub={{ ...mockHub, sourceType: 'text' }} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders URL icon for url source type', () => {
      const { container } = render(<HubCard hub={{ ...mockHub, sourceType: 'url' }} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero pillar and spoke counts', () => {
      render(<HubCard hub={{ ...mockHub, pillarCount: 0, spokeCount: 0 }} />);

      expect(screen.getByText('0 pillars')).toBeInTheDocument();
      expect(screen.getByText('0 spokes')).toBeInTheDocument();
    });

    it('handles long titles with truncation class', () => {
      const longTitle = 'This is a very long hub title that should be truncated in the UI';
      render(<HubCard hub={{ ...mockHub, title: longTitle }} />);

      const titleElement = screen.getByText(longTitle);
      expect(titleElement).toHaveClass('truncate');
    });
  });
});
