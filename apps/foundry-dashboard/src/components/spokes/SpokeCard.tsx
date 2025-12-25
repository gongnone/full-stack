/**
 * SpokeCard - Displays a spoke with content preview and quality gate badges
 * Story 4.1/4.2: Spoke display in tree view with G2/G4/G5 gate badges
 */

import { GateBadge } from '@/components/ui';
import type { Spoke, SpokePlatform } from '../../../worker/types';
import { QUALITY_GATE_CONFIG } from '@/lib/constants';

// Platform icons and colors
const PLATFORM_CONFIG: Record<SpokePlatform, { label: string; color: string; icon: React.ReactNode }> = {
  twitter: {
    label: 'Twitter',
    color: '#1DA1F2',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm1.161 17.52h1.833L7.045 4.126H5.078z" />
      </svg>
    ),
  },
  linkedin: {
    label: 'LinkedIn',
    color: '#0A66C2',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  tiktok: {
    label: 'TikTok',
    color: '#FF0050',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  instagram: {
    label: 'Instagram',
    color: '#E4405F',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  newsletter: {
    label: 'Newsletter',
    color: '#9333EA',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  thread: {
    label: 'Thread',
    color: '#1DA1F2',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  carousel: {
    label: 'Carousel',
    color: '#E4405F',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
};

// Status config
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'var(--text-muted)' },
  generating: { label: 'Generating', color: 'var(--warning)' },
  ready: { label: 'Ready', color: 'var(--edit)' },
  approved: { label: 'Approved', color: 'var(--approve)' },
  rejected: { label: 'Rejected', color: 'var(--kill)' },
  killed: { label: 'Killed', color: 'var(--kill)' },
  failed: { label: 'Failed', color: 'var(--kill)' },
};

interface SpokeCardProps {
  spoke: Spoke;
  onClick?: () => void;
  isExpanded?: boolean;
}

const DEFAULT_STATUS = { label: 'Pending', color: 'var(--text-muted)' };

export function SpokeCard({ spoke, onClick, isExpanded = false }: SpokeCardProps) {
  const platform = PLATFORM_CONFIG[spoke.platform];
  const status = STATUS_CONFIG[spoke.status] ?? DEFAULT_STATUS;

  // Parse G4/G5 status
  const g4Passed = spoke.g4_status === 'pass';
  const g5Passed = spoke.g5_status === 'pass';

  // Parse violations from status strings (format: "fail:reason1,reason2")
  const g4Violations = spoke.g4_status?.startsWith('fail:')
    ? spoke.g4_status.replace('fail:', '').split(',')
    : [];
  const g5Violations = spoke.g5_status?.startsWith('fail:')
    ? spoke.g5_status.replace('fail:', '').split(',')
    : [];

  return (
    <div
      className={`spoke-node rounded-lg p-3 transition-all cursor-pointer hover:bg-[var(--bg-hover)] ${
        isExpanded ? 'bg-[var(--bg-elevated)]' : 'bg-[var(--bg-surface)]'
      }`}
      style={{ border: '1px solid var(--border-subtle)' }}
      onClick={onClick}
    >
      {/* Header: Platform & Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
          >
            {platform.icon}
            <span>{platform.label}</span>
          </div>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
            style={{ backgroundColor: `${status.color}20`, color: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Gate Badges */}
        <div className="flex items-center gap-1">
          <GateBadge
            gate="G2"
            score={spoke.g2_score ?? 0}
            size="sm"
          />
          <GateBadge
            gate="G4"
            passed={g4Passed}
            g4Details={{ violations: g4Violations }}
            size="sm"
          />
          <GateBadge
            gate="G5"
            passed={g5Passed}
            g5Details={{ violations: g5Violations }}
            size="sm"
          />
        </div>
      </div>

      {/* Content Preview */}
      <div
        className={`text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {spoke.content}
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="capitalize">{spoke.psychological_angle}</span>
        {spoke.generation_attempt > 1 && (
          <span className="px-1.5 py-0.5 rounded bg-[var(--warning)]20 text-[var(--warning)]">
            Attempt #{spoke.generation_attempt}
          </span>
        )}
      </div>
    </div>
  );
}
