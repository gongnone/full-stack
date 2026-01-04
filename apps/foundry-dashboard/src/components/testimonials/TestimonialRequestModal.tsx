/**
 * TestimonialRequestModal - FR-1.5.16 Testimonial Request Flow
 *
 * This modal appears after batch approval to request testimonials from happy clients.
 * Includes sentiment check to filter out users who aren't satisfied.
 *
 * Flow:
 * 1. Sentiment check (excited/solid/needs_work)
 * 2. If excited/solid → Show testimonial request with Accept/Decline/Later options
 * 3. If needs_work → Skip testimonial, show support prompt
 */
import { useState } from 'react';
import { X, Smile, Meh, Frown, Video, Clock, XCircle } from 'lucide-react';
import { ActionButton } from '@/components/ui';
import { trpc } from '@/lib/trpc-client';
import { useToast } from '@/lib/toast';
import { UI_CONFIG } from '@/lib/constants';
import { VideoRecorder } from '@/components/video/VideoRecorder';

type Sentiment = 'excited' | 'solid' | 'needs_work' | null;
type Step = 'sentiment' | 'request' | 'recording' | 'complete' | 'closed';

interface TestimonialRequestModalProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
  approvedCount?: number;
}

export function TestimonialRequestModal({
  clientId,
  isOpen,
  onClose,
  approvedCount = 10,
}: TestimonialRequestModalProps) {
  const [step, setStep] = useState<Step>('sentiment');
  const [sentiment, setSentiment] = useState<Sentiment>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { addToast } = useToast();

  const respondMutation = trpc.testimonials.respond.useMutation({
    onError: (err) => {
      addToast(`Error: ${err.message}`, 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
  });

  const getUploadUrlMutation = trpc.testimonials.getUploadUrl.useMutation();
  const submitMutation = trpc.testimonials.submit.useMutation();

  if (!isOpen) return null;

  const handleSentimentSelect = (selected: Sentiment) => {
    setSentiment(selected);
    if (selected === 'needs_work') {
      // Don't ask for testimonial, offer support
      setStep('closed');
      addToast(
        'Thanks for your feedback! We\'re here to help make things better.',
        'info',
        UI_CONFIG.TOAST_DURATION.SUCCESS
      );
      setTimeout(onClose, 2000);
    } else {
      setStep('request');
    }
  };

  const handleResponse = async (response: 'accept' | 'decline' | 'snooze') => {
    try {
      const result = await respondMutation.mutateAsync({
        clientId,
        response,
        sentiment: sentiment || undefined,
      });

      if (response === 'accept') {
        // Capture requestId for later submission
        setRequestId(result.requestId);
        setStep('recording');
      } else if (response === 'decline') {
        addToast('No problem! Thanks for letting us know.', 'info', UI_CONFIG.TOAST_DURATION.SUCCESS);
        onClose();
      } else {
        addToast('We\'ll remind you later.', 'info', UI_CONFIG.TOAST_DURATION.SUCCESS);
        onClose();
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleVideoComplete = async (blob: Blob) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL and R2 key
      const { uploadUrl, r2Key } = await getUploadUrlMutation.mutateAsync({
        clientId,
        fileName: 'testimonial.webm',
        contentType: 'video/webm',
      });

      // Step 2: Upload video blob to R2
      setUploadProgress(25);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'video/webm',
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      setUploadProgress(75);

      // Step 3: Calculate duration from blob
      // Default to 30 seconds if we can't determine actual duration
      // In production, would extract actual duration from video metadata using MediaRecorder
      const estimatedDuration = Math.max(1, Math.min(60, Math.floor(blob.size / 50000))); // Ensure at least 1 second

      // Step 4: Submit testimonial record
      await submitMutation.mutateAsync({
        clientId,
        requestId: requestId || undefined,
        r2Key,
        duration: estimatedDuration,
        permissionPublic: false, // Default to private, user can change later
      });

      setUploadProgress(100);
      setStep('complete');
      addToast('Testimonial submitted successfully!', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    } catch (err) {
      console.error('Video upload error:', err);
      addToast('Failed to submit testimonial. Please try again.', 'error', UI_CONFIG.TOAST_DURATION.ERROR);
      setStep('request'); // Go back to request step
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoCancel = () => {
    setStep('request');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step: Sentiment Check */}
        {step === 'sentiment' && (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              How's it going so far?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8">
              You've approved {approvedCount} pieces of content. Quick check-in!
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleSentimentSelect('excited')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--approve)] hover:bg-[var(--approve-glow)] transition-all group"
              >
                <Smile className="w-10 h-10 text-[var(--approve)] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Loving it!</span>
              </button>

              <button
                onClick={() => handleSentimentSelect('solid')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--warning)] hover:bg-[var(--warning)]/10 transition-all group"
              >
                <Meh className="w-10 h-10 text-[var(--warning)] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Solid</span>
              </button>

              <button
                onClick={() => handleSentimentSelect('needs_work')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition-all group"
              >
                <Frown className="w-10 h-10 text-[var(--text-muted)] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Needs work</span>
              </button>
            </div>
          </div>
        )}

        {/* Step: Testimonial Request */}
        {step === 'request' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--approve-glow)] flex items-center justify-center">
              <Video className="w-8 h-8 text-[var(--approve)]" />
            </div>

            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              {sentiment === 'excited' ? 'Awesome!' : 'Great to hear!'}
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Would you mind sharing a quick testimonial? It really helps other businesses discover us.
            </p>

            <div className="space-y-3">
              <ActionButton
                variant="approve"
                className="w-full justify-center"
                onClick={() => handleResponse('accept')}
                disabled={respondMutation.isPending}
              >
                <Video className="w-4 h-4 mr-2" />
                Yes, I'd love to!
              </ActionButton>

              <ActionButton
                variant="outline"
                className="w-full justify-center"
                onClick={() => handleResponse('snooze')}
                disabled={respondMutation.isPending}
              >
                <Clock className="w-4 h-4 mr-2" />
                Ask me later
              </ActionButton>

              <button
                className="w-full py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                onClick={() => handleResponse('decline')}
                disabled={respondMutation.isPending}
              >
                <XCircle className="w-4 h-4 inline mr-1" />
                No thanks
              </button>
            </div>
          </div>
        )}

        {/* Step: Recording */}
        {step === 'recording' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 text-center">
              Record Your Testimonial
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 text-center">
              Share what you love about using Foundry. Keep it under 60 seconds!
            </p>

            {isUploading ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--approve-glow)] flex items-center justify-center animate-pulse">
                  <Video className="w-8 h-8 text-[var(--approve)]" />
                </div>
                <p className="text-[var(--text-secondary)] mb-2">Uploading your testimonial...</p>
                <div className="w-full max-w-xs mx-auto bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[var(--approve)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-2">{uploadProgress}%</p>
              </div>
            ) : (
              <VideoRecorder
                maxDuration={60}
                onComplete={handleVideoComplete}
                onCancel={handleVideoCancel}
              />
            )}
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--approve-glow)] flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-[var(--approve)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Thank you!
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Your testimonial has been submitted. We really appreciate it!
            </p>

            <ActionButton
              variant="approve"
              className="w-full justify-center"
              onClick={onClose}
            >
              Done
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestimonialRequestModal;
