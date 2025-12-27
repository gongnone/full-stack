/**
 * Story 4.4: Creative Conflict Escalation
 * Creative Conflicts Dashboard - Manual review for spokes that failed quality gates
 */

import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { ActionButton, GateBadge } from '@/components/ui';
import type { Spoke, SpokePlatform } from '../../../worker/types';

const searchSchema = z.object({
  platform: z.string().optional(),
  gate: z.string().optional(),
});

export const Route = createFileRoute('/app/creative-conflicts')({
  validateSearch: (search) => searchSchema.parse(search),
  component: CreativeConflictsPage,
});

// Platform configuration
const PLATFORMS: { value: SpokePlatform | 'all'; label: string }[] = [
  { value: 'all', label: 'All Platforms' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'thread', label: 'Thread' },
  { value: 'carousel', label: 'Carousel' },
];

// Gate failure types
const GATE_FILTERS: { value: string; label: string }[] = [
  { value: 'any', label: 'Any Failure' },
  { value: 'g2', label: 'G2 (Hook)' },
  { value: 'g4', label: 'G4 (Voice)' },
  { value: 'g5', label: 'G5 (Platform)' },
];

interface ConflictCardProps {
  spoke: Spoke;
  hubTitle?: string;
  onApprove: () => void;
  onRewrite: (feedback: string) => void;
}

