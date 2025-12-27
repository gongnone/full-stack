import { Link } from '@tanstack/react-router';

interface BucketCardProps {
  title: string;
  count: number;
  description: string;
  filter: 'high-confidence' | 'needs-review' | 'conflicts' | 'just-generated';
  variant: 'green' | 'yellow' | 'red' | 'blue';
}

const variantStyles = {
  green: 'border-[var(--approve)] bg-[var(--approve-glow)]',
  yellow: 'border-[var(--warning)] bg-[rgba(255,173,31,0.1)]',
  red: 'border-[var(--kill)] bg-[var(--kill-glow)]',
  blue: 'border-[var(--edit)] bg-[rgba(96,165,250,0.1)]',
};

const variantIcons = {
  green: (
    <svg className="w-6 h-6 text-[var(--approve)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  yellow: (
    <svg className="w-6 h-6 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  red: (
    <svg className="w-6 h-6 text-[var(--kill)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  blue: (
    <svg className="w-6 h-6 text-[var(--edit)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

export function BucketCard({ title, count, description, filter, variant }: BucketCardProps) {
  return (
    <Link
      to="/app/review"
      search={{ filter }}
      className={`
        block p-6 rounded-xl border-2 transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg
        ${variantStyles[variant]}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-[var(--bg-surface)]">
          {variantIcons[variant]}
        </div>
        <span className="text-3xl font-bold text-[var(--text-primary)]">{count}</span>
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--edit)]">
        Start Sprint
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
