import * as React from 'react';
import { useState, useEffect } from 'react';
import { ActionButton } from '@/components/ui';
import { ExportFormatSelector } from './ExportFormatSelector';
import { PlatformGrouper } from './PlatformGrouper';
import { cn } from '@/lib/utils';

/**
 * Export Modal - Stories 6.1-6.4
 * Comprehensive export configuration with format selection,
 * platform grouping, scheduling metadata, and media downloads
 */

type Platform = 'twitter' | 'linkedin' | 'tiktok' | 'instagram' | 'carousel' | 'thread' | 'youtube_thumbnail';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  isLoading?: boolean;
  defaultHubIds?: string[];
}

export interface ExportConfig {
  format: 'csv' | 'json';
  platforms: Platform[];
  groupByPlatform: boolean;
  includeScheduling: boolean;
  includeVisuals: boolean;
  hubIds?: string[];
}

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  isLoading = false,
  defaultHubIds = [],
}: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [groupByPlatform, setGroupByPlatform] = useState(false);
  const [includeScheduling, setIncludeScheduling] = useState(true);
  const [includeVisuals, setIncludeVisuals] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormat('csv');
      setSelectedPlatforms([]);
      setGroupByPlatform(false);
      setIncludeScheduling(true);
      setIncludeVisuals(false);
    }
  }, [isOpen]);

  const handleTogglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleExport = () => {
    onExport({
      format,
      platforms: selectedPlatforms,
      groupByPlatform,
      includeScheduling,
      includeVisuals,
      hubIds: defaultHubIds.length > 0 ? defaultHubIds : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="export-modal"
    >
      <div
        className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Export Content
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Configure export settings and download your content
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            data-testid="export-modal-close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Story 6.1: Format Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Export Format
            </label>
            <ExportFormatSelector value={format} onChange={setFormat} />
          </div>

          {/* Story 6.2: Platform Selection & Grouping */}
          <PlatformGrouper
            selectedPlatforms={selectedPlatforms}
            onTogglePlatform={handleTogglePlatform}
            groupByPlatform={groupByPlatform}
            onToggleGrouping={setGroupByPlatform}
          />

          {/* Story 6.3: Scheduling Metadata */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                Include Scheduling Metadata
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Add suggested posting times and scheduling dates
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncludeScheduling(!includeScheduling)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                includeScheduling ? 'bg-[var(--approve)]' : 'bg-[var(--bg-elevated)]'
              )}
              data-testid="include-scheduling-toggle"
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  includeScheduling ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Story 6.4: Media Asset Download */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                Download Media Assets
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Include images, videos, and other media files
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncludeVisuals(!includeVisuals)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                includeVisuals ? 'bg-[var(--approve)]' : 'bg-[var(--bg-elevated)]'
              )}
              data-testid="include-visuals-toggle"
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  includeVisuals ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Export Preview */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Export Preview
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Format</div>
                <div className="text-sm font-bold text-[var(--text-primary)] uppercase">
                  {format}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Platforms</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {selectedPlatforms.length === 0 ? 'All' : selectedPlatforms.length}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Scheduling</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {includeScheduling ? 'Included' : 'Excluded'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Media</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {includeVisuals ? 'Included' : 'Excluded'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-subtle)]">
          <ActionButton variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="approve"
            onClick={handleExport}
            isLoading={isLoading}
            data-testid="export-submit"
          >
            {isLoading ? 'Exporting...' : 'Export Content'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
