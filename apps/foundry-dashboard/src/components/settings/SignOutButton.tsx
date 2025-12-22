import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { signOut } from '@/lib/auth-client';
import { useToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';

/**
 * SignOutButton component for signing out the user
 * AC3: Sign out invalidates session and redirects to /login
 */
export function SignOutButton() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // SPA navigation to login page after signout (preserves React state, faster)
      navigate({ to: '/login' });
    } catch (error) {
      setIsLoading(false);
      addToast('Failed to sign out. Please try again.', 'error', 4000);
    }
  };

  return (
    <div
      className="p-6 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
    >
      <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Sign Out
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        Sign out of your current session. You'll need to sign in again to access the dashboard.
      </p>
      <Button
        data-testid="sign-out-btn"
        onClick={handleSignOut}
        disabled={isLoading}
        variant="kill"
      >
        {isLoading ? 'Signing out...' : 'Sign Out'}
      </Button>
    </div>
  );
}
