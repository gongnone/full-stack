import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/app/review')({
  component: ReviewPage,
});

function ReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Sprint Review
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Review and approve content at high velocity
        </p>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          No content to review
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Generate content from a hub to start reviewing
        </p>
        <div className="flex gap-3 mt-4">
          <kbd
            className="px-2 py-1 rounded text-xs font-mono"
            style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
          >
            ⌘H
          </kbd>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Start Sprint
          </span>
        </div>
      </div>
    </div>
  );
}
