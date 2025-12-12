import { createFileRoute, Outlet, Link } from '@tanstack/react-router';
import { Tabs, TabsList } from "@/components/ui/tabs";
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/app/_authed/projects/$projectId')({
    component: ProjectLayout,
})


import { trpc } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';

function ProjectLayout() {
    const { projectId } = Route.useParams();
    const { data: project } = useQuery(trpc.projects.getById.queryOptions({ id: projectId }));

    const projectName = project?.name || "Loading...";

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <Button variant="ghost" className="mb-4 pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground" asChild>
                    <Link to="/app/projects">
                        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Projects
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">{projectName}</h1>
            </div>

            <Tabs defaultValue="research" className="w-full">
                <div className="border-b mb-6">
                    <TabsList className="bg-transparent p-0 h-auto">
                        <TabLink to="/app/projects/$projectId/research" label="1. Research" />
                        <TabLink to="/app/projects/$projectId/competitors" label="2. Competitors" />
                        <TabLink to="/app/projects/$projectId/offer" label="3. Offer" />
                    </TabsList>
                </div>

                {/* 
                   We use Outlet to render child routes. 
                   However, TanStack router tabs usually just link to the route. 
                   The Tabs component here is visual navigation.
                */}
                <Outlet />
            </Tabs>
        </div>
    );
}

function TabLink({ to, label }: { to: string, label: string }) {
    const { projectId } = Route.useParams();
    return (
        <Link
            to={to}
            params={{ projectId }}
            className="px-4 py-2 border-b-2 border-transparent hover:text-primary [&.active]:border-primary [&.active]:text-foreground text-muted-foreground transition-colors"
        >
            {label}
        </Link>
    )
}
