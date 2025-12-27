import { t } from "@/worker/trpc/trpc-instance";
import { createClientInputSchema } from "@repo/foundry-core/zod/clients";
import { clients as clientsSchema } from "@repo/foundry-core/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export const clientsRouter = t.router({
  create: t.procedure
    .input(createClientInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { accountId, db } = ctx;
      const { name } = input;

      const newClientId = nanoid();
      const newClient = {
        id: newClientId,
        accountId: accountId,
        name: name,
        durableObjectId: nanoid(), // Placeholder
        vectorizeNamespace: `client-${newClientId}`, // Placeholder
        r2PathPrefix: `r2-${newClientId}`, // Placeholder
        createdAt: new Date().toISOString(),
      };

      await db.insert(clientsSchema).values(newClient).execute();

      return newClient;
    }),

  list: t.procedure
    .query(async ({ ctx }) => {
      const { accountId, db } = ctx;

      const clientList = await db.query.clients.findMany({
        where: eq(clientsSchema.accountId, accountId),
      });

      return clientList;
    }),
});
