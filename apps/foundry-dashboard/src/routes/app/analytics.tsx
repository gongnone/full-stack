import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { useState } from 'react';
import { ANALYTICS_CONFIG } from '@/lib/constants';
import { useLazyRender } from '@/lib/use-lazy-render';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { ZeroEditChart } from '@/components/analytics/ZeroEditChart';
import { CriticTrends } from '@/components/analytics/CriticTrends';
import { HealingMetrics } from '@/components/analytics/HealingMetrics';
import { VelocityDashboard } from '@/components/analytics/VelocityDashboard';
import { KillAnalytics } from '@/components/analytics/KillAnalytics';
import { DriftDetector } from '@/components/analytics/DriftDetector';

export const Route = createFileRoute('/app/analytics')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const clientId = useClientId();
  const [periodDays, setPeriodDays] = useState<number>(ANALYTICS_CONFIG.DEFAULT_PERIOD_DAYS);

  // AC5: Debounce period selector to prevent excessive API calls
  const debouncedPeriod = useDebouncedValue(periodDays, 300);
  const isPeriodDebouncing = periodDays !== debouncedPeriod;

  // AC3: Lazy render charts below the fold (charts 3-6)
  const { ref: healingRef, isVisible: healingVisible } = useLazyRender();
  const { ref: velocityRef, isVisible: velocityVisible } = useLazyRender();
  const { ref: killRef, isVisible: killVisible } = useLazyRender();
  const { ref: driftRef, isVisible: driftVisible } = useLazyRender();

  const summaryQuery = trpc.analytics.getSummaryMetrics.useQuery(
    { clientId: clientId!, periodDays: debouncedPeriod },
    { enabled: !!clientId }
  );

  const isLoading = summaryQuery.isLoading;
  const data = summaryQuery.data;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Performance metrics and learning loop analytics
          </p>
        </div>

        {/* Period Selector with debounce indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-muted)]">Period:</span>
          <div className="relative">
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border text-sm pr-8 bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            {isPeriodDebouncing && (
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-t-transparent rounded-full animate-spin border-[var(--text-muted)]"
                aria-label="Loading"
              />
            )}
          </div>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Zero-Edit Rate"
          value={isLoading ? '...' : `${data?.zeroEditRate?.rate || 0}%`}
          subtitle={isLoading ? 'Loading...' : `${data?.zeroEditRate?.withoutEdit || 0} of ${data?.zeroEditRate?.total || 0} approved without edits`}
          trend={null}
        />
        <MetricCard
          title="Critic Pass Rate"
          value={isLoading ? '...' : `${data?.passRates?.overall || 0}%`}
          subtitle="G2/G4/G5 first-pass success"
          trend={null}
        />
        <MetricCard
          title="Self-Healing Efficiency"
          value={isLoading ? '...' : `${data?.healing?.avgLoops || 0}`}
          subtitle="Avg regeneration loops per spoke"
          trend={null}
        />
      </div>

      {/* Quality Gate Breakdown */}
      {!isLoading && data?.passRates && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GateMiniCard label="G2 Hook" score={data.passRates.g2} />
          <GateMiniCard label="G4 Voice" score={data.passRates.g4} />
          <GateMiniCard label="G5 Platform" score={data.passRates.g5} />
          <GateMiniCard label="G7 Predicted" score={data.passRates.g7} />
        </div>
      )}

      {/* Story 8-1: Zero-Edit Rate Trend (above fold - render immediately) */}
      <ZeroEditChart periodDays={debouncedPeriod} />

      {/* Story 8-2: Critic Pass Rate Trends (above fold - render immediately) */}
      <CriticTrends periodDays={debouncedPeriod} />

      {/* Story 8-3: Self-Healing Efficiency (lazy rendered) */}
      <div ref={healingRef}>
        {healingVisible ? (
          <HealingMetrics periodDays={debouncedPeriod} />
        ) : (
          <ChartSkeleton title="Self-Healing Efficiency" height={400} />
        )}
      </div>

      {/* Story 8-4: Content Volume & Review Velocity (lazy rendered) */}
      <div ref={velocityRef}>
        {velocityVisible ? (
          <VelocityDashboard periodDays={debouncedPeriod} />
        ) : (
          <ChartSkeleton title="Content Volume & Review Velocity" height={400} />
        )}
      </div>

      {/* Story 8-5: Kill Chain Analytics (lazy rendered) */}
      <div ref={killRef}>
        {killVisible ? (
          <KillAnalytics periodDays={debouncedPeriod} />
        ) : (
          <ChartSkeleton title="Kill Chain Analytics" height={450} />
        )}
      </div>

      {/* Story 8-6: DNA Strength & Drift Detection (lazy rendered) */}
      <div ref={driftRef}>
        {driftVisible ? (
          <DriftDetector periodDays={debouncedPeriod} />
        ) : (
          <ChartSkeleton title="DNA Strength & Drift Detection" height={450} />
        )}
      </div>
    </div>
  );
}

function GateMiniCard({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{label}</span>
      {score !== null ? (
        <span
          className="text-xl font-mono font-bold"
          style={{ color: score >= 80 ? 'var(--approve)' : 'var(--text-primary)' }}
        >
          {score}%
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">No data</span>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: number | null;
}

function MetricCard({ title, value, subtitle, trend }: MetricCardProps) {
  return (
    <div
      className="p-5 rounded-xl border transition-all hover:border-white/10 bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
    >
      <p className="text-sm text-[var(--text-secondary)]">
        {title}
      </p>
      <div className="flex items-end gap-2 mt-2">
        <p className="text-3xl font-semibold text-[var(--text-primary)]">
          {value}
        </p>
        {trend !== null && (
          <span
            className="text-sm font-medium pb-1 flex items-center gap-0.5"
            style={{ color: trend >= 0 ? 'var(--approve)' : 'var(--kill)' }}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xs mt-2 text-[var(--text-muted)]">
        {subtitle}
      </p>
    </div>
  );
}

/**
 * AC3: Skeleton placeholder for lazy-loaded charts
 * Uses Midnight Command design tokens per Rule 3
 */
function ChartSkeleton({ title, height }: { title: string; height: number }) {
  return (
    <div
      className="p-6 rounded-xl border animate-pulse bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[var(--text-primary)]">
          {title}
        </h3>
        <div
          className="h-3 w-48 mt-2 rounded bg-[var(--bg-surface)]"
        />
      </div>
      <div
        className="rounded-lg flex items-center justify-center bg-[var(--bg-surface)]"
        style={{ height: `${height - 100}px` }}
      >
        <div className="text-sm text-[var(--text-muted)]">
          Loading chart...
        </div>
      </div>
    </div>
  );
}
