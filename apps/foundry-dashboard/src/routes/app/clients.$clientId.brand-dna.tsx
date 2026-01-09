/**
 * R-14: Dedicated Client Brand DNA Results Page
 *
 * Agency-facing view of client's Brand DNA analysis results.
 * Shows complete DNA profile with tone, voice markers, banned words, and stances.
 */

import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useClientRole } from '@/lib/use-client-role';
import { BrandDNACard } from '@/components/brand-dna/BrandDNACard';
import { ScoreTooltip } from '@/components/brand-dna/ScoreTooltip';

export const Route = createFileRoute('/app/clients/$clientId/brand-dna')({
  component: ClientBrandDNAPage,
});

function ClientBrandDNAPage() {
  const { clientId } = useParams({ from: '/app/clients/$clientId/brand-dna' });

  // RBAC: Check if user can view this client
  const { canViewClient } = useClientRole();

  // CRITICAL: Use calibration.getBrandDNAReport for FULL report
  // NOT clients.getDNAReport (only returns strength score)
  const dnaReportQuery = trpc.calibration.getBrandDNAReport.useQuery(
    { clientId },
    {
      enabled: !!clientId,
      // Auto-refresh every 10s if no data (processing state)
      refetchInterval: (data) => (!data ? 10000 : false),
    }
  );

  const clientQuery = trpc.clients.getById.useQuery({ clientId });

  const client = clientQuery.data;
  const report = dnaReportQuery.data;
  const isProcessing = !report && !dnaReportQuery.error;

  // AC2: RBAC - Access denied if user doesn't own client
  if (!canViewClient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Access Denied
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          You don't have permission to view this client's Brand DNA.
        </p>
        <Link
          to="/app/clients"
          className="inline-block px-4 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--edit)', color: 'white' }}
        >
          ← Back to Clients
        </Link>
      </div>
    );
  }

  // Loading state
  if (clientQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: 'var(--edit)' }}
        />
      </div>
    );
  }

  // Error state
  if (clientQuery.error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--kill)' }}>
          Error Loading Client
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          {clientQuery.error.message}
        </p>
        <Link
          to="/app/clients"
          className="inline-block px-4 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--edit)', color: 'white' }}
        >
          ← Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/app/clients/$clientId"
            params={{ clientId }}
            className="text-sm mb-2 block hover:underline"
            style={{ color: 'var(--edit)' }}
          >
            ← Back to {client?.name || 'Client'}
          </Link>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {client?.name}'s Brand DNA
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Complete voice profile and brand intelligence analysis
          </p>
        </div>

        {/* AC3: Strength score with visual indicator */}
        {report && (
          <div className="flex items-center gap-2">
            <ScoreTooltip score={report.strengthScore} />
            <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {report.strengthScore}%
            </span>
          </div>
        )}
      </div>

      {/* AC7: Processing Banner */}
      {isProcessing && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(29, 155, 240, 0.1)', border: '1px solid var(--edit)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="animate-spin rounded-full h-5 w-5 border-b-2"
              style={{ borderColor: 'var(--edit)' }}
            />
            <span style={{ color: 'var(--text-primary)' }}>
              Brand DNA is being analyzed. Results will appear shortly.
            </span>
          </div>
          <button
            onClick={() => dnaReportQuery.refetch()}
            className="px-3 py-1 rounded hover:opacity-80 transition-opacity text-sm font-medium"
            style={{ backgroundColor: 'var(--edit)', color: 'white' }}
          >
            Refresh
          </button>
        </div>
      )}

      {/* DNA Report Error */}
      {dnaReportQuery.error && (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: 'rgba(244, 33, 46, 0.1)', border: '1px solid var(--kill)' }}
        >
          <span style={{ color: 'var(--kill)' }}>
            Failed to load Brand DNA: {dnaReportQuery.error.message}
          </span>
        </div>
      )}

      {/* AC2, AC3: Main Content - Reuse BrandDNACard (read-only) */}
      {report && (
        <>
          <BrandDNACard
            report={report}
            onAddSamples={undefined}      // Read-only for agency view
            onRecordVoice={undefined}     // Read-only for agency view
            onEditVoiceProfile={undefined} // Read-only for agency view
          />

          {/* AC5: Extraction Metadata */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Extraction Details
            </h3>
            <div className="flex gap-6 text-sm flex-wrap">
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Captured:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>
                  {report.lastCalibration
                    ? new Date(report.lastCalibration).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Not yet calibrated'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Voice Markers:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{report.voiceMarkers.length}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Banned Words:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{report.bannedWords.length}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Brand Stances:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{report.stances.length}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* AC4: Action Bar CTAs */}
      {report && (
        <div className="flex gap-4">
          <Link
            to="/app/hubs/new"
            search={{ clientId }}
            className="flex-1 py-3 rounded-xl text-center font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--approve)', color: 'white' }}
          >
            Create Hub for {client?.name}
          </Link>
          <Link
            to="/app/brand-dna"
            className="flex-1 py-3 rounded-xl text-center font-medium hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Fine-tune DNA
          </Link>
        </div>
      )}

      {/* No Data State - Invitation CTA */}
      {!report && !isProcessing && !dnaReportQuery.error && (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            No Brand DNA Yet
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            This client hasn't completed their Brand DNA capture yet.
          </p>
          <Link
            to="/app/clients/$clientId"
            params={{ clientId }}
            className="inline-block px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--edit)', color: 'white' }}
          >
            Send Invitation
          </Link>
        </div>
      )}
    </div>
  );
}
