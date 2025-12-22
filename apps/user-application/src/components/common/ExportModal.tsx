/**
 * ExportModal Component
 *
 * Provides a UI for selecting export format and applying filters
 * before generating CSV/JSON files.
 */

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
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { convertToCSV, convertToJSON, downloadFile, ExportSpoke, generatePlatformZIP, applySchedulingMetadata } from '@/utils/export-utils';
import { Download, FileJson, FileSpreadsheet, Loader2, FolderTree, Calendar, Image as ImageIcon } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'thread', label: 'Thread' },
  { id: 'carousel', label: 'Carousel' },
];

export function ExportModal({
  isOpen,
  onOpenChange,
  clientId,
}: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(PLATFORMS.map(p => p.id));
  const [organizeByPlatform, setOrganizeByPlatform] = useState(false);
  const [includeScheduling, setIncludeScheduling] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(false);
  const [isExporting, setIsHubExporting] = useState(false);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerateExport = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }

    setIsHubExporting(true);
    try {
      let data = await (trpc as any).generations.getApprovedSpokesForExport.query({
        clientId,
        platforms: selectedPlatforms,
        includeAssets: includeMedia,
      }) as ExportSpoke[];

      if (!data || data.length === 0) {
        toast.error('No approved content found', {
          description: 'Try approving some content in the Production Queue first.'
        });
        setIsHubExporting(false);
        return;
      }

      if (includeScheduling) {
        data = applySchedulingMetadata(data);
      }

      if (organizeByPlatform || includeMedia) {
        const zipBlob = await generatePlatformZIP(data, format, includeScheduling, includeMedia);
        const filename = `foundry-export-${new Date().toISOString().split('T')[0]}.zip`;
        downloadFile(zipBlob, filename, 'application/zip');
      } else {
        const filename = `foundry-export-${new Date().toISOString().split('T')[0]}.${format}`;
        if (format === 'csv') {
          const csvContent = convertToCSV(data, includeScheduling);
          downloadFile(csvContent, filename, 'text/csv');
        } else {
          const jsonContent = convertToJSON(data, includeScheduling);
          downloadFile(jsonContent, filename, 'application/json');
        }
      }

      toast.success('Export successful', {
        description: `Exported ${data.length} spokes ${organizeByPlatform || includeMedia ? 'as ZIP' : `to ${format.toUpperCase()}`}`
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error('Export failed: ' + error.message);
    } finally {
      setIsHubExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-popover border-border shadow-2xl rounded-2xl overflow-hidden p-0">
        <DialogHeader className="p-6 bg-secondary/30 border-b border-border">
          <DialogTitle className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Download className="h-6 w-6 text-primary" />
            Export Content
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Generate production-ready files for your scheduling tools.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Format Selection */}
          <div className="space-y-4">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Select Format</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormat('csv')}
                className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 group ${
                  format === 'csv'
                    ? 'border-success bg-success/5 text-success shadow-lg shadow-success/10'
                    : 'border-border hover:border-muted-foreground/30 text-muted-foreground bg-background/50'
                }`}
              >
                <FileSpreadsheet className={`h-8 w-8 mb-3 transition-transform duration-200 ${format === 'csv' ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="font-black uppercase tracking-widest text-xs">CSV</span>
                <span className="text-[10px] opacity-60 mt-1 font-medium">Spreadsheet Friendly</span>
              </button>
              <button
                onClick={() => setFormat('json')}
                className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 group ${
                  format === 'json'
                    ? 'border-info bg-info/5 text-info shadow-lg shadow-info/10'
                    : 'border-border hover:border-muted-foreground/30 text-muted-foreground bg-background/50'
                }`}
              >
                <FileJson className={`h-8 w-8 mb-3 transition-transform duration-200 ${format === 'json' ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="font-black uppercase tracking-widest text-xs">JSON</span>
                <span className="text-[10px] opacity-60 mt-1 font-medium">Hierarchical Data</span>
              </button>
            </div>
          </div>

          {/* Platform Filters */}
          <div className="space-y-4">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Platforms</Label>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 bg-background/40 p-4 rounded-xl border border-border/50 shadow-inner">
              {PLATFORMS.map((platform) => (
                <div key={platform.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handlePlatformToggle(platform.id)}>
                  <Checkbox
                    id={`platform-${platform.id}`}
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={() => handlePlatformToggle(platform.id)}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                  />
                  <label
                    htmlFor={`platform-${platform.id}`}
                    className="text-sm text-muted-foreground group-hover:text-foreground leading-none transition-colors cursor-pointer font-medium tracking-tight"
                  >
                    {platform.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Advanced Options</Label>
            <div className="space-y-4 px-1">
              <div className="flex items-start space-x-4 group cursor-pointer" onClick={() => !includeMedia && setOrganizeByPlatform(!organizeByPlatform)}>
                <Checkbox
                  id="organize-by-platform"
                  checked={organizeByPlatform || includeMedia}
                  onCheckedChange={(checked) => setOrganizeByPlatform(checked === true)}
                  disabled={includeMedia}
                  className="mt-1 border-border data-[state=checked]:bg-info data-[state=checked]:border-info"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="organize-by-platform"
                    className={`text-sm font-bold leading-none flex items-center gap-2 tracking-tight ${includeMedia ? 'text-info' : 'text-foreground'}`}
                  >
                    <FolderTree className="h-3.5 w-3.5" />
                    Organize by Platform (ZIP)
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-wider font-bold opacity-60">Creates a folder for each platform {includeMedia && " (REQUIRED FOR MEDIA)"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group cursor-pointer" onClick={() => setIncludeMedia(!includeMedia)}>
                <Checkbox
                  id="include-media"
                  checked={includeMedia}
                  onCheckedChange={(checked) => setIncludeMedia(checked === true)}
                  className="mt-1 border-border data-[state=checked]:bg-success data-[state=checked]:border-success"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="include-media"
                    className="text-sm font-bold text-foreground leading-none flex items-center gap-2 tracking-tight"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    Include Media Assets
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-wider font-bold opacity-60">Bundles generated images and thumbnails.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group cursor-pointer" onClick={() => setIncludeScheduling(!includeScheduling)}>
                <Checkbox
                  id="include-scheduling"
                  checked={includeScheduling}
                  onCheckedChange={(checked) => setIncludeScheduling(checked === true)}
                  className="mt-1 border-border data-[state=checked]:bg-warning data-[state=checked]:border-warning"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="include-scheduling"
                    className="text-sm font-bold text-foreground leading-none flex items-center gap-2 tracking-tight"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Include Scheduling Metadata
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-wider font-bold opacity-60">Adds suggested publish dates and times.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-secondary/10 border-t border-border gap-3 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-6 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateExport}
            disabled={isExporting || selectedPlatforms.length === 0}
            className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.15em] text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 min-w-[180px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
