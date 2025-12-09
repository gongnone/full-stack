import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed/projects/$projectId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { projectId } = Route.useParams();

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Campaign Dashboard</h1>
            <p>Project ID: {projectId}</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Placeholder for the 4 steps */}
                {["Market Research", "Offer Creation", "Brand Pillars", "Content Ideas"].map((step) => (
                    <div key={step} className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <h3 className="font-semibold text-lg">{step}</h3>
                        <p className="text-sm text-muted-foreground mt-2">Status: Pending</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
