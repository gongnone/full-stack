import { t } from "@/worker/trpc/trpc-instance";
import { createHubInputSchema, updateHubInputSchema } from "@repo/foundry-core/zod/hubs"; // Import updateHubInputSchema
import { hubs as hubsSchema, clients as clientsSchema } from "@repo/foundry-core/schema";
import { nanoid } from "nanoid";
import { getClientForAccount } from "@repo/foundry-core/queries/clients";
import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm"; // Import eq for queries

// Placeholder for theme extraction logic
async function extractThemes(sourceType: string, sourceContent: string): Promise<any> {
  // Simulate AI/LLM processing
  console.log(`Extracting themes from ${sourceType} source...`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async work
  return {
    themes: ["Placeholder Theme 1", "Placeholder Theme 2"],
    claims: ["Placeholder Claim A", "Placeholder Claim B"],
    angles: ["Placeholder Angle X", "Placeholder Angle Y"],
  };
}

export const hubsRouter = t.router({
  create: t.procedure
    .input(createHubInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { accountId, db } = ctx;
      const foundryCoreDrizzle = drizzle(ctx.env.DB, { schema: { hubsSchema, clientsSchema } });

      // Get or create client for the account
      const client = await getClientForAccount(foundryCoreDrizzle, accountId);
      const clientId = client.id;

      let sourceContent = "";
      if (input.sourceType === "text" && input.textInput) {
        sourceContent = input.textInput;
      } else if (input.sourceType === "url" && input.urlInput) {
        sourceContent = input.urlInput;
      } else if (input.sourceType === "file" && input.fileInput) {
        sourceContent = input.fileInput;
      }

      // Simulate thematic extraction
      const extractedThemes = await extractThemes(input.sourceType, sourceContent);

      const hubId = nanoid();
      const newHub = {
        id: hubId,
        accountId: accountId,
        clientId: clientId,
        name: `New Hub from ${input.sourceType} - ${new Date().toLocaleString()}`,
        status: "processing" as const, // Set initial status to processing
        sourceMaterial: JSON.stringify({ type: input.sourceType, content: sourceContent }),
        extractedThemes: JSON.stringify(extractedThemes),
        createdAt: new Date().toISOString(),
      };

      await db.insert(hubsSchema).values(newHub).execute();

      // Broadcast initial processing status
      await ctx.env.DATA_SERVICE.broadcastHubStatus(
        accountId,
        hubId,
        newHub.status,
        "Hub creation and thematic extraction initiated."
      );

      return newHub;
    }),

  update: t.procedure
    .input(updateHubInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { accountId, clientId, db } = ctx; // Get clientId from context
      const { hubId, finalPillars } = input;

      // Ensure the hub belongs to the current account and client for security
      const existingHub = await db.query.hubs.findFirst({
        where: eq(hubsSchema.id, hubId),
      });

      if (!existingHub || existingHub.accountId !== accountId || existingHub.clientId !== clientId) {
        throw new Error("Hub not found or unauthorized.");
      }

      // Update the hub with finalized pillars and status
      const updatedHub = await db.update(hubsSchema)
        .set({
          extractedThemes: JSON.stringify({ themes: finalPillars }), // Store only themes for now
          status: "ready", // Mark as ready after pillar configuration
          updatedAt: new Date().toISOString(),
        })
        .where(eq(hubsSchema.id, hubId))
        .execute();

      // Broadcast ready status
      await ctx.env.DATA_SERVICE.broadcastHubStatus(
        accountId,
        hubId,
        "ready",
        "Hub is now ready for spoke generation."
      );

      return updatedHub;
    }),

  getById: t.procedure
    .input(z.object({ hubId: z.string() })) // Define input schema for hubId
    .query(async ({ ctx, input }) => {
      const { accountId, clientId, db } = ctx; // Get clientId from context
      const { hubId } = input;

      const hub = await db.query.hubs.findFirst({
        where: eq(hubsSchema.id, hubId),
      });

      if (!hub || hub.accountId !== accountId || hub.clientId !== clientId) {
        throw new Error("Hub not found or unauthorized.");
      }

      return hub;
    }),
});
