import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';

export const Route = createFileRoute('/app/analytics')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const clientId = useClientId();
  
  const zeroEditQuery = trpc.analytics.getZeroEditRate.useQuery(
    { clientId: clientId!, periodDays: 30 },
    { enabled: !!clientId }
  );
  
  const passRateQuery = trpc.analytics.getCriticPassRate.useQuery(
    { clientId: clientId!, periodDays: 30 },
    { enabled: !!clientId }
  );
  
  const healingQuery = trpc.analytics.getSelfHealingEfficiency.useQuery(
    { clientId: clientId!, periodDays: 30 },
    { enabled: !!clientId }
  );

  const isLoading = zeroEditQuery.isLoading || passRateQuery.isLoading || healingQuery.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Analytics
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Track performance and system learning metrics
        </p>
      </div>

      {/* Metrics Grid */}
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

      {/* Empty chart area */}
      <div
        className="p-8 rounded-xl border"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Performance Over Time
        </h2>
        <div
          className="flex flex-col items-center justify-center py-12 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <svg className="w-12 h-12 mb-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Historical trend charts are being prepared
          </p>
        </div>
      </div>
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
