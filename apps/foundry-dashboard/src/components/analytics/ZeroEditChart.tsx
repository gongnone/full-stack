/**
 * Story 8-1: Zero-Edit Rate Dashboard
 * Tracks content that needs no edits - the ultimate success metric
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { UI_CONFIG, ANALYTICS_CONFIG } from '@/lib/constants';

interface ZeroEditChartProps {
  periodDays?: number;
}

export function ZeroEditChart({ periodDays = ANALYTICS_CONFIG.DEFAULT_PERIOD_DAYS }: ZeroEditChartProps) {
  const clientId = useClientId();

  const { data, isLoading } = trpc.analytics.getZeroEditTrend.useQuery(
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
          Zero-Edit Rate Trend
        </h3>
        <div className="h-[300px] flex items-center justify-center">
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
          Zero-Edit Rate Trend
        </h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No data available</div>
        </div>
      </div>
    );
  }

  const chartData = data.data.map(d => ({
    ...d,
    date: new Date(d.date ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Calculate trend metrics using centralized window size
  const windowSize = ANALYTICS_CONFIG.TREND_WINDOW_DAYS;
  const firstWeekAvg = data.data.slice(0, windowSize).reduce((sum, d) => sum + d.rate, 0) / windowSize;
  const lastWeekAvg = data.data.slice(-windowSize).reduce((sum, d) => sum + d.rate, 0) / windowSize;
  const trend = lastWeekAvg - firstWeekAvg;
  const currentRate = data.data[data.data.length - 1]?.rate ?? 0;

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Zero-Edit Rate Trend
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Content approved without modifications
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {currentRate.toFixed(1)}%
          </div>
          <div
            className="text-sm flex items-center gap-1 justify-end mt-1"
            style={{ color: trend >= 0 ? 'var(--approve)' : 'var(--kill)' }}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last period
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
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
            domain={[0, 100]}
            label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
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
            dataKey="rate"
            name="Zero-Edit Rate"
            stroke={UI_CONFIG.CHART_COLORS.PRIMARY}
            strokeWidth={2.5}
            dot={{ fill: UI_CONFIG.CHART_COLORS.PRIMARY, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Avg Rate
            </div>
            <div className="text-lg font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
              {(data.data.reduce((sum, d) => sum + d.rate, 0) / data.data.length).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Best Day
            </div>
            <div className="text-lg font-semibold mt-1" style={{ color: 'var(--approve)' }}>
              {Math.max(...data.data.map(d => d.rate)).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Total Items
            </div>
            <div className="text-lg font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
              {data.data.reduce((sum, d) => sum + d.count, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
