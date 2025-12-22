/**
 * Story 3.4: Hub Metadata & State Management
 * HubCard - Displays Hub summary with navigation
 */

import { Link } from '@tanstack/react-router';
import type { HubListItem } from '../../../worker/types';

interface HubCardProps {
  hub: HubListItem;
}

// Source type icons
function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-6 4h3" />
    </svg>
  );
}

function TextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UrlIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function SourceTypeIcon({ type, className, style }: { type: HubListItem['sourceType']; className?: string; style?: React.CSSProperties }) {
  switch (type) {
    case 'pdf':
      return <PdfIcon className={className} />;
    case 'text':
      return <TextIcon className={className} />;
    case 'url':
      return <UrlIcon className={className} />;
    default:
      return <TextIcon className={className} />;
  }
}

function StatusBadge({ status }: { status: HubListItem['status'] }) {
  const statusConfig = {
    processing: {
      label: 'Processing',
      bgColor: 'var(--warning)',
      textColor: '#000',
    },
    ready: {
      label: 'Ready',
      bgColor: 'var(--approve)',
      textColor: '#fff',
    },
    archived: {
      label: 'Archived',
      bgColor: 'var(--text-muted)',
      textColor: '#fff',
    },
  };

  const config = statusConfig[status] || statusConfig.ready;

  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      {config.label}
    </span>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function HubCard({ hub }: HubCardProps) {
  return (
    <Link
      to="/app/hubs/$hubId"
      params={{ hubId: hub.id }}
      className="block rounded-lg p-4 transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
      activeProps={{
        style: { borderColor: 'var(--edit)' },
      }}
      // Hover effect via inline style not fully supported, use CSS module or Tailwind in production
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Title */}
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            <SourceTypeIcon type={hub.sourceType} className="w-5 h-5" style={{ color: 'var(--text-muted)' } as React.CSSProperties} />
          </div>
          <div className="min-w-0">
            <h3
              className="font-medium text-sm truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {hub.title}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {formatDate(hub.createdAt)}
            </p>
          </div>
        </div>

        {/* Right: Status badge */}
        <StatusBadge status={hub.status} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>{hub.pillarCount} pillars</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{hub.spokeCount} spokes</span>
        </div>
      </div>
    </Link>
  );
}

// Export for barrel file
export default HubCard;
