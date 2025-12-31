import { describe, it, expect, beforeAll } from 'vitest';
import { createIntegrationContext, seedTestAccounts } from './integration-harness';
import { appRouter } from '../router';

describe('Onboarding & Brand DNA Invitation', () => {
  let ctx: any;
  let caller: any;
  let testAccount: any;

  beforeAll(async () => {
    ctx = await createIntegrationContext();
    const seeded = await seedTestAccounts(ctx.db, ctx);
    testAccount = seeded.account1;
    
    // Create caller with agency owner context
    caller = appRouter.createCaller({
      ...ctx,
      userId: testAccount.userId,
      accountId: testAccount.id,
      userRole: 'admin',
    });
  });

  it('should generate invitation token when creating client with email', async () => {
    const clientName = 'Test Client With Email';
    const clientEmail = 'client@example.com';

    // 1. Create client
    const result = await caller.clients.create({
      name: clientName,
      industry: 'Tech',
      contactEmail: clientEmail, // New field to be added
    });

    expect(result.success).toBe(true);
    expect(result.clientId).toBeDefined();

    // 2. Verify token exists in D1 (Table to be created)
    const token = await ctx.db.prepare(`
      SELECT * FROM client_onboard_tokens 
      WHERE client_id = ?
    `).bind(result.clientId).first();

    expect(token).toBeDefined();
    expect(token.token).toHaveLength(32); // Assuming 32 char token
    expect(token.expires_at).toBeGreaterThan(Date.now());
    expect(token.used_at).toBeNull();
  });
});
