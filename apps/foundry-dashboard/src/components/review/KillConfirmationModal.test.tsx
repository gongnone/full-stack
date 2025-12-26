/**
 * Story 5.3: KillConfirmationModal - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KillConfirmationModal } from './KillConfirmationModal';

describe('KillConfirmationModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    type: 'hub' as const,
    title: 'Test Hub Title',
    spokeCount: 25,
    editedCount: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Closed State', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <KillConfirmationModal {...defaultProps} isOpen={false} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Open State', () => {
    it('renders modal when isOpen is true', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      expect(screen.getByText('Kill Hub?')).toBeInTheDocument();
    });

    it('renders title', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      expect(screen.getByText('Test Hub Title')).toBeInTheDocument();
    });

    it('shows total spoke count', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      expect(screen.getByText('Total spokes')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('shows spokes to be discarded', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      expect(screen.getByText('Will be discarded')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument(); // 25 - 5 = 20
    });

    it('shows protected edited count', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      expect(screen.getByText('Protected (edited)')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('hides protected count when editedCount is 0', () => {
      render(<KillConfirmationModal {...defaultProps} editedCount={0} />);

      expect(screen.queryByText('Protected (edited)')).not.toBeInTheDocument();
    });
  });

  describe('Hub vs Pillar Type', () => {
    it('shows Kill Hub? for hub type', () => {
      render(<KillConfirmationModal {...defaultProps} type="hub" />);

      expect(screen.getByText('Kill Hub?')).toBeInTheDocument();
    });

    it('shows Kill Pillar? for pillar type', () => {
      render(<KillConfirmationModal {...defaultProps} type="pillar" />);

      expect(screen.getByText('Kill Pillar?')).toBeInTheDocument();
    });
  });

  describe('Warning Message', () => {
    it('shows note about edited spokes surviving', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      expect(screen.getByText(/Edited spokes will survive/)).toBeInTheDocument();
    });

    it('shows undo time window', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      expect(screen.getByText(/Can be undone within 30 seconds/)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('renders Cancel button', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders Confirm Kill button', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Confirm Kill' })).toBeInTheDocument();
    });

    it('calls onClose when Cancel clicked', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onConfirm when Confirm Kill clicked', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Confirm Kill' }));

      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it('calls onClose when backdrop clicked', () => {
      render(<KillConfirmationModal {...defaultProps} />);

      // Click the backdrop (first child of the fixed container)
      const backdrop = document.querySelector('.bg-black\\/60');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Loading State', () => {
    it('shows Killing... text when loading', () => {
      render(<KillConfirmationModal {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: 'Killing...' })).toBeInTheDocument();
    });

    it('disables buttons when loading', () => {
      render(<KillConfirmationModal {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Killing...' })).toBeDisabled();
    });
  });
});
