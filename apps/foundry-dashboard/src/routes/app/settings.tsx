import { createFileRoute } from '@tanstack/react-router';
import { ProfileCard, SignOutButton } from '@/components/settings';

/**
 * Settings page for user profile management
 * Story 1.5: User Profile & Settings
 *
 * AC1: View profile information (name, email, avatar)
 * AC2: Update display name and save to user_profiles table
 * AC3: Sign out invalidates session and redirects to /login
 */
export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section - AC1, AC2 */}
      <ProfileCard />

      {/* Sign Out Section - AC3 */}
      <SignOutButton />

      {/* Keyboard shortcuts hint */}
      <div
        className="text-xs py-4 border-t"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}
      >
        <span className="font-medium">Tip:</span> Press{' '}
        <kbd
          className="px-1.5 py-0.5 rounded text-xs"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
        >
          Enter
        </kbd>{' '}
        to save changes,{' '}
        <kbd
          className="px-1.5 py-0.5 rounded text-xs"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
        >
          Esc
        </kbd>{' '}
        to cancel editing
      </div>
    </div>
  );
}
