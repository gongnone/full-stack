/**
 * Story 6.5: ClipboardActions - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClipboardActions } from './ClipboardActions';

// Mock useToast
const mockAddToast = vi.fn();
vi.mock('@/lib/toast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

describe('ClipboardActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });
  });

  describe('Rendering', () => {
    it('renders three copy buttons', () => {
      render(<ClipboardActions content="Test content" />);

      expect(screen.getByTestId('copy-plain')).toBeInTheDocument();
      expect(screen.getByTestId('copy-markdown')).toBeInTheDocument();
      expect(screen.getByTestId('copy-json')).toBeInTheDocument();
    });

    it('renders Copy Plain button text', () => {
      render(<ClipboardActions content="Test content" />);

      expect(screen.getByText('Copy Plain')).toBeInTheDocument();
    });

    it('renders Copy Markdown button text', () => {
      render(<ClipboardActions content="Test content" />);

      expect(screen.getByText('Copy Markdown')).toBeInTheDocument();
    });

    it('renders Copy JSON button text', () => {
      render(<ClipboardActions content="Test content" />);

      expect(screen.getByText('Copy JSON')).toBeInTheDocument();
    });

    it('shows spoke count when multiple spokes', () => {
      render(<ClipboardActions content="Test content" spokeCount={5} />);

      expect(screen.getByText('5 spokes')).toBeInTheDocument();
    });

    it('hides spoke count when single spoke', () => {
      render(<ClipboardActions content="Test content" spokeCount={1} />);

      expect(screen.queryByText(/spokes/)).not.toBeInTheDocument();
    });
  });

  describe('Copy Plain', () => {
    it('copies content to clipboard', async () => {
      render(<ClipboardActions content="Test content" />);

      fireEvent.click(screen.getByTestId('copy-plain'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test content');
      });
    });

    it('shows Copied! state after click', async () => {
      render(<ClipboardActions content="Test content" />);

      fireEvent.click(screen.getByTestId('copy-plain'));

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('calls onCopy callback with format', async () => {
      const onCopy = vi.fn();
      render(<ClipboardActions content="Test content" onCopy={onCopy} />);

      fireEvent.click(screen.getByTestId('copy-plain'));

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalledWith('plain');
      });
    });
  });

  describe('Copy Markdown', () => {
    it('copies content when markdown button clicked', async () => {
      render(<ClipboardActions content="Test content" />);

      fireEvent.click(screen.getByTestId('copy-markdown'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test content');
      });
    });

    it('calls onCopy with markdown format', async () => {
      const onCopy = vi.fn();
      render(<ClipboardActions content="Test content" onCopy={onCopy} />);

      fireEvent.click(screen.getByTestId('copy-markdown'));

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalledWith('markdown');
      });
    });
  });

  describe('Copy JSON', () => {
    it('copies content when json button clicked', async () => {
      render(<ClipboardActions content="Test content" />);

      fireEvent.click(screen.getByTestId('copy-json'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test content');
      });
    });

    it('calls onCopy with json format', async () => {
      const onCopy = vi.fn();
      render(<ClipboardActions content="Test content" onCopy={onCopy} />);

      fireEvent.click(screen.getByTestId('copy-json'));

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalledWith('json');
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error toast when clipboard fails', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
        configurable: true,
      });

      render(<ClipboardActions content="Test content" />);

      fireEvent.click(screen.getByTestId('copy-plain'));

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          'Failed to copy to clipboard',
          'error',
          expect.any(Number)
        );
      });
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ClipboardActions content="Test content" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
