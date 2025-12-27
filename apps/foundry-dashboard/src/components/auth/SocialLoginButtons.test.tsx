import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialLoginButtons } from './SocialLoginButtons';
import { signIn } from '@/lib/auth-client';

// Get the mocked signIn
const mockSignIn = vi.mocked(signIn);

describe('SocialLoginButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('[P0] should render Google sign-in button', () => {
      // GIVEN: Component is rendered
      render(<SocialLoginButtons />);

      // THEN: Google button is visible
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    it('[P0] should render GitHub sign-in button', () => {
      // GIVEN: Component is rendered
      render(<SocialLoginButtons />);

      // THEN: GitHub button is visible
      expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();
    });

    it('[P1] should render both buttons as enabled by default', () => {
      // GIVEN: Component is rendered without loading state
      render(<SocialLoginButtons />);

      // THEN: Both buttons are enabled
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      const githubButton = screen.getByRole('button', { name: /continue with github/i });
      expect(googleButton).not.toBeDisabled();
      expect(githubButton).not.toBeDisabled();
    });
  });

  describe('Google sign-in flow', () => {
    it('[P0] should call signIn.social with google provider on click', async () => {
      // GIVEN: User setup and component rendered
      const user = userEvent.setup();
      render(<SocialLoginButtons callbackURL="/dashboard" />);

      // WHEN: User clicks Google button
      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      // THEN: signIn.social called with correct params
      expect(mockSignIn.social).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    });

    it('[P1] should show loading state when Google sign-in is clicked', async () => {
      // GIVEN: User setup and component rendered
      const user = userEvent.setup();
      render(<SocialLoginButtons />);

      // WHEN: User clicks Google button
      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      // THEN: Shows connecting state
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('[P1] should disable both buttons during Google sign-in', async () => {
      // GIVEN: User setup and component rendered
      const user = userEvent.setup();
      render(<SocialLoginButtons />);

      // WHEN: User clicks Google button
      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      // THEN: Both buttons are disabled
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('GitHub sign-in flow', () => {
    it('[P0] should call signIn.social with github provider on click', async () => {
      // GIVEN: User setup and component rendered
      const user = userEvent.setup();
      render(<SocialLoginButtons callbackURL="/app" />);

      // WHEN: User clicks GitHub button
      await user.click(screen.getByRole('button', { name: /continue with github/i }));

      // THEN: signIn.social called with correct params
      expect(mockSignIn.social).toHaveBeenCalledWith({
        provider: 'github',
        callbackURL: '/app',
      });
    });

    it('[P1] should show loading state when GitHub sign-in is clicked', async () => {
      // GIVEN: User setup and component rendered
      const user = userEvent.setup();
      render(<SocialLoginButtons />);

      // WHEN: User clicks GitHub button
      await user.click(screen.getByRole('button', { name: /continue with github/i }));

      // THEN: Shows connecting state
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('[P1] should call onError when Google sign-in fails', async () => {
      // GIVEN: signIn.social rejects and onError callback provided
      const onError = vi.fn();
      mockSignIn.social.mockRejectedValueOnce(new Error('Auth failed'));
      const user = userEvent.setup();
      render(<SocialLoginButtons onError={onError} />);

      // WHEN: User clicks Google button
      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      // THEN: onError is called with Google-specific message
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Failed to sign in with Google. Please try again.');
      });
    });

    it('[P1] should call onError when GitHub sign-in fails', async () => {
      // GIVEN: signIn.social rejects and onError callback provided
      const onError = vi.fn();
      mockSignIn.social.mockRejectedValueOnce(new Error('Auth failed'));
      const user = userEvent.setup();
      render(<SocialLoginButtons onError={onError} />);

      // WHEN: User clicks GitHub button
      await user.click(screen.getByRole('button', { name: /continue with github/i }));

      // THEN: onError is called with GitHub-specific message
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Failed to sign in with GitHub. Please try again.');
      });
    });

    it('[P1] should reset loading state after error', async () => {
      // GIVEN: signIn.social rejects
      mockSignIn.social.mockRejectedValueOnce(new Error('Auth failed'));
      const user = userEvent.setup();
      render(<SocialLoginButtons onError={vi.fn()} />);

      // WHEN: User clicks Google button and it fails
      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      // THEN: Loading state is reset, button text returns to normal
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      });
    });
  });

  describe('form loading integration', () => {
    it('[P1] should disable buttons when isFormLoading is true', () => {
      // GIVEN: Component rendered with isFormLoading=true
      render(<SocialLoginButtons isFormLoading={true} />);

      // THEN: Both buttons are disabled
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      const githubButton = screen.getByRole('button', { name: /continue with github/i });
      expect(googleButton).toBeDisabled();
      expect(githubButton).toBeDisabled();
    });

    it('[P1] should not disable buttons when isFormLoading is false', () => {
      // GIVEN: Component rendered with isFormLoading=false
      render(<SocialLoginButtons isFormLoading={false} />);

      // THEN: Both buttons are enabled
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      const githubButton = screen.getByRole('button', { name: /continue with github/i });
      expect(googleButton).not.toBeDisabled();
      expect(githubButton).not.toBeDisabled();
    });
  });

  describe('callback URL', () => {
    it('[P1] should use default callbackURL of /app', async () => {
      // GIVEN: Component rendered without callbackURL
      const user = userEvent.setup();
      render(<SocialLoginButtons />);

      // WHEN: User clicks Google button
      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      // THEN: signIn.social called with default /app callback
      expect(mockSignIn.social).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/app',
      });
    });

    it('[P1] should use custom callbackURL when provided', async () => {
      // GIVEN: Component rendered with custom callbackURL
      const user = userEvent.setup();
      render(<SocialLoginButtons callbackURL="/custom-dashboard" />);

      // WHEN: User clicks Google button
      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      // THEN: signIn.social called with custom callback
      expect(mockSignIn.social).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/custom-dashboard',
      });
    });
  });

  // Note: Timeout fallback test skipped - fake timers conflict with React 19
  // The component has a 5-second timeout to reset loading state as a fallback
});
