/**
 * Story 5.6: CloneSpokeModal - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CloneSpokeModal } from './CloneSpokeModal';

describe('CloneSpokeModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    spokeContent: 'This is a high-quality spoke content for cloning.',
    spokeScore: 8.5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      expect(screen.getByText('Clone Best')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<CloneSpokeModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Clone Best')).not.toBeInTheDocument();
    });

    it('displays spoke score', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      expect(screen.getByText('G7: 8.5')).toBeInTheDocument();
    });

    it('displays original spoke content', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      expect(screen.getByText('Original Spoke')).toBeInTheDocument();
      expect(screen.getByText(defaultProps.spokeContent)).toBeInTheDocument();
    });
  });

  describe('Variation Count Selection', () => {
    it('renders variation count buttons 1-5', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    });

    it('defaults to 3 variations selected', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      // Confirm button shows "Clone 3 Variations"
      expect(screen.getByRole('button', { name: /clone 3 variations/i })).toBeInTheDocument();
    });

    it('updates variation count when button clicked', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: '5' }));

      expect(screen.getByRole('button', { name: /clone 5 variations/i })).toBeInTheDocument();
    });

    it('shows singular "Variation" for count of 1', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: '1' }));

      expect(screen.getByRole('button', { name: /clone 1 variation$/i })).toBeInTheDocument();
    });
  });

  describe('Platform Selection', () => {
    it('renders LinkedIn platform option', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('renders X / Twitter platform option', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      expect(screen.getByText('X / Twitter')).toBeInTheDocument();
    });

    it('renders Threads platform option', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      expect(screen.getByText('Threads')).toBeInTheDocument();
    });

    it('defaults to LinkedIn selected', () => {
      const onConfirm = vi.fn();
      render(<CloneSpokeModal {...defaultProps} onConfirm={onConfirm} />);

      // Click confirm to check default selection
      fireEvent.click(screen.getByRole('button', { name: /clone 3 variations/i }));

      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ platforms: ['linkedin'] })
      );
    });

    it('allows toggling platforms', () => {
      const onConfirm = vi.fn();
      render(<CloneSpokeModal {...defaultProps} onConfirm={onConfirm} />);

      // Add Twitter
      fireEvent.click(screen.getByText('X / Twitter'));
      fireEvent.click(screen.getByRole('button', { name: /clone 3 variations/i }));

      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ platforms: expect.arrayContaining(['linkedin', 'twitter']) })
      );
    });

    it('disables confirm when no platforms selected', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      // Deselect LinkedIn (the default)
      fireEvent.click(screen.getByText('LinkedIn'));

      expect(screen.getByRole('button', { name: /clone 3 variations/i })).toBeDisabled();
    });
  });

  describe('Vary Angle Option', () => {
    it('renders vary angle checkbox', () => {
      render(<CloneSpokeModal {...defaultProps} />);

      expect(screen.getByText('Vary Psychological Angle')).toBeInTheDocument();
    });

    it('defaults to unchecked', () => {
      const onConfirm = vi.fn();
      render(<CloneSpokeModal {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByRole('button', { name: /clone 3 variations/i }));

      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ varyAngle: false })
      );
    });

    it('toggles when checkbox clicked', () => {
      const onConfirm = vi.fn();
      render(<CloneSpokeModal {...defaultProps} onConfirm={onConfirm} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      fireEvent.click(screen.getByRole('button', { name: /clone 3 variations/i }));

      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ varyAngle: true })
      );
    });
  });

  describe('Actions', () => {
    it('calls onClose when Cancel clicked', () => {
      const onClose = vi.fn();
      render(<CloneSpokeModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop clicked', () => {
      const onClose = vi.fn();
      const { container } = render(<CloneSpokeModal {...defaultProps} onClose={onClose} />);

      // Click the backdrop (the first div with bg-black/60)
      const backdrop = container.querySelector('.bg-black\\/60');
      if (backdrop) fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onConfirm with correct options', () => {
      const onConfirm = vi.fn();
      render(<CloneSpokeModal {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByRole('button', { name: '4' })); // 4 variations
      fireEvent.click(screen.getByText('Threads')); // Add Threads
      fireEvent.click(screen.getByRole('checkbox')); // Enable vary angle

      fireEvent.click(screen.getByRole('button', { name: /clone 4 variations/i }));

      expect(onConfirm).toHaveBeenCalledWith({
        variationCount: 4,
        platforms: ['linkedin', 'threads'],
        varyAngle: true,
      });
    });
  });

  describe('Loading State', () => {
    it('shows Generating... when loading', () => {
      render(<CloneSpokeModal {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });

    it('disables Cancel button when loading', () => {
      render(<CloneSpokeModal {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });

    it('disables Confirm button when loading', () => {
      render(<CloneSpokeModal {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled();
    });
  });
});
