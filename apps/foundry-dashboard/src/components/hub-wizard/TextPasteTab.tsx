/**
 * Story 3-1: Source Selection & Upload Wizard
 * TextPasteTab - Textarea with character/word count
 */

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import { TEXT_CONTENT_LIMITS, formatNumber } from '@/lib/constants';

interface TextPasteTabProps {
  clientId: string;
  onSourceCreated: (sourceId: string) => void;
  disabled?: boolean;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function TextPasteTab({ clientId, onSourceCreated, disabled }: TextPasteTabProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTextSource = trpc.hubs.createTextSource.useMutation();

  const charCount = content.length;
  const wordCount = countWords(content);
  const { MIN_CHARS, MAX_CHARS } = TEXT_CONTENT_LIMITS;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createTextSource.mutateAsync({
        clientId,
        content,
        title: title.trim() || 'Untitled',
      });

      onSourceCreated(result.sourceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
      setIsSubmitting(false);
    }
  }, [clientId, content, title, isValid, isSubmitting, createTextSource, onSourceCreated]);

  return (
    <div className="space-y-4">
      {/* Optional title */}
      <div>
        <label
          htmlFor="source-title"
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Title (optional)
        </label>
        <input
          id="source-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Blog post about marketing"
          disabled={disabled || isSubmitting}
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Content textarea */}
      <div>
        <label
          htmlFor="source-content"
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Content
        </label>
        <textarea
          id="source-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Paste your content here... (minimum ${formatNumber(MIN_CHARS)} characters)`}
          disabled={disabled || isSubmitting}
          rows={10}
          className="w-full px-3 py-2 rounded-lg text-sm resize-none"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: `1px solid ${charCount > 0 && !isValid ? 'var(--kill)' : 'var(--border-subtle)'}`,
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Character/word count */}
      <div className="flex items-center justify-between text-sm">
        <div style={{ color: charCount > 0 && charCount < MIN_CHARS ? 'var(--kill)' : 'var(--text-muted)' }}>
          {formatNumber(charCount)} / {formatNumber(MIN_CHARS)} min characters
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          {formatNumber(wordCount)} words
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={disabled || isSubmitting || !isValid}
        className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isValid ? 'var(--approve)' : 'var(--bg-surface)',
          color: isValid ? 'white' : 'var(--text-muted)',
          border: isValid ? 'none' : '1px solid var(--border-subtle)',
        }}
      >
        {isSubmitting ? 'Saving...' : 'Use This Content'}
      </button>

      {error && (
        <p className="text-sm text-center" style={{ color: 'var(--kill)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
