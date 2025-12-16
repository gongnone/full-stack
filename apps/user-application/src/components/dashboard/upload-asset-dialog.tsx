import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { UploadCloudIcon, Loader2 } from "lucide-react";

export function UploadAssetDialog({ onUploadComplete }: { workflowId: string, onUploadComplete: () => void }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpload = async () => {
        // Here we would actually upload to R2 and then call the trigger endpoint
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setOpen(false);
            onUploadComplete();
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <UploadCloudIcon className="h-4 w-4" /> Upload Assets
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Competitor Assets</DialogTitle>
                    <DialogDescription>
                        Upload a PDF or Zip file containing the competitor's funnel (emails, screenshots, reports).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="file">Asset File</Label>
                        <Input id="file" type="file" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpload} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload & Resume Analysis
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
