import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useToast } from '@/lib/toast';
import { UI_CONFIG } from '@/lib/constants';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/rbac';
import * as Dialog from '@radix-ui/react-dialog';
import { UserPlus, Shield, X } from 'lucide-react';
import { RBACEditor } from './RBACEditor';

interface TeamAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    name: string;
  };
}

export function TeamAssignment({ isOpen, onClose, client }: TeamAssignmentProps) {
  const { addToast } = useToast();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isRBACEditorOpen, setIsRBACEditorOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<string>('creator');

  const utils = trpc.useUtils();
  const membersQuery = trpc.clients.listMembers.useQuery(
    { clientId: client.id },
    { enabled: isOpen }
  );

  const addMemberMutation = trpc.clients.addMember.useMutation({
    onSuccess: () => {
      utils.clients.listMembers.invalidate();
      setIsAddMemberOpen(false);
      setNewMemberEmail('');
      setNewMemberRole('creator');
      addToast('Team member added', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    },
    onError: (err) => {
      addToast(`Failed to add member: ${err.message}`, 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
  });

  const removeMemberMutation = trpc.clients.removeMember.useMutation({
    onSuccess: () => {
      utils.clients.listMembers.invalidate();
      addToast('Team member removed', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    },
    onError: (err) => {
      addToast(`Failed to remove member: ${err.message}`, 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    addMemberMutation.mutate({
      clientId: client.id,
      email: newMemberEmail,
      role: newMemberRole as any,
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    removeMemberMutation.mutate({
      clientId: client.id,
      memberId,
    });
  };

  const handleEditRole = (member: any) => {
    setSelectedMember(member);
    setIsRBACEditorOpen(true);
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content
            className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[600px] max-h-[85vh] overflow-y-auto p-6 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <Dialog.Title className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Team Management
            </Dialog.Title>
            <Dialog.Description className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Manage team members and their roles for {client.name}
            </Dialog.Description>

            <div className="space-y-4">
              {/* Add Member Button */}
              {!isAddMemberOpen && (
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors hover:bg-white/5"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--edit)' }}
                >
                  <UserPlus className="w-4 h-4" />
                  Add Team Member
                </button>
              )}

              {/* Add Member Form */}
              {isAddMemberOpen && (
                <div
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                >
                  <form onSubmit={handleAddMember} className="space-y-3">
                    <div className="space-y-1.5">
                      <label htmlFor="member-email" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Email Address
                      </label>
                      <input
                        id="member-email"
                        type="email"
                        required
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="colleague@example.com"
                        className="w-full px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20"
                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="member-role" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Role
                      </label>
                      <select
                        id="member-role"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20"
                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      >
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {ROLE_DESCRIPTIONS[newMemberRole as any]}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddMemberOpen(false);
                          setNewMemberEmail('');
                          setNewMemberRole('creator');
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addMemberMutation.isPending}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
                      >
                        {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                      </button>
                    </div>
                  </form>

                  {addMemberMutation.error && (
                    <p className="mt-2 text-xs text-red-500">
                      {addMemberMutation.error.message}
                    </p>
                  )}
                </div>
              )}

              {/* Team Members List */}
              <div className="space-y-2">
                {membersQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--edit)' }} />
                  </div>
                ) : membersQuery.data && membersQuery.data.length > 0 ? (
                  membersQuery.data.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {member.name || 'Unnamed User'}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {member.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditRole(member)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
                          style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                        >
                          <Shield className="w-3 h-3" />
                          {ROLE_LABELS[member.role as any] || member.role}
                        </button>

                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removeMemberMutation.isPending}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 text-red-500 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      No team members yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <Dialog.Close asChild>
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                >
                  Done
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* RBAC Editor */}
      {selectedMember && (
        <RBACEditor
          isOpen={isRBACEditorOpen}
          onClose={() => {
            setIsRBACEditorOpen(false);
            setSelectedMember(null);
          }}
          client={client}
          member={selectedMember}
        />
      )}
    </>
  );
}