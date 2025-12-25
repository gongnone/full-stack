/**
 * RBAC configuration for Multi-Client Agency module
 * Story 7.2: RBAC and Team Assignment
 */

export type ClientRole = 'agency_owner' | 'account_manager' | 'creator' | 'client_admin' | 'client_reviewer';

export interface RoleConfig {
  value: ClientRole;
  label: string;
  description: string;
  permissions: string[];
}

export const CLIENT_ROLES: RoleConfig[] = [
  {
    value: 'agency_owner',
    label: 'Agency Owner',
    description: 'Full access to all client settings and team management',
    permissions: [
      'Create and edit content',
      'Approve and publish content',
      'Manage team members',
      'Update client settings',
      'Generate shareable links',
      'View analytics',
      'Manage billing',
    ],
  },
  {
    value: 'account_manager',
    label: 'Account Manager',
    description: 'Manage content and team members',
    permissions: [
      'Create and edit content',
      'Approve and publish content',
      'Manage team members (except owners)',
      'Generate shareable links',
      'View analytics',
    ],
  },
  {
    value: 'creator',
    label: 'Creator',
    description: 'Create and edit content',
    permissions: [
      'Create and edit content',
      'View own content',
      'Request reviews',
    ],
  },
  {
    value: 'client_admin',
    label: 'Client Admin',
    description: 'Client-side administrator with review access',
    permissions: [
      'Review and approve content',
      'View analytics',
      'Export content',
    ],
  },
  {
    value: 'client_reviewer',
    label: 'Client Reviewer',
    description: 'Review and approve content only',
    permissions: [
      'Review content',
      'Provide feedback',
      'Approve or reject content',
    ],
  },
];

export const ROLE_LABELS = CLIENT_ROLES.reduce((acc, role) => {
  acc[role.value] = role.label;
  return acc;
}, {} as Record<ClientRole, string>);

export const ROLE_DESCRIPTIONS = CLIENT_ROLES.reduce((acc, role) => {
  acc[role.value] = role.description;
  return acc;
}, {} as Record<ClientRole, string>);
