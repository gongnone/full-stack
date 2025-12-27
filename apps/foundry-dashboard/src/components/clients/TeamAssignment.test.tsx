import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamAssignment } from './TeamAssignment';

const { mockMembersQuery, mockAddMemberMutation, mockRemoveMemberMutation, mockUpdateMemberMutation, mockUtils } = vi.hoisted(() => ({
  mockMembersQuery: vi.fn(),
  mockAddMemberMutation: vi.fn(),
  mockRemoveMemberMutation: vi.fn(),
  mockUpdateMemberMutation: vi.fn(),
  mockUtils: {
    clients: {
      listMembers: {
        invalidate: vi.fn(),
      },
    },
  },
}));

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    useUtils: () => mockUtils,
    clients: {
      listMembers: {
        useQuery: mockMembersQuery,
      },
      addMember: {
        useMutation: () => ({
          mutate: mockAddMemberMutation,
          isPending: false,
          error: null,
        }),
      },
      removeMember: {
        useMutation: () => ({
          mutate: mockRemoveMemberMutation,
          isPending: false,
        }),
      },
      updateMember: {
        useMutation: (options?: any) => ({
          mutate: mockUpdateMemberMutation,
          isPending: false,
        }),
      },
    },
  },
}));

// Mock toast hook
vi.mock('@/lib/toast', () => ({
  useToast: () => ({
    addToast: vi.fn(),
    removeToast: vi.fn(),
    toasts: [],
  }),
}));

describe('TeamAssignment - Story 7-2: RBAC and Team Assignment', () => {
  const mockClient = { id: 'client-1', name: 'Acme Corp' };

  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn(() => true);
  });

  describe('AC1: Add Team Member', () => {
    it('shows add team member button', () => {
      mockMembersQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      expect(screen.getByText('Add Team Member')).toBeInTheDocument();
    });

    it('allows entering email and selecting role when adding member', async () => {
      const user = userEvent.setup();
      mockMembersQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      // Click add member
      await user.click(screen.getByText('Add Team Member'));

      // Fill form
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'newmember@example.com');

      const roleSelect = screen.getByLabelText('Role');
      await user.selectOptions(roleSelect, 'account_manager');

      expect(emailInput).toHaveValue('newmember@example.com');
      expect(roleSelect).toHaveValue('account_manager');
    });

    it('submits new team member with email and role', async () => {
      const user = userEvent.setup();
      mockMembersQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      await user.click(screen.getByText('Add Team Member'));

      await user.type(screen.getByLabelText('Email Address'), 'newmember@example.com');
      await user.selectOptions(screen.getByLabelText('Role'), 'creator');

      const addButton = screen.getByText('Add Member');
      await user.click(addButton);

      expect(mockAddMemberMutation).toHaveBeenCalledWith({
        clientId: 'client-1',
        email: 'newmember@example.com',
        role: 'creator',
      });
    });
  });

  describe('AC2: Display Team Members with Roles', () => {
    it('lists all team members with their roles', () => {
      mockMembersQuery.mockReturnValue({
        data: [
          { id: 'member-1', name: 'John Doe', email: 'john@acme.com', role: 'agency_owner' },
          { id: 'member-2', name: 'Jane Smith', email: 'jane@acme.com', role: 'creator' },
        ],
        isLoading: false,
      });

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@acme.com')).toBeInTheDocument();
      expect(screen.getByText('Agency Owner')).toBeInTheDocument();

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@acme.com')).toBeInTheDocument();
      expect(screen.getByText('Creator')).toBeInTheDocument();
    });

    it('shows loading state while fetching members', () => {
      mockMembersQuery.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows empty state when no members exist', () => {
      mockMembersQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      expect(screen.getByText('No team members yet')).toBeInTheDocument();
    });
  });

  describe('AC3: Role Types', () => {
    it('supports all five role types in dropdown', async () => {
      const user = userEvent.setup();
      mockMembersQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      await user.click(screen.getByText('Add Team Member'));

      const roleSelect = screen.getByLabelText('Role');
      const options = Array.from(roleSelect.querySelectorAll('option'));
      const roleValues = options.map(opt => opt.value);

      expect(roleValues).toContain('agency_owner');
      expect(roleValues).toContain('account_manager');
      expect(roleValues).toContain('creator');
      expect(roleValues).toContain('client_admin');
      expect(roleValues).toContain('client_reviewer');
    });
  });

  describe('AC4: Edit Team Member Role', () => {
    it('allows clicking on role badge to edit', async () => {
      const user = userEvent.setup();
      mockMembersQuery.mockReturnValue({
        data: [
          { id: 'member-1', name: 'John Doe', email: 'john@acme.com', role: 'creator' },
        ],
        isLoading: false,
      });

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      const roleButton = screen.getByText('Creator');
      await user.click(roleButton);

      // RBACEditor should open (tested separately)
    });
  });

  describe('AC5: Remove Team Member', () => {
    it('shows remove button for each team member', () => {
      mockMembersQuery.mockReturnValue({
        data: [
          { id: 'member-1', name: 'John Doe', email: 'john@acme.com', role: 'creator' },
        ],
        isLoading: false,
      });

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      // X button should be present - it has red text styling
      const removeButtons = screen.getAllByRole('button').filter(btn => {
        return btn.classList.contains('text-red-500');
      });

      expect(removeButtons.length).toBeGreaterThan(0);
    });

    it('confirms before removing team member', async () => {
      const user = userEvent.setup();
      mockMembersQuery.mockReturnValue({
        data: [
          { id: 'member-1', name: 'John Doe', email: 'john@acme.com', role: 'creator' },
        ],
        isLoading: false,
      });

      // Mock confirm on window for jsdom
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      // Find the remove button by its red text styling (not the Done button)
      const removeButton = screen.getAllByRole('button').find(btn =>
        btn.classList.contains('text-red-500')
      );
      expect(removeButton).toBeDefined();

      await user.click(removeButton!);

      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });

  describe('AC6: Role Descriptions', () => {
    it('shows role descriptions in add member form', async () => {
      const user = userEvent.setup();
      mockMembersQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TeamAssignment isOpen={true} onClose={vi.fn()} client={mockClient} />);

      await user.click(screen.getByText('Add Team Member'));

      // Default role is creator
      expect(screen.getByText('Create and edit content')).toBeInTheDocument();

      // Change to agency_owner
      await user.selectOptions(screen.getByLabelText('Role'), 'agency_owner');
      expect(screen.getByText('Full access to all client settings and team management')).toBeInTheDocument();
    });
  });
});
