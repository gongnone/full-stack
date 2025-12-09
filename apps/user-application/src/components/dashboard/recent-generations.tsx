import { trpc } from "@/router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageIcon, MessageSquare, VideoIcon, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function RecentGenerations() {
    // Poll every 5 seconds to update status
    const { data: generations, isLoading } = useQuery({
        ...trpc.generations.listRecent.queryOptions(),
        refetchInterval: 5000,
    });

    const getIcon = (type: string) => {
        switch (type) {
            case "tweet": return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case "image": return <ImageIcon className="w-4 h-4 text-purple-500" />;
            case "video_script": return <VideoIcon className="w-4 h-4 text-red-500" />;
            default: return <Sparkles className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-500/15 text-green-700 hover:bg-green-500/25";
            case "processing": return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 animate-pulse";
            case "failed": return "bg-red-500/15 text-red-700 hover:bg-red-500/25";
            default: return "bg-gray-500/15 text-gray-700";
        }
    };

    return (
        <Card className="h-full shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Recent Generations
                </CardTitle>
                <CardDescription>
                    Real-time status of your content creation.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Prompt</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="text-right w-[120px]">Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Skeleton Loader
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="w-4 h-4 bg-muted rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-4 w-3/4 bg-muted rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-5 w-16 bg-muted rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-4 w-12 ml-auto bg-muted rounded animate-pulse" /></TableCell>
                                </TableRow>
                            ))
                        ) : generations?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No generations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            generations?.map((gen) => (
                                <TableRow key={gen.id}>
                                    <TableCell>{getIcon(gen.type)}</TableCell>
                                    <TableCell className="max-w-[200px] truncate font-medium">
                                        {gen.prompt}
                                        {gen.output && <div className="text-xs text-muted-foreground truncate mt-1 font-normal">{gen.output}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getStatusColor(gen.status)}>
                                            {gen.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                        {gen.createdAt ? formatDistanceToNow(new Date(gen.createdAt), { addSuffix: true }) : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
