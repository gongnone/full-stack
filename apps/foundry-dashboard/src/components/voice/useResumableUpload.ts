/**
 * useResumableUpload Hook
 *
 * Implements resumable file uploads using tus protocol for reliable
 * media uploads, especially for voice recordings.
 *
 * Story 1.5-1-2: Voice Recording Component (Mobile) - AC5
 */

import { useState, useCallback, useRef } from 'react';

interface UploadState {
  progress: number;
  status: 'idle' | 'uploading' | 'paused' | 'completed' | 'error';
  error: string | null;
  uploadId: string | null;
}

interface ResumableUploadOptions {
  /** Base endpoint for tus uploads */
  endpoint: string;
  /** Chunk size in bytes (default: 512KB) */
  chunkSize?: number;
  /** Max retries on failure */
  maxRetries?: number;
  /** Retry delay in ms */
  retryDelay?: number;
  /** Called on progress update */
  onProgress?: (progress: number) => void;
  /** Called on successful upload */
  onComplete?: (uploadId: string) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

const DEFAULT_CHUNK_SIZE = 512 * 1024; // 512KB
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

/**
 * Hook for resumable file uploads using tus-like protocol
 *
 * Features:
 * - Chunked uploads for large files
 * - Automatic retry on failure
 * - Resume from last successful chunk
 * - Progress tracking
 */
export function useResumableUpload(options: ResumableUploadOptions) {
  const {
    endpoint,
    chunkSize = DEFAULT_CHUNK_SIZE,
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    onProgress,
    onComplete,
    onError,
  } = options;

  const [state, setState] = useState<UploadState>({
    progress: 0,
    status: 'idle',
    error: null,
    uploadId: null,
  });

  // Refs for tracking upload state
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentOffsetRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const fileRef = useRef<Blob | null>(null);
  const uploadIdRef = useRef<string | null>(null);

  /**
   * Create a new upload session on the server
   */
  const createUpload = useCallback(async (file: Blob, metadata?: Record<string, string>): Promise<string> => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tus-Resumable': '1.0.0',
        'Upload-Length': String(file.size),
        'Upload-Metadata': metadata
          ? Object.entries(metadata)
              .map(([k, v]) => `${k} ${btoa(v)}`)
              .join(',')
          : '',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create upload: ${response.status}`);
    }

    const location = response.headers.get('Location');
    if (!location) {
      throw new Error('Server did not return upload location');
    }

    // Extract upload ID from location
    const uploadId = location.split('/').pop() || '';
    return uploadId;
  }, [endpoint]);

  /**
   * Get the current offset from the server (for resume)
   */
  const getOffset = useCallback(async (uploadId: string): Promise<number> => {
    const response = await fetch(`${endpoint}/${uploadId}`, {
      method: 'HEAD',
      headers: {
        'Tus-Resumable': '1.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get offset: ${response.status}`);
    }

    const offset = response.headers.get('Upload-Offset');
    return offset ? parseInt(offset, 10) : 0;
  }, [endpoint]);

  /**
   * Upload a single chunk
   */
  const uploadChunk = useCallback(async (
    uploadId: string,
    file: Blob,
    offset: number,
    signal: AbortSignal
  ): Promise<number> => {
    const end = Math.min(offset + chunkSize, file.size);
    const chunk = file.slice(offset, end);

    const response = await fetch(`${endpoint}/${uploadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/offset+octet-stream',
        'Tus-Resumable': '1.0.0',
        'Upload-Offset': String(offset),
      },
      body: chunk,
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk: ${response.status}`);
    }

    const newOffset = response.headers.get('Upload-Offset');
    return newOffset ? parseInt(newOffset, 10) : end;
  }, [endpoint, chunkSize]);

  /**
   * Start or resume an upload
   */
  const upload = useCallback(async (file: Blob, metadata?: Record<string, string>) => {
    fileRef.current = file;
    retryCountRef.current = 0;

    try {
      setState(prev => ({ ...prev, status: 'uploading', error: null }));

      // Check if we should use resumable upload (> 1MB)
      if (file.size <= 1024 * 1024) {
        // Small file - just upload directly
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${endpoint}/direct`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Direct upload failed: ${response.status}`);
        }

        const result = await response.json() as { uploadId?: string; id?: string };
        const uploadId = result.uploadId || result.id || '';

        setState({
          progress: 100,
          status: 'completed',
          error: null,
          uploadId,
        });

        onProgress?.(100);
        onComplete?.(uploadId);
        return;
      }

      // Create new upload or get existing offset
      let uploadId = uploadIdRef.current;
      let offset = currentOffsetRef.current;

      if (!uploadId) {
        uploadId = await createUpload(file, metadata);
        uploadIdRef.current = uploadId;
        offset = 0;
      } else {
        // Resume - get current offset from server
        offset = await getOffset(uploadId);
      }

      currentOffsetRef.current = offset;

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Upload chunks
      while (offset < file.size) {
        try {
          offset = await uploadChunk(uploadId, file, offset, abortControllerRef.current.signal);
          currentOffsetRef.current = offset;

          const progress = Math.round((offset / file.size) * 100);
          setState(prev => ({ ...prev, progress }));
          onProgress?.(progress);

          // Reset retry count on success
          retryCountRef.current = 0;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            // Upload was paused/cancelled
            setState(prev => ({ ...prev, status: 'paused' }));
            return;
          }

          // Retry logic
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
            continue;
          }

          throw error;
        }
      }

      // Upload complete
      setState({
        progress: 100,
        status: 'completed',
        error: null,
        uploadId,
      });

      onComplete?.(uploadId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [endpoint, createUpload, getOffset, uploadChunk, chunkSize, maxRetries, retryDelay, onProgress, onComplete, onError]);

  /**
   * Pause the upload
   */
  const pause = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({ ...prev, status: 'paused' }));
    }
  }, []);

  /**
   * Resume a paused upload
   */
  const resume = useCallback(() => {
    if (fileRef.current && uploadIdRef.current) {
      upload(fileRef.current);
    }
  }, [upload]);

  /**
   * Cancel the upload and reset state
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset all state
    fileRef.current = null;
    uploadIdRef.current = null;
    currentOffsetRef.current = 0;
    retryCountRef.current = 0;

    setState({
      progress: 0,
      status: 'idle',
      error: null,
      uploadId: null,
    });
  }, []);

  return {
    ...state,
    upload,
    pause,
    resume,
    cancel,
  };
}
