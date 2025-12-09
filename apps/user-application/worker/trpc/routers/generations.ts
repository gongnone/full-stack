import { t } from "@/worker/trpc/trpc-instance";

import { createGenerationSchema } from "@repo/data-ops/zod-schema/generations";
import { createGenerationRecord, getRecentGenerations } from "@repo/data-ops/queries/generations";
import { TRPCError } from "@trpc/server";

// Costs in Credits
const GENERATION_COSTS: Record<string, number> = {
  tweet: 1,
  image: 5,
  video_script: 5,
  offer_architect: 15,
};

export const generationsRouter = t.router({
  create: t.procedure
    .input(createGenerationSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const cost = GENERATION_COSTS[input.type] || 5;

      // 1. Check & Deduct Credits
      const { userCredits } = await import("@repo/data-ops/schema");
      const { eq, sql } = await import("drizzle-orm");

      // Get current balance
      let creditRecord = await ctx.db
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, ctx.userId))
        .get();

      // Seed if not exists (Give 10 free credits to new users)
      if (!creditRecord) {
        await ctx.db.insert(userCredits).values({
          userId: ctx.userId,
          balance: 10,
        });
        creditRecord = { userId: ctx.userId, balance: 10, lastRefilledAt: null };
      }

      if (creditRecord.balance < cost) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Insufficient credits. This requires ${cost} credits, but you have ${creditRecord.balance}.`,
        });
      }

      // Deduct
      await ctx.db
        .update(userCredits)
        .set({
          balance: sql`${userCredits.balance} - ${cost}`,
        })
        .where(eq(userCredits.userId, ctx.userId));

      // 2. Create DB Record
      const record = await createGenerationRecord(ctx.db, ctx.userId, input);

      // 3. Send to Queue
      await ctx.env.GENERATION_QUEUE.send({
        generationId: record.id,
        type: input.type,
      });

      return { ...record, costDeducted: cost };
    }),

  listRecent: t.procedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return await getRecentGenerations(ctx.db, ctx.userId, 10);
  }),

  // New endpoint for UI to poll
  getCredits: t.procedure.query(async ({ ctx }) => {
    if (!ctx.userId) return { balance: 0 };

    const { userCredits } = await import("@repo/data-ops/schema");
    const { eq } = await import("drizzle-orm");

    const record = await ctx.db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, ctx.userId))
      .get();

    // Default to 10 if they haven't been created yet (lazy seeding logic shared?)
    // Or just return 0 to encourage them to try generating to get the seed.
    // Let's return 0 or do the same seed logic? Simplest is 0 for now.
    return { balance: record ? record.balance : 0 };
  }),
});
