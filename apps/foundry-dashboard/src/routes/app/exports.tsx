import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { z } from 'zod';
import { ActionButton } from '@/components/ui';
import { ExportModal, ClipboardActions, type ExportConfig } from '@/components/exports';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { useToast } from '@/lib/toast';
import { EXPORT_CONFIG, UI_CONFIG } from '@/lib/constants';

const exportsSearchSchema = z.object({
  hubId: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/app/exports')({
  validateSearch: (search) => exportsSearchSchema.parse(search),
  component: ExportsPage,
});

interface ExportHistoryItem {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'csv' | 'json';
  spokeCount: number;
  platforms: string[];
  includesScheduling: boolean;
  includesMedia: boolean;
  downloadUrl?: string;
}

function ExportsPage() {
  const { hubId } = Route.useSearch();
  const clientId = useClientId();
  const { addToast } = useToast();
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);

  // tRPC Queries
  const exportsListQuery = trpc.exports.list.useQuery(
    { clientId: clientId!, limit: EXPORT_CONFIG.HISTORY_LIMIT },
    { enabled: !!clientId }
  );

  const createExportMutation = trpc.exports.create.useMutation({
    onSuccess: () => {
      setShowExportModal(false);
      exportsListQuery.refetch();
      addToast('Export started successfully', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    },
    onError: (err) => {
      addToast(`Export failed: ${err.message}`, 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
  });

  const handleExport = (config: ExportConfig) => {
    if (!clientId) return;

    createExportMutation.mutate({
      clientId,
      format: config.format,
      platforms: config.platforms.length > 0 ? config.platforms : undefined,
      groupByPlatform: config.groupByPlatform,
      includeScheduling: config.includeScheduling,
      includeVisuals: config.includeVisuals,
      hubIds: hubId ? [hubId] : config.hubIds,
    });
  };

  const handleDownload = async (exportId: string, format: string) => {
    if (!clientId) return;

    try {
      const result = await trpc.exports.getDownloadUrl.useQuery({
        clientId,
        exportId,
      });

      if (result.data?.url) {
        window.open(result.data.url, '_blank');
      } else {
        throw new Error('Download URL not available');
      }
    } catch (err) {
      console.error('Download failed:', err);
      addToast('Failed to get download link', 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    }
  };

  const exports = useMemo(() => {
    return (exportsListQuery.data?.items || []) as ExportHistoryItem[];
  }, [exportsListQuery.data]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Content Exports
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Export your approved content for publishing across platforms
          </p>
        </div>
        <ActionButton
          variant="approve"
          onClick={() => setShowExportModal(true)}
          data-testid="create-export-button"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          New Export
        </ActionButton>
      </div>

      {/* Quick Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--approve-glow)] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[var(--approve)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <div className="font-bold text-[var(--text-primary)]">CSV Export</div>
              <div className="text-xs text-[var(--text-secondary)]">
                Excel-compatible
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Export to CSV for use in spreadsheets, scheduling tools, and analytics platforms.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--edit)] bg-opacity-10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[var(--edit)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <div>
              <div className="font-bold text-[var(--text-primary)]">JSON Export</div>
              <div className="text-xs text-[var(--text-secondary)]">
                Developer-friendly
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Export as JSON for API integrations, custom workflows, and programmatic publishing.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--warning)] bg-opacity-10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[var(--warning)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <div className="font-bold text-[var(--text-primary)]">Quick Copy</div>
              <div className="text-xs text-[var(--text-secondary)]">
                Clipboard actions
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            One-click copy to clipboard in multiple formats for instant use.
          </p>
        </div>
      </div>

      {/* Export History */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Export History
        </h2>

        {exportsListQuery.isLoading ? (
          <div className="flex items-center justify-center py-12" data-testid="exports-loading">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--edit)]" />
          </div>
        ) : exports.length === 0 ? (
          <div className="text-center py-12 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl" data-testid="exports-empty-state">
            <svg
              className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No Exports Yet
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Create your first export to download your approved content
            </p>
            <ActionButton
              variant="approve"
              onClick={() => setShowExportModal(true)}
            >
              Create Export
            </ActionButton>
          </div>
        ) : (
          <div className="space-y-3">
            {exports.map((exp) => (
              <div
                key={exp.id}
                className="p-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors"
                data-testid={`export-${exp.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 rounded-md bg-[var(--bg-surface)] text-xs font-bold uppercase text-[var(--text-primary)]">
                        {exp.format}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-bold ${
                          exp.status === 'completed'
                            ? 'bg-[var(--approve-glow)] text-[var(--approve)]'
                            : exp.status === 'processing'
                            ? 'bg-[var(--edit)] bg-opacity-10 text-[var(--edit)]'
                            : exp.status === 'failed'
                            ? 'bg-[var(--kill-glow)] text-[var(--kill)]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-[var(--text-muted)]">Spokes</div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {exp.spokeCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)]">Platforms</div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {exp.platforms.length || 'All'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)]">Scheduling</div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {exp.includesScheduling ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)]">Media</div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {exp.includesMedia ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-2">
                      {new Date(exp.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {exp.status === 'completed' && (
                      <ActionButton
                        variant="approve"
                        size="sm"
                        onClick={() => handleDownload(exp.id, exp.format)}
                        data-testid={`download-${exp.id}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download
                      </ActionButton>
                    )}
                    {exp.status === 'processing' && (
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--edit)]" />
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isLoading={createExportMutation.isPending}
        defaultHubIds={hubId ? [hubId] : []}
      />
    </div>
  );
}
