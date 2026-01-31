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

// Helper: Extract readable text from a URL (for scraping website content)
async function scrapeUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Foundry/1.0; +https://foundry.williamjshaw.ca)' },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    // Strip HTML tags, scripts, styles — keep text content
    const cleaned = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    // Take first 5000 chars of meaningful content
    return cleaned.substring(0, 5000);
  } catch (err) {
    throw new Error(`Failed to scrape URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

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

  // Scrape a URL and add as content example
  scrapeUrl: procedure
    .input(z.object({
      clientId: z.string().min(1),
      url: z.string().url(),
      type: z.enum(['good', 'bad']).default('good'),
      notes: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertClientAccess(ctx, input.clientId);
      const content = await scrapeUrl(input.url);
      if (content.length < 50) {
        throw new Error('Could not extract meaningful content from URL');
      }
      return ctx.callAgent(input.clientId, 'addContentExample', {
        content: content.substring(0, 5000),
        type: input.type,
        notes: input.notes || `Scraped from: ${input.url}`,
        source: 'url',
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
