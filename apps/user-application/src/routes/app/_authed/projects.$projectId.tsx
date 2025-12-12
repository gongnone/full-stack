import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc';
import {
    LayoutDashboard,
    Search,
    Swords,
    ScrollText,
    Lock,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/app/_authed/projects/$projectId')({
    component: ProjectLayout,
});

function ProjectLayout() {
    const { projectId } = Route.useParams();
    const location = useLocation();

    // Fetch computed status
    const { data, isLoading } = (trpc.projects as any).getDashboardStatus.useQuery({ projectId });

    if (isLoading) return <DashboardSkeleton />;

    const phases = [
        {
            id: 'research',
            label: 'Halo Research',
            icon: Search,
            path: `/app/projects/${projectId}/research`,
            status: data?.phases.research.status,
            meta: data?.phases.research.meta,
            description: "Market psychology & avatar extraction"
        },
        {
            id: 'competitors',
            label: 'Golden Pheasant',
            icon: Swords,
            path: `/app/projects/${projectId}/competitors`,
            status: data?.phases.competitors.status,
            meta: data?.phases.competitors.meta,
            description: "Competitive intelligence & weakness finding"
        },
        {
            id: 'offer',
            label: 'Godfather Offer',
            icon: ScrollText,
            path: `/app/projects/${projectId}/offer`,
            status: data?.phases.offer.status,
            meta: data?.phases.offer.meta,
            description: "Irresistible offer construction"
        }
    ];

    // Check if we are on a sub-route (e.g. /research)
    // IMPORTANT: Verify strict equality or logic to detect root
    const isRoot = location.pathname === `/app/projects/${projectId}` || location.pathname === `/app/projects/${projectId}/`;

    return (
        <div className="flex flex-col h-full space-y-6 p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{data?.project.name}</h1>
                    <p className="text-muted-foreground">{data?.project.industry || 'New Project'}</p>
                </div>
            </div>

            {/* Mission Control Tiles - Only show on Root, or show as condensed nav on sub-pages */}
            <div className={cn(
                "grid gap-4 transition-all duration-300",
                isRoot ? "grid-cols-1 md:grid-cols-3 h-48" : "grid-cols-3 h-20" // Condensed mode
            )}>
                {phases.map((phase) => (
                    <PhaseTile
                        key={phase.id}
                        phase={phase}
                        active={location.pathname.includes(phase.id)}
                        compact={!isRoot}
                    />
                ))}
            </div>

            {/* The Active Workspace */}
            <div className="flex-1 bg-slate-950/50 rounded-xl border border-slate-800 p-6 shadow-sm min-h-[500px]">
                {isRoot ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <LayoutDashboard className="h-16 w-16 text-slate-700" />
                        <h3 className="text-xl font-semibold">Ready to Launch</h3>
                        <p className="text-muted-foreground max-w-md">
                            Select a module above to begin. We recommend starting with
                            <span className="text-primary font-bold"> Halo Research</span> to unlock the other modules.
                        </p>
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>
        </div>
    );
}

// --- Sub Components ---

function PhaseTile({ phase, active, compact }: { phase: any, active: boolean, compact: boolean }) {
    const isLocked = phase.status === 'locked';
    const isComplete = phase.status === 'completed';

    if (isLocked) {
        return (
            <div className={cn(
                "relative flex flex-col justify-between p-6 rounded-xl border border-slate-800 bg-slate-900/20 grayscale opacity-70 cursor-not-allowed",
                compact && "p-4 flex-row items-center"
            )}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg"><phase.icon className="h-5 w-5" /></div>
                    <div>
                        <h3 className="font-semibold">{phase.label}</h3>
                        {!compact && <p className="text-xs text-muted-foreground">Prerequisite missing</p>}
                    </div>
                </div>
                {!compact && <Lock className="absolute top-6 right-6 h-5 w-5 text-slate-700" />}
            </div>
        );
    }

    return (
        <Link
            to={phase.path}
            className={cn(
                "relative flex flex-col justify-between p-6 rounded-xl border transition-all hover:shadow-lg group",
                active
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-slate-700 bg-slate-900/50 hover:border-slate-600",
                compact && "p-4 flex-row items-center"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                )}>
                    <phase.icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className={cn("font-semibold", active && "text-primary")}>{phase.label}</h3>
                    {!compact && <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>}
                </div>
            </div>

            {!compact && (
                <div className="flex justify-between items-center mt-4">
                    <span className="text-xs font-mono text-slate-500 bg-slate-900 py-1 px-2 rounded">
                        {phase.meta}
                    </span>
                    {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                        <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                    )}
                </div>
            )}
        </Link>
    );
}

function DashboardSkeleton() {
    return (
        <div className="p-8 space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid grid-cols-3 gap-4 h-48">
                <Skeleton />
                <Skeleton />
                <Skeleton />
            </div>
        </div>
    );
}
