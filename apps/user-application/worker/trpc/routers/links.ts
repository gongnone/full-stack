import { t } from "@/worker/trpc/trpc-instance";
// Import your actual queries from data-ops
// import { getActiveLinks, getClicksByCountry, ... } from "@repo/data-ops/queries/links";

export const linksTrpcRoutes = t.router({
    activeLinks: t.procedure.query(async () => {
        // TODO: Replace with real query
        // return await getActiveLinks(ctx.userId);
        return []; // Return empty for now
    }),

    totalLinkClickLastHour: t.procedure.query(async () => {
        // TODO: Replace with real query
        return 0;
    }),

    last24HourClicks: t.procedure.query(async () => {
        // TODO: Replace with real query
        return {
            last24Hours: 0,
            previous24Hours: 0,
            percentChange: 0,
        };
    }),

    last30DaysClicks: t.procedure.query(async () => {
        // TODO: Replace with real query
        return 0;
    }),

    clicksByCountry: t.procedure.query(async () => {
        // TODO: Replace with real query
        return [];
    }),
});
