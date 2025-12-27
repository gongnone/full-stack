/**
 * Story 8-5: Kill Chain Analytics
 * Tracks patterns in killed content to improve future generation
 */

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';

interface KillAnalyticsProps {
  periodDays?: number;
}

export function KillAnalytics({ periodDays = 30 }: KillAnalyticsProps) {
  const clientId = useClientId();

  const { data, isLoading } = trpc.analytics.getKillChainTrend.useQuery(
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
          Kill Chain Analytics
        </h3>
        <div className="h-[450px] flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading kill analytics...</div>
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
          Kill Chain Analytics
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

  const totalKills = data.data.reduce((sum, d) => sum + d.totalKills, 0);
  const totalHubKills = data.data.reduce((sum, d) => sum + d.hubKills, 0);
  const totalSpokeKills = data.data.reduce((sum, d) => sum + d.spokeKills, 0);

  // Calculate trend
  const firstWeek = data.data.slice(0, 7).reduce((sum, d) => sum + d.totalKills, 0) / 7;
  const lastWeek = data.data.slice(-7).reduce((sum, d) => sum + d.totalKills, 0) / 7;
  const trendDirection = lastWeek < firstWeek ? 'improving' : 'worsening';
  const trendPercent = Math.abs(((lastWeek - firstWeek) / firstWeek) * 100).toFixed(1);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'];

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          Kill Chain Analytics
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Learning from rejected content patterns
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Total Kills
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--kill)' }}>
            {totalKills}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Hub Kills
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--kill)' }}>
            {totalHubKills}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Spoke Kills
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--kill)' }}>
            {totalSpokeKills}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-black/20 border border-white/5">
          <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Trend
          </div>
          <div
            className="text-2xl font-bold mt-1"
            style={{ color: trendDirection === 'improving' ? 'var(--approve)' : 'var(--kill)' }}
          >
            {trendDirection === 'improving' ? '↓' : '↑'} {trendPercent}%
          </div>
        </div>
      </div>

      {/* Kill Trend Over Time */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Kill Rate Trend (Lower is Better)
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
              dataKey="totalKills"
              name="Total Kills"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ fill: '#ef4444', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="hubKills"
              name="Hub Kills"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="spokeKills"
              name="Spoke Kills"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={{ fill: '#fbbf24', r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Kill Reasons */}
      {data.topReasons && data.topReasons.length > 0 && (
        <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            Top Kill Reasons (Learning Opportunities)
          </h4>
          <div className="space-y-3 mb-4">
            {data.topReasons.map((reason, index) => (
              <div key={reason.reason} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {reason.reason}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {reason.count} ({reason.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${reason.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.topReasons}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="reason"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                angle={-15}
                textAnchor="end"
                height={80}
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
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.topReasons.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
