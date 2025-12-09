import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Type } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/router";
import { toast } from "sonner";

export const Route = createFileRoute("/app/_authed/projects/new")({
    component: RouteComponent,
});

function RouteComponent() {
    const [name, setName] = useState("");
    const [topic, setTopic] = useState("");
    const nav = useNavigate();

    const createMutation = useMutation(
        trpc.marketResearch.createProject.mutationOptions({
            onSuccess: ({ projectId }) => {
                toast.success("Campaign created!");
                // Redirect to the project dashboard (to be created)
                nav({
                    to: "/app/projects/$projectId",
                    params: {
                        projectId,
                    },
                });
            },
            onError: () => {
                toast.error("Failed to create campaign");
            },
        }),
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted to-muted/50 p-6">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Main Form */}
                <Card className="shadow-xl">
                    <CardHeader className="pb-8">
                        <CardTitle className="text-2xl font-semibold">
                            Create New Campaign
                        </CardTitle>
                        <CardDescription className="text-base">
                            Start by defining your campaign and the niche you want to target.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Project Name */}
                        <div className="space-y-3">
                            <Label
                                htmlFor="name"
                                className="text-sm font-medium flex items-center gap-2"
                            >
                                <Type className="w-4 h-4" />
                                Campaign Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. Q4 Fitness Promo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 text-base"
                            />
                        </div>

                        {/* Topic/Niche Input */}
                        <div className="space-y-3">
                            <Label htmlFor="topic" className="text-sm font-medium flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Niche / Topic
                            </Label>
                            <Input
                                id="topic"
                                placeholder="e.g. Sustainable Fashion for Gen Z"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="h-12 text-base"
                            />
                            <p className="text-sm text-muted-foreground">
                                We'll use this to generate initial market research and audience insights.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <Button
                                onClick={() => {
                                    createMutation.mutate({
                                        name,
                                        topic,
                                    });
                                }}
                                disabled={!name || !topic || createMutation.isPending}
                                className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {createMutation.isPending ? (
                                    "Analyzing Market..."
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Launch Campaign
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
