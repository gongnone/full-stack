import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ActionRequiredCardProps {
    projectId: string;
}

export function ActionRequiredCard({ projectId }: ActionRequiredCardProps) {
    const [notes, setNotes] = useState("");
    // const [file, setFile] = useState<File | null>(null);

    // Fetch workflow status to see if paused
    const { data: run } = useQuery(trpc.marketResearch.getWorkflowProgress.queryOptions({ projectId }));

    // TODO: Implement resume mutation in router
    // const resumeMutation = trpc.marketResearch.resumeWorkflow.useMutation(...)

    if (!run || run.status !== 'paused_hitl') return null;

    const request = run.hitl_request ? JSON.parse(run.hitl_request) : { instruction: "Manual verification required." };

    const handleSubmit = async () => {
        // Mock submission
        toast.info("Resuming workflow... (Logic pending)");
        // await resumeMutation.mutateAsync({ runId: run.id, notes, file });
        // refetch();
    };

    return (
        <Card className="border-yellow-500/50 bg-yellow-950/20 mb-6">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-yellow-500">Action Required: {request.type || "Manual Step"}</CardTitle>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">HITL Paused</Badge>
                </div>
                <CardDescription className="text-yellow-200/80">
                    The agent has paused for your input.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-sm">
                    <p className="font-semibold text-slate-200 mb-1">Instruction:</p>
                    <p className="text-slate-400">{request.instruction}</p>
                </div>

                <div className="space-y-2">
                    <Label>Analyst Notes</Label>
                    <Textarea
                        placeholder="Enter your findings or notes here..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="bg-slate-900 border-slate-800"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Upload Evidence (Optional)</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="file"
                            className="bg-slate-900 border-slate-800 cursor-pointer"
                        // onChange={e => setFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost">Skip / Cancel</Button>
                <Button onClick={handleSubmit} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    <Play className="w-4 h-4 mr-2" />
                    Submit & Resume
                </Button>
            </CardFooter>
        </Card>
    );
}
