import { t } from "@/worker/trpc/trpc-instance";

export const generationsRouter = t.router({
    getCredits: t.procedure.query(async () => {
        // TODO: Implement actual credit tracking
        return {
            balance: 1000,
            used: 0,
        };
    }),
});
