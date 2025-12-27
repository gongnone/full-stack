import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

export const clientsRouter = t.router({
  // List all clients for an account
  list: procedure
    .input(z.object({
      status: z.enum(['active', 'paused', 'archived']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = 'SELECT id, name, status, industry, contact_email, logo_url, brand_color, created_at FROM clients';
      const params: any[] = [];

      if (input.status) {
        query += ' WHERE status = ?';
        params.push(input.status);
      }

      query += ' ORDER BY created_at DESC';

      const result = await ctx.db.prepare(query).bind(...params).all();

      return {
        items: result.results.map((r: any) => ({
          id: r.id,
          name: r.name,
          status: r.status,
          industry: r.industry,
          contactEmail: r.contact_email,
          logoUrl: r.logo_url,
          brandColor: r.brand_color,
          createdAt: r.created_at,
        })),
        usage: {
          hubsThisMonth: 0,
          limit: 50,
        },
      };
    }),

  // Create a new client (provisions Durable Object)
  create: procedure
    .input(z.object({
      name: z.string().min(1).max(100),
      industry: z.string().optional(),
      contactEmail: z.string().email().optional(),
      brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1D9BF0'),
    }))
    .mutation(async ({ ctx, input }) => {
      const clientId = crypto.randomUUID();

      try {
        // Create client in D1
        await ctx.db
          .prepare(`
            INSERT INTO clients (id, name, status, industry, contact_email, brand_color)
            VALUES (?, ?, 'active', ?, ?, ?)
          `)
          .bind(clientId, input.name, input.industry || null, input.contactEmail || null, input.brandColor)
          .run();

        // AC: Add creator as agency_owner
        await ctx.db
          .prepare(`
            INSERT INTO client_members (id, client_id, user_id, role)
            VALUES (?, ?, ?, 'agency_owner')
          `)
          .bind(crypto.randomUUID(), clientId, ctx.userId)
          .run();

        // Provision Durable Object by sending a dummy request or initialization RPC
        await ctx.callAgent(clientId, 'getBrandDNA', {});

        return {
          clientId,
          success: true,
        };
      } catch (err) {
        console.error('Error creating client:', err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create client',
        });
      }
    }),

  // List team members for a client
  listMembers: procedure
    .input(z.object({
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is member of this client
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first();

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied',
        });
      }

      const result = await ctx.db
        .prepare(`
          SELECT cm.id, cm.role, u.name, u.email
          FROM client_members cm
          JOIN user u ON cm.user_id = u.id
          WHERE cm.client_id = ?
        `)
        .bind(input.clientId)
        .all();

      return result.results || [];
    }),

  // Add a team member
  addMember: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      email: z.string().email(),
      role: z.enum(['agency_owner', 'account_manager', 'creator', 'client_admin', 'client_reviewer']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: Only agency_owner or account_manager can add members
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first<{ role: string }>();

      if (!membership || !['agency_owner', 'account_manager'].includes(membership.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. Insufficient permissions.',
        });
      }

      // Find user by email
      const targetUser = await ctx.db
        .prepare('SELECT id FROM user WHERE email = ?')
        .bind(input.email)
        .first<{ id: string }>();

      if (!targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found. They must have an account first.',
        });
      }

      try {
        await ctx.db
          .prepare(`
            INSERT INTO client_members (id, client_id, user_id, role)
            VALUES (?, ?, ?, ?)
          `)
          .bind(crypto.randomUUID(), input.clientId, targetUser.id, input.role)
          .run();

        return { success: true };
      } catch (err) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already a member of this client.',
        });
      }
    }),

  // Switch active client context
  switch: procedure
    .input(z.object({
      clientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = performance.now();

      // Check if user is member of this client
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first();

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. You are not a member of this client.',
        });
      }

      // Update active_client_id in user profile
      await ctx.db
        .prepare('UPDATE user_profiles SET active_client_id = ?, updated_at = unixepoch() WHERE user_id = ?')
        .bind(input.clientId, ctx.userId)
        .run();

      // Wake up / hydrate Durable Object
      await ctx.callAgent(input.clientId, 'getBrandDNA', {});

      const hydrationTime = performance.now() - startTime;

      return {
        success: true,
        hydrationTime: Math.round(hydrationTime),
      };
    }),

  // Get Brand DNA Report for a client
  getDNAReport: procedure
    .input(z.object({
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const dna = await ctx.callAgent(input.clientId, 'getBrandDNA', {});

      // Calculate a basic strength score based on available data
      let score = 0;
      if (dna.voiceMarkers?.length > 0) score += 25;
      if (dna.bannedWords?.length > 0) score += 25;
      if (dna.stances?.length > 0) score += 25;
      if (Object.keys(dna.toneProfile || {}).length > 0) score += 25;

      return {
        strengthScore: score,
        toneProfile: dna.toneProfile || {},
        voiceMarkers: dna.voiceMarkers || [],
        bannedWords: dna.bannedWords || [],
        stances: dna.stances || [],
        signaturePatterns: dna.signaturePatterns || [],
        lastCalibration: dna.lastCalibration ? new Date(dna.lastCalibration) : null,
      };
    }),

  // Generate a shareable review link
  generateShareableLink: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      expiresInDays: z.number().min(1).max(30).default(7),
      permissions: z.enum(['view', 'approve', 'comment']).default('view'),
      allowedEmails: z.array(z.string().email()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: Only agency_owner or account_manager can generate links
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first<{ role: string }>();

      if (!membership || !['agency_owner', 'account_manager'].includes(membership.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied.',
        });
      }

      const token = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = Math.floor((Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000) / 1000);

      await ctx.db
        .prepare(`
          INSERT INTO shareable_links (id, client_id, token, expires_at, permissions, allowed_emails)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(
          crypto.randomUUID(),
          input.clientId,
          token,
          expiresAt,
          input.permissions,
          input.allowedEmails ? JSON.stringify(input.allowedEmails) : null
        )
        .run();

      return {
        token,
        url: `/review/${token}`,
        expiresAt: new Date(expiresAt * 1000),
      };
    }),

  // Validate a shareable link and return content
  validateShareableLink: procedure
    .input(z.object({
      token: z.string(),
      email: z.string().email(),
    }))
    .query(async ({ ctx, input }) => {
      // Find link
      const link = await ctx.db
        .prepare('SELECT * FROM shareable_links WHERE token = ?')
        .bind(input.token)
        .first<{
          id: string;
          client_id: string;
          expires_at: number;
          permissions: string;
          allowed_emails: string | null;
        }>();

      if (!link) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid or expired link.',
        });
      }

      // Check expiration
      if (link.expires_at < Math.floor(Date.now() / 1000)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Link has expired.',
        });
      }

      // Check allowed emails if restricted
      if (link.allowed_emails) {
        const allowed = JSON.parse(link.allowed_emails) as string[];
        if (!allowed.includes(input.email)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to view this review.',
          });
        }
      }

      // Get client info
      const clientResult = await ctx.db
        .prepare('SELECT id, name, brand_color FROM clients WHERE id = ?')
        .bind(link.client_id)
        .first<{ id: string; name: string; brand_color: string }>();

      if (!clientResult) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client not found.',
        });
      }

      // Fetch spokes for review from Durable Object
      const spokes = await ctx.callAgent(link.client_id, 'getReviewQueue', {
        limit: 50,
      });

      return {
        client: {
          id: clientResult.id,
          name: clientResult.name,
          brandColor: clientResult.brand_color,
        },
        permissions: link.permissions,
        spokes,
      };
    }),

  // Update a client's details
  update: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      name: z.string().min(1).max(100).optional(),
      industry: z.string().optional(),
      contactEmail: z.string().email().optional(),
      brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      status: z.enum(['active', 'paused', 'archived']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: Only agency_owner or account_manager can update
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first<{ role: string }>();

      if (!membership || !['agency_owner', 'account_manager'].includes(membership.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied.',
        });
      }

      const updates: string[] = [];
      const params: any[] = [];

      if (input.name !== undefined) {
        updates.push('name = ?');
        params.push(input.name);
      }
      if (input.industry !== undefined) {
        updates.push('industry = ?');
        params.push(input.industry);
      }
      if (input.contactEmail !== undefined) {
        updates.push('contact_email = ?');
        params.push(input.contactEmail);
      }
      if (input.brandColor !== undefined) {
        updates.push('brand_color = ?');
        params.push(input.brandColor);
      }
      if (input.status !== undefined) {
        updates.push('status = ?');
        params.push(input.status);
      }

      if (updates.length === 0) {
        return { success: true };
      }

      params.push(input.clientId);

      await ctx.db
        .prepare(`UPDATE clients SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...params)
        .run();

      return { success: true };
    }),

  // Update a member's role (RBAC)
  updateMember: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      memberId: z.string().uuid(),
      role: z.enum(['agency_owner', 'account_manager', 'creator', 'client_admin', 'client_reviewer']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: Only agency_owner can update roles
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first<{ role: string }>();

      if (!membership || membership.role !== 'agency_owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. Only agency owners can update roles.',
        });
      }

      await ctx.db
        .prepare('UPDATE client_members SET role = ? WHERE id = ? AND client_id = ?')
        .bind(input.role, input.memberId, input.clientId)
        .run();

      return { success: true };
    }),

  // Remove a team member
  removeMember: procedure
    .input(z.object({
      clientId: z.string().uuid(),
      memberId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: Only agency_owner or account_manager can remove members
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first<{ role: string }>();

      if (!membership || !['agency_owner', 'account_manager'].includes(membership.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied.',
        });
      }

      // Prevent removing the last agency_owner
      const targetMember = await ctx.db
        .prepare('SELECT role FROM client_members WHERE id = ? AND client_id = ?')
        .bind(input.memberId, input.clientId)
        .first<{ role: string }>();

      if (targetMember?.role === 'agency_owner') {
        const ownerCount = await ctx.db
          .prepare('SELECT COUNT(*) as count FROM client_members WHERE client_id = ? AND role = ?')
          .bind(input.clientId, 'agency_owner')
          .first<{ count: number }>();

        if (ownerCount && ownerCount.count <= 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot remove the last agency owner.',
          });
        }
      }

      await ctx.db
        .prepare('DELETE FROM client_members WHERE id = ? AND client_id = ?')
        .bind(input.memberId, input.clientId)
        .run();

      return { success: true };
    }),

  // Get details for a specific client
  getById: procedure
    .input(z.object({
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is member
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first();

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied.',
        });
      }

      const client = await ctx.db
        .prepare('SELECT id, name, status, industry, contact_email, logo_url, brand_color, created_at FROM clients WHERE id = ?')
        .bind(input.clientId)
        .first<any>();

      if (!client) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client not found.',
        });
      }

      return {
        id: client.id,
        name: client.name,
        status: client.status,
        industry: client.industry,
        contactEmail: client.contact_email,
        logoUrl: client.logo_url,
        brandColor: client.brand_color,
        createdAt: client.created_at,
      };
    }),
});