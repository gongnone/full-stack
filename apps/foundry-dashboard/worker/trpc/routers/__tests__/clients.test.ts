import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientsRouter } from '../clients';
import { createMockContext } from './utils';
import { TRPCError } from '@trpc/server';

describe('clientsRouter', () => {
  let mockCtx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mockCtx = createMockContext();
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('lists clients for the account', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);

      mockDb.all.mockResolvedValue({
        results: [
          { id: 'c1', name: 'Client 1', status: 'active', created_at: 123 },
        ],
      });

      const result = await caller.list({});

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT c.id, c.name'));
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.name).toBe('Client 1');
    });
  });

  describe('create', () => {
    it('creates a client and adds owner', async () => {
      const { ctx, mockDb, mockCallAgent } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        name: 'New Client',
        brandColor: '#FF0000',
      };

      // Mock batch execution
      mockDb.batch.mockResolvedValue([{ success: true }, { success: true }, { success: true }]);
      mockCallAgent.mockResolvedValue({});

      const result = await caller.create(input);

      // Verify transaction components
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO clients'));
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO client_members'));
      // R-14 AC4: Verify auto-set active client
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO user_profiles'));
      
      // Verify batch call
      expect(mockDb.batch).toHaveBeenCalled();
      
      expect(mockCallAgent).toHaveBeenCalledWith(expect.any(String), 'getBrandDNA', {});
      expect(result.success).toBe(true);
    });
  });

  describe('addMember', () => {
    it('adds a member if user has permissions', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        role: 'creator' as const,
      };

      // Mock permission check
      mockDb.first.mockResolvedValueOnce({ role: 'agency_owner' });
      // Mock user lookup
      mockDb.first.mockResolvedValueOnce({ id: 'target-u1' });
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.addMember(input);

      expect(result.success).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO client_members'));
    });

    it('throws forbidden if user is not an owner', async () => {
      const { ctx, setMembershipRole } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        role: 'creator' as const,
      };

      // Set the membership role to 'creator' - only agency_owner/account_manager can add members
      setMembershipRole('creator');

      await expect(caller.addMember(input)).rejects.toThrow(TRPCError);
    });
  });

  describe('switch', () => {
    it('updates active client in profile', async () => {
      const { ctx, mockDb, mockCallAgent } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = { clientId: '00000000-0000-0000-0000-000000000000' };

      mockDb.first.mockResolvedValueOnce({ role: 'creator' });
      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.switch(input);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE user_profiles'));
      expect(mockCallAgent).toHaveBeenCalledWith(input.clientId, 'getBrandDNA', {});
      expect(result.success).toBe(true);
    });
  });

  describe('generateShareableLink', () => {
    it('generates a shareable link with default settings', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
      };

      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.generateShareableLink(input);

      expect(result.token).toBeDefined();
      expect(result.token.length).toBe(32); // UUID without dashes
      expect(result.url).toBe(`/review/${result.token}`);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO shareable_links'));
    });

    it('normalizes emails to lowercase on storage', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        allowedEmails: ['User@Example.COM', 'ADMIN@test.org'],
      };

      mockDb.run.mockResolvedValue({ success: true });

      await caller.generateShareableLink(input);

      // Verify the bind call includes lowercased emails
      expect(mockDb.bind).toHaveBeenCalledWith(
        expect.any(String), // id
        input.clientId,
        expect.any(String), // token
        expect.any(Number), // expires_at
        'view', // default permissions
        JSON.stringify(['user@example.com', 'admin@test.org'])
      );
    });

    it('throws forbidden if user is not agency_owner or account_manager', async () => {
      const { ctx, setMembershipRole } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
      };

      setMembershipRole('creator');

      await expect(caller.generateShareableLink(input)).rejects.toThrow(TRPCError);
    });

    it('accepts custom expiration and permissions', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        clientId: '00000000-0000-0000-0000-000000000000',
        expiresInDays: 14,
        permissions: 'approve' as const,
      };

      mockDb.run.mockResolvedValue({ success: true });

      const result = await caller.generateShareableLink(input);

      expect(result.expiresAt).toBeInstanceOf(Date);
      // Verify expiration is roughly 14 days from now
      const expectedExpiry = Date.now() + 14 * 24 * 60 * 60 * 1000;
      expect(result.expiresAt.getTime()).toBeGreaterThan(expectedExpiry - 60000);
      expect(result.expiresAt.getTime()).toBeLessThan(expectedExpiry + 60000);
    });
  });

  describe('validateShareableLink', () => {
    it('returns client and spokes for valid token and email', async () => {
      const { ctx, mockDb, mockCallAgent } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        token: 'valid-token-123',
        email: 'user@example.com',
      };

      // Mock link lookup
      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        permissions: 'view',
        allowed_emails: null,
      });

      // Mock client lookup
      mockDb.first.mockResolvedValueOnce({
        id: 'client-1',
        name: 'Test Client',
        brand_color: '#FF0000',
      });

      // Mock spokes from agent
      mockCallAgent.mockResolvedValue([
        { id: 'spoke-1', content: 'Test content' },
      ]);

      const result = await caller.validateShareableLink(input);

      expect(result.client.name).toBe('Test Client');
      expect(result.permissions).toBe('view');
      expect(result.spokes).toHaveLength(1);
    });

    it('throws NOT_FOUND for invalid token', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        token: 'invalid-token',
        email: 'user@example.com',
      };

      mockDb.first.mockResolvedValueOnce(null);

      await expect(caller.validateShareableLink(input)).rejects.toThrow(TRPCError);
    });

    it('throws FORBIDDEN for expired link', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        token: 'expired-token',
        email: 'user@example.com',
      };

      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        permissions: 'view',
        allowed_emails: null,
      });

      await expect(caller.validateShareableLink(input)).rejects.toThrow(TRPCError);
    });

    it('throws FORBIDDEN if email not in allowed list', async () => {
      const { ctx, mockDb } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        token: 'restricted-token',
        email: 'unauthorized@example.com',
      };

      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        permissions: 'view',
        allowed_emails: JSON.stringify(['allowed@example.com']),
      });

      await expect(caller.validateShareableLink(input)).rejects.toThrow(TRPCError);
    });

    it('allows access if email matches allowed list (case-insensitive)', async () => {
      const { ctx, mockDb, mockCallAgent } = mockCtx;
      const caller = clientsRouter.createCaller(ctx);
      const input = {
        token: 'restricted-token',
        email: 'ALLOWED@example.com', // uppercase
      };

      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        permissions: 'approve',
        allowed_emails: JSON.stringify(['allowed@example.com']), // lowercase stored
      });

      mockDb.first.mockResolvedValueOnce({
        id: 'client-1',
        name: 'Test Client',
        brand_color: '#FF0000',
      });

      mockCallAgent.mockResolvedValue([]);

      // Case-insensitive comparison should succeed
      const result = await caller.validateShareableLink(input);

      expect(result.client.name).toBe('Test Client');
      expect(result.permissions).toBe('approve');
    });
  });
});
