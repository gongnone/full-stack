/**
 * StepUploadSource - Unit Tests
 * Tests tab interface for upload, paste, and URL options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepUploadSource } from './StepUploadSource';

// Mock child components
vi.mock('./SourceDropZone', () => ({
  SourceDropZone: ({ clientId, onSourceCreated }: { clientId: string; onSourceCreated: (id: string) => void }) => (
    <div data-testid="source-dropzone" data-client-id={clientId}>
      <button onClick={() => onSourceCreated('pdf-source-123')}>Upload PDF</button>
    </div>
  ),
}));

vi.mock('./TextPasteTab', () => ({
  TextPasteTab: ({ clientId, onSourceCreated }: { clientId: string; onSourceCreated: (id: string) => void }) => (
    <div data-testid="text-paste-tab" data-client-id={clientId}>
      <button onClick={() => onSourceCreated('text-source-123')}>Submit Text</button>
    </div>
  ),
}));

vi.mock('./UrlInputTab', () => ({
  UrlInputTab: ({ clientId, onSourceCreated }: { clientId: string; onSourceCreated: (id: string) => void }) => (
    <div data-testid="url-input-tab" data-client-id={clientId}>
      <button onClick={() => onSourceCreated('url-source-123')}>Submit URL</button>
    </div>
  ),
}));

vi.mock('./RecentSourcesList', () => ({
  RecentSourcesList: ({ clientId, onSourceSelected }: { clientId: string; onSourceSelected: (id: string, type: string) => void }) => (
    <div data-testid="recent-sources-list" data-client-id={clientId}>
      <button onClick={() => onSourceSelected('recent-source-123', 'pdf')}>Select Recent</button>
    </div>
  ),
}));

describe('StepUploadSource', () => {
  const defaultProps = {
    clientId: 'client-123',
    onSourceSelected: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all three tab buttons', () => {
      render(<StepUploadSource {...defaultProps} />);

      // Use getAllByText since mock also has "Upload PDF" button
      expect(screen.getAllByText('Upload PDF').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Paste Text')).toBeInTheDocument();
      expect(screen.getByText('From URL')).toBeInTheDocument();
    });

    it('renders recent sources list', () => {
      render(<StepUploadSource {...defaultProps} />);
      expect(screen.getByTestId('recent-sources-list')).toBeInTheDocument();
    });

    it('renders divider text', () => {
      render(<StepUploadSource {...defaultProps} />);
      expect(screen.getByText('Or add new source')).toBeInTheDocument();
    });

    it('defaults to upload tab', () => {
      render(<StepUploadSource {...defaultProps} />);
      expect(screen.getByTestId('source-dropzone')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('switches to paste tab when clicked', () => {
      render(<StepUploadSource {...defaultProps} />);

      fireEvent.click(screen.getByText('Paste Text'));

      expect(screen.getByTestId('text-paste-tab')).toBeInTheDocument();
      expect(screen.queryByTestId('source-dropzone')).not.toBeInTheDocument();
    });

    it('switches to URL tab when clicked', () => {
      render(<StepUploadSource {...defaultProps} />);

      fireEvent.click(screen.getByText('From URL'));

      expect(screen.getByTestId('url-input-tab')).toBeInTheDocument();
      expect(screen.queryByTestId('source-dropzone')).not.toBeInTheDocument();
    });

    it('can switch back to upload tab', () => {
      render(<StepUploadSource {...defaultProps} />);

      fireEvent.click(screen.getByText('Paste Text'));
      fireEvent.click(screen.getByText('Upload PDF'));

      expect(screen.getByTestId('source-dropzone')).toBeInTheDocument();
    });
  });

  describe('Source Selection', () => {
    it('calls onSourceSelected with pdf type when PDF uploaded', () => {
      render(<StepUploadSource {...defaultProps} />);

      // Click the mocked upload button inside SourceDropZone
      const uploadButtons = screen.getAllByText('Upload PDF');
      fireEvent.click(uploadButtons[uploadButtons.length - 1]); // The button inside the mock

      expect(defaultProps.onSourceSelected).toHaveBeenCalledWith('pdf-source-123', 'pdf');
    });

    it('calls onSourceSelected with text type when text submitted', () => {
      render(<StepUploadSource {...defaultProps} />);

      fireEvent.click(screen.getByText('Paste Text'));
      fireEvent.click(screen.getByText('Submit Text'));

      expect(defaultProps.onSourceSelected).toHaveBeenCalledWith('text-source-123', 'text');
    });

    it('calls onSourceSelected with url type when URL submitted', () => {
      render(<StepUploadSource {...defaultProps} />);

      fireEvent.click(screen.getByText('From URL'));
      fireEvent.click(screen.getByText('Submit URL'));

      expect(defaultProps.onSourceSelected).toHaveBeenCalledWith('url-source-123', 'url');
    });

    it('calls onSourceSelected when recent source selected', () => {
      render(<StepUploadSource {...defaultProps} />);

      fireEvent.click(screen.getByText('Select Recent'));

      expect(defaultProps.onSourceSelected).toHaveBeenCalledWith('recent-source-123', 'pdf');
    });
  });

  describe('Client ID Prop Passing', () => {
    it('passes clientId to child components', () => {
      render(<StepUploadSource {...defaultProps} />);

      expect(screen.getByTestId('recent-sources-list')).toHaveAttribute('data-client-id', 'client-123');
      expect(screen.getByTestId('source-dropzone')).toHaveAttribute('data-client-id', 'client-123');
    });
  });
});
