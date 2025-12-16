import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { runHaloResearch } from '@repo/agent-logic/workflows/halo-research';
import { updateCampaign } from '@repo/data-ops/queries/market-research';
import { HaloResearchSchema } from '@repo/data-ops/zod/halo-schema';

type Params = {
    projectId: string;
    topic: string;
    userId: string;
    runId: string; // Gap 2 Fix: Added runId to Params
    additionalContext?: {
        targetAudience?: string;
        productDescription?: string;
    };
};

export class HaloResearchWorkflow extends WorkflowEntrypoint<Env, Params> {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
        const { projectId, topic, userId, runId, additionalContext } = event.payload;
        console.log(`[WORKFLOW] 🟢 Starting Halo Research Workflow. RunID: ${runId}, ProjectID: ${projectId}`);

        // 1. Run the "Investigator" Logic
        // We wrap this in a step so if it fails, it can retry automatically
        const researchResults = await step.do('perform-research', async () => {
            // We use the AI binding from the environment
            // @ts-ignore
            const rawData = await runHaloResearch(topic, this.env.AI, this.env.TAVILY_API_KEY as string, additionalContext);

            // 🛡️ VALIDATION GATE: This throws an error if the AI hallucinated the wrong structure
            // ensuring we only save valid data to the DB.
            try {
                const validatedData = HaloResearchSchema.parse(rawData);
                return validatedData;
            } catch (e) {
                console.error("[WORKFLOW] 🔴 Zod Validation Failed:", JSON.stringify(e, null, 2));
                throw e; // Re-throw to fail the step, but now we have logs
            }
        });

        // 2. Save the results to the Database
        await step.do('save-results', async () => {
            // Initialize Drizzle ORM with the D1 binding
            const { drizzle } = await import('drizzle-orm/d1');
            const db = drizzle(this.env.DB);

            await updateCampaign(db, projectId, {
                researchData: researchResults,
                status: 'complete', // Gap 5 Fix: Standardize on 'complete'
                runId: runId // Gap 1 Fix: Pass runId to update status
            });
        });
    }
}
