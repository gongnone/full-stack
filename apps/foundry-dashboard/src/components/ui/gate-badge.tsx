import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * GateBadge - Quality gate badge with hover tooltips
 * Story 4.2: Displays G2/G4/G5 gate status with "Why" hover pattern
 *
 * Usage:
 *   <GateBadge gate="G2" score={85} breakdown={{ hook: 35, pattern: 25, benefit: 15, curiosity: 10 }} />
 *   <GateBadge gate="G4" passed={true} violations={[]} similarity={0.92} />
 *   <GateBadge gate="G5" passed={false} violations={['Exceeds 280 chars']} />
 */

const gateBadgeVariants = cva(
  'inline-flex items-center gap-1.5 font-semibold rounded-md cursor-help transition-all',
  {
    variants: {
      size: {
        sm: 'h-5 px-1.5 text-[10px]',
        md: 'h-6 px-2 text-xs',
        lg: 'h-8 px-3 text-sm',
      },
      status: {
        pass: 'bg-[rgba(0,210,106,0.15)] text-[#00D26A] hover:bg-[rgba(0,210,106,0.25)]',
        warning: 'bg-[rgba(255,173,31,0.15)] text-[#FFAD1F] hover:bg-[rgba(255,173,31,0.25)]',
        fail: 'bg-[rgba(244,33,46,0.15)] text-[#F4212E] hover:bg-[rgba(244,33,46,0.25)]',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'pass',
    },
  }
);

export interface G2Breakdown {
  hook?: number;       // Hook Strength (0-100)
  pattern?: number;    // Pattern Interrupt (0-40)
  benefit?: number;    // Benefit Signal (0-30)
  curiosity?: number;  // Curiosity Gap (0-30)
  notes?: string;      // Critic's notes
}

export interface G4Details {
  violations?: string[];
  similarity?: number;
}

export interface G5Details {
  violations?: string[];
}

export type GateType = 'G2' | 'G4' | 'G5';

export interface GateBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    Omit<VariantProps<typeof gateBadgeVariants>, 'status'> {
  gate: GateType;
  // G2: 0-100 score
  score?: number;
  breakdown?: G2Breakdown;
  // G4/G5: Pass/Fail
  passed?: boolean;
  g4Details?: G4Details;
  g5Details?: G5Details;
}

function getG2Status(score: number): 'pass' | 'warning' | 'fail' {
  if (score >= 80) return 'pass';
  if (score >= 60) return 'warning';
  return 'fail';
}

const GateBadge = React.forwardRef<HTMLDivElement, GateBadgeProps>(
  ({ className, size, gate, score, breakdown, passed, g4Details, g5Details, ...props }, ref) => {
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [tooltipTimeout, setTooltipTimeout] = React.useState<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
      const timeout = setTimeout(() => setShowTooltip(true), 300);
      setTooltipTimeout(timeout);
    };

    const handleMouseLeave = () => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      setShowTooltip(false);
    };

    // Determine status based on gate type
    let status: 'pass' | 'warning' | 'fail';
    let displayValue: string;

    if (gate === 'G2') {
      const s = score ?? 0;
      status = getG2Status(s);
      displayValue = `${s}`;
    } else {
      status = passed ? 'pass' : 'fail';
      displayValue = passed ? 'Pass' : 'Fail';
    }

    return (
      <div className="relative inline-block">
        <div
          ref={ref}
          className={cn(gateBadgeVariants({ size, status, className }))}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="status"
          aria-label={`${gate}: ${displayValue}`}
          {...props}
        >
          <span className="opacity-70">{gate}</span>
          <span>{displayValue}</span>
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg shadow-xl min-w-[200px] animate-fadeIn"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {gate === 'G2' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1">
                  Hook Strength Analysis
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Hook Strength:</span>
                    <span className="font-medium text-[var(--text-primary)]">{breakdown?.hook ?? score ?? 0}/100</span>
                  </div>
                  {breakdown?.pattern !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Pattern Interrupt:</span>
                      <span className="font-medium text-[var(--text-primary)]">{breakdown.pattern}/40</span>
                    </div>
                  )}
                  {breakdown?.benefit !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Benefit Signal:</span>
                      <span className="font-medium text-[var(--text-primary)]">{breakdown.benefit}/30</span>
                    </div>
                  )}
                  {breakdown?.curiosity !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Curiosity Gap:</span>
                      <span className="font-medium text-[var(--text-primary)]">{breakdown.curiosity}/30</span>
                    </div>
                  )}
                  {breakdown?.notes && (
                    <div className="pt-1 mt-1 border-t border-[var(--border-subtle)]">
                      <span className="text-[var(--text-secondary)] italic">"{breakdown.notes}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {gate === 'G4' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1">
                  Voice Alignment
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Status:</span>
                    <span className={`font-medium ${passed ? 'text-[#00D26A]' : 'text-[#F4212E]'}`}>
                      {passed ? 'Pass' : 'Fail'}
                    </span>
                  </div>
                  {g4Details?.similarity !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Cosine Similarity:</span>
                      <span className="font-medium text-[var(--text-primary)]">{(g4Details.similarity * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {g4Details?.violations && g4Details.violations.length > 0 && (
                    <div className="pt-1 mt-1 border-t border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)]">Violations:</span>
                      <ul className="mt-1 space-y-0.5">
                        {g4Details.violations.map((v, i) => (
                          <li key={i} className="text-[#F4212E] flex items-start gap-1">
                            <span>•</span>
                            <span>{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {gate === 'G5' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1">
                  Platform Compliance
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Status:</span>
                    <span className={`font-medium ${passed ? 'text-[#00D26A]' : 'text-[#F4212E]'}`}>
                      {passed ? 'Pass' : 'Fail'}
                    </span>
                  </div>
                  {g5Details?.violations && g5Details.violations.length > 0 && (
                    <div className="pt-1 mt-1 border-t border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)]">Violations:</span>
                      <ul className="mt-1 space-y-0.5">
                        {g5Details.violations.map((v, i) => (
                          <li key={i} className="text-[#F4212E] flex items-start gap-1">
                            <span>•</span>
                            <span>{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tooltip arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid var(--border-subtle)',
              }}
            />
          </div>
        )}
      </div>
    );
  }
);
GateBadge.displayName = 'GateBadge';

export { GateBadge, gateBadgeVariants };
