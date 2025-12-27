/**
 * Story 2.3: Brand DNA Analysis & Scoring
 * Task 9: Recommendations Section (AC3, AC4)
 *
 * Conditional display based on score threshold:
 * - Yellow info box for scores <70% with CTAs
 * - Green checkmark indicator for scores >=80%
 */

import type { BrandDNARecommendation, BrandDNAStatus } from '@/../../worker/types';

interface RecommendationsSectionProps {
  status: BrandDNAStatus;
  strengthScore: number;
  recommendations: BrandDNARecommendation[];
  onAddSamples?: () => void;
  onRecordVoice?: () => void;
  className?: string;
}

export function RecommendationsSection({
  status,
  strengthScore,
  recommendations,
  onAddSamples,
  onRecordVoice,
  className = '',
}: RecommendationsSectionProps) {
  // AC4: Strong status - show success indicator
  if (status === 'strong') {
    return (
      <div
        className={`rounded-xl p-4 flex items-center gap-3 ${className}`}
        style={{ backgroundColor: 'rgba(0, 210, 106, 0.1)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--approve)' }}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <p className="font-medium" style={{ color: 'var(--approve)' }}>
            Strong Brand DNA Profile
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your voice is well-calibrated. The system understands your brand.
          </p>
        </div>
      </div>
    );
  }

  // AC3: Low score - show recommendations
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-xl p-4 space-y-4 ${className}`}
      style={{ backgroundColor: 'rgba(255, 173, 31, 0.1)' }}
      data-testid="recommendations-section"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--warning)' }}
        >
          <svg
            className="w-5 h-5 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="font-medium" style={{ color: 'var(--warning)' }}>
            {status === 'good' ? 'Good Progress' : 'Needs More Training'}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {strengthScore < 70
              ? 'Add more samples to improve Brand DNA accuracy.'
              : 'A few more samples will strengthen your profile.'}
          </p>
        </div>
      </div>

      <div className="space-y-2 pl-13">
        {recommendations.map((rec, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--warning)' }}
            />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {rec.message}
            </span>
            {rec.type === 'add_samples' && onAddSamples && (
              <button
                onClick={onAddSamples}
                className="text-sm font-medium hover:underline ml-2"
                style={{ color: 'var(--edit)' }}
              >
                Add samples
              </button>
            )}
            {rec.type === 'voice_note' && onRecordVoice && (
              <button
                onClick={onRecordVoice}
                className="text-sm font-medium hover:underline ml-2"
                style={{ color: 'var(--edit)' }}
              >
                Record voice
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
