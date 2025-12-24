/**
 * Story 3-1: Source Selection & Upload Wizard
 * SourceDropZone - PDF drag-drop with progress bar
 */

import { useState, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc-client';
import { UPLOAD_LIMITS } from '@/lib/constants';

interface SourceDropZoneProps {
  clientId: string;
  onSourceCreated: (sourceId: string) => void;
  disabled?: boolean;
}

function UploadIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function DocumentIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export function SourceDropZone({ clientId, onSourceCreated, disabled }: SourceDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadUrl = trpc.hubs.getSourceUploadUrl.useMutation();
  const registerPdf = trpc.hubs.registerPdfSource.useMutation();

  // Real upload progress using XMLHttpRequest
  const uploadWithProgress = useCallback((url: string, file: File, contentType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          // Upload progress: 10% to 80% of total (leaving room for pre/post processing)
          const uploadPercent = Math.round((event.loaded / event.total) * 70) + 10;
          setUploadProgress(uploadPercent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed - network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', contentType);
      xhr.withCredentials = true; // Include auth cookies
      xhr.send(file);
    });
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    // Max file size check
    if (file.size > UPLOAD_LIMITS.MAX_PDF_SIZE_BYTES) {
      setError(`File size must be under ${UPLOAD_LIMITS.MAX_PDF_SIZE_MB}MB`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadProgress(5); // Starting

    try {
      // Step 1: Get upload URL (5% → 10%)
      const { sourceId, r2Key, uploadEndpoint } = await getUploadUrl.mutateAsync({
        clientId,
        filename: file.name,
      });

      setUploadProgress(10);

      // Step 2: Upload to R2 with real progress (10% → 80%)
      await uploadWithProgress(uploadEndpoint, file, file.type);

      setUploadProgress(85);

      // Step 3: Register in database (85% → 100%)
      await registerPdf.mutateAsync({
        clientId,
        sourceId,
        r2Key,
        filename: file.name.replace(/\.pdf$/i, ''),
      });

      setUploadProgress(100);

      // Success - notify parent
      setTimeout(() => {
        onSourceCreated(sourceId);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(null);
      setSelectedFile(null);
    }
  }, [clientId, getUploadUrl, registerPdf, onSourceCreated, uploadWithProgress]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const isUploading = uploadProgress !== null && uploadProgress < 100;
  const isComplete = uploadProgress === 100;

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        data-testid="source-dropzone"
        onClick={!disabled && !isUploading ? handleClick : undefined}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && !isUploading && handleClick()}
        onDrop={!disabled && !isUploading ? handleDrop : undefined}
        onDragOver={!disabled && !isUploading ? handleDragOver : undefined}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-all duration-200
          ${disabled || isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-opacity-80'}
        `}
        style={{
          borderColor: isDragging ? 'var(--approve)' : error ? 'var(--kill)' : 'var(--border-subtle)',
          backgroundColor: isDragging ? 'rgba(52, 211, 153, 0.1)' : 'var(--bg-surface)',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isComplete ? (
          <div className="space-y-2" data-testid="upload-success">
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--approve)' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p style={{ color: 'var(--text-primary)' }} className="font-medium">
              Upload complete
            </p>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">
              {selectedFile?.name}
            </p>
          </div>
        ) : isUploading ? (
          <div className="space-y-4" data-testid="upload-progress">
            <DocumentIcon className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-primary)' }} className="font-medium">
              Uploading...
            </p>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">
              {selectedFile?.name}
            </p>
            {/* Progress bar */}
            <div className="w-full max-w-xs mx-auto h-2 rounded-full overflow-hidden" role="progressbar" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${uploadProgress}%`,
                  backgroundColor: 'var(--approve)',
                }}
              />
            </div>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs">
              {uploadProgress}%
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <UploadIcon className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-primary)' }} className="font-medium">
              {isDragging ? 'Drop PDF here' : 'Drag & drop PDF or click to browse'}
            </p>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">
              Maximum file size: {UPLOAD_LIMITS.MAX_PDF_SIZE_MB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-center" style={{ color: 'var(--kill)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
