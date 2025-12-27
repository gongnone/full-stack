import { Progress } from './progress';
import { Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

export function GenerationProgress({ hubId }: { hubId: string }) {
    const { data: run, isLoading } = useQuery({
        queryKey: ['generation-progress', hubId],
        queryFn: () => (trpc as any).generations.getWorkflowProgress.query({ hubId }),
        refetchInterval: (query) => {
            const data = query.state.data as any;
            return data?.status === 'running' ? 2000 : false;
        }
    });

    if (isLoading || !run || run.status === 'complete' || run.status === 'idle') return null;

    const isFailed = run.status === 'failed';

    return (
        <div className={`p-6 rounded-lg border mb-6 ${isFailed ? 'bg-red-500/10 border-red-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    {isFailed ? <AlertCircle className="h-5 w-5 text-red-500" /> : <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                    <h3 className="text-lg font-semibold text-primary-foreground">
                        {isFailed ? 'Generation Failed' : 'Generating Spokes...'}
                    </h3>
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                    {run.progress}%
                </span>
            </div>
            
            <Progress value={run.progress} className="w-full h-3" />
            
            <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary-foreground/80">Current:</span> {run.current_step || 'Initializing...'}
                </p>
                {isFailed && (
                    <p className="text-xs text-red-400 font-mono">{run.errorMessage}</p>
                )}
            </div>
        </div>
    );
}