import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SourceDropZone } from './SourceDropZone';

// Mock trpc
const mockMutateAsync = vi.fn();
vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    hubs: {
      getSourceUploadUrl: {
        useMutation: () => ({ mutateAsync: mockMutateAsync }),
      },
      registerPdfSource: {
        useMutation: () => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }) }),
      },
    },
  },
}));

// Mock constants
vi.mock('@/lib/constants', () => ({
  UPLOAD_LIMITS: {
    MAX_PDF_SIZE_MB: 10,
    MAX_PDF_SIZE_BYTES: 10 * 1024 * 1024,
  },
}));

// Mock XMLHttpRequest for progress testing
let mockXHRInstance: MockXMLHttpRequest | null = null;

class MockXMLHttpRequest {
  status = 200;
  readyState = 4;
  onload: any;
  onerror: any;
  upload = {
    addEventListener: vi.fn(),
  };
  addEventListener = vi.fn((event, callback) => {
    if (event === 'load') this.onload = callback;
    if (event === 'error') this.onerror = callback;
  });
  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn(() => {
    mockXHRInstance = this;
    // Delay the load callback so we can test the intermediate state
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 100);
  });
  withCredentials = false;
}

// @ts-ignore
global.XMLHttpRequest = MockXMLHttpRequest;

describe('SourceDropZone', () => {
  const mockClientId = 'client-123';
  const mockOnSourceCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state', () => {
    render(<SourceDropZone clientId={mockClientId} onSourceCreated={mockOnSourceCreated} />);
    expect(screen.getByText(/Drag & drop PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum file size: 10MB/i)).toBeInTheDocument();
  });

  it('shows error for non-pdf files', async () => {
    render(<SourceDropZone clientId={mockClientId} onSourceCreated={mockOnSourceCreated} />);
    const input = screen.getByTestId('source-dropzone').querySelector('input')!;
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/Please upload a PDF file/i)).toBeInTheDocument();
  });

  it('handles drag over state', () => {
    render(<SourceDropZone clientId={mockClientId} onSourceCreated={mockOnSourceCreated} />);
    const dropzone = screen.getByTestId('source-dropzone');
    
    fireEvent.dragOver(dropzone);
    expect(screen.getByText(/Drop PDF here/i)).toBeInTheDocument();
    
    fireEvent.dragLeave(dropzone);
    expect(screen.getByText(/Drag & drop PDF/i)).toBeInTheDocument();
  });

  it('starts upload flow on file selection', async () => {
    mockMutateAsync.mockResolvedValue({
      sourceId: 'src-123',
      r2Key: 'key-123',
      uploadEndpoint: '/api/upload/test',
    });

    render(<SourceDropZone clientId={mockClientId} onSourceCreated={mockOnSourceCreated} />);
    const input = screen.getByTestId('source-dropzone').querySelector('input')!;
    
    const file = new File(['%PDF-1.4 test'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByTestId('upload-progress')).toBeInTheDocument();
    expect(screen.getByText(/Uploading.../i)).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    
    // Wait for completion (due to MockXMLHttpRequest auto-resolving)
    await waitFor(() => {
      expect(screen.getByTestId('upload-success')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(mockOnSourceCreated).toHaveBeenCalledWith('src-123');
    });
  });

  it('displays error if upload url fetch fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network Error'));

    render(<SourceDropZone clientId={mockClientId} onSourceCreated={mockOnSourceCreated} />);
    const input = screen.getByTestId('source-dropzone').querySelector('input')!;
    
    const file = new File(['%PDF-1.4 test'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/Network Error/i)).toBeInTheDocument();
  });
});
