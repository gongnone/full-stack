import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { initDatabase } from '@repo/data-ops/database';
import { spokes, spoke_evaluations, feedback_log, workflowRuns } from '@repo/data-ops/schema';
import { eq } from 'drizzle-orm';
import { SPOKE_GENERATION_PROMPTS } from '@repo/agent-logic/prompts/spoke-prompts';
import { PLATFORM_CONFIGS } from '@repo/agent-logic/platform-configs';
import { CriticAgent } from '@repo/agent-system';

interface CloneSpokeParams {
    spokeId: string;
    numVariations: number;
    platforms: string[];
    varyAngle: boolean;
    runId?: string;
}

export class CloneSpokeWorkflow extends WorkflowEntrypoint<Env, CloneSpokeParams> {
    async run(event: WorkflowEvent<CloneSpokeParams>, step: WorkflowStep) {
        const { spokeId, numVariations, platforms, varyAngle, runId } = event.payload;
        const db = initDatabase(this.env.DB);

        // 1. Fetch Seed Spoke
        const seedSpoke = await step.do('fetch-seed', async () => {
            return await db.select().from(spokes).where(eq(spokes.id, spokeId)).get();
        });

        if (!seedSpoke) {
            if (runId) {
                await db.update(workflowRuns).set({ status: 'failed', errorMessage: 'Seed spoke not found' }).where(eq(workflowRuns.id, runId));
            }
            return { error: 'Seed Spoke Missing' };
        }

        const totalTasks = platforms.length * numVariations;
        let completedTasks = 0;

        // 2. Generate Variations
        for (const platform of platforms) {
            for (let i = 0; i < numVariations; i++) {
                await step.do(`generate-variation-${platform}-${i}`, async () => {
                    const platformConfig = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
                    const critic = new CriticAgent(this.env.AI as any, this.env.VECTORIZE as any, this.env.DB as any);

                    const variationGoal = varyAngle 
                        ? "Try a completely different psychological angle while keeping the message the same."
                        : "Refine the hook and keep the core message identical but fresh.";

                    let prompt = `${SPOKE_GENERATION_PROMPTS.common}\n${SPOKE_GENERATION_PROMPTS[platform as keyof typeof SPOKE_GENERATION_PROMPTS]}\n${SPOKE_GENERATION_PROMPTS.variation}`
                        .replace('{pillar_name}', 'Derived from Seed')
                        .replace('{psychological_angle}', varyAngle ? 'Varied' : seedSpoke.psychological_angle)
                        .replace('{platform}', platform)
                        .replace('{seed_content}', seedSpoke.content)
                        .replace('{variation_goal}', variationGoal)
                        .replace('{maxChars}', (platformConfig as any).maxChars || '')
                        .replace('{maxWords}', (platformConfig as any).maxWords || '')
                        .replace('{posts}', (platformConfig as any).posts?.join('-') || '')
                        .replace('{slides}', (platformConfig as any).slides?.join('-') || '');

                    // Add platform specific constraints if they exist in common logic
                    // (Simplified for cloning)

                    const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                        messages: [
                            { role: 'system', content: 'You are a content variation agent. Output ONLY the post content.' },
                            { role: 'user', content: prompt }
                        ]
                    }) as any;

                    let currentContent = response.response.trim();

                    const variationSpoke = {
                        id: crypto.randomUUID(),
                        hub_id: seedSpoke.hub_id,
                        pillar_id: seedSpoke.pillar_id,
                        client_id: seedSpoke.client_id,
                        platform: platform,
                        content: currentContent,
                        psychological_angle: varyAngle ? 'Varied' : seedSpoke.psychological_angle,
                        status: 'ready',
                        parent_spoke_id: seedSpoke.id,
                        is_variation: 1,
                        generation_attempt: 1,
                    };

                    // Evaluate
                    const evaluation = await critic.evaluate(variationSpoke, variationSpoke.client_id);
                    
                    if (evaluation.overallPass) {
                        variationSpoke.status = 'ready_for_review';
                    }

                    // Save Spoke
                    await db.insert(spokes).values(variationSpoke);

                    // Save Evaluation
                    await db.insert(spoke_evaluations).values({
                        id: evaluation.spokeId,
                        spoke_id: evaluation.spokeId,
                        client_id: variationSpoke.client_id,
                        g2_score: evaluation.g2.score,
                        g2_breakdown: JSON.stringify(evaluation.g2.breakdown),
                        g4_result: evaluation.g4.result,
                        g4_violations: JSON.stringify(evaluation.g4.violations),
                        g4_similarity_score: evaluation.g4.cosineSimilarity,
                        g5_result: evaluation.g5.result,
                        g5_violations: JSON.stringify(evaluation.g5.violations),
                        g7_score: evaluation.g7.score,
                        overall_pass: evaluation.overallPass ? 1 : 0,
                        critic_notes: evaluation.feedback,
                    });

                    completedTasks++;
                    if (runId) {
                        const progress = Math.round((completedTasks / totalTasks) * 100);
                        await db.update(workflowRuns)
                            .set({ 
                                progress,
                                current_step: `Platform: ${platform} | Variation: ${i + 1}/${numVariations}` 
                            })
                            .where(eq(workflowRuns.id, runId));
                    }
                });
            }
        }

        if (runId) {
            await db.update(workflowRuns)
                .set({ status: 'complete', progress: 100, current_step: 'complete', completedAt: new Date() })
                .where(eq(workflowRuns.id, runId));
        }

        return { success: true };
    }
}
