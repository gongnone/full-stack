import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Zap, AlertTriangle, Flame, Clock, Play, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ExportModal } from '@/components/common/ExportModal';

export const Route = createFileRoute('/app/_authed/review' as any)({
  component: ReviewPage,
});

function ReviewPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clientId = 'temp-client-id'; // TODO: Get from auth context (Rule 1: Isolation)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const { data: buckets, isLoading } = useQuery({
    ...trpc.generations.getReviewBuckets.queryOptions({ clientId }),
  });

  const bulkMutation = useMutation({
    ...trpc.generations.bulkUpdateStatus.mutationOptions(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: trpc.generations.getReviewBuckets.queryKey({ clientId }) });
      toast.success(`${variables.spokeIds.length} spokes ${variables.status === 'ready' ? 'approved' : 'killed'}`, {
        description: variables.status === 'ready' ? 'Nuclear approval complete.' : 'Nuclear kill complete.',
        action: {
          label: 'Undo',
          onClick: () => {
            // Revert status
            bulkMutation.mutate({ 
              spokeIds: variables.spokeIds, 
              status: variables.status === 'ready' ? 'ready_for_review' : 'ready_for_review',
              clientId 
            });
          }
        }
      });
    }
  });

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘+H: High Confidence Sprint
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        (navigate as any)({ to: '/app/sprint', search: { bucket: 'high_confidence' } });
      }
      
      // ⌘+A: Nuclear Approve (G7 > 9.5)
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        if (buckets?.highConfidence) {
          const ultraHigh = (buckets.highConfidence as any[]).filter((s: any) => s.g7_score > 9.5);
          if (ultraHigh.length > 0) {
            bulkMutation.mutate({ spokeIds: ultraHigh.map((s: any) => s.id), status: 'ready', clientId });
          } else {
            toast.info("No ultra-high confidence content (G7 > 9.5) to nuclear approve.");
          }
        }
      }

      // ⌘+Shift+K: Nuclear Kill (G7 < 5.0)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        const allSpokes = [
          ...(buckets?.highConfidence || []),
          ...(buckets?.needsReview || []),
          ...(buckets?.recent || [])
        ];
        const lowQuality = (allSpokes as any[]).filter((s: any) => s.g7_score < 5.0);
        if (lowQuality.length > 0) {
          bulkMutation.mutate({ spokeIds: lowQuality.map((s: any) => s.id), status: 'discarded', clientId });
        } else {
          toast.info("No low quality content (G7 < 5.0) to nuclear kill.");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buckets, navigate, bulkMutation, clientId]);

  if (isLoading) return <ReviewSkeleton />;

  return (
    <div className="flex flex-col h-full space-y-8 p-8 max-w-7xl mx-auto bg-background text-foreground">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">Production Queue</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Review and approve generated content at scale.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="border-border text-foreground hover:bg-info/10 hover:border-info gap-2"
          onClick={() => setIsExportModalOpen(true)}
        >
          <Download className="h-4 w-4" />
          Export Approved
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BucketCard 
          title="High Confidence" 
          description="G7 > 9.0 • Ready for review"
          count={buckets?.highConfidence?.length || 0}
          color="border-success/30 hover:border-success shadow-success/5"
          icon={<Zap className="text-success h-5 w-5" />}
          onStart={() => (navigate as any)({ to: '/app/sprint', search: { bucket: 'high_confidence' } })}
        />
        
        <BucketCard 
          title="Needs Review" 
          description="G7 5.0-9.0 • Mixed signals"
          count={buckets?.needsReview?.length || 0}
          color="border-warning/30 hover:border-warning shadow-warning/5"
          icon={<AlertTriangle className="text-warning h-5 w-5" />}
          onStart={() => (navigate as any)({ to: '/app/sprint', search: { bucket: 'needs_review' } })}
        />

        <BucketCard 
          title="Creative Conflicts" 
          description="Failed 3x AI Healing"
          count={buckets?.conflicts?.length || 0}
          color="border-destructive/30 hover:border-destructive shadow-destructive/5"
          icon={<Flame className="text-destructive h-5 w-5" />}
          onStart={() => (navigate as any)({ to: '/app/creative-conflicts' })}
        />

        <BucketCard 
          title="Just Generated" 
          description="Recently created content"
          count={buckets?.recent?.length || 0}
          color="border-info/30 hover:border-info shadow-info/5"
          icon={<Clock className="text-info h-5 w-5" />}
          onStart={() => (navigate as any)({ to: '/app/sprint', search: { bucket: 'recent' } })}
        />
      </div>

      <div className="mt-12 bg-card/20 border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4 text-foreground">Keyboard Controls</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2"><Badge variant="outline" className="border-border">⌘+H</Badge> <span className="text-muted-foreground">High Confidence Sprint</span></div>
          <div className="flex items-center gap-2"><Badge variant="outline" className="border-border">⌘+A</Badge> <span className="text-muted-foreground">Nuclear Approve (G7 &gt; 9.5)</span></div>
          <div className="flex items-center gap-2"><Badge variant="outline" className="border-border">⌘+⇧+K</Badge> <span className="text-muted-foreground">Nuclear Kill (G7 &lt; 5.0)</span></div>
          <div className="flex items-center gap-2"><Badge variant="outline" className="border-border">?</Badge> <span className="text-muted-foreground">Toggle Critic Panel</span></div>
        </div>
      </div>

      <ExportModal 
        isOpen={isExportModalOpen} 
        onOpenChange={setIsExportModalOpen} 
        clientId={clientId} 
      />
    </div>
  );
}

function BucketCard({ title, description, count, color, icon, onStart }: any) {
  return (
    <Card className={`bg-card/40 border-2 transition-all duration-300 group cursor-default ${color}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-background rounded-lg group-hover:scale-110 transition-transform duration-300 border border-border">
            {icon}
          </div>
          <Badge variant="secondary" className="text-lg font-bold px-3 bg-secondary text-secondary-foreground">{count}</Badge>
        </div>
        <CardTitle className="mt-4 text-xl tracking-tight text-foreground">{title}</CardTitle>
        <CardDescription className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-4">
        <Button 
          className="w-full gap-2 border-border text-foreground hover:bg-accent/10" 
          variant="outline" 
          onClick={onStart} 
          disabled={count === 0}
        >
          <Play className="h-4 w-4 fill-current" />
          Start Sprint
        </Button>
      </CardFooter>
    </Card>
  );
}

function ReviewSkeleton() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <Skeleton className="h-12 w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
      </div>
    </div>
  );
}
