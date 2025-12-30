/**
 * Story R-12: Lazy rendering hook for analytics charts
 * Uses Intersection Observer to defer rendering of below-fold content
 */

import { useEffect, useRef, useState } from 'react';

interface UseLazyRenderOptions {
  /** Extra margin around the viewport for pre-loading (default: '100px') */
  rootMargin?: string;
  /** Render immediately without waiting for intersection (default: false) */
  immediate?: boolean;
}

/**
 * Hook to lazily render components when they enter the viewport.
 * Once visible, the component stays rendered (no un-rendering on scroll away).
 *
 * @example
 * const { ref, isVisible } = useLazyRender({ rootMargin: '200px' });
 * return (
 *   <div ref={ref}>
 *     {isVisible ? <ExpensiveChart /> : <ChartSkeleton />}
 *   </div>
 * );
 */
export function useLazyRender(options?: UseLazyRenderOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(options?.immediate ?? false);

  useEffect(() => {
    // Skip observer if already visible or immediate mode
    if (isVisible || options?.immediate) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, disconnect - we don't hide on scroll away
          observer.disconnect();
        }
      },
      {
        rootMargin: options?.rootMargin ?? '100px',
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isVisible, options?.immediate, options?.rootMargin]);

  return { ref, isVisible };
}
