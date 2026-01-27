import { useNavigate } from '@tanstack/react-router';
import { ActionButton } from '@/components/ui';

interface SavedSession {
  key: string;
  index: number;
  stats: {
    total: number;
    approved: number;
    killed: number;
    edited: number;
  };
  perClientStats?: Record<string, { total: number; reviewed: number }>;
  timestamp: number;
  isMultiClient: boolean;
  clientNames: string[];
  filter: string;
  resumeUrl: string;
}

interface MultiSessionDashboardProps {
  sessions: SavedSession[];
}

function formatDistanceToNow(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export function MultiSessionDashboard({ sessions }: MultiSessionDashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Resume Your Sprints</h2>
        <p className="text-[var(--text-secondary)] mt-1">
          You have {sessions.length} in-progress review session{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4">
        {sessions.map(session => {
          const reviewed = session.stats.approved + session.stats.killed;
          const progress = session.stats.total > 0 ? Math.round((reviewed / session.stats.total) * 100) : 0;

          return (
            <div
              key={session.key}
              className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6 hover:border-[var(--border-hover)] transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  {/* Session Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {session.isMultiClient
                        ? `Multi-Client: ${session.clientNames.slice(0, 3).join(', ')}${session.clientNames.length > 3 ? ` +${session.clientNames.length - 3} more` : ''}`
                        : session.clientNames[0] || 'Review Sprint'}
                    </h3>
                    {session.isMultiClient && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--approve)]/20 text-[var(--approve)]">
                        🏢 Agency
                      </span>
                    )}
                  </div>

                  {/* Filter Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-[var(--edit)]/20 text-[var(--edit)] capitalize">
                      {session.filter.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Progress Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">
                        {reviewed} of {session.stats.total} reviewed
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {progress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--edit)] to-[var(--approve)] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Stats Pills */}
                    <div className="flex items-center gap-2 pt-1">
                      {session.stats.approved > 0 && (
                        <span className="text-xs text-[var(--approve)]">
                          ✓ {session.stats.approved} approved
                        </span>
                      )}
                      {session.stats.edited > 0 && (
                        <span className="text-xs text-[var(--edit)]">
                          ✎ {session.stats.edited} edited
                        </span>
                      )}
                      {session.stats.killed > 0 && (
                        <span className="text-xs text-[var(--kill)]">
                          ✗ {session.stats.killed} killed
                        </span>
                      )}
                    </div>

                    {/* Last Active */}
                    <p className="text-xs text-[var(--text-muted)] pt-1">
                      Last active: {formatDistanceToNow(session.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Resume Button */}
                <ActionButton
                  variant="approve"
                  size="sm"
                  onClick={() => navigate({ to: '/app/review', search: session.resumeUrl })}
                  className="flex-shrink-0"
                >
                  Resume
                </ActionButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start New Sprint Button */}
      <div className="pt-4">
        <button
          onClick={() => navigate({ to: '/app/review' })}
          className="w-full p-4 rounded-lg border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--approve)] hover:bg-[var(--approve)]/5 transition-colors text-[var(--text-secondary)] hover:text-[var(--approve)] font-semibold"
        >
          + Start New Sprint
        </button>
      </div>
    </div>
  );
}
