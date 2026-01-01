import { describe, it, expect } from 'vitest';
import { CLIENT_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, MENU_VISIBILITY, canAccessMenuItem, type MenuItemId } from './rbac';

describe('RBAC Configuration', () => {
  it('should define all required roles', () => {
    const roleValues = CLIENT_ROLES.map(r => r.value);
    expect(roleValues).toContain('agency_owner');
    expect(roleValues).toContain('account_manager');
    expect(roleValues).toContain('creator');
    expect(roleValues).toContain('client_admin');
    expect(roleValues).toContain('client_reviewer');
  });

  it('should have correct permissions for Agency Owner', () => {
    const ownerRole = CLIENT_ROLES.find(r => r.value === 'agency_owner');
    expect(ownerRole).toBeDefined();
    expect(ownerRole?.permissions).toContain('Manage billing');
    expect(ownerRole?.permissions).toContain('Manage team members');
  });

  it('should have correct permissions for Client Reviewer', () => {
    const reviewerRole = CLIENT_ROLES.find(r => r.value === 'client_reviewer');
    expect(reviewerRole).toBeDefined();
    expect(reviewerRole?.permissions).not.toContain('Manage billing');
    expect(reviewerRole?.permissions).toContain('Review content');
  });

  describe('ROLE_LABELS', () => {
    it('should map role values to human-readable labels', () => {
      expect(ROLE_LABELS['agency_owner']).toBe('Agency Owner');
      expect(ROLE_LABELS['client_admin']).toBe('Client Admin');
    });

    it('should have a label for every defined role', () => {
      CLIENT_ROLES.forEach(role => {
        expect(ROLE_LABELS[role.value]).toBeDefined();
      });
    });
  });

  describe('ROLE_DESCRIPTIONS', () => {
    it('should map role values to descriptions', () => {
      expect(ROLE_DESCRIPTIONS['creator']).toBe('Create and edit content');
    });

    it('should have a description for every defined role', () => {
      CLIENT_ROLES.forEach(role => {
        expect(ROLE_DESCRIPTIONS[role.value]).toBeDefined();
      });
    });
  });

  describe('Menu Visibility', () => {
    it('should define visibility for all menu items', () => {
      const menuItems: MenuItemId[] = ['dashboard', 'hubs', 'review', 'clients', 'brand-dna', 'analytics', 'settings'];
      menuItems.forEach(item => {
        expect(MENU_VISIBILITY[item]).toBeDefined();
        expect(Array.isArray(MENU_VISIBILITY[item])).toBe(true);
      });
    });

    it('should allow agency_owner access to all menu items', () => {
      const menuItems: MenuItemId[] = ['dashboard', 'hubs', 'review', 'clients', 'brand-dna', 'analytics', 'settings'];
      menuItems.forEach(item => {
        expect(canAccessMenuItem('agency_owner', item)).toBe(true);
      });
    });

    it('should restrict creator from clients, review, and settings', () => {
      expect(canAccessMenuItem('creator', 'clients')).toBe(false);
      expect(canAccessMenuItem('creator', 'review')).toBe(false);
      expect(canAccessMenuItem('creator', 'settings')).toBe(false);
    });

    it('should allow creator access to hubs and brand-dna', () => {
      expect(canAccessMenuItem('creator', 'hubs')).toBe(true);
      expect(canAccessMenuItem('creator', 'brand-dna')).toBe(true);
      expect(canAccessMenuItem('creator', 'dashboard')).toBe(true);
    });

    it('should restrict client_reviewer to dashboard and review only', () => {
      expect(canAccessMenuItem('client_reviewer', 'dashboard')).toBe(true);
      expect(canAccessMenuItem('client_reviewer', 'review')).toBe(true);
      expect(canAccessMenuItem('client_reviewer', 'hubs')).toBe(false);
      expect(canAccessMenuItem('client_reviewer', 'clients')).toBe(false);
      expect(canAccessMenuItem('client_reviewer', 'settings')).toBe(false);
      expect(canAccessMenuItem('client_reviewer', 'analytics')).toBe(false);
    });

    it('should return false when role is null', () => {
      expect(canAccessMenuItem(null, 'dashboard')).toBe(false);
      expect(canAccessMenuItem(null, 'hubs')).toBe(false);
    });
  });
});
