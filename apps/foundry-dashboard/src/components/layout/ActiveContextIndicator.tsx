import { useClientId } from '@/lib/use-client-id';
import { useClientRole } from '@/lib/use-client-role';
import { ROLE_LABELS } from '@/lib/rbac';
import { trpc } from '@/lib/trpc-client';
import { Building2, Zap, Shield } from 'lucide-react';

export function ActiveContextIndicator() {
  const clientId = useClientId();
  const { role } = useClientRole();

  const clientQuery = trpc.clients.getById.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  );

  if (!clientId || !clientQuery.data) {
    return null;
  }

  const client = clientQuery.data;
  const roleLabel = role ? ROLE_LABELS[role] : null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: client.brandColor || 'var(--border-subtle)',
      }}
    >
      <div
        className="w-6 h-6 rounded flex items-center justify-center relative"
        style={{ backgroundColor: client.brandColor || 'var(--edit)' }}
      >
        <Building2 className="w-3.5 h-3.5 text-white" />
        <div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--approve)' }}
        />
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium truncate max-w-[150px]" style={{ color: 'var(--text-primary)' }}>
            {client.name}
          </span>
          <Zap
            className="w-3 h-3 flex-shrink-0"
            style={{ color: 'var(--approve)' }}
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Active Workspace
          </span>
          {roleLabel && (
            <>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>•</span>
              <span
                className="flex items-center gap-0.5 text-[10px] font-medium"
                style={{ color: 'var(--edit)' }}
                title={`Your role: ${roleLabel}`}
              >
                <Shield className="w-2.5 h-2.5" />
                {roleLabel}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
