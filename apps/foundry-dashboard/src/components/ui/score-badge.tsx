import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * ScoreBadge - Quality gate score display
 * Story 1.4: Themed score badge with color variants based on score value
 *
 * Usage:
 *   <ScoreBadge score={8.5} gate="G2" />
 *   <ScoreBadge score={4.2} gate="G4" size="lg" />
 */

const scoreBadgeVariants = cva(
  'inline-flex items-center justify-center font-semibold rounded-md',
  {
    variants: {
      size: {
        sm: 'h-6 px-2 text-xs',
        md: 'h-8 px-3 text-sm',
        lg: 'h-12 px-4 text-2xl',
      },
      quality: {
        high: 'bg-[rgba(0,210,106,0.15)] text-[#00D26A]',
        mid: 'bg-[rgba(255,173,31,0.15)] text-[#FFAD1F]',
        low: 'bg-[rgba(244,33,46,0.15)] text-[#F4212E]',
      },
    },
    defaultVariants: {
      size: 'md',
      quality: 'mid',
    },
  }
);

type Gate = 'G2' | 'G4' | 'G5' | 'G7';

export interface ScoreBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    Omit<VariantProps<typeof scoreBadgeVariants>, 'quality'> {
  /** Numeric score value (0-10) */
  score: number;
  /** Quality gate identifier */
  gate?: Gate;
  /** Show gate label alongside score */
  showGate?: boolean;
}

function getQuality(score: number): 'high' | 'mid' | 'low' {
  if (score >= 8.0) return 'high';
  if (score >= 5.0) return 'mid';
  return 'low';
}

const ScoreBadge = React.forwardRef<HTMLDivElement, ScoreBadgeProps>(
  ({ className, size, score, gate, showGate = false, ...props }, ref) => {
    const quality = getQuality(score);
    const displayScore = score.toFixed(1);

    return (
      <div
        ref={ref}
        className={cn(scoreBadgeVariants({ size, quality, className }))}
        role="status"
        aria-label={`${gate ? `${gate} ` : ''}Score: ${displayScore}`}
        {...props}
      >
        {showGate && gate && (
          <span className="mr-1 opacity-70">{gate}</span>
        )}
        {displayScore}
      </div>
    );
  }
);
ScoreBadge.displayName = 'ScoreBadge';

export { ScoreBadge, scoreBadgeVariants };
