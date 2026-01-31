/**
 * Content Examples Router — Manages example posts and audience profiles
 * stored in the ClientAgent DO for enriched content generation.
 */
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { assertClientAccess } from '../middleware/client-access';

const t = initTRPC.context<Context>().create();
const procedure = t.procedure;

export const contentExamplesRouter = t.router({
  // Add a content example (good or bad)
  add: procedure
    .input(z.object({
      clientId: z.string().min(1),
      content: z.string().min(10).max(5000),
      platform: z.string().optional(),
      type: z.enum(['good', 'bad']).default('good'),
      notes: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return ctx.callAgent(input.clientId, 'addContentExample', {
        content: input.content,
        platform: input.platform,
        type: input.type,
        notes: input.notes,
        source: 'manual',
      });
    }),

  // Remove a content example
  remove: procedure
    .input(z.object({
      clientId: z.string().min(1),
      exampleId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return ctx.callAgent(input.clientId, 'removeContentExample', {
        exampleId: input.exampleId,
      });
    }),

  // List content examples
  list: procedure
    .input(z.object({
      clientId: z.string().min(1),
      type: z.enum(['good', 'bad']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return ctx.callAgent(input.clientId, 'getContentExamples', {
        type: input.type,
      });
    }),

  // Update audience profile
  updateAudience: procedure
    .input(z.object({
      clientId: z.string().min(1),
      persona: z.string().max(2000).optional(),
      painPoints: z.string().max(2000).optional(),
      languageStyle: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return ctx.callAgent(input.clientId, 'updateAudienceProfile', {
        persona: input.persona,
        painPoints: input.painPoints,
        languageStyle: input.languageStyle,
      });
    }),

  // Get audience profile
  getAudience: procedure
    .input(z.object({
      clientId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      return ctx.callAgent(input.clientId, 'getAudienceProfile', {});
    }),
});
