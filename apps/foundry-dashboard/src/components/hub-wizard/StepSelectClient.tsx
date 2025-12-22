/**
 * Story 3-1: Source Selection & Upload Wizard
 * StepSelectClient - MVP: Auto-select current user's client
 */

import { useEffect } from 'react';
import { useClientId } from '@/lib/use-client-id';

interface StepSelectClientProps {
  selectedClientId: string | null;
  onSelect: (clientId: string) => void;
}

function UserIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export function StepSelectClient({ selectedClientId, onSelect }: StepSelectClientProps) {
  const clientId = useClientId();

  // For MVP, auto-advance with current client
  useEffect(() => {
    if (clientId && !selectedClientId) {
      // Small delay for UX
      const timer = setTimeout(() => onSelect(clientId), 500);
      return () => clearTimeout(timer);
    }
  }, [clientId, selectedClientId, onSelect]);

  return (
    <div className="text-center py-12">
      <div className="animate-pulse">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <UserIcon className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
        </div>
        <p style={{ color: 'var(--text-primary)' }}>
          Setting up workspace...
        </p>
      </div>
    </div>
  );
}
