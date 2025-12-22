/**
 * SprintView Component
 *
 * Main container for the Sprint review experience.
 * Orchestrates all sprint components and keyboard navigation.
 */

import { useCallback, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Components
import { SprintHeader } from './SprintHeader';
import { SignalHeader } from './SignalHeader';
import { ContextBar } from './ContextBar';
import { ContentCard } from './ContentCard';
import { ActionBar } from './ActionBar';
import { ProgressFooter } from './ProgressFooter';
import { SprintComplete } from './SprintComplete';
import { SprintSkeleton } from './SprintSkeleton';
import { HelpOverlay } from './HelpOverlay';
import { KillConfirmationModal } from './KillConfirmationModal';

// Hooks
import { useSprintKeyboard } from './hooks/useSprintKeyboard';
import { useSprintQueue } from './hooks/useSprintQueue';
import { formatContentForClipboard } from '@/utils/export-utils';

interface SprintViewProps {
  projectId: string;
  bucket?: 'high_confidence' | 'needs_review' | 'recent';
}

export function SprintView({ projectId, bucket: propBucket }: SprintViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search: any = useSearch({ from: '/app/_authed/projects/$projectId/sprint' });
  const currentBucket = propBucket || search.bucket || 'high_confidence';
  const clientId = 'unknown'; // TODO: Get from auth

  const [killModalOpen, setKillModalOpen] = useState(false);
  const [isHubKilling, setIsHubKilling] = useState(false);

  const { data: sprintItems, isLoading } = useQuery({
    queryKey: ['sprint-items', projectId, currentBucket],
    queryFn: () => (trpc as any).generations.getSprintItems.query({ clientId, bucket: currentBucket }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { spokeId: string, status: string }) => 
      (trpc as any).generations.updateSpokeStatus.mutate(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-buckets'] });
    }
  });

  const killHubMutation = useMutation({
    mutationFn: (vars: { hubId: string, clientId: string }) => 
      (trpc as any).generations.killHub.mutate(vars),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review-buckets'] });
      toast.error('Hub killed', {
        description: 'All non-mutated spokes discarded.',
        action: {
          label: 'Undo',
          onClick: () => undoKillHubMutation.mutate(variables)
        },
        duration: 30000,
      });
      navigate({ to: '/app/review' });
    }
  });

  const undoKillHubMutation = useMutation({
    mutationFn: (vars: { hubId: string, clientId: string }) => 
      (trpc as any).generations.undoKillHub.mutate(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-buckets'] });
      toast.success('Hub restored successfully');
    }
  });

  const queue = useSprintQueue(sprintItems || []);

  // Exit handler
  const handleExit = useCallback(() => {
    navigate({ to: `/app/projects/${projectId}` });
  }, [navigate, projectId]);

  // Action handlers
  const handleApprove = useCallback(() => {
    if (queue.state.isAnimating || !queue.currentItem) return;
    const item = queue.currentItem;
    queue.approve();
    updateStatusMutation.mutate({ spokeId: item.id, status: 'approved' });
    toast.success('Approved', {
      description: 'Content scheduled for publishing',
      duration: 2000,
    });
  }, [queue, updateStatusMutation]);

  const handleKill = useCallback(() => {
    if (queue.state.isAnimating || !queue.currentItem) return;
    const item = queue.currentItem;
    queue.kill();
    updateStatusMutation.mutate({ spokeId: item.id, status: 'discarded' });
    toast.error('Killed', {
      description: 'Content removed from queue',
      duration: 2000,
    });
  }, [queue, updateStatusMutation]);

  const handleCopy = useCallback(() => {
    if (!queue.currentItem) return;
    const formatted = formatContentForClipboard(queue.currentItem.content, queue.currentItem.platform);
    navigator.clipboard.writeText(formatted);
    toast.success('Copied to clipboard', {
      description: 'Content is ready to paste.',
      duration: 2000,
    });
  }, [queue]);

  const handleCopyAndApprove = useCallback(() => {
    if (queue.state.isAnimating || !queue.currentItem) return;
    const item = queue.currentItem;
    const formatted = formatContentForClipboard(item.content, item.platform);
    navigator.clipboard.writeText(formatted);
    
    queue.approve();
    updateStatusMutation.mutate({ spokeId: item.id, status: 'approved' });
    toast.success('Copied & Approved', {
      description: 'Content copied and scheduled.',
      duration: 2000,
    });
  }, [queue, updateStatusMutation]);

  const handleHubKill = useCallback(() => {
    if (queue.state.isAnimating || !queue.currentItem) return;
    setKillModalOpen(true);
  }, [queue]);

  const confirmHubKill = useCallback(() => {
    if (!queue.currentItem) return;
    const hubId = queue.currentItem.hubId;
    const hubTitle = queue.currentItem.breadcrumb.hub;
    
    setKillModalOpen(false);
    setIsHubKilling(true);

    // Staggered pruning effect delay
    setTimeout(() => {
      setIsHubKilling(false);
      queue.killHubItems(hubId);
      killHubMutation.mutate({ hubId, clientId });

      toast.error(`Hub Killed: ${hubTitle}`, {
        description: 'Staggered pruning complete. Mutations preserved.',
        action: {
          label: 'Undo',
          onClick: () => undoKillHubMutation.mutate({ hubId, clientId })
        },
        duration: 30000,
      });
    }, 1000);
  }, [queue, killHubMutation, undoKillHubMutation, clientId]);

  const handleEdit = useCallback(() => {
    if (queue.state.isAnimating || !queue.currentItem) return;
    // For now, just show a toast. Later, open edit modal.
    toast.info('Edit mode', {
      description: 'Opening editor... (coming soon)',
      duration: 2000,
    });
  }, [queue]);

  const handleSkip = useCallback(() => {
    if (queue.state.isAnimating || !queue.currentItem) return;
    queue.skip();
    toast('Skipped', {
      description: 'Moved to end of queue',
      duration: 2000,
    });
  }, [queue]);

  // Keyboard navigation
  useSprintKeyboard({
    onApprove: handleApprove,
    onCopy: handleCopy,
    onCopyAndApprove: handleCopyAndApprove,
    onKill: handleKill,
    onHubKill: handleHubKill,
    onEdit: handleEdit,
    onSkip: handleSkip,
    onToggleNotes: queue.toggleNotes,
    onExit: handleExit,
    disabled: queue.state.isAnimating || killModalOpen,
  });

  // Loading state
  if (isLoading) {
    return <SprintSkeleton />;
  }

  // Complete state
  if (queue.isComplete) {
    return (
      <div className="fixed inset-0 bg-[#0F1419]">
        <SprintComplete
          stats={queue.stats}
          onExit={handleExit}
        />
      </div>
    );
  }

  // No items
  if (!queue.currentItem) {
    return (
      <div className="fixed inset-0 bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#E7E9EA] mb-2">
            No content to review
          </h2>
          <p className="text-[#8B98A5] mb-4">
            The sprint queue is empty.
          </p>
          <button
            onClick={handleExit}
            className="text-[#1D9BF0] hover:underline"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0F1419] flex flex-col">
      {/* Header */}
      <SprintHeader
        title="High Confidence Sprint"
        currentIndex={queue.state.currentIndex}
        totalCount={queue.state.items.length}
        onExit={handleExit}
      />

      {/* Main Content */}
      <main className={`flex-1 flex flex-col items-center justify-center p-8 space-y-6 overflow-hidden transition-all duration-500 ${isHubKilling ? 'animate-red-pulse' : ''}`}>
        {/* Signal Header */}
        <SignalHeader
          hookScore={queue.currentItem.hookScore}
          predictionScore={queue.currentItem.predictionScore}
          g4Passed={queue.currentItem.gates.g4Passed}
          g5Passed={queue.currentItem.gates.g5Passed}
          criticNotes={queue.currentItem.criticNotes}
          showNotes={queue.state.showCriticNotes}
        />

        {/* Context Bar */}
        <ContextBar
          hubId={queue.currentItem.hubId}
          pillarId={queue.currentItem.pillarId}
          platform={queue.currentItem.platform}
        />

        {/* Content Card with Animations */}
        <AnimatePresence mode="wait">
          <ContentCard
            key={queue.currentItem.id}
            item={queue.currentItem}
            exitDirection={queue.state.exitDirection}
            isAnimating={queue.state.isAnimating}
          />
        </AnimatePresence>

        {/* Action Bar */}
        <ActionBar
          onKill={handleKill}
          onEdit={handleEdit}
          onSkip={handleSkip}
          onApprove={handleApprove}
          disabled={queue.state.isAnimating}
        />
      </main>

      {/* Footer */}
      <ProgressFooter
        progress={queue.progress}
        remaining={queue.remaining}
        total={queue.state.items.length}
        currentIndex={queue.state.currentIndex + 1}
      />

      <HelpOverlay 
        isOpen={queue.state.showCriticNotes} 
        onClose={queue.toggleNotes} 
      />

      <KillConfirmationModal
        isOpen={killModalOpen}
        onOpenChange={setKillModalOpen}
        onConfirm={confirmHubKill}
        hubTitle={queue.currentItem.breadcrumb.hub}
        spokeCount={queue.state.items.filter(i => i.hubId === queue.currentItem?.hubId).length}
      />
    </div>
  );
}
