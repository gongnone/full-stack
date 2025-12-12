import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Gift,
    Megaphone,
    Lightbulb,
    ArrowLeft,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2,
} from "lucide-react";

export const Route = createFileRoute("/app/_authed/projects/$projectId")({
    component: RouteComponent,
});

const WORKFLOW_STEPS = [
    {
        id: "market_research",
        title: "Market Research",
        description: "AI-powered analysis of your niche, competitors, and target audience",
        icon: Search,
        dataKey: "marketResearch" as const,
    },
    {
        id: "offer_creation",
        title: "Offer Creation",
        description: "Generate irresistible Godfather Offers with the 7 pillars",
        icon: Gift,
        dataKey: "offer" as const,
    },
    {
        id: "brand_pillars",
        title: "Brand Pillars",
        description: "Define your voice, tone, and messaging pillars",
        icon: Megaphone,
        dataKey: "brandPillars" as const,
    },
    {
        id: "content_ideas",
        title: "Content Ideas",
        description: "AI-generated content ideas aligned with your strategy",
        icon: Lightbulb,
        dataKey: "contentIdeas" as const,
    },
];

function RouteComponent() {
    const { projectId } = Route.useParams();

    const { data: project, isLoading: projectLoading } = useQuery(
        trpc.marketResearch.getProject.queryOptions({ projectId })
    );

    const { data: research } = useQuery(
        trpc.marketResearch.getResearch.queryOptions({ projectId })
    );

    if (projectLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6">
                <p className="text-destructive">Project not found</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link to="/app/projects">Back to Projects</Link>
                </Button>
            </div>
        );
    }

    const getStepStatus = (dataKey: string) => {
        switch (dataKey) {
            case "marketResearch":
                return research ? "complete" : "pending";
            // Add more cases as you wire up other data
            default:
                return "pending";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "complete":
                return (
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                    </Badge>
                );
            case "processing":
                return (
                    <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/50 animate-pulse">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Processing
                    </Badge>
                );
            case "error":
                return (
                    <Badge className="bg-red-500/20 text-red-600 border-red-500/50">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Error
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                );
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon">
                    <Link to="/app/projects">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{project.name}</h1>
                    <p className="text-muted-foreground">Campaign Dashboard</p>
                </div>
                <Badge variant="outline" className="ml-auto capitalize">
                    {project.status}
                </Badge>
            </div>

            {/* Workflow Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {WORKFLOW_STEPS.map((step) => {
                    const status = getStepStatus(step.dataKey);
                    const Icon = step.icon;

                    return (
                        <Card
                            key={step.id}
                            className={`transition-all hover:shadow-md ${status === "complete"
                                ? "border-green-500/30 bg-green-500/5"
                                : ""
                                }`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    {getStatusBadge(status)}
                                </div>
                                <CardTitle className="text-lg mt-2">{step.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{step.description}</CardDescription>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Market Research Results (if available) */}
            {research && (
                <Card>
                    <CardHeader>
                        <CardTitle>Market Research Results</CardTitle>
                        <CardDescription>Topic: {research.topic}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {research.competitors && research.competitors.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2">Competitors</h4>
                                <div className="flex flex-wrap gap-2">
                                    {research.competitors.map((c: string, i: number) => (
                                        <Badge key={i} variant="secondary">{c}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {research.painPoints && research.painPoints.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2">Pain Points</h4>
                                <ul className="list-disc list-inside text-muted-foreground">
                                    {research.painPoints.map((p: string, i: number) => (
                                        <li key={i}>{p}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {research.desires && research.desires.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2">Desires</h4>
                                <ul className="list-disc list-inside text-muted-foreground">
                                    {research.desires.map((d: string, i: number) => (
                                        <li key={i}>{d}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
