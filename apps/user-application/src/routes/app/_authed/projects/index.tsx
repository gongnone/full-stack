import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, FolderOpen, Loader2, AlertCircle, Trash2, Search, Edit, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// NOTE: Trailing slash is important for index route match
export const Route = createFileRoute("/app/_authed/projects/")({
    component: ProjectsListPage,
});

function ProjectsListPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [editProject, setEditProject] = useState<{ id: string, name: string, industry: string } | null>(null);

    // Infinite Query with Search
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery({
        ...((trpc.projects as any).list.infiniteQueryOptions ? (trpc.projects as any).list.infiniteQueryOptions({
            limit: 20,
            search: search || undefined
        }) : {
            queryKey: ['projects', { search }],
            queryFn: async ({ pageParam }: { pageParam?: number }) => {
                // Fallback direct call if infiniteQueryOptions helper fails (it should work with v5 adapter)
                // But since we are using 'any' cast, let's just assume standard fetch
                // This is risky without correct types, so best effort:
                // Actually, let's trust the adapter if available, otherwise direct queryClient fetch?
                // For safety in this "any" world, let's use the trpc client directly if we could, 
                // but we can't easily hook into React Query flow without the helper.
                // Assuming standard TRPC usage:
                return (trpc.projects as any).list.query({
                    limit: 20,
                    search: search || undefined,
                    cursor: pageParam
                });
            },
            getNextPageParam: (lastPage: any) => lastPage.nextCursor,
            initialPageParam: undefined,
        }),
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        initialPageParam: undefined,
    });

    const projects = data?.pages.flatMap((page: any) => page.items) || [];

    const deleteMutation = useMutation({
        ...(trpc.projects as any).delete.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    const updateMutation = useMutation({
        ...(trpc.projects as any).update.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setEditProject(null);
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
            deleteMutation.mutate({ id } as any);
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editProject) {
            updateMutation.mutate({
                id: editProject.id,
                name: editProject.name,
                industry: editProject.industry
            } as any);
        }
    };

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardContent className="flex items-center gap-3 py-4">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <div>
                            <p className="font-medium text-destructive">Failed to load campaigns</p>
                            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
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

            {/* Search Bar */}
            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search campaigns..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : projects.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project: any) => (
                        <div key={project.id} className="group relative">
                            {/* Card Link */}
                            <Link
                                to="/app/projects/$projectId"
                                params={{ projectId: project.id }}
                                className="block h-full"
                            >
                                <Card className="h-full hover:shadow-lg transition-all cursor-pointer hover:border-primary/50">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <FolderOpen className="w-8 h-8 text-primary" />
                                            <div className="flex items-center gap-2">
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
                                                {/* Desktop Dropdown for Actions */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.preventDefault()}>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.preventDefault();
                                                            setEditProject({ id: project.id, name: project.name, industry: project.industry || '' });
                                                        }}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDelete(project.id);
                                                        }}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <CardTitle className="mt-4">{project.name}</CardTitle>
                                        <CardDescription>
                                            {project.industry ? project.industry : "No industry specified"} • Created{" "}
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
                                            Click to view campaign details.
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    ))}
                    {/* Infinite Scroll Trigger */}
                    {hasNextPage && (
                        <div className="col-span-full flex justify-center py-4">
                            <Button
                                variant="outline"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading more...
                                    </>
                                ) : (
                                    "Load More"
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No campaigns found.</p>
                    {search && (
                        <Button variant="link" onClick={() => setSearch("")} className="mt-2">
                            Clear search
                        </Button>
                    )}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Campaign</DialogTitle>
                        <DialogDescription>
                            Update the campaign details below.
                        </DialogDescription>
                    </DialogHeader>
                    {editProject && (
                        <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Campaign Name</Label>
                                <Input
                                    id="name"
                                    value={editProject.name}
                                    onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="industry">Industry / Niche</Label>
                                <Input
                                    id="industry"
                                    value={editProject.industry}
                                    onChange={(e) => setEditProject({ ...editProject, industry: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
