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
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            <div className={cn(
                "flex max-w-[85%] md:max-w-[75%] gap-3",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar */}
                <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
                    isUser ? "bg-blue-600 text-white shadow-sm" : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-emerald-500 shadow-sm"
                )}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Message Bubble */}
                <div className={cn(
                    "px-5 py-3.5 shadow-sm text-sm leading-relaxed",
                    isUser
                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm"
                )}>
                    <div className={cn(
                        "prose prose-sm dark:prose-invert max-w-none break-words",
                        "prose-table:text-sm prose-th:bg-zinc-100 dark:prose-th:bg-zinc-800 prose-td:px-3 prose-td:py-2 prose-th:px-3 prose-th:py-2",
                        isUser && "prose-headings:text-white prose-p:text-white prose-strong:text-white prose-li:text-white"
                    )}>
                        <ReactMarkdown
                            components={{
                                table: ({ node, ...props }) => (
                                    <div className="overflow-x-auto my-4 border rounded-lg border-zinc-200 dark:border-zinc-700">
                                        <table {...props} className="w-full text-left" />
                                    </div>
                                )
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                        {isStreaming && (
                            <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-emerald-500 animate-pulse" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
