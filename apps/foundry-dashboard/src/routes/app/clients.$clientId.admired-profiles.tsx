/**
 * Story 4.7: Admired Profiles Management Page
 * Manage Instagram profiles for personalized G7 engagement scoring
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';

export const Route = createFileRoute('/app/clients/$clientId/admired-profiles')({
  component: AdmiredProfilesPage,
});

function AdmiredProfilesPage() {
  const { clientId } = Route.useParams();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newHandle, setNewHandle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const utils = trpc.useUtils();

  const { data: profiles = [], isLoading } = trpc.admiredProfiles.list.useQuery({
    clientId,
  });

  const { data: weighting } = trpc.admiredProfiles.getWeighting.useQuery({
    clientId,
  });

  const addMutation = trpc.admiredProfiles.add.useMutation({
    onSuccess: () => {
      utils.admiredProfiles.list.invalidate({ clientId });
      utils.admiredProfiles.getWeighting.invalidate({ clientId });
      setShowAddDialog(false);
      setNewHandle('');
      toast.success('Profile added successfully. Syncing in background...');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMutation = trpc.admiredProfiles.remove.useMutation({
    onSuccess: (data) => {
      utils.admiredProfiles.list.invalidate({ clientId });
      utils.admiredProfiles.getWeighting.invalidate({ clientId });
      toast.success(`@${data.handle} removed. G7 scoring updated.`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resyncMutation = trpc.admiredProfiles.resync.useMutation({
    onSuccess: () => {
      utils.admiredProfiles.list.invalidate({ clientId });
      toast.success('Re-sync started');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAdd = async () => {
    if (!newHandle.trim()) {
      toast.error('Please enter an Instagram handle');
      return;
    }

    setIsAdding(true);
    try {
      await addMutation.mutateAsync({
        clientId,
        instagramHandle: newHandle,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = (profileId: string, handle: string) => {
    if (confirm(`Remove @${handle} from admired profiles? This will update your G7 scoring.`)) {
      removeMutation.mutate({ clientId, profileId });
    }
  };

  const handleResync = (profileId: string) => {
    resyncMutation.mutate({ clientId, profileId });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Admired Profiles
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Personalize your engagement scoring by adding Instagram profiles you want to emulate.
        </p>
      </div>

      {/* G7 Weighting Callout */}
      {weighting && profiles.length > 0 && (
        <div
          className="p-4 rounded-lg mb-6"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              G7 Scoring:
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--edit)' }}>
              {weighting.description}
            </span>
          </div>
          {weighting.profileCount < 5 && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Add {5 - weighting.profileCount} more profile{5 - weighting.profileCount > 1 ? 's' : ''} for maximum
              personalization (70% admired, 30% baseline).
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {profiles.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--edit-glow)' }}
          >
            <svg className="w-12 h-12" style={{ color: 'var(--edit)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Add Creators You Admire
          </h2>
          <p className="text-sm text-center mb-6 max-w-md" style={{ color: 'var(--text-muted)' }}>
            Personalize your engagement scoring by adding Instagram profiles you want to emulate. Your G7 scores will
            prioritize patterns from these creators.
          </p>
          <Button onClick={() => setShowAddDialog(true)}>Add Your First Profile</Button>
        </div>
      )}

      {/* Profiles Grid */}
      {profiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Your Admired Profiles ({profiles.length})
            </h2>
            <Button onClick={() => setShowAddDialog(true)}>Add Profile</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* Avatar & Handle */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: profile.avatar_url ? 'transparent' : 'var(--edit)' }}
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.instagram_handle} className="w-full h-full rounded-full" />
                    ) : (
                      profile.instagram_handle.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      @{profile.instagram_handle}
                    </div>
                    {profile.follower_count > 0 && (
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatFollowers(profile.follower_count)} followers
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="mb-3">
                  {profile.status === 'active' && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--approve)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{profile.post_count} posts analyzed</span>
                    </div>
                  )}
                  {profile.status === 'syncing' && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--warning)' }}>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      <span>Syncing... {profile.post_count}/50 posts</span>
                    </div>
                  )}
                  {profile.status === 'pending' && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--warning)' }}>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      <span>Queued for sync...</span>
                    </div>
                  )}
                  {profile.status === 'error' && (
                    <div className="text-xs" style={{ color: 'var(--kill)' }}>
                      ⚠️ {profile.error_message || 'Sync failed'}
                    </div>
                  )}
                  {profile.status === 'rate_limited' && (
                    <div className="text-xs" style={{ color: 'var(--warning)' }}>
                      ⏱️ Rate limited. Retrying in 1 hour...
                    </div>
                  )}
                </div>

                {/* Last Synced */}
                {profile.last_synced && (
                  <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    Last synced: {formatRelativeTime(profile.last_synced)}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button
                    onClick={() => handleResync(profile.id)}
                    disabled={profile.status === 'syncing' || resyncMutation.isPending}
                    className="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Re-sync
                  </button>
                  <button
                    onClick={() => handleRemove(profile.id, profile.instagram_handle)}
                    disabled={removeMutation.isPending}
                    className="px-3 py-1.5 text-xs font-medium rounded transition-colors hover:bg-red-500/10 disabled:opacity-50"
                    style={{ color: 'var(--kill)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Profile Dialog */}
      <Dialog.Root open={showAddDialog} onOpenChange={setShowAddDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-lg z-50"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Dialog.Title className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Add Admired Profile
            </Dialog.Title>
            <Dialog.Description className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Enter an Instagram handle to add to your admired profiles list.
            </Dialog.Description>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Instagram Handle
              </label>
              <input
                type="text"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                placeholder="@garyvee"
                className="w-full px-3 py-2 rounded-md"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  className="px-4 py-2 text-sm font-medium rounded-md"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  disabled={isAdding}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <Button onClick={handleAdd} disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Profile'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

// Helper functions
function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
