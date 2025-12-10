import { campaigns } from '@repo/data-ops/schema';
import { eq } from 'drizzle-orm';
import { t } from '@/worker/trpc/trpc-instance';
import { TRPCError } from '@trpc/server';

export const campaignsRouter = t.router({
    list: t.procedure.query(async ({ ctx }) => {
        if (!ctx.userId) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return await ctx.db.select().from(campaigns).where(eq(campaigns.userId, ctx.userId));
    }),
});
