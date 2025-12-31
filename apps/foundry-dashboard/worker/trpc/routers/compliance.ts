/**
 * Compliance Router - Data Privacy & GDPR
 *
 * Epic 1.5-9: Data deletion, consent tracking, secure URLs, audit logs
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

export const complianceRouter = t.router({
  // ===== Story 1.5-9-1: Data Deletion Request (GDPR) =====

  requestDataDeletion: procedure
    .input(z.object({
      clientId: z.string().min(1),
      reason: z.string().max(500).optional(),
      confirmPhrase: z.string(), // Must match "DELETE MY DATA"
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      if (input.confirmPhrase !== 'DELETE MY DATA') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Please type "DELETE MY DATA" to confirm',
        });
      }

      const requestId = crypto.randomUUID();
      const now = Date.now();
      const scheduledDeletion = now + 30 * 24 * 60 * 60 * 1000; // 30 days grace period

      await ctx.db.prepare(`
        INSERT INTO deletion_requests (id, client_id, user_id, reason, status, scheduled_at, created_at)
        VALUES (?, ?, ?, ?, 'pending', ?, ?)
      `).bind(requestId, input.clientId, ctx.userId, input.reason || null, scheduledDeletion, now).run();

      // Log the action
      await logAuditAction(ctx, {
        clientId: input.clientId,
        action: 'deletion_request',
        details: { requestId, scheduledDeletion },
      });

      return {
        requestId,
        status: 'pending',
        scheduledDeletion,
        gracePeriodDays: 30,
        message: 'Deletion request received. You have 30 days to cancel before data is permanently deleted.',
      };
    }),

  cancelDeletionRequest: procedure
    .input(z.object({
      clientId: z.string().min(1),
      requestId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const now = Date.now();
      await ctx.db.prepare(`
        UPDATE deletion_requests SET status = 'cancelled', cancelled_at = ?
        WHERE id = ? AND client_id = ? AND status = 'pending'
      `).bind(now, input.requestId, input.clientId).run();

      await logAuditAction(ctx, {
        clientId: input.clientId,
        action: 'deletion_cancelled',
        details: { requestId: input.requestId },
      });

      return { success: true, cancelledAt: now };
    }),

  getDeletionStatus: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const request = await ctx.db.prepare(`
        SELECT * FROM deletion_requests
        WHERE client_id = ? AND status = 'pending'
        ORDER BY created_at DESC LIMIT 1
      `).bind(input.clientId).first();

      if (!request) {
        return { hasPendingDeletion: false };
      }

      const daysRemaining = Math.ceil(
        ((request.scheduled_at as number) - Date.now()) / (24 * 60 * 60 * 1000)
      );

      return {
        hasPendingDeletion: true,
        requestId: request.id as string,
        scheduledAt: request.scheduled_at as number,
        daysRemaining,
        canCancel: daysRemaining > 0,
      };
    }),

  // ===== Story 1.5-9-2: Consent Version Tracking =====

  recordConsent: procedure
    .input(z.object({
      clientId: z.string().min(1),
      consentType: z.enum(['terms', 'privacy', 'marketing', 'analytics', 'testimonial']),
      version: z.string(),
      granted: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const consentId = crypto.randomUUID();
      const now = Date.now();

      await ctx.db.prepare(`
        INSERT INTO consent_records (id, client_id, user_id, consent_type, version, granted, ip_address, user_agent, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        consentId,
        input.clientId,
        ctx.userId,
        input.consentType,
        input.version,
        input.granted ? 1 : 0,
        ctx.request?.headers.get('cf-connecting-ip') || null,
        ctx.request?.headers.get('user-agent') || null,
        now
      ).run();

      await logAuditAction(ctx, {
        clientId: input.clientId,
        action: 'consent_recorded',
        details: { consentType: input.consentType, version: input.version, granted: input.granted },
      });

      return { consentId, recordedAt: now };
    }),

  getConsentStatus: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Get latest consent for each type
      const consents = await ctx.db.prepare(`
        SELECT consent_type, version, granted, recorded_at
        FROM consent_records
        WHERE client_id = ? AND (consent_type, recorded_at) IN (
          SELECT consent_type, MAX(recorded_at)
          FROM consent_records
          WHERE client_id = ?
          GROUP BY consent_type
        )
      `).bind(input.clientId, input.clientId).all();

      const consentMap: Record<string, { version: string; granted: boolean; recordedAt: number }> = {};
      for (const c of consents.results || []) {
        consentMap[c.consent_type as string] = {
          version: c.version as string,
          granted: (c.granted as number) === 1,
          recordedAt: c.recorded_at as number,
        };
      }

      return {
        consents: consentMap,
        requiredConsents: ['terms', 'privacy'],
        optionalConsents: ['marketing', 'analytics', 'testimonial'],
      };
    }),

  // ===== Story 1.5-9-3: Secure Asset URLs =====

  getSecureAssetUrl: procedure
    .input(z.object({
      clientId: z.string().min(1),
      r2Key: z.string(),
      expiresInSeconds: z.number().min(60).max(86400).default(3600), // Max 24 hours
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      // Verify the asset belongs to this client
      if (!input.r2Key.includes(input.clientId)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Asset does not belong to this client',
        });
      }

      // Generate signed URL (in production, use R2 presigned URLs)
      const token = crypto.randomUUID();
      const expiresAt = Date.now() + input.expiresInSeconds * 1000;

      // Store token for validation
      await ctx.db.prepare(`
        INSERT INTO asset_tokens (token, r2_key, client_id, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(token, input.r2Key, input.clientId, expiresAt, Date.now()).run();

      const secureUrl = `/api/assets/${token}`;

      return {
        secureUrl,
        expiresAt,
        expiresIn: input.expiresInSeconds,
      };
    }),

  // ===== Story 1.5-9-4: GDPR Data Export (Right to Portability) =====

  requestDataExport: procedure
    .input(z.object({
      clientId: z.string().min(1),
      format: z.enum(['json', 'csv']).default('json'),
      includeMedia: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const exportId = crypto.randomUUID();
      const now = Date.now();

      await ctx.db.prepare(`
        INSERT INTO data_exports (id, client_id, user_id, format, include_media, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
      `).bind(exportId, input.clientId, ctx.userId, input.format, input.includeMedia ? 1 : 0, now).run();

      await logAuditAction(ctx, {
        clientId: input.clientId,
        action: 'data_export_requested',
        details: { exportId, format: input.format, includeMedia: input.includeMedia },
      });

      return {
        exportId,
        status: 'pending',
        estimatedTime: input.includeMedia ? '24-48 hours' : '1-2 hours',
        message: 'Your data export has been requested. You will receive an email when it is ready.',
      };
    }),

  getExportStatus: procedure
    .input(z.object({
      clientId: z.string().min(1),
      exportId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      const export_ = await ctx.db.prepare(`
        SELECT * FROM data_exports WHERE id = ? AND client_id = ?
      `).bind(input.exportId, input.clientId).first();

      if (!export_) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Export not found' });
      }

      return {
        exportId: export_.id as string,
        status: export_.status as string,
        format: export_.format as string,
        includeMedia: (export_.include_media as number) === 1,
        downloadUrl: export_.download_url as string | null,
        createdAt: export_.created_at as number,
        completedAt: export_.completed_at as number | null,
        expiresAt: export_.expires_at as number | null,
      };
    }),

  // ===== Story 1.5-9-5: Admin Action Audit Log =====

  getAuditLog: procedure
    .input(z.object({
      clientId: z.string().min(1),
      actionType: z.string().optional(),
      startDate: z.number().optional(),
      endDate: z.number().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);

      let query = `
        SELECT al.*, u.email as user_email
        FROM audit_log al
        LEFT JOIN user u ON al.user_id = u.id
        WHERE al.client_id = ?
      `;
      const params: (string | number)[] = [input.clientId];

      if (input.actionType) {
        query += ` AND al.action = ?`;
        params.push(input.actionType);
      }

      if (input.startDate) {
        query += ` AND al.created_at >= ?`;
        params.push(input.startDate);
      }

      if (input.endDate) {
        query += ` AND al.created_at <= ?`;
        params.push(input.endDate);
      }

      query += ` ORDER BY al.created_at DESC LIMIT ?`;
      params.push(input.limit);

      const result = await ctx.db.prepare(query).bind(...params).all();

      return (result.results || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        action: row.action as string,
        userEmail: row.user_email as string | null,
        details: JSON.parse((row.details as string) || '{}'),
        ipAddress: row.ip_address as string | null,
        createdAt: row.created_at as number,
      }));
    }),
});

// Helper function to log audit actions
async function logAuditAction(
  ctx: Context,
  data: { clientId: string; action: string; details: Record<string, unknown> }
) {
  await ctx.db.prepare(`
    INSERT INTO audit_log (id, client_id, user_id, action, details, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    data.clientId,
    ctx.userId,
    data.action,
    JSON.stringify(data.details),
    ctx.request?.headers.get('cf-connecting-ip') || null,
    ctx.request?.headers.get('user-agent') || null,
    Date.now()
  ).run();
}
