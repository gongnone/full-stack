import { useState, useEffect, useCallback } from 'react';

interface TextPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string) => void;
  isSubmitting?: boolean;
}

/**
 * TextPasteModal component for pasting raw text content
 * Story 2.1: Multi-Source Content Ingestion for Brand Analysis
 *
 * AC: Paste raw text into input field, appears in samples list with "Pasted Text" source type
 */
export function TextPasteModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: TextPasteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim() && content.length >= 10) {
      onSubmit(title.trim(), content.trim());
    }
  }, [title, content, onSubmit]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const isValid = title.trim().length > 0 && content.length >= 10;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paste-modal-title"
        className="relative w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 id="paste-modal-title" className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Paste Content
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg transition-colors hover:bg-[var(--bg-surface)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Title Input */}
            <div>
              <label
                htmlFor="sample-title"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Title
              </label>
              <input
                id="sample-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., LinkedIn Post Examples"
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label
                htmlFor="sample-content"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Content
              </label>
              <textarea
                id="sample-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your content here... (minimum 10 characters)&#10;&#10;This could be blog posts, social media content, email newsletters, or any written content that represents your brand voice."
                rows={10}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors resize-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              />
              {/* Stats */}
              <div className="flex items-center justify-between mt-2 text-xs"
                style={{ color: 'var(--text-muted)' }}>
                <span>{wordCount} words</span>
                <span>{charCount.toLocaleString()} characters</span>
              </div>
            </div>

            {/* Validation Hint */}
            {content.length > 0 && content.length < 10 && (
              <p className="text-xs" style={{ color: 'var(--warning)' }}>
                Please enter at least 10 characters of content.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-surface)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isValid ? 'var(--edit)' : 'var(--bg-surface)',
                color: isValid ? 'white' : 'var(--text-muted)',
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Sample
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
