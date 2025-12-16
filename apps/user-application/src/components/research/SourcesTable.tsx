
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Note: ScrollArea was BANNED in prompt, but dialog content usually needs scrolling. 
// I will use native div with overflow-y-auto instead as per invalidation instruction "Banned: ScrollArea (Use native div with Tailwind instead)".

interface Source {
    id: string;
    sourceType: string;
    sourceUrl: string | null;
    sophisticationClass: string | null;
    sophisticationScore: number | null;
    snippet: string;
    fullContent: string;
}

import { trpc } from "@/lib/trpc";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SourcesTableProps {
    sources: Source[];
    projectId: string;
}

export function SourcesTable({ sources, projectId }: SourcesTableProps) {
    const queryClient = useQueryClient();

    // Optimistic UI for Exclusion
    const excludeMutation = useMutation({
        ...trpc.marketResearch.excludeSource.mutationOptions(),
        onMutate: async (newExclusion: { sourceId: string; isExcluded: boolean }) => {
            const queryKey = trpc.marketResearch.getResearch.queryKey({ projectId });

            // 1. Cancel ongoing refetches
            await queryClient.cancelQueries({ queryKey });

            // 2. Snapshot previous value
            const previousResearch = queryClient.getQueryData(queryKey);

            // 3. Optimistically update to remove the source from the list
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;
                // Explicitly cast or handle structure safely
                const current = old as { sources: Source[] };
                return {
                    ...current,
                    sources: current.sources?.filter((s) => s.id !== newExclusion.sourceId) || []
                };
            });

            // 4. Return context
            return { previousResearch };
        },
        onError: (_err: any, _newExclusion: any, context: any) => {
            const queryKey = trpc.marketResearch.getResearch.queryKey({ projectId });
            // 5. Rollback on error
            if (context?.previousResearch) {
                queryClient.setQueryData(queryKey, context.previousResearch);
            }
            toast.error("Failed to exclude source");
        },
        onSettled: () => {
            const queryKey = trpc.marketResearch.getResearch.queryKey({ projectId });
            // 6. Refetch to sync
            queryClient.invalidateQueries({ queryKey });
        },
        onSuccess: () => {
            toast.success("Source excluded from analysis.");
        }
    });

    if (sources.length === 0) {
        return (
            <Card className="border-dashed border-slate-700 bg-slate-900/20">
                <CardContent className="h-48 flex flex-col items-center justify-center text-slate-500">
                    <p className="font-mono text-sm">No sources intercepted yet.</p>
                    <p className="text-xs">Agent is scanning the perimeter...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span>📡 Intelligence Sources</span>
                    <Badge variant="outline" className="ml-2 font-mono text-xs">
                        {sources.length} Verified
                    </Badge>
                </CardTitle>
                <CardDescription>Raw market signals intercepted and analyzed for trace-back.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-slate-800">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Type</TableHead>
                                <TableHead>Snippet / Context</TableHead>
                                <TableHead className="w-[100px]">Class</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sources.map((source) => (
                                <TableRow key={source.id} className="group">
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                                            {source.sourceType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[300px] truncate text-xs text-slate-400 font-mono">
                                            {source.snippet || "No preview available..."}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {source.sophisticationClass && (
                                            <Badge
                                                className={`
                                                    ${source.sophisticationClass === 'A' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : ''}
                                                    ${source.sophisticationClass === 'B' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : ''}
                                                    ${source.sophisticationClass === 'C' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : ''}
                                                `}
                                            >
                                                Class {source.sophisticationClass}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                                        View Text
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl bg-slate-950 border-slate-800">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center justify-between">
                                                            <span>Raw Signal Content</span>
                                                            {source.sourceUrl && (
                                                                <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mr-8">
                                                                    Open Original Link ↗
                                                                </a>
                                                            )}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Captured from {source.sourceType} | Logic Score: {source.sophisticationScore?.toFixed(2)}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="mt-4 h-[400px] w-full overflow-y-auto rounded-md bg-slate-900 p-4 border border-slate-800">
                                                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                                                            {source.fullContent || "(No content content captured)"}
                                                        </pre>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-slate-500 hover:text-red-400 hover:bg-red-900/10"
                                                onClick={() => excludeMutation.mutate({ sourceId: source.id, isExcluded: true })}
                                                disabled={excludeMutation.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
