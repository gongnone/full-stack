import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Story 6.1: Export Format Selector
 * Allows users to choose export format (CSV or JSON)
 */

export interface ExportFormatSelectorProps {
  value: 'csv' | 'json';
  onChange: (format: 'csv' | 'json') => void;
  className?: string;
}

export function ExportFormatSelector({ value, onChange, className }: ExportFormatSelectorProps) {
  return (
    <div className={cn('flex gap-3', className)}>
      <button
        type="button"
        onClick={() => onChange('csv')}
        className={cn(
          'flex-1 px-6 py-4 rounded-xl border-2 transition-all font-medium',
          value === 'csv'
            ? 'border-[var(--approve)] bg-[var(--approve-glow)] text-[var(--approve)]'
            : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
        )}
        data-testid="format-csv"
      >
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="text-sm font-bold">CSV</div>
          <div className="text-xs text-[var(--text-muted)]">Excel-compatible</div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('json')}
        className={cn(
          'flex-1 px-6 py-4 rounded-xl border-2 transition-all font-medium',
          value === 'json'
            ? 'border-[var(--approve)] bg-[var(--approve-glow)] text-[var(--approve)]'
            : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
        )}
        data-testid="format-json"
      >
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-8 h-8"
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
          <div className="text-sm font-bold">JSON</div>
          <div className="text-xs text-[var(--text-muted)]">Developer-friendly</div>
        </div>
      </button>
    </div>
  );
}
