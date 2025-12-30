/**
 * Story R-12: Debounce hook for analytics period selector
 * Prevents excessive API calls when rapidly changing period
 */

import { useEffect, useState } from 'react';

/**
 * Hook that debounces a value by a specified delay.
 * Useful for reducing API calls when inputs change rapidly.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebouncedValue(searchTerm, 300);
 *
 * // API call only fires 300ms after user stops typing
 * useEffect(() => {
 *   api.search(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
