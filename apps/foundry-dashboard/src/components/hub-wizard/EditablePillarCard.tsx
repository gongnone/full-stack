/**
 * Story 3.3: Interactive Pillar Configuration
 * Editable pillar card with inline editing, angle dropdown, and delete functionality
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Pillar, PsychologicalAngle } from './ExtractionProgress';

// Psychological angles with their associated colors (for UI rendering)
const PSYCHOLOGICAL_ANGLES: { value: PsychologicalAngle; color: string; bgColor: string }[] = [
  { value: 'Contrarian', color: 'var(--kill)', bgColor: 'rgba(244, 33, 46, 0.15)' },
  { value: 'Authority', color: 'var(--edit)', bgColor: 'rgba(29, 155, 240, 0.15)' },
  { value: 'Urgency', color: 'var(--warning)', bgColor: 'rgba(255, 173, 31, 0.15)' },
  { value: 'Aspiration', color: 'var(--approve)', bgColor: 'rgba(0, 210, 106, 0.15)' },
  { value: 'Fear', color: 'var(--kill)', bgColor: 'rgba(244, 33, 46, 0.15)' },
  { value: 'Curiosity', color: 'var(--edit)', bgColor: 'rgba(29, 155, 240, 0.15)' },
  { value: 'Transformation', color: 'var(--approve)', bgColor: 'rgba(0, 210, 106, 0.15)' },
  { value: 'Rebellion', color: 'var(--kill)', bgColor: 'rgba(244, 33, 46, 0.15)' },
];

interface EditablePillarCardProps {
  pillar: Pillar;
  isDeleting?: boolean;
  canDelete?: boolean;
  onUpdate: (updates: Partial<Pick<Pillar, 'title' | 'coreClaim' | 'psychologicalAngle'>>) => void;
  onDelete: () => void;
}

export function EditablePillarCard({
  pillar,
  isDeleting = false,
  canDelete = true,
  onUpdate,
  onDelete,
}: EditablePillarCardProps) {
  const [title, setTitle] = useState(pillar.title);
  const [coreClaim, setCoreClaim] = useState(pillar.coreClaim);
  const [angle, setAngle] = useState<PsychologicalAngle>(pillar.psychologicalAngle);
  const [isModified, setIsModified] = useState(false);
  const [isAngleDropdownOpen, setIsAngleDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get angle color config - always returns a valid config (defaults to Curiosity)
  const getAngleConfig = (angleValue: string) => {
    const found = PSYCHOLOGICAL_ANGLES.find(a => a.value === angleValue);
    // Curiosity is at index 5
    const defaultConfig = { value: 'Curiosity' as PsychologicalAngle, color: 'var(--edit)', bgColor: 'rgba(29, 155, 240, 0.15)' };
    return found ?? defaultConfig;
  };

  const angleConfig = getAngleConfig(angle);

  // Debounced update for title and claim
  const debouncedUpdate = useCallback((updates: Partial<Pick<Pillar, 'title' | 'coreClaim' | 'psychologicalAngle'>>) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onUpdate(updates);
    }, 300);
  }, [onUpdate]);

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsModified(true);
    debouncedUpdate({ title: newTitle });
  };

  // Handle claim change
  const handleClaimChange = (newClaim: string) => {
    setCoreClaim(newClaim);
    setIsModified(true);
    debouncedUpdate({ coreClaim: newClaim });
  };

  // Handle angle change (immediate update)
  const handleAngleChange = (newAngle: PsychologicalAngle) => {
    setAngle(newAngle);
    setIsModified(true);
    setIsAngleDropdownOpen(false);
    onUpdate({ psychologicalAngle: newAngle });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAngleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`p-5 rounded-lg border transition-all duration-300 ${
        isDeleting ? 'animate-pillar-prune' : ''
      }`}
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
      data-testid={`editable-pillar-card-${pillar.id}`}
    >
      {/* Header: Title + Modified Badge + Angle Dropdown */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-base font-semibold w-full bg-transparent border-b border-transparent focus:border-[var(--edit)] transition-colors outline-none"
            style={{ color: 'var(--text-primary)' }}
            placeholder="Pillar title..."
            data-testid="pillar-title-input"
          />

          {/* Modified badge */}
          {isModified && (
            <span
              className="inline-flex items-center mt-2 px-2 py-0.5 text-xs font-medium rounded transition-opacity"
              style={{
                backgroundColor: 'rgba(29, 155, 240, 0.15)',
                color: 'var(--edit)',
              }}
              data-testid="modified-badge"
            >
              Modified
            </span>
          )}
        </div>

        {/* Angle dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsAngleDropdownOpen(!isAngleDropdownOpen)}
            className="px-2 py-1 text-xs font-medium rounded transition-colors"
            style={{
              backgroundColor: angleConfig.bgColor,
              color: angleConfig.color,
            }}
            data-testid="angle-dropdown-trigger"
          >
            {angle}
            <svg
              className="w-3 h-3 ml-1 inline-block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isAngleDropdownOpen && (
            <div
              className="absolute right-0 mt-1 w-44 rounded-lg border shadow-lg z-10"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)',
              }}
              data-testid="angle-dropdown-menu"
            >
              {PSYCHOLOGICAL_ANGLES.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAngleChange(option.value)}
                  className={`w-full px-3 py-2 text-left text-xs font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    angle === option.value ? 'bg-opacity-20' : ''
                  }`}
                  style={{
                    color: option.color,
                    backgroundColor: angle === option.value ? option.bgColor : 'transparent',
                  }}
                >
                  {option.value}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Core Claim Textarea */}
      <div className="mb-4">
        <textarea
          value={coreClaim}
          onChange={(e) => handleClaimChange(e.target.value)}
          rows={3}
          maxLength={2000}
          className="text-sm w-full resize-none rounded border leading-relaxed transition-colors outline-none p-2"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
          placeholder="Core claim..."
          data-testid="pillar-claim-textarea"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {coreClaim.length}/2000
          </span>
        </div>
      </div>

      {/* Supporting Points (read-only display) */}
      {pillar.supportingPoints && pillar.supportingPoints.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Supporting Points:
          </p>
          <ul className="space-y-1">
            {pillar.supportingPoints.map((point: string, index: number) => (
              <li
                key={index}
                className="text-xs flex items-start gap-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span style={{ color: 'var(--edit)' }}>•</span>
                <span className="flex-1">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer: Spoke Count + Delete */}
      <div
        className="flex items-center justify-between gap-2 pt-3 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Est. Spokes:
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--edit)' }}
          >
            ~{pillar.estimatedSpokeCount}
          </span>
        </div>

        {/* Delete button with confirmation */}
        <div className="flex items-center gap-2">
          {showDeleteConfirm ? (
            <>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Delete?
              </span>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
                className="px-2 py-1 text-xs font-medium rounded transition-colors"
                style={{
                  backgroundColor: 'var(--kill)',
                  color: 'white',
                }}
                data-testid="confirm-delete-btn"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs font-medium rounded transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                }}
                data-testid="cancel-delete-btn"
              >
                No
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!canDelete}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                !canDelete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: canDelete ? 'var(--kill)' : 'var(--text-muted)',
              }}
              title={!canDelete ? 'Minimum 3 pillars required' : 'Delete pillar'}
              data-testid="delete-pillar-btn"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
