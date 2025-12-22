import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouterState } from "@tanstack/react-router";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { Loader2 } from "lucide-react"; // Import Loader2

export function SiteHeader() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const { data: clients, isLoading: isLoadingClients } = trpc.clients.list.useQuery();
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);

  // Initialize selected client from localStorage or set first available client
  useEffect(() => {
    if (clients && clients.length > 0) {
      const storedClientId = localStorage.getItem("selectedClientId");
      const clientExists = clients.some(c => c.id === storedClientId);

      if (storedClientId && clientExists) {
        setSelectedClientId(storedClientId);
      } else {
        // If no client is stored or stored client doesn't exist, default to the first client
        setSelectedClientId(clients[0].id);
        localStorage.setItem("selectedClientId", clients[0].id);
      }
    }
  }, [clients]);

  const handleClientChange = (newClientId: string) => {
    setSelectedClientId(newClientId);
    localStorage.setItem("selectedClientId", newClientId);
    window.location.reload(); // Reload page to apply new client context via authMiddleware
  };

  const getPageTitle = (path: string) => {
    if (path === "/app") return "Dashboard";
    if (path.startsWith("/app/projects")) return "Campaigns";
    if (path.startsWith("/app/agent")) return "War Room";
    return "Dashboard";
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getPageTitle(pathname)}</h1>
        <div className="ml-auto flex items-center gap-2">
          {isLoadingClients ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : clients && clients.length > 0 ? (
            <Select onValueChange={handleClientChange} value={selectedClientId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-muted-foreground">No Clients</span>
          )}
          <CreditBalance />
        </div>
      </div>
    </header>
  );
}

function CreditBalance() {
  const { data: credits, isLoading, isError } = useQuery({
    ...trpc.generations.getCredits.queryOptions(),
    retry: 1,
    staleTime: 30000,
  });

  const balance = isError ? 0 : (credits?.balance ?? 0);

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-sm font-medium">
      <span>🪙</span>
      <span>{isLoading ? "..." : balance} Credits</span>
    </div>
  );
}
