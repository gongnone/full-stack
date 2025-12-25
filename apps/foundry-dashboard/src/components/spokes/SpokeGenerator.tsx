/**
 * Story 4.1: Deterministic Spoke Fracturing
 * Display spoke generation progress with quality gate visualization
 */

import { useState, useEffect } from 'react';
import { ActionButton, GateBadge } from '@/components/ui';
import { QUALITY_GATE_CONFIG } from '@/lib/constants';
import type {
  SpokeGenerationProgress,
  SpokePlatform,
  SpokeStatus
} from '../../../worker/types';

export interface SpokeGeneratorProps {
  hubId: string;
  platforms?: SpokePlatform[];
  onGenerationComplete?: (spokes: GeneratedSpoke[]) => void;
  onCancel?: () => void;
}

export interface GeneratedSpoke {
  id: string;
  platform: SpokePlatform;
  content: string;
  status: SpokeStatus;
  g2_score: number | null;
  g4_status: string | null;
  g5_status: string | null;
  pillar_title?: string;
  psychological_angle?: string;
}

const PLATFORM_ICONS: Record<SpokePlatform, string> = {
  twitter: '𝕏',
  linkedin: 'in',
  tiktok: '♪',
  instagram: '◉',
  newsletter: '✉',
  thread: '🧵',
  carousel: '⊞',
};

