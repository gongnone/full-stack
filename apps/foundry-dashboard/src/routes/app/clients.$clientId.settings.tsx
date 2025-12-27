import { useState } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import * as Dialog from '@radix-ui/react-dialog';

export const Route = createFileRoute('/app/clients/$clientId/settings')({
  component: ClientSettingsPage,
});

function ClientSettingsPage() {
  const { clientId } = useParams({ from: '/app/clients/$clientId/settings' });
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'agency_owner' | 'account_manager' | 'creator' | 'client_admin' | 'client_reviewer'>('account_manager');

  const utils = trpc.useUtils();
  
  const membersQuery = trpc.clients.listMembers.useQuery({ clientId });
  
  const addMemberMutation = trpc.clients.addMember.useMutation({
    onSuccess: () => {
      utils.clients.listMembers.invalidate({ clientId });
      setIsAddMemberModalOpen(false);
      setMemberEmail('');
    },
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    
    addMemberMutation.mutate({
      clientId,
      email: memberEmail,
      role: memberRole,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Client Settings
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage team access and client configuration
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Team Members
          </h2>
          
          <Dialog.Root open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
            <Dialog.Trigger asChild>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                Add Member
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
              <Dialog.Content 
                className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[400px] p-6 rounded-2xl shadow-2xl z-50"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <Dialog.Title className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Add Team Member
                </Dialog.Title>
                <Dialog.Description className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Invite a user to join this client workspace.
                </Dialog.Description>

                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="colleague@agency.com"
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Role
                    </label>
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    >
                      <option value="account_manager">Account Manager</option>
                      <option value="creator">Creator</option>
                      <option value="client_admin">Client Admin</option>
                      <option value="client_reviewer">Client Reviewer</option>
                      <option value="agency_owner">Agency Owner</option>
                    </select>
                  </div>

                  {addMemberMutation.isError && (
                    <p className="text-xs text-red-500">
                      {addMemberMutation.error.message}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Dialog.Close asChild>
                      <button type="button" className="px-4 py-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      disabled={addMemberMutation.isPending}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
                    >
                      {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
          {membersQuery.isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--edit)' }} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Name</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Role</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {membersQuery.data?.map((member: any) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{member.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.email}</div>
                    </td>
                    <td className="px-4 py-4 capitalize">
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide" 
                        style={{ 
                          backgroundColor: member.role === 'agency_owner' ? 'rgba(29, 155, 240, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: member.role === 'agency_owner' ? 'var(--edit)' : 'var(--text-secondary)'
                        }}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="text-xs font-medium hover:underline" style={{ color: 'var(--kill)' }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}