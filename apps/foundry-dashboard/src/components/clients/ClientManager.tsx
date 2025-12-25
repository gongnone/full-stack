import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useToast } from '@/lib/toast';
import { CLIENT_CONFIG, UI_CONFIG } from '@/lib/constants';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Building2, MoreVertical, Edit, Trash2, Users, Share2 } from 'lucide-react';
import { TeamAssignment } from './TeamAssignment';
import { ShareLinkModal } from './ShareLinkModal';

interface Client {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived';
  industry?: string;
  contactEmail?: string;
  brandColor?: string;
  createdAt: string;
}

export function ClientManager() {
  const { addToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    industry: '',
    contactEmail: '',
    brandColor: CLIENT_CONFIG.DEFAULT_BRAND_COLOR,
    status: 'active' as const,
  });

  const utils = trpc.useUtils();
  const clientsQuery = trpc.clients.list.useQuery({});

  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      setIsEditModalOpen(false);
      setSelectedClient(null);
      addToast('Client updated successfully', 'success', UI_CONFIG.TOAST_DURATION.SUCCESS);
    },
    onError: (err) => {
      addToast(`Update failed: ${err.message}`, 'error', UI_CONFIG.TOAST_DURATION.ERROR);
    },
  });

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditForm({
      name: client.name,
      industry: client.industry || '',
      contactEmail: client.contactEmail || '',
      brandColor: client.brandColor || CLIENT_CONFIG.DEFAULT_BRAND_COLOR,
      status: client.status,
    });
    setIsEditModalOpen(true);
  };

  const handleManageTeam = (client: Client) => {
    setSelectedClient(client);
    setIsTeamModalOpen(true);
  };

  const handleShare = (client: Client) => {
    setSelectedClient(client);
    setIsShareModalOpen(true);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    updateClientMutation.mutate({
      clientId: selectedClient.id,
      name: editForm.name,
      industry: editForm.industry || undefined,
      contactEmail: editForm.contactEmail || undefined,
      brandColor: editForm.brandColor,
      status: editForm.status,
    });
  };

  return (
    <div className="space-y-4">
      {clientsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--edit)' }} />
        </div>
      ) : clientsQuery.data?.items?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientsQuery.data.items.map((client: any) => (
            <div
              key={client.id}
              className="p-5 rounded-xl border transition-all hover:border-opacity-50 group relative"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: client.brandColor || 'var(--edit)' }}
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {client.name}
                      </p>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase"
                        style={{
                          backgroundColor: client.status === 'active' ? 'var(--approve)' : client.status === 'paused' ? 'var(--warning)' : 'var(--text-muted)',
                          color: client.status === 'archived' ? 'var(--bg-base)' : '#000',
                        }}
                      >
                        {client.status}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {client.industry || 'No industry'}
                    </p>
                  </div>
                </div>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="z-50 min-w-[180px] bg-[#1A1F26] border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100"
                      align="end"
                      sideOffset={5}
                    >
                      <DropdownMenu.Item
                        onClick={() => handleEditClient(client)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer outline-none hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Details
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => handleManageTeam(client)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer outline-none hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <Users className="w-4 h-4" />
                        Manage Team
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => handleShare(client)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer outline-none hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <Share2 className="w-4 h-4" />
                        Share Review Link
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-white/10 my-1" />
                      <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer outline-none hover:bg-white/5 transition-colors text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                        Archive Client
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>

              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {client.contactEmail || 'No contact email'}
                </p>
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
            <Building2 className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            No clients yet
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Add your first client to start creating content
          </p>
        </div>
      )}

      {/* Edit Client Modal */}
      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content
            className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[500px] p-6 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <Dialog.Title className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Edit Client
            </Dialog.Title>
            <Dialog.Description className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Update client details and settings.
            </Dialog.Description>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="edit-name" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Client Name
                </label>
                <input
                  id="edit-name"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="edit-industry" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Industry
                  </label>
                  <input
                    id="edit-industry"
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-status" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Status
                  </label>
                  <select
                    id="edit-status"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-email" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Contact Email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-color" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Brand Color
                </label>
                <div className="flex gap-2">
                  <input
                    id="edit-color"
                    type="color"
                    value={editForm.brandColor}
                    onChange={(e) => setEditForm({ ...editForm, brandColor: e.target.value })}
                    className="w-16 h-10 rounded-lg border cursor-pointer"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  />
                  <input
                    type="text"
                    value={editForm.brandColor}
                    onChange={(e) => setEditForm({ ...editForm, brandColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border transition-all focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
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
                  disabled={updateClientMutation.isPending || !editForm.name.trim()}
                  className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--edit)', color: '#fff' }}
                >
                  {updateClientMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Team Management Modal */}
      {selectedClient && (
        <TeamAssignment
          isOpen={isTeamModalOpen}
          onClose={() => {
            setIsTeamModalOpen(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
        />
      )}

      {/* Share Link Modal */}
      {selectedClient && (
        <ShareLinkModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
        />
      )}
    </div>
  );
}
