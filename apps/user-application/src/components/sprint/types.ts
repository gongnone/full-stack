/**
 * Sprint View Types
 *
 * Core type definitions for the high-velocity content review sprint.
 * Targets < 6 second decision time with keyboard-first interaction.
 */

export type Platform = 'linkedin' | 'twitter' | 'instagram' | 'tiktok' | 'newsletter' | 'thread' | 'carousel';

export type SprintAction = 'approve' | 'kill' | 'edit' | 'skip';

export interface SprintItemGates {
  /** G4: Voice/Brand compliance gate */
  g4Passed: boolean;
  /** G5: Platform optimization gate */
  g5Passed: boolean;
}

export interface SprintItem {
  id: string;
  hubId: string;
  pillarId: string;

  // Content
  content: string; // Direct content from spoke
  platform: Platform;

  // Signal Scores (visible in Signal Header)
  /** G2 Hook Score: 0-100, measures attention-grabbing potential */
  hookScore: number;
  /** G7 Prediction Score: 0-100, predicts performance */
  predictionScore: number;

  // Quality Gates
  gates: SprintItemGates;

  // Context/Navigation
  breadcrumb: {
    client: string;
    platform: string;
    hub: string;
    pillar: string;
  };

  // Critic feedback (shown on ? toggle)
  criticNotes?: string;
}

export interface SprintDecision {
  itemId: string;
  action: SprintAction;
  timestamp: number;
}

export interface SprintState {
  items: SprintItem[];
  currentIndex: number;
  decisions: SprintDecision[];
  showCriticNotes: boolean;
  isAnimating: boolean;
  exitDirection: 'left' | 'right' | 'up' | null;
}

export interface SprintStats {
  total: number;
  approved: number;
  killed: number;
  edited: number;
  skipped: number;
  averageDecisionTime: number;
}

// Score thresholds for color coding
export const SCORE_THRESHOLDS = {
  HIGH_G2: 80,
  MEDIUM_G2: 50,
  HIGH_G7: 8.0,
  MEDIUM_G7: 5.0,
} as const;

export function getScoreColorG2(score: number): 'high' | 'medium' | 'low' {
  if (score >= SCORE_THRESHOLDS.HIGH_G2) return 'high';
  if (score >= SCORE_THRESHOLDS.MEDIUM_G2) return 'medium';
  return 'low';
}

export function getScoreColorG7(score: number): 'high' | 'medium' | 'low' {
  if (score >= SCORE_THRESHOLDS.HIGH_G7) return 'high';
  if (score >= SCORE_THRESHOLDS.MEDIUM_G7) return 'medium';
  return 'low';
}

// Platform icons/labels for display
export const PLATFORM_CONFIG: Record<Platform, { label: string; color: string }> = {
  linkedin: { label: 'LinkedIn', color: '#0A66C2' },
  twitter: { label: 'Twitter', color: '#1D9BF0' },
  instagram: { label: 'Instagram', color: '#E4405F' },
  tiktok: { label: 'TikTok', color: '#000000' },
  newsletter: { label: 'Newsletter', color: '#FFAD1F' },
  thread: { label: 'Thread', color: '#1D9BF0' }, // Same as Twitter for now
  carousel: { label: 'Carousel', color: '#00D26A' },
};
