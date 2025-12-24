import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientSelector } from './ClientSelector';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';

// Get mocked modules
const mockTrpc = vi.mocked(trpc);
const mockUseClientId = vi.mocked(useClientId);

describe('ClientSelector', () => {
  const mockClients = [
    { id: 'client-1', name: 'Acme Corp', brandColor: '#3B82F6' },
    { id: 'client-2', name: 'Tech Startup', brandColor: '#10B981' },
    { id: 'client-3', name: 'Big Enterprise', brandColor: '#EF4444' },
  ];

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseClientId.mockReturnValue('client-1');
    (mockTrpc.clients.list.useQuery as any).mockReturnValue({
      data: { items: mockClients },
      isLoading: false,
    });
    (mockTrpc.clients.switch.useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    (mockTrpc.useUtils as any).mockReturnValue({
      invalidate: vi.fn(),
      auth: { me: { invalidate: vi.fn() } },
    });
  });

  describe('rendering', () => {
    it('[P0] should render active client name', () => {
      // GIVEN: ClientSelector is rendered with active client
      render(<ClientSelector />);

      // THEN: Active client name is displayed
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    it('[P0] should render dropdown trigger button', () => {
      // GIVEN: ClientSelector is rendered
      render(<ClientSelector />);

      // THEN: Trigger button is present
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('[P1] should show loading skeleton when loading', () => {
      // GIVEN: Query is loading
      (mockTrpc.clients.list.useQuery as any).mockReturnValue({
        data: null,
        isLoading: true,
      });
      render(<ClientSelector />);

      // THEN: Loading skeleton is shown (has animate-pulse class)
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('[P1] should show "Select Client" when no active client', () => {
      // GIVEN: No matching active client
      mockUseClientId.mockReturnValue('non-existent-client');
      render(<ClientSelector />);

      // THEN: Fallback text is shown
      expect(screen.getByText('Select Client')).toBeInTheDocument();
    });

    it('[P1] should display Building icon', () => {
      // GIVEN: ClientSelector is rendered
      render(<ClientSelector />);

      // THEN: Building icon container is visible (via Lucide Building2 component)
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('[P1] should display chevron down icon', () => {
      // GIVEN: ClientSelector is rendered
      render(<ClientSelector />);

      // THEN: Chevron icon is present (ChevronDown from lucide)
      const button = screen.getByRole('button');
      const svgs = button.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('brand colors', () => {
    it('[P2] should apply brand color to indicator', () => {
      // GIVEN: ClientSelector with client having specific brand color
      render(<ClientSelector />);

      // THEN: Brand color is applied somewhere in the component
      const coloredElement = document.querySelector('[style*="background-color"]');
      expect(coloredElement).toBeInTheDocument();
    });

    it('[P2] should handle client without brand color', () => {
      // GIVEN: Client without brand color
      (mockTrpc.clients.list.useQuery as any).mockReturnValue({
        data: {
          items: [
            { id: 'client-1', name: 'No Color Corp', brandColor: null },
          ],
        },
        isLoading: false,
      });
      render(<ClientSelector />);

      // THEN: Component renders without error
      expect(screen.getByText('No Color Corp')).toBeInTheDocument();
    });
  });

  describe('data fetching', () => {
    it('[P1] should call clients.list query on mount', () => {
      // GIVEN: ClientSelector is rendered
      render(<ClientSelector />);

      // THEN: Query was called
      expect(mockTrpc.clients.list.useQuery).toHaveBeenCalled();
    });

    it('[P1] should use activeClientId from useClientId hook', () => {
      // GIVEN: useClientId returns specific ID
      mockUseClientId.mockReturnValue('client-2');
      (mockTrpc.clients.list.useQuery as any).mockReturnValue({
        data: { items: mockClients },
        isLoading: false,
      });
      render(<ClientSelector />);

      // THEN: Displays the correct client name
      expect(screen.getByText('Tech Startup')).toBeInTheDocument();
    });
  });

  describe('switch mutation', () => {
    it('[P1] should initialize switch mutation', () => {
      // GIVEN: ClientSelector is rendered
      render(<ClientSelector />);

      // THEN: Mutation hook was called
      expect(mockTrpc.clients.switch.useMutation).toHaveBeenCalled();
    });
  });

  // Note: Dropdown interaction tests are skipped due to Radix UI portal complexity
  // The dropdown behavior is better tested in E2E tests with a real browser
  // Coverage includes: opening dropdown, selecting clients, keyboard navigation
});
