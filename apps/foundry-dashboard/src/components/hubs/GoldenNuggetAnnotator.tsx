import { useState, useCallback, useRef } from 'react';
import { Button } from '../ui/card';
import { Sparkles, Trash2, Info } from 'lucide-react';

interface GoldenNugget {
  index: number;
  text: string;
  isGolden: boolean;
}

interface GoldenNuggetAnnotatorProps {
  sourceText: string;
  nuggets: GoldenNugget[];
  onToggle: (index: number, isGolden: boolean) => void;
}

export function GoldenNuggetAnnotator({ sourceText, nuggets, onToggle }: GoldenNuggetAnnotatorProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#1D9BF0]/10 border border-[#1D9BF0]/20 rounded-xl p-4 flex gap-3">
        <Info className="h-5 w-5 text-[#1D9BF0] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-[#E7E9EA]">Mark Golden Nuggets</h4>
          <p className="text-xs text-[#8B98A5] mt-1">
            Select key points below to mark them as "Golden Nuggets". These will be given higher priority 
            and more emphasis during the social media content generation phase.
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {nuggets.map((nugget) => (
          <div 
            key={nugget.index}
            onClick={() => onToggle(nugget.index, !nugget.isGolden)}
            className={`
              relative p-4 rounded-xl border cursor-pointer transition-all group
              ${nugget.isGolden 
                ? 'bg-[#FFAD1F]/10 border-[#FFAD1F] shadow-[0_0_15px_rgba(255,173,31,0.1)]' 
                : 'bg-[#1A1F26] border-[#2A3038] hover:border-[#8B98A5]'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                mt-1 flex items-center justify-center w-5 h-5 rounded-full border
                ${nugget.isGolden 
                  ? 'bg-[#FFAD1F] border-[#FFAD1F] text-[#0F1419]' 
                  : 'bg-transparent border-[#2A3038] text-transparent group-hover:border-[#8B98A5]'
                }
              `}>
                <Sparkles className="h-3 w-3" />
              </div>
              <p className={`
                text-sm leading-relaxed
                ${nugget.isGolden ? 'text-[#E7E9EA]' : 'text-[#8B98A5]'}
              `}>
                {nugget.text}
              </p>
            </div>
            
            {nugget.isGolden && (
              <div className="absolute top-2 right-2 text-[10px] font-bold text-[#FFAD1F] uppercase tracking-tighter animate-pulse">
                Golden
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-[#2A3038]">
        <div className="text-xs text-[#8B98A5]">
          <span className="font-bold text-[#E7E9EA]">{nuggets.filter(n => n.isGolden).length}</span> Golden Nuggets Selected
        </div>
      </div>
    </div>
  );
}
