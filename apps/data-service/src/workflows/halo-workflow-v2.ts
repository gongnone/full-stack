/**
 * Halo Research Workflow V2 - Multi-Phase Cloudflare Workflow
 *
 * This workflow orchestrates the 6-phase Halo Strategy research process.
 * Each phase is a separate step that can retry independently.
 *
 * Benefits over V1:
 * - Each phase retries independently on failure
 * - Better logging and observability
 * - Intermediate results saved after each phase
 * - Higher quality outputs through focused prompts
 */

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import {
    runDiscoveryAgent,
    runCompetitorReconAgent,
    runListeningAgent,
    runClassificationAgent,
    runAvatarAgent,
    runProblemAgent,
    runHVCOAgent,
    type AgentContext,
    type AgentEnv
} from '@repo/agent-logic';
import { HaloResearchSchemaV2 } from '@repo/data-ops/zod/halo-schema-v2';

type Params = {
    projectId: string;
    topic: string;
    userId: string;
    runId: string;
    additionalContext?: {
        targetAudience?: string;
        productDescription?: string;
    };
};

export class HaloResearchWorkflowV2 extends WorkflowEntrypoint<Env, Params> {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
        const { projectId, topic, userId, runId, additionalContext } = event.payload;

        console.log(`[Workflow V2] Starting 6-Phase Halo Research`);
        console.log(`[Workflow V2] Project: ${projectId}, Topic: ${topic}, Run: ${runId}`);

        // Build context for agents
        const context: AgentContext = {
            topic,
            targetAudience: additionalContext?.targetAudience,
            productDescription: additionalContext?.productDescription,
            projectId,
            runId
        };

        const env: AgentEnv = {
            AI: this.env.AI,
            TAVILY_API_KEY: this.env.TAVILY_API_KEY as string,
            DB: this.env.DB
        };

        // ========================================
        // PHASE 1: DISCOVERY (Find Watering Holes)
        // ========================================
        const discovery = await step.do('phase-1-discovery', {
            retries: { limit: 2, delay: '10 seconds', backoff: 'exponential' }
        }, async () => {
            console.log(`[Phase 1] Starting Discovery Agent`);
            const result = await runDiscoveryAgent(env, context);
            console.log(`[Phase 1] Found ${result.wateringHoles.length} watering holes`);
            return result;
        });

        // Update workflow status
        await step.do('update-status-1', async () => {
            await this.updateWorkflowStatus(runId, 'discovery_complete', 1);
        });

        // ========================================
        // PHASE 1.5: COMPETITOR RECON (Funnel Hacking)
        // ========================================
        const competitorRecon = await step.do('phase-1.5-competitor', {
            retries: { limit: 2, delay: '10 seconds', backoff: 'exponential' }
        }, async () => {
            console.log(`[Phase 1.5] Starting Competitor Recon Agent`);
            const result = await runCompetitorReconAgent(env, context, discovery);
            console.log(`[Phase 1.5] Analyzed ${result.competitors.length} competitors`);
            return result;
        });

        await step.do('update-status-1.5', async () => {
            await this.updateWorkflowStatus(runId, 'competitor_complete', 1.5);
        });

        // ========================================
        // PHASE 2: DEEP LISTENING (Extract Content)
        // ========================================
        const listening = await step.do('phase-2-listening', {
            retries: { limit: 2, delay: '15 seconds', backoff: 'exponential' }
        }, async () => {
            console.log(`[Phase 2] Starting Listening Agent`);
            const result = await runListeningAgent(env, discovery);
            console.log(`[Phase 2] Extracted ${result.rawExtracts.length} content pieces`);
            return result;
        });

        await step.do('update-status-2', async () => {
            await this.updateWorkflowStatus(runId, 'listening_complete', 2);
        });

        // ========================================
        // PHASE 3: CLASSIFICATION
        // ========================================
        const classification = await step.do('phase-3-classification', {
            retries: { limit: 2, delay: '10 seconds', backoff: 'exponential' }
        }, async () => {
            console.log(`[Phase 3] Starting Classification Agent`);
            const result = await runClassificationAgent(env, listening, context);
            console.log(`[Phase 3] Classified ${result.classifiedContent.length} items`);
            return result;
        });

        await step.do('update-status-3', async () => {
            await this.updateWorkflowStatus(runId, 'classification_complete', 3);
        });

