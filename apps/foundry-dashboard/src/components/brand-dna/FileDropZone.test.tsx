/**
 * Story 2.1: FileDropZone - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileDropZone } from './FileDropZone';

describe('FileDropZone', () => {
  const mockOnFileSelect = vi.fn();
  const mockOnTextPaste = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state', () => {
    render(<FileDropZone onFileSelect={mockOnFileSelect} onTextPaste={mockOnTextPaste} />);

    expect(screen.getByText(/Drag and drop a file/i)).toBeInTheDocument();
    expect(screen.getByText('Paste Text Content')).toBeInTheDocument();
  });

  it('renders uploading state', () => {
    render(
      <FileDropZone
        onFileSelect={mockOnFileSelect}
        onTextPaste={mockOnTextPaste}
        isUploading={true}
        uploadProgress={45}
      />
    );

    expect(screen.getByText(/Uploading... 45%/i)).toBeInTheDocument();
  });

  it('validates file type', () => {
    const { container } = render(
      <FileDropZone
        onFileSelect={mockOnFileSelect}
        onTextPaste={mockOnTextPaste}
        acceptedTypes={['.pdf']}
      />
    );

    const input = container.querySelector('input[type="file"]')!;
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('validates file size', () => {
    const { container } = render(
      <FileDropZone
        onFileSelect={mockOnFileSelect}
        onTextPaste={mockOnTextPaste}
        maxSizeMB={1}
      />
    );

    const input = container.querySelector('input[type="file"]')!;
    // Create ~2MB file
    const largeFile = new File(['a'.repeat(2 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText(/File too large/i)).toBeInTheDocument();
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('accepts valid file', () => {
    const { container } = render(
      <FileDropZone onFileSelect={mockOnFileSelect} onTextPaste={mockOnTextPaste} />
    );

    const input = container.querySelector('input[type="file"]')!;
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
  });

  it('calls onTextPaste when button clicked', () => {
    render(<FileDropZone onFileSelect={mockOnFileSelect} onTextPaste={mockOnTextPaste} />);

    fireEvent.click(screen.getByText('Paste Text Content'));

    expect(mockOnTextPaste).toHaveBeenCalled();
  });

  it('shows accepted file types in description', () => {
    render(<FileDropZone onFileSelect={mockOnFileSelect} onTextPaste={mockOnTextPaste} />);

    expect(screen.getByText(/PDF, TXT, MD/i)).toBeInTheDocument();
  });

  it('shows max file size in description', () => {
    render(
      <FileDropZone
        onFileSelect={mockOnFileSelect}
        onTextPaste={mockOnTextPaste}
        maxSizeMB={5}
      />
    );

    expect(screen.getByText(/max 5MB/i)).toBeInTheDocument();
  });

  it('disables input during upload', () => {
    const { container } = render(
      <FileDropZone
        onFileSelect={mockOnFileSelect}
        onTextPaste={mockOnTextPaste}
        isUploading={true}
      />
    );

    const input = container.querySelector('input[type="file"]')!;
    expect(input).toBeDisabled();
  });

  it('disables paste button during upload', () => {
    render(
      <FileDropZone
        onFileSelect={mockOnFileSelect}
        onTextPaste={mockOnTextPaste}
        isUploading={true}
      />
    );

    expect(screen.getByRole('button', { name: /paste text content/i })).toBeDisabled();
  });
});
