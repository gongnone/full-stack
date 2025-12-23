import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useSession } from '@/lib/auth-client';
import * as Dialog from '@radix-ui/react-dialog';

export const Route = createFileRoute('/app/clients')({
  component: ClientsPage,
});

function ClientsPage() {
  const { data: session } = useSession();
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

      {clientsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--edit)' }} />
        </div>
      ) : clientsQuery.data?.items?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientsQuery.data.items.map((client: any) => (
            <div
              key={client.id}
              className="p-5 rounded-xl border transition-all hover:border-opacity-50 cursor-pointer group"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {client.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {client.industry || 'No industry'}
                    </p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            No clients yet
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Add your first client to start creating content
          </p>
        </div>
      )}
    </div>
  );
}
