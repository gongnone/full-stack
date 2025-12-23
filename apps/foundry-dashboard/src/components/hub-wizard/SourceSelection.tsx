/**
 * Story 3.1: Source Selection & Upload Wizard
 * SourceSelection - Card-based source type selector with Midnight Command theme
 */

import { useState } from 'react';

export type SourceType = 'pdf' | 'text' | 'url';

interface SourceOption {
  type: SourceType;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

interface SourceSelectionProps {
  selectedType: SourceType | null;
  onSelect: (type: SourceType) => void;
  disabledTypes?: SourceType[];
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function TextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

const SOURCE_OPTIONS: SourceOption[] = [
  {
    type: 'pdf',
    title: 'PDF Document',
    description: 'Upload a PDF file for thematic extraction',
    icon: <DocumentIcon className="w-8 h-8" />,
    badge: 'Coming Soon',
    disabled: true,
  },
  {
    type: 'text',
    title: 'Paste Text',
    description: 'Paste content directly for instant analysis',
    icon: <TextIcon className="w-8 h-8" />,
    badge: 'Recommended',
  },
  {
    type: 'url',
    title: 'Web URL',
    description: 'Extract content from a webpage',
    icon: <LinkIcon className="w-8 h-8" />,
    badge: 'Coming Soon',
    disabled: true,
  },
];

export function SourceSelection({
  selectedType,
  onSelect,
  disabledTypes = ['pdf', 'url']
}: SourceSelectionProps) {
  const [hoveredType, setHoveredType] = useState<SourceType | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Choose Source Type
        </h3>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          Select how you want to provide your content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SOURCE_OPTIONS.map((option) => {
          const isDisabled = option.disabled || disabledTypes.includes(option.type);
          const isSelected = selectedType === option.type;
          const isHovered = hoveredType === option.type && !isDisabled;

          return (
            <button
              key={option.type}
              onClick={() => !isDisabled && onSelect(option.type)}
              onMouseEnter={() => setHoveredType(option.type)}
              onMouseLeave={() => setHoveredType(null)}
              disabled={isDisabled}
              className={`source-card relative p-6 rounded-xl text-left transition-all duration-200 ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{
                backgroundColor: isSelected
                  ? 'var(--bg-hover)'
                  : 'var(--bg-elevated)',
                border: `2px solid ${
                  isSelected
                    ? 'var(--edit)'
                    : isHovered
                      ? 'var(--border-subtle)'
                      : 'transparent'
                }`,
                boxShadow: isSelected
                  ? '0 0 20px var(--edit-glow)'
                  : undefined,
              }}
              data-testid={`source-option-${option.type}`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--edit)' }}
                >
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Badge */}
              {option.badge && (
                <span
                  className="absolute top-3 left-3 px-2 py-0.5 text-xs font-medium rounded"
                  style={{
                    backgroundColor: option.badge === 'Recommended'
                      ? 'var(--approve-glow)'
                      : 'var(--bg-surface)',
                    color: option.badge === 'Recommended'
                      ? 'var(--approve)'
                      : 'var(--text-muted)',
                  }}
                >
                  {option.badge}
                </span>
              )}

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 mt-4"
                style={{
                  backgroundColor: isSelected
                    ? 'var(--edit-glow)'
                    : 'var(--bg-surface)',
                  color: isSelected
                    ? 'var(--edit)'
                    : 'var(--text-secondary)',
                }}
              >
                {option.icon}
              </div>

              {/* Title */}
              <h4
                className="font-semibold text-base mb-1"
                style={{
                  color: isDisabled
                    ? 'var(--text-muted)'
                    : 'var(--text-primary)'
                }}
              >
                {option.title}
              </h4>

              {/* Description */}
              <p
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
