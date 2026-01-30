import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { signUp } from '@/lib/auth-client';
import { clearSessionCache } from '@/lib/query-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SocialLoginButtons } from '@/components/auth';
import { AUTH_CONFIG } from '@/lib/constants';

export const Route = createFileRoute('/signup')({
  component: SignupPage,
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

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span style={{ color: met ? 'var(--approve)' : 'var(--text-muted)' }}>
        {met ? '✓' : '○'}
      </span>
      <span style={{ color: met ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const checks = usePasswordChecks(password);
  const allChecksPassed = checks.length && checks.uppercase && checks.lowercase && checks.number && checks.special;
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTouched(true);

    if (!allChecksPassed) {
      setError('Please fix the password requirements highlighted below');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      // R-13 AC2: Clear any stale cached data before navigation
      clearSessionCache();
      // Don't setIsLoading(false) — keep spinner until navigation completes
      navigate({ to: '/app' });
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to get started with Foundry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Social Login Buttons */}
          <SocialLoginButtons
            onError={setError}
            isFormLoading={isLoading}
            callbackURL="/app"
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2" style={{ backgroundColor: 'hsl(var(--card))', color: 'var(--text-muted)' }}>Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isLoading} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={AUTH_CONFIG.MIN_PASSWORD_LENGTH}
                maxLength={AUTH_CONFIG.MAX_PASSWORD_LENGTH}
                autoComplete="new-password"
              />
              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-1.5">
                  <PasswordRequirement met={checks.length} label={`${AUTH_CONFIG.MIN_PASSWORD_LENGTH}+ characters`} />
                  <PasswordRequirement met={checks.uppercase} label="Uppercase letter" />
                  <PasswordRequirement met={checks.lowercase} label="Lowercase letter" />
                  <PasswordRequirement met={checks.number} label="Number" />
                  <PasswordRequirement met={checks.special} label="Special character" />
                </div>
              )}
              {password.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {AUTH_CONFIG.MIN_PASSWORD_LENGTH}+ characters with uppercase, lowercase, number, and special character
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
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
              disabled={isLoading || (touched && (!allChecksPassed || !passwordsMatch))}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create account'}
            </Button>
            </fieldset>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" search={{ error: undefined }} className="underline" style={{ color: 'var(--edit)' }}>
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