function ConflictCard({ spoke, hubTitle, onApprove, onRewrite }: ConflictCardProps) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const g2Score = spoke.g2_score ?? 0;
  const g4Passed = spoke.g4_status === 'pass';
  const g5Passed = spoke.g5_status === 'pass';

  // Parse violations
  const g4Violations = spoke.g4_status?.startsWith('fail:')
    ? spoke.g4_status.replace('fail:', '').split(',')
    : [];
  const g5Violations = spoke.g5_status?.startsWith('fail:')
    ? spoke.g5_status.replace('fail:', '').split(',')
    : [];

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);
    await onRewrite(feedback);
    setIsSubmitting(false);
    setShowFeedbackModal(false);
    setFeedback('');
  };

  return (
    <div
      className="conflict-card rounded-lg p-4 space-y-3"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="badge px-2 py-0.5 rounded text-xs font-medium lowercase"
            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            {spoke.platform}
          </span>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium capitalize"
            style={{ backgroundColor: 'var(--warning)', color: '#000' }}
          >
            {spoke.psychological_angle}
          </span>
          {spoke.generation_attempt > 1 && (
            <span className="text-xs text-[var(--text-muted)]">
              Attempt #{spoke.generation_attempt}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <GateBadge gate="G2" score={g2Score} size="sm" />
          <GateBadge
            gate="G4"
            passed={g4Passed}
            g4Details={{ violations: g4Violations }}
            size="sm"
          />
          <GateBadge
            gate="G5"
            passed={g5Passed}
            g5Details={{ violations: g5Violations }}
            size="sm"
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="text-sm leading-relaxed p-3 rounded-lg"
        style={{
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {spoke.content}
      </div>

      {/* Gate Details */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-base)' }}>
          <div className="flex justify-between mb-1">
            <span className="text-[var(--text-muted)]">G2: Hook</span>
            <span className={g2Score >= 80 ? 'text-[#00D26A]' : g2Score >= 60 ? 'text-[#FFAD1F]' : 'text-[#F4212E]'}>
              {g2Score}
            </span>
          </div>
          {g2Score < 80 && (
            <p className="text-[var(--text-muted)]">Score below threshold</p>
          )}
        </div>
        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-base)' }}>
          <div className="flex justify-between mb-1">
            <span className="text-[var(--text-muted)]">G4: Voice</span>
            <span className={g4Passed ? 'text-[#00D26A]' : 'text-[#F4212E]'}>
              {g4Passed ? 'pass' : 'fail'}
            </span>
          </div>
          {g4Violations.length > 0 && (
            <p className="text-[#F4212E] truncate">{g4Violations[0]}</p>
          )}
        </div>
        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-base)' }}>
          <div className="flex justify-between mb-1">
            <span className="text-[var(--text-muted)]">G5: Platform</span>
            <span className={g5Passed ? 'text-[#00D26A]' : 'text-[#F4212E]'}>
              {g5Passed ? 'pass' : 'fail'}
            </span>
          </div>
          {g5Violations.length > 0 && (
            <p className="text-[#F4212E] truncate">{g5Violations[0]}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
        <ActionButton
          variant="ghost"
          size="sm"
          onClick={() => setShowFeedbackModal(true)}
        >
          Request Rewrite
        </ActionButton>
        <ActionButton
          variant="approve"
          size="sm"
          onClick={onApprove}
        >
          Approve Anyway
        </ActionButton>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-md p-6 rounded-xl shadow-2xl space-y-4"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Request Manual Rewrite
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Provide feedback for the AI to improve this spoke:
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please make the hook less salesy..."
              className="w-full h-32 p-3 rounded-lg text-sm resize-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
              }}
            />
            <div className="flex justify-end gap-2">
              <ActionButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedback('');
                }}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="approve"
                size="sm"
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreativeConflictsPage() {
  const search = Route.useSearch();
  const clientId = useClientId();
  const [platformFilter, setPlatformFilter] = useState<SpokePlatform | 'all'>(
    (search.platform as SpokePlatform | 'all') || 'all'
  );
  const [gateFilter, setGateFilter] = useState(search.gate || 'any');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch flagged spokes (failed QA, need manual review)
  const { data: spokesData, refetch } = trpc.spokes.list.useQuery(
    { clientId: clientId!, status: 'rejected', limit: 50 },
    { enabled: !!clientId }
  );

  // Mutations
  const approveMutation = trpc.spokes.approve.useMutation({
    onSuccess: () => {
      setSuccessMessage('Status updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      refetch();
    },
  });

  const rejectMutation = trpc.spokes.reject.useMutation({
    onSuccess: () => {
      setSuccessMessage('Status updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      refetch();
    },
  });

  // Filter spokes based on platform and gate
  const filteredSpokes = useMemo(() => {
    let spokes = (spokesData?.items || []) as Spoke[];

    // Platform filter
    if (platformFilter !== 'all') {
      spokes = spokes.filter((s) => s.platform === platformFilter);
    }

    // Gate filter
    if (gateFilter !== 'any') {
      spokes = spokes.filter((s) => {
        if (gateFilter === 'g2') return (s.g2_score ?? 0) < 80;
        if (gateFilter === 'g4') return s.g4_status !== 'pass';
        if (gateFilter === 'g5') return s.g5_status !== 'pass';
        return true;
      });
    }

    return spokes;
  }, [spokesData, platformFilter, gateFilter]);

  // Group by hub
  const groupedByHub = useMemo(() => {
    const groups: Record<string, Spoke[]> = {};
    filteredSpokes.forEach((spoke) => {
      const hubId = spoke.hub_id;
      if (!groups[hubId]) groups[hubId] = [];
      groups[hubId].push(spoke);
    });
    return groups;
  }, [filteredSpokes]);

  const handleApprove = async (spoke: Spoke) => {
    if (!clientId) return;
    approveMutation.mutate({ clientId, spokeId: spoke.id });
  };

  const handleRewrite = async (spoke: Spoke, feedback: string) => {
    if (!clientId) return;
    rejectMutation.mutate({ clientId, spokeId: spoke.id, reason: feedback });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Creative Conflicts
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Spokes that failed quality gates and need manual review
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[var(--warning)]">
            {filteredSpokes.length}
          </div>
          <div className="text-xs text-[var(--text-muted)]">conflicts</div>
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div
          className="p-3 rounded-lg text-sm font-medium animate-fadeIn"
          style={{ backgroundColor: 'var(--approve)', color: '#fff' }}
        >
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Platform Filter */}
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value as SpokePlatform | 'all')}
          className="px-3 py-2 rounded-lg text-sm cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Gate Filter */}
        <select
          value={gateFilter}
          onChange={(e) => setGateFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        >
          {GATE_FILTERS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {filteredSpokes.length === 0 ? (
        <div
          className="p-12 text-center rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'var(--approve)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            No Creative Conflicts
          </h2>
          <p className="text-[var(--text-muted)] mt-2">
            All spokes have passed quality gates or been resolved
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByHub).map(([hubId, spokes]) => (
            <div key={hubId} className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--text-muted)]">
                Hub: {hubId.slice(0, 8)}...
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {spokes.map((spoke) => (
                  <ConflictCard
                    key={spoke.id}
                    spoke={spoke}
                    onApprove={() => handleApprove(spoke)}
                    onRewrite={(feedback) => handleRewrite(spoke, feedback)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
