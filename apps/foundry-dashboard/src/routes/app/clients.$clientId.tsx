/**
 * Client Detail Page - View Brand DNA results and client overview
 * Route: /app/clients/:clientId
 *
 * Post-Brand DNA ingestion landing page for agency owners
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useClientRole } from '@/lib/use-client-role';

export const Route = createFileRoute('/app/clients/$clientId')({
  component: ClientDetailPage,
});

// Strength score color based on percentage
function getStrengthColor(score: number): string {
  if (score >= 80) return 'var(--approve)';
  if (score >= 60) return 'var(--warning)';
  if (score >= 40) return '#FFAD1F';
  return 'var(--text-muted)';
}

function ClientDetailPage() {
  const { clientId } = Route.useParams();
  const { isAgencyOwner, canManageTeam } = useClientRole();

  // Fetch client details
  const clientQuery = trpc.clients.getById.useQuery({ clientId });

  // Fetch Brand DNA report
  const dnaReportQuery = trpc.clients.getDNAReport.useQuery(
    { clientId },
    { enabled: !!clientId }
  );

  if (clientQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--edit)' }} />
      </div>
    );
  }

  if (clientQuery.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Client Not Found
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {clientQuery.error.message || 'Unable to load client details.'}
          </p>
        </div>
        <Link
          to="/app/clients"
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
        >
          ← Back to Clients
        </Link>
      </div>
    );
  }

  const client = clientQuery.data;
  const dnaReport = dnaReportQuery.data;
  const strengthScore = dnaReport?.strengthScore ?? 0;
  const hasCompleteDNA = strengthScore >= 25;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Client Avatar */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: client?.brandColor || 'var(--edit)' }}
          >
            {client?.name?.substring(0, 2).toUpperCase() || '??'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {client?.name || 'Unknown Client'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {client?.industry || 'No industry specified'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {canManageTeam && (
            <Link
              to="/app/clients/$clientId/settings"
              params={{ clientId }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          )}
        </div>
      </div>

      {/* Brand DNA Section */}
      <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Brand DNA Profile
          </h2>
          {hasCompleteDNA && (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Strength Score:</span>
              <span className="font-bold" style={{ color: getStrengthColor(strengthScore) }}>
                {strengthScore}%
              </span>
            </div>
          )}
        </div>

        {dnaReportQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--edit)' }} />
          </div>
        ) : hasCompleteDNA ? (
          <div className="space-y-6">
            {/* Tone Profile */}
            {dnaReport?.toneProfile && Object.keys(dnaReport.toneProfile).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Tone Profile
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dnaReport.toneProfile).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Markers */}
            {dnaReport?.voiceMarkers && dnaReport.voiceMarkers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Voice Markers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dnaReport.voiceMarkers.map((marker, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: 'rgba(29, 155, 240, 0.1)', color: 'var(--edit)' }}
                    >
                      {String(marker)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Banned Words */}
            {dnaReport?.bannedWords && dnaReport.bannedWords.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Banned Words
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dnaReport.bannedWords.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: 'rgba(244, 33, 46, 0.1)', color: 'var(--kill)' }}
                    >
                      {String(word)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Stances */}
            {dnaReport?.stances && dnaReport.stances.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Brand Stances
                </h3>
                <ul className="space-y-2">
                  {dnaReport.stances.map((stance, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span style={{ color: 'var(--approve)' }}>•</span>
                      {String(stance)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Last Calibration */}
            {dnaReport?.lastCalibration && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Last calibrated: {new Date(dnaReport.lastCalibration).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Brand DNA Not Yet Captured
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              The client hasn't completed their Brand DNA profile yet.
            </p>
            {isAgencyOwner && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                You can resend the invitation from the Clients page.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {hasCompleteDNA && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/app/hubs/new"
            className="flex items-center gap-4 p-4 rounded-xl border transition-colors hover:border-[var(--edit)]"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(29, 155, 240, 0.1)' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--edit)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Create Hub</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Start generating content for this client
              </p>
            </div>
          </Link>

          <Link
            to="/app/brand-dna"
            className="flex items-center gap-4 p-4 rounded-xl border transition-colors hover:border-[var(--edit)]"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 210, 106, 0.1)' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--approve)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Calibrate DNA</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Fine-tune the voice profile
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Back Link */}
      <div>
        <Link
          to="/app/clients"
          className="text-sm font-medium transition-colors hover:underline"
          style={{ color: 'var(--edit)' }}
        >
          ← Back to all clients
        </Link>
      </div>
    </div>
  );
}
