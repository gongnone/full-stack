import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { convertToCSV, convertToJSON, downloadFile } from "@/lib/export-utils";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

export function ExportModal({ open, onOpenChange, clientId }: ExportModalProps) {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const platforms = ["LinkedIn", "Twitter", "Instagram", "Facebook", "TikTok"];

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await trpc.client.generations.getApprovedSpokesForExport.query({
        clientId,
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
      });

      if (data.length === 0) {
        toast.error("No approved content found to export.");
        setIsExporting(false);
        return;
      }

      if (format === "csv") {
        const csv = convertToCSV(data);
        downloadFile(csv, `export-${clientId}-${new Date().getTime()}.csv`, "text/csv");
      } else {
        const json = convertToJSON(data);
        downloadFile(json, `export-${clientId}-${new Date().getTime()}.json`, "application/json");
      }

      toast.success(`Exported ${data.length} items successfully.`);
      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to generate export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Approved Content</DialogTitle>
          <DialogDescription>
            Download your approved spokes in CSV or JSON format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>Export Format</Label>
            <Tabs
              value={format}
              onValueChange={(v) => setFormat(v as "csv" | "json")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv">CSV (Flat)</TabsTrigger>
                <TabsTrigger value="json">JSON (Hierarchical)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-3">
            <Label>Filter by Platform (Optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <Label
                    htmlFor={`platform-${platform}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Generate Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