        // ========================================
        // PHASE 4: AVATAR SYNTHESIS
        // ========================================
        const avatar = await step.do('phase-4-avatar', {
            retries: { limit: 2, delay: '10 seconds', backoff: 'exponential' }
        }, async () => {
            console.log(`[Phase 4] Starting Avatar Agent`);
            const result = await runAvatarAgent(env, context, classification, listening);
            console.log(`[Phase 4] Created avatar: "${result.avatar.name}"`);
            return result;
        });

        await step.do('update-status-4', async () => {
            await this.updateWorkflowStatus(runId, 'avatar_complete', 4);
        });

        // ========================================
        // PHASE 5: PROBLEM IDENTIFICATION
        // ========================================
        const problems = await step.do('phase-5-problem', {
            retries: { limit: 2, delay: '10 seconds', backoff: 'exponential' }
        }, async () => {
            console.log(`[Phase 5] Starting Problem Agent`);
            const result = await runProblemAgent(env, context, avatar, classification, listening);
            console.log(`[Phase 5] Primary problem score: ${result.primaryProblem.totalScore}`);
            return result;
        });

        await step.do('update-status-5', async () => {
            await this.updateWorkflowStatus(runId, 'problem_complete', 5);
        });

        // ========================================
        // PHASE 6: HVCO GENERATION
        // ========================================
        const hvco = await step.do('phase-6-hvco', {
            retries: { limit: 2, delay: '10 seconds', backoff: 'exponential' }
        }, async () => {
            console.log(`[Phase 6] Starting HVCO Agent`);
            const result = await runHVCOAgent(env, context, problems, avatar);
            console.log(`[Phase 6] Generated ${result.titles.length} titles`);
            return result;
        });

        await step.do('update-status-6', async () => {
            await this.updateWorkflowStatus(runId, 'hvco_complete', 6);
        });

        // ========================================
        // SAVE ALL RESULTS
        // ========================================
        await step.do('save-results', async () => {
            console.log(`[Workflow V2] Saving results to database`);

            const { drizzle } = await import('drizzle-orm/d1');
            const db = drizzle(this.env.DB);

            // Import the save function
            const { saveHaloResearchV2 } = await import('@repo/data-ops/queries/market-research-v2');

            await saveHaloResearchV2(db, projectId, runId, {
                discovery,
                competitorRecon,
                listening,
                classification,
                avatar,
                problems,
                hvco,
                topic,
                qualityScore: this.calculateQualityScore(discovery, listening, classification, avatar, problems, hvco)
            });

            console.log(`[Workflow V2] Results saved successfully`);
        });

        console.log(`[Workflow V2] Research complete for project ${projectId}`);
    }

    /**
     * Update workflow status in database
     */
    private async updateWorkflowStatus(runId: string, step: string, phaseNum: number) {
        try {
            const { drizzle } = await import('drizzle-orm/d1');
            const { eq } = await import('drizzle-orm');
            const { workflowRuns } = await import('@repo/data-ops/schema');

            const db = drizzle(this.env.DB);
            await db.update(workflowRuns)
                .set({
                    current_step: step,
                    progress: Math.round((phaseNum / 6) * 100)
                })
                .where(eq(workflowRuns.id, runId));
        } catch (e) {
            console.error(`[Workflow V2] Failed to update status: ${e}`);
        }
    }

    /**
     * Calculate overall quality score
     */
    private calculateQualityScore(
        discovery: any,
        listening: any,
        classification: any,
        avatar: any,
        problems: any,
        hvco: any
    ): number {
        let score = 0;
        let maxScore = 100;

        // Discovery (15 points)
        score += Math.min(15, discovery.wateringHoles?.length || 0);

        // Listening (20 points)
        const verbatimCount = (listening.rawExtracts || []).reduce(
            (sum: number, e: any) => sum + (e.verbatimQuotes?.length || 0), 0
        );
        score += Math.min(20, verbatimCount);

        // Classification (15 points)
        const classified = classification.classifiedContent?.length || 0;
        score += Math.min(15, Math.round(classified * 0.5));

        // Avatar (20 points)
        score += (avatar.dimensionsCovered || 0) * 2;
        score += (avatar.avatar?.dimensions?.vernacular?.length > 5) ? 2 : 0;

        // Problems (15 points)
        score += Math.min(10, (problems.primaryProblem?.evidenceQuotes?.length || 0) * 3);
        score += (problems.primaryProblem?.totalScore > 70) ? 5 : 0;

        // HVCO (15 points)
        score += Math.min(10, hvco.titles?.length || 0);
        score += (hvco.recommendedTitle?.totalScore > 75) ? 5 : 0;

        return Math.min(100, Math.round(score));
    }
}
