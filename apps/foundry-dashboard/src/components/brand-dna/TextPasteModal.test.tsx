import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextPasteModal } from './TextPasteModal';

describe('TextPasteModal', () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  it('renders nothing when closed', () => {
    const { container } = render(
      <TextPasteModal isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders form when open', () => {
    render(<TextPasteModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Paste Content')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
  });

  it('validates input and submits', () => {
    render(<TextPasteModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    
    const titleInput = screen.getByLabelText('Title');
    const contentInput = screen.getByLabelText('Content');
    const submitBtn = screen.getByText('Add Sample');

    // Initially disabled
    expect(submitBtn).toBeDisabled();

    // Type content
    fireEvent.change(titleInput, { target: { value: 'My Post' } });
    fireEvent.change(contentInput, { target: { value: 'This is some sample content that is long enough.' } });

    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toHaveBeenCalledWith('My Post', 'This is some sample content that is long enough.');
  });

  it('shows submitting state', () => {
    render(
      <TextPasteModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
        isSubmitting={true} 
      />
    );
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeDisabled();
  });
});