/**
 * Story 2.3 & 2.4: Brand DNA Analysis & Scoring + Report Dashboard
 * Part of Task 7: Signature Phrases as interactive chips with hover tooltips
 *
 * Displays detected signature phrases from brand voice analysis.
 * Story 2.4 enhancement: SignaturePhrase interface now includes example usage
 * displayed via tooltip on hover.
 */

import type { SignaturePhrase } from '@/../../worker/types';

interface SignaturePhrasesChipsProps {
  phrases: SignaturePhrase[];
  className?: string;
}

export function SignaturePhrasesChips({ phrases, className = '' }: SignaturePhrasesChipsProps) {
  if (phrases.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No signature phrases detected yet. Add more training samples.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3
        className="text-sm font-medium mb-3"
        style={{ color: 'var(--text-secondary)' }}
      >
        Signature Phrases
      </h3>
      <div className="flex flex-wrap gap-2">
        {phrases.map((item) => (
          <span
            key={item.phrase}
            className="px-3 py-1.5 rounded-full text-sm cursor-default transition-colors"
            style={{
              backgroundColor: 'rgba(29, 155, 240, 0.15)',
              color: 'var(--edit)',
              border: '1px solid var(--edit)',
            }}
            title={item.example || 'Detected signature phrase from your content'}
            data-testid={`signature-phrase-${item.phrase.replace(/\s+/g, '-').toLowerCase()}`}
          >
            "{item.phrase}"
          </span>
        ))}
      </div>
    </div>
  );
}
