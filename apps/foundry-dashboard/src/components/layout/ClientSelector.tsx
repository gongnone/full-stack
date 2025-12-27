import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check, Building2 } from 'lucide-react';

export function ClientSelector() {
  const activeClientId = useClientId();
  const utils = trpc.useUtils();
  
  const clientsQuery = trpc.clients.list.useQuery({});
  const switchMutation = trpc.clients.switch.useMutation({
    onSuccess: () => {
      // Invalidate all queries to refresh data for the new client
      utils.invalidate();
      // Specifically reload "me" to update activeClientId
      utils.auth.me.invalidate();
    },
  });

  const activeClient = clientsQuery.data?.items?.find(c => c.id === activeClientId);

  if (clientsQuery.isLoading) {
    return <div className="h-9 w-32 bg-white/5 animate-pulse rounded-lg" />;
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5 border border-transparent hover:border-white/10"
          style={{ color: 'var(--text-primary)' }}
        >
          <div 
            className="w-6 h-6 rounded flex items-center justify-center text-white"
            style={{ backgroundColor: activeClient?.brandColor || 'var(--edit)' }}
          >
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="max-w-[120px] truncate">
            {activeClient?.name || 'Select Client'}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] bg-[#1A1F26] border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100"
          align="start"
          sideOffset={5}
        >
          <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Switch Client
          </div>
          
          {clientsQuery.data?.items?.map((client: any) => (
            <DropdownMenu.Item
              key={client.id}
              disabled={client.id === activeClientId || switchMutation.isPending}
              onClick={() => switchMutation.mutate({ clientId: client.id })}
              className="flex items-center justify-between px-2 py-2 rounded-lg text-sm cursor-pointer outline-none hover:bg-white/5 focus:bg-white/5 transition-colors disabled:cursor-default"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: client.brandColor || 'var(--edit)' }}
                />
                <span style={{ color: client.id === activeClientId ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {client.name}
                </span>
              </div>
              {client.id === activeClientId && (
                <Check className="w-4 h-4 text-blue-500" />
              )}
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="h-px bg-white/10 my-1" />
          
          <DropdownMenu.Item
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm cursor-pointer outline-none hover:bg-white/5 transition-colors"
            style={{ color: 'var(--edit)' }}
            onSelect={() => window.location.href = '/app/clients'}
          >
            <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Manage Clients
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
