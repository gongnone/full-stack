
import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import puppeteer from '@cloudflare/puppeteer';
import { scrapeReddit, scrapeQuora, scrapeAnswerThePublic, ScrapeResult } from '../lib/scrapers';
import { PHASE_PROMPTS } from '@repo/agent-logic/prompts';
import { initDatabase } from '@repo/data-ops/database';
import { researchSources, haloAnalysis, dreamBuyerAvatar, projects } from '@repo/data-ops/schema';
import { eq } from 'drizzle-orm';
import { ingestIntoRag } from './steps/rag-ingest';
import { safeParseAIResponse } from '../helpers/json-ops';

interface HaloResearchParams {
    projectId: string;
    keywords: string[];
    industry?: string;
    targetAudience?: string;
    productDescription?: string;
}

interface ProcessedItem extends ScrapeResult {
    id?: string;
    sophistication?: { class: string; score: number };
    error?: boolean;
}


export class HaloResearchWorkflow extends WorkflowEntrypoint<Env, HaloResearchParams> {
    async run(event: WorkflowEvent<HaloResearchParams>, step: WorkflowStep) {
        const { projectId, keywords, industry, targetAudience, productDescription } = event.payload;

        // 1. Initialize
        await step.do('init', async () => {
            console.log(`Starting Halo Research for project ${projectId} with keywords: ${keywords.join(', ')} `);
            // Optional: Update project status to 'researching'
            return { status: 'started' };
        });

        // 1.5 Expand Query (Query Expansion)
        const expandedKeywords = await step.do('expand-query', async () => {
            const contextBuffer = [];
            if (industry) contextBuffer.push(`Industry: ${industry}`);
            if (targetAudience) contextBuffer.push(`Target Audience: ${targetAudience}`);
            if (productDescription) contextBuffer.push(`Product Concept: ${productDescription}`);

            const contextStr = contextBuffer.length > 0 ? `\nContext:\n${contextBuffer.join('\n')}` : '';

            const prompt = `You are a Research Assistant. The user provided these keywords/topic: "${keywords.join(', ')}".${contextStr}
            
            Generate 3-5 distinct, high-quality search queries to gather comprehensive market analysis (reviews, complaints, trends, reddit discussions).
            Return valid JSON only: { "queries": ["query1", "query2", ...] }`;

            try {
                const result = await this.runStrictJsonWithRetry<{ queries: string[] }>(prompt);
                console.log(`Expanded queries: ${result.queries.join(', ')}`);
                return result.queries;
            } catch (e) {
                console.warn('Failed to expand queries, falling back to original keywords', e);
                return keywords;
            }
        });

        // Use expanded keywords for scraping
        const searchTerms = expandedKeywords.length > 0 ? expandedKeywords : keywords;

        // 2. Scrape Reddit (Browser)
        const redditData = await step.do('scrape-reddit', async () => {
            if (!this.env.VIRTUAL_BROWSER) {
                console.warn('VIRTUAL_BROWSER binding not found. Skipping Reddit scrape.');
                return [];
            }
            const browser = await puppeteer.launch(this.env.VIRTUAL_BROWSER);
            const allPosts = [];
            try {
                for (const keyword of searchTerms) {
                    const posts = await scrapeReddit(browser, keyword, 10);
                    allPosts.push(...posts);
                }
            } finally {
                await browser.close();
            }
            return allPosts;
        });

        // 3. Scrape Quora (Browser)
        const quoraData = await step.do('scrape-quora', async () => {
            if (!this.env.VIRTUAL_BROWSER) {
                console.warn('VIRTUAL_BROWSER binding not found. Skipping Quora scrape.');
                return [];
            }
            const browser = await puppeteer.launch(this.env.VIRTUAL_BROWSER);
            const results = [];
            try {
                for (const keyword of searchTerms) {
                    const data = await scrapeQuora(browser, keyword);
                    results.push(...data);
                }
            } finally {
                await browser.close();
            }
            return results;
        });

        // 4. Scrape Answer The Public (Browser Proxy)
        const atpData = await step.do('scrape-atp', async () => {
            if (!this.env.VIRTUAL_BROWSER) {
                console.warn('VIRTUAL_BROWSER binding not found. Skipping ATP scrape.');
                return [];
            }
            const browser = await puppeteer.launch(this.env.VIRTUAL_BROWSER);
            const results = [];
            try {
                for (const keyword of searchTerms) {
                    const data = await scrapeAnswerThePublic(browser, keyword);
                    results.push(...data);
                }
            } finally {
                await browser.close();
            }
            return results;
        });

        const allRawData = [...redditData, ...quoraData, ...atpData];

        // 5. Filter Sophistication (LLM)
        const filteredData = await step.do('filter-sophistication', async () => {
            const results: ProcessedItem[] = [];
            // Process in batches or individually to avoid context limits. 
            // For prototype, we'll process top 5 items from each source type to save tokens/time
            const sample = allRawData.slice(0, 15);

            for (let i = 0; i < sample.length; i += 5) {
                const batch = sample.slice(i, i + 5);

                const batchResults = await Promise.all(batch.map(async (item) => {
                    const prompt = PHASE_PROMPTS.halo_strategy.sophistication_filter.replace('{content}', item.rawContent.substring(0, 1000));
                    try {
                        const sophistication = await this.runStrictJsonWithRetry<any>(prompt);
                        return {
                            ...item,
                            id: crypto.randomUUID(), // FIX: Generate ID here to link D1 and Vectorize
                            sophistication
                        } as ProcessedItem;
                    } catch (err) {
                        console.error('Sophistication filter error', err);
                        return { ...item, id: crypto.randomUUID(), error: true } as ProcessedItem;
                    }
                }));

                results.push(...batchResults);
            }
            return results;
        });

        // 6. Extract Halo Insights (LLM)
        const haloInsights = await step.do('extract-halo', async () => {
            // Aggregate high-quality content
            const validItems = filteredData.filter(d => !d.error && (d.sophistication?.score || 0) > 0.5);
            if (validItems.length === 0) return null;

            const aggregatedText = validItems.map(d => d.rawContent).join('\n\n---\n\n').substring(0, 6000); // Context limit

            const prompt = PHASE_PROMPTS.halo_strategy.halo_extraction.replace('{content}', aggregatedText);

            return this.runStrictJsonWithRetry<any>(prompt);
        });

        // 7. Generate Dream Buyer Avatar (LLM)
        const avatar = await step.do('generate-avatar', async () => {
            if (!haloInsights) return null;

            const prompt = PHASE_PROMPTS.halo_strategy.dream_buyer_avatar.replace('{aggregated_data}', JSON.stringify(haloInsights));

            return this.runStrictJsonWithRetry<any>(prompt);
        });

        // 8. Save Results
        await step.do('save-results', async () => {
            const db = initDatabase(this.env.DB);
            const timestamp = new Date();

            // Save Sources
            if (filteredData.length > 0) {
                // Bulk insert is tricky with different structures, loop for now or map carefully
                for (const item of filteredData) {
                    await db.insert(researchSources).values({
                        id: item.id || crypto.randomUUID(), // FIX: Use the shared ID
                        projectId,
                        sourceType: item.sourceType,
                        sourceUrl: item.url,
                        rawContent: item.rawContent.substring(0, 5000), // Truncate for DB
                        sophisticationClass: item.sophistication?.class,
                        sophisticationScore: item.sophistication?.score,
                        status: 'processed',
                        createdAt: timestamp
                    });
                }
            }

            // Save Halo Analysis
            if (haloInsights) {
                await db.insert(haloAnalysis).values({
                    id: crypto.randomUUID(),
                    projectId,
                    hopesAndDreams: JSON.stringify(haloInsights.hopes_and_dreams),
                    painsAndFears: JSON.stringify(haloInsights.pains_and_fears),
                    barriersAndUncertainties: JSON.stringify(haloInsights.barriers_and_uncertainties),
                    vernacular: JSON.stringify(haloInsights.vernacular),
                    unexpectedInsights: JSON.stringify(haloInsights.unexpected_insights),
                    visualCues: JSON.stringify(haloInsights.visual_cues),
                    createdAt: timestamp,
                    updatedAt: timestamp
                });
            }

            // Save Avatar
            if (avatar) {
                await db.insert(dreamBuyerAvatar).values({
                    id: crypto.randomUUID(),
                    projectId,
                    demographics: JSON.stringify(avatar.demographics),
                    psychographics: JSON.stringify(avatar.psychographics),
                    dayInTheLife: avatar.day_in_the_life,
                    mediaConsumption: JSON.stringify(avatar.media_consumption),
                    buyingBehavior: avatar.buying_behavior,
                    summaryParagraph: avatar.summary_paragraph,
                    createdAt: timestamp
                });
            }

            return { success: true, sourcesCount: filteredData.length };
        });

        // 9. RAG Ingestion
        await step.do('ingest-rag', async () => {
            if (filteredData.length === 0) return { skipped: true };

            const itemsToIngest = filteredData.map(item => ({
                id: item.id || crypto.randomUUID(), // FIX: Use the SAME ID
                content: item.rawContent,
                projectId: projectId,
                metadata: {
                    sourceType: item.sourceType,
                    url: item.url,
                    sophistication: item.sophistication?.class
                }
            }));

            const result = await ingestIntoRag(this.env, itemsToIngest);
            return result;
        });
    }

