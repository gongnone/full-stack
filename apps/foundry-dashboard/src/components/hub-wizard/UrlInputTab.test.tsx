/**
 * Story 3.1: UrlInputTab - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UrlInputTab } from './UrlInputTab';

// Mock tRPC
const mockMutateAsync = vi.fn();
vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    hubs: {
      createUrlSource: {
        useMutation: () => ({
          mutateAsync: mockMutateAsync,
        }),
      },
    },
  },
}));

describe('UrlInputTab', () => {
  const defaultProps = {
    clientId: 'client-123',
    onSourceCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({ sourceId: 'source-456' });
  });

  describe('Rendering', () => {
    it('renders URL input', () => {
      render(<UrlInputTab {...defaultProps} />);

      expect(screen.getByTestId('source-url')).toBeInTheDocument();
      expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    });

    it('renders title input', () => {
      render(<UrlInputTab {...defaultProps} />);

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it('renders info banner about URL/YouTube', () => {
      render(<UrlInputTab {...defaultProps} />);

      expect(screen.getByText(/paste a web article url or youtube/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<UrlInputTab {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add url source/i })).toBeInTheDocument();
    });
  });

  describe('URL Validation', () => {
    it('disables submit when URL is empty', () => {
      render(<UrlInputTab {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add url source/i })).toBeDisabled();
    });

    it('shows error for invalid URL format', () => {
      render(<UrlInputTab {...defaultProps} />);

      const input = screen.getByTestId('source-url');
      fireEvent.change(input, { target: { value: 'not-a-valid-url' } });

      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    it('shows error for non-HTTPS URL', () => {
      render(<UrlInputTab {...defaultProps} />);

      const input = screen.getByTestId('source-url');
      fireEvent.change(input, { target: { value: 'http://example.com/article' } });

      expect(screen.getByText('URL must use HTTPS')).toBeInTheDocument();
    });

    it('accepts valid HTTPS URL', () => {
      render(<UrlInputTab {...defaultProps} />);

      const input = screen.getByTestId('source-url');
      fireEvent.change(input, { target: { value: 'https://example.com/article' } });

      expect(screen.queryByText(/please enter a valid url/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/url must use https/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add url source/i })).not.toBeDisabled();
    });
  });

  describe('YouTube Detection', () => {
    it('detects youtube.com URL', () => {
      render(<UrlInputTab {...defaultProps} />);

      const input = screen.getByTestId('source-url');
      fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=abc123' } });

      expect(screen.getByText(/youtube video detected/i)).toBeInTheDocument();
    });

    it('detects youtu.be URL', () => {
      render(<UrlInputTab {...defaultProps} />);

      const input = screen.getByTestId('source-url');
      fireEvent.change(input, { target: { value: 'https://youtu.be/abc123' } });

      expect(screen.getByText(/youtube video detected/i)).toBeInTheDocument();
    });

    it('enables submit for YouTube URL (allows HTTP for YouTube)', () => {
      render(<UrlInputTab {...defaultProps} />);

      const input = screen.getByTestId('source-url');
      fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=test' } });

      expect(screen.getByRole('button', { name: /add url source/i })).not.toBeDisabled();
    });
  });

  describe('Submission', () => {
    it('calls createUrlSource on submit', async () => {
      render(<UrlInputTab {...defaultProps} />);

      const input = screen.getByTestId('source-url');
      fireEvent.change(input, { target: { value: 'https://example.com/article' } });

      fireEvent.click(screen.getByRole('button', { name: /add url source/i }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          clientId: 'client-123',
          url: 'https://example.com/article',
          title: undefined,
        });
      });
    });

    it('includes custom title when provided', async () => {
      render(<UrlInputTab {...defaultProps} />);

      fireEvent.change(screen.getByTestId('source-url'), { target: { value: 'https://example.com/article' } });
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My Custom Title' } });

      fireEvent.click(screen.getByRole('button', { name: /add url source/i }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'My Custom Title' })
        );
      });
    });

    it('calls onSourceCreated after successful submission', async () => {
      const onSourceCreated = vi.fn();
      render(<UrlInputTab {...defaultProps} onSourceCreated={onSourceCreated} />);

      fireEvent.change(screen.getByTestId('source-url'), { target: { value: 'https://example.com/article' } });
      fireEvent.click(screen.getByRole('button', { name: /add url source/i }));

      await waitFor(() => {
        expect(onSourceCreated).toHaveBeenCalledWith('source-456');
      });
    });

    it('shows Adding... text while submitting', async () => {
      mockMutateAsync.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<UrlInputTab {...defaultProps} />);

      fireEvent.change(screen.getByTestId('source-url'), { target: { value: 'https://example.com/article' } });
      fireEvent.click(screen.getByRole('button', { name: /add url source/i }));

      await waitFor(() => {
        expect(screen.getByText('Adding...')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on submission failure', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Network error'));

      render(<UrlInputTab {...defaultProps} />);

      fireEvent.change(screen.getByTestId('source-url'), { target: { value: 'https://example.com/article' } });
      fireEvent.click(screen.getByRole('button', { name: /add url source/i }));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('displays generic error for non-Error objects', async () => {
      mockMutateAsync.mockRejectedValue('Unknown error');

      render(<UrlInputTab {...defaultProps} />);

      fireEvent.change(screen.getByTestId('source-url'), { target: { value: 'https://example.com/article' } });
      fireEvent.click(screen.getByRole('button', { name: /add url source/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to add URL')).toBeInTheDocument();
      });
    });

    it('clears error when URL changes', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Network error'));

      render(<UrlInputTab {...defaultProps} />);

      fireEvent.change(screen.getByTestId('source-url'), { target: { value: 'https://example.com/article' } });
      fireEvent.click(screen.getByRole('button', { name: /add url source/i }));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Change URL to clear error
      fireEvent.change(screen.getByTestId('source-url'), { target: { value: 'https://example.com/new' } });

      expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables inputs when disabled prop is true', () => {
      render(<UrlInputTab {...defaultProps} disabled={true} />);

      expect(screen.getByTestId('source-url')).toBeDisabled();
      expect(screen.getByLabelText(/title/i)).toBeDisabled();
    });

    it('disables submit button when disabled prop is true', () => {
      render(<UrlInputTab {...defaultProps} disabled={true} />);

      expect(screen.getByRole('button', { name: /add url source/i })).toBeDisabled();
    });
  });
});
