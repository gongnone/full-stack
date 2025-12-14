import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface CitationProps {
    content: string;
    source?: {
        name: string;
        snippet: string;
        sophistication: string | null;
    } | null;
}

export const CitationCard = ({ content, source }: CitationProps) => {
    return (
        <div className="border p-4 rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-3">
                <p className="font-medium text-lg leading-relaxed text-slate-800">{content}</p>

                {source && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Badge
                                variant="outline"
                                className="cursor-help flex gap-1 items-center shrink-0 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verified</span>
                            </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 shadow-xl border-emerald-500/20">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <h4 className="font-semibold text-sm">Valid Source Evidence</h4>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Derived from:</p>
                                    <p className="text-sm font-medium text-primary">{source.name || "Market Signal"}</p>
                                </div>
                                {source.snippet && (
                                    <div className="bg-slate-50 p-3 rounded text-xs italic border-l-2 border-emerald-500 text-slate-600">
                                        "{source.snippet.slice(0, 150)}{source.snippet.length > 150 ? "..." : ""}"
                                    </div>
                                )}
                                {source.sophistication && (
                                    <Badge variant="secondary" className="text-[10px]">
                                        Class {source.sophistication} Source
                                    </Badge>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
            {/* Future: Action Bar (Thumbs Up/Down) */}
        </div>
    );
};
