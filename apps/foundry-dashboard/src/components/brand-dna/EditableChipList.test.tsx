/**
 * Story 2.5: EditableChipList - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableChipList } from './EditableChipList';

describe('EditableChipList', () => {
  const mockOnAdd = vi.fn();
  const mockOnRemove = vi.fn();

  const defaultProps = {
    items: ['TypeScript', 'React', 'Node.js'],
    onAdd: mockOnAdd,
    onRemove: mockOnRemove,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders input field with default placeholder', () => {
      render(<EditableChipList {...defaultProps} />);

      expect(screen.getByPlaceholderText('Type and press Enter to add...')).toBeInTheDocument();
    });

    it('renders input field with custom placeholder', () => {
      render(<EditableChipList {...defaultProps} placeholder="Add a skill..." />);

      expect(screen.getByPlaceholderText('Add a skill...')).toBeInTheDocument();
    });

    it('renders all chip items', () => {
      render(<EditableChipList {...defaultProps} />);

      expect(screen.getByTestId('chip-TypeScript')).toBeInTheDocument();
      expect(screen.getByTestId('chip-React')).toBeInTheDocument();
      expect(screen.getByTestId('chip-Node.js')).toBeInTheDocument();
    });

    it('shows remove button for each chip', () => {
      render(<EditableChipList {...defaultProps} />);

      expect(screen.getByLabelText('Remove TypeScript')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove React')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove Node.js')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no items', () => {
      render(<EditableChipList {...defaultProps} items={[]} />);

      expect(screen.getByText('No items yet. Add one above.')).toBeInTheDocument();
    });

    it('hides empty message when has items', () => {
      render(<EditableChipList {...defaultProps} />);

      expect(screen.queryByText('No items yet. Add one above.')).not.toBeInTheDocument();
    });
  });

  describe('Adding Items', () => {
    it('calls onAdd when Enter is pressed with input value', async () => {
      const user = userEvent.setup();
      render(<EditableChipList {...defaultProps} />);

      const input = screen.getByTestId('chip-input');
      await user.type(input, 'Vue{Enter}');

      expect(mockOnAdd).toHaveBeenCalledWith('Vue');
    });

    it('clears input after adding', async () => {
      const user = userEvent.setup();
      render(<EditableChipList {...defaultProps} />);

      const input = screen.getByTestId('chip-input');
      await user.type(input, 'Vue{Enter}');

      expect(input).toHaveValue('');
    });

    it('trims whitespace when adding', async () => {
      const user = userEvent.setup();
      render(<EditableChipList {...defaultProps} />);

      const input = screen.getByTestId('chip-input');
      await user.type(input, '  Angular  {Enter}');

      expect(mockOnAdd).toHaveBeenCalledWith('Angular');
    });

    it('does not add empty value', async () => {
      const user = userEvent.setup();
      render(<EditableChipList {...defaultProps} />);

      const input = screen.getByTestId('chip-input');
      await user.type(input, '   {Enter}');

      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('does not add on Enter when input is empty', async () => {
      const user = userEvent.setup();
      render(<EditableChipList {...defaultProps} />);

      const input = screen.getByTestId('chip-input');
      await user.type(input, '{Enter}');

      expect(mockOnAdd).not.toHaveBeenCalled();
    });
  });

  describe('Removing Items', () => {
    it('calls onRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditableChipList {...defaultProps} />);

      await user.click(screen.getByLabelText('Remove TypeScript'));

      expect(mockOnRemove).toHaveBeenCalledWith('TypeScript');
    });
  });

  describe('Character Counter', () => {
    it('shows character counter when typing', async () => {
      const user = userEvent.setup();
      render(<EditableChipList {...defaultProps} maxLength={50} />);

      const input = screen.getByTestId('chip-input');
      await user.type(input, 'Hello');

      expect(screen.getByText('5/50')).toBeInTheDocument();
    });

    it('hides character counter when input is empty', () => {
      render(<EditableChipList {...defaultProps} />);

      expect(screen.queryByText(/\/100/)).not.toBeInTheDocument();
    });

    it('limits input to maxLength', async () => {
      const user = userEvent.setup();
      render(<EditableChipList {...defaultProps} maxLength={5} />);

      const input = screen.getByTestId('chip-input');
      await user.type(input, 'HelloWorld');

      expect(input).toHaveValue('Hello');
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator', () => {
      render(<EditableChipList {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('disables input when loading', () => {
      render(<EditableChipList {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('chip-input')).toBeDisabled();
    });

    it('disables remove buttons when loading', () => {
      render(<EditableChipList {...defaultProps} isLoading={true} />);

      expect(screen.getByLabelText('Remove TypeScript')).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled', () => {
      render(<EditableChipList {...defaultProps} disabled={true} />);

      expect(screen.getByTestId('chip-input')).toBeDisabled();
    });

    it('disables remove buttons when disabled', () => {
      render(<EditableChipList {...defaultProps} disabled={true} />);

      expect(screen.getByLabelText('Remove TypeScript')).toBeDisabled();
    });
  });

  describe('Chip Colors', () => {
    it('applies blue chip style by default', () => {
      render(<EditableChipList {...defaultProps} />);

      const chip = screen.getByTestId('chip-TypeScript');
      expect(chip).toHaveStyle({ color: 'var(--edit)' });
    });

    it('applies red chip style', () => {
      render(<EditableChipList {...defaultProps} chipColor="red" />);

      const chip = screen.getByTestId('chip-TypeScript');
      expect(chip).toHaveStyle({ color: 'var(--kill)' });
    });

    it('applies green chip style', () => {
      render(<EditableChipList {...defaultProps} chipColor="green" />);

      const chip = screen.getByTestId('chip-TypeScript');
      expect(chip).toHaveStyle({ color: 'var(--approve)' });
    });
  });
});
