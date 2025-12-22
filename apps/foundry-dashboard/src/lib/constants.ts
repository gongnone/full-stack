/**
 * Story 3.1: Source Selection & Upload Wizard
 * Shared constants for file uploads and content validation
 */

// File upload limits
export const UPLOAD_LIMITS = {
  /** Maximum PDF file size in bytes (50MB) */
  MAX_PDF_SIZE_BYTES: 50 * 1024 * 1024,
  /** Maximum PDF file size in MB for display */
  MAX_PDF_SIZE_MB: 50,
} as const;

// Text content limits
export const TEXT_CONTENT_LIMITS = {
  /** Minimum characters required for text sources */
  MIN_CHARS: 100,
  /** Maximum characters allowed for text sources */
  MAX_CHARS: 100000,
  /** Maximum title length */
  MAX_TITLE_LENGTH: 255,
} as const;

// URL validation
export const URL_VALIDATION = {
  /** Maximum URL length */
  MAX_URL_LENGTH: 2048,
} as const;

// Display helpers
export const formatFileSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  return `${bytes}B`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};
