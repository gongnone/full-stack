import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';
import { sendBrandDNAInvitation } from '../../email';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

export const clientsRouter = t.router({
  // List all clients for an account (only clients the user is a member of)
  list: procedure
    .input(z.object({
      status: z.enum(['active', 'paused', 'archived']).optional(),
      // R-13 AC3: userId included in input to enforce cache isolation between sessions
      userId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Join with client_members to only return clients the user is a member of
      // Story 1.5-7-2: Include Brand DNA completion status (graceful fallback if table missing)
      let query = `
        SELECT
          c.id, c.name, c.status, c.industry, c.contact_email, c.logo_url, c.brand_color, c.created_at,
          NULL as dna_session
        FROM clients c
        INNER JOIN client_members cm ON c.id = cm.client_id
        WHERE cm.user_id = ?
      `;
      const params: (string | number | null)[] = [ctx.userId];

      if (input.status) {
        query += ' AND c.status = ?';
        params.push(input.status);
      }

      query += ' ORDER BY c.created_at DESC';

      const result = await ctx.db.prepare(query).bind(...params).all();

      interface ClientRow {
        id: string;
        name: string;
        status: 'active' | 'paused' | 'archived';
        industry: string | null;
        contact_email: string | null;
        logo_url: string | null;
        brand_color: string;
        created_at: number;
        dna_session: string | null;
      }

      return {
        items: (result.results as unknown as ClientRow[]).map((r) => {
          let dnaStatus = 'not_started';
          let dnaProgress = 0;

          if (r.dna_session) {
            try {
              const session = JSON.parse(r.dna_session);
              // Map session step to progress
              const steps = ['welcome', 'voice_capture', 'personality', 'audience', 'pillars', 'complete'];
              const idx = steps.indexOf(session.current_step || 'welcome');
              dnaProgress = Math.round((idx / (steps.length - 1)) * 100);
              
              if (session.current_step === 'complete') dnaStatus = 'complete';
              else if (idx > 0) dnaStatus = 'in_progress';
            } catch {
              // ignore parse error
            }
          }

          return {
            id: r.id,
            name: r.name,
            status: r.status,
            industry: r.industry,
            contactEmail: r.contact_email,
            logoUrl: r.logo_url,
            brandColor: r.brand_color,
            createdAt: r.created_at,
            dnaStatus: dnaStatus as 'not_started' | 'in_progress' | 'complete',
            dnaProgress,
          };
        }),
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
        const createClient = ctx.db
          .prepare(`
            INSERT INTO clients (id, name, status, industry, contact_email, brand_color)
            VALUES (?, ?, 'active', ?, ?, ?)
          `)
          .bind(clientId, input.name, input.industry || null, input.contactEmail || null, input.brandColor);

        // AC: Add creator as agency_owner
        const createMembership = ctx.db
          .prepare(`
            INSERT INTO client_members (id, client_id, user_id, role)
            VALUES (?, ?, ?, 'agency_owner')
          `)
          .bind(crypto.randomUUID(), clientId, ctx.userId);

        // R-14 AC4: Auto-set first created client as active in user_profiles
        // This ensures new users are immediately switched to their first client
        const updateProfile = ctx.db
          .prepare(`
            INSERT INTO user_profiles (id, user_id, active_client_id, created_at, updated_at)
            VALUES (?, ?, ?, unixepoch(), unixepoch())
            ON CONFLICT(user_id) DO UPDATE SET
              active_client_id = excluded.active_client_id,
              updated_at = unixepoch()
          `)
          .bind(crypto.randomUUID().replace(/-/g, ''), ctx.userId, clientId);

        // Execute all writes in a single transaction for data integrity
        await ctx.db.batch([createClient, createMembership, updateProfile]);

        // Provision Durable Object by sending a dummy request or initialization RPC
        // Non-blocking: DO will be hydrated when user accesses Brand DNA page
        ctx.callAgent(clientId, 'getBrandDNA', {}).catch((err) => {
          console.warn('Failed to provision Brand DNA agent (non-critical):', err);
        });

        // Story 10-1 AC1: Auto-Send Brand DNA Invitation (non-blocking)
        // Wrapped in try-catch to not fail client creation if invitation fails
        if (input.contactEmail) {
          try {
            // ATOMIC IDEMPOTENCY: Insert token only if no recent invite exists for this email
            // Uses INSERT...SELECT WHERE NOT EXISTS to prevent race conditions
            // Previous check-then-insert pattern allowed 3 concurrent requests to all pass the check
            const token = crypto.randomUUID().replace(/-/g, '');
            const tokenId = crypto.randomUUID();
            const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
            const now = Date.now();
            const recentWindow = now - 60000; // 60 seconds

            // Atomic insert - only succeeds if no token was created for this email in last 60 seconds
            const insertResult = await ctx.db.prepare(`
              INSERT INTO client_onboard_tokens (id, client_id, token, expires_at, created_at)
              SELECT ?, ?, ?, ?, ?
              WHERE NOT EXISTS (
                SELECT 1 FROM client_onboard_tokens t
                JOIN clients c ON c.id = t.client_id
                WHERE c.contact_email = ? AND t.created_at > ?
              )
            `).bind(tokenId, clientId, token, expiresAt, now, input.contactEmail, recentWindow).run();

            if (insertResult.meta.changes === 0) {
              // Token insert was skipped due to recent invite - don't send email
              console.log(`[Clients] Skipping duplicate invite email to ${input.contactEmail} - sent within last 60 seconds`);
            } else {
              // Token was inserted - safe to send email
              const user = await ctx.db
                .prepare('SELECT name FROM user WHERE id = ?')
                .bind(ctx.userId)
                .first<{ name: string }>();

              const agencyName = user?.name || 'The Agentic Content Foundry';
              const inviteUrl = `${ctx.env.BETTER_AUTH_URL}/onboard/${token}`;

              // Send invitation email directly (queue-based delivery removed to prevent duplicates)
              await sendBrandDNAInvitation(ctx.env, input.contactEmail, input.name, inviteUrl, agencyName).catch(err => {
                console.error('Failed to send invite email:', err);
              });
            }
          } catch (inviteErr) {
            // Non-blocking: log but don't fail client creation
            console.warn('Failed to send Brand DNA invitation (non-critical):', inviteErr);
          }
        }

        return {
          clientId,
          success: true,
        };
      } catch (err: unknown) {
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
      clientId: z.string().min(1),
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
      clientId: z.string().min(1),
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
      } catch (err: unknown) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already a member of this client.',
        });
      }
    }),

  // Switch active client context
  switch: procedure
    .input(z.object({
      clientId: z.string().min(1),
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
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      interface BrandDNA {
        voiceMarkers?: unknown[];
        bannedWords?: unknown[];
        stances?: unknown[];
        toneProfile?: Record<string, unknown>;
        signaturePatterns?: unknown[];
        lastCalibration?: string | number | Date;
      }

      const dna = await ctx.callAgent(input.clientId, 'getBrandDNA', {}) as BrandDNA;

      // Calculate a basic strength score based on available data
      let score = 0;
      if (Array.isArray(dna.voiceMarkers) && dna.voiceMarkers.length > 0) score += 25;
      if (Array.isArray(dna.bannedWords) && dna.bannedWords.length > 0) score += 25;
      if (Array.isArray(dna.stances) && dna.stances.length > 0) score += 25;
      if (dna.toneProfile && Object.keys(dna.toneProfile).length > 0) score += 25;

      return {
        strengthScore: score,
        toneProfile: dna.toneProfile || {},
        voiceMarkers: dna.voiceMarkers || [],
        bannedWords: dna.bannedWords || [],
        stances: dna.stances || [],
        signaturePatterns: dna.signaturePatterns || [],
        lastCalibration: dna.lastCalibration ? new Date(dna.lastCalibration as string | number | Date) : null,
      };
    }),

  // Generate a shareable review link
  generateShareableLink: procedure
    .input(z.object({
      clientId: z.string().min(1),
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
          input.allowedEmails ? JSON.stringify(input.allowedEmails.map(e => e.toLowerCase())) : null
        )
        .run();

      return {
        token,
        url: `/review/${token}`,
        expiresAt: new Date(expiresAt * 1000),
      };
    }),

  // Validate a shareable link and return content
  // NOTE: This authenticated procedure is for internal/admin use.
  // The public /api/review/validate endpoint in app.ts is used for anonymous access.
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

      // Check allowed emails if restricted (case-insensitive comparison)
      if (link.allowed_emails) {
        const allowed = JSON.parse(link.allowed_emails) as string[];
        if (!allowed.includes(input.email.toLowerCase())) {
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
      clientId: z.string().min(1),
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
      const params: (string | number | null)[] = [];

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
      clientId: z.string().min(1),
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
      clientId: z.string().min(1),
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
      clientId: z.string().min(1),
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

      interface ClientRowById {
        id: string;
        name: string;
        status: 'active' | 'paused' | 'archived';
        industry: string | null;
        contact_email: string | null;
        logo_url: string | null;
        brand_color: string;
        created_at: number;
      }

      const client = await ctx.db
        .prepare('SELECT id, name, status, industry, contact_email, logo_url, brand_color, created_at FROM clients WHERE id = ?')
        .bind(input.clientId)
        .first<ClientRowById>();

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

  // Story 10-1 AC8: Resend Brand DNA invitation
  resendBrandDNAInvite: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Security: Only agency_owner or account_manager can resend invites
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first<{ role: string }>();

      if (!membership || !['agency_owner', 'account_manager'].includes(membership.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. Only agency owners or account managers can resend invitations.',
        });
      }

      // Get client details
      const client = await ctx.db
        .prepare('SELECT name, contact_email FROM clients WHERE id = ?')
        .bind(input.clientId)
        .first<{ name: string; contact_email: string | null }>();

      if (!client) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Client not found' });
      }

      if (!client.contact_email) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Client has no email address. Please update the client with an email first.',
        });
      }

      // Invalidate all existing tokens for this client
      await ctx.db
        .prepare('UPDATE client_onboard_tokens SET used_at = ? WHERE client_id = ? AND used_at IS NULL')
        .bind(Date.now(), input.clientId)
        .run();

      // Generate new token
      const token = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      const now = Date.now();

      await ctx.db.prepare(`
        INSERT INTO client_onboard_tokens (id, client_id, token, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), input.clientId, token, expiresAt, now).run();

      // Get agency name from user's name (agency owner resending the invite)
      const user = await ctx.db
        .prepare('SELECT name FROM user WHERE id = ?')
        .bind(ctx.userId)
        .first<{ name: string }>();
      const agencyName = user?.name || 'The Agentic Content Foundry';

      // Send new invitation email
      const inviteUrl = `${ctx.env.BETTER_AUTH_URL}/onboard/${token}`;
      await sendBrandDNAInvitation(ctx.env, client.contact_email, client.name, inviteUrl, agencyName).catch(err => {
        console.error('Failed to resend invite email:', err);
      });

      return {
        success: true,
        message: 'Invitation sent successfully',
      };
    }),

  // Story 1.5-7-3: Invite new client via email
  inviteClient: procedure
    .input(z.object({
      name: z.string().min(1).max(100),
      email: z.string().email(),
      welcomeMessage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create pending client record
      const clientId = crypto.randomUUID();
      const inviteToken = crypto.randomUUID().replace(/-/g, '');
      const now = Date.now();

      await ctx.db.batch([
        // Create client with 'invited' status (Story 1.5-7-3 AC2)
        ctx.db.prepare(`
          INSERT INTO clients (id, name, status, contact_email, created_at, updated_at)
          VALUES (?, ?, 'invited', ?, ?, ?)
        `).bind(clientId, input.name, input.email, now, now),

        // Create invite record
        ctx.db.prepare(`
          INSERT INTO client_invites (id, client_id, email, token, status, created_at, expires_at)
          VALUES (?, ?, ?, ?, 'pending', ?, ?)
        `).bind(
          crypto.randomUUID(),
          clientId,
          input.email,
          inviteToken,
          now,
          now + 7 * 24 * 60 * 60 * 1000 // 7 days expiry
        ),
      ]);

      // TODO: Integrate actual email service (AWS SES)
      // For now, return the link for manual sharing/testing
      const inviteLink = `${ctx.env.BETTER_AUTH_URL}/accept-invite?token=${inviteToken}`;
      console.log(`[Email Mock] Sending invite to ${input.email}: ${inviteLink}`);

      return {
        success: true,
        inviteLink, // Returned for dev convenience/testing
        clientId,
      };
    }),

  // Story 1.5-7-6: Generate self-serve onboarding link
  createOnboardingLink: procedure
    .input(z.object({
      prefillName: z.string().optional(),
      maxUses: z.number().min(1).default(1),
      expiresInDays: z.number().min(1).default(7),
    }))
    .mutation(async ({ ctx, input }) => {
      const token = crypto.randomUUID().replace(/-/g, '');
      const now = Date.now();
      const expiresAt = now + input.expiresInDays * 24 * 60 * 60 * 1000;

      await ctx.db.prepare(`
        INSERT INTO onboarding_links (id, creator_id, token, prefill_name, max_uses, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        ctx.userId,
        token,
        input.prefillName || null,
        input.maxUses,
        expiresAt,
        now
      ).run();

      return {
        success: true,
        url: `/onboarding/start?token=${token}`,
        token,
        expiresAt: new Date(expiresAt),
      };
    }),

  // Validate onboarding token (Public access logic handled in app router, this is for checking status)
  getOnboardingLinkStatus: procedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.prepare(`
        SELECT * FROM onboarding_links WHERE token = ?
      `).bind(input.token).first();

      if (!link) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Link not found' });
      }

      const now = Date.now();
      const isExpired = (link.expires_at as number) < now;
      const isExhausted = (link.use_count as number) >= (link.max_uses as number);

      return {
        isValid: !isExpired && !isExhausted,
        prefillName: link.prefill_name as string | null,
        expiresAt: new Date(link.expires_at as number),
        useCount: link.use_count as number,
        maxUses: link.max_uses as number,
      };
    }),

  // Story 1.5-7-7: Get client progress overview
  getProgressOverview: procedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      // Get all clients user manages
      const clients = await ctx.db.prepare(`
        SELECT 
          c.id, c.name, 
          b.status as dna_status, b.current_step, b.updated_at as last_activity
        FROM clients c
        JOIN client_members cm ON c.id = cm.client_id
        LEFT JOIN brand_dna_sessions b ON c.id = b.client_id
        WHERE cm.user_id = ?
        ORDER BY c.name ASC
      `).bind(ctx.userId).all();

      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      interface ClientProgressRow {
        id: string;
        name: string;
        dna_status: string | null;
        current_step: string | null;
        last_activity: number | null;
      }
      return ((clients.results || []) as unknown as ClientProgressRow[]).map((row) => {
        let status: 'not_started' | 'in_progress' | 'complete' = 'not_started';
        let percentage = 0;
        const lastActivity = row.last_activity as number || 0;

        if (row.dna_status === 'complete') {
          status = 'complete';
          percentage = 100;
        } else if (row.dna_status === 'active' || row.current_step) {
          status = 'in_progress';
          // Approximate progress based on step
          const steps = ['welcome', 'voice_capture', 'personality', 'audience', 'pillars', 'complete'];
          const idx = steps.indexOf(row.current_step || 'welcome');
          percentage = Math.round((idx / (steps.length - 1)) * 100);
        }

        const needsNudge = status === 'in_progress' && (now - lastActivity > SEVEN_DAYS_MS);

        return {
          id: row.id as string,
          name: row.name as string,
          status,
          percentage,
          lastActivity,
          needsNudge,
        };
      });
    }),

  // Story 1.5-7-8: Request to complete BrandDNA on behalf of client
  requestProxyAccess: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Verify agency owner permissions
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first<{ role: string }>();

      if (!membership || !['agency_owner', 'account_manager'].includes(membership.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only agency owners can request proxy access' });
      }

      // 2. Check 14-day inactivity (Story 1.5-7-8 AC1)
      const session = await ctx.db.prepare(`
        SELECT updated_at FROM brand_dna_sessions WHERE client_id = ? ORDER BY created_at DESC LIMIT 1
      `).bind(input.clientId).first();

      const lastActivity = session?.updated_at as number || 0;
      const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
      
      // If session exists and is recent (< 14 days), block request
      if (session && (Date.now() - lastActivity < FOURTEEN_DAYS_MS)) {
        throw new TRPCError({ 
          code: 'PRECONDITION_FAILED', 
          message: 'Client has been active recently. Proxy access requires 14 days of inactivity.' 
        });
      }

      // 3. Log request
      const now = Date.now();
      // Store in audit log or separate proxy_requests table
      // For MVP, we'll assume implicit consent after 48h timeout logic handles this on the frontend trigger
      // Here we just log the intent
      await ctx.db.prepare(`
        INSERT INTO audit_log (id, client_id, user_id, action, details, created_at)
        VALUES (?, ?, ?, 'request_proxy_access', 'Initiated proxy completion request', ?)
      `).bind(crypto.randomUUID(), input.clientId, ctx.userId, now).run();

      // TODO: Send email to client (AC2)
      console.log(`[Email Mock] Asking client ${input.clientId} for proxy consent`);

      return { 
        success: true, 
        message: 'Request sent. You can proceed in 48 hours if no response.' 
      };
    }),

  // Start proxy session (AC3)
  startProxySession: procedure
    .input(z.object({
      clientId: z.string().min(1),
      consentType: z.enum(['explicit', 'implicit']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify permissions again
      const membership = await ctx.db
        .prepare('SELECT role FROM client_members WHERE client_id = ? AND user_id = ?')
        .bind(input.clientId, ctx.userId)
        .first<{ role: string }>();

      if (!membership || !['agency_owner', 'account_manager'].includes(membership.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      const now = Date.now();
      const sessionId = crypto.randomUUID();

      // Create session marked as proxy
      await ctx.db.prepare(`
        INSERT INTO brand_dna_sessions (id, client_id, user_id, status, mode, created_at, updated_at)
        VALUES (?, ?, ?, 'active', 'proxy', ?, ?)
      `).bind(sessionId, input.clientId, ctx.userId, now, now).run();

      // Notify client (AC3)
      console.log(`[Email Mock] Notify client: Agency started your profile (Consent: ${input.consentType})`);

      return { 
        success: true, 
        sessionId,
        mode: 'proxy' 
      };
    }),

  // Story 1.5-7-9: Automated Nudge Emails (Cron Job Handler)
  checkNudges: procedure
    .mutation(async ({ ctx }) => {
      // Find stuck clients
      const now = Date.now();
      const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

      const stuckSessions = await ctx.db.prepare(`
        SELECT b.id, b.client_id, b.updated_at, c.contact_email, c.name
        FROM brand_dna_sessions b
        JOIN clients c ON b.client_id = c.id
        WHERE b.status = 'active' 
          AND b.updated_at < ?
          AND c.status = 'active'
      `).bind(now - THREE_DAYS).all();

      let nudgesSent = 0;

      for (const session of stuckSessions.results || []) {
        const lastActivity = session.updated_at as number;
        const daysSince = Math.floor((now - lastActivity) / (24 * 60 * 60 * 1000));
        
        let type = '';
        if (daysSince >= 14) type = '14-day';
        else if (daysSince >= 7) type = '7-day';
        else if (daysSince >= 3) type = '3-day';

        if (type) {
          // Check if already nudged recently
          const lastNudge = await ctx.db.prepare(`
            SELECT sent_at FROM nudge_emails 
            WHERE client_id = ? AND type = ? 
            ORDER BY sent_at DESC LIMIT 1
          `).bind(session.client_id, type).first();

          if (!lastNudge) {
            // Send nudge
            await ctx.db.prepare(`
              INSERT INTO nudge_emails (id, client_id, type, sent_at)
              VALUES (?, ?, ?, ?)
            `).bind(crypto.randomUUID(), session.client_id, type, now).run();

            console.log(`[Email Mock] Sending ${type} nudge to ${session.name} (${session.contact_email})`);
            nudgesSent++;
          }
        }
      }

      return { success: true, nudgesSent };
    }),
});