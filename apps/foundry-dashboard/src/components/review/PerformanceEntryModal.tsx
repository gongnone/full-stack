/**
 * PerformanceEntryModal - Manual metric entry for G7 training data
 * Story 11-6: Manual Metric Entry
 *
 * Allows users to record actual performance metrics for approved spokes
 * to train the G7 engagement prediction model.
 */

import { useState } from 'react';
import { ActionButton } from '@/components/ui';

interface MetricInput {
  likes: string;
  comments: string;
  shares: string;
  impressions: string;
  clicks: string;
  saves: string;
}

interface PerformanceMetrics {
  likes?: number;
  comments?: number;
  shares?: number;
  impressions?: number;
  clicks?: number;
  saves?: number;
}

interface PerformanceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    metrics: PerformanceMetrics;
    performedWell?: boolean;
    notes?: string;
  }) => void;
  spokeContent: string;
  platform: string;
  isLoading?: boolean;
}

const METRIC_FIELDS = [
  { key: 'likes', label: 'Likes', icon: '❤️', placeholder: '0' },
  { key: 'comments', label: 'Comments', icon: '💬', placeholder: '0' },
  { key: 'shares', label: 'Shares', icon: '🔄', placeholder: '0' },
  { key: 'impressions', label: 'Impressions', icon: '👁️', placeholder: '0' },
  { key: 'clicks', label: 'Clicks', icon: '👆', placeholder: '0' },
  { key: 'saves', label: 'Saves', icon: '🔖', placeholder: '0' },
] as const;

export function PerformanceEntryModal({
  isOpen,
  onClose,
  onSubmit,
  spokeContent,
  platform,
  isLoading,
}: PerformanceEntryModalProps) {
  const [metrics, setMetrics] = useState<MetricInput>({
    likes: '',
    comments: '',
    shares: '',
    impressions: '',
    clicks: '',
    saves: '',
  });
  const [performedWell, setPerformedWell] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleMetricChange = (key: keyof MetricInput, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    setMetrics((prev) => ({ ...prev, [key]: numericValue }));
  };

  const handleSubmit = () => {
    // Convert string inputs to numbers, filtering out empty values
    const parsedMetrics: PerformanceMetrics = {};

    if (metrics.likes) parsedMetrics.likes = parseInt(metrics.likes, 10);
    if (metrics.comments) parsedMetrics.comments = parseInt(metrics.comments, 10);
    if (metrics.shares) parsedMetrics.shares = parseInt(metrics.shares, 10);
    if (metrics.impressions) parsedMetrics.impressions = parseInt(metrics.impressions, 10);
    if (metrics.clicks) parsedMetrics.clicks = parseInt(metrics.clicks, 10);
    if (metrics.saves) parsedMetrics.saves = parseInt(metrics.saves, 10);

    onSubmit({
      metrics: parsedMetrics,
      performedWell: performedWell ?? undefined,
      notes: notes.trim() || undefined,
    });
  };

  const hasAnyMetric = Object.values(metrics).some((v) => v !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Record Performance
          </h2>
          <span className="px-3 py-1 rounded-full text-xs font-medium uppercase bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {platform}
          </span>
        </div>

        {/* Content Preview */}
        <div className="bg-[var(--bg-surface)] rounded-xl p-4 mb-6 border border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Content</p>
          <p className="text-sm text-[var(--text-primary)] line-clamp-3">
            {spokeContent}
          </p>
        </div>

        {/* Performance Assessment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
            Did this content perform well?
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setPerformedWell(true)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all
                ${performedWell === true
                  ? 'bg-[var(--approve)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              Yes
            </button>
            <button
              onClick={() => setPerformedWell(false)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all
                ${performedWell === false
                  ? 'bg-[var(--kill)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
              No
            </button>
          </div>
        </div>

        {/* Metric Inputs */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
            Engagement Metrics
          </label>
          <div className="grid grid-cols-2 gap-3">
            {METRIC_FIELDS.map(({ key, label, icon, placeholder }) => (
              <div key={key} className="relative">
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  {icon} {label}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={placeholder}
                  value={metrics[key]}
                  onChange={(e) => handleMetricChange(key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--edit)] text-sm"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Enter actual metrics from the platform. Leave blank if unavailable.
          </p>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any context about performance, timing, or audience response..."
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--edit)] text-sm resize-none"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1 text-right">
            {notes.length}/500
          </p>
        </div>

        {/* Training Data Notice */}
        <div className="bg-[var(--bg-surface)] rounded-lg p-3 mb-6 border border-[var(--border-subtle)]">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[var(--edit)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-[var(--text-secondary)]">
              This data helps train G7 to better predict content performance. More feedback = smarter predictions.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <ActionButton
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </ActionButton>
          <ActionButton
            variant="approve"
            className="flex-1"
            onClick={handleSubmit}
            disabled={isLoading || (!hasAnyMetric && performedWell === null)}
          >
            {isLoading ? 'Saving...' : 'Save Performance'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
