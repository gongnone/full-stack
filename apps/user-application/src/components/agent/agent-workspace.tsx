import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, ArrowRight } from "lucide-react";
import { useAgentSocket } from "@/hooks/use-agent-socket";
import { ChatMessage } from "./chat-message";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PanelRightOpen } from "lucide-react";

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
        <div className="flex h-[calc(100dvh-64px)] bg-zinc-50 dark:bg-zinc-950">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative min-w-0">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-zinc-900 dark:bg-white p-2 rounded-xl text-white dark:text-zinc-900 shadow-sm">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                War Room
                                <span className="text-zinc-500 font-normal text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                    {sessionId.slice(0, 8)}
                                </span>
                            </h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {isConnected ? (
                                    <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">System Online</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-xs text-red-500 font-medium">Connecting...</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Sidebar Toggle */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-zinc-500">
                                    <PanelRightOpen className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <div className="h-full flex flex-col">
                                    <div className="py-4 border-b border-zinc-200 dark:border-zinc-800">
                                        <SheetTitle className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Mission Parameters</SheetTitle>
                                        <SheetDescription className="sr-only">
                                            Current mission status and phase details.
                                        </SheetDescription>
                                    </div>
                                    <div className="py-4 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Phase</label>
                                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="text-sm font-medium text-zinc-900 dark:text-white">Research</span>
                                                </div>
                                                <div className="text-xs text-zinc-500">Gathering intelligence on target audience and market positioning.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth" ref={scrollRef}>
                    <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end pb-4">
                        {messages.length === 0 && isConnected ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
                                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 mb-2 ring-1 ring-zinc-100 dark:ring-zinc-800">
                                    <Bot className="w-16 h-16 text-zinc-900 dark:text-white" />
                                </div>
                                <div className="space-y-2 max-w-md">
                                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Ready to Initialize</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                        The AI agent is online and ready. Begin the research phase to start gathering intelligence for your campaign.
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={startResearch}
                                    className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105"
                                >
                                    Start Research Phase <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        ) : messages.length === 0 && !isConnected ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                                <p className="text-zinc-500 font-medium text-sm">Establishing secure connection...</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {messages.map((msg, idx) => (
                                    <ChatMessage
                                        key={idx}
                                        role={msg.role}
                                        content={msg.content}
                                        isStreaming={idx === messages.length - 1 && msg.role === 'assistant'}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="h-4" />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent dark:from-zinc-950 dark:via-zinc-950 pb-[env(safe-area-inset-bottom)]">
                    <div className="max-w-3xl mx-auto relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 rounded-full opacity-50 blur group-hover:opacity-75 transition duration-500" />
                        <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-full shadow-xl shadow-zinc-200/50 dark:shadow-black/50 p-2 pr-2 ring-1 ring-zinc-200 dark:ring-zinc-800 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 transition-all">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isConnected ? "Message the agent..." : "Connecting..."}
                                disabled={!isConnected}
                                className="border-none shadow-none focus-visible:ring-0 bg-transparent px-4 py-4 md:px-6 md:py-6 h-auto text-base placeholder:text-zinc-400"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!isConnected || !input.trim()}
                                size="icon"
                                className="h-10 w-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md transition-all hover:scale-105 shrink-0 mr-1"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </div>
                        <div className="absolute -bottom-6 left-0 right-0 text-center hidden md:block">
                            <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">
                                Secure Session • AI-Powered
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar (Right Column) - Desktop Only */}
            <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hidden lg:flex flex-col">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Mission Parameters</h3>
                </div>
                <div className="p-4 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Phase</label>
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-sm font-medium text-zinc-900 dark:text-white">Research</span>
                            </div>
                            <div className="text-xs text-zinc-500">Gathering intelligence on target audience and market positioning.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
