import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { useState } from 'react';
import { ANALYTICS_CONFIG } from '@/lib/constants';
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

  const zeroEditQuery = trpc.analytics.getZeroEditRate.useQuery(
    { clientId: clientId!, periodDays },
    { enabled: !!clientId }
  );

  const passRateQuery = trpc.analytics.getCriticPassRate.useQuery(
    { clientId: clientId!, periodDays },
    { enabled: !!clientId }
  );

  const healingQuery = trpc.analytics.getSelfHealingEfficiency.useQuery(
    { clientId: clientId!, periodDays },
    { enabled: !!clientId }
  );

  const isLoading = zeroEditQuery.isLoading || passRateQuery.isLoading || healingQuery.isLoading;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Analytics Dashboard
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Performance metrics and learning loop analytics
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Period:</span>
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border text-sm"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Zero-Edit Rate"
          value={isLoading ? '...' : `${zeroEditQuery.data?.rate || 0}%`}
          subtitle={isLoading ? 'Loading...' : `${zeroEditQuery.data?.withoutEdit || 0} of ${zeroEditQuery.data?.total || 0} approved without edits`}
          trend={zeroEditQuery.data?.trend === 'up' ? 5 : zeroEditQuery.data?.trend === 'down' ? -3 : null}
        />
        <MetricCard
          title="Critic Pass Rate"
          value={isLoading ? '...' : `${passRateQuery.data?.overall || 0}%`}
          subtitle="G2/G4/G5 first-pass success"
          trend={null}
        />
        <MetricCard
          title="Self-Healing Efficiency"
          value={isLoading ? '...' : `${healingQuery.data?.avgLoops || 0}`}
          subtitle="Avg regeneration loops per spoke"
          trend={null}
        />
      </div>

      {/* Quality Gate Breakdown */}
      {!isLoading && passRateQuery.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GateMiniCard label="G2 Hook" score={passRateQuery.data.g2} />
          <GateMiniCard label="G4 Voice" score={passRateQuery.data.g4} />
          <GateMiniCard label="G5 Platform" score={passRateQuery.data.g5} />
          <GateMiniCard label="G7 Predicted" score={passRateQuery.data.g7} />
        </div>
      )}

      {/* Story 8-1: Zero-Edit Rate Trend */}
      <ZeroEditChart periodDays={periodDays} />

      {/* Story 8-2: Critic Pass Rate Trends */}
      <CriticTrends periodDays={periodDays} />

      {/* Story 8-3: Self-Healing Efficiency */}
      <HealingMetrics periodDays={periodDays} />

      {/* Story 8-4: Content Volume & Review Velocity */}
      <VelocityDashboard periodDays={periodDays} />

      {/* Story 8-5: Kill Chain Analytics */}
      <KillAnalytics periodDays={periodDays} />

      {/* Story 8-6: DNA Strength & Drift Detection */}
      <DriftDetector periodDays={periodDays} />
    </div>
  );
}

function GateMiniCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{label}</span>
      <span className="text-xl font-mono font-bold" style={{ color: score >= 80 ? 'var(--approve)' : 'var(--text-primary)' }}>
        {score}%
      </span>
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
      className="p-5 rounded-xl border transition-all hover:border-white/10"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
      <div className="flex items-end gap-2 mt-2">
        <p className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
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
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        {subtitle}
      </p>
    </div>
  );
}
