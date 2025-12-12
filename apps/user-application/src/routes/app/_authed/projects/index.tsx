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
import { Plus, FolderOpen, Loader2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// NOTE: Trailing slash is important for index route match
export const Route = createFileRoute("/app/_authed/projects/")({
    component: ProjectsListPage,
});

function ProjectsListPage() {
    const { data: projects, isLoading, error } = useQuery(
        trpc.marketResearch.getAll.queryOptions()
    );

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardContent className="flex items-center gap-3 py-4">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <div>
                            <p className="font-medium text-destructive">Failed to load campaigns</p>
                            <p className="text-sm text-muted-foreground">{error.message}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your marketing campaigns and research projects.
                    </p>
                </div>
                <Button asChild>
                    <Link to="/app/projects/new">
                        <Plus className="w-4 h-4 mr-2" />
                        New Campaign
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : projects && projects.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to="/app/projects/$projectId"
                            params={{ projectId: project.id }}
                        >
                            <Card className="h-full hover:shadow-lg transition-all cursor-pointer hover:border-primary/50">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <FolderOpen className="w-8 h-8 text-primary" />
                                        <Badge
                                            variant="outline"
                                            className={
                                                project.status === "active"
                                                    ? "bg-green-500/10 text-green-600 border-green-500/30"
                                                    : project.status === "archived"
                                                        ? "bg-gray-500/10 text-gray-600 border-gray-500/30"
                                                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                                            }
                                        >
                                            {project.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-4">{project.name}</CardTitle>
                                    <CardDescription>
                                        Created{" "}
                                        {project.createdAt ? formatDistanceToNow(
                                            typeof project.createdAt === 'number'
                                                ? new Date(project.createdAt * 1000)
                                                : new Date(project.createdAt),
                                            { addSuffix: true }
                                        ) : 'Just now'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Click to view campaign details and workflow status.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Create your first marketing campaign to get started.
                        </p>
                        <Button asChild>
                            <Link to="/app/projects/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Campaign
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
