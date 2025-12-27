/**
 * Story 8-3: Self-Healing Efficiency Metrics
 * Measures the effectiveness of the healing loop
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';

interface HealingMetricsProps {
  periodDays?: number;
}

export function HealingMetrics({ periodDays = 30 }: HealingMetricsProps) {
  const clientId = useClientId();

  const { data, isLoading } = trpc.analytics.getHealingMetrics.useQuery(
    { clientId: clientId!, periodDays },
    { enabled: !!clientId }
  );

  if (isLoading) {
    return (
      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Self-Healing Efficiency
        </h3>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading metrics...</div>
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Self-Healing Efficiency
        </h3>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No data available</div>
        </div>
      </div>
    );
  }

  const chartData = data.data.map(d => ({
    ...d,
    date: new Date(d.date ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const avgLoops = (data.data.reduce((sum, d) => sum + d.avgLoops, 0) / data.data.length).toFixed(2);
  const avgSuccessRate = Math.round(data.data.reduce((sum, d) => sum + d.successRate, 0) / data.data.length);
  const currentLoops = data.data[data.data.length - 1]?.avgLoops ?? 0;

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          Self-Healing Efficiency
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Automatic regeneration loop effectiveness
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Avg Loops per Spoke
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {currentLoops}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Period avg: {avgLoops}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Success Rate
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--approve)' }}>
            {avgSuccessRate}%
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Eventually passes
          </div>
        </div>
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Total Heals
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {data.data.reduce((sum, d) => sum + d.totalHeals, 0)}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Last {periodDays} days
          </div>
        </div>
      </div>

      {/* Healing Loop Trend */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
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
        <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
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
}
