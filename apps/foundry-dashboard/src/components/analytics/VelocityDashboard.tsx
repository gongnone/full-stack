/**
 * Story 8-4: Content Volume and Review Velocity
 * Production metrics: how fast content is created and reviewed
 */

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';

interface VelocityDashboardProps {
  periodDays?: number;
}

export function VelocityDashboard({ periodDays = 30 }: VelocityDashboardProps) {
  const clientId = useClientId();

  const { data, isLoading } = trpc.analytics.getVelocityTrend.useQuery(
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
          Content Volume & Review Velocity
        </h3>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading velocity data...</div>
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
          Content Volume & Review Velocity
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

  // Calculate totals and averages
  const totalHubs = data.data.reduce((sum, d) => sum + d.hubsCreated, 0);
  const totalSpokes = data.data.reduce((sum, d) => sum + d.spokesGenerated, 0);
  const totalReviewed = data.data.reduce((sum, d) => sum + d.spokesReviewed, 0);
  const avgReviewTime = Math.round(
    data.data.reduce((sum, d) => sum + d.avgReviewTime, 0) / data.data.length
  );
  const reviewRate = totalSpokes > 0 ? Math.round((totalReviewed / totalSpokes) * 100) : 0;

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          Content Volume & Review Velocity
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Production throughput and review speed
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Hubs Created"
          value={totalHubs}
          icon="📊"
        />
        <StatCard
          label="Spokes Generated"
          value={totalSpokes}
          icon="✨"
        />
        <StatCard
          label="Spokes Reviewed"
          value={totalReviewed}
          icon="✓"
        />
        <StatCard
          label="Review Rate"
          value={`${reviewRate}%`}
          icon="⚡"
        />
        <StatCard
          label="Avg Review Time"
          value={`${avgReviewTime}s`}
          icon="⏱️"
        />
      </div>

      {/* Volume Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Daily Production Volume
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
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
            <Bar
              yAxisId="left"
              dataKey="spokesGenerated"
              name="Spokes Generated"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="spokesReviewed"
              name="Spokes Reviewed"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="hubsCreated"
              name="Hubs Created"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Review Speed Chart */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Average Review Time per Spoke
        </h4>
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="avgReviewTime"
              name="Avg Review Time"
              stroke="#ec4899"
              strokeWidth={2.5}
              dot={{ fill: '#ec4899', r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="p-4 rounded-lg bg-black/20 border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}
