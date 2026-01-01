/**
 * RoleInfoCard - Display current user's role and permissions
 * RBAC UI differentiation for Phase 2A
 */

import { useClientRole } from '@/lib/use-client-role';
import { CLIENT_ROLES, ROLE_LABELS, type ClientRole } from '@/lib/rbac';
import { Shield, Check } from 'lucide-react';

export function RoleInfoCard() {
  const { role, isLoading } = useClientRole();

  if (isLoading) {
    return (
      <div
        className="rounded-xl p-5 border animate-pulse"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="h-5 w-32 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
        <div className="h-4 w-48 rounded mt-2" style={{ backgroundColor: 'var(--bg-hover)' }} />
      </div>
    );
  }

  if (!role) {
    return null;
  }

  const roleConfig = CLIENT_ROLES.find(r => r.value === role);

  return (
    <div
      className="rounded-xl p-5 border"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: getRoleColor(role), opacity: 0.15 }}
        >
          <Shield className="w-5 h-5" style={{ color: getRoleColor(role) }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Your Role
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Permissions for the current workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span
          className="px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{ backgroundColor: getRoleColor(role), color: '#fff' }}
        >
          {ROLE_LABELS[role]}
        </span>
        {roleConfig && (
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {roleConfig.description}
          </span>
        )}
      </div>

      {roleConfig && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Your Permissions
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {roleConfig.permissions.map((permission, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--approve)' }} />
                {permission}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function getRoleColor(role: ClientRole): string {
  switch (role) {
    case 'agency_owner':
      return '#8B5CF6'; // Purple
    case 'account_manager':
      return '#1D9BF0'; // Blue
    case 'creator':
      return '#10B981'; // Green
    case 'client_admin':
      return '#F59E0B'; // Amber
    case 'client_reviewer':
      return '#6B7280'; // Gray
    default:
      return '#1D9BF0';
  }
}
