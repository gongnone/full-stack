import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/app/hubs')({
  component: HubsPage,
});

function HubsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Content Hubs
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage your content sources and pillars
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Hub
        </button>
      </div>

      {/* Empty state */}
      <div
        className="flex flex-col items-center justify-center py-16 rounded-xl border"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          No hubs yet
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Create your first hub to start generating content
        </p>
      </div>
    </div>
  );
}
