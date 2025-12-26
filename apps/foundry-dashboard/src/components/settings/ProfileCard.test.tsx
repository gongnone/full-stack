/**
 * Story 1-5: ProfileCard - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileCard } from './ProfileCard';

// Mock tRPC
const { mockMeQuery, mockUpdateMutation, mockUtils, capturedOnSuccess, capturedOnError } = vi.hoisted(() => ({
  mockMeQuery: vi.fn(),
  mockUpdateMutation: vi.fn(),
  mockUtils: { auth: { me: { invalidate: vi.fn() } } },
  capturedOnSuccess: { current: null as (() => void) | null },
  capturedOnError: { current: null as ((err: Error) => void) | null },
}));

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    useUtils: () => mockUtils,
    auth: {
      me: {
        useQuery: mockMeQuery,
      },
      updateProfile: {
        useMutation: (options?: { onSuccess?: () => void; onError?: (err: Error) => void }) => {
          if (options?.onSuccess) capturedOnSuccess.current = options.onSuccess;
          if (options?.onError) capturedOnError.current = options.onError;
          return {
            mutate: mockUpdateMutation,
            isPending: false,
          };
        },
      },
    },
  },
}));

// Mock toast
const mockAddToast = vi.fn();
vi.mock('@/lib/toast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mock constants
vi.mock('@/lib/constants', () => ({
  UI_CONFIG: {
    USER_PROFILE: {
      MIN_NAME_LENGTH: 2,
      MAX_NAME_LENGTH: 50,
    },
    TOAST_DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
      INFO: 4000,
    },
  },
}));

describe('ProfileCard', () => {
  const mockUserData = {
    user: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      emailVerified: true,
    },
    profile: {
      display_name: 'Johnny',
      avatar_color: '#4A90D9',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnSuccess.current = null;
    capturedOnError.current = null;
  });

  describe('Loading State', () => {
    it('shows loading skeleton while fetching data', () => {
      mockMeQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<ProfileCard />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when fetch fails', () => {
      mockMeQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { message: 'Network error' },
      });

      render(<ProfileCard />);

      expect(screen.getByText('Failed to load profile: Network error')).toBeInTheDocument();
    });
  });

  describe('Profile Display', () => {
    beforeEach(() => {
      mockMeQuery.mockReturnValue({
        data: mockUserData,
        isLoading: false,
        error: null,
      });
    });

    it('renders Profile heading', () => {
      render(<ProfileCard />);

      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('displays user avatar with initial', () => {
      render(<ProfileCard />);

      // Johnny starts with J
      expect(screen.getByLabelText('Avatar for Johnny')).toBeInTheDocument();
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('displays display name from profile', () => {
      render(<ProfileCard />);

      expect(screen.getByText('Johnny')).toBeInTheDocument();
    });

    it('displays user email', () => {
      render(<ProfileCard />);

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('shows Verified badge when email is verified', () => {
      render(<ProfileCard />);

      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByLabelText('Email verified')).toBeInTheDocument();
    });

    it('does not show Verified badge when email is not verified', () => {
      mockMeQuery.mockReturnValue({
        data: {
          ...mockUserData,
          user: { ...mockUserData.user, emailVerified: false },
        },
        isLoading: false,
        error: null,
      });

      render(<ProfileCard />);

      expect(screen.queryByText('Verified')).not.toBeInTheDocument();
    });

    it('shows Display Name input field', () => {
      render(<ProfileCard />);

      expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
    });

    it('shows Email input field as disabled', () => {
      render(<ProfileCard />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toBeDisabled();
    });

    it('shows email cannot be changed message', () => {
      render(<ProfileCard />);

      expect(screen.getByText('Email cannot be changed')).toBeInTheDocument();
    });

    it('shows character counter', () => {
      render(<ProfileCard />);

      // Johnny is 6 chars, max is 50
      expect(screen.getByText('6/50')).toBeInTheDocument();
    });
  });

  describe('Editing Display Name', () => {
    beforeEach(() => {
      mockMeQuery.mockReturnValue({
        data: mockUserData,
        isLoading: false,
        error: null,
      });
    });

    it('shows Save and Cancel buttons when editing', async () => {
      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.click(input);

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('updates character counter on input', async () => {
      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'NewName');

      expect(screen.getByText('7/50')).toBeInTheDocument();
    });

    it('prevents input beyond max length', async () => {
      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      // Try to type more than 50 chars
      await user.type(input, 'A'.repeat(55));

      // Should be capped at 50
      expect(input).toHaveValue('A'.repeat(50));
    });

    it('shows validation error for name too short', async () => {
      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'A');

      expect(screen.getByRole('alert')).toHaveTextContent('Name must be at least 2 characters');
    });

    it('calls mutation on Save click', async () => {
      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'NewName');

      const saveBtn = screen.getByTestId('save-profile-btn');
      await user.click(saveBtn);

      expect(mockUpdateMutation).toHaveBeenCalledWith({ displayName: 'NewName' });
    });

    it('shows success toast and invalidates query on success', async () => {
      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'NewName');

      const saveBtn = screen.getByTestId('save-profile-btn');
      await user.click(saveBtn);

      // Trigger success callback
      capturedOnSuccess.current?.();

      expect(mockAddToast).toHaveBeenCalledWith('Profile updated', 'success', 3000);
      expect(mockUtils.auth.me.invalidate).toHaveBeenCalled();
    });

    it('shows error toast on mutation error', async () => {
      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.click(input);

      // Trigger error callback
      capturedOnError.current?.(new Error('Server error'));

      expect(mockAddToast).toHaveBeenCalledWith('Server error', 'error', 5000);
    });

    it('closes edit mode on Cancel click', async () => {
      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.click(input);
      await user.clear(input);
      await user.type(input, 'ChangedName');

      const cancelBtn = screen.getByText('Cancel');
      await user.click(cancelBtn);

      // Should revert and hide buttons
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
      expect(input).toHaveValue('Johnny'); // Reverted to original
    });
  });

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      mockMeQuery.mockReturnValue({
        data: mockUserData,
        isLoading: false,
        error: null,
      });
    });

    it('saves on Enter key', async () => {
      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'NewName{Enter}');

      expect(mockUpdateMutation).toHaveBeenCalledWith({ displayName: 'NewName' });
    });

    it('cancels on Escape key', async () => {
      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.click(input);
      await user.clear(input);
      await user.type(input, 'ChangedName');
      await user.keyboard('{Escape}');

      // Should revert
      expect(input).toHaveValue('Johnny');
    });
  });

  describe('Fallback Values', () => {
    it('uses user.name when no display_name', () => {
      mockMeQuery.mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john@example.com',
            emailVerified: false,
          },
          profile: {},
        },
        isLoading: false,
        error: null,
      });

      render(<ProfileCard />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('J')).toBeInTheDocument(); // Initial
    });

    it('uses default avatar color when not set', () => {
      mockMeQuery.mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            name: 'Jane',
            email: 'jane@example.com',
            emailVerified: false,
          },
          profile: {},
        },
        isLoading: false,
        error: null,
      });

      render(<ProfileCard />);

      const avatar = screen.getByLabelText('Avatar for Jane');
      expect(avatar).toHaveStyle({ backgroundColor: 'var(--edit)' });
    });

    it('shows U initial when no name available', () => {
      mockMeQuery.mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'unknown@example.com',
            emailVerified: false,
          },
          profile: {},
        },
        isLoading: false,
        error: null,
      });

      render(<ProfileCard />);

      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('Button State', () => {
    it('disables Save button when name is too short', async () => {
      mockMeQuery.mockReturnValue({
        data: mockUserData,
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<ProfileCard />);

      const input = screen.getByTestId('display-name-input');
      await user.clear(input);
      await user.type(input, 'A');

      const saveBtn = screen.getByTestId('save-profile-btn');
      expect(saveBtn).toBeDisabled();
    });
  });
});
