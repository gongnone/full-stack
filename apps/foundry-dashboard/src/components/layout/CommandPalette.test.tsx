/**
 * Story 1.3: CommandPalette - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from './CommandPalette';

// Mock @tanstack/react-router
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

describe('CommandPalette', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByTestId('command-palette-search')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<CommandPalette {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('command-palette-search')).not.toBeInTheDocument();
    });

    it('renders search input with placeholder', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search commands...')).toBeInTheDocument();
    });

    it('renders ESC key hint', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('ESC')).toBeInTheDocument();
    });
  });

  describe('Navigation Commands', () => {
    it('renders Go to Dashboard command', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });

    it('renders Go to Hubs command', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('Go to Hubs')).toBeInTheDocument();
    });

    it('renders Go to Review command', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('Go to Review')).toBeInTheDocument();
    });

    it('renders Go to Clients command', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('Go to Clients')).toBeInTheDocument();
    });

    it('renders Go to Analytics command', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('Go to Analytics')).toBeInTheDocument();
    });

    it('renders Go to Settings command', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('Go to Settings')).toBeInTheDocument();
    });
  });

  describe('Action Commands', () => {
    it('renders Create New Hub command', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('Create New Hub')).toBeInTheDocument();
    });

    it('renders Start Sprint Review command', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('Start Sprint Review')).toBeInTheDocument();
    });
  });

  describe('Categories', () => {
    it('renders Navigation category', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });

    it('renders Actions category', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('shows G D shortcut for Dashboard', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('G D')).toBeInTheDocument();
    });

    it('shows G H shortcut for Hubs', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('G H')).toBeInTheDocument();
    });

    it('shows N H shortcut for Create New Hub', () => {
      render(<CommandPalette {...defaultProps} />);

      expect(screen.getByText('N H')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    it('filters commands based on search input', () => {
      render(<CommandPalette {...defaultProps} />);

      const searchInput = screen.getByTestId('command-palette-search');
      fireEvent.change(searchInput, { target: { value: 'dash' } });

      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Go to Hubs')).not.toBeInTheDocument();
    });

    it('shows No commands found when no matches', () => {
      render(<CommandPalette {...defaultProps} />);

      const searchInput = screen.getByTestId('command-palette-search');
      fireEvent.change(searchInput, { target: { value: 'nonexistent command xyz' } });

      expect(screen.getByText('No commands found')).toBeInTheDocument();
    });

    it('is case insensitive', () => {
      render(<CommandPalette {...defaultProps} />);

      const searchInput = screen.getByTestId('command-palette-search');
      fireEvent.change(searchInput, { target: { value: 'DASHBOARD' } });

      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });
  });

  describe('Command Execution', () => {
    it('navigates to dashboard when Go to Dashboard is clicked', () => {
      render(<CommandPalette {...defaultProps} />);

      fireEvent.click(screen.getByText('Go to Dashboard'));

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/app' });
    });

    it('navigates to hubs when Go to Hubs is clicked', () => {
      render(<CommandPalette {...defaultProps} />);

      fireEvent.click(screen.getByText('Go to Hubs'));

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/app/hubs' });
    });

    it('navigates to review when Go to Review is clicked', () => {
      render(<CommandPalette {...defaultProps} />);

      fireEvent.click(screen.getByText('Go to Review'));

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/app/review' });
    });

    it('calls onClose after command execution', () => {
      const onClose = vi.fn();
      render(<CommandPalette {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Go to Dashboard'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Backdrop Interaction', () => {
    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      const { container } = render(<CommandPalette {...defaultProps} onClose={onClose} />);

      // Click the overlay (first child with command-palette-overlay class)
      const overlay = container.querySelector('.command-palette-overlay');
      if (overlay) fireEvent.click(overlay);

      expect(onClose).toHaveBeenCalled();
    });

    it('does not close when modal content is clicked', () => {
      const onClose = vi.fn();
      render(<CommandPalette {...defaultProps} onClose={onClose} />);

      // Click the search input (inside modal)
      fireEvent.click(screen.getByTestId('command-palette-search'));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes on Escape key', () => {
      const onClose = vi.fn();
      render(<CommandPalette {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });

    it('executes command on Enter key and closes', () => {
      const onClose = vi.fn();
      render(<CommandPalette {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(mockNavigate).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('navigates down with ArrowDown', () => {
      render(<CommandPalette {...defaultProps} />);

      // First item should be selected initially
      // ArrowDown should move to second item
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'Enter' });

      // Second command is Go to Hubs
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/app/hubs' });
    });

    it('navigates up with ArrowUp', () => {
      render(<CommandPalette {...defaultProps} />);

      // Move down then back up
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      fireEvent.keyDown(document, { key: 'Enter' });

      // Should be back at first command (Dashboard)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/app' });
    });
  });
});
