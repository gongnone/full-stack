/**
 * CloneSpokeModal - Modal for cloning spokes with different modes
 * Story R-4: Clone Spoke Implementation
 *
 * Supports 3 clone modes (AC2-AC5):
 * - Exact Copy: Duplicate spoke with same content and metadata
 * - New Variation: Regenerate with same pillar but new seed
 * - Different Platform: Clone to a different target platform
 */

import { useState } from 'react';
import { ActionButton } from '@/components/ui';

export type CloneMode = 'exact' | 'variation' | 'platform';

// Aligned with SpokePlatform from worker/types.ts
export type SpokePlatform = 'twitter' | 'linkedin' | 'tiktok' | 'instagram' | 'newsletter' | 'thread' | 'carousel' | 'youtube_thumbnail';

export interface CloneOptions {
  mode: CloneMode;
  variationCount: number;
  targetPlatform?: SpokePlatform;
}

interface CloneSpokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: CloneOptions) => void;
  spokeContent: string;
  spokeScore: number;
  currentPlatform?: string;
  isLoading?: boolean;
}

const PLATFORMS: { id: SpokePlatform; label: string; icon: React.ReactNode }[] = [
  { id: 'linkedin', label: 'LinkedIn', icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
  )},
  { id: 'twitter', label: 'X / Twitter', icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
  )},
  { id: 'instagram', label: 'Instagram', icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  )},
  { id: 'tiktok', label: 'TikTok', icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
  )},
  { id: 'newsletter', label: 'Newsletter', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  )},
  { id: 'thread', label: 'Thread', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
  )},
  { id: 'carousel', label: 'Carousel', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M8 4v16 M12 4v16 M16 4v16" /></svg>
  )},
  { id: 'youtube_thumbnail', label: 'YouTube Thumbnail', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
  )},
];

const CLONE_MODES = [
  {
    id: 'exact' as CloneMode,
    label: 'Exact Copy',
    description: 'Duplicate with same content and metadata',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'variation' as CloneMode,
    label: 'New Variation',
    description: 'Regenerate with same pillar, new creative angle',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    id: 'platform' as CloneMode,
    label: 'Different Platform',
    description: 'Adapt content for another social platform',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
];

export function CloneSpokeModal({
  isOpen,
  onClose,
  onConfirm,
  spokeContent,
  spokeScore,
  currentPlatform,
  isLoading,
}: CloneSpokeModalProps) {
  const [mode, setMode] = useState<CloneMode>('exact');
  const [variationCount, setVariationCount] = useState(1);
  const [targetPlatform, setTargetPlatform] = useState<SpokePlatform | undefined>(undefined);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      mode,
      variationCount: mode === 'variation' ? variationCount : 1,
      targetPlatform: mode === 'platform' ? targetPlatform : undefined,
    });
  };

  const canConfirm = () => {
    if (mode === 'platform' && !targetPlatform) return false;
    return true;
  };

  const getButtonText = () => {
    if (isLoading) return 'Cloning...';
    switch (mode) {
      case 'exact':
        return 'Create Exact Copy';
      case 'variation':
        return `Generate ${variationCount} Variation${variationCount > 1 ? 's' : ''}`;
      case 'platform':
        return targetPlatform
          ? `Clone to ${PLATFORMS.find(p => p.id === targetPlatform)?.label}`
          : 'Select Platform';
    }
  };

  // Filter out current platform from options
  const availablePlatforms = PLATFORMS.filter(p => p.id !== currentPlatform);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Clone Spoke</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--approve-glow)] rounded-full">
            <span className="text-sm font-medium text-[var(--approve)]">G7: {spokeScore.toFixed(1)}</span>
          </div>
        </div>

        {/* Original Content Preview */}
        <div className="bg-[var(--bg-surface)] rounded-xl p-4 mb-6 border border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Original Spoke</p>
          <p className="text-sm text-[var(--text-primary)] line-clamp-3">{spokeContent}</p>
        </div>

        {/* Clone Mode Selection (AC2) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
            Clone Mode
          </label>
          <div className="space-y-2">
            {CLONE_MODES.map(cloneMode => (
              <button
                key={cloneMode.id}
                onClick={() => setMode(cloneMode.id)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left
                  ${mode === cloneMode.id
                    ? 'bg-[var(--edit)] text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]'
                  }
                `}
              >
                <div className={mode === cloneMode.id ? 'text-white' : 'text-[var(--text-muted)]'}>
                  {cloneMode.icon}
                </div>
                <div>
                  <div className={`font-medium ${mode === cloneMode.id ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                    {cloneMode.label}
                  </div>
                  <div className={`text-xs ${mode === cloneMode.id ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                    {cloneMode.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Variation Count (only for variation mode - AC4) */}
        {mode === 'variation' && (
          <div className="mb-6 animate-fadeIn">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Number of Variations
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => setVariationCount(num)}
                  className={`
                    w-12 h-12 rounded-lg font-semibold transition-all
                    ${variationCount === num
                      ? 'bg-[var(--edit)] text-white'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Platform Selection (only for platform mode - AC5) */}
        {mode === 'platform' && (
          <div className="mb-6 animate-fadeIn">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Target Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {availablePlatforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => setTargetPlatform(platform.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                    ${targetPlatform === platform.id
                      ? 'bg-[var(--edit)] text-white'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }
                  `}
                >
                  {platform.icon}
                  <span className="text-sm font-medium">{platform.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
            onClick={handleConfirm}
            disabled={isLoading || !canConfirm()}
          >
            {getButtonText()}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}