export function SpokeGenerator({
  hubId,
  platforms = ['twitter', 'linkedin'],
  onGenerationComplete,
  onCancel,
}: SpokeGeneratorProps) {
  const [progress, setProgress] = useState<SpokeGenerationProgress | null>(null);
  const [generatedSpokes, setGeneratedSpokes] = useState<GeneratedSpoke[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock generation for UI demonstration
  const startGeneration = async () => {
    setIsGenerating(true);

    // Simulate progress updates
    const mockProgress: SpokeGenerationProgress = {
      hub_id: hubId,
      client_id: 'test-client',
      status: 'generating',
      total_pillars: 3,
      completed_pillars: 0,
      total_spokes: platforms.length * 3,
      completed_spokes: 0,
      current_pillar_id: 'pillar-1',
      current_pillar_name: 'The Power of Consistency',
      error_message: null,
      started_at: Date.now(),
      completed_at: null,
      updated_at: Date.now(),
    };

    setProgress(mockProgress);

    // Simulate pillar-by-pillar generation
    for (let pillar = 1; pillar <= 3; pillar++) {
      for (let i = 0; i < platforms.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const platform = platforms[i];
        if (!platform) continue;

        const spoke: GeneratedSpoke = {
          id: `spoke-${pillar}-${i}`,
          platform,
          content: `Generated content for ${platform} from pillar ${pillar}. This is a high-quality spoke that passed all quality gates.`,
          status: 'ready',
          g2_score: 75 + Math.floor(Math.random() * 20),
          g4_status: Math.random() > 0.2 ? 'pass' : 'fail:tone_mismatch',
          g5_status: Math.random() > 0.15 ? 'pass' : 'fail:char_limit',
          pillar_title: `Pillar ${pillar}`,
          psychological_angle: ['Contrarian', 'Authority', 'Curiosity'][pillar - 1] as 'Contrarian' | 'Authority' | 'Curiosity',
        };

        setGeneratedSpokes(prev => [...prev, spoke]);
        setProgress(prev => prev ? {
          ...prev,
          completed_pillars: pillar - 1,
          completed_spokes: (pillar - 1) * platforms.length + i + 1,
          current_pillar_name: `Pillar ${pillar}`,
          updated_at: Date.now(),
        } : null);
      }
    }

    // Complete
    setProgress(prev => prev ? {
      ...prev,
      status: 'completed',
      completed_pillars: 3,
      completed_spokes: 3 * platforms.length,
      completed_at: Date.now(),
      updated_at: Date.now(),
    } : null);

    setIsGenerating(false);
  };

  // Calculate progress percentage
  const progressPercent = progress
    ? Math.round((progress.completed_spokes / progress.total_spokes) * 100)
    : 0;

  // Quality gate stats
  const gateStats = {
    g2Pass: generatedSpokes.filter(s => (s.g2_score ?? 0) >= QUALITY_GATE_CONFIG.G2.PASS).length,
    g2Warning: generatedSpokes.filter(s => {
      const score = s.g2_score ?? 0;
      return score >= QUALITY_GATE_CONFIG.G2.WARNING && score < QUALITY_GATE_CONFIG.G2.PASS;
    }).length,
    g2Fail: generatedSpokes.filter(s => (s.g2_score ?? 0) < QUALITY_GATE_CONFIG.G2.WARNING).length,
    g4Pass: generatedSpokes.filter(s => s.g4_status === 'pass').length,
    g4Fail: generatedSpokes.filter(s => s.g4_status !== 'pass').length,
    g5Pass: generatedSpokes.filter(s => s.g5_status === 'pass').length,
    g5Fail: generatedSpokes.filter(s => s.g5_status !== 'pass').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Spoke Generation
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Generating content for {platforms.length} platform{platforms.length > 1 ? 's' : ''}
          </p>
        </div>
        {!isGenerating && generatedSpokes.length === 0 && (
          <ActionButton variant="approve" onClick={startGeneration}>
            Start Generation
          </ActionButton>
        )}
      </div>

      {/* Platform Selection */}
      <div className="flex gap-2 flex-wrap">
        {platforms.map(platform => (
          <div
            key={platform}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <span>{PLATFORM_ICONS[platform]}</span>
            <span className="capitalize">{platform}</span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {isGenerating && progress && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">
              Processing: {progress.current_pillar_name}
            </span>
            <span className="font-medium text-[var(--text-primary)]">
              {progressPercent}%
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: 'var(--approve)',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>
              {progress.completed_spokes} / {progress.total_spokes} spokes
            </span>
            <span>
              {progress.completed_pillars} / {progress.total_pillars} pillars
            </span>
          </div>
        </div>
      )}

      {/* Quality Gate Summary */}
      {generatedSpokes.length > 0 && (
        <div
          className="p-4 rounded-lg space-y-3"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Quality Gate Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {/* G2: Hook Strength */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GateBadge gate="G2" score={QUALITY_GATE_CONFIG.G2.PASS} size="sm" />
                <span className="text-xs text-[var(--text-muted)]">Hook</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#00D26A]">Pass ({QUALITY_GATE_CONFIG.G2.PASS}+)</span>
                  <span className="font-medium text-[var(--text-primary)]">{gateStats.g2Pass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#FFAD1F]">Warning</span>
                  <span className="font-medium text-[var(--text-primary)]">{gateStats.g2Warning}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F4212E]">Fail</span>
                  <span className="font-medium text-[var(--text-primary)]">{gateStats.g2Fail}</span>
                </div>
              </div>
            </div>

            {/* G4: Voice */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GateBadge gate="G4" passed={true} size="sm" />
                <span className="text-xs text-[var(--text-muted)]">Voice</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#00D26A]">Pass</span>
                  <span className="font-medium text-[var(--text-primary)]">{gateStats.g4Pass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F4212E]">Fail</span>
                  <span className="font-medium text-[var(--text-primary)]">{gateStats.g4Fail}</span>
                </div>
              </div>
            </div>

            {/* G5: Platform */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GateBadge gate="G5" passed={true} size="sm" />
                <span className="text-xs text-[var(--text-muted)]">Platform</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#00D26A]">Pass</span>
                  <span className="font-medium text-[var(--text-primary)]">{gateStats.g5Pass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F4212E]">Fail</span>
                  <span className="font-medium text-[var(--text-primary)]">{gateStats.g5Fail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Spokes List */}
      {generatedSpokes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Generated Spokes ({generatedSpokes.length})
          </h3>
          <div className="space-y-2">
            {generatedSpokes.map((spoke, idx) => {
              const g2Score = spoke.g2_score ?? 0;
              const g4Passed = spoke.g4_status === 'pass';
              const g5Passed = spoke.g5_status === 'pass';

              return (
                <div
                  key={spoke.id}
                  className="p-3 rounded-lg flex items-start gap-3"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex-shrink-0 text-2xl">
                    {PLATFORM_ICONS[spoke.platform]}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[var(--text-secondary)] capitalize">
                          {spoke.platform}
                        </span>
                        {spoke.psychological_angle && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: 'var(--warning)',
                              color: '#000',
                            }}
                          >
                            {spoke.psychological_angle}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <GateBadge gate="G2" score={g2Score} size="sm" />
                        <GateBadge gate="G4" passed={g4Passed} size="sm" />
                        <GateBadge gate="G5" passed={g5Passed} size="sm" />
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                      {spoke.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      {progress?.status === 'completed' && (
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
          {onCancel && (
            <ActionButton variant="ghost" onClick={onCancel}>
              Cancel
            </ActionButton>
          )}
          <ActionButton
            variant="approve"
            onClick={() => onGenerationComplete?.(generatedSpokes)}
          >
            Review Spokes
          </ActionButton>
        </div>
      )}
    </div>
  );
}
