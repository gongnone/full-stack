import { describe, it, expect } from 'vitest';
import { CLIENT_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, type ClientRole } from './rbac';

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
});
