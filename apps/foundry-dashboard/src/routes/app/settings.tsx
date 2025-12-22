import { createFileRoute } from '@tanstack/react-router';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Profile
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium"
            style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          >
            {session?.user.name?.charAt(0).toUpperCase() || session?.user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {session?.user.name || 'User'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {session?.user.email}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Display Name
            </label>
            <input
              type="text"
              defaultValue={session?.user.name || ''}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={session?.user.email || ''}
              disabled
              className="w-full px-3 py-2 rounded-lg border text-sm opacity-50"
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

        <div className="mt-6">
          <Button
            style={{ backgroundColor: 'var(--edit)' }}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Session Section */}
      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Session
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Sign out of your current session. You'll need to sign in again to access the dashboard.
        </p>
        <Button
          variant="outline"
          onClick={handleSignOut}
          style={{ borderColor: 'var(--kill)', color: 'var(--kill)' }}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
