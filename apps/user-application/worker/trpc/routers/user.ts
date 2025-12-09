import { t } from "../trpc-instance";
// @ts-ignore - The export is valid but TS might complain in the monorepo context depending on how references are built
import { getUserCredits } from "@repo/data-ops/queries/user";

export const userRouter = t.router({
    getCredits: t.procedure.query(async ({ ctx }) => {
        console.log("DEBUG: getCredits called for user", ctx.userId);
        try {
            const credits = await getUserCredits(ctx.db, ctx.userId);
            console.log("DEBUG: Credits fetched:", credits);
            return { credits };
        } catch (error) {
            console.error("DEBUG: Error in getCredits:", error);
            throw error;
        }
    }),
});
