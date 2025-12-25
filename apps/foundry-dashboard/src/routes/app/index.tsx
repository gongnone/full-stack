import { createFileRoute, Link } from '@tanstack/react-router';
import { useSession } from '@/lib/auth-client';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import { ActionButton } from '@/components/ui';

export const Route = createFileRoute('/app/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: session } = useSession();
  const clientId = useClientId();

  // Real tRPC queries
  const clientsQuery = trpc.clients.list.useQuery({}, { enabled: !!session });
  
  const highConfidenceQuery = trpc.review.getQueue.useQuery(
    { clientId: clientId!, filter: 'top10', limit: 100 },
    { enabled: !!clientId }
  );
  
  const needsReviewQuery = trpc.review.getQueue.useQuery(
    { clientId: clientId!, filter: 'all', limit: 100 },
    { enabled: !!clientId }
  );
  
  const conflictsQuery = trpc.review.getQueue.useQuery(
    { clientId: clientId!, filter: 'flagged', limit: 100 },
    { enabled: !!clientId }
  );

  const volumeQuery = trpc.analytics.getVolumeMetrics.useQuery(
    { clientId: clientId!, periodDays: 30 },
    { enabled: !!clientId }
  );

  const zeroEditQuery = trpc.analytics.getZeroEditRate.useQuery(
    { clientId: clientId!, periodDays: 30 },
    { enabled: !!clientId }
  );

  const bucketCounts = {
    highConfidence: highConfidenceQuery.data?.totalCount || 0,
    needsReview: needsReviewQuery.data?.totalCount || 0,
    creativeConflicts: conflictsQuery.data?.totalCount || 0,
    justGenerated: volumeQuery.data?.spokesGenerated || 0
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Welcome back, {session?.user.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Here's what's happening with your content today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Clients"
          value={clientsQuery.isLoading ? '...' : String(clientsQuery.data?.items?.length || 0)}
          change={clientsQuery.data?.items?.length === 1 ? "1 client" : `${clientsQuery.data?.items?.length || 0} clients`}
          changeType="neutral"
        />
        <StatCard
          title="Content Hubs"
          value={volumeQuery.isLoading ? '...' : String(volumeQuery.data?.hubsCreated || 0)}
          change="+1 today"
          changeType="positive"
        />
        <StatCard
          title="Pending Review"
          value={String(bucketCounts.highConfidence + bucketCounts.needsReview)}
          change={`${bucketCounts.highConfidence} high conf`}
          changeType="positive"
        />
        <StatCard
          title="Zero-Edit Rate"
          value={zeroEditQuery.isLoading ? '...' : `${zeroEditQuery.data?.rate || 0}%`}
          change={`${zeroEditQuery.data?.trend === 'up' ? '+' : ''} trend`}
          changeType={zeroEditQuery.data?.trend === 'up' ? 'positive' : zeroEditQuery.data?.trend === 'down' ? 'negative' : 'neutral'}
        />
      </div>

      {/* Action Buckets */}
      <div>
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Review Queue
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionBucket
            title="High Confidence"
            count={bucketCounts.highConfidence}
            color="var(--approve)"
            description="Ready to approve"
            filter="high-confidence"
          />
          <ActionBucket
            title="Needs Review"
            count={bucketCounts.needsReview}
            color="var(--warning)"
            description="Requires attention"
            filter="needs-review"
          />
          <ActionBucket
            title="Creative Conflicts"
            count={bucketCounts.creativeConflicts}
            color="var(--kill)"
            description="Director's cut needed"
            filter="conflicts"
          />
          <ActionBucket
            title="Just Generated"
            count={bucketCounts.justGenerated}
            color="var(--edit)"
            description="Fresh content"
            filter="recent"
          />
        </div>
      </div>

      {/* Quick Actions - Story 1.4: Demonstrating ActionButton component */}
      <div>
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/app/hubs/new">
            <ActionButton variant="approve" size="md" data-testid="new-hub-btn">
              New Hub
            </ActionButton>
          </Link>
          <Link to="/app/review">
            <ActionButton variant="edit" size="md">
              Start Sprint
            </ActionButton>
          </Link>
          <Link to="/app/clients">
            <ActionButton variant="ghost" size="md">
              Add Client
            </ActionButton>
          </Link>
          <Link to="/app/analytics">
            <ActionButton variant="outline" size="md">
              View Analytics
            </ActionButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

function StatCard({ title, value, change, changeType }: StatCardProps) {
  const changeColor = {
    positive: 'var(--approve)',
    negative: 'var(--kill)',
    neutral: 'var(--text-muted)',
  }[changeType];

  return (
    <div
      className="p-5 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
      <p className="text-3xl font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-xs mt-2" style={{ color: changeColor }}>
        {change}
      </p>
    </div>
  );
}

interface ActionBucketProps {
  title: string;
  count: number;
  color: string;
  description: string;
  filter: string;
}

function ActionBucket({ title, count, color, description, filter }: ActionBucketProps) {
  return (
    <Link
      to="/app/review"
      search={{ filter }}
      className="p-5 rounded-xl border text-left transition-all hover:scale-[1.02] block group"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: count > 0 ? color : 'var(--border-subtle)',
        borderWidth: count > 0 ? '2px' : '1px',
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium transition-transform group-hover:scale-110"
          style={{ backgroundColor: color, color: '#000' }}
        >
          {count}
        </span>
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </Link>
  );
}

