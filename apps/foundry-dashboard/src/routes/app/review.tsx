import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { z } from 'zod';
import { ActionButton, ScoreBadge, KeyboardHint } from '@/components/ui';
import { BucketCard, SprintComplete, KillConfirmationModal, CloneSpokeModal } from '@/components/review';
import type { CloneOptions } from '@/components/review';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';

// P0-2.1: Multi-Client Agency Sprint support
const reviewSearchSchema = z.object({
  filter: z.string().optional().catch(undefined),
  clients: z.string().optional().catch(undefined), // "abc,def,ghi" or "priority"
});

export const Route = createFileRoute('/app/review')({
  validateSearch: (search) => reviewSearchSchema.parse(search),
  component: ReviewPage,
});

function ReviewPage() {
  const { filter: rawFilter, clients: rawClients } = Route.useSearch();
  const navigate = useNavigate();
  const clientId = useClientId();

  // P0-2.1: Parse client IDs from URL parameter
  const clientIds = useMemo(() => {
    if (!rawClients) return undefined;
    // TODO: Handle "priority" keyword by fetching user's priority clients
    // if (rawClients === 'priority') return userPriorityClients;
    return rawClients.split(',').filter(Boolean);
  }, [rawClients]);

  const isMultiClient = clientIds && clientIds.length > 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showKillModal, setShowKillModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'approve' | 'kill' | 'edit'; message: string } | null>(null);

  // P0-3: Session persistence state
  const [savedSessionRestored, setSavedSessionRestored] = useState(false);

  // Sprint stats tracking
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    killed: 0,
    edited: 0,
    avgDecisionMs: 150,
  });
  const decisionStartRef = useRef<number>(Date.now());

  // tRPC Queries - Bucket counts for tiles (single-client only)
  const highConfidenceCountQuery = trpc.review.getQueue.useQuery(
    { clientId: clientId!, filter: 'top10', limit: 100 },
    { enabled: !!clientId && !rawFilter && !isMultiClient }
  );
  const needsReviewCountQuery = trpc.review.getQueue.useQuery(
    { clientId: clientId!, filter: 'needs-review', limit: 100 },
    { enabled: !!clientId && !rawFilter && !isMultiClient }
  );
  const conflictsCountQuery = trpc.review.getQueue.useQuery(
    { clientId: clientId!, filter: 'flagged', limit: 100 },
    { enabled: !!clientId && !rawFilter && !isMultiClient }
  );
  const volumeQuery = trpc.analytics.getVolumeMetrics.useQuery(
    { clientId: clientId!, periodDays: 1 },
    { enabled: !!clientId && !rawFilter && !isMultiClient }
  );

  // P0-2.1: Active sprint queue query (supports both single and multi-client)
  const internalFilter = rawFilter === 'high-confidence' ? 'top10' :
                         rawFilter === 'conflicts' ? 'flagged' :
                         rawFilter === 'needs-review' ? 'needs-review' :
                         rawFilter === 'just-generated' ? 'just-generated' :
                         rawFilter === 'golden-nuggets' ? 'golden-nuggets' : 'all';

  const queueQuery = trpc.review.getQueue.useQuery(
    isMultiClient
      ? { clientIds, filter: internalFilter, limit: 100 }
      : { clientId: clientId!, filter: internalFilter, limit: 100 },
    { enabled: !!(clientId || (clientIds && clientIds.length > 0)) && !!rawFilter }
  );

  // Epic 12-1: Golden Nuggets count query (single-client only)
  const goldenNuggetsCountQuery = trpc.review.getQueue.useQuery(
    { clientId: clientId!, filter: 'golden-nuggets', limit: 100 },
    { enabled: !!clientId && !rawFilter && !isMultiClient }
  );

  const swipeMutation = trpc.review.swipeAction.useMutation();
  const bulkApproveMutation = trpc.review.bulkApprove.useMutation();
  const killHubMutation = trpc.review.killHub.useMutation();
  const editSpokeMutation = trpc.spokes.edit.useMutation({
    onSuccess: () => {
      setShowEditModal(false);
      setEditedContent('');
      queueQuery.refetch();
      setStats(prev => ({ ...prev, edited: prev.edited + 1 }));
    },
    onError: (err) => {
      alert(`Failed to save edit: ${err.message}`);
    },
  });

  // Clone mutation for Story R-4
  const cloneSpokeMutation = trpc.spokes.clone.useMutation({
    onSuccess: (result) => {
      setShowCloneModal(false);
      queueQuery.refetch();
      const modeLabel = result.mode === 'exact' ? 'copied' :
                        result.mode === 'platform' ? 'adapted' : 'queued for variation';
      alert(`Spoke ${modeLabel}! ${result.newSpokeIds.length} new spoke(s) created.`);
    },
    onError: (err) => {
      alert(`Failed to clone: ${err.message}`);
    },
  });

  const spokes = useMemo(() => queueQuery.data?.items || [], [queueQuery.data]);
  const currentSpoke = spokes[currentIndex];

  // Update stats when spokes load
  useEffect(() => {
    if (spokes.length > 0 && stats.total === 0) {
      setStats(prev => ({ ...prev, total: spokes.length }));
    }
  }, [spokes.length, stats.total]);

  // P0-3: Restore session on mount (supports multi-client)
  useEffect(() => {
    if (!rawFilter || spokes.length === 0) return;
    if (!clientId && !isMultiClient) return;

    // P0-2.1: Multi-client session key format
    const sessionKey = isMultiClient
      ? `review-session-multi-${[...clientIds!].sort().join('-')}-${rawFilter}`
      : `review-session-${clientId}-${rawFilter}`;

    const savedSession = localStorage.getItem(sessionKey);

    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const ONE_HOUR = 3600000;
        const isStale = Date.now() - session.timestamp > ONE_HOUR;

        if (isStale) {
          localStorage.removeItem(sessionKey);
        } else if (session.index < spokes.length) {
          // Restore session
          setCurrentIndex(session.index);
          setStats(session.stats);
          setSavedSessionRestored(true);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem(sessionKey);
      }
    }
  }, [rawFilter, clientId, clientIds, isMultiClient, spokes.length]);

  // P0-3: Save session on progress changes (supports multi-client)
  useEffect(() => {
    if (!rawFilter || spokes.length === 0 || !stats.total) return;
    if (!clientId && !isMultiClient) return;
    if (isComplete) return; // Don't save if sprint is complete

    // P0-2.1: Multi-client session key format
    const sessionKey = isMultiClient
      ? `review-session-multi-${[...clientIds!].sort().join('-')}-${rawFilter}`
      : `review-session-${clientId}-${rawFilter}`;

    // P0-2.1: Calculate per-client stats for multi-client mode
    const perClientStats = isMultiClient
      ? clientIds!.reduce((acc, cId) => {
          const clientSpokes = spokes.filter((s: any) => s.clientId === cId);
          const reviewedClientSpokes = spokes.slice(0, currentIndex + 1).filter((s: any) => s.clientId === cId);
          acc[cId] = {
            total: clientSpokes.length,
            reviewed: reviewedClientSpokes.length,
          };
          return acc;
        }, {} as Record<string, { total: number; reviewed: number }>)
      : undefined;

    const session = {
      index: currentIndex,
      stats,
      perClientStats,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(sessionKey, JSON.stringify(session));
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  }, [rawFilter, clientId, clientIds, isMultiClient, currentIndex, stats, spokes, isComplete]);

  // P0-3: Clear session on completion (supports multi-client)
  useEffect(() => {
    if (!rawFilter) return;
    if (!clientId && !isMultiClient) return;

    if (isComplete) {
      const sessionKey = isMultiClient
        ? `review-session-multi-${[...clientIds!].sort().join('-')}-${rawFilter}`
        : `review-session-${clientId}-${rawFilter}`;
      localStorage.removeItem(sessionKey);
    }
  }, [isComplete, rawFilter, clientId, clientIds, isMultiClient]);

  const handleAction = useCallback((action: 'approve' | 'kill') => {
    if (!currentSpoke || !clientId) return;

    // Track decision time
    const decisionTime = Date.now() - decisionStartRef.current;
    setStats(prev => ({
      ...prev,
      [action === 'approve' ? 'approved' : 'killed']: prev[action === 'approve' ? 'approved' : 'killed'] + 1,
      avgDecisionMs: Math.round((prev.avgDecisionMs * (prev.approved + prev.killed) + decisionTime) / (prev.approved + prev.killed + 1)),
    }));

    setDirection(action === 'approve' ? 'right' : 'left');

    // P0-2: Set action feedback for visual confirmation
    setActionFeedback({
      type: action,
      message: action === 'approve' ? '✓ Approved! Moving to next...' : '✗ Killed. Next spoke...'
    });

    swipeMutation.mutate({
      clientId,
      spokeId: currentSpoke.id,
      action: action === 'approve' ? 'approve' : 'reject'
    });

    setTimeout(() => {
      // Clear feedback before advancing
      setActionFeedback(null);

      if (currentIndex < spokes.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setDirection(null);
        decisionStartRef.current = Date.now();
      } else {
        setIsComplete(true);
      }
    }, 800);
  }, [currentIndex, spokes, clientId, currentSpoke, swipeMutation]);

  // Nuclear approve (Cmd+A)
  const handleNuclearApprove = useCallback(() => {
    if (!clientId) return;
    const highConfidenceSpokes = spokes.filter((s: typeof spokes[number]) => (s.qualityScores?.g7_engagement || 0) >= 9.5);
    if (highConfidenceSpokes.length === 0) return;

    bulkApproveMutation.mutate({
      clientId,
      spokeIds: highConfidenceSpokes.map((s: typeof spokes[number]) => s.id),
    });

    setStats(prev => ({ ...prev, approved: prev.approved + highConfidenceSpokes.length }));
    alert(`${highConfidenceSpokes.length} spokes approved (G7 >= 9.5)`);
  }, [clientId, spokes, bulkApproveMutation]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Sprint mode shortcuts
      if (rawFilter && !isComplete && currentSpoke) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') handleAction('approve');
        if (e.key === 'ArrowLeft' || e.key === 'Backspace') handleAction('kill');

        // Hold H for kill hub
        if (e.key === 'h' || e.key === 'H') {
          holdTimerRef.current = setTimeout(() => {
            setShowKillModal(true);
          }, 500);
        }

        // C for clone (high confidence only)
        if ((e.key === 'c' || e.key === 'C') && (currentSpoke.qualityScores?.g7_engagement || 0) >= 9.0) {
          setShowCloneModal(true);
        }

        // E for edit
        if (e.key === 'e' || e.key === 'E') {
          setEditedContent(currentSpoke.content);
          setShowEditModal(true);
        }
      }

      // Global shortcuts
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          navigate({ to: '/app/review', search: { filter: 'high-confidence' } });
        }
        if (e.key === 'a' && !e.shiftKey) {
          e.preventDefault();
          handleNuclearApprove();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [handleAction, isComplete, currentSpoke, rawFilter, navigate, handleNuclearApprove]);

  // Dashboard view (no filter selected)
  if (!rawFilter) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Sprint Review
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Select a bucket to start reviewing content
          </p>
        </div>

        {/* Bucket Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Epic 12-1: Golden Nuggets - Engagement Prediction >= 9 */}
          <BucketCard
            title="Golden Nuggets"
            count={goldenNuggetsCountQuery.data?.totalCount ?? 0}
            description="Predicted high engagement (9+)"
            filter="golden-nuggets"
            variant="green"
          />
          <BucketCard
            title="High Confidence"
            count={highConfidenceCountQuery.data?.totalCount ?? 0}
            description="G7 Quality > 9.0 - Ready for approval"
            filter="high-confidence"
            variant="green"
          />
          <BucketCard
            title="Needs Review"
            count={needsReviewCountQuery.data?.totalCount ?? 0}
            description="G7 5.0-9.0 - Human judgment needed"
            filter="needs-review"
            variant="yellow"
          />
          <BucketCard
            title="Creative Conflicts"
            count={conflictsCountQuery.data?.totalCount ?? 0}
            description="Failed 3x healing - Requires intervention"
            filter="conflicts"
            variant="red"
          />
          <BucketCard
            title="Just Generated"
            count={volumeQuery.data?.spokesGenerated ?? 0}
            description="Real-time feed of new content"
            filter="just-generated"
            variant="blue"
          />
        </div>

        {/* Keyboard Shortcuts Guide */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <KeyboardHint keys={['Cmd', 'H']} size="sm" />
              <span className="text-sm text-[var(--text-secondary)]">High Confidence Sprint</span>
            </div>
            <div className="flex items-center gap-3">
              <KeyboardHint keys={['Cmd', 'A']} size="sm" />
              <span className="text-sm text-[var(--text-secondary)]">Nuclear Approve (G7 9.5+)</span>
            </div>
            <div className="flex items-center gap-3">
              <KeyboardHint keys={['Hold', 'H']} size="sm" />
              <span className="text-sm text-[var(--text-secondary)]">Kill Hub</span>
            </div>
            <div className="flex items-center gap-3">
              <KeyboardHint keys={['C']} size="sm" />
              <span className="text-sm text-[var(--text-secondary)]">Clone Best</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (queueQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--edit)]" />
      </div>
    );
  }

  // Sprint Complete view
  if (isComplete || spokes.length === 0) {
    if (spokes.length === 0) {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                Sprint Review
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                Mode: <span className="capitalize text-[var(--edit)]">{rawFilter.replace('-', ' ')}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-[var(--text-muted)]">Progress</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">0 / 0</div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-[var(--approve-glow)] flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[var(--approve)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">No Items Found</h2>
            <p className="text-[var(--text-secondary)] mt-2 max-w-md">
              There is no content in the {rawFilter.replace('-', ' ')} queue.
            </p>
            <div className="mt-8">
              <ActionButton variant="approve" onClick={() => navigate({ to: '/app/review' })}>
                Back to Dashboard
              </ActionButton>
            </div>
          </div>
        </div>
      );
    }

    // P0-2.1: Calculate per-client stats for SprintComplete
    const perClientStats = isMultiClient && clientIds
      ? clientIds.reduce((acc, cId) => {
          const clientSpokes = spokes.filter((s: any) => s.clientId === cId);
          acc[cId] = {
            total: clientSpokes.length,
            approved: 0, // TODO: Track per-client in handleAction
            killed: 0,
            edited: 0,
          };
          return acc;
        }, {} as Record<string, { total: number; approved: number; killed: number; edited: number }>)
      : undefined;

    return (
      <SprintComplete
        stats={stats}
        filter={rawFilter}
        clientId={isMultiClient ? undefined : (clientId || '')}
        clientIds={isMultiClient ? clientIds : undefined}
        perClientStats={perClientStats}
        onBackToDashboard={() => navigate({ to: '/app/review' })}
        onReviewConflicts={() => navigate({ to: '/app/review', search: { filter: 'conflicts' } })}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Sprint Review
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Mode: <span className="capitalize text-[var(--edit)]">{rawFilter.replace('-', ' ')}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-[var(--text-muted)]">Progress</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {currentIndex + 1} / {spokes.length}
          </div>
        </div>
      </div>

      {/* P0-3: Welcome Back Banner */}
      {savedSessionRestored && (
        <div className="bg-[var(--edit-glow)] border border-[var(--edit)] rounded-xl p-6 mb-6 animate-slide-down">
          <div className="flex items-start gap-4">
            {/* Clock Icon */}
            <div className="flex-shrink-0">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--edit)] mb-2">
                Welcome back! Resuming where you left off
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                You've reviewed {currentIndex} of {spokes.length} spokes ({stats.approved} approved, {stats.killed} killed)
              </p>
            </div>

            {/* Start Over Button */}
            <button
              onClick={() => {
                setCurrentIndex(0);
                setStats({
                  total: spokes.length,
                  approved: 0,
                  killed: 0,
                  edited: 0,
                  avgDecisionMs: 150,
                });
                setSavedSessionRestored(false);
                // P0-2.1: Multi-client session key
                const sessionKey = isMultiClient
                  ? `review-session-multi-${[...clientIds!].sort().join('-')}-${rawFilter}`
                  : `review-session-${clientId}-${rawFilter}`;
                localStorage.removeItem(sessionKey);
              }}
              className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--edit)] text-sm font-semibold transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* P0-2: Progress Visualization */}
      <div className="mb-8">
        {/* Progress Stats */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">Progress</span>
          <div className="text-right">
            <span className="text-sm text-[var(--text-secondary)]">{currentIndex + 1} of {spokes.length} reviewed</span>
            {/* P0-2.1: Multi-client progress breakdown */}
            {isMultiClient && clientIds && (
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                {clientIds.slice(0, 5).map((cId, idx) => {
                  const clientSpokes = spokes.filter((s: any) => s.clientId === cId);
                  const reviewed = spokes.slice(0, currentIndex + 1).filter((s: any) => s.clientId === cId).length;
                  const clientName = clientSpokes[0]?.clientName || cId.slice(0, 8);
                  const separator = idx > 0 ? ' • ' : '';
                  return `${separator}${clientName}: ${reviewed}/${clientSpokes.length}`;
                }).join('')}
                {clientIds.length > 5 && ` • +${clientIds.length - 5} more`}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl mx-auto h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-[var(--edit)] to-[var(--approve)] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / spokes.length) * 100}%` }}
          />
        </div>

        {/* Stats Pills */}
        <div className="flex items-center justify-center gap-3">
          <div className="px-3 py-1 rounded-full bg-[var(--approve-glow)] text-[var(--approve)] text-xs font-semibold">
            ✓ {stats.approved} Approved
          </div>
          {stats.edited > 0 && (
            <div className="px-3 py-1 rounded-full bg-[var(--edit-glow)] text-[var(--edit)] text-xs font-semibold">
              ✎ {stats.edited} Edited
            </div>
          )}
          <div className="px-3 py-1 rounded-full bg-[var(--kill-glow)] text-[var(--kill)] text-xs font-semibold">
            ✗ {stats.killed} Killed
          </div>
        </div>

        {/* Milestone Celebrations */}
        {currentIndex + 1 === Math.floor(spokes.length / 2) && (
          <div className="text-center mt-4 text-sm font-semibold text-[var(--edit)] animate-bounce-in">
            💪 Halfway there! Keep up the great work!
          </div>
        )}
        {currentIndex + 1 === Math.floor(spokes.length * 0.75) && (
          <div className="text-center mt-4 text-sm font-semibold text-[var(--approve)] animate-bounce-in">
            🎯 Almost done! Just {spokes.length - currentIndex - 1} more to go!
          </div>
        )}
      </div>

      {/* High-Velocity Card Container */}
      <div className="relative min-h-[500px] flex items-center justify-center">
        {currentSpoke && <div
          key={currentSpoke.id}
          className={`
            w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl transition-all duration-150 ease-out relative
            ${direction === 'right' ? 'translate-x-[100px] opacity-0 rotate-6 bg-[var(--approve-glow)] border-[var(--approve)]' : ''}
            ${direction === 'left' ? 'translate-x-[-100px] opacity-0 -rotate-6 bg-[var(--kill-glow)] border-[var(--kill)]' : ''}
            ${!direction ? 'translate-x-0 opacity-100 rotate-0 scale-100' : 'scale-95'}
          `}
        >
          {/* P0-2.1: Client Badge for multi-client sprints */}
          {isMultiClient && (currentSpoke as any).clientId && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-[var(--bg-elevated)] rounded-full px-3 py-1 border border-[var(--border-subtle)] shadow-sm">
              {(currentSpoke as any).clientLogo && (
                <img src={(currentSpoke as any).clientLogo} className="w-5 h-5 rounded-full" alt="" />
              )}
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                {(currentSpoke as any).clientName || (currentSpoke as any).clientId.slice(0, 8)}
              </span>
            </div>
          )}

          {/* Spoke Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--bg-surface)] text-[var(--edit)]">
                {currentSpoke.platform === 'linkedin' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
                )}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Pillar</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {currentSpoke.pillarId || 'General'}
                </div>
              </div>
              
              {/* Variation/Clone Badge */}
              {currentSpoke.parentSpokeId && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: 'var(--edit-glow)', color: 'var(--edit)' }}
                  title={`Variation of ${currentSpoke.parentSpokeId.slice(0, 8)}...`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Variation
                </div>
              )}
              {currentSpoke.clonedFrom && !currentSpoke.parentSpokeId && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: 'var(--approve-glow)', color: 'var(--approve)' }}
                  title={`Cloned from ${currentSpoke.clonedFrom.slice(0, 8)}...`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Clone
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {/* Epic 12-1: Engagement Prediction Badge */}
              {currentSpoke.engagementPrediction !== undefined && currentSpoke.engagementPrediction !== null && (
                <div
                  className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                    currentSpoke.engagementPrediction >= 9
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : currentSpoke.engagementPrediction >= 7
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}
                  title={`Engagement Prediction: ${currentSpoke.engagementPrediction.toFixed(1)} (${currentSpoke.engagementConfidence || 'low'} confidence)`}
                >
                  {currentSpoke.engagementPrediction >= 9 && <span>✨</span>}
                  <span>EP {currentSpoke.engagementPrediction.toFixed(1)}</span>
                </div>
              )}
              <ScoreBadge score={currentSpoke.qualityScores?.g7_engagement || 0} gate="G7" showGate size="sm" />
              <ScoreBadge score={(currentSpoke.qualityScores?.g2_hook || 0) / 10} gate="G2" showGate size="sm" />
              <div className="relative group/clone">
                <button
                  onClick={() => {
                    if ((currentSpoke.qualityScores?.g7_engagement || 0) >= 9.0) {
                      setShowCloneModal(true);
                    }
                  }}
                  disabled={(currentSpoke.qualityScores?.g7_engagement || 0) < 9.0}
                  className={`
                    px-3 py-1 rounded-full text-xs font-bold transition-colors
                    ${(currentSpoke.qualityScores?.g7_engagement || 0) >= 9.0
                      ? 'bg-[var(--approve-glow)] text-[var(--approve)] hover:bg-[var(--approve)] hover:text-white'
                      : 'bg-[var(--bg-surface)] text-[var(--text-disabled)] cursor-not-allowed border border-[var(--border-subtle)]'
                    }
                  `}
                >
                  Clone
                </button>
                {(currentSpoke.qualityScores?.g7_engagement || 0) < 9.0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/clone:opacity-100 transition-opacity pointer-events-none">
                    Requires G7 Score ≥ 9.0
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spoke Content */}
          <div className="bg-[var(--bg-surface)] rounded-xl p-6 mb-8 min-h-[240px] border border-[var(--border-subtle)] whitespace-pre-wrap text-lg leading-relaxed text-[var(--text-primary)]">
            {currentSpoke.content}
          </div>

          {/* Quality Gates */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Voice (G4)</span>
              <span className={`text-xs font-bold ${currentSpoke.qualityScores?.g4_voice ? 'text-[var(--approve)]' : 'text-[var(--kill)]'}`}>
                {currentSpoke.qualityScores?.g4_voice ? 'PASSED' : 'FAILED'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Platform (G5)</span>
              <span className={`text-xs font-bold ${currentSpoke.qualityScores?.g5_platform ? 'text-[var(--approve)]' : 'text-[var(--kill)]'}`}>
                {currentSpoke.qualityScores?.g5_platform ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>
        </div>}

        {/* Visual Cues for Swiping */}
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 transition-all duration-300 ${direction === 'left' ? 'opacity-100 scale-110 text-[var(--kill)]' : 'opacity-20 text-[var(--text-muted)]'}`}>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <span className="text-xs font-bold mt-2 uppercase tracking-tighter">Kill</span>
          </div>
        </div>
        <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 transition-all duration-300 ${direction === 'right' ? 'opacity-100 scale-110 text-[var(--approve)]' : 'opacity-20 text-[var(--text-muted)]'}`}>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-xs font-bold mt-2 uppercase tracking-tighter">Approve</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-6 py-4 rounded-full shadow-2xl flex items-center gap-8 z-50">
        <div className="flex flex-col items-center gap-1 group">
          <ActionButton
            variant="kill"
            size="md"
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
            onClick={() => handleAction('kill')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </ActionButton>
          <KeyboardHint keys={['←']} action="Kill" size="sm" />
        </div>

        <div className="h-10 w-[1px] bg-[var(--border-subtle)]" />

        <div className="flex flex-col items-center gap-1">
          <ActionButton
            variant="ghost"
            size="md"
            onClick={() => {
              if (currentSpoke) {
                setEditedContent(currentSpoke.content);
                setShowEditModal(true);
              }
            }}
          >
            Edit Spoke
          </ActionButton>
          <KeyboardHint keys={['E']} action="Edit" size="sm" />
        </div>

        <div className="h-10 w-[1px] bg-[var(--border-subtle)]" />

        <div className="flex flex-col items-center gap-1">
          <ActionButton
            variant="approve"
            size="md"
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
            onClick={() => handleAction('approve')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </ActionButton>
          <KeyboardHint keys={['→']} action="Approve" size="sm" />
        </div>
      </div>

      {/* P0-2: Action Feedback Toast */}
      {actionFeedback && (
        <div
          className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-slide-down"
          style={{
            backgroundColor: actionFeedback.type === 'approve' ? 'var(--approve)' : actionFeedback.type === 'kill' ? 'var(--kill)' : 'var(--edit)',
            color: 'white'
          }}
        >
          {actionFeedback.type === 'approve' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-semibold">{actionFeedback.message}</span>
        </div>
      )}

      {/* Kill Confirmation Modal */}
      <KillConfirmationModal
        isOpen={showKillModal}
        onClose={() => setShowKillModal(false)}
        onConfirm={() => {
          if (currentSpoke?.hubId && clientId) {
            killHubMutation.mutate({ clientId, hubId: currentSpoke.hubId });
            setShowKillModal(false);
          }
        }}
        type="hub"
        title={currentSpoke?.hubId || 'Current Hub'}
        spokeCount={spokes.length}
        editedCount={0}
        isLoading={killHubMutation.isPending}
      />

      {/* Clone Spoke Modal (Story R-4) */}
      <CloneSpokeModal
        isOpen={showCloneModal}
        onClose={() => setShowCloneModal(false)}
        onConfirm={(options: CloneOptions) => {
          if (!clientId || !currentSpoke) return;
          cloneSpokeMutation.mutate({
            clientId,
            spokeId: currentSpoke.id,
            mode: options.mode,
            count: options.variationCount,
            targetPlatform: options.targetPlatform,
          });
        }}
        spokeContent={currentSpoke?.content || ''}
        spokeScore={currentSpoke?.qualityScores?.g7_engagement || 0}
        currentPlatform={currentSpoke?.platform}
        isLoading={cloneSpokeMutation.isPending}
      />

      {/* Edit Spoke Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="presentation"
          onClick={() => setShowEditModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-spoke-title"
            className="w-full max-w-2xl p-6 rounded-xl shadow-2xl"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="edit-spoke-title"
              className="text-lg font-semibold text-[var(--text-primary)] mb-4"
            >
              Edit Spoke
            </h3>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-48 p-4 rounded-lg text-sm resize-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
              }}
              placeholder="Edit spoke content..."
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Edited spokes are marked as mutated and survive Kill Chain actions.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <ActionButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditModal(false);
                  setEditedContent('');
                }}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="approve"
                size="sm"
                onClick={() => {
                  if (clientId && currentSpoke && editedContent.trim()) {
                    editSpokeMutation.mutate({
                      clientId,
                      spokeId: currentSpoke.id,
                      content: editedContent.trim(),
                    });
                  }
                }}
                disabled={editSpokeMutation.isPending || !editedContent.trim()}
              >
                {editSpokeMutation.isPending ? 'Saving...' : 'Save Changes'}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
