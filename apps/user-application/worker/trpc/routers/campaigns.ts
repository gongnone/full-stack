import { campaigns } from '@repo/data-ops/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createRouter, protectedProcedure } from '../trpc-instance';

export const campaignsRouter = createRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.select().from(campaigns).where(eq(campaigns.userId, ctx.user.id));
    }),
});
