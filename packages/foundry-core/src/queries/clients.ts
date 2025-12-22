import { DrizzleD1Database } from "drizzle-orm/d1";
import { nanoid } from "nanoid";
import { clients, accounts } from "../schema";
import { eq } from "drizzle-orm";

type FoundryDrizzleDb = DrizzleD1Database<typeof clients | typeof accounts>;

export async function getClientForAccount(db: FoundryDrizzleDb, accountId: string): Promise<typeof clients.$inferSelect> {
  // Try to find an existing client for the account
  let client = await db.query.clients.findFirst({
    where: eq(clients.accountId, accountId),
  });

  if (!client) {
    // If no client exists, create a default one
    const newClientId = nanoid();
    // Placeholder values for durableObjectId, vectorizeNamespace, r2PathPrefix
    // These will need to be properly generated/managed in later stories
    client = (await db.insert(clients).values({
      id: newClientId,
      accountId: accountId,
      name: "Default Client",
      durableObjectId: nanoid(), // Placeholder
      vectorizeNamespace: `client-${newClientId}`, // Placeholder
      r2PathPrefix: `r2-${newClientId}`, // Placeholder
      createdAt: new Date().toISOString(),
    }).returning())[0]; // .returning() is for getting the inserted row, and then taking the first element
  }

  return client;
}
