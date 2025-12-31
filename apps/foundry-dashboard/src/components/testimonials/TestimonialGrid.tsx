import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { PlayCircle, Globe, Lock } from 'lucide-react';

interface Testimonial {
  id: string;
  clientName: string;
  clientLogo: string | null;
  videoUrl: string | null;
  duration: number; // seconds
  permissionPublic: boolean;
  createdAt: number;
}

interface TestimonialGridProps {
  testimonials: Testimonial[];
  onPlay: (testimonial: Testimonial) => void;
}

export function TestimonialGrid({ testimonials, onPlay }: TestimonialGridProps) {
  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-[#2A3038] rounded-xl">
        <p className="text-[#8B98A5]">No testimonials collected yet.</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {testimonials.map((t) => (
        <Card 
          key={t.id} 
          className="bg-[#1A1F26] border-[#2A3038] hover:border-[#8B98A5]/50 transition-colors group cursor-pointer"
          onClick={() => onPlay(t)}
        >
          <div className="relative aspect-video bg-[#0F1419] flex items-center justify-center rounded-t-lg overflow-hidden">
            {/* Placeholder for video thumbnail if available */}
            <PlayCircle className="h-12 w-12 text-[#1D9BF0] opacity-80 group-hover:scale-110 transition-transform" />
            <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-xs font-mono text-white">
              {formatDuration(t.duration)}
            </div>
          </div>
          
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {t.clientLogo ? (
                  <img src={t.clientLogo} alt={t.clientName} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#2A3038] flex items-center justify-center text-[10px] text-white">
                    {t.clientName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="font-semibold text-sm text-[#E7E9EA] line-clamp-1">{t.clientName}</span>
              </div>
              {t.permissionPublic ? (
                <Badge variant="outline" className="border-[#00D26A] text-[#00D26A] h-5 px-1.5 gap-1 text-[10px]">
                  <Globe className="h-3 w-3" /> Public
                </Badge>
              ) : (
                <Badge variant="outline" className="border-[#8B98A5] text-[#8B98A5] h-5 px-1.5 gap-1 text-[10px]">
                  <Lock className="h-3 w-3" /> Private
                </Badge>
              )}
            </div>
            <div className="text-xs text-[#8B98A5]">
              Collected {new Date(t.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
