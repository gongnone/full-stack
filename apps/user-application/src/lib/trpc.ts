import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from '@/worker/trpc/router';
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const trpc = createTRPCOptionsProxy<AppRouter>({
    client: createTRPCClient({
        links: [
            httpBatchLink({
                url: "/trpc",
                headers() {
                    // Retrieve clientId from localStorage
                    const clientId = localStorage.getItem("selectedClientId");
                    return clientId ? { "x-client-id": clientId } : {};
                },
            }),
        ],
    }),
    queryClient,
});
