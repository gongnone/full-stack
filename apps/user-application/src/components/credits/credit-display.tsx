import { trpc } from "@/lib/trpc";
import { Coins } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function CreditDisplay() {
    const { data, isLoading, isError } = useQuery({
        ...trpc.generations.getCredits.queryOptions(),
        retry: 1,
        staleTime: 30000,
    });

    if (isLoading) {
        return <div className="animate-pulse h-4 w-12 bg-muted rounded" />;
    }

    const balance = isError ? 0 : (data?.balance ?? 0);

    return (
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground">
            <Coins className="w-4 h-4" />
            <span>{balance} Credits</span>
        </div>
    );
}
