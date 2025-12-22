import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trpc } from '@/lib/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PLATFORM_CONFIG } from '../sprint/types';

interface CloneSpokeModalProps {
  spoke: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloneSpokeModal({ spoke, isOpen, onOpenChange }: CloneSpokeModalProps) {
  const queryClient = useQueryClient();
  const [numVariations, setNumVariations] = useState('3');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([spoke.platform]);
  const [varyAngle, setVaryAngle] = useState(false);

  const cloneMutation = useMutation({
    ...trpc.generations.cloneSpoke.mutationOptions(),
    onSuccess: () => {
      toast.success('Cloning started!', {
        description: 'Variations are being generated and evaluated.',
      });
      queryClient.invalidateQueries({ queryKey: ['generation-progress', spoke.hub_id] });
      queryClient.invalidateQueries({ queryKey: ['spokes', spoke.hub_id] });
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error('Failed to start cloning', {
        description: err.message,
      });
    }
  });

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleSubmit = () => {
    cloneMutation.mutate({
      spokeId: spoke.id,
      numVariations: parseInt(numVariations),
      platforms: selectedPlatforms,
      varyAngle,
      hubId: spoke.hub_id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-popover border-border shadow-2xl rounded-2xl overflow-hidden p-0">
        <DialogHeader className="p-6 bg-secondary/30 border-b border-border">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Clone Best Content</DialogTitle>
          <DialogDescription className="text-muted-foreground leading-relaxed mt-1">
            Generate variations of this high-performing piece to multiply reach across platforms.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-8 p-6">
          {/* Variation Count */}
          <div className="space-y-3">
            <Label htmlFor="num-variations" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Number of Variations</Label>
            <Select value={numVariations} onValueChange={setNumVariations}>
              <SelectTrigger id="num-variations" className="bg-background border-border h-11 rounded-xl shadow-sm">
                <SelectValue placeholder="Select count" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-xl shadow-2xl">
                {[1, 2, 3, 4, 5].map(n => (
                  <SelectItem key={n} value={n.toString()} className="py-2.5">{n} Variations</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform Multi-select */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Platforms</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(PLATFORM_CONFIG).map(([id, config]) => (
                <div key={id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group" onClick={() => togglePlatform(id)}>
                  <Checkbox 
                    id={`platform-${id}`} 
                    checked={selectedPlatforms.includes(id)}
                    onCheckedChange={() => togglePlatform(id)}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor={`platform-${id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors"
                  >
                    {config.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Vary Angle Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border shadow-inner">
            <div className="space-y-1">
              <Label className="text-sm font-bold tracking-tight text-foreground">Vary Psychological Angle</Label>
              <p className="text-xs text-muted-foreground leading-relaxed">Try different hooks for the same core message.</p>
            </div>
            <Switch 
              checked={varyAngle}
              onCheckedChange={setVaryAngle}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        <DialogFooter className="p-6 bg-secondary/10 border-t border-border gap-3 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-6 hover:bg-secondary/80">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={selectedPlatforms.length === 0 || cloneMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 shadow-lg shadow-primary/20 transition-all duration-200"
          >
            {cloneMutation.isPending ? "Starting..." : "Generate Variations"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
