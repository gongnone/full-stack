import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { useState } from 'react';
import { ActionButton } from '@/components/ui';
import { useToast } from '@/lib/toast';

export const Route = createFileRoute('/app/engagement')({
  component: EngagementPage,
});

const PLATFORMS = ['twitter', 'linkedin', 'instagram', 'tiktok'] as const;
type Platform = typeof PLATFORMS[number];

const PLATFORM_LABELS: Record<Platform, { name: string; icon: string; color: string }> = {
  twitter: { name: 'Twitter/X', icon: '𝕏', color: '#1DA1F2' },
  linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  instagram: { name: 'Instagram', icon: '📸', color: '#E4405F' },
  tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
};

function EngagementPage() {
  const clientId = useClientId();
  const { addToast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | undefined>();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [periodDays, setPeriodDays] = useState(30);

  const metricsQuery = trpc.engagement.getMetrics.useQuery(
    { clientId: clientId!, platform: selectedPlatform, limit: 50 },
    { enabled: !!clientId }
  );

  const statsQuery = trpc.engagement.getStats.useQuery(
    { clientId: clientId!, periodDays },
    { enabled: !!clientId }
  );

  const g7Query = trpc.engagement.getG7Predictions.useQuery(
    { clientId: clientId!, platform: selectedPlatform, limit: 50 },
    { enabled: !!clientId }
  );

  const connectionsQuery = trpc.engagement.getConnections.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  );

  const goldenNuggets = g7Query.data?.goldenNuggets || 0;

  // Story 12-6: Model accuracy tracking
  const accuracyQuery = trpc.engagement.getModelAccuracy.useQuery(
    { clientId: clientId!, platform: selectedPlatform },
    { enabled: !!clientId }
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Engagement & Predictions
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Track content performance and surface Golden Nuggets with G7 predictions
          </p>
        </div>
        <div className="flex gap-2">
          <ActionButton
            variant="approve"
            size="md"
            onClick={() => setShowManualEntry(true)}
          >
            + Add Metrics
          </ActionButton>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Posts Tracked"
          value={statsQuery.isLoading ? '...' : String((statsQuery.data?.overall as any)?.total_posts || 0)}
          subtitle={`Last ${periodDays} days`}
        />
        <StatCard
          title="Avg Engagement Rate"
          value={statsQuery.isLoading ? '...' : `${(((statsQuery.data?.overall as any)?.avg_engagement_rate || 0) * 100).toFixed(1)}%`}
          subtitle="Across all platforms"
        />
        <StatCard
          title="Total Impressions"
          value={statsQuery.isLoading ? '...' : formatNumber((statsQuery.data?.overall as any)?.total_impressions || 0)}
          subtitle={`Last ${periodDays} days`}
        />
        <StatCard
          title="🏆 Golden Nuggets"
          value={String(goldenNuggets)}
          subtitle="G7 Score ≥ 9"
          highlight
        />
      </div>

      {/* Platform Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedPlatform(undefined)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            !selectedPlatform ? 'font-medium' : ''
          }`}
          style={{
            backgroundColor: !selectedPlatform ? 'var(--edit)' : 'var(--bg-surface)',
            color: !selectedPlatform ? 'white' : 'var(--text-secondary)',
          }}
        >
          All Platforms
        </button>
        {PLATFORMS.map(platform => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform === selectedPlatform ? undefined : platform)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedPlatform === platform ? 'font-medium' : ''
            }`}
            style={{
              backgroundColor: selectedPlatform === platform ? PLATFORM_LABELS[platform].color : 'var(--bg-surface)',
              color: selectedPlatform === platform ? 'white' : 'var(--text-secondary)',
            }}
          >
            {PLATFORM_LABELS[platform].icon} {PLATFORM_LABELS[platform].name}
          </button>
        ))}
      </div>

      {/* Platform Breakdown */}
      {statsQuery.data?.byPlatform && (statsQuery.data.byPlatform as any[]).length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-3 text-[var(--text-primary)]">
            Platform Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(statsQuery.data.byPlatform as any[]).map((stat: any) => (
              <div
                key={stat.platform}
                className="p-4 rounded-xl border"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>{PLATFORM_LABELS[stat.platform as Platform]?.icon}</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {PLATFORM_LABELS[stat.platform as Platform]?.name || stat.platform}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Posts</span>
                    <span className="text-[var(--text-primary)]">{stat.post_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Avg Engagement</span>
                    <span className="text-[var(--text-primary)]">{((stat.avg_engagement_rate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Best</span>
                    <span style={{ color: 'var(--approve)' }}>{((stat.best_engagement_rate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Impressions</span>
                    <span className="text-[var(--text-primary)]">{formatNumber(stat.total_impressions)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* G7 Predictions */}
      {g7Query.data?.predictions && (g7Query.data.predictions as any[]).length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-3 text-[var(--text-primary)]">
            🏆 G7 Predictions
          </h2>
          <div className="space-y-2">
            {(g7Query.data.predictions as any[]).map((pred: any) => (
              <G7PredictionCard key={pred.id} prediction={pred} />
            ))}
          </div>
        </div>
      )}

      {/* Model Accuracy (Story 12-6) */}
      {accuracyQuery.data && (
        <div>
          <h2 className="text-lg font-medium mb-3 text-[var(--text-primary)]">
            🎯 Model Accuracy
          </h2>
          <div
            className="p-5 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: accuracyQuery.data.modelHealth === 'good' ? 'var(--approve)' :
                accuracyQuery.data.modelHealth === 'learning' ? 'var(--warning)' : 'var(--border-subtle)',
              borderWidth: accuracyQuery.data.modelHealth === 'good' ? '2px' : '1px',
            }}
          >
            {accuracyQuery.data.dataPoints === 0 ? (
              <p className="text-[var(--text-secondary)]">{accuracyQuery.data.message}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Correlation</p>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {accuracyQuery.data.correlation != null ? `r=${accuracyQuery.data.correlation}` : '—'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Target: r &gt; 0.6</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Mean Abs Error</p>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {accuracyQuery.data.meanAbsoluteError ?? '—'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Lower is better</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Directional Accuracy</p>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {accuracyQuery.data.directionalAccuracy != null
                      ? `${(accuracyQuery.data.directionalAccuracy * 100).toFixed(0)}%`
                      : '—'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Higher predicted = higher actual</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">🏆 Golden Precision</p>
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {accuracyQuery.data.goldenNuggetPrecision != null
                      ? `${(accuracyQuery.data.goldenNuggetPrecision * 100).toFixed(0)}%`
                      : '—'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">G7≥9 that performed well</p>
                </div>
              </div>
            )}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: accuracyQuery.data.modelHealth === 'good' ? 'var(--approve)' :
                    accuracyQuery.data.modelHealth === 'learning' ? 'var(--warning)' : 'var(--bg-surface)',
                  color: accuracyQuery.data.modelHealth === 'needs-data' ? 'var(--text-muted)' : 'white',
                }}
              >
                {accuracyQuery.data.modelHealth === 'good' ? '✅ Model Healthy' :
                  accuracyQuery.data.modelHealth === 'learning' ? '📈 Learning' : '📊 Needs Data'}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {accuracyQuery.data.dataPoints} data points • {accuracyQuery.data.recommendation}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Table */}
      <div>
        <h2 className="text-lg font-medium mb-3 text-[var(--text-primary)]">
          Engagement Metrics
        </h2>
        {metricsQuery.isLoading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">Loading metrics...</div>
        ) : !metricsQuery.data?.metrics?.length ? (
          <EmptyState onAddMetrics={() => setShowManualEntry(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Platform</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)] font-medium">Impressions</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)] font-medium">Likes</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)] font-medium">Comments</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)] font-medium">Shares</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)] font-medium">Eng. Rate</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)] font-medium">G7</th>
                  <th className="text-right py-3 px-4 text-[var(--text-muted)] font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {(metricsQuery.data.metrics as any[]).map((metric: any) => (
                  <tr
                    key={metric.id}
                    className="border-b hover:bg-[var(--bg-surface)] transition-colors"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-2">
                        <span>{PLATFORM_LABELS[metric.platform as Platform]?.icon}</span>
                        <span className="text-[var(--text-primary)]">
                          {PLATFORM_LABELS[metric.platform as Platform]?.name || metric.platform}
                        </span>
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-[var(--text-primary)]">{formatNumber(metric.impressions)}</td>
                    <td className="text-right py-3 px-4 text-[var(--text-primary)]">{formatNumber(metric.likes)}</td>
                    <td className="text-right py-3 px-4 text-[var(--text-primary)]">{formatNumber(metric.comments)}</td>
                    <td className="text-right py-3 px-4 text-[var(--text-primary)]">{formatNumber(metric.shares)}</td>
                    <td className="text-right py-3 px-4">
                      <EngagementBadge rate={metric.engagement_rate} />
                    </td>
                    <td className="text-right py-3 px-4">
                      {metric.g7_score != null ? (
                        <G7Badge score={metric.g7_score} confidence={metric.g7_confidence} />
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="text-right py-3 px-4 text-[var(--text-muted)]">
                      {metric.is_manual_entry ? '✏️ Manual' : '🔄 Auto'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && clientId && (
        <ManualEntryModal
          clientId={clientId}
          onClose={() => setShowManualEntry(false)}
          onSuccess={() => {
            setShowManualEntry(false);
            metricsQuery.refetch();
            statsQuery.refetch();
            addToast('Metrics added successfully!', 'success');
          }}
        />
      )}
    </div>
  );
}

// --- Sub-components ---

function StatCard({ title, value, subtitle, highlight }: { title: string; value: string; subtitle: string; highlight?: boolean }) {
  return (
    <div
      className="p-5 rounded-xl border"
      style={{
        backgroundColor: highlight ? 'var(--bg-surface)' : 'var(--bg-elevated)',
        borderColor: highlight ? 'var(--approve)' : 'var(--border-subtle)',
        borderWidth: highlight ? '2px' : '1px',
      }}
    >
      <p className="text-sm text-[var(--text-secondary)]">{title}</p>
      <p className="text-3xl font-semibold mt-2 text-[var(--text-primary)]">{value}</p>
      <p className="text-xs mt-2 text-[var(--text-muted)]">{subtitle}</p>
    </div>
  );
}

function EngagementBadge({ rate }: { rate: number }) {
  const pct = (rate * 100).toFixed(1);
  const color = rate >= 0.05 ? 'var(--approve)' : rate >= 0.02 ? 'var(--warning)' : 'var(--text-muted)';
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ color, backgroundColor: `${color}20` }}>
      {pct}%
    </span>
  );
}

function G7Badge({ score, confidence }: { score: number; confidence?: number }) {
  const color = score >= 9 ? 'var(--approve)' : score >= 7 ? 'var(--edit)' : score >= 5 ? 'var(--warning)' : 'var(--text-muted)';
  const label = score >= 9 ? '🏆' : score >= 7 ? '⭐' : '';
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1"
      style={{ color, backgroundColor: `${color}20` }}
      title={confidence != null ? `Confidence: ${(confidence * 100).toFixed(0)}%` : 'G7 Prediction Score'}
    >
      {label} {score.toFixed(1)}
      {confidence != null && confidence < 0.5 && (
        <span className="text-[var(--text-muted)]" title="Low confidence - beta prediction">β</span>
      )}
    </span>
  );
}

function G7PredictionCard({ prediction }: { prediction: any }) {
  const isGolden = prediction.g7_score >= 9;
  return (
    <div
      className="p-4 rounded-xl border flex items-center justify-between"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: isGolden ? 'var(--approve)' : 'var(--border-subtle)',
        borderWidth: isGolden ? '2px' : '1px',
      }}
    >
      <div className="flex items-center gap-3">
        <G7Badge score={prediction.g7_score} confidence={prediction.confidence} />
        <div>
          <span className="text-sm text-[var(--text-primary)]">
            {PLATFORM_LABELS[prediction.platform as Platform]?.icon} Spoke {prediction.spoke_id.slice(0, 8)}...
          </span>
          <div className="flex gap-3 mt-1 text-xs text-[var(--text-muted)]">
            <span>Hook: {(prediction.hook_similarity_score * 10).toFixed(1)}</span>
            <span>Quality: {(prediction.g2_quality_score * 10).toFixed(1)}</span>
            <span>Platform: {(prediction.platform_optimization_score * 10).toFixed(1)}</span>
          </div>
        </div>
      </div>
      <span className="text-xs text-[var(--text-muted)]">
        {prediction.model_version}
      </span>
    </div>
  );
}

function EmptyState({ onAddMetrics }: { onAddMetrics: () => void }) {
  return (
    <div
      className="text-center py-12 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="text-4xl mb-4">📊</div>
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
        No engagement data yet
      </h3>
      <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
        Start tracking your content performance by adding engagement metrics manually.
        The G7 prediction model will learn from your data to surface Golden Nuggets.
      </p>
      <ActionButton variant="approve" size="md" onClick={onAddMetrics}>
        + Add Your First Metrics
      </ActionButton>
    </div>
  );
}

// --- Manual Entry Modal ---

function ManualEntryModal({ clientId, onClose, onSuccess }: { clientId: string; onClose: () => void; onSuccess: () => void }) {
  const [platform, setPlatform] = useState<Platform>('twitter');
  const [spokeId, setSpokeId] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [impressions, setImpressions] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [shares, setShares] = useState('');
  const [clicks, setClicks] = useState('');

  // Get available spokes for selection
  const spokesQuery = trpc.review.getQueue.useQuery(
    { clientId, filter: 'all', limit: 100 },
    { enabled: !!clientId }
  );

  const addMetrics = trpc.engagement.addManualMetrics.useMutation({
    onSuccess,
    onError: (err) => {
      alert(`Error: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spokeId) {
      alert('Please select a spoke');
      return;
    }

    addMetrics.mutate({
      clientId,
      spokeId,
      platform,
      externalPostUrl: postUrl || undefined,
      impressions: parseInt(impressions) || 0,
      likes: parseInt(likes) || 0,
      comments: parseInt(comments) || 0,
      shares: parseInt(shares) || 0,
      clicks: parseInt(clicks) || 0,
      saves: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl p-6 shadow-xl"
        style={{ backgroundColor: 'var(--bg-base)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Add Engagement Metrics</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Platform</label>
            <div className="flex gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className="px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: platform === p ? PLATFORM_LABELS[p].color : 'var(--bg-surface)',
                    color: platform === p ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {PLATFORM_LABELS[p].icon} {PLATFORM_LABELS[p].name}
                </button>
              ))}
            </div>
          </div>

          {/* Spoke Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content Spoke</label>
            <select
              value={spokeId}
              onChange={e => setSpokeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            >
              <option value="">Select a spoke...</option>
              {(spokesQuery.data?.items as any[] || []).map((spoke: any) => (
                <option key={spoke.id} value={spoke.id}>
                  {spoke.title || spoke.hook || `Spoke ${spoke.id.slice(0, 8)}`} — {spoke.platform}
                </option>
              ))}
            </select>
          </div>

          {/* Post URL */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Post URL (optional)</label>
            <input
              type="url"
              value={postUrl}
              onChange={e => setPostUrl(e.target.value)}
              placeholder="https://twitter.com/..."
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricInput label="Impressions" value={impressions} onChange={setImpressions} />
            <MetricInput label="Likes" value={likes} onChange={setLikes} />
            <MetricInput label="Comments" value={comments} onChange={setComments} />
            <MetricInput label="Shares" value={shares} onChange={setShares} />
            <MetricInput label="Clicks" value={clicks} onChange={setClicks} />
          </div>

          {/* Preview */}
          {impressions && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <span className="text-[var(--text-muted)]">Calculated Engagement Rate: </span>
              <span className="font-medium text-[var(--text-primary)]">
                {(parseInt(impressions) > 0
                  ? (((parseInt(likes) || 0) + (parseInt(comments) || 0) + (parseInt(shares) || 0)) / parseInt(impressions) * 100)
                  : 0
                ).toFixed(2)}%
              </span>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-2">
            <ActionButton variant="ghost" size="md" onClick={onClose}>
              Cancel
            </ActionButton>
            <ActionButton
              variant="approve"
              size="md"
              disabled={addMetrics.isPending || !spokeId}
            >
              {addMetrics.isPending ? 'Saving...' : 'Save Metrics'}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function MetricInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0"
        className="w-full px-3 py-2 rounded-lg text-sm"
        style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
      />
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
