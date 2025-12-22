import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { ActionButton, ScoreBadge, KeyboardHint } from '@/components/ui';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';

const reviewSearchSchema = z.object({
  filter: z.string().optional().catch('needs-review'),
});

export const Route = createFileRoute('/app/review')({
  validateSearch: (search) => reviewSearchSchema.parse(search),
  component: ReviewPage,
});

function ReviewPage() {
  const { filter } = Route.useSearch();
  const clientId = useClientId();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // tRPC Queries
  const queueQuery = trpc.review.getQueue.useQuery(
    { 
      clientId: clientId!, 
      filter: filter === 'high-confidence' ? 'top10' : filter === 'conflicts' ? 'flagged' : 'all' 
    },
    { enabled: !!clientId }
  );

  const swipeMutation = trpc.review.swipeAction.useMutation();

  const spokes = useMemo(() => queueQuery.data?.items || [], [queueQuery.data]);
  const currentSpoke = spokes[currentIndex];

  const handleAction = useCallback((action: 'approve' | 'kill') => {
    if (!currentSpoke || !clientId) return;

    setDirection(action === 'approve' ? 'right' : 'left');
    
    // Call mutation
    swipeMutation.mutate({
      clientId,
      spokeId: currentSpoke.id,
      action: action === 'approve' ? 'approve' : 'reject'
    });

    // Fast transition for high-velocity feel (< 200ms)
    setTimeout(() => {
      if (currentIndex < spokes.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setDirection(null);
      } else {
        setIsComplete(true);
      }
    }, 150);
  }, [currentIndex, spokes, clientId, currentSpoke, swipeMutation]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || !currentSpoke) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleAction('approve');
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') handleAction('kill');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction, isComplete, currentSpoke]);

  if (queueQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--edit)]" />
      </div>
    );
  }

  if (isComplete || spokes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-[var(--approve-glow)] flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[var(--approve)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {spokes.length === 0 ? 'No Items Found' : 'Sprint Complete!'}
        </h2>
        <p className="text-[var(--text-secondary)] mt-2 max-w-md">
          {spokes.length === 0 
            ? `There is no content in the ${filter.replace('-', ' ')} queue.`
            : `You've reviewed all items in the ${filter.replace('-', ' ')} queue.`
          }
        </p>
        <div className="mt-8 flex gap-4">
          <ActionButton variant="approve" onClick={() => window.location.href = '/app'}>
            Back to Dashboard
          </ActionButton>
        </div>
      </div>
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
            Mode: <span className="capitalize text-[var(--edit)]">{filter.replace('-', ' ')}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-[var(--text-muted)]">
            Progress
          </div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {currentIndex + 1} / {spokes.length}
          </div>
        </div>
      </div>

      {/* High-Velocity Card Container */}
      <div className="relative min-h-[500px] flex items-center justify-center">
        <div 
          key={currentSpoke.id}
          className={`
            w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl transition-all duration-150 ease-out relative
            ${direction === 'right' ? 'translate-x-[100px] opacity-0 rotate-6 bg-[var(--approve-glow)] border-[var(--approve)]' : ''}
            ${direction === 'left' ? 'translate-x-[-100px] opacity-0 -rotate-6 bg-[var(--kill-glow)] border-[var(--kill)]' : ''}
            ${!direction ? 'translate-x-0 opacity-100 rotate-0 scale-100' : 'scale-95'}
          `}
        >
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
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Pillar
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {currentSpoke.pillarId || 'General'}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <ScoreBadge score={currentSpoke.qualityScores?.g7_engagement || 0} label="G7" size="sm" />
              <ScoreBadge score={(currentSpoke.qualityScores?.g2_hook || 0) / 10} label="G2" size="sm" />
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
        </div>

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
          <ActionButton variant="ghost" size="md">
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
            <svg className="w-10 h-10 text-[var(--approve)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </ActionButton>
          <KeyboardHint keys={['→']} action="Approve" size="sm" />
        </div>
      </div>
    </div>
  );
}