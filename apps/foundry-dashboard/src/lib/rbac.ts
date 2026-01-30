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

/**
 * Menu visibility configuration for RBAC UI
 * Maps menu items to the roles that can see them
 */
export type MenuItemId = 'dashboard' | 'hubs' | 'review' | 'clients' | 'brand-dna' | 'analytics' | 'settings';

export const MENU_VISIBILITY: Record<MenuItemId, ClientRole[]> = {
  // Dashboard: visible to all authenticated users
  dashboard: ['agency_owner', 'account_manager', 'creator', 'client_admin', 'client_reviewer'],

  // Hubs (content creation): agency_owner, account_manager, creator
  hubs: ['agency_owner', 'account_manager', 'creator'],

  // Review: all except creator (they create, others review)
  review: ['agency_owner', 'account_manager', 'client_admin', 'client_reviewer'],

  // Clients (team management): agency_owner, account_manager only
  clients: ['agency_owner', 'account_manager'],

  // Brand DNA: agency_owner, account_manager (configure brand), creators can view
  'brand-dna': ['agency_owner', 'account_manager', 'creator'],

  // Analytics: all internal roles (not client_reviewer)
  analytics: ['agency_owner', 'account_manager', 'creator', 'client_admin'],

  // Settings: agency_owner, account_manager only
  settings: ['agency_owner', 'account_manager'],
};

/**
 * Check if a role can see a specific menu item
 */
// Default menu items visible when no client role is assigned (e.g., account owner before client setup)
const NO_ROLE_MENU_ITEMS: MenuItemId[] = ['dashboard', 'hubs', 'brand-dna', 'clients', 'analytics', 'settings'];

export function canAccessMenuItem(role: ClientRole | null, menuItem: MenuItemId): boolean {
  // No role = account owner who hasn't set up clients yet → safe default set
  if (!role) return NO_ROLE_MENU_ITEMS.includes(menuItem);
  return MENU_VISIBILITY[menuItem].includes(role);
}
