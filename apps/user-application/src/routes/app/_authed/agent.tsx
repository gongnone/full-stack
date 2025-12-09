import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AgentWorkspace } from "@/components/agent/agent-workspace";

const searchSchema = z.object({
    sessionId: z.string().optional(),
});

export const Route = createFileRoute("/app/_authed/agent")({
    validateSearch: (search) => searchSchema.parse(search),
    component: AgentPage,
});

function AgentPage() {
    const { sessionId } = Route.useSearch();
    const navigate = useNavigate();

    if (sessionId) {
        // If we have a session ID, render the actual agent interface
        return <AgentWorkspace sessionId={sessionId} />;
    }

    // Welcome Screen
    const startSession = () => {
        const newSessionId = crypto.randomUUID();
        navigate({ to: '/app/agent', search: { sessionId: newSessionId } });
    };

    return (
        <div className="flex h-full items-center justify-center p-6">
            <Card className="max-w-2xl w-full bg-gradient-to-br from-background to-muted/50 border-primary/20 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <Bot className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold">War Room</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Your centralized command center for AI-driven strategy, off-generation, and brand building.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="grid gap-4 w-full md:grid-cols-3 text-center">
                        <div className="p-4 rounded-lg bg-card border shadow-sm">
                            <h3 className="font-semibold mb-1">Research</h3>
                            <p className="text-sm text-muted-foreground">Deep dive into market data</p>
                        </div>
                        <div className="p-4 rounded-lg bg-card border shadow-sm">
                            <h3 className="font-semibold mb-1">Strategy</h3>
                            <p className="text-sm text-muted-foreground">Architect irresistible offers</p>
                        </div>
                        <div className="p-4 rounded-lg bg-card border shadow-sm">
                            <h3 className="font-semibold mb-1">Execution</h3>
                            <p className="text-sm text-muted-foreground">Generate high-converting content</p>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={startSession}
                        className="w-full md:w-auto text-lg px-8 py-6 h-auto"
                    >
                        Start New Session <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}


