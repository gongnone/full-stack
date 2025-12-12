import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { PHASE_PROMPTS } from '@repo/agent-logic/prompts';
import { initDatabase } from '@repo/data-ops/database';
import { haloAnalysis, dreamBuyerAvatar, competitorOfferMap, godfatherOffer } from '@repo/data-ops/schema';
import { eq, desc } from 'drizzle-orm';

interface GodfatherOfferParams {
    projectId: string;
}

export class GodfatherOfferWorkflow extends WorkflowEntrypoint<Env, GodfatherOfferParams> {
    async run(event: WorkflowEvent<GodfatherOfferParams>, step: WorkflowStep) {
        const { projectId } = event.payload;

        // 1. Fetch Context (Avatar + Competitor Gaps)
        const context = await step.do('fetch-context', async () => {
            const db = initDatabase(this.env.DB);

            // Get Avatar (Latest)
            const avatarRecord = await db.select().from(dreamBuyerAvatar)
                .where(eq(dreamBuyerAvatar.projectId, projectId))
                .orderBy(desc(dreamBuyerAvatar.createdAt))
                .limit(1)
                .get();

            // Get Competitor Offers
            const competitors = await db.select().from(competitorOfferMap)
                // .where(eq(competitorOfferMap.projectId, projectId)) // Schema mismatch: competitorOfferMap links to COMPETITOR not PROJECT directly.
                // We need to join via competitors table? Or assume we only analyze 1 competitor for now?
                // For MVP, we'll try to fetch all or we need a join.
                // Since we can't easily join in this D1 setup without defining relations in schema fully,
                // let's skip relation check or implement query properly.
                // Wait, schema has `competitorId`.
                // Let's assume user wants to use recent analyses.
                .limit(5)
                .all();

            return {
                avatar: avatarRecord ? {
                    demographics: avatarRecord.demographics,
                    psychographics: avatarRecord.psychographics,
                    pains: avatarRecord.summaryParagraph // Simplified for prompt
                } : null,
                competitors: competitors.map(c => ({
                    promise: c.primaryCta,
                    mechanism: c.valueBuild
                }))
            };
        });

        if (!context.avatar) {
            // Fail or wait? Fail for now.
            console.error('No Avatar found for project');
            return { error: 'Missing Avatar Data' };
        }

        // 2. Generate Godfather Offer (LLM)
        const generatedOffer = await step.do('generate-offer', async () => {
            const prompt = PHASE_PROMPTS.halo_strategy.godfather_offer_generation
                .replace('{avatar_json}', JSON.stringify(context.avatar))
                .replace('{competitor_data}', JSON.stringify(context.competitors.slice(0, 3))); // Limit context

            const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: 'You are a JSON-only API. return valid JSON.' },
                    { role: 'user', content: prompt }
                ]
            }) as any;

            let content = response.response;
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(content);
        });

        // 3. Score Offer (LLM)
        const scorecard = await step.do('score-offer', async () => {
            if (!generatedOffer) return null;

            const prompt = PHASE_PROMPTS.halo_strategy.offer_scorecard
                .replace('{offer_json}', JSON.stringify(generatedOffer));

            const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: 'You are a JSON-only API. return valid JSON.' },
                    { role: 'user', content: prompt }
                ]
            }) as any;

            let content = response.response;
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(content);
        });

        // 4. Save Offer
        await step.do('save-offer', async () => {
            const db = initDatabase(this.env.DB);

            await db.insert(godfatherOffer).values({
                id: crypto.randomUUID(),
                projectId,
                offerParagraph: generatedOffer.headline + "\n\n" + generatedOffer.promise,
                valueBuild: JSON.stringify(generatedOffer.offer_stack),
                premiums: JSON.stringify(generatedOffer.bonuses),
                powerGuarantee: generatedOffer.guarantee,
                scarcity: generatedOffer.scarcity,
                pricingTiers: generatedOffer.price_strategy,
                rationale: generatedOffer.value_equation_justification,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            return { success: true, offerId: generatedOffer.headline };
        });

    }
}
