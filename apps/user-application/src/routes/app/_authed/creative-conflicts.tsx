import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { GateBadge } from '@/components/generations/GateBadge';
import { useState, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute('/app/_authed/creative-conflicts')({
  component: CreativeConflictsPage,
});

function CreativeConflictsPage() {
  const queryClient = useQueryClient();
  const { data: conflicts, isLoading, error } = useQuery({
    queryKey: ['creative-conflicts'],
    queryFn: () => (trpc as any).generations.getCreativeConflicts.query(),
  });

  const [rewriteSpokeId, setRewriteSpokeId] = useState<string | null>(null);
  const [rewriteNote, setRewriteNote] = useState('');
  
  // Filters and Sorting
  const [platformFilter, setPlatformFilter] = useState('all');
  const [gateFilter, setGateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { spokeId: string, status: string, note?: string }) => 
      (trpc as any).generations.updateSpokeStatus.mutate(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-conflicts'] });
      toast.success('Status updated successfully');
      setRewriteSpokeId(null);
      setRewriteNote('');
    },
    onError: (err) => {
      toast.error('Failed to update status: ' + err.message);
    }
  });

  // Grouped and Filtered Conflicts
  const { groupedConflicts, platforms } = useMemo(() => {
    if (!conflicts) return { groupedConflicts: {}, platforms: [] };
    
    const availablePlatforms = new Set<string>();
    
    // 1. Filter and Collect Platforms
    const filtered = conflicts.filter((spoke: any) => {
      availablePlatforms.add(spoke.platform);
      
      if (platformFilter !== 'all' && spoke.platform !== platformFilter) return false;
      
      // Gate filtering logic would ideally be done via a join or by including evaluation in the query
      // For now, we'll assume the evaluation is fetched in the card, but if we want to filter here,
      // we'd need to have evaluation data available. 
      // NOTE: This assumes evaluation data is NOT yet attached to the spoke object from the router.
      
      return true;
    });

    // 2. Sort
    filtered.sort((a: any, b: any) => {
      if (sortBy === 'attempts') return b.generation_attempt - a.generation_attempt;
      if (sortBy === 'recent') return (b.created_at || 0) - (a.created_at || 0);
      return 0;
    });

    // 3. Group by Hub Name (for now we just have hubId)
    const groups: Record<string, any[]> = {};
    filtered.forEach((spoke: any) => {
      const groupKey = spoke.hub_id; // In a real app, join with hub_registry for the name
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(spoke);
    });

    return { 
      groupedConflicts: groups, 
      platforms: Array.from(availablePlatforms) 
    };
  }, [conflicts, platformFilter, sortBy]);

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-64 w-full" /></div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="flex flex-col h-full space-y-6 p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creative Conflicts</h1>
          <p className="text-muted-foreground text-lg">
            Manual review for spokes that failed quality assurance.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="platform-filter" className="text-xs font-semibold uppercase text-muted-foreground">Platform</Label>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger id="platform-filter" className="w-[140px] h-9 bg-slate-900 border-slate-800">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map(p => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gate-filter" className="text-xs font-semibold uppercase text-muted-foreground">Gate Failure</Label>
            <Select value={gateFilter} onValueChange={setGateFilter}>
              <SelectTrigger id="gate-filter" className="w-[140px] h-9 bg-slate-900 border-slate-800">
                <SelectValue placeholder="Gate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Failure</SelectItem>
                <SelectItem value="G2">G2 (Hook)</SelectItem>
                <SelectItem value="G4">G4 (Voice)</SelectItem>
                <SelectItem value="G5">G5 (Platform)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sort-by" className="text-xs font-semibold uppercase text-muted-foreground">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-by" className="w-[160px] h-9 bg-slate-900 border-slate-800">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="attempts">Most Attempts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {Object.keys(groupedConflicts).length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-slate-950/20">
            {conflicts?.length === 0 ? "No active creative conflicts. All generated content passed QA." : "No conflicts match your current filters."}
          </div>
        ) : (
          Object.entries(groupedConflicts).map(([hubId, spokes]: [string, any]) => (
            <div key={hubId} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-200">Hub: {hubId}</h2>
                <div className="h-px flex-1 bg-slate-800"></div>
                <Badge variant="outline" className="text-muted-foreground">{spokes.length} Conflicts</Badge>
              </div>
              <div className="grid gap-6">
                {spokes.map((spoke: any) => (
                  <ConflictCard 
                    key={spoke.id} 
                    spoke={spoke} 
                    gateFilter={gateFilter}
                    onApprove={() => updateStatusMutation.mutate({ spokeId: spoke.id, status: 'ready_for_review' })}
                    onDiscard={() => updateStatusMutation.mutate({ spokeId: spoke.id, status: 'discarded' })}
                    onRequestRewrite={() => setRewriteSpokeId(spoke.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!rewriteSpokeId} onOpenChange={() => setRewriteSpokeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Manual Rewrite</DialogTitle>
            <DialogDescription>
              Provide specific instructions for the AI or a human creator to fix this content.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="e.g., The hook is too aggressive. Soften the pattern interrupt and focus more on the benefit..."
            value={rewriteNote}
            onChange={(e) => setRewriteNote(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRewriteSpokeId(null)}>Cancel</Button>
            <Button 
              disabled={!rewriteNote || updateStatusMutation.isPending}
              onClick={() => updateStatusMutation.mutate({ 
                spokeId: rewriteSpokeId!, 
                status: 'pending_manual_rewrite', 
                note: rewriteNote 
              })}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConflictCard({ spoke, onApprove, onDiscard, onRequestRewrite, gateFilter }: any) {
  const { data: evaluation } = useQuery({
    queryKey: ["spoke-evaluation", spoke.id],
    queryFn: () => (trpc as any).generations.getSpokeEvaluation.query({ spokeId: spoke.id }),
  });

  const { data: feedbackLog } = useQuery({
    queryKey: ["spoke-feedback", spoke.id],
    queryFn: () => (trpc as any).generations.getSpokeFeedbackLog.query({ spokeId: spoke.id }),
  });

  // Client-side filtering by gate failure
  if (gateFilter !== 'all' && evaluation) {
    let failed = false;
    if (gateFilter === 'G2' && (evaluation.g2_score || 0) < 80) failed = true;
    if (gateFilter === 'G4' && evaluation.g4_result === 'fail') failed = true;
    if (gateFilter === 'G5' && evaluation.g5_result === 'fail') failed = true;
    
    if (!failed) return null;
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950/30">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize">{spoke.platform}</Badge>
            <Badge variant="destructive">QA Failed ({spoke.generation_attempt} attempts)</Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-2">ID: {spoke.id}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-green-500 hover:text-green-400 hover:bg-green-500/10" onClick={onApprove}>
            Approve Anyway
          </Button>
          <Button size="sm" variant="outline" onClick={onRequestRewrite}>
            Request Rewrite
          </Button>
          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={onDiscard}>
            Discard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 space-y-4">
          <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Content</h4>
          <p className="text-primary-foreground/90 whitespace-pre-wrap text-lg leading-relaxed">
            {spoke.content}
          </p>
        </div>

        <div className="p-6 bg-slate-950/20 border-l border-slate-800 space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Quality Gates</h4>
            {evaluation ? (
              <div className="flex flex-wrap gap-2">
                <GateBadge
                  gate="G2"
                  score={evaluation.g2_score}
                  breakdown={JSON.parse(evaluation.g2_breakdown || '{}')}
                />
                <GateBadge
                  gate="G4"
                  result={evaluation.g4_result}
                  violations={JSON.parse(evaluation.g4_violations || '[]')}
                  cosineSimilarity={evaluation.g4_similarity_score}
                />
                <GateBadge
                  gate="G5"
                  result={evaluation.g5_result}
                  violations={JSON.parse(evaluation.g5_violations || '[]')}
                />
              </div>
            ) : <Skeleton className="h-8 w-full" />}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Feedback History</h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {feedbackLog?.map((log: any) => (
                <div key={log.id} className="p-3 rounded bg-slate-900 border border-slate-800 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">{log.gate_type}</span>
                    <span className="text-[10px] text-slate-500">{new Date(log.created_at * 1000).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300 italic">"{log.suggestions}"</p>
                  {log.violations_json && (
                    <div className="mt-2 text-[11px] text-red-400/80">
                      {JSON.parse(log.violations_json).map((v: string, j: number) => (
                        <div key={j}>• {v}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {(!feedbackLog || feedbackLog.length === 0) && (
                <p className="text-sm text-slate-500 italic">No feedback entries found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
