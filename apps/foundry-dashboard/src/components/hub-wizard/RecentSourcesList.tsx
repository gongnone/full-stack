/**
 * Story 3-1: Source Selection & Upload Wizard
 * RecentSourcesList - Quick-select up to 3 recent sources
 */

import { trpc } from '@/lib/trpc-client';

type SourceType = 'pdf' | 'text' | 'url';

interface RecentSourcesListProps {
  clientId: string;
  onSourceSelected: (sourceId: string, sourceType: SourceType) => void;
  disabled?: boolean;
}

function DocumentIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function TextIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

function LinkIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function getSourceIcon(sourceType: string) {
  switch (sourceType) {
    case 'pdf':
      return DocumentIcon;
    case 'url':
      return LinkIcon;
    default:
      return TextIcon;
  }
}

function formatWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k words`;
  }
  return `${count} words`;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function RecentSourcesList({ clientId, onSourceSelected, disabled }: RecentSourcesListProps) {
  const { data: recentSources, isLoading } = trpc.hubs.getRecentSources.useQuery(
    { clientId, limit: 3 },
    { enabled: !!clientId }
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse h-16 rounded-lg"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          />
        ))}
      </div>
    );
  }

  if (!recentSources?.length) {
    return (
      <div
        className="text-center py-8 rounded-lg"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <TextIcon className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No recent sources
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Upload a PDF, paste text, or add a URL to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Recent Sources
      </p>
      {recentSources.map((source) => {
        const Icon = getSourceIcon(source.source_type);
        const isPending = source.status === 'pending';

        return (
          <button
            key={source.id}
            onClick={() => onSourceSelected(source.id, source.source_type as SourceType)}
            disabled={disabled || isPending}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: isPending ? 'var(--warning)' : 'var(--edit)',
                opacity: isPending ? 0.5 : 1,
              }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-medium truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {source.title || 'Untitled'}
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {isPending ? (
                  <span style={{ color: 'var(--warning)' }}>Processing...</span>
                ) : (
                  <>
                    <span>{formatWordCount(source.word_count)}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(source.created_at)}</span>
                  </>
                )}
              </div>
            </div>
            <svg
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
