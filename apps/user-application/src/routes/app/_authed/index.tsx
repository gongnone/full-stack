import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

export const Route = createFileRoute("/app/_authed/")({
  component: DashboardComponent,
});

function DashboardComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6 text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to AntiGravity</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The all-in-one AI agent for Market Research, Competitor Intelligence, and Irresistible Offers.
        </p>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/app/projects">
              View Projects <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
