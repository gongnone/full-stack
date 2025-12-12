import { createFileRoute } from '@tanstack/react-router';
import { ProjectCard } from '@/components/dashboard/project-card';
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog';

// import { trpc } from '@/lib/trpc'; // Assuming we have TRPC or just fetch for now?
// For MVP execution plan, we will stick to what's easiest. We might not have TRPC routers for projects yet.
// We'll mock for now or use direct fetch if we made an API?
// The plan said "View: List of all projects".
// We didn't explicitly build a GET /projects endpoint in data-service yet... 
// Wait, I missed that in the plan! I only built WORKFLOW endpoints.
// I need a way to list projects. 
// I will mock the data for Navigation purposes first, then add the fetch later or rely on local state if I must, 
// but realistically we need a fetch.
// I'll add a TODO to fetch real data.



import { trpc } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/app/_authed/projects/')({
    component: ProjectsPage,
})

function ProjectsPage() {
    const { data: projects, isLoading } = useQuery(trpc.projects.list.queryOptions());

    if (isLoading) {
        return <div className="container mx-auto py-8">Loading projects...</div>;
    }

    const projectList = projects || [];

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-2">Manage your research and offer generation campaigns.</p>
                </div>
                <CreateProjectDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectList.map((project: any) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
}
