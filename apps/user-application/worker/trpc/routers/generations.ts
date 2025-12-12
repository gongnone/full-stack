import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { godfatherOffer } from "@repo/data-ops/schema";
import { eq } from "drizzle-orm";

export const generationsRouter = t.router({
    getCredits: t.procedure.query(async () => {
        // TODO: Implement actual credit tracking
        return {
            balance: 1000,
            used: 0,
        };
    }),

    getGodfatherOffer: t.procedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ ctx, input }) => {
            const offer = await ctx.db.select().from(godfatherOffer).where(eq(godfatherOffer.projectId, input.projectId)).get();
            return offer || null;
        }),

    startOfferWorkflow: t.procedure
        .input(z.object({ projectId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // FIX: Check for the Service Binding
            if (!ctx.env.BACKEND_SERVICE) {
                console.error("BACKEND_SERVICE binding is missing!");
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Backend Service disconnected" });
            }

            try {
                // @ts-ignore - Implicit type from Service Binding
                await ctx.env.BACKEND_SERVICE.startGodfatherOffer({ projectId: input.projectId });
                return { success: true };
            } catch (e: any) {
                console.error("Workflow trigger failed:", e);
                return { success: false, error: e.message };
            }
        }),
});
