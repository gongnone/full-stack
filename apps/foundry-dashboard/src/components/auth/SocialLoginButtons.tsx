import { useState, useEffect } from 'react';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { GoogleIcon, GitHubIcon } from '@/components/icons';

type Provider = 'google' | 'github';

const PROVIDER_NAMES: Record<Provider, string> = {
  google: 'Google',
  github: 'GitHub',
};

interface SocialLoginButtonsProps {
  /** Called when a social sign-in error occurs */
  onError?: (message: string) => void;
  /** Whether email/password form is loading */
  isFormLoading?: boolean;
  /** Callback URL after successful OAuth */
  callbackURL?: string;
}

export function SocialLoginButtons({
  onError,
  isFormLoading = false,
  callbackURL = '/app',
}: SocialLoginButtonsProps) {
  const [socialLoading, setSocialLoading] = useState<Provider | null>(null);

  // Reset loading state after timeout (fallback for redirect failures)
  useEffect(() => {
    if (socialLoading) {
      const timeout = setTimeout(() => {
        setSocialLoading(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [socialLoading]);

  const handleSocialSignIn = async (provider: Provider) => {
    setSocialLoading(provider);

    try {
      await signIn.social({
        provider,
        callbackURL,
      });
      // Note: This typically redirects, so code below won't execute
    } catch (err) {
      onError?.(`Failed to sign in with ${PROVIDER_NAMES[provider]}. Please try again.`);
      setSocialLoading(null);
    }
  };

  const isDisabled = socialLoading !== null || isFormLoading;

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialSignIn('google')}
        disabled={isDisabled}
      >
        {socialLoading === 'google' ? (
          'Connecting...'
        ) : (
          <>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Continue with Google
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialSignIn('github')}
        disabled={isDisabled}
      >
        {socialLoading === 'github' ? (
          'Connecting...'
        ) : (
          <>
            <GitHubIcon className="mr-2 h-4 w-4" />
            Continue with GitHub
          </>
        )}
      </Button>
    </div>
  );
}
