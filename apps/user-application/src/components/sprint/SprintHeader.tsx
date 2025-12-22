/**
 * SprintHeader Component
 *
 * Top navigation bar for Sprint View.
 * Contains: Exit button, Sprint title, Progress counter.
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface SprintHeaderProps {
  title: string;
  currentIndex: number;
  totalCount: number;
  onExit: () => void;
}

export function SprintHeader({
  title,
  currentIndex,
  totalCount,
  onExit,
}: SprintHeaderProps) {
  const displayCurrent = Math.min(currentIndex + 1, totalCount);
  const progressPercent = totalCount > 0 ? (currentIndex / totalCount) * 100 : 0;
  const isComplete = currentIndex >= totalCount;

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[#2A3038] bg-[#1A1F26]">
      {/* Exit Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onExit}
        className="text-[#8B98A5] hover:text-[#E7E9EA] hover:bg-[#242A33] gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-mono text-xs">ESC</span>
      </Button>

      {/* Title */}
      <h1 className="text-xl font-semibold text-[#E7E9EA] tracking-tight">
        {title}
      </h1>

      {/* Counter Badge */}
      <Badge
        variant="outline"
        className={`
          font-mono text-sm px-4 py-1.5
          ${isComplete
            ? 'border-[#00D26A] text-[#00D26A] bg-[#00D26A]/15'
            : progressPercent > 50
              ? 'border-[#00D26A]/50 text-[#00D26A] bg-[#00D26A]/10'
              : 'border-[#8B98A5]/50 text-[#8B98A5] bg-[#8B98A5]/10'
          }
        `}
      >
        {isComplete ? (
          <span>Complete!</span>
        ) : (
          <span>{displayCurrent} / {totalCount}</span>
        )}
      </Badge>
    </header>
  );
}
