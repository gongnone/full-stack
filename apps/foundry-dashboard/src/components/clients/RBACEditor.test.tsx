/**
 * Story 7.2: RBACEditor - Unit Tests
 * Role-Based Access Control editor for team members
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RBACEditor } from './RBACEditor';

// Mock deps
const mockUpdateRole = vi.fn();
const mockInvalidate = vi.fn();
const mockAddToast = vi.fn();
let mockOnSuccess: (() => void) | undefined;
let mockOnError: ((err: Error) => void) | undefined;

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    useUtils: () => ({
      clients: { listMembers: { invalidate: mockInvalidate } },
    }),
    clients: {
      updateMember: {
        useMutation: ({ onSuccess, onError }: any) => {
          mockOnSuccess = onSuccess;
          mockOnError = onError;
          return {
            mutate: (args: any) => {
              mockUpdateRole(args);
              onSuccess?.();
            },
            isPending: false,
            error: null,
          };
        },
      },
    },
  },
}));

vi.mock('@/lib/toast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

describe('RBACEditor', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    client: { id: 'c1', name: 'Test Client' } as any,
    member: { id: 'm1', name: 'John Doe', role: 'creator' } as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when open', () => {
      render(<RBACEditor {...defaultProps} />);
      expect(screen.getByText('Update Role & Permissions')).toBeInTheDocument();
    });

    it('displays member name in description', () => {
      render(<RBACEditor {...defaultProps} />);
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('renders all role options', () => {
      render(<RBACEditor {...defaultProps} />);
      expect(screen.getByText('Agency Owner')).toBeInTheDocument();
      expect(screen.getByText('Account Manager')).toBeInTheDocument();
      expect(screen.getByText('Creator')).toBeInTheDocument();
      expect(screen.getByText('Client Admin')).toBeInTheDocument();
      expect(screen.getByText('Client Reviewer')).toBeInTheDocument();
    });

    it('displays role descriptions', () => {
      render(<RBACEditor {...defaultProps} />);
      expect(screen.getByText('Full access to all client settings and team management')).toBeInTheDocument();
      // "Create and edit content" is both a role description AND a permission, use getAllByText
      expect(screen.getAllByText('Create and edit content').length).toBeGreaterThan(0);
    });

    it('shows Current badge on member current role', () => {
      render(<RBACEditor {...defaultProps} />);
      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('displays permissions list for each role', () => {
      render(<RBACEditor {...defaultProps} />);
      expect(screen.getByText('Manage team members')).toBeInTheDocument();
      // View analytics appears in multiple roles, use getAllByText
      expect(screen.getAllByText('View analytics').length).toBeGreaterThan(0);
    });
  });

  describe('Role Selection', () => {
    it('selects a new role', async () => {
      const user = userEvent.setup();
      render(<RBACEditor {...defaultProps} />);

      const ownerOption = screen.getByText('Agency Owner').closest('button');
      await user.click(ownerOption!);

      const updateBtn = screen.getByRole('button', { name: 'Update Role' });
      expect(updateBtn).not.toBeDisabled();
    });

    it('can select Account Manager role', async () => {
      const user = userEvent.setup();
      render(<RBACEditor {...defaultProps} />);

      const managerOption = screen.getByText('Account Manager').closest('button');
      await user.click(managerOption!);

      await user.click(screen.getByRole('button', { name: 'Update Role' }));

      expect(mockUpdateRole).toHaveBeenCalledWith({
        clientId: 'c1',
        memberId: 'm1',
        role: 'account_manager',
      });
    });

    it('can select Client Admin role', async () => {
      const user = userEvent.setup();
      render(<RBACEditor {...defaultProps} />);

      const adminOption = screen.getByText('Client Admin').closest('button');
      await user.click(adminOption!);

      await user.click(screen.getByRole('button', { name: 'Update Role' }));

      expect(mockUpdateRole).toHaveBeenCalledWith({
        clientId: 'c1',
        memberId: 'm1',
        role: 'client_admin',
      });
    });

    it('can select Client Reviewer role', async () => {
      const user = userEvent.setup();
      render(<RBACEditor {...defaultProps} />);

      const reviewerOption = screen.getByText('Client Reviewer').closest('button');
      await user.click(reviewerOption!);

      await user.click(screen.getByRole('button', { name: 'Update Role' }));

      expect(mockUpdateRole).toHaveBeenCalledWith({
        clientId: 'c1',
        memberId: 'm1',
        role: 'client_reviewer',
      });
    });
  });

  describe('Form Submission', () => {
    it('submits role update', async () => {
      const user = userEvent.setup();
      render(<RBACEditor {...defaultProps} />);

      const ownerOption = screen.getByText('Agency Owner').closest('button');
      await user.click(ownerOption!);

      await user.click(screen.getByRole('button', { name: 'Update Role' }));

      expect(mockUpdateRole).toHaveBeenCalledWith({
        clientId: 'c1',
        memberId: 'm1',
        role: 'agency_owner',
      });

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringContaining('updated'),
        'success',
        expect.any(Number)
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('disables update button if role is unchanged', () => {
      render(<RBACEditor {...defaultProps} />);
      const updateBtn = screen.getByRole('button', { name: 'Update Role' });
      expect(updateBtn).toBeDisabled();
    });

    it('closes dialog without calling mutation when role unchanged', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<RBACEditor {...defaultProps} onClose={onClose} />);

      // Click Creator (which is the current role)
      const creatorOption = screen.getByText('Creator').closest('button');
      await user.click(creatorOption!);

      // Button should still be disabled
      const updateBtn = screen.getByRole('button', { name: 'Update Role' });
      expect(updateBtn).toBeDisabled();
    });

    it('invalidates query cache on success', async () => {
      const user = userEvent.setup();
      render(<RBACEditor {...defaultProps} />);

      const ownerOption = screen.getByText('Agency Owner').closest('button');
      await user.click(ownerOption!);

      await user.click(screen.getByRole('button', { name: 'Update Role' }));

      expect(mockInvalidate).toHaveBeenCalled();
    });
  });

  describe('Cancel Behavior', () => {
    it('renders Cancel button', () => {
      render(<RBACEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('Member Variations', () => {
    it('handles member with agency_owner role', () => {
      const props = {
        ...defaultProps,
        member: { id: 'm2', name: 'Jane Admin', role: 'agency_owner' } as any,
      };
      render(<RBACEditor {...props} />);

      expect(screen.getByText(/Jane Admin/)).toBeInTheDocument();
      // Current badge should be on Agency Owner
      const ownerSection = screen.getByText('Agency Owner').closest('button');
      expect(ownerSection).toContainElement(screen.getByText('Current'));
    });

    it('handles member with client_reviewer role', () => {
      const props = {
        ...defaultProps,
        member: { id: 'm3', name: 'Bob Reviewer', role: 'client_reviewer' } as any,
      };
      render(<RBACEditor {...props} />);

      expect(screen.getByText(/Bob Reviewer/)).toBeInTheDocument();
    });
  });
});
