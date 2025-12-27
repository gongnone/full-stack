/**
 * Story 4.1: Platform Filter Component
 * Filter spokes by platform
 */

import type { SpokePlatform } from '../../../worker/types';

export interface PlatformFilterProps {
  value: SpokePlatform | 'all';
  onChange: (value: SpokePlatform | 'all') => void;
  spokeCounts?: Record<string, number>;
}

export function PlatformFilter({ value, onChange, spokeCounts }: PlatformFilterProps) {
  const platforms: Array<{ value: SpokePlatform | 'all'; label: string }> = [
    { value: 'all', label: 'All Platforms' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'thread', label: 'Thread' },
    { value: 'carousel', label: 'Carousel' },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SpokePlatform | 'all')}
      className="px-3 py-2 rounded-lg text-sm"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
      }}
    >
      {platforms.map((platform) => (
        <option key={platform.value} value={platform.value}>
          {platform.label}
          {spokeCounts && spokeCounts[platform.value] !== undefined
            ? ` (${spokeCounts[platform.value]})`
            : ''}
        </option>
      ))}
    </select>
  );
}
