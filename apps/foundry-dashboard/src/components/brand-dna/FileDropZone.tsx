import { useCallback, useState } from 'react';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  onTextPaste: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

/**
 * FileDropZone component for PDF/text file uploads
 * Story 2.1: Multi-Source Content Ingestion for Brand Analysis
 *
 * AC1: Drag and drop PDF file
 * AC2: Progress indicator during upload
 */
export function FileDropZone({
  onFileSelect,
  onTextPaste,
  isUploading = false,
  uploadProgress = 0,
  acceptedTypes = ['.pdf', '.txt', '.md'],
  maxSizeMB = 10,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size is ${maxSizeMB}MB.`;
    }

    // Check file type
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(ext)) {
      return `Invalid file type. Accepted: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    onFileSelect(file);
  }, [onFileSelect, acceptedTypes, maxSizeMB]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const firstFile = files[0];
    if (firstFile) {
      handleFile(firstFile);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const firstFile = files?.[0];
    if (firstFile) {
      handleFile(firstFile);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [handleFile]);

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-[var(--edit)] bg-[var(--edit)]/5' : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)]'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <input
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-3">
            {/* Upload Icon */}
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center animate-pulse"
              style={{ backgroundColor: 'var(--edit)', opacity: 0.2 }}>
              <svg className="w-6 h-6" style={{ color: 'var(--edit)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            {/* Progress Bar */}
            <div className="max-w-xs mx-auto">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, backgroundColor: 'var(--edit)' }}
                />
              </div>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Upload Icon */}
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: isDragging ? 'var(--edit)' : 'var(--bg-elevated)' }}>
              <svg
                className="w-6 h-6"
                style={{ color: isDragging ? 'white' : 'var(--text-secondary)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            {/* Instructions */}
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {isDragging ? 'Drop file here' : 'Drag and drop a file'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              or click to browse
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              PDF, TXT, MD (max {maxSizeMB}MB)
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--kill)', opacity: 0.1 }}>
          <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--kill)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ color: 'var(--kill)' }}>{error}</span>
        </div>
      )}

      {/* Alternative: Paste Text */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
      </div>

      <button
        onClick={onTextPaste}
        disabled={isUploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-hover)]"
        style={{
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Paste Text Content
      </button>
    </div>
  );
}
