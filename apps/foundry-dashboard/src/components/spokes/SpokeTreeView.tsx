/**
 * SpokeTreeView - Hierarchical display of Hub > Pillars > Spokes
 * Story 4.1: Tree view for generated spokes with expand/collapse
 */

import { useState, useMemo } from 'react';
import { SpokeCard } from './SpokeCard';
import type { Spoke, SpokePlatform, Pillar } from '../../../worker/types';

// Psychological angle colors (matching hub detail page)
const ANGLE_COLORS: Record<string, string> = {
  Contrarian: '#E11D48',
  Authority: '#2563EB',
  Urgency: '#EA580C',
  Aspiration: '#7C3AED',
  Fear: '#DC2626',
  Curiosity: '#0891B2',
  Transformation: '#059669',
  Rebellion: '#BE185D',
};

interface PillarNode {
  pillar: Pillar;
  spokes: Spoke[];
}

interface SpokeTreeViewProps {
  hubTitle: string;
  pillars: Pillar[];
  spokes: Spoke[];
  platformFilter: SpokePlatform | 'all';
  onSpokeClick?: (spoke: Spoke) => void;
}

export function SpokeTreeView({
  hubTitle,
  pillars,
  spokes,
  platformFilter,
  onSpokeClick,
}: SpokeTreeViewProps) {
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());

  // Filter spokes by platform
  const filteredSpokes = useMemo(() => {
    if (platformFilter === 'all') return spokes;
    return spokes.filter((s) => s.platform === platformFilter);
  }, [spokes, platformFilter]);

  // Group spokes by pillar
  const pillarNodes: PillarNode[] = useMemo(() => {
    return pillars.map((pillar) => ({
      pillar,
      spokes: filteredSpokes.filter((s) => s.pillar_id === pillar.id),
    }));
  }, [pillars, filteredSpokes]);

  const togglePillar = (pillarId: string) => {
    setExpandedPillars((prev) => {
      const next = new Set(prev);
      if (next.has(pillarId)) {
        next.delete(pillarId);
      } else {
        next.add(pillarId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedPillars(new Set(pillars.map((p) => p.id)));
  };

  const collapseAll = () => {
    setExpandedPillars(new Set());
  };

  // Calculate totals
  const totalSpokes = filteredSpokes.length;
  const totalPillarsWithSpokes = pillarNodes.filter((n) => n.spokes.length > 0).length;

  return (
    <div className="space-y-4">
      {/* Tree Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">{hubTitle}</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {totalPillarsWithSpokes} pillars &bull; {totalSpokes} spokes
            </p>
          </div>
        </div>

        {/* Expand/Collapse controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-2 py-1 text-xs rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2 py-1 text-xs rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Pillar Nodes */}
      <div className="space-y-2">
        {pillarNodes.map(({ pillar, spokes: pillarSpokes }) => {
          const isExpanded = expandedPillars.has(pillar.id);
          const angleColor = ANGLE_COLORS[pillar.psychologicalAngle] || 'var(--text-muted)';

          return (
            <div key={pillar.id} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              {/* Pillar Header */}
              <button
                onClick={() => togglePillar(pillar.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-hover)] transition-colors"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: angleColor }}
                  />
                  <span className="font-medium text-[var(--text-primary)]">{pillar.title}</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: `${angleColor}20`, color: angleColor }}
                  >
                    {pillar.psychologicalAngle}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                  <span>{pillarSpokes.length} spokes</span>
                </div>
              </button>

              {/* Spokes (expanded) */}
              {isExpanded && pillarSpokes.length > 0 && (
                <div
                  className="p-3 space-y-2 border-t"
                  style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}
                >
                  {pillarSpokes.map((spoke) => (
                    <SpokeCard
                      key={spoke.id}
                      spoke={spoke}
                      onClick={() => onSpokeClick?.(spoke)}
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {isExpanded && pillarSpokes.length === 0 && (
                <div
                  className="p-4 text-center text-sm border-t"
                  style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  No spokes generated for this pillar yet
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state for entire tree */}
      {pillarNodes.every((n) => n.spokes.length === 0) && (
        <div
          className="p-8 text-center rounded-lg"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <svg
            className="w-12 h-12 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'var(--text-muted)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-[var(--text-muted)]">
            {platformFilter !== 'all'
              ? `No ${platformFilter} spokes generated yet`
              : 'No spokes generated yet'}
          </p>
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            Click "Generate Spokes" to create content for this hub
          </p>
        </div>
      )}
    </div>
  );
}
