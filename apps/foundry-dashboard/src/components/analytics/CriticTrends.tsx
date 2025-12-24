/**
 * Story 8-2: Critic Pass Rate Trends
 * Charts critic approval trends over time for each quality gate
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';

interface CriticTrendsProps {
  periodDays?: number;
}

export function CriticTrends({ periodDays = 30 }: CriticTrendsProps) {
  const clientId = useClientId();

  const { data, isLoading } = trpc.analytics.getCriticPassTrend.useQuery(
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
          Critic Pass Rate Trends
        </h3>
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading chart data...</div>
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
          Critic Pass Rate Trends
        </h3>
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No data available</div>
        </div>
      </div>
    );
  }

  const chartData = data.data.map(d => ({
    ...d,
    date: new Date(d.date ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Calculate current rates
  const latest = data.data[data.data.length - 1]!;

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          Critic Pass Rate Trends
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
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
            stroke="#ff6b6b"
            strokeWidth={2}
            dot={{ fill: '#ff6b6b', r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="g4"
            name="G4 Voice"
            stroke="#4ecdc4"
            strokeWidth={2}
            dot={{ fill: '#4ecdc4', r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="g5"
            name="G5 Platform"
            stroke="#95e1d3"
            strokeWidth={2}
            dot={{ fill: '#95e1d3', r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="g7"
            name="G7 Predicted"
            stroke="#ffd93d"
            strokeWidth={2}
            dot={{ fill: '#ffd93d', r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="grid grid-cols-4 gap-4">
          <GateCard label="G2 Hook" rate={latest.g2} color="#ff6b6b" />
          <GateCard label="G4 Voice" rate={latest.g4} color="#4ecdc4" />
          <GateCard label="G5 Platform" rate={latest.g5} color="#95e1d3" />
          <GateCard label="G7 Predicted" rate={latest.g7} color="#ffd93d" />
        </div>
      </div>
    </div>
  );
}

function GateCard({ label, rate, color }: { label: string; rate: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
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
