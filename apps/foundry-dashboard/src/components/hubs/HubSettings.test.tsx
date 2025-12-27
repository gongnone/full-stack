/**
 * Story 3-4: HubSettings - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HubSettings, HubSettingsCompact } from './HubSettings';

// Mock trpc
const mockArchiveMutate = vi.fn();

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    hubs: {
      archive: {
        useMutation: () => ({
          mutate: mockArchiveMutate,
          isPending: false,
          isError: false,
          error: null,
        }),
      },
    },
  },
}));

describe('HubSettings', () => {
  const mockHub = {
    id: 'hub-1',
    client_id: 'client-1',
    title: 'Test Hub',
    status: 'ready',
    source_type: 'url',
    created_at: 1672531200, // Jan 1 2023
    pillar_count: 5,
    spoke_count: 10,
  } as any;

  const defaultProps = {
    hub: mockHub,
    onUpdate: vi.fn(),
    onArchive: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders hub settings container', () => {
      render(<HubSettings {...defaultProps} />);
      expect(screen.getByTestId('hub-settings')).toBeInTheDocument();
    });

    it('renders hub metadata correctly', () => {
      render(<HubSettings {...defaultProps} />);

      expect(screen.getByText('Test Hub')).toBeInTheDocument();
      expect(screen.getByText('Ready')).toBeInTheDocument();
      expect(screen.getByText('URL Content')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('displays edit button for title', () => {
      render(<HubSettings {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Edit hub title' })).toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('shows Ready status for ready hubs', () => {
      render(<HubSettings {...defaultProps} />);
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    it('shows Processing status for processing hubs', () => {
      const processingHub = { ...mockHub, status: 'processing' };
      render(<HubSettings {...defaultProps} hub={processingHub} />);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('shows Archived status for archived hubs', () => {
      const archivedHub = { ...mockHub, status: 'archived' };
      render(<HubSettings {...defaultProps} hub={archivedHub} />);
      expect(screen.getByText('Archived')).toBeInTheDocument();
    });
  });

  describe('Source Type Display', () => {
    it('shows PDF Document for pdf source type', () => {
      const pdfHub = { ...mockHub, source_type: 'pdf' };
      render(<HubSettings {...defaultProps} hub={pdfHub} />);
      expect(screen.getByText('PDF Document')).toBeInTheDocument();
    });

    it('shows Pasted Text for text source type', () => {
      const textHub = { ...mockHub, source_type: 'text' };
      render(<HubSettings {...defaultProps} hub={textHub} />);
      expect(screen.getByText('Pasted Text')).toBeInTheDocument();
    });

    it('shows URL Content for url source type', () => {
      render(<HubSettings {...defaultProps} />);
      expect(screen.getByText('URL Content')).toBeInTheDocument();
    });

    it('shows raw source type for unknown types', () => {
      const unknownHub = { ...mockHub, source_type: 'unknown' };
      render(<HubSettings {...defaultProps} hub={unknownHub} />);
      expect(screen.getByText('unknown')).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('displays pillar count', () => {
      render(<HubSettings {...defaultProps} />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Content Pillars')).toBeInTheDocument();
    });

    it('displays spoke count', () => {
      render(<HubSettings {...defaultProps} />);
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Generated Spokes')).toBeInTheDocument();
    });

    it('displays potential spokes estimate', () => {
      render(<HubSettings {...defaultProps} />);
      // 5 pillars * 7 = 35 potential
      expect(screen.getByText('~35')).toBeInTheDocument();
      expect(screen.getByText('Potential Spokes')).toBeInTheDocument();
    });

    it('shows 100% completion for ready hubs', () => {
      render(<HubSettings {...defaultProps} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Completion')).toBeInTheDocument();
    });

    it('shows ... completion for processing hubs', () => {
      const processingHub = { ...mockHub, status: 'processing' };
      render(<HubSettings {...defaultProps} hub={processingHub} />);
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  describe('Title Editing', () => {
    it('handles title editing', async () => {
      const user = userEvent.setup();
      render(<HubSettings {...defaultProps} />);

      await user.click(screen.getByLabelText('Edit hub title'));

      const input = screen.getByTestId('hub-title-input');
      await user.clear(input);
      await user.type(input, 'New Title');

      await user.click(screen.getByText('Save'));

      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Title' })
      );
    });

    it('shows save and cancel buttons in edit mode', async () => {
      const user = userEvent.setup();
      render(<HubSettings {...defaultProps} />);

      await user.click(screen.getByLabelText('Edit hub title'));

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('populates input with current title', async () => {
      const user = userEvent.setup();
      render(<HubSettings {...defaultProps} />);

      await user.click(screen.getByLabelText('Edit hub title'));

      const input = screen.getByTestId('hub-title-input') as HTMLInputElement;
      expect(input.value).toBe('Test Hub');
    });

    it('does not call onUpdate when title unchanged', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(<HubSettings {...defaultProps} onUpdate={onUpdate} />);

      await user.click(screen.getByLabelText('Edit hub title'));
      await user.click(screen.getByText('Save'));

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('reverts title on cancel', async () => {
      const user = userEvent.setup();
      render(<HubSettings {...defaultProps} />);

      await user.click(screen.getByLabelText('Edit hub title'));
      const input = screen.getByTestId('hub-title-input');
      await user.clear(input);
      await user.type(input, 'Changed Title');
      await user.click(screen.getByText('Cancel'));

      expect(screen.getByText('Test Hub')).toBeInTheDocument();
      expect(screen.queryByTestId('hub-title-input')).not.toBeInTheDocument();
    });

    it('exits edit mode after save', async () => {
      const user = userEvent.setup();
      render(<HubSettings {...defaultProps} />);

      await user.click(screen.getByLabelText('Edit hub title'));
      await user.click(screen.getByText('Save'));

      expect(screen.queryByTestId('hub-title-input')).not.toBeInTheDocument();
    });
  });

  describe('Archive Functionality', () => {
    it('shows archive button by default', () => {
      render(<HubSettings {...defaultProps} />);
      expect(screen.getByTestId('archive-hub-btn')).toBeInTheDocument();
    });

    it('hides archive button when showArchive is false', () => {
      render(<HubSettings {...defaultProps} showArchive={false} />);
      expect(screen.queryByTestId('archive-hub-btn')).not.toBeInTheDocument();
    });

    it('hides archive button for already archived hubs', () => {
      const archivedHub = { ...mockHub, status: 'archived' };
      render(<HubSettings {...defaultProps} hub={archivedHub} />);
      expect(screen.queryByTestId('archive-hub-btn')).not.toBeInTheDocument();
    });

    it('handles archiving flow', async () => {
      const user = userEvent.setup();
      render(<HubSettings {...defaultProps} />);

      await user.click(screen.getByTestId('archive-hub-btn'));

      expect(screen.getByText('Are you sure?')).toBeInTheDocument();

      await user.click(screen.getByTestId('confirm-archive-btn'));

      expect(mockArchiveMutate).toHaveBeenCalledWith(
        { hubId: mockHub.id, clientId: mockHub.client_id },
        expect.any(Object)
      );
    });

    it('hides confirmation on cancel', async () => {
      const user = userEvent.setup();
      render(<HubSettings {...defaultProps} />);

      await user.click(screen.getByTestId('archive-hub-btn'));
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();

      const cancelButtons = screen.getAllByText('Cancel');
      await user.click(cancelButtons[cancelButtons.length - 1]!);

      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });
  });

  describe('Archived State Display', () => {
    it('displays archived state correctly', () => {
      const archivedHub = { ...mockHub, status: 'archived' };
      render(<HubSettings {...defaultProps} hub={archivedHub} />);

      expect(screen.getByText('This hub has been archived')).toBeInTheDocument();
      expect(screen.queryByTestId('archive-hub-btn')).not.toBeInTheDocument();
    });

    it('shows content preserved message', () => {
      const archivedHub = { ...mockHub, status: 'archived' };
      render(<HubSettings {...defaultProps} hub={archivedHub} />);
      expect(screen.getByText('Content is preserved but hidden from active views')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('displays formatted creation date', () => {
      render(<HubSettings {...defaultProps} />);
      // Should show date in format like "Sun, Jan 1, 2023"
      expect(screen.getByText(/\w{3}, \w{3} \d{1,2}, \d{4}/)).toBeInTheDocument();
    });
  });
});

describe('HubSettingsCompact', () => {
  const mockHub = {
    id: 'hub-1',
    client_id: 'client-1',
    title: 'Test Hub',
    status: 'ready',
    source_type: 'pdf',
    created_at: 1672531200,
    pillar_count: 5,
    spoke_count: 10,
  } as any;

  it('renders compact container', () => {
    render(<HubSettingsCompact hub={mockHub} />);
    expect(screen.getByTestId('hub-settings-compact')).toBeInTheDocument();
  });

  it('displays status badge', () => {
    render(<HubSettingsCompact hub={mockHub} />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('displays source type', () => {
    render(<HubSettingsCompact hub={mockHub} />);
    expect(screen.getByText('PDF Document')).toBeInTheDocument();
  });

  it('displays pillar count', () => {
    render(<HubSettingsCompact hub={mockHub} />);
    expect(screen.getByText('5 pillars')).toBeInTheDocument();
  });

  it('displays spoke count', () => {
    render(<HubSettingsCompact hub={mockHub} />);
    expect(screen.getByText('10 spokes')).toBeInTheDocument();
  });

  it('shows Processing status for processing hubs', () => {
    const processingHub = { ...mockHub, status: 'processing' };
    render(<HubSettingsCompact hub={processingHub} />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('shows Archived status for archived hubs', () => {
    const archivedHub = { ...mockHub, status: 'archived' };
    render(<HubSettingsCompact hub={archivedHub} />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });
});
