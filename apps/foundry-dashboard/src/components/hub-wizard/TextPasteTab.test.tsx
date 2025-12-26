/**
 * Story 3.1: TextPasteTab - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TextPasteTab } from './TextPasteTab';

// Mock tRPC
const mockMutateAsync = vi.fn();
vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    hubs: {
      createTextSource: {
        useMutation: () => ({
          mutateAsync: mockMutateAsync,
        }),
      },
    },
  },
}));

describe('TextPasteTab', () => {
  const defaultProps = {
    clientId: 'client-123',
    onSourceCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({ sourceId: 'source-456' });
  });

  describe('Rendering', () => {
    it('renders title input', () => {
      render(<TextPasteTab {...defaultProps} />);

      expect(screen.getByTestId('text-title')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it('renders content textarea', () => {
      render(<TextPasteTab {...defaultProps} />);

      expect(screen.getByTestId('text-paste-textarea')).toBeInTheDocument();
      expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    });

    it('renders character count', () => {
      render(<TextPasteTab {...defaultProps} />);

      expect(screen.getByTestId('char-count')).toBeInTheDocument();
      expect(screen.getByText(/0.*\/.*100.*min characters/i)).toBeInTheDocument();
    });

    it('renders word count', () => {
      render(<TextPasteTab {...defaultProps} />);

      expect(screen.getByText('0 words')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<TextPasteTab {...defaultProps} />);

      expect(screen.getByRole('button', { name: /use this content/i })).toBeInTheDocument();
    });
  });

  describe('Character/Word Count', () => {
    it('updates character count as user types', () => {
      render(<TextPasteTab {...defaultProps} />);

      const textarea = screen.getByTestId('text-paste-textarea');
      fireEvent.change(textarea, { target: { value: 'Hello world' } });

      expect(screen.getByText(/11.*\/.*100/)).toBeInTheDocument();
    });

    it('updates word count as user types', () => {
      render(<TextPasteTab {...defaultProps} />);

      const textarea = screen.getByTestId('text-paste-textarea');
      fireEvent.change(textarea, { target: { value: 'Hello world test' } });

      expect(screen.getByText('3 words')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('disables submit button when content is empty', () => {
      render(<TextPasteTab {...defaultProps} />);

      expect(screen.getByRole('button', { name: /use this content/i })).toBeDisabled();
    });

    it('disables submit button when content is below minimum', () => {
      render(<TextPasteTab {...defaultProps} />);

      const textarea = screen.getByTestId('text-paste-textarea');
      fireEvent.change(textarea, { target: { value: 'Short text' } });

      expect(screen.getByRole('button', { name: /use this content/i })).toBeDisabled();
    });

    it('enables submit button when content meets minimum (100 chars)', () => {
      render(<TextPasteTab {...defaultProps} />);

      const textarea = screen.getByTestId('text-paste-textarea');
      const validContent = 'a'.repeat(100);
      fireEvent.change(textarea, { target: { value: validContent } });

      expect(screen.getByRole('button', { name: /use this content/i })).not.toBeDisabled();
    });
  });

  describe('Submission', () => {
    it('calls createTextSource on submit', async () => {
      render(<TextPasteTab {...defaultProps} />);

      const textarea = screen.getByTestId('text-paste-textarea');
      const validContent = 'a'.repeat(100);
      fireEvent.change(textarea, { target: { value: validContent } });

      const submitBtn = screen.getByRole('button', { name: /use this content/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          clientId: 'client-123',
          content: validContent,
          title: 'Untitled',
        });
      });
    });

    it('uses custom title when provided', async () => {
      render(<TextPasteTab {...defaultProps} />);

      const titleInput = screen.getByTestId('text-title');
      fireEvent.change(titleInput, { target: { value: 'My Custom Title' } });

      const textarea = screen.getByTestId('text-paste-textarea');
      fireEvent.change(textarea, { target: { value: 'a'.repeat(100) } });

      const submitBtn = screen.getByRole('button', { name: /use this content/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'My Custom Title' })
        );
      });
    });

    it('calls onSourceCreated after successful submission', async () => {
      const onSourceCreated = vi.fn();
      render(<TextPasteTab {...defaultProps} onSourceCreated={onSourceCreated} />);

      const textarea = screen.getByTestId('text-paste-textarea');
      fireEvent.change(textarea, { target: { value: 'a'.repeat(100) } });

      fireEvent.click(screen.getByRole('button', { name: /use this content/i }));

      await waitFor(() => {
        expect(onSourceCreated).toHaveBeenCalledWith('source-456');
      });
    });

    it('shows Saving... text while submitting', async () => {
      mockMutateAsync.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<TextPasteTab {...defaultProps} />);

      const textarea = screen.getByTestId('text-paste-textarea');
      fireEvent.change(textarea, { target: { value: 'a'.repeat(100) } });

      fireEvent.click(screen.getByRole('button', { name: /use this content/i }));

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on submission failure', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Network error'));

      render(<TextPasteTab {...defaultProps} />);

      const textarea = screen.getByTestId('text-paste-textarea');
      fireEvent.change(textarea, { target: { value: 'a'.repeat(100) } });

      fireEvent.click(screen.getByRole('button', { name: /use this content/i }));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('displays generic error for non-Error objects', async () => {
      mockMutateAsync.mockRejectedValue('Unknown error');

      render(<TextPasteTab {...defaultProps} />);

      const textarea = screen.getByTestId('text-paste-textarea');
      fireEvent.change(textarea, { target: { value: 'a'.repeat(100) } });

      fireEvent.click(screen.getByRole('button', { name: /use this content/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to save content')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('disables inputs when disabled prop is true', () => {
      render(<TextPasteTab {...defaultProps} disabled={true} />);

      expect(screen.getByTestId('text-title')).toBeDisabled();
      expect(screen.getByTestId('text-paste-textarea')).toBeDisabled();
    });

    it('disables submit button when disabled prop is true', () => {
      render(<TextPasteTab {...defaultProps} disabled={true} />);

      expect(screen.getByRole('button', { name: /use this content/i })).toBeDisabled();
    });
  });
});
