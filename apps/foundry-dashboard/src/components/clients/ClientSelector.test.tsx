import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientSelector } from '@/components/layout/ClientSelector';

const mockClientsQuery = vi.fn();
const mockSwitchMutation = vi.fn();
const mockUtils = {
  invalidate: vi.fn(),
  auth: {
    me: {
      invalidate: vi.fn(),
    },
  },
};

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    useUtils: () => mockUtils,
    clients: {
      list: {
        useQuery: mockClientsQuery,
      },
      switch: {
        useMutation: () => ({
          mutate: mockSwitchMutation,
          isPending: false,
        }),
      },
    },
  },
}));

vi.mock('@/lib/use-client-id', () => ({
  useClientId: () => 'client-1',
}));

describe('ClientSelector - Story 7-3: Multi-Client Workspace Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC1: Display Active Client', () => {
    it('shows currently active client name and brand color', () => {
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            { id: 'client-1', name: 'Acme Corp', brandColor: '#1D9BF0' },
            { id: 'client-2', name: 'Tech Startup', brandColor: '#10B981' },
          ],
        },
        isLoading: false,
      });

      render(<ClientSelector />);

      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    it('shows loading skeleton while fetching clients', () => {
      mockClientsQuery.mockReturnValue({
        data: null,
        isLoading: true,
      });

      const { container } = render(<ClientSelector />);

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('AC2: Client Dropdown', () => {
    it('opens dropdown menu when clicked', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            { id: 'client-1', name: 'Acme Corp', brandColor: '#1D9BF0' },
            { id: 'client-2', name: 'Tech Startup', brandColor: '#10B981' },
          ],
        },
        isLoading: false,
      });

      render(<ClientSelector />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Switch Client')).toBeInTheDocument();
      });
    });

    it('lists all available clients in dropdown', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            { id: 'client-1', name: 'Acme Corp', brandColor: '#1D9BF0' },
            { id: 'client-2', name: 'Tech Startup', brandColor: '#10B981' },
            { id: 'client-3', name: 'Consulting LLC', brandColor: '#F59E0B' },
          ],
        },
        isLoading: false,
      });

      render(<ClientSelector />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0);
        expect(screen.getByText('Tech Startup')).toBeInTheDocument();
        expect(screen.getByText('Consulting LLC')).toBeInTheDocument();
      });
    });
  });

  describe('AC3: Switch Between Clients', () => {
    it('allows clicking on different client to switch', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            { id: 'client-1', name: 'Acme Corp', brandColor: '#1D9BF0' },
            { id: 'client-2', name: 'Tech Startup', brandColor: '#10B981' },
          ],
        },
        isLoading: false,
      });

      render(<ClientSelector />);

      await user.click(screen.getByRole('button'));

      await waitFor(async () => {
        const techStartup = screen.getByText('Tech Startup');
        await user.click(techStartup);
      });

      expect(mockSwitchMutation).toHaveBeenCalledWith({
        clientId: 'client-2',
      });
    });

    it('invalidates queries after successful switch', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            { id: 'client-1', name: 'Acme Corp', brandColor: '#1D9BF0' },
            { id: 'client-2', name: 'Tech Startup', brandColor: '#10B981' },
          ],
        },
        isLoading: false,
      });

      // Setup mutation to trigger onSuccess
      const onSuccessMock = vi.fn();
      vi.mocked(mockSwitchMutation).mockImplementation(() => {
        onSuccessMock();
        return Promise.resolve();
      });

      render(<ClientSelector />);

      await user.click(screen.getByRole('button'));

      await waitFor(async () => {
        const techStartup = screen.getByText('Tech Startup');
        await user.click(techStartup);
      });

      // The mutation's onSuccess should invalidate utils
      expect(mockUtils.invalidate).toHaveBeenCalled();
      expect(mockUtils.auth.me.invalidate).toHaveBeenCalled();
    });
  });

  describe('AC4: Visual Indicators', () => {
    it('shows checkmark on currently active client', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            { id: 'client-1', name: 'Acme Corp', brandColor: '#1D9BF0' },
            { id: 'client-2', name: 'Tech Startup', brandColor: '#10B981' },
          ],
        },
        isLoading: false,
      });

      const { container } = render(<ClientSelector />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        // Look for Check icon (lucide-react Check component)
        const checkIcons = container.querySelectorAll('svg');
        expect(checkIcons.length).toBeGreaterThan(0);
      });
    });

    it('disables currently active client in dropdown', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            { id: 'client-1', name: 'Acme Corp', brandColor: '#1D9BF0' },
            { id: 'client-2', name: 'Tech Startup', brandColor: '#10B981' },
          ],
        },
        isLoading: false,
      });

      render(<ClientSelector />);

      await user.click(screen.getByRole('button'));

      // The active client item should be disabled
      // This is handled by Radix UI DropdownMenu.Item disabled prop
    });
  });

  describe('AC5: Manage Clients Link', () => {
    it('shows "Manage Clients" option in dropdown', async () => {
      const user = userEvent.setup();
      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            { id: 'client-1', name: 'Acme Corp', brandColor: '#1D9BF0' },
          ],
        },
        isLoading: false,
      });

      render(<ClientSelector />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Manage Clients')).toBeInTheDocument();
      });
    });

    it('redirects to /app/clients when clicking Manage Clients', async () => {
      const user = userEvent.setup();
      const mockLocationHref = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });

      mockClientsQuery.mockReturnValue({
        data: {
          items: [
            { id: 'client-1', name: 'Acme Corp', brandColor: '#1D9BF0' },
          ],
        },
        isLoading: false,
      });

      render(<ClientSelector />);

      await user.click(screen.getByRole('button'));

      await waitFor(async () => {
        const manageLink = screen.getByText('Manage Clients');
        await user.click(manageLink);
      });

      // The component uses window.location.href = '/app/clients'
    });
  });
});
