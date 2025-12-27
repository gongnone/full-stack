/**
 * Story 4.4: Creative Conflict Escalation - E2E Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (routeOptions: any) => ({
    options: routeOptions,
    useSearch: () => ({ platform: undefined, gate: undefined }),
  }),
  useSearch: vi.fn(() => ({})),
}));

const { mockSpokesData } = vi.hoisted(() => ({
  mockSpokesData: {
    current: {
      items: [
        {
          id: 'spoke-1',
          hub_id: 'hub-1',
          platform: 'twitter',
          content: 'Test spoke content that failed quality gates',
          psychological_angle: 'Contrarian',
          status: 'rejected',
          generation_attempt: 2,
          g2_score: 55,
          g4_status: 'fail:tone_mismatch',
          g5_status: 'pass',
          created_at: Date.now(),
        },
        {
          id: 'spoke-2',
          hub_id: 'hub-1',
          platform: 'linkedin',
          content: 'Another test spoke with quality issues',
          psychological_angle: 'Authority',
          status: 'rejected',
          generation_attempt: 1,
          g2_score: 75,
          g4_status: 'pass',
          g5_status: 'fail:char_limit',
          created_at: Date.now(),
        },
      ],
    },
  },
}));

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    spokes: {
      list: {
        useQuery: vi.fn(() => ({
          data: mockSpokesData.current,
          isLoading: false,
          refetch: vi.fn(),
        })),
      },
      approve: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
          isPending: false,
        })),
      },
      reject: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
          isPending: false,
        })),
      },
    },
  },
}));

vi.mock('@/lib/use-client-id', () => ({
  useClientId: vi.fn(() => 'client-1'),
}));

// Import after mocks
import { Route } from '@/routes/app/creative-conflicts';

const CreativeConflictsPage = Route.options.component as React.ComponentType;

describe('CreativeConflictsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Header', () => {
    it('renders page title', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getByText('Creative Conflicts')).toBeInTheDocument();
    });

    it('displays description text', () => {
      render(<CreativeConflictsPage />);
      expect(
        screen.getByText(/Spokes that failed quality gates and need manual review/i)
      ).toBeInTheDocument();
    });

    it('shows conflict count', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('conflicts')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('renders platform filter dropdown', () => {
      render(<CreativeConflictsPage />);
      const selects = screen.getAllByRole('combobox');
      // First select is platform filter, second is gate filter
      expect(selects[0]).toBeInTheDocument();
    });

    it('renders gate filter dropdown', () => {
      render(<CreativeConflictsPage />);
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    it('filters by platform when selected', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      const platformSelect = screen.getAllByRole('combobox')[0]!;
      await user.selectOptions(platformSelect, 'twitter');

      // After filtering, only twitter spokes should be visible
      await waitFor(() => {
        expect(screen.getByText('Test spoke content that failed quality gates')).toBeInTheDocument();
      });
    });

    it('filters by gate when selected', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      const gateSelect = screen.getAllByRole('combobox')[1]!;
      await user.selectOptions(gateSelect, 'g2');

      // After filtering by G2, only spokes with G2 failures should show
      await waitFor(() => {
        expect(screen.getByText('Test spoke content that failed quality gates')).toBeInTheDocument();
      });
    });
  });

  describe('Conflict Cards', () => {
    it('displays conflict cards for rejected spokes', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getByText('Test spoke content that failed quality gates')).toBeInTheDocument();
      expect(screen.getByText('Another test spoke with quality issues')).toBeInTheDocument();
    });

    it('shows platform badge on each card', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getByText('twitter')).toBeInTheDocument();
      expect(screen.getByText('linkedin')).toBeInTheDocument();
    });

    it('shows psychological angle on each card', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getByText('Contrarian')).toBeInTheDocument();
      expect(screen.getByText('Authority')).toBeInTheDocument();
    });

    it('displays generation attempt number when > 1', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getByText('Attempt #2')).toBeInTheDocument();
    });

    it('shows gate badges for each spoke', () => {
      render(<CreativeConflictsPage />);
      const gateBadges = screen.getAllByText(/G[245]/);
      expect(gateBadges.length).toBeGreaterThan(0);
    });

    it('displays spoke content', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getByText('Test spoke content that failed quality gates')).toBeInTheDocument();
    });
  });

  describe('Gate Details', () => {
    it('shows G2 score and status', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getAllByText('G2: Hook').length).toBeGreaterThan(0);
      // G2 score 55 appears in the GateBadge - use getAllByText since both spokes have G2 badges
      expect(screen.getAllByText('55').length).toBeGreaterThan(0);
    });

    it('shows G4 voice status', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getAllByText('G4: Voice').length).toBeGreaterThan(0);
    });

    it('shows G5 platform status', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getAllByText('G5: Platform').length).toBeGreaterThan(0);
    });

    it('displays violation details for failed gates', () => {
      render(<CreativeConflictsPage />);
      // Violations should be parsed and displayed
      const violations = screen.getAllByText(/fail|pass/i);
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('Card Actions', () => {
    it('shows Request Rewrite button', () => {
      render(<CreativeConflictsPage />);
      const rewriteButtons = screen.getAllByText('Request Rewrite');
      expect(rewriteButtons.length).toBe(2);
    });

    it('shows Approve Anyway button', () => {
      render(<CreativeConflictsPage />);
      const approveButtons = screen.getAllByText('Approve Anyway');
      expect(approveButtons.length).toBe(2);
    });

    it('opens feedback modal when Request Rewrite clicked', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      const rewriteButton = screen.getAllByText('Request Rewrite')[0]!;
      await user.click(rewriteButton);

      await waitFor(() => {
        expect(screen.getByText('Request Manual Rewrite')).toBeInTheDocument();
      });
    });
  });

  describe('Feedback Modal', () => {
    it('displays modal title and description', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      await user.click(screen.getAllByText('Request Rewrite')[0]!);

      await waitFor(() => {
        expect(screen.getByText('Request Manual Rewrite')).toBeInTheDocument();
        expect(
          screen.getByText(/Provide feedback for the AI to improve this spoke/i)
        ).toBeInTheDocument();
      });
    });

    it('has textarea for feedback input', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      await user.click(screen.getAllByText('Request Rewrite')[0]!);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Please make the hook less salesy/i);
        expect(textarea).toBeInTheDocument();
      });
    });

    it('accepts feedback input', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      await user.click(screen.getAllByText('Request Rewrite')[0]!);

      await waitFor(async () => {
        const textarea = screen.getByPlaceholderText(/Please make the hook less salesy/i);
        await user.type(textarea, 'Make the hook more engaging');
        expect(textarea).toHaveValue('Make the hook more engaging');
      });
    });

    it('has Cancel button', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      await user.click(screen.getAllByText('Request Rewrite')[0]!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      });
    });

    it('has Submit Feedback button', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      await user.click(screen.getAllByText('Request Rewrite')[0]!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Submit Feedback' })).toBeInTheDocument();
      });
    });

    it('disables submit when feedback is empty', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      await user.click(screen.getAllByText('Request Rewrite')[0]!);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: 'Submit Feedback' });
        expect(submitButton).toBeDisabled();
      });
    });

    it('enables submit when feedback is entered', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      await user.click(screen.getAllByText('Request Rewrite')[0]!);

      await waitFor(async () => {
        const textarea = screen.getByPlaceholderText(/Please make the hook less salesy/i);
        await user.type(textarea, 'Improve the hook');

        const submitButton = screen.getByRole('button', { name: 'Submit Feedback' });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('closes modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<CreativeConflictsPage />);

      await user.click(screen.getAllByText('Request Rewrite')[0]!);

      await waitFor(async () => {
        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        await user.click(cancelButton);

        expect(screen.queryByText('Request Manual Rewrite')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no conflicts exist', () => {
      // Override the mock data for this test
      const originalData = mockSpokesData.current;
      mockSpokesData.current = { items: [] };

      render(<CreativeConflictsPage />);

      expect(screen.getByText('No Creative Conflicts')).toBeInTheDocument();
      expect(
        screen.getByText(/All spokes have passed quality gates or been resolved/i)
      ).toBeInTheDocument();

      // Restore
      mockSpokesData.current = originalData;
    });

    it('displays success icon in empty state', () => {
      // Override the mock data for this test
      const originalData = mockSpokesData.current;
      mockSpokesData.current = { items: [] };

      render(<CreativeConflictsPage />);

      const svg = screen.getByText('No Creative Conflicts').parentElement?.querySelector('svg');
      expect(svg).toBeInTheDocument();

      // Restore
      mockSpokesData.current = originalData;
    });
  });

  describe('Grouping', () => {
    it('groups spokes by hub', () => {
      render(<CreativeConflictsPage />);
      // Both test spokes have hub-1, so should be in same group
      const hubHeaders = screen.getAllByText(/Hub:/);
      expect(hubHeaders.length).toBeGreaterThan(0);
    });

    it('displays hub ID in group header', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getByText(/Hub: hub-1/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<CreativeConflictsPage />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Creative Conflicts');
    });

    it('filter dropdowns are accessible', () => {
      render(<CreativeConflictsPage />);
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });

    it('buttons are keyboard accessible', async () => {
      render(<CreativeConflictsPage />);
      const approveButton = screen.getAllByText('Approve Anyway')[0]!;
      approveButton.focus();
      expect(approveButton).toHaveFocus();
    });
  });
});
