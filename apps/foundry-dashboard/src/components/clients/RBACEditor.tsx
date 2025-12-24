import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import * as Dialog from '@radix-ui/react-dialog';
import { Shield, Check } from 'lucide-react';

interface RBACEditorProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    id: string;
    name: string;
  };
  member: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const ROLES = [
  {
    value: 'agency_owner',
    label: 'Agency Owner',
    description: 'Full access to all client settings and team management',
    permissions: [
      'Create and edit content',
      'Approve and publish content',
      'Manage team members',
      'Update client settings',
      'Generate shareable links',
      'View analytics',
      'Manage billing',
    ],
  },
  {
    value: 'account_manager',
    label: 'Account Manager',
    description: 'Manage content and team members',
    permissions: [
      'Create and edit content',
      'Approve and publish content',
      'Manage team members (except owners)',
      'Generate shareable links',
      'View analytics',
    ],
  },
  {
    value: 'creator',
    label: 'Creator',
    description: 'Create and edit content',
    permissions: [
      'Create and edit content',
      'View own content',
      'Request reviews',
    ],
  },
  {
    value: 'client_admin',
    label: 'Client Admin',
    description: 'Client-side administrator with review access',
    permissions: [
      'Review and approve content',
      'View analytics',
      'Export content',
    ],
  },
  {
    value: 'client_reviewer',
    label: 'Client Reviewer',
    description: 'Review and approve content only',
    permissions: [
      'Review content',
      'Provide feedback',
      'Approve or reject content',
    ],
  },
];

export function RBACEditor({ isOpen, onClose, client, member }: RBACEditorProps) {
  const [selectedRole, setSelectedRole] = useState(member.role);

  const utils = trpc.useUtils();
  const updateRoleMutation = trpc.clients.updateMember.useMutation({
    onSuccess: () => {
      utils.clients.listMembers.invalidate();
      onClose();
    },
  });

  const handleSave = () => {
    if (selectedRole === member.role) {
      onClose();
      return;
    }

    updateRoleMutation.mutate({
      clientId: client.id,
      memberId: member.id,
      role: selectedRole as any,
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[700px] max-h-[85vh] overflow-y-auto p-6 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <Dialog.Title className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Update Role & Permissions
          </Dialog.Title>
          <Dialog.Description className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Change role and permissions for {member.name}
          </Dialog.Description>

          <div className="space-y-3">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.value;
              const isCurrentRole = member.role === role.value;

              return (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className="w-full text-left p-4 rounded-xl border transition-all hover:border-opacity-70"
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-base)',
                    borderColor: isSelected ? 'var(--edit)' : 'var(--border-subtle)',
                    borderWidth: isSelected ? '2px' : '1px',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="mt-0.5 p-2 rounded-lg"
                        style={{
                          backgroundColor: isSelected ? 'var(--edit)' : 'var(--bg-elevated)',
                        }}
                      >
                        <Shield
                          className="w-4 h-4"
                          style={{ color: isSelected ? '#fff' : 'var(--text-muted)' }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {role.label}
                          </p>
                          {isCurrentRole && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase"
                              style={{ backgroundColor: 'var(--warning)', color: '#000' }}
                            >
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {role.description}
                        </p>

                        <ul className="mt-3 space-y-1.5">
                          {role.permissions.map((permission, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                              <Check className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--approve)' }} />
                              {permission}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center ml-2 flex-shrink-0"
                        style={{ backgroundColor: 'var(--edit)' }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {updateRoleMutation.error && (
            <div
              className="mt-4 p-3 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--kill)', color: '#000' }}
            >
              {updateRoleMutation.error.message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 mt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <Dialog.Close asChild>
              <button
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={updateRoleMutation.isPending || selectedRole === member.role}
              className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
            >
              {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
