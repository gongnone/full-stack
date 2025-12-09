import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, ArrowRight } from "lucide-react";
import { useAgentSocket } from "@/hooks/use-agent-socket";
import { cn } from "@/lib/utils";

interface AgentWorkspaceProps {
    sessionId: string;
}

export function AgentWorkspace({ sessionId }: AgentWorkspaceProps) {
    const { messages, isConnected, sendMessage } = useAgentSocket(sessionId);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !isConnected) return;
        sendMessage(input);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const startResearch = () => {
        sendMessage("Let's start the research.");
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between bg-card/50 backdrop-blur sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            War Room
                            <span className="text-muted-foreground font-normal text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">
                                {sessionId.slice(0, 8)}
                            </span>
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {isConnected ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-green-600 font-medium">System Online</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-xs text-red-500 font-medium">Connecting...</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/app">Exit Mission</a>
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden relative">
                <div className="h-full overflow-y-auto px-4 py-6" ref={scrollRef}>
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.length === 0 && isConnected ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 animate-in fade-in duration-500">
                                <div className="p-4 rounded-full bg-primary/5 mb-2">
                                    <Bot className="w-12 h-12 text-primary/50" />
                                </div>
                                <h3 className="text-xl font-semibold">Ready to Initialize</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    The system is online. Begin the research phase to start gathering intelligence.
                                </p>
                                <Button size="lg" onClick={startResearch} className="mt-4">
                                    Start Research Phase <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        ) : messages.length === 0 && !isConnected ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                                <p className="text-muted-foreground">Establishing secure connection...</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "flex gap-3",
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "rounded-lg px-4 py-2 max-w-[80%] text-sm",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted border"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="h-4" /> {/* Spacer */}
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-background">
                <div className="max-w-3xl mx-auto flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isConnected ? "Enter command or message..." : "Connecting..."}
                        disabled={!isConnected}
                        className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={!isConnected || !input.trim()}>
                        <Send className="w-4 h-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
