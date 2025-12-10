import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
    if (role === 'system') {
        return (
            <div className="flex w-full justify-center my-4">
                <span className="text-xs text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    {content}
                </span>
            </div>
        );
    }

    const isUser = role === 'user';

    return (
        <div className={cn(
            "flex w-full mb-6",
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "flex max-w-[80%] gap-3",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar */}
                <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    isUser ? "bg-zinc-800 text-white" : "bg-emerald-500/10 text-emerald-500"
                )}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Message Bubble */}
                <div className={cn(
                    "px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed",
                    isUser
                        ? "bg-zinc-800 text-white rounded-br-none"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none"
                )}>
                    <div className="prose dark:prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                        <ReactMarkdown>{content}</ReactMarkdown>
                        {isStreaming && (
                            <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-emerald-500 animate-pulse" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
