import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditDisplay } from "@/components/credits/credit-display";
import { Activity } from "lucide-react";
import { GenerationForm } from "@/components/dashboard/generation-form";
import { RecentGenerations } from "@/components/dashboard/recent-generations";

export const Route = createFileRoute("/app/_authed/")({
  component: DashboardComponent,
});

function DashboardComponent() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage your AI generation campaigns and settings.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Card 1: New Generation */}
        <div className="md:col-span-1">
          <GenerationForm />
        </div>

        {/* Card 2: Recent Generations (Spans 2 columns on large screens) */}
        <div className="md:col-span-2">
          <RecentGenerations />
        </div>

        {/* Card 3: Usage & Billing */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Usage & Billing
            </CardTitle>
            <CardDescription>Monitor your credit usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Current Balance</span>
                <CreditDisplay />
              </div>
              <p className="text-xs text-muted-foreground">
                Next refill date: <span className="font-mono">Oct 1, 2025</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
