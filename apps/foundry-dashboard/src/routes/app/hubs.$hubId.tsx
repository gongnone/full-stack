/**
 * Story 3.4 + 4.1: Hub Detail with Spoke Generation
 * Hub Detail Route - Display Hub with pillars and spoke tree view
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { SpokeTreeView, GenerationProgress, PlatformFilter } from '@/components/spokes';
import type { Pillar, Spoke, SpokePlatform, SpokeGenerationProgress } from '../../../worker/types';

// Types for workflow polling
interface WorkflowInstance {
  instanceId: string;
  spokeId: string;
  platform: string;
  pillarId: string;
}

export const Route = createFileRoute('/app/hubs/$hubId')({
  component: HubDetailPage,
});

// Source type labels
const SOURCE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF Document',
  text: 'Pasted Text',
  url: 'URL Content',
};

// Status badge colors
const STATUS_CONFIG = {
  processing: { label: 'Processing', bgColor: 'var(--warning)', textColor: '#000' },
  ready: { label: 'Ready', bgColor: 'var(--approve)', textColor: '#fff' },
  archived: { label: 'Archived', bgColor: 'var(--text-muted)', textColor: '#fff' },
} as const;

const DEFAULT_STATUS_CONFIG = STATUS_CONFIG.ready;

// Psychological angle badge colors
const ANGLE_COLORS: Record<string, string> = {
  Contrarian: '#E11D48',
  Authority: '#2563EB',
  Urgency: '#EA580C',
  Aspiration: '#7C3AED',
  Fear: '#DC2626',
  Curiosity: '#0891B2',
  Transformation: '#059669',
  Rebellion: '#BE185D',
};

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const angleColor = ANGLE_COLORS[pillar.psychologicalAngle] || 'var(--text-muted)';

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
          {pillar.title}
        </h3>
        <span
          className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: angleColor, color: '#fff' }}
        >
          {pillar.psychologicalAngle}
        </span>
      </div>

      {/* Core Claim */}
      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
        {pillar.coreClaim}
      </p>

      {/* Supporting Points */}
      {pillar.supportingPoints.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            Supporting Points
          </p>
          <ul className="space-y-1">
            {pillar.supportingPoints.slice(0, 3).map((point, idx) => (
              <li key={idx} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: angleColor }}>•</span>
                <span>{point}</span>
              </li>
            ))}
            {pillar.supportingPoints.length > 3 && (
              <li className="text-xs" style={{ color: 'var(--text-muted)' }}>
                +{pillar.supportingPoints.length - 3} more...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Estimated Spokes */}
      <div className="mt-3 pt-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
        <span>Estimated Spokes</span>
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
          {pillar.estimatedSpokeCount}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
        <div className="h-4 w-4" />
        <div className="h-4 w-32 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
      </div>
      <div className="h-8 w-64 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
      <div className="h-4 w-48 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />

      {/* Pillars skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-lg" style={{ backgroundColor: 'var(--bg-surface)' }} />
        ))}
      </div>
    </div>
  );
}

function HubDetailPage() {
  const { hubId } = Route.useParams();
  const [platformFilter, setPlatformFilter] = useState<SpokePlatform | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<SpokeGenerationProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'pillars' | 'spokes'>('pillars');
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const workflowStartTimeRef = useRef<number>(0);

  // Get client ID using shared hook for consistency with hub creation wizard
  const clientId = useClientId() || '';

  // Fetch Hub data
  const { data: hub, isLoading, error, refetch: refetchHub } = trpc.hubs.get.useQuery(
    { hubId, clientId },
    { enabled: !!clientId && !!hubId }
  );

  // Fetch spokes for this hub
  const { data: spokesData, refetch: refetchSpokes, error: spokesError } = trpc.spokes.list.useQuery(
    { clientId, hubId },
    { enabled: !!clientId && !!hubId && activeTab === 'spokes' }
  );

  // Debug: Log spokes data
  useEffect(() => {
    console.log('[Spokes Debug] clientId:', clientId, 'hubId:', hubId, 'activeTab:', activeTab);
    console.log('[Spokes Debug] spokesData:', spokesData);
    console.log('[Spokes Debug] spokesError:', spokesError);
    if (spokesData?.items) {
      console.log('[Spokes Debug] items count:', spokesData.items.length);
    }
  }, [spokesData, spokesError, clientId, hubId, activeTab]);

  // Utility to get workflow status
  const trpcUtils = trpc.useUtils();

  // Poll workflow status for real progress tracking
  const pollWorkflowStatus = useCallback((instances: WorkflowInstance[]) => {
    const totalSpokes = instances.length;
    const pillars = hub?.pillars || [];
    workflowStartTimeRef.current = Date.now() / 1000;

    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Track which instances are done (to avoid re-counting)
    const instanceStatus: Record<string, 'pending' | 'complete' | 'errored'> = {};
    instances.forEach((inst) => {
      instanceStatus[inst.instanceId] = 'pending';
    });

    // Track poll count for timeout (max 10 minutes = 200 polls at 3s each)
    let pollCount = 0;
    const MAX_POLLS = 200;

    const checkStatus = async () => {
      pollCount++;
      // Only log every 10th poll to reduce spam
      if (pollCount % 10 === 1) {
        console.log('[Spoke Gen] Poll #' + pollCount + ' checking', instances.length, 'instances');
      }

      // Timeout after MAX_POLLS
      if (pollCount > MAX_POLLS) {
        console.warn('[Spoke Gen] Polling timeout after', MAX_POLLS, 'polls');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsGenerating(false);
        return;
      }

      let completedSpokes = 0;
      let failedSpokes = 0;
      let currentPillarId: string | null = null;

      // Track completed per pillar for this check
      const pillarProgress: Record<string, { completed: number; total: number }> = {};
      instances.forEach((inst) => {
        if (!pillarProgress[inst.pillarId]) {
          pillarProgress[inst.pillarId] = { completed: 0, total: 0 };
        }
        pillarProgress[inst.pillarId]!.total++;
      });

      // Check each workflow instance status
      for (const inst of instances) {
        // Skip if already known to be done
        if (instanceStatus[inst.instanceId] !== 'pending') {
          if (instanceStatus[inst.instanceId] === 'complete') {
            completedSpokes++;
            pillarProgress[inst.pillarId]!.completed++;
          } else if (instanceStatus[inst.instanceId] === 'errored') {
            failedSpokes++;
            pillarProgress[inst.pillarId]!.completed++;
          }
          continue;
        }

        try {
          // Invalidate cache first to ensure fresh data on each poll
          await trpcUtils.spokes.getWorkflowStatus.invalidate({ instanceId: inst.instanceId });
          const status = await trpcUtils.spokes.getWorkflowStatus.fetch({ instanceId: inst.instanceId });
          if (status.status === 'complete') {
            console.log('[Spoke Gen] Instance', inst.instanceId.slice(0, 8), '✓ complete');
          } else if (status.status !== 'running') {
            console.log('[Spoke Gen] Instance', inst.instanceId.slice(0, 8), 'status:', status.status);
          }
          if (status.status === 'complete') {
            instanceStatus[inst.instanceId] = 'complete';
            completedSpokes++;
            pillarProgress[inst.pillarId]!.completed++;
          } else if (status.status === 'errored') {
            instanceStatus[inst.instanceId] = 'errored';
            failedSpokes++;
            pillarProgress[inst.pillarId]!.completed++;
          } else if (status.status === 'running' && !currentPillarId) {
            currentPillarId = inst.pillarId;
          }
        } catch (err) {
          console.error('[Spoke Gen] Error fetching status for', inst.instanceId.slice(0, 8), err);
        }
      }
      // Only log progress summary when there's a change or every 10th poll
      if (pollCount % 10 === 0 || completedSpokes + failedSpokes === totalSpokes) {
        console.log('[Spoke Gen] Progress:', completedSpokes, '/', totalSpokes, 'completed,', failedSpokes, 'failed');
      }

      // Find current pillar name
      const currentPillar = pillars.find(p => p.id === currentPillarId);
      const completedPillars = Object.values(pillarProgress).filter(
        p => p.completed >= p.total
      ).length;

      // Update progress UI
      setGenerationProgress({
        hub_id: hubId,
        client_id: clientId,
        status: completedSpokes + failedSpokes >= totalSpokes ? 'completed' : 'generating',
        total_pillars: pillars.length,
        completed_pillars: completedPillars,
        total_spokes: totalSpokes,
        completed_spokes: completedSpokes,
        current_pillar_id: currentPillarId,
        current_pillar_name: currentPillar?.title || null,
        error_message: failedSpokes > 0 ? `${failedSpokes} spokes failed` : null,
        started_at: workflowStartTimeRef.current,
        completed_at: completedSpokes + failedSpokes >= totalSpokes ? Date.now() / 1000 : null,
        updated_at: Date.now() / 1000,
      });

      // Check if all done
      if (completedSpokes + failedSpokes >= totalSpokes) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsGenerating(false);
        // Switch to spokes tab FIRST so query is enabled
        setActiveTab('spokes');
        // Invalidate queries to force fresh fetch
        await trpcUtils.spokes.list.invalidate({ clientId, hubId });
        await trpcUtils.hubs.get.invalidate({ hubId, clientId });
      }
    };

    // Initial check
    checkStatus();

    // Poll every 3 seconds
    // Poll every 5 seconds (was 3s - reduced to avoid API spam)
    pollingIntervalRef.current = setInterval(checkStatus, 5000);
  }, [hub?.pillars, hubId, clientId, trpcUtils, refetchHub, refetchSpokes]);

  // Generate spokes mutation
  const generateMutation = trpc.spokes.generate.useMutation({
    onSuccess: (data) => {
      console.log('[Spoke Gen] Generate success! Instances:', data.instances?.length || 0, data);
      setIsGenerating(true);
      // Start real workflow polling with actual instance IDs
      if (data.instances && data.instances.length > 0) {
        console.log('[Spoke Gen] Starting polling for', data.instances.length, 'instances');
        pollWorkflowStatus(data.instances);
      } else {
        // Edge case: no spokes queued (empty pillars?)
        setIsGenerating(false);
        setGenerationProgress({
          hub_id: hubId,
          client_id: clientId,
          status: 'completed',
          total_pillars: hub?.pillars.length || 0,
          completed_pillars: hub?.pillars.length || 0,
          total_spokes: 0,
          completed_spokes: 0,
          current_pillar_id: null,
          current_pillar_name: null,
          error_message: 'No spokes to generate',
          started_at: Date.now() / 1000,
          completed_at: Date.now() / 1000,
          updated_at: Date.now() / 1000,
        });
      }
    },
    onError: (error) => {
      alert(`Generation failed: ${error.message}`);
      setIsGenerating(false);
    },
  });

  const handleGenerateSpokes = () => {
    if (!clientId || !hubId) return;

    generateMutation.mutate({
      clientId,
      hubId,
      platforms: ['twitter', 'linkedin', 'tiktok', 'instagram', 'thread', 'carousel'],
    });
  };

  // Calculate spoke counts by platform
  const spokeCounts = useMemo(() => {
    const counts: Record<SpokePlatform | 'all', number> = {
      all: 0,
      twitter: 0,
      linkedin: 0,
      tiktok: 0,
      instagram: 0,
      newsletter: 0,
      thread: 0,
      carousel: 0,
    };

    const spokes = (spokesData?.items || []) as Spoke[];
    spokes.forEach((s) => {
      counts.all++;
      counts[s.platform]++;
    });

    return counts;
  }, [spokesData]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/app/hubs"
          className="text-sm flex items-center gap-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Hubs
        </Link>
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--kill)' }}
        >
          <p style={{ color: 'var(--kill)' }}>
            {error.message === 'Hub not found' ? 'This Hub does not exist or you do not have access to it.' : `Error: ${error.message}`}
          </p>
        </div>
      </div>
    );
  }

  if (!hub) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[hub.status as keyof typeof STATUS_CONFIG] ?? DEFAULT_STATUS_CONFIG;
  const totalEstimatedSpokes = hub.pillars.reduce((sum: number, p: Pillar) => sum + p.estimatedSpokeCount, 0);
  const spokes = (spokesData?.items || []) as Spoke[];
  const hasSpokes = hub.spoke_count > 0 || spokes.length > 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/app/hubs" className="hover:underline">
          Hubs
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span style={{ color: 'var(--text-primary)' }}>{hub.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {hub.title}
            </h1>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }}
            >
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>{SOURCE_TYPE_LABELS[hub.source_type] || hub.source_type}</span>
            <span>•</span>
            <span>{formatDate(hub.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {hub.status === 'ready' && !isGenerating && (
            <button
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'var(--approve)', color: '#fff' }}
              onClick={handleGenerateSpokes}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Spokes
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Generation Progress */}
      {(isGenerating || generationProgress?.status === 'completed') && (
        <GenerationProgress
          progress={generationProgress}
          onComplete={() => {
            setTimeout(() => setGenerationProgress(null), 5000);
          }}
        />
      )}

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div
          className="px-4 py-3 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {hub.pillar_count}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pillars</p>
        </div>
        <div
          className="px-4 py-3 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {hub.spoke_count || spokeCounts.all}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Spokes</p>
        </div>
        <div
          className="px-4 py-3 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-2xl font-semibold" style={{ color: 'var(--text-secondary)' }}>
            ~{totalEstimatedSpokes}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Estimated Total</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <button
          onClick={() => setActiveTab('pillars')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pillars' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Content Pillars
        </button>
        <button
          onClick={() => setActiveTab('spokes')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'spokes' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Generated Spokes
          {hasSpokes && (
            <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--edit)', color: '#fff' }}>
              {hub.spoke_count || spokeCounts.all}
            </span>
          )}
        </button>
      </div>

      {/* Pillars Tab */}
      {activeTab === 'pillars' && (
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hub.pillars.map((pillar: Pillar) => (
              <PillarCard key={pillar.id} pillar={pillar} />
            ))}
          </div>
        </div>
      )}

      {/* Spokes Tab */}
      {activeTab === 'spokes' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center justify-between">
            <PlatformFilter
              value={platformFilter}
              onChange={setPlatformFilter}
              spokeCounts={spokeCounts}
            />
            <Link
              to="/app/review"
              className="text-sm flex items-center gap-1 hover:underline"
              style={{ color: 'var(--edit)' }}
            >
              Open Review Queue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Tree View */}
          <SpokeTreeView
            hubTitle={hub.title}
            pillars={hub.pillars}
            spokes={spokes}
            platformFilter={platformFilter}
            onSpokeClick={(spoke) => {
              // Could open a modal or navigate to spoke detail
              console.log('Clicked spoke:', spoke.id);
            }}
          />
        </div>
      )}
    </div>
  );
}
