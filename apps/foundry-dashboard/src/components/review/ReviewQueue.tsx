import { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Check,
  X,
  Share2,
  Clock,
  Star,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface Spoke {
  id: string;
  content: string;
  platform: string;
  g2Score: number;
  status: string;
  hubTitle: string;
  pillarTitle: string;
}

interface ReviewQueueProps {
  spokes: Spoke[];
  onApprove: (id: string, loved?: boolean) => void;
  onReject: (id: string) => void;
  onPost: (id: string) => void;
}

export function ReviewQueue({ spokes, onApprove, onReject, onPost }: ReviewQueueProps) {
  const [filter, setFilter] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredSpokes = useMemo(() => {
    if (filter === 'all') return spokes;
    return spokes.filter(s => s.platform === filter);
  }, [spokes, filter]);

  const currentSpoke = filteredSpokes[currentIndex];
  const estimateMinutes = Math.ceil(filteredSpokes.length * 0.1); // ~6 seconds per decision

  const handleShare = async (spoke: Spoke) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post for ${spoke.platform}`,
          text: spoke.content,
        });
      } else {
        await navigator.clipboard.writeText(spoke.content);
        alert('Caption copied to clipboard!');
      }
      onPost(spoke.id);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (filteredSpokes.length === 0 || !currentSpoke) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#1A1F26] border border-[#2A3038] rounded-2xl text-center">
        <div className="w-16 h-16 bg-[#2A3038] rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-[#00D26A]" />
        </div>
        <h3 className="text-lg font-bold text-[#E7E9EA]">Queue Empty!</h3>
        <p className="text-sm text-[#8B98A5] mt-2">All spokes have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-[#1D9BF0] text-white">
            {filteredSpokes.length} Pending
          </Badge>
          <div className="flex items-center gap-1 text-xs text-[#8B98A5]">
            <Clock className="h-3 w-3" /> ~{estimateMinutes} min
          </div>
        </div>
        
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[#1A1F26] border border-[#2A3038] text-[#E7E9EA] text-xs rounded-lg px-2 py-1 outline-none"
        >
          <option value="all">All Platforms</option>
          <option value="twitter">Twitter/X</option>
          <option value="linkedin">LinkedIn</option>
          <option value="tiktok">TikTok</option>
        </select>
      </div>

      {/* Main Review Card */}
      <div className="relative group">
        <Card className="bg-[#1A1F26] border-[#2A3038] shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
          <div className="p-4 border-b border-[#2A3038] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8B98A5] tracking-widest">{currentSpoke.hubTitle}</span>
              <h4 className="text-sm font-semibold text-[#E7E9EA]">{currentSpoke.pillarTitle}</h4>
            </div>
            <Badge variant="outline" className="border-[#1D9BF0] text-[#1D9BF0]">
              {currentSpoke.platform.toUpperCase()}
            </Badge>
          </div>

          <CardContent className="p-6 flex-grow flex flex-col justify-center">
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#1D9BF0] rounded-full" />
              <p className="text-lg text-[#E7E9EA] leading-relaxed whitespace-pre-wrap">
                {currentSpoke.content}
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-grow bg-[#0F1419] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#00D26A] h-full transition-all duration-500" 
                  style={{ width: `${currentSpoke.g2Score}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#8B98A5]">Hook: {currentSpoke.g2Score}%</span>
            </div>
          </CardContent>

          {/* Action Bar */}
          <div className="p-4 bg-[#0F1419]/50 border-t border-[#2A3038] grid grid-cols-3 gap-2">
            <Button 
              variant="ghost" 
              onClick={() => onReject(currentSpoke.id)}
              className="text-[#F4212E] hover:bg-[#F4212E]/10"
            >
              <X className="h-5 w-5 mr-2" /> Kill
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => onApprove(currentSpoke.id, true)}
              className="text-[#FFAD1F] hover:bg-[#FFAD1F]/10"
            >
              <Star className="h-5 w-5 mr-2" /> Love It
            </Button>

            <Button 
              onClick={() => onApprove(currentSpoke.id)}
              className="bg-[#00D26A] hover:bg-[#00B85E] text-white"
            >
              <Check className="h-5 w-5 mr-2" /> Approve
            </Button>
          </div>
        </Card>

        {/* Navigation Overlays */}
        {currentIndex > 0 && (
          <button 
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="absolute left-[-50px] top-1/2 -translate-y-1/2 p-2 text-[#8B98A5] hover:text-[#E7E9EA] transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}
        
        {currentIndex < filteredSpokes.length - 1 && (
          <button 
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="absolute right-[-50px] top-1/2 -translate-y-1/2 p-2 text-[#8B98A5] hover:text-[#E7E9EA] transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </div>

      {/* Progress Tracker */}
      <div className="flex justify-center gap-1">
        {filteredSpokes.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-4 bg-[#1D9BF0]' : 'w-1 bg-[#2A3038]'}`}
          />
        ))}
      </div>

      {/* "Ready to Post" Prompt (only if approved) */}
      {currentSpoke.status === 'approved' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button 
            onClick={() => handleShare(currentSpoke)}
            className="w-full h-14 bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-lg font-bold shadow-lg shadow-[#1D9BF0]/20"
          >
            <Share2 className="h-5 w-5 mr-2" /> Ready to Post
          </Button>
        </div>
      )}
    </div>
  );
}
