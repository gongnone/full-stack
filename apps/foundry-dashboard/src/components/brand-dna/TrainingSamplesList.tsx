import { useState } from 'react';

type QualityBadge = 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'pending';
type SourceType = 'pdf' | 'pasted_text' | 'article' | 'transcript' | 'voice';
type Status = 'pending' | 'processing' | 'analyzed' | 'failed';

interface TrainingSample {
  id: string;
  title: string;
  source_type: SourceType;
  word_count: number;
  status: Status;
  quality_score: number | null;
  created_at: number;
}

interface TrainingSampleWithQuality {
  sample: TrainingSample;
  qualityBadge: QualityBadge;
}

interface TrainingSamplesListProps {
  samples: TrainingSampleWithQuality[];
  isLoading?: boolean;
  onDelete: (sampleId: string) => void;
  isDeleting?: string | null;
}

/**
 * TrainingSamplesList component for displaying uploaded training samples
 * Story 2.1: Multi-Source Content Ingestion for Brand Analysis
 *
 * AC4: View samples with: source icon, title, word count, quality badge
 */
export function TrainingSamplesList({
  samples,
  isLoading = false,
  onDelete,
  isDeleting = null,
}: TrainingSamplesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getSourceIcon = (sourceType: SourceType) => {
    switch (sourceType) {
      case 'pdf':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'pasted_text':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'article':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'transcript':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'voice':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
    }
  };

  const getQualityBadgeStyles = (badge: QualityBadge) => {
    switch (badge) {
      case 'excellent':
        return { bg: 'var(--approve)', text: 'white', label: 'Excellent' };
      case 'good':
        return { bg: 'var(--edit)', text: 'white', label: 'Good' };
      case 'fair':
        return { bg: 'var(--warning)', text: 'var(--bg-base)', label: 'Fair' };
      case 'needs_improvement':
        return { bg: 'var(--kill)', text: 'white', label: 'Needs Work' };
      case 'pending':
        return { bg: 'var(--bg-elevated)', text: 'var(--text-muted)', label: 'Pending' };
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'pending':
        return { bg: 'var(--bg-elevated)', text: 'var(--text-muted)', label: 'Pending' };
      case 'processing':
        return { bg: 'var(--edit)', text: 'white', label: 'Processing' };
      case 'analyzed':
        return { bg: 'var(--approve)', text: 'white', label: 'Analyzed' };
      case 'failed':
        return { bg: 'var(--kill)', text: 'white', label: 'Failed' };
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatWordCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getSourceLabel = (sourceType: SourceType) => {
    switch (sourceType) {
      case 'pdf': return 'PDF';
      case 'pasted_text': return 'Pasted Text';
      case 'article': return 'Article';
      case 'transcript': return 'Transcript';
      case 'voice': return 'Voice Note';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'var(--bg-elevated)' }} />
                <div className="h-3 rounded w-1/4" style={{ backgroundColor: 'var(--bg-elevated)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border border-dashed"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          No training samples yet
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Upload content to start building your Brand DNA
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {samples.map(({ sample, qualityBadge }) => {
        const isExpanded = expandedId === sample.id;
        const statusStyles = getStatusBadge(sample.status);
        const qualityStyles = getQualityBadgeStyles(qualityBadge);

        return (
          <div
            key={sample.id}
            className="rounded-lg border transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: isExpanded ? 'var(--border-focus)' : 'var(--border-subtle)',
            }}
          >
            {/* Main Row */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : sample.id)}
            >
              {/* Source Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                {getSourceIcon(sample.source_type)}
              </div>

              {/* Title and Meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {sample.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {getSourceLabel(sample.source_type)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatWordCount(sample.word_count)} words
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(sample.created_at)}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {sample.status !== 'analyzed' && (
                <span
                  className="px-2 py-1 rounded text-xs font-medium shrink-0"
                  style={{ backgroundColor: statusStyles.bg, color: statusStyles.text }}
                >
                  {sample.status === 'processing' && (
                    <span className="inline-block w-2 h-2 rounded-full mr-1 animate-pulse" style={{ backgroundColor: 'white' }} />
                  )}
                  {statusStyles.label}
                </span>
              )}

              {/* Quality Badge */}
              {sample.status === 'analyzed' && (
                <span
                  className="px-2 py-1 rounded text-xs font-medium shrink-0"
                  style={{ backgroundColor: qualityStyles.bg, color: qualityStyles.text }}
                >
                  {sample.quality_score !== null && `${Math.round(sample.quality_score)}% `}
                  {qualityStyles.label}
                </span>
              )}

              {/* Expand Arrow */}
              <svg
                className={`w-4 h-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                style={{ color: 'var(--text-muted)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center justify-between">
                  <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                    <p>ID: {sample.id.slice(0, 8)}...</p>
                    {sample.word_count > 0 && <p>Character count: ~{sample.word_count * 5}</p>}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(sample.id);
                    }}
                    disabled={isDeleting === sample.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-[var(--kill)]/10"
                    style={{ color: 'var(--kill)' }}
                  >
                    {isDeleting === sample.id ? (
                      <>
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
