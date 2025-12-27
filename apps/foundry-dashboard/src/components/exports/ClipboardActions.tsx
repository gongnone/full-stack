import * as React from 'react';
import { useState } from 'react';
import { ActionButton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { UI_CONFIG } from '@/lib/constants';
import { useToast } from '@/lib/toast';

/**
 * Story 6.5: Clipboard Copy Quick Actions
 * One-click copy for spoke content in various formats
 */

export interface ClipboardActionsProps {
  content: string;
  spokeCount?: number;
  onCopy?: (format: 'plain' | 'markdown' | 'json') => void;
  className?: string;
}

export function ClipboardActions({
  content,
  spokeCount = 1,
  onCopy,
  className,
}: ClipboardActionsProps) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState<'plain' | 'markdown' | 'json' | null>(null);

  const handleCopy = async (format: 'plain' | 'markdown' | 'json') => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(format);
      onCopy?.(format);

      setTimeout(() => setCopied(null), UI_CONFIG.COPIED_STATE_DURATION_MS);
    } catch (err) {
      console.error('Failed to copy:', err);
      addToast('Failed to copy to clipboard', 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    }
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex gap-2">
        <ActionButton
          variant={copied === 'plain' ? 'approve' : 'outline'}
          size="sm"
          onClick={() => handleCopy('plain')}
          data-testid="copy-plain"
        >
          {copied === 'plain' ? (
            <>
              <svg
                className="w-4 h-4"
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
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Plain
            </>
          )}
        </ActionButton>

        <ActionButton
          variant={copied === 'markdown' ? 'approve' : 'outline'}
          size="sm"
          onClick={() => handleCopy('markdown')}
          data-testid="copy-markdown"
        >
          {copied === 'markdown' ? (
            <>
              <svg
                className="w-4 h-4"
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
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Copy Markdown
            </>
          )}
        </ActionButton>

        <ActionButton
          variant={copied === 'json' ? 'approve' : 'outline'}
          size="sm"
          onClick={() => handleCopy('json')}
          data-testid="copy-json"
        >
          {copied === 'json' ? (
            <>
              <svg
                className="w-4 h-4"
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
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              Copy JSON
            </>
          )}
        </ActionButton>
      </div>

      {spokeCount > 1 && (
        <div className="text-xs text-[var(--text-muted)] font-medium">
          {spokeCount} spokes
        </div>
      )}
    </div>
  );
}
