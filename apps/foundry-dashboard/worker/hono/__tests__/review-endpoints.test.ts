/**
 * Integration tests for /api/review/* public endpoints
 * Story 7-6: Shareable Review Links
 *
 * These endpoints allow anonymous access to shared review content via token + email.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { app } from '../app';

// Response type definitions
interface ErrorResponse {
  error: string;
}

interface ValidateResponse {
  client: {
    id: string;
    name: string;
    brandColor: string;
  };
  permissions: string;
  spokes: Array<{ id: string; content: string }>;
}

interface ActionResponse {
  success: boolean;
}

// Mock environment bindings
const mockDb = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  all: vi.fn(),
  run: vi.fn(),
};

const mockContentEngine = {
  fetch: vi.fn(),
};

const mockEnv = {
  DB: mockDb,
  CONTENT_ENGINE: mockContentEngine,
  ASSETS: {
    fetch: vi.fn().mockResolvedValue(new Response('', { status: 404 })),
  },
  MEDIA: {
    list: vi.fn().mockResolvedValue({ objects: [] }),
    put: vi.fn(),
  },
};

describe('/api/review/* endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/review/validate', () => {
    it('returns 400 if token or email missing', async () => {
      const request = new Request('http://localhost/api/review/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'abc123' }), // missing email
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ErrorResponse;

      expect(response.status).toBe(400);
      expect(data.error).toBe('Token and email are required');
    });

    it('returns 404 for invalid token', async () => {
      mockDb.first.mockResolvedValueOnce(null);

      const request = new Request('http://localhost/api/review/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'invalid', email: 'user@test.com' }),
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ErrorResponse;

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid or expired link');
    });

    it('returns 403 for expired link', async () => {
      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
        permissions: 'view',
        allowed_emails: null,
      });

      const request = new Request('http://localhost/api/review/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'expired-token', email: 'user@test.com' }),
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ErrorResponse;

      expect(response.status).toBe(403);
      expect(data.error).toBe('Link has expired');
    });

    it('returns 403 if email not in allowed list', async () => {
      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        permissions: 'view',
        allowed_emails: JSON.stringify(['allowed@test.com']),
      });

      const request = new Request('http://localhost/api/review/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'restricted', email: 'unauthorized@test.com' }),
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ErrorResponse;

      expect(response.status).toBe(403);
      expect(data.error).toBe('You do not have permission to view this review');
    });

    it('validates email case-insensitively', async () => {
      mockDb.first
        .mockResolvedValueOnce({
          id: 'link-1',
          client_id: 'client-1',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          permissions: 'view',
          allowed_emails: JSON.stringify(['allowed@test.com']), // lowercase
        })
        .mockResolvedValueOnce({
          id: 'client-1',
          name: 'Test Client',
          brand_color: '#FF0000',
        });

      mockContentEngine.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 'spoke-1', content: 'Test' }]))
      );

      const request = new Request('http://localhost/api/review/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'valid', email: 'ALLOWED@TEST.COM' }), // uppercase
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ValidateResponse;

      expect(response.status).toBe(200);
      expect(data.client.name).toBe('Test Client');
    });

    it('returns client data and spokes for valid request', async () => {
      mockDb.first
        .mockResolvedValueOnce({
          id: 'link-1',
          client_id: 'client-1',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          permissions: 'approve',
          allowed_emails: null,
        })
        .mockResolvedValueOnce({
          id: 'client-1',
          name: 'Acme Corp',
          brand_color: '#1D9BF0',
        });

      mockContentEngine.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify([
          { id: 'spoke-1', content: 'First post' },
          { id: 'spoke-2', content: 'Second post' },
        ]))
      );

      const request = new Request('http://localhost/api/review/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'valid-token', email: 'user@test.com' }),
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ValidateResponse;

      expect(response.status).toBe(200);
      expect(data.client.id).toBe('client-1');
      expect(data.client.name).toBe('Acme Corp');
      expect(data.client.brandColor).toBe('#1D9BF0');
      expect(data.permissions).toBe('approve');
      expect(data.spokes).toHaveLength(2);
    });
  });

  describe('POST /api/review/action', () => {
    it('returns 400 if required fields missing', async () => {
      const request = new Request('http://localhost/api/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'abc', email: 'user@test.com' }), // missing spokeId, action
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ErrorResponse;

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('returns 403 if permissions are view-only', async () => {
      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        permissions: 'view', // cannot approve with view permissions
        allowed_emails: null,
      });

      const request = new Request('http://localhost/api/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'view-only-token',
          email: 'user@test.com',
          spokeId: 'spoke-1',
          action: 'approve',
        }),
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ErrorResponse;

      expect(response.status).toBe(403);
      expect(data.error).toBe('This link does not have approval permissions');
    });

    it('allows approve action with approve permission', async () => {
      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        permissions: 'approve',
        allowed_emails: null,
      });

      mockContentEngine.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }))
      );

      const request = new Request('http://localhost/api/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'approve-token',
          email: 'user@test.com',
          spokeId: 'spoke-1',
          action: 'approve',
        }),
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ActionResponse;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('allows reject action with comment permission', async () => {
      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        permissions: 'comment',
        allowed_emails: null,
      });

      mockContentEngine.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }))
      );

      const request = new Request('http://localhost/api/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'comment-token',
          email: 'user@test.com',
          spokeId: 'spoke-1',
          action: 'reject',
          reason: 'Needs more detail',
        }),
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ActionResponse;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/review/edit', () => {
    it('returns 400 if required fields missing', async () => {
      const request = new Request('http://localhost/api/review/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'abc', email: 'user@test.com', spokeId: 'spoke-1' }), // missing content
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ErrorResponse;

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('returns 403 if permissions are not comment', async () => {
      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        permissions: 'approve', // can approve but not edit
        allowed_emails: null,
      });

      const request = new Request('http://localhost/api/review/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'approve-token',
          email: 'user@test.com',
          spokeId: 'spoke-1',
          content: 'Updated content',
        }),
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ErrorResponse;

      expect(response.status).toBe(403);
      expect(data.error).toBe('This link does not have edit permissions');
    });

    it('allows edit with comment permission', async () => {
      mockDb.first.mockResolvedValueOnce({
        id: 'link-1',
        client_id: 'client-1',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        permissions: 'comment',
        allowed_emails: null,
      });

      mockContentEngine.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }))
      );

      const request = new Request('http://localhost/api/review/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'comment-token',
          email: 'user@test.com',
          spokeId: 'spoke-1',
          content: 'Updated content with edits',
        }),
      });

      const response = await app.fetch(request, mockEnv as any);
      const data = await response.json() as ActionResponse;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
