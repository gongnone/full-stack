import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/app/_authed/projects/$projectId/research')({
    component: ResearchTab,
})

function ResearchTab() {
    // const { projectId } = Route.useParams();
    const { projectId } = Route.useParams();
    const [isLoading, setIsLoading] = useState(false);

    const { data: rawResearch, refetch } = useQuery((trpc.marketResearch as any).getResearch.queryOptions({ projectId }));
    const research = rawResearch as any;

    const startResearch = useMutation({
        ...trpc.projects.startResearch.mutationOptions(),
        onSuccess: (data: any) => {
            if (!data.success) {
                console.error("Research failed:", data);
                toast.error(data.error || "Unknown error occurred");
                return;
            }
            toast.success("Research started! This may take a few minutes.");
            // Poll or refetch
            refetch();
        },
        onError: (err: any) => {
            toast.error("Network error: " + err.message);
        }
    });

    const handleResearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const keywords = (document.getElementById('keywords') as HTMLInputElement).value;
        const industry = (document.getElementById('industry') as HTMLInputElement).value;
        const targetAudience = (document.getElementById('targetAudience') as HTMLInputElement).value;
        const productDescription = (document.getElementById('productDescription') as HTMLInputElement).value;

        try {
            await startResearch.mutateAsync({
                projectId,
                keywords,
                industry,
                targetAudience,
                productDescription
            });
        } catch (e) {
            // handled in onError
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Halo Research Configuration</CardTitle>
                    <CardDescription>Define the inputs for your market research.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResearch} className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="industry">Industry / Niche</Label>
                            <Input id="industry" placeholder="e.g. SaaS Marketing" defaultValue="SaaS Marketing" />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="targetAudience">Target Audience</Label>
                            <Input id="targetAudience" placeholder="e.g. Agency Owners, Busy Moms" defaultValue="Agency Owners" />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="productDescription">Product Concept</Label>
                            <Input id="productDescription" placeholder="e.g. AI-powered email writing tool" defaultValue="AI Copywriting Tool" />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="keywords">Keywords (comma separated)</Label>
                            <Input id="keywords" placeholder="e.g. churn reduction, customer success" defaultValue="AI Marketing, Automation" />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Running Research..." : "Start Research"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {research && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Empty State Check */}
                    {(!research.desires || research.desires.length === 0) && (!research.painPoints || research.painPoints.length === 0) ? (
                        <div className="md:col-span-2 p-8 border border-dashed border-slate-700 rounded-xl bg-slate-900/30 text-center space-y-4">
                            <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-200">No Insights Found</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                The research workflow completed but couldn't extract enough high-quality data.
                                This usually happens if the keywords are too niche or if the scrapers were blocked.
                            </p>
                            <Button variant="outline" onClick={() => refetch()}>Refresh Data</Button>
                        </div>
                    ) : (
                        <Card className="md:col-span-2 bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <CardTitle>Dream Buyer Avatar: "{research.topic || "Target Audience"}"</CardTitle>
                                <CardDescription>Based on analysis of 150+ discussions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {research.desires && research.desires.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-primary">Hopes & Dreams</h4>
                                        <ul className="list-disc ml-5 text-sm text-muted-foreground mt-1">
                                            {research.desires.map((item: string, idx: number) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {research.painPoints && research.painPoints.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-red-400">Pains & Fears</h4>
                                        <ul className="list-disc ml-5 text-sm text-muted-foreground mt-1">
                                            {research.painPoints.map((item: string, idx: number) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {research.competitors && research.competitors.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-blue-400">Competitors Identified</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {research.competitors.map((item: string, idx: number) => (
                                                <span key={idx} className="bg-slate-800 text-xs px-2 py-1 rounded-full border border-slate-700">{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
