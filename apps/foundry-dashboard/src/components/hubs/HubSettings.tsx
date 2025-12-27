/**
 * Story 3-4: Hub Metadata and State Management
 * Component for managing hub settings, metadata, and status
 * Provides hub title editing, status management, and archival
 */

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import type { Hub, HubStatus } from '../../../worker/types';

interface HubSettingsProps {
  hub: Hub;
  onUpdate?: (hub: Hub) => void;
  onArchive?: (hubId: string) => void;
  showArchive?: boolean;
}

// Status badge configuration
const STATUS_CONFIG = {
  processing: { label: 'Processing', bgColor: 'var(--warning)', textColor: '#000' },
  ready: { label: 'Ready', bgColor: 'var(--approve)', textColor: '#fff' },
  archived: { label: 'Archived', bgColor: 'var(--text-muted)', textColor: '#fff' },
} as const;

// Source type labels
const SOURCE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF Document',
  text: 'Pasted Text',
  url: 'URL Content',
};

/**
 * HubSettings - Hub metadata and configuration management
 *
 * Features:
 * - Hub title display and editing
 * - Status badge with color coding (Processing, Ready, Archived)
 * - Source type and creation date display
 * - Pillar and spoke count statistics
 * - Archive hub functionality with confirmation
 * - Real-time metadata updates
 *
 * Status Indicators:
 * - Processing (Orange): Hub is being created or modified
 * - Ready (Green): Hub is complete and ready for spoke generation
 * - Archived (Gray): Hub has been soft-deleted by user
 *
 * Metadata Displayed:
 * - Title: Editable hub name
 * - Source Type: PDF, Text, or URL
 * - Created Date: Formatted creation timestamp
 * - Pillar Count: Number of content pillars
 * - Spoke Count: Number of generated spokes
 *
 * @param hub - Hub object with metadata
 * @param onUpdate - Callback when hub is updated
 * @param onArchive - Callback when hub is archived
 * @param showArchive - Whether to show archive button (default: true)
 */
export function HubSettings({
  hub,
  onUpdate,
  onArchive,
  showArchive = true,
}: HubSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(hub.title);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const archiveMutation = trpc.hubs.archive.useMutation();

  const statusConfig = STATUS_CONFIG[hub.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.ready;

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleTitleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleTitleSave = useCallback(() => {
    setIsEditing(false);
    // In a real implementation, this would call a tRPC mutation to update the hub title
    // For now, just trigger the callback
    if (title !== hub.title) {
      onUpdate?.({ ...hub, title });
    }
  }, [title, hub, onUpdate]);

  const handleTitleCancel = useCallback(() => {
    setTitle(hub.title);
    setIsEditing(false);
  }, [hub.title]);

  const handleArchive = useCallback(() => {
    archiveMutation.mutate(
      { hubId: hub.id, clientId: hub.client_id },
      {
        onSuccess: () => {
          onArchive?.(hub.id);
          setShowArchiveConfirm(false);
        },
      }
    );
  }, [hub.id, hub.client_id, archiveMutation, onArchive]);

  return (
    <div className="space-y-6" data-testid="hub-settings">
      {/* Header with Title and Status */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-2xl font-semibold bg-transparent border-b-2 outline-none transition-colors"
                  style={{
                    color: 'var(--text-primary)',
                    borderColor: 'var(--edit)',
                  }}
                  maxLength={255}
                  autoFocus
                  data-testid="hub-title-input"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTitleSave}
                    className="px-3 py-1 text-xs font-medium rounded transition-colors"
                    style={{
                      backgroundColor: 'var(--approve)',
                      color: '#fff',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleTitleCancel}
                    className="px-3 py-1 text-xs font-medium rounded transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {hub.title}
                </h2>
                <button
                  onClick={handleTitleEdit}
                  className="p-1.5 rounded transition-colors hover:bg-opacity-20"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Edit hub title"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <span
            className="px-3 py-1 rounded text-sm font-medium"
            style={{
              backgroundColor: statusConfig.bgColor,
              color: statusConfig.textColor,
            }}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>{SOURCE_TYPE_LABELS[hub.source_type] || hub.source_type}</span>
          <span>•</span>
          <span>{formatDate(hub.created_at)}</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {hub.pillar_count}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Content Pillars
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {hub.spoke_count}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Generated Spokes
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-secondary)' }}>
            ~{hub.pillar_count * 7}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Potential Spokes
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {hub.status === 'ready' ? '100%' : '...'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Completion
          </p>
        </div>
      </div>

      {/* Actions */}
      {showArchive && hub.status !== 'archived' && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Archive Hub
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Remove this hub from your active list. This action can be undone.
              </p>
            </div>

            {showArchiveConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Are you sure?
                </span>
                <button
                  onClick={handleArchive}
                  disabled={archiveMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--kill)',
                    color: '#fff',
                  }}
                  data-testid="confirm-archive-btn"
                >
                  {archiveMutation.isPending ? 'Archiving...' : 'Archive'}
                </button>
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowArchiveConfirm(true)}
                className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--kill)',
                }}
                data-testid="archive-hub-btn"
              >
                Archive
              </button>
            )}
          </div>

          {archiveMutation.isError && (
            <p className="mt-2 text-xs" style={{ color: 'var(--kill)' }}>
              Failed to archive: {archiveMutation.error?.message}
            </p>
          )}
        </div>
      )}

      {/* Archived State */}
      {hub.status === 'archived' && (
        <div
          className="p-4 rounded-lg border flex items-center gap-3"
          style={{
            backgroundColor: 'rgba(128, 128, 128, 0.1)',
            borderColor: 'var(--text-muted)',
          }}
        >
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              This hub has been archived
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Content is preserved but hidden from active views
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * HubSettingsCompact - Compact version for inline display
 */
interface HubSettingsCompactProps {
  hub: Hub;
}

export function HubSettingsCompact({ hub }: HubSettingsCompactProps) {
  const statusConfig = STATUS_CONFIG[hub.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.ready;

  return (
    <div className="flex items-center gap-4 text-sm" data-testid="hub-settings-compact">
      <span
        className="px-2 py-0.5 rounded text-xs font-medium"
        style={{
          backgroundColor: statusConfig.bgColor,
          color: statusConfig.textColor,
        }}
      >
        {statusConfig.label}
      </span>
      <span style={{ color: 'var(--text-muted)' }}>
        {SOURCE_TYPE_LABELS[hub.source_type] || hub.source_type}
      </span>
      <span style={{ color: 'var(--text-muted)' }}>
        {hub.pillar_count} pillars
      </span>
      <span style={{ color: 'var(--text-muted)' }}>
        {hub.spoke_count} spokes
      </span>
    </div>
  );
}
