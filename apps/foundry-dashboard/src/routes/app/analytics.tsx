import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/app/analytics')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
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
          value="—"
          subtitle="Add content to track"
          trend={null}
        />
        <MetricCard
          title="Critic Pass Rate"
          value="—"
          subtitle="G2/G4/G5 first-pass"
          trend={null}
        />
        <MetricCard
          title="Self-Healing Efficiency"
          value="—"
          subtitle="Avg loops per spoke"
          trend={null}
        />
      </div>

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
            Charts will appear once you have content data
          </p>
        </div>
      </div>
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
      className="p-5 rounded-xl border"
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
            className="text-sm font-medium pb-1"
            style={{ color: trend >= 0 ? 'var(--approve)' : 'var(--kill)' }}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        {subtitle}
      </p>
    </div>
  );
}
