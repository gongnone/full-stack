import * as React from 'react';
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';

/**
 * SocialAccountsCard component for linking social media accounts
 * Phase 2B: Twitter/X OAuth integration for direct posting
 *
 * When Twitter API approval is received:
 * 1. Set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET in environment
 * 2. Users can link their Twitter account from this card
 * 3. Linked accounts enable direct posting from Export flow
 *
 * TODO: Add linkedAccounts query when Better Auth account listing is implemented
 */

interface SocialAccount {
  provider: string;
  displayName: string;
  icon: string;
  connected: boolean;
  username?: string;
  comingSoon?: boolean;
}

export function SocialAccountsCard() {
  const { addToast } = useToast();
  const [isConnecting, setIsConnecting] = React.useState<string | null>(null);

  // TODO: Query linked accounts when Better Auth implements account listing
  // For MVP, all accounts show as "Coming Soon" until API approvals land
  const linkedAccounts: Array<{ provider: string; accountId: string }> = [];

  const isTwitterLinked = linkedAccounts.some((a) => a.provider === 'twitter');

  const socialAccounts: SocialAccount[] = [
    {
      provider: 'twitter',
      displayName: 'Twitter / X',
      icon: '𝕏',
      connected: isTwitterLinked,
      username: linkedAccounts.find((a) => a.provider === 'twitter')?.accountId,
      comingSoon: true, // Will flip to false when API approval lands
    },
    {
      provider: 'linkedin',
      displayName: 'LinkedIn',
      icon: 'in',
      connected: false,
      comingSoon: true,
    },
    {
      provider: 'facebook',
      displayName: 'Facebook',
      icon: 'f',
      connected: false,
      comingSoon: true,
    },
    {
      provider: 'instagram',
      displayName: 'Instagram',
      icon: '📷',
      connected: false,
      comingSoon: true,
    },
  ];

  const handleConnect = async (provider: string) => {
    if (socialAccounts.find((a) => a.provider === provider)?.comingSoon) {
      addToast(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} integration coming soon! Awaiting API approval.`,
        'info',
        4000
      );
      return;
    }

    setIsConnecting(provider);
    try {
      // Use Better Auth's social sign-in for account linking
      // This will redirect to the provider's OAuth flow
      const result = await authClient.signIn.social({
        provider: provider as 'twitter' | 'google' | 'github',
        callbackURL: '/app/settings?linked=' + provider,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // OAuth will redirect, so this may not execute
      addToast(`Connecting to ${provider}...`, 'info', 2000);
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error);
      addToast(
        `Failed to connect ${provider}. Please try again.`,
        'error',
        4000
      );
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (_provider: string) => {
    // TODO: Implement account unlinking when Better Auth supports it
    addToast(
      'Account unlinking coming soon. Contact support if you need to disconnect.',
      'info',
      4000
    );
  };

  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <h2
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        Connected Accounts
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        Link your social media accounts to post content directly from Foundry.
      </p>

      <div className="space-y-3">
        {socialAccounts.map((account) => (
          <div
            key={account.provider}
            className="flex items-center justify-between p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Provider icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                style={{
                  backgroundColor:
                    account.provider === 'twitter'
                      ? '#000000'
                      : account.provider === 'linkedin'
                        ? '#0A66C2'
                        : account.provider === 'facebook'
                          ? '#1877F2'
                          : '#E4405F',
                  color: '#FFFFFF',
                }}
              >
                {account.icon}
              </div>

              <div>
                <p
                  className="font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {account.displayName}
                  {account.comingSoon && (
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </p>
                {account.connected && account.username && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    @{account.username}
                  </p>
                )}
                {!account.connected && !account.comingSoon && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Not connected
                  </p>
                )}
              </div>
            </div>

            {/* Connect/Disconnect button */}
            {account.connected ? (
              <Button
                variant="cancel"
                size="sm"
                onClick={() => handleDisconnect(account.provider)}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant={account.comingSoon ? 'outline' : 'approve'}
                size="sm"
                onClick={() => handleConnect(account.provider)}
                disabled={isConnecting === account.provider}
              >
                {isConnecting === account.provider
                  ? 'Connecting...'
                  : account.comingSoon
                    ? 'Notify Me'
                    : 'Connect'}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Info about what linking enables */}
      <div
        className="mt-4 p-3 rounded-lg text-sm"
        style={{
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-secondary)',
        }}
      >
        <strong>Why connect?</strong> Linking your accounts enables one-click
        posting from the Export flow. Your content, engagement predictions, and
        platform optimizations will be ready to publish instantly.
      </div>
    </div>
  );
}
