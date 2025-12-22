import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, CheckCircle2, XCircle, Clock } from "lucide-react"; // Import new icons
import React from "react";
import { Button } from "@/components/ui/button"; // Import Button
import { toast } from "sonner"; // Import toast

export const Route = createFileRoute("/app/_authed/hubs/$hubId")({
  component: HubDetails,
  loader: async ({ context, params }) => {
    // Fetch hub details using tRPC loader
    return context.trpc.hubs.getById.fetch({ hubId: params.hubId });
  },
});

function HubDetails() {
  const { hubId } = Route.useParams();
  const { data: hub, isLoading, error } = Route.useLoaderData(); // Access loader data directly
  const trpcContext = trpc.useContext(); // Get tRPC context for invalidation

  const { data: spokes, isLoading: isLoadingSpokes } = trpc.spokes.listByHubId.useQuery(
    { hubId },
    { enabled: !!hubId } // Only fetch spokes if hubId is available
  );

  const generateSpokesMutation = trpc.spokes.generate.useMutation({
    onSuccess: () => {
      toast.success("Spoke generation initiated!");
      trpcContext.hubs.getById.invalidate({ hubId }); // Invalidate hub data to refetch status
      trpcContext.spokes.listByHubId.invalidate({ hubId }); // Invalidate spokes list
    },
    onError: (err) => {
      toast.error(`Error generating spokes: ${err.message}`);
    },
  });

  const evaluateSpokeMutation = trpc.spokes.evaluate.useMutation({
    onSuccess: () => {
      toast.success("Spoke evaluation initiated!");
      trpcContext.spokes.listByHubId.invalidate({ hubId }); // Invalidate spokes list to show updated status
    },
    onError: (err) => {
      toast.error(`Error evaluating spoke: ${err.message}`);
    },
  });

  const handleGenerateSpokes = () => {
    generateSpokesMutation.mutate({ hubId });
  };

  const handleEvaluateAllSpokes = async () => {
    if (!spokes || spokes.length === 0) {
      toast.info("No spokes to evaluate.");
      return;
    }
    for (const spoke of spokes.filter(s => s.evaluationStatus === 'pending')) {
      await evaluateSpokeMutation.mutateAsync({ spokeId: spoke.id });
    }
  };

  if (isLoading || isLoadingSpokes) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Hub details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error loading hub: {error.message}
      </div>
    );
  }

  if (!hub) {
    return <div className="p-4 text-muted-foreground">Hub not found.</div>;
  }

  const sourceMaterial = hub.sourceMaterial ? JSON.parse(hub.sourceMaterial) : null;
  const extractedThemes = hub.extractedThemes ? JSON.parse(hub.extractedThemes) : null;

  const canGenerateSpokes = hub.status === 'ready';
  const canEvaluateSpokes = hub.status === 'spokes_generated' && (spokes && spokes.some(s => s.evaluationStatus === 'pending'));


  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Hub: {hub.name}</h2>
        <div className="flex gap-2">
          {canGenerateSpokes && (
            <Button
              onClick={handleGenerateSpokes}
              disabled={generateSpokesMutation.isPending}
            >
              {generateSpokesMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Sparkles className="mr-2 h-4 w-4" /> Generate Spokes
            </Button>
          )}
          {canEvaluateSpokes && (
            <Button
              onClick={handleEvaluateAllSpokes}
              disabled={evaluateSpokeMutation.isPending}
              variant="secondary"
            >
              {evaluateSpokeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <CheckCircle2 className="mr-2 h-4 w-4" /> Evaluate All Spokes
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Metadata</h3>
          <p><strong>ID:</strong> {hub.id}</p>
          <p><strong>Account ID:</strong> {hub.accountId}</p>
          <p><strong>Client ID:</strong> {hub.clientId}</p>
          <p><strong>Status:</strong> <span className={`capitalize px-2 py-1 rounded-md text-sm ${
            hub.status === 'ready' ? 'bg-green-500/20 text-green-500' :
            hub.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
            hub.status === 'failed' ? 'bg-red-500/20 text-red-500' :
            hub.status === 'spokes_generated' ? 'bg-purple-500/20 text-purple-500' : // New status color
            'bg-gray-500/20 text-gray-500'
          }`}>{hub.status}</span></p>
          <p><strong>Created At:</strong> {new Date(hub.createdAt).toLocaleString()}</p>
          {hub.updatedAt && <p><strong>Updated At:</strong> {new Date(hub.updatedAt).toLocaleString()}</p>}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Source Material</h3>
          {sourceMaterial ? (
            <>
              <p><strong>Type:</strong> {sourceMaterial.type}</p>
              {sourceMaterial.type === "url" && <p><strong>URL:</strong> <a href={sourceMaterial.content} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{sourceMaterial.content}</a></p>}
              {sourceMaterial.type === "file" && <p><strong>File:</strong> {sourceMaterial.content}</p>}
              {sourceMaterial.type === "text" && <p><strong>Preview:</strong> {sourceMaterial.content.substring(0, 200)}...</p>}
            </>
          ) : (
            <p className="text-muted-foreground">No source material details.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Extracted Themes (Pillars)</h3>
        {extractedThemes && extractedThemes.themes && extractedThemes.themes.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {extractedThemes.themes.map((theme: string, index: number) => (
              <li key={index}>{theme}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No themes extracted or configured yet.</p>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Generated Spokes</h3>
        {spokes && spokes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spokes.map((spoke) => (
              <div key={spoke.id} className="border p-4 rounded-md space-y-2">
                <p className="font-semibold">{spoke.platform}</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{spoke.content}</p>
                <p className="text-xs flex items-center gap-1">
                  <strong>Status:</strong>
                  <span className={`capitalize px-1 py-0.5 rounded-md text-xs ${
                    spoke.status === 'generated' ? 'bg-blue-500/20 text-blue-500' :
                    spoke.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                    spoke.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>{spoke.status}</span>
                </p>
                <p className="text-xs flex items-center gap-1">
                  <strong>Evaluation:</strong>
                  {spoke.evaluationStatus === 'pending' && <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-1 py-0.5 rounded-md"><Clock className="h-3 w-3" /> Pending</span>}
                  {spoke.evaluationStatus === 'passed' && <span className="flex items-center gap-1 bg-green-500/20 text-green-500 px-1 py-0.5 rounded-md"><CheckCircle2 className="h-3 w-3" /> Passed</span>}
                  {spoke.evaluationStatus === 'failed' && <span className="flex items-center gap-1 bg-red-500/20 text-red-500 px-1 py-0.5 rounded-md"><XCircle className="h-3 w-3" /> Failed</span>}
                  {spoke.evaluationStatus === 'evaluated' && <span className="flex items-center gap-1 bg-blue-500/20 text-blue-500 px-1 py-0.5 rounded-md"><CheckCircle2 className="h-3 w-3" /> Evaluated</span>}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No spokes generated yet.</p>
        )}
      </div>
    </div>
  );
}