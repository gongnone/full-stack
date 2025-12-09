// import { trpc } from "@/router";
import { Coins } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";

export function CreditDisplay() {
    // FIXME: trpc.generations.getCredits.queryOptions() causes runtime error
    // const { data, isLoading } = useQuery(trpc.generations.getCredits.queryOptions());
    const data = { balance: 100 };
    const isLoading = false;

    if (isLoading) return <div className="animate-pulse h-4 w-12 bg-muted rounded" />;

    return (
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground">
            <Coins className="w-4 h-4" />
            <span>{data?.balance ?? 0} Credits</span>
        </div>
    );
}
