import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Story 6.2: Platform Grouper
 * Toggle to organize exports by platform
 */

type Platform = 'twitter' | 'linkedin' | 'tiktok' | 'instagram' | 'carousel' | 'thread' | 'youtube_thumbnail';

export interface PlatformGrouperProps {
  selectedPlatforms: Platform[];
  onTogglePlatform: (platform: Platform) => void;
  groupByPlatform: boolean;
  onToggleGrouping: (enabled: boolean) => void;
  className?: string;
}

const PLATFORMS: { id: Platform; label: string; icon: string }[] = [
  { id: 'twitter', label: 'Twitter', icon: 'X' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { id: 'tiktok', label: 'TikTok', icon: 'TT' },
  { id: 'instagram', label: 'Instagram', icon: 'IG' },
  { id: 'carousel', label: 'Carousel', icon: 'C' },
  { id: 'thread', label: 'Thread', icon: 'T' },
  { id: 'youtube_thumbnail', label: 'YouTube', icon: 'YT' },
];

export function PlatformGrouper({
  selectedPlatforms,
  onTogglePlatform,
  groupByPlatform,
  onToggleGrouping,
  className,
}: PlatformGrouperProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Platform Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
          Select Platforms
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => onTogglePlatform(platform.id)}
                className={cn(
                  'px-3 py-2 rounded-lg border transition-all text-xs font-medium',
                  isSelected
                    ? 'border-[var(--edit)] bg-[var(--edit)] bg-opacity-10 text-[var(--edit)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                )}
                data-testid={`platform-${platform.id}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold">{platform.icon}</span>
                  <span>{platform.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Group by Platform Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">
            Group by Platform
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Organize export into separate files per platform
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggleGrouping(!groupByPlatform)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            groupByPlatform ? 'bg-[var(--approve)]' : 'bg-[var(--bg-elevated)]'
          )}
          data-testid="group-by-platform-toggle"
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              groupByPlatform ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    </div>
  );
}
