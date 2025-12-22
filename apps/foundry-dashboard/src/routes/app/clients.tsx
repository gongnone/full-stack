import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useSession } from '@/lib/auth-client';

export const Route = createFileRoute('/app/clients')({
  component: ClientsPage,
});

function ClientsPage() {
  const { data: session } = useSession();
  const clientsQuery = trpc.clients.list.useQuery(
    {},
    {
      enabled: !!session,
      retry: false,
    }
  );

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
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      {clientsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--edit)' }} />
        </div>
      ) : clientsQuery.data?.items?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientsQuery.data.items.map((client) => (
            <div
              key={client.id}
              className="p-5 rounded-xl border transition-all hover:border-opacity-50"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
            >
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
