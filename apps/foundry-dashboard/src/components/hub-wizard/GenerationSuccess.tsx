import { Link } from '@tanstack/react-router';
import { ActionButton } from '@/components/ui';

interface GenerationSuccessProps {
  hubId: string;
  spokeCount: number;
  pillarCount: number;
}

export function GenerationSuccess({ hubId, spokeCount, pillarCount }: GenerationSuccessProps) {
  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8 animate-fadeIn">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full bg-[var(--approve-glow)] flex items-center justify-center">
          <svg
            className="w-12 h-12 text-[var(--approve)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          🎉 {spokeCount} Spokes Generated!
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">
          Your content is ready for review across {pillarCount} pillar{pillarCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Next Steps Card */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-8 space-y-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Next Steps</h2>
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--approve-glow)] text-[var(--approve)] flex items-center justify-center flex-shrink-0 text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Review Your Content</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Approve, edit, or kill spokes to curate your final content lineup
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--edit-glow)] text-[var(--edit)] flex items-center justify-center flex-shrink-0 text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Use Keyboard Shortcuts</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                [→] Approve • [←] Kill • [E] Edit • [C] Clone
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--warning)]/20 text-[var(--warning)] flex items-center justify-center flex-shrink-0 text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Schedule & Publish</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                After review, schedule your approved content for publishing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <Link to="/app/review" search={{ filter: 'just-generated' }}>
          <ActionButton variant="approve" size="lg">
            Start Reviewing
          </ActionButton>
        </Link>
        <Link to={`/app/hubs/${hubId}` as any}>
          <ActionButton variant="ghost" size="lg">
            View Hub Details
          </ActionButton>
        </Link>
      </div>

      {/* Pro Tip */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--edit-glow)] max-w-md mx-auto">
        <svg
          className="w-5 h-5 text-[var(--edit)] flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-[var(--edit)] font-medium">
          <span className="font-bold">Pro Tip:</span> Use Cmd+H for high-confidence sprint (spokes
          with G7 ≥ 9.0)
        </p>
      </div>
    </div>
  );
}
