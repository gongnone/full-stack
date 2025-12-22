import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2, Edit, Trash2 } from "lucide-react"; // Added Edit and Trash2 icons
import React, { useState, useEffect, useRef } from "react"; // Import useEffect and useRef
import { trpc } from "@/lib/trpc"; // Import trpc client
import { toast } from "sonner"; // For notifications

export const Route = createFileRoute("/app/_authed/projects/")({
  component: ProjectsIndex,
});

type Pillar = {
  id: string;
  name: string;
};

// Define a type for Hub status updates from WebSocket
type HubStatusUpdate = {
  hubId: string;
  status: 'draft' | 'ingesting' | 'processing' | 'ready' | 'failed';
  message?: string;
};

function ProjectsIndex() {
  const [sourceType, setSourceType] = useState<"file" | "text" | "url">("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<"source" | "pillars">("source");
  const [processingHub, setProcessingHub] = useState<any | null>(null); // To store the hub being processed
  const [extractedPillars, setExtractedPillars] = useState<Pillar[]>([]);
  const [newPillarName, setNewPillarName] = useState("");
  const [editingPillarId, setEditingPillarId] = useState<string | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null); // Ref for WebSocket instance

  const trpcContext = trpc.useContext();
  const { accountId } = trpcContext; // Get accountId from tRPC context

  // Effect for WebSocket connection
  useEffect(() => {
    if (!accountId) return;

    // Determine the WebSocket URL dynamically based on current environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Assuming the data-service is running on the same host/port, but under /api/ws (proxied)
    // In a real deployed scenario, this might be a separate data-service URL
    const wsUrl = `${protocol}//${window.location.host}/api/ws/ingestion/${accountId}`;
    
    webSocketRef.current = new WebSocket(wsUrl);

    webSocketRef.current.onopen = () => {
      console.log("WebSocket connected for account:", accountId);
    };

    webSocketRef.current.onmessage = (event) => {
      try {
        const update: HubStatusUpdate = JSON.parse(event.data);
        console.log("Received WebSocket update:", update);
        if (processingHub && processingHub.id === update.hubId) {
          // Update the status of the currently processing hub in the UI
          setProcessingHub((prev: any) => ({ ...prev, status: update.status }));
          toast.info(`Hub ${update.hubId} status: ${update.status} ${update.message ? `(${update.message})` : ''}`);
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    webSocketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    webSocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("WebSocket connection error for real-time updates.");
    };

    // Cleanup function for WebSocket
    return () => {
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        webSocketRef.current.close();
      }
    };
  }, [accountId, processingHub]); // Re-run if accountId changes or processingHub changes (to listen for specific hub updates)


  const createHubMutation = trpc.hubs.create.useMutation({
    onSuccess: (data) => {
      setProcessingHub(data);
      try {
        const themes = JSON.parse(data.extractedThemes);
        setExtractedPillars(themes.themes.map((t: string) => ({ id: crypto.randomUUID(), name: t })));
        setWizardStep("pillars");
        toast.success("Source processed! Now configure your pillars.");

        // Optionally send a message via WebSocket that processing has started
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
          webSocketRef.current.send(JSON.stringify({
            hubId: data.id,
            status: "processing",
            message: "Thematic extraction started."
          }));
        }
      } catch (e) {
        toast.error("Failed to parse extracted themes.");
        console.error(e);
      }
    },
    onError: (error) => {
      toast.error(`Error creating hub: ${error.message}`);
    },
  });

  const updateHubMutation = trpc.hubs.update.useMutation({
    onSuccess: (data) => {
      toast.success("Hub finalized with updated pillars!");
      setIsDialogOpen(false);
      setWizardStep("source");
      // Optionally refresh projects list
      // Also notify via WebSocket that the hub is ready
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        webSocketRef.current.send(JSON.stringify({
          hubId: data.id,
          status: "ready",
          message: "Hub is ready for spoke generation."
        }));
      }
    },
    onError: (error) => {
      toast.error(`Error finalizing hub: ${error.message}`);
    }
  });


  const handleSubmitSource = async () => {
    let sourceContent = "";
    if (sourceType === "text" && textInput) {
      sourceContent = textInput;
    } else if (sourceType === "url" && urlInput) {
      sourceContent = urlInput;
    } else if (sourceType === "file" && fileInput) {
      sourceContent = fileInput.name;
    } else {
      toast.error("Please provide valid source input.");
      return;
    }

    createHubMutation.mutate({
      sourceType,
      textInput: sourceType === "text" ? textInput : undefined,
      urlInput: sourceType === "url" ? urlInput : undefined,
      fileInput: sourceType === "file" ? sourceContent : undefined,
    });
  };

  const handleAddPillar = () => {
    if (newPillarName.trim() && !extractedPillars.some(p => p.name === newPillarName.trim())) {
      setExtractedPillars([...extractedPillars, { id: crypto.randomUUID(), name: newPillarName.trim() }]);
      setNewPillarName("");
    }
  };

  const handleEditPillar = (id: string, newName: string) => {
    setExtractedPillars(extractedPillars.map(p => p.id === id ? { ...p, name: newName } : p));
    setEditingPillarId(null);
  };

  const handleDeletePillar = (id: string) => {
    setExtractedPillars(extractedPillars.filter(p => p.id !== id));
  };

  const handleFinalizePillars = () => {
    if (!processingHub) {
      toast.error("No hub being processed.");
      return;
    }
    updateHubMutation.mutate({
      hubId: processingHub.id,
      finalPillars: extractedPillars.map(p => p.name),
    });
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) { // Reset state when dialog closes
      setWizardStep("source");
      setTextInput("");
      setUrlInput("");
      setFileInput(null);
      setProcessingHub(null);
      setExtractedPillars([]);
      setNewPillarName("");
      setEditingPillarId(null);
      createHubMutation.reset();
      updateHubMutation.reset();
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Projects List</h2>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> New Hub
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{wizardStep === "source" ? "Create New Hub" : "Configure Hub Pillars"}</DialogTitle>
              {wizardStep === "source" && (
                <DialogDescription>
                  Select source material for your new Hub.
                </DialogDescription>
              )}
            </DialogHeader>

            {wizardStep === "source" ? (
              <>
                <div className="grid gap-4 py-4">
                  <div className="flex gap-2">
                    <Button variant={sourceType === "text" ? "default" : "outline"} onClick={() => setSourceType("text")}>Text</Button>
                    <Button variant={sourceType === "url" ? "default" : "outline"} onClick={() => setSourceType("url")}>URL</Button>
                    <Button variant={sourceType === "file" ? "default" : "outline"} onClick={() => setSourceType("file")}>File</Button>
                  </div>

                  {sourceType === "text" && (
                    <div className="grid gap-2">
                      <Label htmlFor="text-source">Paste Text</Label>
                      <Textarea
                        id="text-source"
                        placeholder="Paste your article, transcript, or other text here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        rows={8}
                      />
                    </div>
                  )}

                  {sourceType === "url" && (
                    <div className="grid gap-2">
                      <Label htmlFor="url-source">Enter URL</Label>
                      <Input
                        id="url-source"
                        placeholder="e.g., https://example.com/article"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                      />
                    </div>
                  )}

                  {sourceType === "file" && (
                    <div className="grid gap-2">
                      <Label htmlFor="file-source">Upload File (PDF, DOCX, TXT)</Label>
                      <Input
                        id="file-source"
                        type="file"
                        onChange={(e) => setFileInput(e.target.files ? e.target.files[0] : null)}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    onClick={handleSubmitSource}
                    disabled={createHubMutation.isPending}
                  >
                    {createHubMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Process Source
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogDescription>
                  Review and refine the extracted content pillars for your new Hub. Current Status: <span className="font-semibold">{processingHub?.status || 'Unknown'}</span>
                </DialogDescription>
                <div className="grid gap-4 py-4">
                  {extractedPillars.length === 0 ? (
                    <p className="text-muted-foreground">No pillars extracted yet. Add some below!</p>
                  ) : (
                    <div className="space-y-2">
                      {extractedPillars.map((pillar) => (
                        <div key={pillar.id} className="flex items-center space-x-2">
                          {editingPillarId === pillar.id ? (
                            <Input
                              value={pillar.name}
                              onChange={(e) => handleEditPillar(pillar.id, e.target.value)}
                              onBlur={() => setEditingPillarId(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditingPillarId(null);
                              }}
                              className="flex-grow"
                            />
                          ) : (
                            <span
                              className="flex-grow p-2 border rounded-md cursor-pointer hover:bg-accent/10"
                              onClick={() => setEditingPillarId(pillar.id)}
                            >
                              {pillar.name}
                            </span>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => setEditingPillarId(pillar.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePillar(pillar.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add new pillar"
                      value={newPillarName}
                      onChange={(e) => setNewPillarName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddPillar();
                      }}
                    />
                    <Button onClick={handleAddPillar}>Add Pillar</Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setWizardStep("source")}>Back</Button>
                  <Button
                    type="submit"
                    onClick={handleFinalizePillars}
                    disabled={updateHubMutation.isPending}
                  >
                    {updateHubMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Finalize Hub
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <p>This is a placeholder for the list of projects.</p>
    </div>
  );
}