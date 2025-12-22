/**
 * Story 3.5: Real-Time Ingestion Progress
 * Animated pillar discovery list showing pillars as they're extracted
 */

import { useEffect, useRef, useState } from 'react';
import type { Pillar, PsychologicalAngle } from './ExtractionProgress';

interface PillarDiscoveryListProps {
  pillars: Pillar[];
  isLoading?: boolean;
}

// Psychological angle colors (from Story 3-3)
const ANGLE_COLORS: Record<PsychologicalAngle, string> = {
  Contrarian: '#F4212E',
  Authority: '#1D9BF0',
  Urgency: '#FFAD1F',
  Aspiration: '#00D26A',
  Fear: '#F4212E',
  Curiosity: '#1D9BF0',
  Transformation: '#00D26A',
  Rebellion: '#F4212E',
};

export function PillarDiscoveryList({ pillars, isLoading }: PillarDiscoveryListProps) {
  const [animatedPillarIds, setAnimatedPillarIds] = useState<Set<string>>(new Set());
  const prevPillarCountRef = useRef(0);

  // Track newly discovered pillars for animation
  useEffect(() => {
    if (pillars.length > prevPillarCountRef.current) {
      // New pillars discovered - animate them
      const newPillarIds = pillars
        .slice(prevPillarCountRef.current)
        .map(p => p.id);

      setAnimatedPillarIds(prev => {
        const next = new Set(prev);
        newPillarIds.forEach(id => next.add(id));
        return next;
      });
    }
    prevPillarCountRef.current = pillars.length;
  }, [pillars]);

  if (isLoading && pillars.length === 0) {
    return (
      <div
        className="p-6 rounded-lg text-center"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
        data-testid="pillar-discovery-list"
      >
        <div className="flex items-center justify-center space-x-2">
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--edit)', animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--edit)', animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: 'var(--edit)', animationDelay: '300ms' }}
          />
        </div>
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          Discovering content pillars...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="pillar-discovery-list">
      {/* Header with count */}
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Pillars Discovered
        </h4>
        <span
          className="px-2 py-0.5 text-xs font-semibold rounded-full animate-counter-pop"
          style={{
            backgroundColor: 'var(--edit)',
            color: 'var(--bg-base)',
          }}
          key={pillars.length} // Re-animate on count change
        >
          {pillars.length}
        </span>
      </div>

      {/* Pillar list */}
      <div className="space-y-2">
        {pillars.map((pillar, index) => {
          const isNewlyDiscovered = animatedPillarIds.has(pillar.id);
          const angleColor = ANGLE_COLORS[pillar.psychologicalAngle];

          return (
            <div
              key={pillar.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                isNewlyDiscovered ? 'animate-pillar-slide-in' : ''
              }`}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)',
                animationDelay: isNewlyDiscovered ? `${Math.min(index * 100, 1000)}ms` : '0ms',
              }}
              data-testid={`pillar-discovery-item-${pillar.id}`}
            >
              {/* Pillar header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h5
                    className="font-medium text-sm truncate"
                    style={{ color: 'var(--text-primary)' }}
                    title={pillar.title}
                  >
                    {pillar.title}
                  </h5>
                  <p
                    className="text-xs mt-1 line-clamp-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {pillar.coreClaim}
                  </p>
                </div>

                {/* Psychological angle badge */}
                <span
                  className="px-2 py-1 text-xs font-medium rounded whitespace-nowrap"
                  style={{
                    backgroundColor: `${angleColor}20`,
                    color: angleColor,
                  }}
                >
                  {pillar.psychologicalAngle}
                </span>
              </div>

              {/* Supporting points preview */}
              {pillar.supportingPoints && pillar.supportingPoints.length > 0 && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {pillar.supportingPoints.length} supporting points
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Extraction in progress indicator */}
      {isLoading && pillars.length > 0 && (
        <div
          className="flex items-center justify-center p-3 rounded-lg border border-dashed"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'transparent',
          }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 animate-spin mr-2"
            style={{
              borderColor: 'var(--bg-elevated)',
              borderTopColor: 'var(--edit)',
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Discovering more pillars...
          </span>
        </div>
      )}
    </div>
  );
}
