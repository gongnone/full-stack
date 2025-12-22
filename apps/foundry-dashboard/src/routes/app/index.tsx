import { createFileRoute } from '@tanstack/react-router';
import { useSession } from '@/lib/auth-client';
import { trpc } from '@/lib/trpc-client';

export const Route = createFileRoute('/app/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: session } = useSession();

  // Example tRPC query - fetch clients list
  const clientsQuery = trpc.clients.list.useQuery(
    {},
    {
      enabled: !!session,
      retry: false,
    }
  );

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
          change="+2 this week"
          changeType="positive"
        />
        <StatCard
          title="Content Hubs"
          value="0"
          change="No change"
          changeType="neutral"
        />
        <StatCard
          title="Pending Review"
          value="0"
          change="All caught up!"
          changeType="positive"
        />
        <StatCard
          title="Zero-Edit Rate"
          value="—"
          change="Add content to track"
          changeType="neutral"
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
            count={0}
            color="var(--approve)"
            description="Ready to approve"
          />
          <ActionBucket
            title="Needs Review"
            count={0}
            color="var(--warning)"
            description="Requires attention"
          />
          <ActionBucket
            title="Creative Conflicts"
            count={0}
            color="var(--kill)"
            description="Director's cut needed"
          />
          <ActionBucket
            title="Just Generated"
            count={0}
            color="var(--edit)"
            description="Fresh content"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <QuickActionButton icon="plus" label="New Hub" />
          <QuickActionButton icon="play" label="Start Sprint" />
          <QuickActionButton icon="users" label="Add Client" />
          <QuickActionButton icon="chart" label="View Analytics" />
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
}

function ActionBucket({ title, count, color, description }: ActionBucketProps) {
  return (
    <button
      className="p-5 rounded-xl border text-left transition-all hover:scale-[1.02]"
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
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: color, color: '#000' }}
        >
          {count}
        </span>
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </button>
  );
}

interface QuickActionButtonProps {
  icon: 'plus' | 'play' | 'users' | 'chart';
  label: string;
}

function QuickActionButton({ icon, label }: QuickActionButtonProps) {
  const icons = {
    plus: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    play: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    users: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    chart: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  };

  return (
    <button
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-primary)',
      }}
    >
      <span style={{ color: 'var(--edit)' }}>{icons[icon]}</span>
      {label}
    </button>
  );
}
