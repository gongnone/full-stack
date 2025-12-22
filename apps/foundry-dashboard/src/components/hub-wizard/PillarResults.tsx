/**
 * Story 3.2: Thematic Extraction Engine
 * Display extracted content pillars as editable cards
 */

import { useState } from 'react';
import type { Pillar } from './ExtractionProgress';

interface PillarResultsProps {
  pillars: Pillar[];
  onPillarEdit?: (pillarId: string, updates: Partial<Pillar>) => void;
  className?: string;
}

export function PillarResults({ pillars, onPillarEdit, className = '' }: PillarResultsProps) {
  // Empty state: < 5 pillars extracted
  if (pillars.length < 5) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Insufficient Pillars Extracted
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {pillars.length} pillar{pillars.length !== 1 ? 's' : ''} found. Need at least 5 for a complete Hub.
            <br />
            Try uploading a longer source document (&gt;1000 words).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Content Pillars
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {pillars.length} distinct themes extracted from your source
          </p>
        </div>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} onEdit={onPillarEdit} />
        ))}
      </div>
    </div>
  );
}

interface PillarCardProps {
  pillar: Pillar;
  onEdit?: (pillarId: string, updates: Partial<Pillar>) => void;
}

function PillarCard({ pillar, onEdit }: PillarCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(pillar.title);
  const [editClaim, setEditClaim] = useState(pillar.coreClaim);

  const handleSave = () => {
    if (onEdit && (editTitle !== pillar.title || editClaim !== pillar.coreClaim)) {
      onEdit(pillar.id, {
        title: editTitle,
        coreClaim: editClaim,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(pillar.title);
    setEditClaim(pillar.coreClaim);
    setIsEditing(false);
  };

  return (
    <div
      className="p-5 rounded-lg border transition-all hover:shadow-lg"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
      data-testid={`pillar-card-${pillar.id}`}
    >
      {/* Pillar Title */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-base font-semibold flex-1 px-2 py-1 rounded border"
            style={{
              backgroundColor: 'var(--bg-default)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        ) : (
          <h4 className="text-base font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
            {pillar.title}
          </h4>
        )}

        {/* Psychological Angle Badge */}
        <span
          className="px-2 py-1 text-xs font-medium rounded"
          style={{
            backgroundColor: getAngleColor(pillar.psychologicalAngle).background,
            color: getAngleColor(pillar.psychologicalAngle).text,
          }}
          data-testid="psychological-angle"
        >
          {pillar.psychologicalAngle}
        </span>
      </div>

      {/* Core Claim */}
      {isEditing ? (
        <textarea
          value={editClaim}
          onChange={(e) => setEditClaim(e.target.value)}
          rows={3}
          className="text-sm w-full mb-4 px-2 py-1 rounded border leading-relaxed"
          style={{
            backgroundColor: 'var(--bg-default)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        />
      ) : (
        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
          data-testid="core-claim"
        >
          {pillar.coreClaim}
        </p>
      )}

      {/* Supporting Points */}
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

      {/* Footer: Estimated Spoke Count + Edit Controls */}
      <div
        className="flex items-center justify-between gap-2 pt-3 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Est. Spoke Count:
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--edit)' }}
            data-testid="spoke-count"
          >
            ~{pillar.estimatedSpokeCount}
          </span>
        </div>

        {/* Edit Controls */}
        {onEdit && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-2 py-1 text-xs font-medium rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--approve)',
                    color: 'var(--bg-default)',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 text-xs font-medium rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-default)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-2 py-1 text-xs font-medium rounded transition-colors"
                style={{
                  backgroundColor: 'var(--bg-default)',
                  color: 'var(--edit)',
                  border: '1px solid var(--border-subtle)',
                }}
                data-testid="edit-pillar-btn"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get color scheme for psychological angle badge
 * Follows Midnight Command design system
 */
function getAngleColor(angle: string): { background: string; text: string } {
  const validAngles = [
    'Contrarian',
    'Authority',
    'Urgency',
    'Aspiration',
    'Fear',
    'Curiosity',
    'Transformation',
    'Rebellion',
  ];

  const colors: Record<string, { background: string; text: string }> = {
    Contrarian: { background: 'rgba(244, 33, 46, 0.15)', text: 'var(--kill)' },
    Authority: { background: 'rgba(29, 155, 240, 0.15)', text: 'var(--edit)' },
    Urgency: { background: 'rgba(255, 173, 31, 0.15)', text: 'var(--warning)' },
    Aspiration: { background: 'rgba(0, 210, 106, 0.15)', text: 'var(--approve)' },
    Fear: { background: 'rgba(244, 33, 46, 0.15)', text: 'var(--kill)' },
    Curiosity: { background: 'rgba(29, 155, 240, 0.15)', text: 'var(--edit)' },
    Transformation: { background: 'rgba(0, 210, 106, 0.15)', text: 'var(--approve)' },
    Rebellion: { background: 'rgba(244, 33, 46, 0.15)', text: 'var(--kill)' },
  };

  // Validate angle and warn if unknown
  if (!validAngles.includes(angle)) {
    console.warn(`Unknown psychological angle: ${angle}, falling back to Curiosity`);
  }

  return colors[angle] || colors.Curiosity!;
}
