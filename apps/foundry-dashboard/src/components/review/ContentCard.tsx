import React from 'react';
import { Card } from '../ui/card';
import { ScoreBadge } from '../ui/score-badge';
import { ActionButton } from '../ui/action-button';
import { KeyboardHint } from '../ui/keyboard-hint';
import { Spoke } from '@repo/foundry-core';
import { ImageIcon, Eye, Palette, Lightbulb } from 'lucide-react';

interface ContentCardProps {
  spoke: Spoke;
  onApprove?: () => void;
  onKill?: () => void;
  onEdit?: () => void;
  isActive?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  spoke,
  onApprove,
  onKill,
  onEdit,
  isActive = false,
}) => {
  return (
    <Card 
      className={`relative w-full max-w-2xl overflow-hidden transition-all duration-300 ${
        isActive ? 'ring-2 ring-blue-500 scale-[1.02] shadow-xl' : 'opacity-90 scale-95 grayscale-[0.2]'
      }`}
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Signal Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">G2 Hook</span>
            <span className="text-4xl font-bold font-mono tracking-tighter" style={{ color: getScoreColor(spoke.qualityScores.g2_hook) }}>
              {spoke.qualityScores.g2_hook || '??'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">G7 Engagement</span>
            <span className="text-4xl font-bold font-mono tracking-tighter" style={{ color: getScoreColor(spoke.qualityScores.g7_engagement) }}>
              {spoke.qualityScores.g7_engagement || '??'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Platform</span>
            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-medium uppercase tracking-wider border border-white/10">
              {spoke.platform}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(spoke.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-8 space-y-6">
        <div className="relative">
          <p className="text-lg leading-relaxed whitespace-pre-wrap font-sans" style={{ color: 'var(--text-primary)' }}>
            {spoke.content}
          </p>
        </div>

        {/* Visual Concept Engine (Story 4.5) */}
        {(spoke.visualArchetype || spoke.thumbnailConcept) && (
          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Visual Concept Engine</span>
              <ScoreBadge score={spoke.qualityScores.g6_visual || 0} gate="G2" showGate size="sm" className="ml-auto" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Palette className="w-3.5 h-3.4" />
                  <span className="text-[10px] uppercase font-bold">Archetype</span>
                </div>
                <p className="text-sm font-medium">{spoke.visualArchetype || 'None selected'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">Concept</span>
                </div>
                <p className="text-sm line-clamp-2">{spoke.thumbnailConcept || 'No concept generated'}</p>
              </div>
            </div>

            {spoke.imagePrompt && (isActive || true) && (
              <div className="p-4 rounded-lg bg-black/40 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2 text-blue-400/80">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">Image Prompt</span>
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{spoke.imagePrompt}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-6 bg-black/40 border-t border-white/5">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <ActionButton 
              variant="kill" 
              onClick={onKill}
              size="md"
              className="w-14 h-14 rounded-full"
            />
            <KeyboardHint keys={['←']} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <ActionButton 
              variant="edit" 
              onClick={onEdit}
              size="md"
              className="w-14 h-14 rounded-full"
            />
            <KeyboardHint keys={['E']} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <ActionButton 
            variant="approve" 
            onClick={onApprove}
            size="md"
            className="w-20 h-14 px-8 rounded-full"
          />
          <KeyboardHint keys={['→']} />
        </div>
      </div>
    </Card>
  );
};

function getScoreColor(score?: number): string {
  if (!score) return 'var(--text-muted)';
  if (score >= 80) return '#00D26A'; // Approve green
  if (score >= 60) return '#FFD700'; // Warning gold
  return '#F4212E'; // Kill red
}
