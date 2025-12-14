import { createFileRoute } from '@tanstack/react-router';
import { type FormEvent } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Search, Brain, CheckCircle2, AlertCircle, Sparkles, Zap, Shield } from 'lucide-react';

// SAFE IMPORTS ONLY
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SourcesTable } from '@/components/research/SourcesTable';

export const Route = createFileRoute('/app/_authed/projects/$projectId/research')({
    component: ResearchTab,
});

function ResearchTab() {
    const { projectId } = Route.useParams();
    const queryClient = useQueryClient();

    // 1. ROBUST QUERY: Polls every 3s if processing
    const { data: rawResearch, isLoading, isRefetching } = useQuery({
        ...trpc.marketResearch.getResearch.queryOptions({ projectId }),
        refetchInterval: (query) => {
            const data = query.state.data as any;
            return (data?.status === 'processing' || data?.status === 'running') ? 3000 : false;
        },
    });

    const research = rawResearch as any;

    const status = research?.status || 'idle';
    const isProcessing = status === 'processing' || status === 'running';
    // Check results by looking for content
    const hasAvatar = !!research?.avatar?.name;
    const hasSources = (research?.sources?.length || 0) > 0;
    const hasResults = status === 'complete' || (hasAvatar && hasSources);

    const launchMutation = useMutation({
        ...trpc.projects.startResearch.mutationOptions(),
        onSuccess: () => toast.success("Agent dispatched! Analyzing market signal..."),
        onError: (err) => toast.error("Launch failed: " + err.message)
    });

    const handleLaunch = async (e: FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const keywordsInput = form.elements.namedItem('keywords') as HTMLInputElement;
        const identityInput = form.elements.namedItem('identity') as HTMLInputElement;
        const struggleInput = form.elements.namedItem('struggle') as HTMLInputElement;
        const outcomeInput = form.elements.namedItem('outcome') as HTMLInputElement;

        const keywords = keywordsInput?.value || "";
        const identity = identityInput?.value || "";
        const struggle = struggleInput?.value || "";
        const outcome = outcomeInput?.value || "";

        if (!keywords.trim()) {
            toast.error("Please enter a topic or niche.");
            return;
        }

        const targetAudience = `${identity} facing ${struggle}`;
        const productDescription = `Helping them achieve ${outcome}`;

        try {
            await launchMutation.mutateAsync({
                projectId,
                keywords: keywords,
                industry: keywords, // Use keywords as industry/niche
                targetAudience: targetAudience,
                productDescription: productDescription
            });
            toast.success("Agent Deployed", { description: "Halo is now scanning the perimeter." });
            // FORCE REFRESH: Invalidate query to trigger refetch and show processing state immediately
            await queryClient.invalidateQueries({
                queryKey: trpc.marketResearch.getResearch.queryKey({ projectId })
            });
        } catch (error) {
            toast.error("Deployment Failed", { description: "Could not launch agent." });
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">

            {/* CONFIGURATION / MISSION CONTROL */}
            <Card className={hasResults ? "border-l-4 border-l-green-500" : "border-l-4 border-l-blue-500"}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Mission Parameters</CardTitle>
                            <CardDescription>Target market specification for the Halo Agent.</CardDescription>
                        </div>
                        {hasResults && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Research Complete
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleLaunch} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 1. Niche / Keywords */}
                            <div className="space-y-2">
                                <Label htmlFor="keywords">Target Niche / Keywords</Label>
                                <Input
                                    id="keywords"
                                    name="keywords"
                                    placeholder="e.g. SaaS for Crossfit Gyms"
                                    disabled={isProcessing || hasResults}
                                    defaultValue={research?.topic || ""}
                                    className="bg-background/50"
                                />
                                <p className="text-xs text-muted-foreground">The broad market category to scan.</p>
                            </div>

                            {/* 2. Target Identity */}
                            <div className="space-y-2">
                                <Label htmlFor="identity">Target Identity (Who)</Label>
                                <Input
                                    id="identity"
                                    name="identity"
                                    placeholder="e.g. Frustrated Agency Owner"
                                    disabled={isProcessing || hasResults}
                                    defaultValue={research?.avatar?.name || ""}
                                    className="bg-background/50"
                                />
                                <p className="text-xs text-muted-foreground">The specific persona you want to reach.</p>
                            </div>

                            {/* 3. Current Struggle (Hell) */}
                            <div className="space-y-2">
                                <Label htmlFor="struggle">Current Struggle (Hell)</Label>
                                <Input
                                    id="struggle"
                                    name="struggle"
                                    placeholder="e.g. Working 80hrs, inconsistent leads"
                                    disabled={isProcessing || hasResults}
                                    className="bg-background/50"
                                />
                                <p className="text-xs text-muted-foreground">Their painful current reality.</p>
                            </div>

                            {/* 4. Desired Outcome (Heaven) */}
                            <div className="space-y-2">
                                <Label htmlFor="outcome">Desired Outcome (Heaven)</Label>
                                <Input
                                    id="outcome"
                                    name="outcome"
                                    placeholder="e.g. Productized service, 20hr week"
                                    disabled={isProcessing || hasResults}
                                    className="bg-background/50"
                                />
                                <p className="text-xs text-muted-foreground">The dream state they crave.</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            {!hasResults && (
                                <Button type="submit" disabled={isProcessing || launchMutation.isPending} className="w-full md:w-auto">
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2">Processing...</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Launch Research Agent</span>
                                    )}
                                </Button>
                            )}

                            {hasResults && (
                                <Button variant="outline" type="button" onClick={() => window.location.reload()}>
                                    New Mission
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Native Tailwind Progress */}
                    {isProcessing && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 pt-2">
                            <div className="flex justify-between text-xs text-muted-foreground font-mono">
                                <span className="flex items-center"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> INTERCEPTING SIGNALS</span>
                                <span>{isRefetching ? "SYNCING..." : "LIVE"}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-[45%] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* RESULTS RENDERING */}
            {isLoading && !research ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : null}

            {hasResults && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* 1. DREAM BUYER IDENTITY (Psychographics) */}
                    <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white border-slate-700 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Brain className="w-32 h-32" />
                        </div>
                        <CardHeader>
                            <Badge className="w-fit mb-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/50">
                                Psychological Profile
                            </Badge>
                            <CardTitle className="text-3xl font-bold tracking-tight">
                                {research?.avatar?.name || "The Unnamed Avatar"}
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Derived from {research?.sources?.length || 0} verified data points.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-10 relative z-10">
                            {/* Desires */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-emerald-400 flex items-center gap-2 uppercase tracking-wider text-xs">
                                    <Sparkles className="w-4 h-4" /> Core Desires
                                </h4>
                                <ul className="space-y-3">
                                    {research?.desires?.slice(0, 5).map((desire: string, i: number) => (
                                        <li key={i} className="text-slate-300 text-sm leading-relaxed border-l-2 border-emerald-500/30 pl-3 py-1">
                                            "{desire}"
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Pains */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-rose-400 flex items-center gap-2 uppercase tracking-wider text-xs">
                                    <AlertCircle className="w-4 h-4" /> Pains & Fears
                                </h4>
                                <ul className="space-y-3">
                                    {research?.painPoints?.slice(0, 5).map((pain: string, i: number) => (
                                        <li key={i} className="text-slate-300 text-sm leading-relaxed border-l-2 border-rose-500/30 pl-3 py-1">
                                            "{pain}"
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. GOLD NUGGETS & QUANTUM GROWTH (Unexpected Insights) */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-amber-500/20 bg-amber-500/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-500">
                                    <Zap className="w-5 h-5 fill-current" /> Gold Nuggets
                                </CardTitle>
                                <CardDescription>Unexpected insights that invalidate common assumptions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {(research?.unexpectedInsights || []).length > 0 ? (
                                        research.unexpectedInsights.map((insight: string, i: number) => (
                                            <li key={i} className="text-sm text-slate-700 bg-white p-3 rounded-md shadow-sm border border-amber-100">
                                                {insight}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm italic text-muted-foreground">No unexpected anomalies detected.</p>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-indigo-500/20 bg-indigo-500/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-500">
                                    <Shield className="w-5 h-5" /> Barriers & Uncertainties
                                </CardTitle>
                                <CardDescription>Psychological resistance points preventing conversion.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {(research?.barriers || []).length > 0 ? (
                                        research.barriers.map((barrier: string, i: number) => (
                                            <li key={i} className="text-sm text-slate-700 bg-white p-3 rounded-md shadow-sm border border-indigo-100">
                                                {barrier}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm italic text-muted-foreground">No barriers identified.</p>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 3. TRACEABILITY / PROOF OF WORK */}
                    <SourcesTable sources={research?.sources || []} projectId={projectId} />

                </div>
            )}
        </div>
    );
}
