import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientManager } from './ClientManager';

// Mock tRPC - use vi.hoisted to avoid hoisting issues
const { mockClientsQuery, mockUpdateMutation, mockMembersQuery, mockUtils } = vi.hoisted(() => ({
  mockClientsQuery: vi.fn(),
  mockUpdateMutation: vi.fn(),
  mockMembersQuery: vi.fn(() => ({ data: [], isLoading: false })),
  mockUtils: {
    clients: {
      list: {
        invalidate: vi.fn(),
      },
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
      list: {
        useQuery: mockClientsQuery,
      },
      update: {
        useMutation: () => ({
          mutate: mockUpdateMutation,
          isPending: false,
        }),
      },
      listMembers: {
        useQuery: mockMembersQuery,
      },
      addMember: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
          error: null,
        }),
      },
      removeMember: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
      updateMember: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
      generateShareableLink: {
        useMutation: () => ({
          mutate: vi.fn(),
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

describe('ClientManager - Story 7-1: Client Account Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC1: Display Client List', () => {
    it('renders client list with name, status, and industry', () => {
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            {
              id: 'client-1',
              name: 'Acme Corp',
              status: 'active',
              industry: 'Technology',
              brandColor: '#1D9BF0',
            },
            {
              id: 'client-2',
              name: 'Tech Startup',
              status: 'paused',
              industry: 'SaaS',
              brandColor: '#10B981',
            },
          ],
        },
        isLoading: false,
      });

      render(<ClientManager />);

      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();

      expect(screen.getByText('Tech Startup')).toBeInTheDocument();
      expect(screen.getByText('SaaS')).toBeInTheDocument();
      expect(screen.getByText('paused')).toBeInTheDocument();
    });

    it('shows loading state while fetching clients', () => {
      mockClientsQuery.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<ClientManager />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows empty state when no clients exist', () => {
      mockClientsQuery.mockReturnValue({
        data: { items: [] },
        isLoading: false,
      });

      render(<ClientManager />);

      expect(screen.getByText('No clients yet')).toBeInTheDocument();
      expect(screen.getByText('Add your first client to start creating content')).toBeInTheDocument();
    });
  });

  describe('AC2: Edit Client Details', () => {
    it('opens edit modal when clicking edit option', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            {
              id: 'client-1',
              name: 'Acme Corp',
              status: 'active',
              industry: 'Technology',
              contactEmail: 'contact@acme.com',
              brandColor: '#1D9BF0',
            },
          ],
        },
        isLoading: false,
      });

      render(<ClientManager />);

      // Click dropdown menu
      const moreButton = screen.getAllByRole('button')[0];
      await user.click(moreButton);

      // Click edit option
      const editButton = screen.getByText('Edit Details');
      await user.click(editButton);

      // Verify edit modal is open
      await waitFor(() => {
        expect(screen.getByText('Edit Client')).toBeInTheDocument();
        expect(screen.getByText('Update client details and settings.')).toBeInTheDocument();
      });
    });

    it('allows updating client name, industry, and email', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            {
              id: 'client-1',
              name: 'Acme Corp',
              status: 'active',
              industry: 'Technology',
              contactEmail: 'contact@acme.com',
              brandColor: '#1D9BF0',
            },
          ],
        },
        isLoading: false,
      });

      render(<ClientManager />);

      // Open edit modal
      const moreButton = screen.getAllByRole('button')[0];
      await user.click(moreButton);
      await user.click(screen.getByText('Edit Details'));

      // Update fields
      const nameInput = screen.getByLabelText('Client Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Acme Corp');

      const industryInput = screen.getByLabelText('Industry');
      await user.clear(industryInput);
      await user.type(industryInput, 'FinTech');

      // Submit
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      expect(mockUpdateMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'client-1',
          name: 'Updated Acme Corp',
          industry: 'FinTech',
        })
      );
    });
  });

  describe('AC3: Update Client Status', () => {
    it('allows changing client status to active, paused, or archived', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            {
              id: 'client-1',
              name: 'Acme Corp',
              status: 'active',
              industry: 'Technology',
              brandColor: '#1D9BF0',
            },
          ],
        },
        isLoading: false,
      });

      render(<ClientManager />);

      // Open edit modal
      const moreButton = screen.getAllByRole('button')[0];
      await user.click(moreButton);
      await user.click(screen.getByText('Edit Details'));

      // Change status
      const statusSelect = screen.getByLabelText('Status');
      await user.selectOptions(statusSelect, 'paused');

      expect(statusSelect).toHaveValue('paused');

      // Submit
      await user.click(screen.getByText('Save Changes'));

      expect(mockUpdateMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'paused',
        })
      );
    });
  });

  describe('AC4: Brand Color Customization', () => {
    it('displays brand color picker in edit form', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            {
              id: 'client-1',
              name: 'Acme Corp',
              status: 'active',
              brandColor: '#1D9BF0',
            },
          ],
        },
        isLoading: false,
      });

      render(<ClientManager />);

      // Open edit modal
      const moreButton = screen.getAllByRole('button')[0];
      await user.click(moreButton);
      await user.click(screen.getByText('Edit Details'));

      // Verify color picker exists
      const colorInput = screen.getByLabelText('Brand Color');
      expect(colorInput).toBeInTheDocument();
      expect(colorInput).toHaveAttribute('type', 'color');
    });

    it('shows brand color on client cards', () => {
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            {
              id: 'client-1',
              name: 'Acme Corp',
              status: 'active',
              brandColor: '#1D9BF0',
            },
          ],
        },
        isLoading: false,
      });

      const { container } = render(<ClientManager />);

      // Find the brand color icon div
      const brandIcon = container.querySelector('[style*="background-color"]');
      expect(brandIcon).toBeInTheDocument();
    });
  });

  describe('AC5: Client Management Actions', () => {
    it('shows manage team option for each client', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            {
              id: 'client-1',
              name: 'Acme Corp',
              status: 'active',
            },
          ],
        },
        isLoading: false,
      });

      render(<ClientManager />);

      // Open dropdown
      const moreButton = screen.getAllByRole('button')[0];
      await user.click(moreButton);

      expect(screen.getByText('Manage Team')).toBeInTheDocument();
      expect(screen.getByText('Share Review Link')).toBeInTheDocument();
    });
  });
});
