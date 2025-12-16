
import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { AgentContext, AgentEnv } from '../types/halo-types';
import { CompetitorReconResultSchema, DiscoveryResultSchema } from '@repo/data-ops/zod/halo-schema-v2';

export async function runCompetitorReconAgent(
    env: AgentEnv,
    context: AgentContext,
    discovery: z.infer<typeof DiscoveryResultSchema>
) {
    const openai = createOpenAI({
        apiKey: env.AI.API_KEY,
        compatibility: 'strict',
    });

    const model = openai('gpt-4o-2024-08-06');

    // Extract competitor names from discovery if possible, or search for them
    const potentialCompetitors = discovery.wateringHoles
        .filter(wh => wh.platform === 'other' || wh.platform === 'forum') // Loose proxy for now, but better to just ask LLM
        .map(wh => wh.name)
        .join(', ');

    const result = await generateObject({
        model,
        schema: CompetitorReconResultSchema,
        prompt: `
            You are the "Golden Pheasant" Competitor Reconnaissance Agent.
            Your job is to identify the top 3-5 direct competitors for the topic: "${context.topic}".
            
            PROJECT CONTEXT:
            Topic: ${context.topic}
            Target Audience: ${context.targetAudience || 'General market'}
            Product Description: ${context.productDescription || 'N/A'}

            INSTRUCTIONS:
            1. Identify 3-5 major competitors selling information products, courses, or coaching in this niche.
            2. For each competitor, "Funnel Hack" them (simulate the buying process):
               - URL: Find their landing page.
               - HVCO (High Value Content Offer): What is their lead magnet? (e.g. Free PDF, Webinar, Quiz).
               - Primary Offer: The main thing they sell immediately after the lead magnet.
               - Price: Estimate or find the price point.
               - Promise: What is the "Big Promise" of the offer?
               - Funnel Steps: What happens next? (Upsell? Email sequence?)
               - Weaknesses: What are they doing poorly? (Bad design, weak copy, no guarantee, etc.)

            Valid Sources from Discovery Phase:
            ${potentialCompetitors}

            Output must be strict JSON matching the schema.
        `,
        temperature: 0.7, // Higher temp for creative finding
    });

    return result.object;
}
