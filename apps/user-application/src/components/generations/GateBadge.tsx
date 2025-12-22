import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
  
  interface GateBadgeProps {
    gate: 'G2' | 'G4' | 'G5';
    score?: number;  // G2 only
    result?: 'pass' | 'fail';  // G4, G5
    breakdown?: Record<string, unknown>;
    notes?: string;
    violations?: string[];
    cosineSimilarity?: number;
  }
  
  const badgeColors = {
    G2: {
      high: 'bg-[#00D26A]/20 text-[#00D26A]',    // ≥80
      medium: 'bg-[#FFAD1F]/20 text-[#FFAD1F]',  // 60-80
      low: 'bg-[#F4212E]/20 text-[#F4212E]',     // <60
    },
    G4: {
      pass: 'bg-[#00D26A]/20 text-[#00D26A]',
      fail: 'bg-[#F4212E]/20 text-[#F4212E]',
    },
    G5: {
      pass: 'bg-[#00D26A]/20 text-[#00D26A]',
      fail: 'bg-[#F4212E]/20 text-[#F4212E]',
    },
  };

  function getG2Color(score: number) {
    if (score >= 80) return badgeColors.G2.high;
    if (score >= 60) return badgeColors.G2.medium;
    return badgeColors.G2.low;
  }
  
  export function GateBadge({ gate, score, result, breakdown, notes, violations, cosineSimilarity }: GateBadgeProps) {
    const color = gate === 'G2' ? getG2Color(score || 0) : badgeColors[gate][result || 'fail'];
    const label = gate === 'G2' ? `${gate}: ${score}` : `${gate}: ${result}`;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
              {label}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {gate === 'G2' && (
              <div className="p-3 max-w-[280px]">
                <div className="text-primary font-medium mb-2">Hook Strength: {score}/100</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Pattern Interrupt: {breakdown?.patternInterrupt as number}/40</div>
                  <div>Benefit Signal: {breakdown?.benefitSignal as number}/30</div>
                  <div>Curiosity Gap: {breakdown?.curiosityGap as number}/30</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{notes}</div>
              </div>
            )}
            {gate === 'G4' && (
                <div className="p-3 max-w-[280px]">
                    <div className="text-primary font-medium mb-2">Voice Alignment: {result}</div>
                    {violations?.map((v, i) => (
                        <div key={i} className="text-sm text-destructive">{v}</div>
                    ))}
                    <div className="mt-2 text-xs text-muted-foreground">
                        Similarity: {((cosineSimilarity || 0) * 100).toFixed(0)}%
                    </div>
                </div>
            )}
            {gate === 'G5' && (
                <div className="p-3 max-w-[280px]">
                    <div className="text-primary font-medium mb-2">Platform Compliance: {result}</div>
                    {violations?.map((v, i) => (
                        <div key={i} className="text-sm text-destructive">{v}</div>
                    ))}
                </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  