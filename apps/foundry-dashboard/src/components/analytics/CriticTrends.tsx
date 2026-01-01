/**
 * Story 8-2: Critic Pass Rate Trends
 * Charts critic approval trends over time for each quality gate
 */

import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { UI_CONFIG, ANALYTICS_CONFIG } from '@/lib/constants';

interface CriticTrendsProps {
  periodDays?: number;
}

export const CriticTrends = memo(function CriticTrends({ periodDays = ANALYTICS_CONFIG.DEFAULT_PERIOD_DAYS }: CriticTrendsProps) {
  const clientId = useClientId();

  const { data, isLoading } = trpc.analytics.getCriticPassTrend.useQuery(
    { clientId: clientId!, periodDays },
    { enabled: !!clientId }
  );

  const chartData = useMemo(() =>
    data?.data?.map(d => ({
      ...d,
      date: new Date(d.date ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })) ?? [],
    [data?.data]
  );

  const latest = useMemo(() => data?.data?.[data.data.length - 1] ?? { g2: 0, g4: 0, g5: 0, g7: 0 }, [data?.data]);

  if (isLoading) {
    return (
      <div
        className="p-6 rounded-xl border bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
      >
        <h3 className="text-lg font-medium mb-4 text-[var(--text-primary)]">
          Critic Pass Rate Trends
        </h3>
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-sm text-[var(--text-muted)]">Loading chart data...</div>
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
          Critic Pass Rate Trends
        </h3>
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-sm text-[var(--text-muted)]">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-xl border bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[var(--text-primary)]">
          Critic Pass Rate Trends
        </h3>
        <p className="text-sm mt-1 text-[var(--text-secondary)]">
          First-pass approval rates by quality gate
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            domain={[60, 100]}
            label={{ value: 'Pass Rate (%)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="g2"
            name="G2 Hook"
            stroke={UI_CONFIG.CHART_COLORS.G2}
            strokeWidth={2}
            dot={{ fill: UI_CONFIG.CHART_COLORS.G2, r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="g4"
            name="G4 Voice"
            stroke={UI_CONFIG.CHART_COLORS.G4}
            strokeWidth={2}
            dot={{ fill: UI_CONFIG.CHART_COLORS.G4, r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="g5"
            name="G5 Platform"
            stroke={UI_CONFIG.CHART_COLORS.G5}
            strokeWidth={2}
            dot={{ fill: UI_CONFIG.CHART_COLORS.G5, r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="g7"
            name="G7 Predicted"
            stroke={UI_CONFIG.CHART_COLORS.G7}
            strokeWidth={2}
            dot={{ fill: UI_CONFIG.CHART_COLORS.G7, r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
        <div className="grid grid-cols-4 gap-4">
          <GateCard label="G2 Hook" rate={latest.g2} color={UI_CONFIG.CHART_COLORS.G2} />
          <GateCard label="G4 Voice" rate={latest.g4} color={UI_CONFIG.CHART_COLORS.G4} />
          <GateCard label="G5 Platform" rate={latest.g5} color={UI_CONFIG.CHART_COLORS.G5} />
          <GateCard label="G7 Predicted" rate={latest.g7} color={UI_CONFIG.CHART_COLORS.G7} />
        </div>
      </div>
    </div>
  );
});

function GateCard({ label, rate, color }: { label: string; rate: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-wide mb-2 text-[var(--text-muted)]">
        {label}
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {rate}%
      </div>
      <div className="mt-1 h-1 rounded-full" style={{ backgroundColor: `${color}40` }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${rate}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
