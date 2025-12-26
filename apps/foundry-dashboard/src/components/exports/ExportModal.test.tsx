import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportModal } from './ExportModal';

// Mock child components
vi.mock('./ExportFormatSelector', () => ({
  ExportFormatSelector: ({ value, onChange }: any) => (
    <div data-testid="format-selector">
      <button onClick={() => onChange('json')}>Switch to JSON</button>
      <span>Current: {value}</span>
    </div>
  ),
}));

vi.mock('./PlatformGrouper', () => ({
  PlatformGrouper: ({ onTogglePlatform, onToggleGrouping }: any) => (
    <div data-testid="platform-grouper">
      <button onClick={() => onTogglePlatform('twitter')}>Toggle Twitter</button>
      <button onClick={() => onToggleGrouping(true)}>Enable Grouping</button>
    </div>
  ),
}));

describe('ExportModal', () => {
  const mockOnClose = vi.fn();
  const mockOnExport = vi.fn();

  it('renders nothing when closed', () => {
    const { container } = render(
      <ExportModal isOpen={false} onClose={mockOnClose} onExport={mockOnExport} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when open', () => {
    render(<ExportModal isOpen={true} onClose={mockOnClose} onExport={mockOnExport} />);
    // Use heading role to get the title, not the button
    expect(screen.getByRole('heading', { name: 'Export Content' })).toBeInTheDocument();
    expect(screen.getByTestId('format-selector')).toBeInTheDocument();
    expect(screen.getByTestId('platform-grouper')).toBeInTheDocument();
  });

  it('configures export settings correctly', () => {
    render(<ExportModal isOpen={true} onClose={mockOnClose} onExport={mockOnExport} />);
    
    // Toggle JSON format
    fireEvent.click(screen.getByText('Switch to JSON'));
    
    // Toggle platform
    fireEvent.click(screen.getByText('Toggle Twitter'));
    
    // Toggle grouping
    fireEvent.click(screen.getByText('Enable Grouping'));
    
    // Toggle scheduling (default is on)
    fireEvent.click(screen.getByTestId('include-scheduling-toggle'));
    
    // Submit
    fireEvent.click(screen.getByTestId('export-submit'));
    
    expect(mockOnExport).toHaveBeenCalledWith({
      format: 'json',
      platforms: ['twitter'],
      groupByPlatform: true,
      includeScheduling: false,
      includeVisuals: false,
      hubIds: undefined,
    });
  });

  it('calls onClose when cancel or close is clicked', () => {
    render(<ExportModal isOpen={true} onClose={mockOnClose} onExport={mockOnExport} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
    
    fireEvent.click(screen.getByTestId('export-modal-close'));
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('shows loading state on submit button', () => {
    render(
      <ExportModal isOpen={true} onClose={mockOnClose} onExport={mockOnExport} isLoading={true} />
    );
    // ActionButton shows "Loading..." when isLoading is true
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
