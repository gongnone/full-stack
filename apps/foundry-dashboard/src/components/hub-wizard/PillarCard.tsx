/**
 * Story 3.1/3.3: Hub Creation Wizard
 * PillarCard - Display-only pillar card with Midnight Command theme and stagger animation
 * Used in pillar discovery list and preview grids
 */

import type { Pillar, PsychologicalAngle } from './ExtractionProgress';

// Psychological angle colors matching the Midnight Command palette
const ANGLE_STYLES: Record<PsychologicalAngle, { color: string; bgColor: string }> = {
  Contrarian: { color: 'var(--kill)', bgColor: 'rgba(244, 33, 46, 0.15)' },
  Authority: { color: 'var(--edit)', bgColor: 'rgba(29, 155, 240, 0.15)' },
  Urgency: { color: 'var(--warning)', bgColor: 'rgba(255, 173, 31, 0.15)' },
  Aspiration: { color: 'var(--approve)', bgColor: 'rgba(0, 210, 106, 0.15)' },
  Fear: { color: 'var(--kill)', bgColor: 'rgba(244, 33, 46, 0.15)' },
  Curiosity: { color: 'var(--edit)', bgColor: 'rgba(29, 155, 240, 0.15)' },
  Transformation: { color: 'var(--approve)', bgColor: 'rgba(0, 210, 106, 0.15)' },
  Rebellion: { color: 'var(--kill)', bgColor: 'rgba(244, 33, 46, 0.15)' },
};

interface PillarCardProps {
  pillar: Pillar;
  index?: number;
  variant?: 'default' | 'compact' | 'discovery';
  isAnimated?: boolean;
  isPruning?: boolean;
  onClick?: () => void;
}

export function PillarCard({
  pillar,
  index = 0,
  variant = 'default',
  isAnimated = true,
  isPruning = false,
  onClick,
}: PillarCardProps) {
  const angleStyle = ANGLE_STYLES[pillar.psychologicalAngle] || ANGLE_STYLES.Curiosity;
  const staggerClass = isAnimated ? `animate-pillar-stagger-in pillar-stagger-${Math.min(index, 7)}` : '';
  const pruneClass = isPruning ? 'animate-pillar-prune' : '';

  if (variant === 'compact') {
    return (
      <div
        className={`px-3 py-2 rounded-lg flex items-center gap-3 ${staggerClass} ${pruneClass}`}
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
        data-testid={`pillar-card-compact-${pillar.id}`}
      >
        {/* Color indicator */}
        <div
          className="w-1 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: angleStyle.color }}
        />

        {/* Title */}
        <span
          className="text-sm font-medium truncate flex-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {pillar.title}
        </span>

        {/* Angle badge */}
        <span
          className="text-xs px-2 py-0.5 rounded flex-shrink-0"
          style={{
            backgroundColor: angleStyle.bgColor,
            color: angleStyle.color,
          }}
        >
          {pillar.psychologicalAngle}
        </span>
      </div>
    );
  }

  if (variant === 'discovery') {
    return (
      <div
        className={`p-4 rounded-lg border transition-all duration-300 ${staggerClass} ${pruneClass}`}
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)',
        }}
        data-testid={`pillar-card-discovery-${pillar.id}`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4
            className="font-medium text-sm flex-1 truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {pillar.title}
          </h4>
          <span
            className="text-xs px-2 py-1 rounded whitespace-nowrap"
            style={{
              backgroundColor: angleStyle.bgColor,
              color: angleStyle.color,
            }}
          >
            {pillar.psychologicalAngle}
          </span>
        </div>

        {/* Core claim preview */}
        <p
          className="text-xs line-clamp-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {pillar.coreClaim}
        </p>

        {/* Supporting points count */}
        {pillar.supportingPoints && pillar.supportingPoints.length > 0 && (
          <div
            className="mt-2 pt-2 border-t flex items-center gap-1"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {pillar.supportingPoints.length} supporting points
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default full variant
  return (
    <div
      className={`p-5 rounded-xl border transition-all duration-300 ${staggerClass} ${pruneClass} ${onClick ? 'cursor-pointer hover:border-[var(--border-subtle)]' : ''}`}
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'transparent',
        borderWidth: '2px',
      }}
      onClick={onClick}
      data-testid={`pillar-card-${pillar.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          {/* Angle badge */}
          <span
            className="inline-flex text-xs font-medium px-2.5 py-1 rounded mb-2"
            style={{
              backgroundColor: angleStyle.bgColor,
              color: angleStyle.color,
            }}
          >
            {pillar.psychologicalAngle}
          </span>

          {/* Title */}
          <h3
            className="font-semibold text-base"
            style={{ color: 'var(--text-primary)' }}
          >
            {pillar.title}
          </h3>
        </div>

        {/* Spoke count indicator */}
        <div
          className="flex flex-col items-center px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <span
            className="text-lg font-bold"
            style={{ color: 'var(--edit)' }}
          >
            ~{pillar.estimatedSpokeCount}
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            spokes
          </span>
        </div>
      </div>

      {/* Core claim */}
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: 'var(--text-secondary)' }}
      >
        {pillar.coreClaim}
      </p>

      {/* Supporting points */}
      {pillar.supportingPoints && pillar.supportingPoints.length > 0 && (
        <div
          className="pt-3 border-t space-y-2"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Supporting Points
          </p>
          <ul className="space-y-1.5">
            {pillar.supportingPoints.slice(0, 3).map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: angleStyle.color }}
                />
                <span className="line-clamp-1">{point}</span>
              </li>
            ))}
            {pillar.supportingPoints.length > 3 && (
              <li
                className="text-xs pl-3.5"
                style={{ color: 'var(--text-muted)' }}
              >
                +{pillar.supportingPoints.length - 3} more points
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
