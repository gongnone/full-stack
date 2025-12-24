/**
 * Story 8-6: Time-to-DNA and Drift Detection
 * Monitors brand voice consistency and DNA strength over time
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { AlertTriangle, TrendingUp, Target } from 'lucide-react';

interface DriftDetectorProps {
  periodDays?: number;
}

export function DriftDetector({ periodDays = 30 }: DriftDetectorProps) {
  const clientId = useClientId();

  const { data, isLoading } = trpc.analytics.getDriftHistory.useQuery(
    { clientId: clientId!, periodDays },
    { enabled: !!clientId }
  );

  const timeToDNAQuery = trpc.analytics.getTimeToDNA.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  );

  if (isLoading) {
    return (
      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          DNA Strength & Drift Detection
        </h3>
        <div className="h-[450px] flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading drift analysis...</div>
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
          DNA Strength & Drift Detection
        </h3>
        <div className="h-[450px] flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No data available</div>
        </div>
      </div>
    );
  }

  const chartData = data.data.map(d => ({
    ...d,
    date: new Date(d.date ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const currentStrength = data.currentStrength;
  const driftDetected = data.driftDetected;
  const driftThreshold = data.driftThreshold;

  // Calculate trends
  const strengthTrend = (data.data[data.data.length - 1]?.dnaStrength ?? 0) - (data.data[0]?.dnaStrength ?? 0);
  const avgDrift = Math.round(data.data.reduce((sum, d) => sum + d.driftScore, 0) / data.data.length);

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          DNA Strength & Drift Detection
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Brand voice consistency and learning progress
        </p>
      </div>

      {/* Alert Banner */}
      {driftDetected && (
        <div
          className="mb-6 p-4 rounded-lg border flex items-start gap-3"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--kill)' }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--kill)' }} />
          <div>
            <div className="font-medium" style={{ color: 'var(--kill)' }}>
              Voice Drift Detected
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Recent content shows deviation from established brand DNA. Consider reviewing calibration samples.
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              DNA Strength
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: currentStrength >= 80 ? 'var(--approve)' : 'var(--text-primary)' }}>
            {currentStrength}%
          </div>
          <div className="text-xs mt-1" style={{ color: strengthTrend >= 0 ? 'var(--approve)' : 'var(--kill)' }}>
            {strengthTrend >= 0 ? '↑' : '↓'} {Math.abs(strengthTrend)} from start
          </div>
        </div>

        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Avg Drift
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: avgDrift > driftThreshold ? 'var(--kill)' : 'var(--approve)' }}>
            {avgDrift}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Threshold: {driftThreshold}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Hubs to DNA
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {timeToDNAQuery.data?.hubsToTarget || 0}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Until target strength
          </div>
        </div>

        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Samples Analyzed
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {data.data[data.data.length - 1]?.sampleCount ?? 0}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Training data points
          </div>
        </div>
      </div>

      {/* DNA Strength Over Time */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          DNA Strength Evolution
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="dnaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            />
            <Area
              type="monotone"
              dataKey="dnaStrength"
              stroke="#00ff88"
              strokeWidth={2.5}
              fill="url(#dnaGradient)"
              name="DNA Strength"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Drift Score Monitoring */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Voice Drift Score (Lower is Better)
        </h4>
        <ResponsiveContainer width="100%" height={180}>
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
              domain={[0, 40]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {/* Threshold line */}
            <Line
              type="monotone"
              dataKey={() => driftThreshold}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Alert Threshold"
            />
            <Line
              type="monotone"
              dataKey="driftScore"
              name="Drift Score"
              stroke="#fbbf24"
              strokeWidth={2.5}
              dot={{ fill: '#fbbf24', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
