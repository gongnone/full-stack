/**
 * Story 3-1: Source Selection & Upload Wizard
 * UrlInputTab - URL input with YouTube/HTTPS validation
 */

import { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc-client';

interface UrlInputTabProps {
  clientId: string;
  onSourceCreated: (sourceId: string) => void;
  disabled?: boolean;
}

function LinkIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function YouTubeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function UrlInputTab({ clientId, onSourceCreated, disabled }: UrlInputTabProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUrlSource = trpc.hubs.createUrlSource.useMutation();

  const validation = useMemo(() => {
    if (!url.trim()) {
      return { valid: false, message: '', isYouTube: false };
    }

    try {
      const urlObj = new URL(url);
      const isYouTube = ['youtube.com', 'youtu.be', 'www.youtube.com'].some(d =>
        urlObj.hostname.includes(d)
      );
      const isHttps = urlObj.protocol === 'https:';

      if (!isHttps && !isYouTube) {
        return { valid: false, message: 'URL must use HTTPS', isYouTube: false };
      }

      return { valid: true, message: '', isYouTube };
    } catch {
      return { valid: false, message: 'Please enter a valid URL', isYouTube: false };
    }
  }, [url]);

  const handleSubmit = useCallback(async () => {
    if (!validation.valid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createUrlSource.mutateAsync({
        clientId,
        url: url.trim(),
        title: title.trim() || undefined,
      });

      onSourceCreated(result.sourceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add URL');
      setIsSubmitting(false);
    }
  }, [clientId, url, title, validation.valid, isSubmitting, createUrlSource, onSourceCreated]);

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div
        className="flex items-start gap-3 p-3 rounded-lg text-sm"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex gap-2 flex-shrink-0 mt-0.5">
          <LinkIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <YouTubeIcon className="w-4 h-4" style={{ color: '#FF0000' }} />
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          Paste a web article URL or YouTube video link. Content will be extracted automatically.
        </p>
      </div>

      {/* URL input */}
      <div>
        <label
          htmlFor="source-url"
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          URL
        </label>
        <input
          id="source-url"
          data-testid="source-url"
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="https://example.com/article or YouTube URL"
          disabled={disabled || isSubmitting}
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: `1px solid ${url && !validation.valid ? 'var(--kill)' : 'var(--border-subtle)'}`,
            color: 'var(--text-primary)',
          }}
        />
        {url && !validation.valid && validation.message && (
          <p className="mt-1 text-xs" style={{ color: 'var(--kill)' }}>
            {validation.message}
          </p>
        )}
        {validation.isYouTube && (
          <p className="mt-1 text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <YouTubeIcon className="w-3 h-3" style={{ color: '#FF0000' }} />
            YouTube video detected - transcript will be extracted
          </p>
        )}
      </div>

      {/* Optional title */}
      <div>
        <label
          htmlFor="url-title"
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Title (optional)
        </label>
        <input
          id="url-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Custom title for this source"
          disabled={disabled || isSubmitting}
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={disabled || isSubmitting || !validation.valid}
        className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: validation.valid ? 'var(--approve)' : 'var(--bg-surface)',
          color: validation.valid ? 'white' : 'var(--text-muted)',
          border: validation.valid ? 'none' : '1px solid var(--border-subtle)',
        }}
      >
        {isSubmitting ? 'Adding...' : 'Add URL Source'}
      </button>

      {error && (
        <p className="text-sm text-center" style={{ color: 'var(--kill)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
