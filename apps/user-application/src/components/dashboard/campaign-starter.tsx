import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight } from "lucide-react";

export function CampaignStarter() {
    const navigate = useNavigate();

    const startSession = () => {
        const sessionId = crypto.randomUUID();
        navigate({ to: '/app/agent', search: { sessionId } });
    };

    return (
        <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <Bot className="w-8 h-8 text-indigo-400" />
                    Start New Strategy
                </CardTitle>
                <CardDescription className="text-lg">
                    Launch the AI Agent to research your market, design an offer, and build your brand voice.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    size="lg"
                    onClick={startSession}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg px-8 py-6 h-auto"
                >
                    Enter War Room <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </CardContent>
        </Card>
    );
}
