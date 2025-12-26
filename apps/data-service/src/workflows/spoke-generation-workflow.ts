import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { initDatabase } from '@repo/data-ops/database';
import { extracted_pillars, spokes, spoke_evaluations, feedback_log, workflowRuns } from '@repo/data-ops/schema';
import { eq } from 'drizzle-orm';
import { SPOKE_GENERATION_PROMPTS, PLATFORM_CONFIGS, AI_MODELS, GENERATION_CONFIG } from '@repo/agent-logic';
import { CriticAgent } from '@repo/agent-system';

interface SpokeGenerationParams {
    hubId: string;
    runId?: string;
}

export class SpokeGenerationWorkflow extends WorkflowEntrypoint<Env, SpokeGenerationParams> {
    async run(event: WorkflowEvent<SpokeGenerationParams>, step: WorkflowStep) {
        const { hubId, runId } = event.payload;
        const db = initDatabase(this.env.DB);

        // 1. Fetch Pillars
        const pillars = await step.do('fetch-pillars', async () => {
            const pillarRecords = await db.select().from(extracted_pillars).where(eq(extracted_pillars.hub_id, hubId)).all();
            return pillarRecords;
        });

        if (!pillars || pillars.length === 0) {
            console.error('No pillars found for hub');
            if (runId) {
                await db.update(workflowRuns)
                    .set({ status: 'failed', errorMessage: 'No pillars found' })
                    .where(eq(workflowRuns.id, runId));
            }
            return { error: 'Missing Pillar Data' };
        }

        const totalTasks = pillars.length * GENERATION_CONFIG.PSYCHOLOGICAL_ANGLES.length;
        let completedTasks = 0;

        // 2. Generate Spokes for each Pillar
        for (const pillar of pillars) {
            for (const angle of GENERATION_CONFIG.PSYCHOLOGICAL_ANGLES) {
                await step.do(`generate-spokes-pillar-${pillar.id}-angle-${angle}`, async () => {
                    const platforms = Object.keys(PLATFORM_CONFIGS) as (keyof typeof PLATFORM_CONFIGS)[];
                    const critic = new CriticAgent(this.env.AI as any, this.env.VECTORIZE as any, this.env.DB as any);

                    // Generate spokes for each platform in parallel for this pillar+angle combination
                    const results = await Promise.all(platforms.map(async (platform) => {
                        let attempt = 1;
                        let lastEvaluation: any = null;
                        let currentContent = "";
                        let finalSpoke: any = null;
                        const evaluationsHistory: any[] = [];

                        while (attempt <= GENERATION_CONFIG.MAX_ATTEMPTS) {
                            const platformConfig = PLATFORM_CONFIGS[platform];
                            let prompt = `${SPOKE_GENERATION_PROMPTS.common}\n${SPOKE_GENERATION_PROMPTS[platform]}`
                                .replace('{pillar_name}', pillar.name)
                                .replace('{psychological_angle}', angle)
                                .replace('{platform}', platform as string)
                                .replace('{maxChars}', (platformConfig as any).maxChars || '')
                                .replace('{maxWords}', (platformConfig as any).maxWords || '')
                                .replace('{posts}', (platformConfig as any).posts?.join('-') || '')
                                .replace('{slides}', (platformConfig as any).slides?.join('-') || '');

                            if (lastEvaluation) {
                                const g5Violations = lastEvaluation.g5.violations.map((v: any) => v.message);
                                const allViolations = [...lastEvaluation.g4.violations, ...g5Violations].join('\n');

                                const healingPrompt = SPOKE_GENERATION_PROMPTS.healing
                                    .replace('{original_content}', currentContent)
                                    .replace('{feedback}', lastEvaluation.feedback || "Needs improvement")
                                    .replace('{violations}', allViolations || "Quality gates failed");
                                prompt += `\n${healingPrompt}`;
                            }

                            const response = await this.env.AI.run(AI_MODELS.GENERATION as any, {
                                messages: [
                                    { role: 'system', content: 'You are a JSON-only API. return valid JSON.' },
                                    { role: 'user', content: prompt }
                                ]
                            }) as any;

                            currentContent = response.response;
                            currentContent = currentContent.replace(/```json/g, '').replace(/```/g, '').trim();

                            finalSpoke = {
                                id: crypto.randomUUID(),
                                hub_id: hubId,
                                pillar_id: pillar.id,
                                client_id: pillar.client_id || 'unknown',
                                platform: platform as string,
                                content: currentContent,
                                psychological_angle: angle,
                                status: 'ready',
                                generation_attempt: attempt,
                            };

                            try {
                                lastEvaluation = await critic.evaluate(finalSpoke, finalSpoke.client_id);
                                evaluationsHistory.push({
                                    ...lastEvaluation,
                                    attempt
                                });

                                if (lastEvaluation.overallPass) {
                                    finalSpoke.status = 'ready_for_review';
                                    break;
                                }
                            } catch (e) {
                                console.error('Evaluation failed for spoke', finalSpoke.id, e);
                                break; 
                            }

                            attempt++;
                        }

                        if (finalSpoke && !lastEvaluation?.overallPass && attempt > GENERATION_CONFIG.MAX_ATTEMPTS) {
                            finalSpoke.status = 'failed_qa';
                        }

                        return { spoke: finalSpoke, evaluation: lastEvaluation, history: evaluationsHistory };
                    }));

                    // Save Results
                    const validSpokes = results.map(r => r.spoke).filter(s => s !== null);
                    if (validSpokes.length > 0) {
                        await db.insert(spokes).values(validSpokes);
                        
                        const evaluations = results
                            .filter(r => r.evaluation !== null)
                            .map(r => {
                                const e = r.evaluation!;
                                return {
                                    id: e.spokeId,
                                    spoke_id: e.spokeId,
                                    client_id: r.spoke.client_id,
                                    g2_score: e.g2.score,
                                    g2_breakdown: JSON.stringify(e.g2.breakdown),
                                    g4_result: e.g4.result,
                                    g4_violations: JSON.stringify(e.g4.violations),
                                g4_similarity_score: e.g4.cosineSimilarity,
                                g5_result: e.g5.result,
                                g5_violations: JSON.stringify(e.g5.violations),
                                g7_score: e.g7.score,
                                overall_pass: e.overallPass ? 1 : 0,
                            };
                        });
                                                            if (evaluations.length > 0) {
                            await db.insert(spoke_evaluations).values(evaluations);
                        }

                        // Save feedback history
                        const feedbackLogs: any[] = [];
                        results.forEach(r => {
                            r.history.forEach((h: any) => {
                                feedbackLogs.push({
                                    id: crypto.randomUUID(),
                                    spoke_id: r.spoke.id,
                                    client_id: r.spoke.client_id,
                                    gate_type: 'auto_qa',
                                    score: h.g2.score,
                                    result: h.overallPass ? 'pass' : 'fail',
                                    violations_json: JSON.stringify(h.g4.violations.concat(h.g5.violations)),
                                    suggestions: h.feedback,
                                    healing_attempt: h.attempt,
                                });
                            });
                        });

                        if (feedbackLogs.length > 0) {
                            await db.insert(feedback_log).values(feedbackLogs);
                        }
                    }

                    completedTasks++;
                                        if (runId) {
                                            const progress = Math.round((completedTasks / totalTasks) * 100);
                                            await db.update(workflowRuns)
                                                .set({ 
                                                    progress, 
                                                    current_step: `Pillar: ${pillar.name} | Angle: ${angle}` 
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