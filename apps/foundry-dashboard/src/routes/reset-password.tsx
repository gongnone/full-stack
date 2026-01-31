import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AUTH_CONFIG } from '@/lib/constants';

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : '',
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
});

/** Real-time password requirement checks */
function usePasswordChecks(password: string) {
  return {
    length: password.length >= AUTH_CONFIG.MIN_PASSWORD_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function PasswordRequirement({ met, label, showError }: { met: boolean; label: string; showError?: boolean }) {
  const failed = !met && showError;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span style={{ color: met ? 'var(--approve)' : failed ? 'var(--destructive, #ef4444)' : 'var(--text-muted)' }}>
        {met ? '✓' : failed ? '✗' : '○'}
      </span>
      <span style={{ color: met ? 'var(--text-secondary)' : failed ? 'var(--destructive, #ef4444)' : 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token, error: urlError } = Route.useSearch();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(urlError || '');
  const [success, setSuccess] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const checks = usePasswordChecks(password);
  const allChecksPassed = checks.length && checks.uppercase && checks.lowercase && checks.number && checks.special;
  const passwordsMatch = password === confirmPassword;
  const canSubmit = allChecksPassed && passwordsMatch && password.length > 0 && confirmPassword.length > 0;

  if (!token && !success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-base)' }}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Invalid or missing reset token.
            </p>
            <Link to="/forgot-password" className="underline text-sm" style={{ color: 'var(--edit)' }}>
              Request a new reset link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setAttempted(true);

    if (!allChecksPassed) {
      setError('Please fix the highlighted password requirements below');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null) as { message?: string } | null;
        setError(data?.message || 'Reset failed. The link may have expired.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-base)' }}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Password reset!
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              You can now sign in with your new password.
            </p>
            <Button className="w-full" onClick={() => navigate({ to: '/login' } as any)}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Set new password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isLoading} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={AUTH_CONFIG.MIN_PASSWORD_LENGTH}
                  maxLength={AUTH_CONFIG.MAX_PASSWORD_LENGTH}
                  autoComplete="new-password"
                  autoFocus
                />
                {password.length > 0 && (
                  <div className="grid grid-cols-2 gap-1 mt-1.5">
                    <PasswordRequirement met={checks.length} label={`${AUTH_CONFIG.MIN_PASSWORD_LENGTH}+ characters`} showError={attempted} />
                    <PasswordRequirement met={checks.uppercase} label="Uppercase letter" showError={attempted} />
                    <PasswordRequirement met={checks.lowercase} label="Lowercase letter" showError={attempted} />
                    <PasswordRequirement met={checks.number} label="Number" showError={attempted} />
                    <PasswordRequirement met={checks.special} label="Special character" showError={attempted} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={AUTH_CONFIG.MIN_PASSWORD_LENGTH}
                  maxLength={AUTH_CONFIG.MAX_PASSWORD_LENGTH}
                  autoComplete="new-password"
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs" style={{ color: 'var(--destructive, #ef4444)' }}>
                    Passwords do not match
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !canSubmit}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Resetting…
                  </span>
                ) : 'Reset password'}
              </Button>
            </fieldset>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full" style={{ color: 'var(--text-secondary)' }}>
            <Link to="/login" search={{ error: undefined }} className="underline" style={{ color: 'var(--edit)' }}>
              Back to Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
