import { t } from "@/worker/trpc/trpc-instance";
import { generateSpokesInputSchema, evaluateSpokeInputSchema } from "@repo/foundry-core/zod/spokes"; // Import evaluateSpokeInputSchema
import { hubs as hubsSchema, spokes as spokesSchema, spokeEvaluations as spokeEvaluationsSchema } from "@repo/foundry-core/schema"; // Import spokeEvaluationsSchema
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Placeholder for spoke generation logic
async function fractureHubIntoSpokes(hub: any, platforms: string[]): Promise<any[]> {
  console.log(`Fracturing hub ${hub.id} into spokes for platforms: ${platforms.join(", ")}`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate async work

  const generatedSpokes: any[] = [];
  const extractedThemes = JSON.parse(hub.extractedThemes);
  const theme = extractedThemes.themes[0] || "General Topic"; // Use first theme as a base

  // Simulate generating spokes for various platforms
  for (const platform of platforms) {
    const spokeId = nanoid();
    let content = "";
    let contentType: 'text' | 'json' = 'text';

    switch (platform) {
      case 'twitter':
        content = `Check out this insight on "${theme}"! #${theme.replace(/\s/g, '')} #Foundry`;
        break;
      case 'linkedin':
        content = `Deep dive into "${theme}" with our latest analysis. What are your thoughts? #ThoughtLeadership #${theme.replace(/\s/g, '')}`;
        break;
      case 'tiktok':
        content = `Narrative: Learn about ${theme} in 60 seconds! Call to Action: Follow for more! #${theme.replace(/\s/g, '')} #ViralInsights`;
        contentType = 'text'; // TikTok script
        break;
      case 'instagram_carousel':
        content = JSON.stringify([
          { slide: 1, text: `Slide 1: Intro to ${theme}` },
          { slide: 2, text: `Slide 2: Key aspect 1` },
          { slide: 3, text: `Slide 3: Key aspect 2` },
        ]);
        contentType = 'json';
        break;
      case 'youtube_script':
        content = `[INTRO] Welcome! Today we're breaking down ${theme}. [MAIN] Point 1: ... Point 2: ... [OUTRO] Subscribe for more!`;
        contentType = 'text';
        break;
      default:
        content = `Generated content for ${platform} based on ${theme}.`;
    }

    generatedSpokes.push({
      id: spokeId,
      hubId: hub.id,
      accountId: hub.accountId,
      clientId: hub.clientId,
      platform,
      contentType,
      content,
      status: "generated" as const, // Directly set to generated for placeholder
      evaluationStatus: "pending" as const, // Initial evaluation status
      createdAt: new Date().toISOString(),
    });
  }

  return generatedSpokes;
}

// Placeholder for critic evaluation logic
async function runCriticEvaluations(spoke: any): Promise<any> {
  console.log(`Running critic evaluations for spoke ${spoke.id}...`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async work

  // Simulate some evaluation results
  const g2_score = Math.floor(Math.random() * 100);
  const g4_result = Math.random() > 0.5 ? 'pass' : 'fail';
  const g5_result = Math.random() > 0.5 ? 'pass' : 'fail';
  const overall_pass = g2_score >= 70 && g4_result === 'pass' && g5_result === 'pass';

  return {
    spokeId: spoke.id,
    g2_score,
    g2_breakdown: JSON.stringify({ reason: g2_score < 70 ? "Low hook strength" : "Good hook strength" }),
    g4_result,
    g4_violations: JSON.stringify(g4_result === 'fail' ? ["Banned word detected"] : []),
    g4_similarity_score: Math.random(),
    g5_result,
    g5_violations: JSON.stringify(g5_result === 'fail' ? ["Character limit exceeded"] : []),
    overall_pass,
    critic_notes: overall_pass ? "Spoke passed all gates." : "Spoke failed some gates.",
  };
}


export const spokesRouter = t.router({
  generate: t.procedure
    .input(generateSpokesInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { accountId, clientId, db } = ctx; // Get clientId from context
      const { hubId, platforms = ['twitter', 'linkedin', 'tiktok', 'instagram_carousel'] } = input; // Default platforms

      // Fetch the hub and ensure ownership
      const hub = await db.query.hubs.findFirst({
        where: eq(hubsSchema.id, hubId),
      });

      if (!hub || hub.accountId !== accountId || hub.clientId !== clientId) {
        throw new Error("Hub not found or unauthorized.");
      }
      
      // Update hub status to 'generating_spokes'
      await db.update(hubsSchema).set({ status: 'generating_spokes' as const, updatedAt: new Date().toISOString() }).where(eq(hubsSchema.id, hubId)).execute();
      
      // Broadcast status update
      await ctx.env.DATA_SERVICE.broadcastHubStatus(
        accountId,
        hubId,
        "generating_spokes",
        "Spoke generation initiated."
      );

      const generatedSpokes = await fractureHubIntoSpokes(hub, platforms);

      // Insert generated spokes into the database
      if (generatedSpokes.length > 0) {
        await db.insert(spokesSchema).values(generatedSpokes).execute();
      }

      // Update hub status to 'spokes_generated' (or ready for review)
      await db.update(hubsSchema).set({ status: 'spokes_generated' as const, updatedAt: new Date().toISOString() }).where(eq(hubsSchema.id, hubId)).execute();
      
      // Broadcast final status update
      await ctx.env.DATA_SERVICE.broadcastHubStatus(
        accountId,
        hubId,
        "spokes_generated",
        `${generatedSpokes.length} spokes generated.`
      );

      return generatedSpokes;
    }),

  evaluate: t.procedure
    .input(evaluateSpokeInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { accountId, clientId, db } = ctx; // Get clientId from context
      const { spokeId } = input;

      const spoke = await db.query.spokes.findFirst({
        where: eq(spokesSchema.id, spokeId),
      });

      if (!spoke || spoke.accountId !== accountId || spoke.clientId !== clientId) {
        throw new Error("Spoke not found or unauthorized.");
      }

      // Update spoke status to 'evaluating'
      await db.update(spokesSchema).set({ evaluationStatus: 'evaluated' as const, updatedAt: new Date().toISOString() }).where(eq(spokesSchema.id, spokeId)).execute();

      // Run critic evaluations
      const evaluationResults = await runCriticEvaluations(spoke);

      // Save evaluation results
      await db.insert(spokeEvaluationsSchema).values({
        id: spokeId, // Using spokeId as ID for evaluation
        spokeId: spokeId,
        accountId: accountId,
        clientId: spoke.clientId, // Use spoke's clientId
        g2_score: evaluationResults.g2_score,
        g2_breakdown: evaluationResults.g2_breakdown,
        g4_result: evaluationResults.g4_result,
        g4_violations: evaluationResults.g4_violations,
        g4_similarity_score: evaluationResults.g4_similarity_score,
        g5_result: evaluationResults.g5_result,
        g5_violations: evaluationResults.g5_violations,
        overall_pass: evaluationResults.overall_pass,
        critic_notes: evaluationResults.critic_notes,
        createdAt: new Date().toISOString(),
      }).execute();
      
      // Update spoke status based on overall pass
      const newSpokeStatus = evaluationResults.overall_pass ? 'approved' : 'rejected'; // Simplified status
      await db.update(spokesSchema).set({ status: newSpokeStatus as any, evaluationStatus: evaluationResults.overall_pass ? 'passed' : 'failed', updatedAt: new Date().toISOString() }).where(eq(spokesSchema.id, spokeId)).execute();


      // Broadcast evaluation status update
      await ctx.env.DATA_SERVICE.broadcastHubStatus(
        accountId,
        spoke.hubId, // Broadcast to hub's tracker
        "spoke_evaluated",
        `Spoke ${spoke.id} evaluated. Overall Pass: ${evaluationResults.overall_pass}`
      );


      return evaluationResults;
    }),

  listByHubId: t.procedure
    .input(z.object({ hubId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { accountId, clientId, db } = ctx; // Get clientId from context
      const { hubId } = input;

      const spokes = await db.query.spokes.findMany({
        where: and(eq(spokesSchema.hubId, hubId), eq(spokesSchema.clientId, clientId)), // Filter by both hubId and clientId
        with: {
          evaluation: true, // Include evaluation results
        }
      });

      // Filter by accountId for security (already done by hubId filter)
      return spokes.filter(spoke => spoke.accountId === accountId); // Redundant if clientId implies accountId, but good for safety
    }),
});

