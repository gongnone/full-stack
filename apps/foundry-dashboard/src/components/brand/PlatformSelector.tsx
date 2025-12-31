import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

export interface PlatformRecommendation {
  id: string;
  platform: string;
  priority: number;
  status: 'primary' | 'secondary' | 'excluded';
  rationale: string;
  postingCadence: string;
}

interface PlatformSelectorProps {
  primary: PlatformRecommendation[];
  secondary: PlatformRecommendation[];
  excluded: PlatformRecommendation[];
  onMove: (id: string, newStatus: 'primary' | 'secondary' | 'excluded') => void;
  onReorder: (id: string, newPriority: number) => void;
}

export function PlatformSelector({ primary, secondary, excluded, onMove, onReorder }: PlatformSelectorProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const PlatformCard = ({ item }: { item: PlatformRecommendation }) => (
    <div 
      className="flex items-center justify-between p-3 bg-[#1A1F26] border border-[#2A3038] rounded-lg mb-2 group hover:border-[#1D9BF0]/30 transition-colors"
      draggable
      onDragStart={() => setDraggedItem(item.id)}
      onDragEnd={() => setDraggedItem(null)}
    >
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-[#8B98A5] cursor-move" />
        <div>
          <div className="font-medium text-[#E7E9EA] flex items-center gap-2">
            {item.platform}
            <Badge variant="outline" className="text-xs font-normal border-[#2A3038] text-[#8B98A5]">
              {item.postingCadence}
            </Badge>
          </div>
          <p className="text-xs text-[#8B98A5] line-clamp-1">{item.rationale}</p>
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {item.status !== 'primary' && (
          <Button size="sm" variant="ghost" onClick={() => onMove(item.id, 'primary')} className="h-8 w-8 p-0 text-[#00D26A]">
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
        {item.status !== 'excluded' && item.status !== 'secondary' && (
          <Button size="sm" variant="ghost" onClick={() => onMove(item.id, 'secondary')} className="h-8 w-8 p-0 text-[#E7E9EA]">
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
        {item.status !== 'excluded' && (
          <Button size="sm" variant="ghost" onClick={() => onMove(item.id, 'excluded')} className="h-8 w-8 p-0 text-[#F4212E]">
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-[#E7E9EA] mb-3 flex items-center justify-between">
          Primary Channels (Focus Here)
          <Badge className="bg-[#00D26A] text-white">Top Priority</Badge>
        </h3>
        <div className="space-y-2 min-h-[50px] p-2 rounded-lg bg-[#0F1419]/50 border border-dashed border-[#2A3038]">
          {primary.map(p => <PlatformCard key={p.id} item={p} />)}
          {primary.length === 0 && <p className="text-xs text-[#8B98A5] text-center py-4">Drag platforms here</p>}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-[#E7E9EA] mb-3 flex items-center justify-between">
          Secondary Channels (Repurpose Here)
          <Badge variant="secondary" className="bg-[#2A3038] text-[#8B98A5]">Support</Badge>
        </h3>
        <div className="space-y-2 min-h-[50px] p-2 rounded-lg bg-[#0F1419]/50 border border-dashed border-[#2A3038]">
          {secondary.map(p => <PlatformCard key={p.id} item={p} />)}
          {secondary.length === 0 && <p className="text-xs text-[#8B98A5] text-center py-4">Drag platforms here</p>}
        </div>
      </div>

      {excluded.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#8B98A5] mb-3">Excluded / Later</h3>
          <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
            {excluded.map(p => <PlatformCard key={p.id} item={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
