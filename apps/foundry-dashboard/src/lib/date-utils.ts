/**
 * Date utility functions for consistent timestamp handling
 *
 * The backend uses mixed timestamp formats:
 * - Some places store Date.now() (milliseconds)
 * - Some places store Math.floor(Date.now() / 1000) (seconds)
 *
 * This utility auto-detects the format and normalizes to milliseconds.
 */

/**
 * Convert a timestamp (seconds or milliseconds) to a Date object
 * Auto-detects format based on magnitude:
 * - Timestamps < 10 billion are assumed to be seconds
 * - Timestamps >= 10 billion are assumed to be milliseconds
 */
export function timestampToDate(timestamp: number): Date {
  // Timestamps from Date.now() are ~1.7 trillion (13 digits)
  // Unix seconds are ~1.7 billion (10 digits)
  // Threshold: 10 billion (11 digits) safely distinguishes the two
  const isSeconds = timestamp < 10_000_000_000;
  return new Date(isSeconds ? timestamp * 1000 : timestamp);
}

/**
 * Format a timestamp as a localized date string
 */
export function formatDate(timestamp: number, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return timestampToDate(timestamp).toLocaleDateString('en-US', options ?? defaultOptions);
}

/**
 * Format a timestamp as a full localized date+time string
 */
export function formatDateTime(timestamp: number): string {
  return timestampToDate(timestamp).toLocaleString();
}

/**
 * Format a timestamp as relative time (e.g., "5m ago", "2h ago")
 */
export function formatTimeAgo(timestamp: number): string {
  const date = timestampToDate(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
