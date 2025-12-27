import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useSession } from '@/lib/auth-client';
import { useToast } from '@/lib/toast';
import { UI_CONFIG } from '@/lib/constants';
import * as Dialog from '@radix-ui/react-dialog';
import { ClientManager } from '@/components/clients/ClientManager';

export const Route = createFileRoute('/app/clients')({
  component: ClientsPage,
});

function ClientsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const utils = trpc.useUtils();
  const clientsQuery = trpc.clients.list.useQuery(
    {},
    {
      enabled: !!session,
      retry: false,
    }
  );

  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      setIsAddModalOpen(false);
      setNewClientName('');
      setNewClientIndustry('');
      setNewClientEmail('');
      addToast('Client created successfully', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    },
    onError: (err) => {
      addToast(`Failed to create client: ${err.message}`, 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    createClientMutation.mutate({
      name: newClientName,
      industry: newClientIndustry || undefined,
      contactEmail: newClientEmail || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Clients
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage your client accounts and team access
          </p>
        </div>

        <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <Dialog.Trigger asChild>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Client
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
            <Dialog.Content 
              className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[450px] p-6 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <Dialog.Title className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Add New Client
              </Dialog.Title>
              <Dialog.Description className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Create a new isolated workspace for this client.
              </Dialog.Description>

              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Client Name *
                  </label>
                  <input
                    id="name"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="industry" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Industry
                  </label>
                  <input
                    id="industry"
                    value={newClientIndustry}
                    onChange={(e) => setNewClientIndustry(e.target.value)}
                    placeholder="e.g. Technology"
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Contact Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="contact@client.com"
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={createClientMutation.isPending || !newClientName.trim()}
                    className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
                  >
                    {createClientMutation.isPending ? 'Creating...' : 'Create Client'}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <ClientManager />
    </div>
  );
}
