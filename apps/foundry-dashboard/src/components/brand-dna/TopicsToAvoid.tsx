/**
 * Story 2.4: Brand DNA Report Dashboard
 * Topics to Avoid Component - Red pills showing words/topics to avoid
 *
 * Displays detected topics/words that should be avoided based on brand voice analysis.
 * Shown as red "pill" badges to indicate caution.
 */

interface TopicsToAvoidProps {
  topics: string[];
  className?: string;
}

export function TopicsToAvoid({ topics, className = '' }: TopicsToAvoidProps) {
  if (topics.length === 0) {
    return null; // Don't render section if no topics to avoid
  }

  return (
    <div className={className} data-testid="topics-to-avoid-section">
      <h3
        className="text-sm font-medium mb-3"
        style={{ color: 'var(--text-secondary)' }}
      >
        Topics to Avoid
      </h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="px-3 py-1.5 rounded-full text-sm"
            style={{
              backgroundColor: 'rgba(244, 33, 46, 0.15)',
              color: 'var(--kill)',
              border: '1px solid var(--kill)',
            }}
            title="This word/topic doesn't align with your brand voice"
            data-testid={`topic-pill-${topic.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
