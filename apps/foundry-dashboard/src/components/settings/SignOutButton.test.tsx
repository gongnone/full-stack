/**
 * Story 1-5: SignOutButton - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignOutButton } from './SignOutButton';

// Mock auth-client
const mockSignOut = vi.fn();
vi.mock('@/lib/auth-client', () => ({
  signOut: () => mockSignOut(),
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock toast
const mockAddToast = vi.fn();
vi.mock('@/lib/toast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

describe('SignOutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders Sign Out heading', () => {
      render(<SignOutButton />);

      expect(screen.getByRole('heading', { name: 'Sign Out' })).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(<SignOutButton />);

      expect(screen.getByText(/Sign out of your current session/)).toBeInTheDocument();
    });

    it('renders Sign Out button', () => {
      render(<SignOutButton />);

      expect(screen.getByTestId('sign-out-btn')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    });
  });

  describe('Sign Out Flow', () => {
    it('calls signOut on button click', async () => {
      const user = userEvent.setup();
      render(<SignOutButton />);

      await user.click(screen.getByTestId('sign-out-btn'));

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('shows loading state while signing out', async () => {
      mockSignOut.mockImplementation(() => new Promise(() => {})); // Never resolves
      const user = userEvent.setup();
      render(<SignOutButton />);

      await user.click(screen.getByTestId('sign-out-btn'));

      expect(screen.getByText('Signing out...')).toBeInTheDocument();
      expect(screen.getByTestId('sign-out-btn')).toBeDisabled();
    });

    it('navigates to /login on success', async () => {
      const user = userEvent.setup();
      render(<SignOutButton />);

      await user.click(screen.getByTestId('sign-out-btn'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
      });
    });

    it('shows error toast on failure', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      render(<SignOutButton />);

      await user.click(screen.getByTestId('sign-out-btn'));

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          'Failed to sign out. Please try again.',
          'error',
          4000
        );
      });
    });

    it('resets loading state on error', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      render(<SignOutButton />);

      await user.click(screen.getByTestId('sign-out-btn'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
        expect(screen.getByTestId('sign-out-btn')).not.toBeDisabled();
      });
    });

    it('does not navigate on error', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      render(<SignOutButton />);

      await user.click(screen.getByTestId('sign-out-btn'));

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalled();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
