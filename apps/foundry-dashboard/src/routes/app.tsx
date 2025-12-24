import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useSession } from '@/lib/auth-client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar, CommandPalette, ClientSelector } from '@/components/layout';
import { ActiveContextIndicator } from '@/components/layout/ActiveContextIndicator';
import { trpc } from '@/lib/trpc-client';
import { useClientId } from '@/lib/use-client-id';

// NFR-P5: Performance budget - page must load in < 3 seconds
const PERFORMANCE_BUDGET_MS = 3000;

export const Route = createFileRoute('/app')({
  component: AppLayout,
});

function AppLayout() {
  const { data: session, isPending } = useSession();
  const activeClientId = useClientId();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  const clientsQuery = trpc.clients.list.useQuery({}, { enabled: !!session });
  const activeClient = clientsQuery.data?.items?.find(c => c.id === activeClientId);

  const loadStartTime = useRef(performance.now());
  const hasLoggedPerformance = useRef(false);

  // NFR-P5: Measure and log page load performance
  useEffect(() => {
    if (!isPending && session && !hasLoggedPerformance.current) {
      const loadTime = performance.now() - loadStartTime.current;
      hasLoggedPerformance.current = true;

      if (loadTime > PERFORMANCE_BUDGET_MS) {
        console.warn(
          `[NFR-P5 VIOLATION] Dashboard load time ${loadTime.toFixed(0)}ms exceeds budget of ${PERFORMANCE_BUDGET_MS}ms`
        );
      } else {
        console.info(
          `[NFR-P5] Dashboard loaded in ${loadTime.toFixed(0)}ms (budget: ${PERFORMANCE_BUDGET_MS}ms)`
        );
      }

      // Report to analytics if available
      if (typeof window !== 'undefined' && 'performance' in window) {
        performance.mark('dashboard-loaded');
        performance.measure('dashboard-load-time', {
          start: loadStartTime.current,
          end: performance.now(),
        });
      }
    }
  }, [isPending, session]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // ⌘+K or Ctrl+K to open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsCommandPaletteOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isPending) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center animate-pulse"
            style={{ backgroundColor: 'var(--edit)' }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="pl-64">
        {/* Top header */}
        <header
          className="sticky top-0 z-40 h-16 border-b flex items-center px-6 gap-4 transition-colors duration-500"
          style={{
            backgroundColor: 'var(--bg-base)',
            borderBottomColor: activeClient?.brandColor ? `${activeClient.brandColor}40` : 'var(--border-subtle)',
            borderBottomWidth: activeClient?.brandColor ? '2px' : '1px'
          }}
        >
          <ClientSelector />
          <ActiveContextIndicator />
          <div className="flex-1" />

          {/* Command palette trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search</span>
            <kbd
              className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
            >
              Cmd+K
            </kbd>
          </button>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
