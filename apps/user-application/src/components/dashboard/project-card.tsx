import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CalendarIcon, ArrowRightIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ProjectSummary {
    id: string;
    name: string;
    industry: string;
    status: 'research' | 'competitor' | 'offer' | 'complete';
    updatedAt: Date | string | null;
}

interface ProjectCardProps {
    project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const statusColors = {
        research: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
        competitor: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
        offer: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
        complete: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl mb-1">{project.name}</CardTitle>
                        <CardDescription>{project.industry}</CardDescription>
                    </div>
                    <Badge variant="secondary" className={statusColors[project.status] || ""}>
                        {project.status.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Updated {project.updatedAt ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }) : 'Never'}
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" variant="outline">
                    <Link to="/app/projects/$projectId/research" params={{ projectId: project.id }}>
                        Open Project <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
