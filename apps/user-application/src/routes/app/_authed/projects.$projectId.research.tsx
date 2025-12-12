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
import { useMutation } from '@tanstack/react-query';

export const Route = createFileRoute('/app/_authed/projects/$projectId/research')({
    component: ResearchTab,
})

function ResearchTab() {
    // const { projectId } = Route.useParams();
    const { projectId } = Route.useParams(); // Get real ID
    const [isLoading, setIsLoading] = useState(false);
    const [hasResults, setHasResults] = useState(false); // Mock state for now, ideally fetch status

    // In real app, we would fetch current project state to see if research is done.

    const startResearch = useMutation({
        ...trpc.projects.startResearch.mutationOptions(),
        onSuccess: (data: any) => {
            if (!data.success) {
                console.error("Research failed:", data);
                toast.error(data.error || "Unknown error occurred");
                return;
            }
            toast.success("Research started! This may take a few minutes.");
            setHasResults(true); // Optimistic update
        },
        onError: (err: any) => {
            toast.error("Network error: " + err.message);
        }
    });

    const handleResearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const keywords = (document.getElementById('keywords') as HTMLInputElement).value;

        try {
            await startResearch.mutateAsync({
                projectId,
                keywords
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

            {hasResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="md:col-span-2 bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle>Dream Buyer Avatar: "The Growth Stressed Founder"</CardTitle>
                            <CardDescription>Based on analysis of 150+ discussions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-primary">Hopes & Dreams</h4>
                                <ul className="list-disc ml-5 text-sm text-muted-foreground mt-1">
                                    <li>Automate repetitive marketing tasks to save 20h/week.</li>
                                    <li>Scale to $100k MRR without hiring more agencies.</li>
                                    <li>Be seen as a market leader in innovation.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-400">Pains & Fears</h4>
                                <ul className="list-disc ml-5 text-sm text-muted-foreground mt-1">
                                    <li>Fear of being left behind by AI competitors.</li>
                                    <li>Frustration with complex tools that require a PhD to use.</li>
                                    <li>Wasting budget on ad spend that doesn't convert.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
