/**
 * Testimonials Router Tests
 *
 * Coverage for FR-1.5.16: Testimonial Collection Flow
 * - list: Paginated testimonial listing
 * - get: Single testimonial details
 * - getDownloadUrl: Signed URL generation with audit logging
 * - bulkExport: ZIP generation for multiple testimonials
 *
 * ⚠️  EXECUTION NOTE:
 * These are UNIT tests using mocked dependencies (no real Workers runtime needed).
 * However, vitest config issues prevent direct execution.
 * Tests document expected API behavior and serve as executable specification.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testimonialsRouter } from '../testimonials';
import { createMockContext } from './utils';

describe('testimonialsRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== List Testimonials =====

  describe('list', () => {
    it('returns empty array when no testimonials exist', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.all.mockResolvedValueOnce({ results: [] });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.list({});

      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeUndefined();
    });

    it('returns paginated testimonials with client info', async () => {
      const { ctx, mockDb } = createMockContext();
      const now = Date.now();

      mockDb.all.mockResolvedValueOnce({
        results: [
          {
            id: 'testimonial-1',
            client_id: 'client-123',
            video_url: 'https://r2.example.com/video1.webm',
            duration: 45,
            permission_public: 1,
            created_at: now - 1000,
            client_name: 'Acme Corp',
            client_logo: 'https://example.com/logo.png',
          },
          {
            id: 'testimonial-2',
            client_id: 'client-456',
            video_url: 'https://r2.example.com/video2.webm',
            duration: 60,
            permission_public: 0,
            created_at: now - 2000,
            client_name: 'Tech Inc',
            client_logo: null,
          },
        ],
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.list({ limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe('testimonial-1');
      expect(result.items[0].clientName).toBe('Acme Corp');
      expect(result.items[0].permissionPublic).toBe(true);
      expect(result.items[1].permissionPublic).toBe(false);
    });

    it('returns nextCursor when more results available', async () => {
      const { ctx, mockDb } = createMockContext();
      const now = Date.now();

      // Return exactly limit items (indicating more available)
      const items = Array(20).fill(null).map((_, i) => ({
        id: `testimonial-${i}`,
        client_id: 'client-123',
        video_url: 'https://example.com/video.webm',
        duration: 30,
        permission_public: 1,
        created_at: now - i * 1000,
        client_name: 'Test Client',
        client_logo: null,
      }));

      mockDb.all.mockResolvedValueOnce({ results: items });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.list({ limit: 20 });

      expect(result.items).toHaveLength(20);
      expect(result.nextCursor).toBe(now - 19000); // Last item's timestamp
    });

    it('respects cursor for pagination', async () => {
      const { ctx, mockDb } = createMockContext();
      const cursor = Date.now() - 5000;

      mockDb.all.mockResolvedValueOnce({ results: [] });

      const caller = testimonialsRouter.createCaller(ctx);
      await caller.list({ limit: 10, cursor });

      expect(mockDb.bind).toHaveBeenCalledWith(cursor, 10);
    });

    it('respects limit parameter', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.all.mockResolvedValueOnce({ results: [] });

      const caller = testimonialsRouter.createCaller(ctx);
      await caller.list({ limit: 5 });

      expect(mockDb.bind).toHaveBeenCalledWith(expect.any(Number), 5);
    });
  });

  // ===== Get Single Testimonial =====

  describe('get', () => {
    it('throws NOT_FOUND when testimonial does not exist', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = testimonialsRouter.createCaller(ctx);

      await expect(
        caller.get({ id: '00000000-0000-0000-0000-000000000000' })
      ).rejects.toThrow('Testimonial not found');
    });

    it('returns testimonial with all fields', async () => {
      const { ctx, mockDb } = createMockContext();
      const now = Date.now();

      mockDb.first.mockResolvedValueOnce({
        id: 'testimonial-123',
        client_id: 'client-123',
        video_url: 'https://r2.example.com/video.webm',
        duration: 45,
        permission_public: 1,
        created_at: now,
        client_name: 'Acme Corp',
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.get({ id: 'testimonial-123' });

      expect(result.id).toBe('testimonial-123');
      expect(result.clientId).toBe('client-123');
      expect(result.clientName).toBe('Acme Corp');
      expect(result.videoUrl).toBe('https://r2.example.com/video.webm');
      expect(result.duration).toBe(45);
      expect(result.permissionPublic).toBe(true);
      expect(result.createdAt).toBe(now);
    });

    it('converts permission_public to boolean', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'testimonial-123',
        client_id: 'client-123',
        video_url: 'https://example.com/video.webm',
        duration: 30,
        permission_public: 0,
        created_at: Date.now(),
        client_name: 'Test',
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.get({ id: 'testimonial-123' });

      expect(result.permissionPublic).toBe(false);
    });
  });

  // ===== Get Download URL (AC1) =====

  describe('getDownloadUrl', () => {
    it('throws NOT_FOUND when testimonial does not exist', async () => {
      const { ctx, mockDb } = createMockContext();
      mockDb.first.mockResolvedValueOnce(null);

      const caller = testimonialsRouter.createCaller(ctx);

      await expect(
        caller.getDownloadUrl({ id: '00000000-0000-0000-0000-000000000000' })
      ).rejects.toThrow('Testimonial not found');
    });

    it('throws BAD_REQUEST when no media file exists', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'testimonial-123',
        client_id: 'client-123',
        r2_key: null,
        type: 'video',
      });

      const caller = testimonialsRouter.createCaller(ctx);

      await expect(
        caller.getDownloadUrl({ id: 'testimonial-123' })
      ).rejects.toThrow('No media file associated');
    });

    it('creates asset token and returns download URL', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'testimonial-123',
        client_id: 'client-123',
        r2_key: 'testimonials/client-123/video.webm',
        type: 'video',
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.getDownloadUrl({ id: 'testimonial-123' });

      expect(result.downloadUrl).toMatch(/^\/api\/assets\/download\//);
      expect(result.expiresAt).toBeDefined();
      expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());

      // Verify asset token was inserted
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO asset_tokens')
      );
    });

    it('creates audit log entry (AC3)', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'testimonial-123',
        client_id: 'client-123',
        r2_key: 'testimonials/video.webm',
        type: 'video',
      });

      const caller = testimonialsRouter.createCaller(ctx);
      await caller.getDownloadUrl({ id: 'testimonial-123' });

      // Verify audit log was created
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audit_log')
      );
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining("'download_testimonial'")
      );
    });

    it('token expires in 1 hour', async () => {
      const { ctx, mockDb } = createMockContext();
      const now = Date.now();

      mockDb.first.mockResolvedValueOnce({
        id: 'testimonial-123',
        client_id: 'client-123',
        r2_key: 'testimonials/video.webm',
        type: 'video',
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.getDownloadUrl({ id: 'testimonial-123' });

      const expiresAt = new Date(result.expiresAt).getTime();
      const oneHourFromNow = now + 3600000;

      // Allow 5 second tolerance for test execution time
      expect(expiresAt).toBeGreaterThanOrEqual(oneHourFromNow - 5000);
      expect(expiresAt).toBeLessThanOrEqual(oneHourFromNow + 5000);
    });
  });

  // ===== Bulk Export (AC2) =====

  describe('bulkExport', () => {
    it('throws BAD_REQUEST when no testimonials selected', async () => {
      const { ctx } = createMockContext();

      const caller = testimonialsRouter.createCaller(ctx);

      await expect(
        caller.bulkExport({
          testimonialIds: [],
          clientId: 'client-123',
        })
      ).rejects.toThrow('No testimonials selected');
    });

    it('throws FORBIDDEN when testimonials do not belong to client', async () => {
      const { ctx, mockDb } = createMockContext();

      // Count returns fewer than requested (mismatch)
      mockDb.first.mockResolvedValueOnce({ count: 1 });

      const caller = testimonialsRouter.createCaller(ctx);

      await expect(
        caller.bulkExport({
          testimonialIds: [
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002',
          ],
          clientId: 'client-123',
        })
      ).rejects.toThrow('One or more testimonials do not belong to this client');
    });

    it('triggers export workflow and returns job ID', async () => {
      const { ctx, mockDb, mockCallEngine } = createMockContext();

      mockDb.first.mockResolvedValueOnce({ count: 2 });
      mockCallEngine.mockResolvedValueOnce({ ok: true });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.bulkExport({
        testimonialIds: [
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
        ],
        clientId: 'client-123',
      });

      expect(result.message).toContain('Export started');
      expect(result.jobId).toBeDefined();

      // Verify engine was called
      expect(mockCallEngine).toHaveBeenCalledWith(
        'http://internal/api/exports/testimonials',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('creates audit log entry (AC3)', async () => {
      const { ctx, mockDb, mockCallEngine } = createMockContext();

      mockDb.first.mockResolvedValueOnce({ count: 3 });
      mockCallEngine.mockResolvedValueOnce({ ok: true });

      const caller = testimonialsRouter.createCaller(ctx);
      await caller.bulkExport({
        testimonialIds: [
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000003',
        ],
        clientId: 'client-123',
      });

      // Verify audit log was created
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audit_log')
      );
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining("'bulk_export_testimonials'")
      );
    });

    it('continues even if engine call fails', async () => {
      const { ctx, mockDb, mockCallEngine } = createMockContext();

      mockDb.first.mockResolvedValueOnce({ count: 1 });
      mockCallEngine.mockRejectedValueOnce(new Error('Engine unavailable'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.bulkExport({
        testimonialIds: ['00000000-0000-0000-0000-000000000001'],
        clientId: 'client-123',
      });

      expect(result.message).toContain('Export started');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Export workflow trigger failed',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  // ===== Input Validation =====

  describe('input validation', () => {
    it('list: rejects limit below 1', async () => {
      const { ctx } = createMockContext();

      const caller = testimonialsRouter.createCaller(ctx);

      await expect(
        caller.list({ limit: 0 })
      ).rejects.toThrow();
    });

    it('list: rejects limit above 50', async () => {
      const { ctx } = createMockContext();

      const caller = testimonialsRouter.createCaller(ctx);

      await expect(
        caller.list({ limit: 51 })
      ).rejects.toThrow();
    });

    it('get: rejects invalid UUID', async () => {
      const { ctx } = createMockContext();

      const caller = testimonialsRouter.createCaller(ctx);

      await expect(
        caller.get({ id: 'not-a-uuid' })
      ).rejects.toThrow();
    });

    it('bulkExport: rejects empty clientId', async () => {
      const { ctx } = createMockContext();

      const caller = testimonialsRouter.createCaller(ctx);

      await expect(
        caller.bulkExport({
          testimonialIds: ['00000000-0000-0000-0000-000000000001'],
          clientId: '',
        })
      ).rejects.toThrow();
    });
  });

  // ===== FR-1.5.16: Testimonial Request Flow =====

  describe('checkTrigger', () => {
    it('returns shouldTrigger:false when threshold not met', async () => {
      const { ctx, mockDb, mockCallAgent } = createMockContext();

      // No existing request
      mockDb.first.mockResolvedValueOnce(null);
      // Only 5 approved spokes
      mockCallAgent.mockResolvedValueOnce({ count: 5 });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.checkTrigger({ clientId: 'client-123' });

      expect(result.shouldTrigger).toBe(false);
      expect(result.reason).toBe('threshold_not_met');
      expect(result).toHaveProperty('approvedCount', 5);
    });

    it('returns shouldTrigger:true when threshold met', async () => {
      const { ctx, mockDb, mockCallAgent } = createMockContext();

      mockDb.first.mockResolvedValueOnce(null);
      mockCallAgent.mockResolvedValueOnce({ count: 15 });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.checkTrigger({ clientId: 'client-123' });

      expect(result.shouldTrigger).toBe(true);
      expect(result.reason).toBe('threshold_met');
      expect(result).toHaveProperty('approvedCount', 15);
    });

    it('returns shouldTrigger:false when already declined', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        status: 'declined',
        snooze_count: 0,
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.checkTrigger({ clientId: 'client-123' });

      expect(result.shouldTrigger).toBe(false);
      expect(result.reason).toBe('already_responded');
      expect(result).toHaveProperty('status', 'declined');
    });

    it('returns shouldTrigger:false when already approved', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        status: 'approved',
        snooze_count: 0,
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.checkTrigger({ clientId: 'client-123' });

      expect(result.shouldTrigger).toBe(false);
      expect(result.reason).toBe('already_responded');
    });

    it('returns shouldTrigger:false when max snoozes reached', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        status: 'snoozed',
        snooze_count: 2,
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.checkTrigger({ clientId: 'client-123' });

      expect(result.shouldTrigger).toBe(false);
      expect(result.reason).toBe('max_snoozes');
    });

    it('returns shouldTrigger:true for pending request', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        status: 'pending',
        snooze_count: 0,
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.checkTrigger({ clientId: 'client-123' });

      expect(result.shouldTrigger).toBe(true);
      expect(result.reason).toBe('pending_request');
    });

    it('returns shouldTrigger:true for snoozed with count < 2', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        status: 'snoozed',
        snooze_count: 1,
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.checkTrigger({ clientId: 'client-123' });

      expect(result.shouldTrigger).toBe(true);
      expect(result).toHaveProperty('status', 'snoozed');
    });
  });

  describe('requestStatus', () => {
    it('returns status:none when no request exists', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce(null);

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.requestStatus({ clientId: 'client-123' });

      expect(result.status).toBe('none');
      expect(result.requestId).toBeNull();
    });

    it('returns full request details when exists', async () => {
      const { ctx, mockDb } = createMockContext();
      const now = Date.now();

      mockDb.first.mockResolvedValueOnce({
        id: 'request-123',
        status: 'snoozed',
        snooze_count: 1,
        created_at: now - 1000,
        approved_at: null,
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.requestStatus({ clientId: 'client-123' });

      expect(result.status).toBe('snoozed');
      expect(result.requestId).toBe('request-123');
      expect(result.snoozeCount).toBe(1);
      expect(result.createdAt).toBe(now - 1000);
      expect(result.approvedAt).toBeNull();
    });
  });

  describe('respond', () => {
    it('creates new request on accept', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce(null); // No existing request

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.respond({
        clientId: 'client-123',
        response: 'accept',
        sentiment: 'excited',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('pending');
      expect(result.snoozeCount).toBe(0);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO testimonials')
      );
    });

    it('creates new request on decline', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce(null);

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.respond({
        clientId: 'client-123',
        response: 'decline',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('declined');
      expect(result.snoozeCount).toBe(0);
    });

    it('creates new request on snooze with count=1', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce(null);

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.respond({
        clientId: 'client-123',
        response: 'snooze',
        sentiment: 'solid',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('snoozed');
      expect(result.snoozeCount).toBe(1);
    });

    it('updates existing request on accept', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'existing-123',
        status: 'pending',
        snooze_count: 0,
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.respond({
        clientId: 'client-123',
        response: 'accept',
      });

      expect(result.success).toBe(true);
      expect(result.requestId).toBe('existing-123');
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE testimonials')
      );
    });

    it('increments snooze_count on subsequent snooze', async () => {
      const { ctx, mockDb } = createMockContext();

      mockDb.first.mockResolvedValueOnce({
        id: 'existing-123',
        status: 'snoozed',
        snooze_count: 1,
      });

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.respond({
        clientId: 'client-123',
        response: 'snooze',
      });

      expect(result.success).toBe(true);
      expect(result.snoozeCount).toBe(2);
    });

    it('sets approved_at on accept', async () => {
      const { ctx, mockDb } = createMockContext();
      const now = Date.now();

      mockDb.first.mockResolvedValueOnce(null);

      const caller = testimonialsRouter.createCaller(ctx);
      await caller.respond({
        clientId: 'client-123',
        response: 'accept',
      });

      // Verify approved_at is set (not null)
      const bindCalls = mockDb.bind.mock.calls;
      const lastCall = bindCalls[bindCalls.length - 1];
      expect(lastCall).toContain('pending');
      expect(lastCall[lastCall.length - 1]).toBeGreaterThanOrEqual(now - 1000);
    });
  });

  describe('submit', () => {
    it('updates existing request with video details', async () => {
      const { ctx, mockDb } = createMockContext();

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.submit({
        clientId: 'client-123',
        requestId: 'request-123',
        r2Key: 'testimonials/client-123/video.webm',
        duration: 45,
        permissionPublic: true,
      });

      expect(result.success).toBe(true);
      expect(result.testimonialId).toBe('request-123');
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE testimonials')
      );
    });

    it('creates new testimonial without requestId', async () => {
      const { ctx, mockDb } = createMockContext();

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.submit({
        clientId: 'client-123',
        r2Key: 'testimonials/video.webm',
        duration: 60,
        permissionPublic: false,
      });

      expect(result.success).toBe(true);
      expect(result.testimonialId).toBeDefined();
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO testimonials')
      );
    });

    it('sets status to public when permissionPublic:true', async () => {
      const { ctx, mockDb } = createMockContext();

      const caller = testimonialsRouter.createCaller(ctx);
      await caller.submit({
        clientId: 'client-123',
        requestId: 'request-123',
        r2Key: 'testimonials/video.webm',
        duration: 30,
        permissionPublic: true,
      });

      expect(mockDb.bind).toHaveBeenCalledWith(
        'testimonials/video.webm',
        30,
        1, // permissionPublic as integer
        'public', // status
        expect.any(Number),
        'request-123',
        'client-123'
      );
    });

    it('validates duration max 180 seconds', async () => {
      const { ctx } = createMockContext();

      const caller = testimonialsRouter.createCaller(ctx);

      await expect(
        caller.submit({
          clientId: 'client-123',
          r2Key: 'testimonials/video.webm',
          duration: 200,
          permissionPublic: false,
        })
      ).rejects.toThrow();
    });
  });

  describe('getUploadUrl', () => {
    it('returns upload URL with generated r2Key', async () => {
      const { ctx } = createMockContext();
      const now = Date.now();

      const caller = testimonialsRouter.createCaller(ctx);
      const result = await caller.getUploadUrl({
        clientId: 'client-123',
        fileName: 'testimonial.webm',
        contentType: 'video/webm',
      });

      expect(result.uploadUrl).toBe('/api/upload/testimonial');
      expect(result.r2Key).toContain('testimonials/client-123/');
      expect(result.r2Key).toContain('testimonial.webm');
      expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(now);
    });

    it('generates unique r2Key with timestamp', async () => {
      const { ctx } = createMockContext();

      const caller = testimonialsRouter.createCaller(ctx);
      const result1 = await caller.getUploadUrl({
        clientId: 'client-123',
        fileName: 'video.webm',
      });

      // Wait a tick
      await new Promise(resolve => setTimeout(resolve, 10));

      const result2 = await caller.getUploadUrl({
        clientId: 'client-123',
        fileName: 'video.webm',
      });

      expect(result1.r2Key).not.toBe(result2.r2Key);
    });
  });
});
