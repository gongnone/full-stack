
import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { AgentContext, AgentEnv } from '../types/halo-types';
import { CompetitorReconResultSchema, DiscoveryResultSchema } from '@repo/data-ops/zod/halo-schema-v2';
import { scrapePageContent } from '../tools/browser-tools';
import { performWebSearch } from '../tools';

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

    // 1. Initial ID of competitors via LLM logic
    const potentialCompetitors = discovery.wateringHoles
        .filter(wh => wh.platform === 'other' || wh.platform === 'forum')
        .map(wh => wh.name)
        .join(', ');

    console.log(`[Competitor Recon] Identifying competitors...`);

    // First pass: Just get Names + URLs from LLM/Search
    const initialIdentification = await generateObject({
        model,
        schema: z.object({
            competitors: z.array(z.object({
                name: z.string(),
                url: z.string().describe("Estimated URL, will be verified"),
                searchQuery: z.string().describe("Query to find their sales page")
            })).length(3)
        }),
        prompt: `
            Identify top 3 direct competitors for "${context.topic}".
            Context: ${potentialCompetitors}
            
            Return their names and a search query to find their main sales page.
        `,
    });

    // 2. Verified Data Collection (The Tier 2 Upgrade)
    const verifiedCompetitors = [];

    for (const comp of initialIdentification.object.competitors) {
        console.log(`[Competitor Recon] Analyzing ${comp.name}...`);

        let targetUrl = comp.url;
        let pageContent = "";

        // Search to confirm verification URL
        const searchRes = await performWebSearch(comp.searchQuery, env.TAVILY_API_KEY);
        if (searchRes.results.length > 0) {
            targetUrl = searchRes.results[0].url; // Take top result
        }

        // Active Scraping
        if (env.VIRTUAL_BROWSER) {
            console.log(`[Competitor Recon] Scraping ${targetUrl}...`);
            const scraped = await scrapePageContent(env.VIRTUAL_BROWSER, targetUrl);
            pageContent = scraped.content.slice(0, 10000); // Limit context
        } else {
            // Fallback to Tavily snippet
            pageContent = searchRes.results[0]?.content || "";
        }

        // 3. Extract details from REAL content
        const extraction = await generateObject({
            model,
            schema: z.object({
                hvco: z.string(),
                primaryOffer: z.object({
                    name: z.string(),
                    price: z.string(),
                    promise: z.string()
                }),
                funnelSteps: z.array(z.string()),
                weaknesses: z.array(z.string())
            }),
            prompt: `
                Analyze this LANDING PAGE CONTENT for competitor "${comp.name}".
                
                URL: ${targetUrl}
                CONTENT:
                ${pageContent}
                
                Extract:
                1. HVCO (Lead Magnet)
                2. Primary Offer Name & Price (Be precise, look for $ symbols)
                3. The Big Promise
                4. Weaknesses in their copy/offer based on Alex Hormozi's $100M Offers framework.
            `
        });

        verifiedCompetitors.push({
            competitorName: comp.name,
            url: targetUrl,
            ...extraction.object
        });
    }

    return {
        competitors: verifiedCompetitors,
        timestamp: new Date().toISOString()
    };
}
