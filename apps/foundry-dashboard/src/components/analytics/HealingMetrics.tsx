/**
 * Story 8-3: Self-Healing Efficiency Metrics
 * Measures the effectiveness of the healing loop
 */

import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { ANALYTICS_CONFIG } from '@/lib/constants';

interface HealingMetricsProps {
  periodDays?: number;
}

export const HealingMetrics = memo(function HealingMetrics({ periodDays = ANALYTICS_CONFIG.DEFAULT_PERIOD_DAYS }: HealingMetricsProps) {
  const clientId = useClientId();

  const { data, isLoading } = trpc.analytics.getHealingMetrics.useQuery(
    { clientId: clientId!, periodDays },
    { enabled: !!clientId }
  );

  if (isLoading) {
    return (
      <div
        className="p-6 rounded-xl border bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
      >
        <h3 className="text-lg font-medium mb-4 text-[var(--text-primary)]">
          Self-Healing Efficiency
        </h3>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-sm text-[var(--text-muted)]">Loading metrics...</div>
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div
        className="p-6 rounded-xl border bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
      >
        <h3 className="text-lg font-medium mb-4 text-[var(--text-primary)]">
          Self-Healing Efficiency
        </h3>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-sm text-[var(--text-muted)]">No data available</div>
        </div>
      </div>
    );
  }

  const chartData = useMemo(() =>
    data.data.map(d => ({
      ...d,
      date: new Date(d.date ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })),
    [data.data]
  );

  // Aggregation calculations - memoized
  const { avgLoops, avgSuccessRate, currentLoops, totalHeals } = useMemo(() => ({
    avgLoops: (data.data.reduce((sum, d) => sum + d.avgLoops, 0) / data.data.length).toFixed(2),
    avgSuccessRate: Math.round(data.data.reduce((sum, d) => sum + d.successRate, 0) / data.data.length),
    currentLoops: data.data[data.data.length - 1]?.avgLoops ?? 0,
    totalHeals: data.data.reduce((sum, d) => sum + d.totalHeals, 0),
  }), [data.data]);

  return (
    <div
      className="p-6 rounded-xl border bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[var(--text-primary)]">
          Self-Healing Efficiency
        </h3>
        <p className="text-sm mt-1 text-[var(--text-secondary)]">
          Automatic regeneration loop effectiveness
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Avg Loops per Spoke
          </div>
          <div className="text-2xl font-bold mt-1 text-[var(--text-primary)]">
            {currentLoops}
          </div>
          <div className="text-xs mt-1 text-[var(--text-secondary)]">
            Period avg: {avgLoops}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Success Rate
          </div>
          <div className="text-2xl font-bold mt-1 text-[var(--approve)]">
            {avgSuccessRate}%
          </div>
          <div className="text-xs mt-1 text-[var(--text-secondary)]">
            Eventually passes
          </div>
        </div>
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Total Heals
          </div>
          <div className="text-2xl font-bold mt-1 text-[var(--text-primary)]">
            {totalHeals}
          </div>
          <div className="text-xs mt-1 text-[var(--text-secondary)]">
            Last {periodDays} days
          </div>
        </div>
      </div>

      {/* Healing Loop Trend */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 text-[var(--text-secondary)]">
          Loops per Spoke Trend (Lower is Better)
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              domain={[0, 4]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            />
            <Line
              type="monotone"
              dataKey="avgLoops"
              name="Avg Loops"
              stroke="#ff9f43"
              strokeWidth={2.5}
              dot={{ fill: '#ff9f43', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Failure Analysis */}
      {data.topFailureGates && data.topFailureGates.length > 0 && (
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <h4 className="text-sm font-medium mb-3 text-[var(--text-secondary)]">
            Top Healing Triggers (by Gate)
          </h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data.topFailureGates}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="gate"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
});