    private async runStrictJsonWithRetry<T>(prompt: string, model: any = '@cf/meta/llama-3-8b-instruct'): Promise<T> {
        const systemPrompt = 'You are a JSON-only API. Return valid JSON only. Do not include markdown formatting. Do not use trailing commas. Ensure all quotes are properly escaped.';

        // 1. First Attempt
        let firstResponseStr: string = '';
        try {
            const response = await this.env.AI.run(model, {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ]
            }) as any;
            firstResponseStr = response.response;
            return safeParseAIResponse<T>(firstResponseStr);
        } catch (e: any) {
            console.warn(`[runStrictJsonWithRetry] Initial parse failed: ${e.message}. Attempting self-correction...`);

            // 2. Repair Attempt
            const repairPrompt = `You generated invalid JSON. The error was: "${e.message}".
            
Common Mistakes to Check:
- Missing commas between properties (e.g., "a":1 "b":2) -> Fix: "a":1, "b":2
- Trailing commas before closing braces (e.g., "a":1, }) -> Fix: "a":1 }
- Unescaped quotes inside strings (e.g., "key": "some "text" here") -> Fix: "key": "some \"text\" here"

Invalid Output:
${firstResponseStr.substring(0, 3000)}

Please return ONLY the corrected, valid JSON.`;

            try {
                const repairResponse = await this.env.AI.run(model, {
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: repairPrompt }
                    ]
                }) as any;
                return safeParseAIResponse<T>(repairResponse.response);
            } catch (repairError: any) {
                console.error(`[runStrictJsonWithRetry] Repair failed: ${repairError.message}`);
                throw new Error(`Failed to generate valid JSON after retry. Original error: ${e.message}`);
            }
        }
    }
}
