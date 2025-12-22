import * as React from 'react';
import { trpc } from '@/lib/trpc-client';
import { useToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';

/**
 * ProfileCard component for displaying and editing user profile
 * AC1: View profile information (name, email, avatar)
 * AC2: Update display name and save to user_profiles table
 */
export function ProfileCard() {
  const { addToast } = useToast();
  const [displayName, setDisplayName] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [charCount, setCharCount] = React.useState(0);

  // Fetch user profile data
  const { data, isLoading, error } = trpc.auth.me.useQuery();

  // Update profile mutation
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      addToast('Profile updated', 'success', 2000);
      setIsEditing(false);
    },
    onError: (err) => {
      addToast(err.message || 'Failed to save changes', 'error', 4000);
    },
  });

  // Initialize display name when data loads
  React.useEffect(() => {
    if (data?.profile?.display_name) {
      setDisplayName(data.profile.display_name);
      setCharCount(data.profile.display_name.length);
    } else if (data?.user?.name) {
      setDisplayName(data.user.name);
      setCharCount(data.user.name.length);
    }
  }, [data]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setDisplayName(value);
      setCharCount(value.length);
    }
  };

  const handleSave = () => {
    if (displayName.length < 2 || displayName.length > 50) {
      addToast('Name must be between 2 and 50 characters', 'error', 3000);
      return;
    }
    updateProfile.mutate({ displayName });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isEditing) {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      // Reset to original value
      if (data?.profile?.display_name) {
        setDisplayName(data.profile.display_name);
        setCharCount(data.profile.display_name.length);
      }
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const name = displayName || data?.user?.name || data?.user?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  // Get avatar color (use CSS variable for consistency with theme)
  const avatarColor = data?.profile?.avatar_color || 'var(--edit)';

  if (isLoading) {
    return (
      <div
        className="p-6 rounded-xl border animate-pulse"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="h-6 w-24 rounded mb-4" style={{ backgroundColor: 'var(--bg-surface)' }} />
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full" style={{ backgroundColor: 'var(--bg-surface)' }} />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded" style={{ backgroundColor: 'var(--bg-surface)' }} />
            <div className="h-3 w-48 rounded" style={{ backgroundColor: 'var(--bg-surface)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--kill)' }}
      >
        <p style={{ color: 'var(--kill)' }}>Failed to load profile: {error.message}</p>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Profile
      </h2>

      {/* Avatar and basic info */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold"
          style={{ backgroundColor: avatarColor, color: '#FFFFFF' }}
          aria-label={`Avatar for ${displayName || data?.user?.name || 'User'}`}
        >
          {getInitials()}
        </div>
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {displayName || data?.user?.name || 'User'}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {data?.user?.email}
            </p>
            {data?.user?.emailVerified && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(0, 210, 106, 0.15)', color: 'var(--approve)' }}
                aria-label="Email verified"
              >
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="space-y-4">
        {/* Display Name */}
        <div>
          <label
            htmlFor="display-name"
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Display Name
          </label>
          <div className="relative">
            <input
              id="display-name"
              data-testid="display-name-input"
              type="text"
              value={displayName}
              onChange={handleNameChange}
              onFocus={() => setIsEditing(true)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: isEditing ? 'var(--border-focus)' : 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              placeholder="Your display name"
              aria-describedby="name-char-count"
              maxLength={50}
            />
            <span
              id="name-char-count"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{
                color: charCount > 45 ? 'var(--warning)' : 'var(--text-muted)',
              }}
            >
              {charCount}/50
            </span>
          </div>
          {charCount > 0 && charCount < 2 && (
            <p className="text-xs mt-1" style={{ color: 'var(--kill)' }} role="alert">
              Name must be at least 2 characters
            </p>
          )}
        </div>

        {/* Email (read-only) */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={data?.user?.email || ''}
            disabled
            className="w-full px-3 py-2 rounded-lg border text-sm opacity-60 cursor-not-allowed"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Email cannot be changed
          </p>
        </div>
      </div>

      {/* Save button - only show when editing */}
      {isEditing && (
        <div className="mt-6 flex gap-3">
          <Button
            data-testid="save-profile-btn"
            variant="approve"
            onClick={handleSave}
            disabled={updateProfile.isPending || displayName.length < 2 || displayName.length > 50}
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="cancel"
            onClick={() => {
              setIsEditing(false);
              if (data?.profile?.display_name) {
                setDisplayName(data.profile.display_name);
                setCharCount(data.profile.display_name.length);
              }
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
