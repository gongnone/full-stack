import { t } from "@/worker/trpc/trpc-instance";

import { createGenerationSchema } from "@repo/data-ops/zod-schema/generations";
import { createGenerationRecord, getRecentGenerations } from "@repo/data-ops/queries/generations";
import { TRPCError } from "@trpc/server";

export const generationsRouter = t.router({
  create: t.procedure
    .input(createGenerationSchema)
    .mutation(async ({ ctx, input }) => {
      // 1. Get userId (assuming protected procedure or context has it)
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // 2. TODO: billing check (using ctx.db.select(userCredits)...)

      // 3. Create DB Record
      const record = await createGenerationRecord(ctx.db, ctx.userId, input);

      // 4. Send to Queue
      await ctx.env.GENERATION_QUEUE.send({
        generationId: record.id,
        type: input.type,
      });

      return record;
    }),

  listRecent: t.procedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return await getRecentGenerations(ctx.db, ctx.userId, 10);
  }),
});
