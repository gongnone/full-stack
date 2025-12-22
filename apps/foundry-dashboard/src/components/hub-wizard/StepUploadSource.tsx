/**
 * Story 3-1: Source Selection & Upload Wizard
 * StepUploadSource - Tab interface orchestrating upload options
 */

import { useState } from 'react';
import { SourceDropZone } from './SourceDropZone';
import { TextPasteTab } from './TextPasteTab';
import { UrlInputTab } from './UrlInputTab';
import { RecentSourcesList } from './RecentSourcesList';

type UploadTab = 'upload' | 'paste' | 'url';
type SourceType = 'pdf' | 'text' | 'url';

interface StepUploadSourceProps {
  clientId: string;
  onSourceSelected: (sourceId: string, sourceType: SourceType) => void;
}

function UploadIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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

const TABS: { id: UploadTab; label: string; Icon: typeof UploadIcon }[] = [
  { id: 'upload', label: 'Upload PDF', Icon: UploadIcon },
  { id: 'paste', label: 'Paste Text', Icon: TextIcon },
  { id: 'url', label: 'From URL', Icon: LinkIcon },
];

export function StepUploadSource({ clientId, onSourceSelected }: StepUploadSourceProps) {
  const [activeTab, setActiveTab] = useState<UploadTab>('upload');

  return (
    <div className="space-y-6">
      {/* Recent Sources - Quick Select */}
      <RecentSourcesList
        clientId={clientId}
        onSourceSelected={(sourceId, sourceType) => onSourceSelected(sourceId, sourceType)}
      />

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
        <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Or add new source
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
      </div>

      {/* Tab buttons */}
      <div
        className="flex rounded-lg p-1"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
              />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {activeTab === 'upload' && (
          <SourceDropZone
            clientId={clientId}
            onSourceCreated={(sourceId) => onSourceSelected(sourceId, 'pdf')}
          />
        )}
        {activeTab === 'paste' && (
          <TextPasteTab
            clientId={clientId}
            onSourceCreated={(sourceId) => onSourceSelected(sourceId, 'text')}
          />
        )}
        {activeTab === 'url' && (
          <UrlInputTab
            clientId={clientId}
            onSourceCreated={(sourceId) => onSourceSelected(sourceId, 'url')}
          />
        )}
      </div>
    </div>
  );
}
