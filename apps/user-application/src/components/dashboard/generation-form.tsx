import { useState } from "react";
import { trpc } from "@/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export function GenerationForm() {
    const [prompt, setPrompt] = useState("");
    const [type, setType] = useState<"tweet" | "image" | "video_script">("tweet");

    const queryClient = useQueryClient();

    const createMutation = useMutation(trpc.generations.create.mutationOptions({
        onSuccess: () => {
            toast.success("Generation started successfully!");
            setPrompt("");
            // Invalidate the list to show the new item (optimistically or after fetch)
            queryClient.invalidateQueries({
                queryKey: trpc.generations.listRecent.queryOptions().queryKey
            });
        },
        onError: (err) => {
            toast.error(`Failed to start generation: ${err.message}`);
        }
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            toast.warning("Please enter a prompt");
            return;
        }
        createMutation.mutate({ prompt, type, model: "gpt-4o" });
    };

    return (
        <Card className="h-full flex flex-col shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    New Generation
                </CardTitle>
                <CardDescription>
                    Create new content using our AI models.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content Type</label>
                        <Select value={type} onValueChange={(v) => setType(v as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tweet">Tweet</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="video_script">Video Script</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                        <label className="text-sm font-medium">Prompt</label>
                        <Textarea
                            placeholder="Describe what you want to generate..."
                            className="flex-1 min-h-[120px] resize-none"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={createMutation.isPending}
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={createMutation.isPending || !prompt.trim()}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Generate Content
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
