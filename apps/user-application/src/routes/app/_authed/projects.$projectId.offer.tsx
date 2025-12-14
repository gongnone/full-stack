import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { CitationCard } from '@/components/generations/CitationCard';
import { useMutation, useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/app/_authed/projects/$projectId/offer')({
    component: OfferTab,
})

function OfferTab() {
    const { projectId } = Route.useParams();
    const [isGenerating, setIsGenerating] = useState(false);

    // Poll for results
    const { data: rawOffer } = useQuery({
        ...(trpc.generations as any).getGodfatherOffer.queryOptions({ projectId }),
        refetchInterval: (data: any) => data ? false : 3000
    });
    const offer = rawOffer as any;

    const { data: rawGenerations } = useQuery({
        ...(trpc.generations as any).getGenerations.queryOptions({ projectId }),
    });
    const generations = rawGenerations as any;

    const startGeneration = useMutation({
        ...(trpc.generations as any).startOfferWorkflow.mutationOptions(),
        onSuccess: (data: any) => {
            if (data.success) {
                setIsGenerating(true);
                // Simple timeout to stop 'generating' spinner locally, actual polling handles data
                setTimeout(() => setIsGenerating(false), 5000);
            } else {
                // handle error
            }
        }
    });

    const handleGenerate = () => {
        setIsGenerating(true);
        startGeneration.mutate({ projectId } as any);
    };

    return (
        <div className="space-y-6">
            {!offer && (
                <div className="text-center py-12 border rounded-lg bg-stone-900/10 border-dashed">
                    <h3 className="text-lg font-medium mb-2">Ready to Synthesize?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Based on the Research and Competitor inputs, we will generate a high-converting "Godfather Offer".
                    </p>
                    <Button size="lg" onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        {isGenerating ? "Synthesizing Strategy..." : "Generate Godfather Offer"}
                    </Button>
                </div>
            )}

            {offer && (
                <div className="grid gap-8">
                    {/* MAIN OFFER CARD */}
                    <Card className="border-primary/50 shadow-lg shadow-primary/10">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl text-primary">{offer.headline || "Generated Offer"}</CardTitle>
                                    <CardDescription>Proposed Flagship Offer</CardDescription>
                                </div>
                                <div className="text-center">
                                    <span className="text-3xl font-bold p-2 block">{offer.score || "N/A"}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Score</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-2">The Promise</h4>
                                <p className="text-lg italic text-muted-foreground">"{offer.bigPromise}"</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Power Guarantee</h4>
                                <ul className="list-disc ml-5">
                                    {offer.guarantees && (offer.guarantees as string[]).map((g: string, i: number) => (
                                        <li key={i}>{g}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">The Mechanism</h4>
                                <p className="text-sm text-muted-foreground">{offer.mechanism}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">Export Offer PDF</Button>
                        </CardFooter>
                    </Card>

                    {/* DATA LINEAGE / GENERATED CONTENT */}
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-xl font-semibold">Supporting Content Ideas</h3>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider border px-2 py-0.5 rounded-full">Proof of Work</span>
                        </div>

                        {(generations || []).length > 0 ? (
                            generations?.map((gen: any) => (
                                <CitationCard
                                    key={gen.id}
                                    content={gen.content}
                                    source={gen.source ? {
                                        name: gen.source.type || "Market Data",
                                        snippet: gen.source.content || "",
                                        sophistication: gen.source.sophistication
                                    } : null}
                                />
                            ))
                        ) : (
                            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                                <p>No granular content ideas generated yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
