/**
 * Component Tests: TestimonialRequestModal
 *
 * Coverage for FR-1.5.16: Testimonial Request Modal
 * Tests all UI states, user interactions, and API integrations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestimonialRequestModal } from './TestimonialRequestModal';

// Mock useToast
const mockAddToast = vi.fn();
vi.mock('@/lib/toast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mock VideoRecorder component
vi.mock('@/components/video/VideoRecorder', () => ({
  VideoRecorder: ({ onComplete, onCancel, maxDuration }: any) => (
    <div data-testid="video-recorder" data-max-duration={maxDuration}>
      <button onClick={() => onComplete(new Blob(['test'], { type: 'video/webm' }))}>
        Complete Recording
      </button>
      <button onClick={onCancel}>Cancel Recording</button>
    </div>
  ),
}));

// Mock tRPC client
const mockRespondMutate = vi.fn();
const mockGetUploadUrlMutate = vi.fn();
const mockSubmitMutate = vi.fn();

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    testimonials: {
      respond: {
        useMutation: () => ({
          mutateAsync: mockRespondMutate,
          isPending: false,
        }),
      },
      getUploadUrl: {
        useMutation: () => ({
          mutateAsync: mockGetUploadUrlMutate,
        }),
      },
      submit: {
        useMutation: () => ({
          mutateAsync: mockSubmitMutate,
        }),
      },
    },
  },
}));

describe('TestimonialRequestModal', () => {
  const defaultProps = {
    clientId: 'test-client-123',
    isOpen: true,
    onClose: vi.fn(),
    approvedCount: 15,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Rendering', () => {
    it('does not render when isOpen is false', () => {
      const { container } = render(
        <TestimonialRequestModal {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders sentiment check step by default', () => {
      render(<TestimonialRequestModal {...defaultProps} />);

      expect(screen.getByText("How's it going so far?")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Loving it/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Solid/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Needs work/i })).toBeInTheDocument();
    });

    it('shows approved count in sentiment check', () => {
      render(<TestimonialRequestModal {...defaultProps} approvedCount={25} />);

      expect(screen.getByText(/You've approved 25 pieces of content/i)).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<TestimonialRequestModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('AC-2: Sentiment Check Flow', () => {
    it('shows testimonial request after selecting "excited" sentiment', async () => {
      mockRespondMutate.mockResolvedValue({ success: true });
      render(<TestimonialRequestModal {...defaultProps} />);

      // Click "Loving it!" button
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));

      // Should show request step
      await waitFor(() => {
        expect(
          screen.getByText(/Would you mind sharing a quick testimonial/i)
        ).toBeInTheDocument();
      });
    });

    it('shows testimonial request after selecting "solid" sentiment', async () => {
      mockRespondMutate.mockResolvedValue({ success: true });
      render(<TestimonialRequestModal {...defaultProps} />);

      // Click "Solid" button
      fireEvent.click(screen.getByRole('button', { name: /Solid/i }));

      // Should show request step
      await waitFor(() => {
        expect(
          screen.getByText(/Would you mind sharing a quick testimonial/i)
        ).toBeInTheDocument();
      });
    });

    it('shows support message and closes after selecting "needs_work"', async () => {
      const onClose = vi.fn();
      render(<TestimonialRequestModal {...defaultProps} onClose={onClose} />);

      // Click "Needs work" button
      fireEvent.click(screen.getByRole('button', { name: /Needs work/i }));

      // Should show support toast
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.stringContaining("Thanks for your feedback"),
          'info',
          expect.any(Number)
        );
      });

      // Should close modal after delay
      await waitFor(
        () => {
          expect(onClose).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });

    it('shows "Awesome!" for excited sentiment', async () => {
      mockRespondMutate.mockResolvedValue({ success: true });
      render(<TestimonialRequestModal {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));

      await waitFor(() => {
        expect(screen.getByText('Awesome!')).toBeInTheDocument();
      });
    });

    it('shows "Great to hear!" for solid sentiment', async () => {
      mockRespondMutate.mockResolvedValue({ success: true });
      render(<TestimonialRequestModal {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /Solid/i }));

      await waitFor(() => {
        expect(screen.getByText('Great to hear!')).toBeInTheDocument();
      });
    });
  });

  describe('AC-3, AC-4, AC-5: Request Response Options', () => {
    beforeEach(async () => {
      mockRespondMutate.mockResolvedValue({ success: true });
    });

    it('shows recording step when user accepts', async () => {
      render(<TestimonialRequestModal {...defaultProps} />);

      // Navigate to request step
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Yes, I'd love to/i })).toBeInTheDocument();
      });

      // Click accept
      fireEvent.click(screen.getByRole('button', { name: /Yes, I'd love to/i }));

      // Should call respond mutation with 'accept'
      await waitFor(() => {
        expect(mockRespondMutate).toHaveBeenCalledWith({
          clientId: 'test-client-123',
          response: 'accept',
          sentiment: 'excited',
        });
      });

      // Should show recording step
      await waitFor(() => {
        expect(screen.getByText(/Record Your Testimonial/i)).toBeInTheDocument();
        expect(screen.getByText(/Keep it under 60 seconds/i)).toBeInTheDocument();
      });
    });

    it('closes modal and shows toast when user declines', async () => {
      const onClose = vi.fn();
      render(<TestimonialRequestModal {...defaultProps} onClose={onClose} />);

      // Navigate to request step
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /No thanks/i })).toBeInTheDocument();
      });

      // Click decline
      fireEvent.click(screen.getByRole('button', { name: /No thanks/i }));

      // Should call respond mutation with 'decline'
      await waitFor(() => {
        expect(mockRespondMutate).toHaveBeenCalledWith({
          clientId: 'test-client-123',
          response: 'decline',
          sentiment: 'excited',
        });
      });

      // Should show toast
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringContaining('No problem'),
        'info',
        expect.any(Number)
      );

      // Should close modal
      expect(onClose).toHaveBeenCalled();
    });

    it('closes modal and shows toast when user snoozes', async () => {
      const onClose = vi.fn();
      render(<TestimonialRequestModal {...defaultProps} onClose={onClose} />);

      // Navigate to request step
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Ask me later/i })).toBeInTheDocument();
      });

      // Click snooze
      fireEvent.click(screen.getByRole('button', { name: /Ask me later/i }));

      // Should call respond mutation with 'snooze'
      await waitFor(() => {
        expect(mockRespondMutate).toHaveBeenCalledWith({
          clientId: 'test-client-123',
          response: 'snooze',
          sentiment: 'excited',
        });
      });

      // Should show toast
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringContaining("We'll remind you later"),
        'info',
        expect.any(Number)
      );

      // Should close modal
      expect(onClose).toHaveBeenCalled();
    });

    it('passes sentiment to respond mutation', async () => {
      render(<TestimonialRequestModal {...defaultProps} />);

      // Select sentiment
      fireEvent.click(screen.getByRole('button', { name: /Solid/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Ask me later/i })).toBeInTheDocument();
      });

      // Respond
      fireEvent.click(screen.getByRole('button', { name: /Ask me later/i }));

      // Should include 'solid' sentiment
      await waitFor(() => {
        expect(mockRespondMutate).toHaveBeenCalledWith({
          clientId: 'test-client-123',
          response: 'snooze',
          sentiment: 'solid',
        });
      });
    });
  });

  describe('AC-3: Video Recording Integration', () => {
    beforeEach(() => {
      mockRespondMutate.mockResolvedValue({ success: true });
      mockGetUploadUrlMutate.mockResolvedValue({
        uploadUrl: '/api/upload/testimonials/test-client-123/12345-testimonial.webm',
        r2Key: 'testimonials/test-client-123/12345-testimonial.webm',
      });
      mockSubmitMutate.mockResolvedValue({ success: true });
      (global.fetch as any).mockResolvedValue({ ok: true });
    });

    it('shows VideoRecorder component with 60s max duration', async () => {
      render(<TestimonialRequestModal {...defaultProps} />);

      // Navigate to recording step
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Yes, I'd love to/i })).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole('button', { name: /Yes, I'd love to/i }));

      // Should show VideoRecorder
      await waitFor(() => {
        const videoRecorder = screen.getByTestId('video-recorder');
        expect(videoRecorder).toBeInTheDocument();
        expect(videoRecorder).toHaveAttribute('data-max-duration', '60');
      });
    });

    it('handles video completion with upload flow', async () => {
      render(<TestimonialRequestModal {...defaultProps} />);

      // Navigate to recording step
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Yes, I'd love to/i })).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole('button', { name: /Yes, I'd love to/i }));

      // Complete recording
      await waitFor(() => {
        expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /Complete Recording/i }));

      // Should show upload progress
      await waitFor(() => {
        expect(screen.getByText(/Uploading your testimonial/i)).toBeInTheDocument();
      });

      // Should call getUploadUrl
      expect(mockGetUploadUrlMutate).toHaveBeenCalledWith({
        clientId: 'test-client-123',
        fileName: 'testimonial.webm',
        contentType: 'video/webm',
      });

      // Should upload to R2
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/upload/testimonials/test-client-123/12345-testimonial.webm',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'video/webm' },
          })
        );
      });

      // Should call submit mutation
      await waitFor(() => {
        expect(mockSubmitMutate).toHaveBeenCalledWith({
          clientId: 'test-client-123',
          r2Key: 'testimonials/test-client-123/12345-testimonial.webm',
          duration: expect.any(Number),
          permissionPublic: false,
        });
      });

      // Should show complete step
      await waitFor(() => {
        expect(screen.getByText(/Thank you!/i)).toBeInTheDocument();
        expect(screen.getByText(/Your testimonial has been submitted/i)).toBeInTheDocument();
      });
    });

    it('shows upload progress during upload', async () => {
      render(<TestimonialRequestModal {...defaultProps} />);

      // Navigate to recording step and complete
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Yes, I'd love to/i })).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole('button', { name: /Yes, I'd love to/i }));
      await waitFor(() => {
        expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /Complete Recording/i }));

      // Should show progress bar
      await waitFor(() => {
        expect(screen.getByText(/Uploading your testimonial/i)).toBeInTheDocument();
        expect(screen.getByText(/\d+%/)).toBeInTheDocument();
      });
    });

    it('handles upload error and returns to request step', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<TestimonialRequestModal {...defaultProps} />);

      // Navigate to recording and complete
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Yes, I'd love to/i })).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole('button', { name: /Yes, I'd love to/i }));
      await waitFor(() => {
        expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /Complete Recording/i }));

      // Should show error toast
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.stringContaining('Failed to submit testimonial'),
          'error',
          expect.any(Number)
        );
      });

      // Should return to request step
      await waitFor(() => {
        expect(
          screen.getByText(/Would you mind sharing a quick testimonial/i)
        ).toBeInTheDocument();
      });
    });

    it('handles cancel during recording', async () => {
      render(<TestimonialRequestModal {...defaultProps} />);

      // Navigate to recording step
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Yes, I'd love to/i })).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole('button', { name: /Yes, I'd love to/i }));

      // Cancel recording
      await waitFor(() => {
        expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /Cancel Recording/i }));

      // Should return to request step
      await waitFor(() => {
        expect(
          screen.getByText(/Would you mind sharing a quick testimonial/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Close Button', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<TestimonialRequestModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByLabelText('Close'));

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      const { container } = render(
        <TestimonialRequestModal {...defaultProps} onClose={onClose} />
      );

      // Click backdrop (first div with fixed inset-0)
      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Complete Step', () => {
    it('shows Done button on complete step', async () => {
      mockRespondMutate.mockResolvedValue({ success: true });
      mockGetUploadUrlMutate.mockResolvedValue({
        uploadUrl: '/api/upload/test.webm',
        r2Key: 'test.webm',
      });
      mockSubmitMutate.mockResolvedValue({ success: true });
      (global.fetch as any).mockResolvedValue({ ok: true });

      render(<TestimonialRequestModal {...defaultProps} />);

      // Navigate through flow to complete
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Yes, I'd love to/i })).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole('button', { name: /Yes, I'd love to/i }));
      await waitFor(() => {
        expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /Complete Recording/i }));

      // Wait for complete step
      await waitFor(() => {
        expect(screen.getByText(/Thank you!/i)).toBeInTheDocument();
      });

      // Should show Done button
      expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument();
    });

    it('closes modal when Done is clicked', async () => {
      mockRespondMutate.mockResolvedValue({ success: true });
      mockGetUploadUrlMutate.mockResolvedValue({
        uploadUrl: '/api/upload/test.webm',
        r2Key: 'test.webm',
      });
      mockSubmitMutate.mockResolvedValue({ success: true });
      (global.fetch as any).mockResolvedValue({ ok: true });

      const onClose = vi.fn();
      render(<TestimonialRequestModal {...defaultProps} onClose={onClose} />);

      // Navigate to complete
      fireEvent.click(screen.getByRole('button', { name: /Loving it/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Yes, I'd love to/i })).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole('button', { name: /Yes, I'd love to/i }));
      await waitFor(() => {
        expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /Complete Recording/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument();
      });

      // Click Done
      fireEvent.click(screen.getByRole('button', { name: /Done/i }));

      expect(onClose).toHaveBeenCalled();
    });
  });
});
