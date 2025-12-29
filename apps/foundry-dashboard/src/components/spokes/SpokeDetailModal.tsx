/**
 * SpokeDetailModal - Modal for viewing spoke details from hub view
 * Story R-5: Spoke Detail Navigation
 */

import { useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { GateBadge } from '@/components/ui';
import type { Spoke, SpokePlatform } from '@worker/types';

// Platform configuration using design tokens where possible
const PLATFORM_CONFIG: Record<SpokePlatform, { label: string; color: string }> = {
  twitter: { label: 'Twitter', color: 'var(--edit)' }, // Blue
  linkedin: { label: 'LinkedIn', color: 'var(--text-primary)' }, // White/Silver
  tiktok: { label: 'TikTok', color: 'var(--kill)' }, // Red/Pink
  instagram: { label: 'Instagram', color: 'var(--kill)' }, // Red/Pink
  newsletter: { label: 'Newsletter', color: 'var(--warning)' }, // Orange
  thread: { label: 'Thread', color: 'var(--edit)' }, // Blue
  carousel: { label: 'Carousel', color: 'var(--text-primary)' },
  youtube_thumbnail: { label: 'YouTube', color: 'var(--kill)' },
};

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'var(--text-muted)' },
  generating: { label: 'Generating', color: 'var(--warning)' },
  ready: { label: 'Ready', color: 'var(--edit)' },
  approved: { label: 'Approved', color: 'var(--approve)' },
  rejected: { label: 'Rejected', color: 'var(--kill)' },
  killed: { label: 'Killed', color: 'var(--kill)' },
  failed: { label: 'Failed', color: 'var(--kill)' },
};

interface SpokeDetailModalProps {
  spoke: Spoke | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onApprove?: (spokeId: string) => void;
  onEdit?: (spokeId: string) => void;
  onReject?: (spokeId: string) => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function SpokeDetailModal({
  spoke,
  isOpen,
  onClose,
  onNavigate,
  onApprove,
  onEdit,
  onReject,
  hasNext = true,
  hasPrev = true,
}: SpokeDetailModalProps) {
  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && hasNext) {
        e.preventDefault();
        onNavigate('next');
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && hasPrev) {
        e.preventDefault();
        onNavigate('prev');
      }
    },
    [isOpen, onClose, onNavigate, hasNext, hasPrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!spoke) return null;

  const platform = PLATFORM_CONFIG[spoke.platform] || { label: spoke.platform, color: 'var(--text-muted)' };
  const status = STATUS_CONFIG[spoke.status] || { label: spoke.status, color: 'var(--text-muted)' };

  // Parse gate violations
  const g4Passed = spoke.g4_status === 'pass';
  const g5Passed = spoke.g5_status === 'pass';
  const g4Violations = spoke.g4_status?.startsWith('fail:')
    ? spoke.g4_status.replace('fail:', '').split(',')
    : [];
  const g5Violations = spoke.g5_status?.startsWith('fail:')
    ? spoke.g5_status.replace('fail:', '').split(',')
    : [];

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[700px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <Dialog.Title className="sr-only">Spoke Details</Dialog.Title>
          <Dialog.Description className="sr-only">Details for spoke {spoke.id}</Dialog.Description>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-3">
              {/* Platform badge */}
              <span
                className="px-2 py-1 rounded text-xs font-medium border"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: platform.color, color: platform.color }}
              >
                {platform.label}
              </span>
              {/* Status badge */}
              <span
                className="px-2 py-1 rounded text-xs font-medium uppercase border"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: status.color, color: status.color }}
              >
                {status.label}
              </span>
              {/* Psychological angle */}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {spoke.psychological_angle}
              </span>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Quality Gate Scores */}
          <div className="flex items-center gap-4 px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Quality Gates:</span>
            <div className="flex items-center gap-2">
              <GateBadge gate="G2" score={spoke.g2_score ?? 0} size="md" />
              <GateBadge gate="G4" passed={g4Passed} g4Details={{ violations: g4Violations }} size="md" />
              <GateBadge gate="G5" passed={g5Passed} g5Details={{ violations: g5Violations }} size="md" />
            </div>
            {spoke.quality_scores?.g7_overall != null && (
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>G7:</span>
                <span className="text-sm font-medium" style={{ color: spoke.quality_scores.g7_overall >= 80 ? 'var(--approve)' : 'var(--text-primary)' }}>
                  {spoke.quality_scores.g7_overall}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--text-primary)' }}
            >
              {spoke.content}
            </div>
          </div>

          {/* Visual Concept Preview (AC6) */}
          {spoke.thumbnail_concept && (
            <div className="px-4 pb-4">
              <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Visual Concept</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{spoke.thumbnail_concept}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="px-4 pb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center gap-4">
              {spoke.parent_spoke_id && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Variation
                </span>
              )}
              {spoke.generation_attempt > 1 && (
                <span>Attempt #{spoke.generation_attempt}</span>
              )}
              <span className="ml-auto">ID: {spoke.id.slice(0, 8)}...</span>
            </div>
          </div>

          {/* Footer with Actions and Navigation */}
          <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => hasPrev && onNavigate('prev')}
                disabled={!hasPrev}
                className="p-2 rounded-lg transition-colors disabled:opacity-30"
                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                title="Previous (Arrow Left)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => hasNext && onNavigate('next')}
                disabled={!hasNext}
                className="p-2 rounded-lg transition-colors disabled:opacity-30"
                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                title="Next (Arrow Right)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                Use arrow keys to navigate
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {onReject && (
                <button
                  onClick={() => onReject(spoke.id)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-[#F4212E]/20"
                  style={{ color: '#F4212E' }}
                >
                  Reject
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(spoke.id)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--edit)' }}
                >
                  Edit
                </button>
              )}
              {onApprove && (
                <button
                  onClick={() => onApprove(spoke.id)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: 'var(--approve)', color: '#fff' }}
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
