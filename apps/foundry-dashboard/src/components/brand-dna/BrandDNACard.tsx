/**
 * Story 2.3 & 2.4: Brand DNA Analysis & Scoring + Report Dashboard
 * Story 2.5: Voice Marker and Banned Word Management
 *
 * Hero section with:
 * - 48px DNA Strength score
 * - Status badge (green "Strong" / yellow "Good" / red "Needs Training")
 * - Voice Profile card: Primary Tone, Writing Style, Target Audience
 * - Signature Phrases as interactive chips with hover tooltips (Story 2.4)
 * - Topics to Avoid as red pills (Story 2.4)
 * - Edit Voice Profile button (Story 2.5)
 */

import type { BrandDNAReport } from '@/../../worker/types';
import { VoiceMetricsProgress } from './VoiceMetricsProgress';
import { SignaturePhrasesChips } from './SignaturePhrasesChips';
import { TopicsToAvoid } from './TopicsToAvoid';
import { RecommendationsSection } from './RecommendationsSection';

interface BrandDNACardProps {
  report: BrandDNAReport;
  onAddSamples?: () => void;
  onRecordVoice?: () => void;
  onEditVoiceProfile?: () => void;
  className?: string;
}

const statusStyles = {
  strong: {
    bg: 'rgba(0, 210, 106, 0.15)',
    color: 'var(--approve)',
    label: 'Strong',
  },
  good: {
    bg: 'rgba(255, 173, 31, 0.15)',
    color: 'var(--warning)',
    label: 'Good',
  },
  needs_training: {
    bg: 'rgba(244, 33, 46, 0.15)',
    color: 'var(--kill)',
    label: 'Needs Training',
  },
};

export function BrandDNACard({
  report,
  onAddSamples,
  onRecordVoice,
  onEditVoiceProfile,
  className = '',
}: BrandDNACardProps) {
  const statusStyle = statusStyles[report.status];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hero Section - DNA Strength Score */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <div className="text-center mb-6">
          <span
            className="text-5xl font-bold"
            style={{ color: statusStyle.color }}
            data-testid="dna-strength-score"
          >
            {report.strengthScore}%
          </span>
          <div className="mt-2">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
              }}
              data-testid={`status-badge-${report.status}`}
            >
              {statusStyle.label}
            </span>
          </div>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Based on {report.sampleCount} training samples
          </p>
        </div>

        {/* Voice Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primary Tone */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Primary Tone
            </p>
            <p
              className="font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {report.primaryTone || 'Not detected'}
            </p>
          </div>

          {/* Writing Style */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Writing Style
            </p>
            <p
              className="font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {report.writingStyle || 'Not detected'}
            </p>
          </div>

          {/* Target Audience */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Target Audience
            </p>
            <p
              className="font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {report.targetAudience || 'Not detected'}
            </p>
          </div>
        </div>
      </div>

      {/* Signature Phrases */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <SignaturePhrasesChips phrases={report.signaturePhrases} />
      </div>

      {/* Topics to Avoid (Story 2.4) - Red pills */}
      {report.topicsToAvoid && report.topicsToAvoid.length > 0 && (
        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <TopicsToAvoid topics={report.topicsToAvoid} />
        </div>
      )}

      {/* Story 2.5: Edit Voice Profile Button */}
      {onEditVoiceProfile && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <div>
            <h3
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Voice Profile Settings
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Fine-tune voice markers and banned words manually
            </p>
          </div>
          <button
            onClick={onEditVoiceProfile}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
            data-testid="edit-voice-profile-btn"
          >
            Edit Voice Profile
          </button>
        </div>
      )}

      {/* Voice Metrics Breakdown */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <VoiceMetricsProgress breakdown={report.breakdown} />
      </div>

      {/* Recommendations */}
      <RecommendationsSection
        status={report.status}
        strengthScore={report.strengthScore}
        recommendations={report.recommendations}
        onAddSamples={onAddSamples}
        onRecordVoice={onRecordVoice}
      />

      {/* Last Calibration Info */}
      <p
        className="text-xs text-center"
        style={{ color: 'var(--text-muted)' }}
      >
        Last calibration:{' '}
        {new Date(report.lastCalibration.timestamp * 1000).toLocaleString()} via{' '}
        {report.lastCalibration.source.replace('_', ' ')}
      </p>
    </div>
  );
}
