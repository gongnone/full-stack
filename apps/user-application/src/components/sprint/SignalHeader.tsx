import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SignalHeaderProps {
  hookScore: number;
  predictionScore: number;
  g4Passed: boolean;
  g5Passed: boolean;
  criticNotes?: string;
  showNotes?: boolean;
}

const scoreColors = {
  high: 'text-success',
  medium: 'text-warning',
  low: 'text-destructive',
};

export function SignalHeader({
  hookScore,
  predictionScore,
  g4Passed,
  g5Passed,
  criticNotes,
  showNotes = false,
}: SignalHeaderProps) {
  const getG2Color = (score: number) => {
    if (score > 80) return scoreColors.high;
    if (score >= 50) return scoreColors.medium;
    return scoreColors.low;
  };

  const getG7Color = (score: number) => {
    if (score > 8.0) return scoreColors.high;
    if (score >= 5.0) return scoreColors.medium;
    return scoreColors.low;
  };

  return (
    <div className="w-full max-w-[880px] bg-card/40 rounded-lg border border-border p-6 shadow-xl">
      <div className="flex items-center justify-between">
        {/* Score Displays */}
        <div className="flex items-center gap-12">
          {/* G2 Hook Score */}
          <div className="flex flex-col">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
              G2 Hook
            </span>
            <div className="flex items-baseline gap-2">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`text-5xl font-bold font-mono tracking-tighter cursor-help ${getG2Color(hookScore)}`}>
                      {hookScore}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-sm bg-popover border-border text-foreground p-4 shadow-2xl">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1">Critic's Rubric Notes</p>
                      <p className="text-sm leading-relaxed">{criticNotes || "No specific critic notes for G2."}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* G7 Prediction Score */}
          <div className="flex flex-col">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
              G7 Prediction
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold font-mono tracking-tighter ${getG7Color(predictionScore)}`}>
                {predictionScore?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Gate Status */}
        <div className="flex items-center gap-4">
          {/* Gate Badges */}
          <div className="flex gap-2">
            <GateBadge gate="G4" passed={g4Passed} />
            <GateBadge gate="G5" passed={g5Passed} />
          </div>
        </div>
      </div>

      {/* Expanded Critic Notes (when showNotes is true) */}
      {showNotes && criticNotes && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">{criticNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface GateBadgeProps {
  gate: string;
  passed: boolean;
}

function GateBadge({ gate, passed }: GateBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`
        px-3 py-1 gap-1.5 font-mono text-xs uppercase tracking-wider
        ${passed
          ? 'border-success/30 text-success bg-success/10'
          : 'border-destructive/30 text-destructive bg-destructive/10'
        }
      `}
    >
      {passed ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {gate}
    </Badge>
  );
}
