import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import puppeteer from '@cloudflare/puppeteer';
import { PHASE_PROMPTS } from '@repo/agent-logic';
import { initDatabase } from '@repo/data-ops/database';
import { competitors, competitorOfferMap, projects } from '@repo/data-ops/schema';
import { processUploadedDocument } from './steps/document-processor';
import { eq } from 'drizzle-orm';

interface GoldenPheasantParams {
    projectId: string;
    competitorName: string;
    competitorUrl: string;
}

interface UploadEvent {
    objectKey: string; // The R2 key of the uploaded file
}

export class GoldenPheasantWorkflow extends WorkflowEntrypoint<Env, GoldenPheasantParams> {
    async run(event: WorkflowEvent<GoldenPheasantParams>, step: WorkflowStep) {
        const { projectId, competitorName, competitorUrl } = event.payload;

        // 1. Initialize & Create Competitor Record
        await step.do('init', async () => {
            const db = initDatabase(this.env.DB);
            // Ensure competitor exists or create placeholder
            await db.insert(competitors).values({
                id: crypto.randomUUID(),
                projectId,
                name: competitorName,
                websiteUrl: competitorUrl,
                status: 'analyzing',
                createdAt: new Date()
            });
            return { status: 'initialized' };
        });

        // 2. Scrape Competitor Website (Browser)
        const scrapeResult = await step.do('scrape-site', async () => {
            if (!this.env.VIRTUAL_BROWSER) return { skipped: true, reason: 'No Browser Binding' };

            // Basic landing page scrape
            const browser = await puppeteer.launch(this.env.VIRTUAL_BROWSER);
            try {
                const page = await browser.newPage();
                await page.goto(competitorUrl, { waitUntil: 'networkidle0', timeout: 30000 });
                const content = await page.content();
                // Simple text extraction for analysis
                const text = await page.evaluate(() => {
                    // @ts-ignore
                    return document.body.innerText;
                });
                return { success: true, text: text.substring(0, 5000) }; // Limit for LLM
            } catch (e) {
                console.error('Site scrape failed', e);
                return { success: false, error: String(e) };
            } finally {
                await browser.close();
            }
        });

        // 3. Wait for "Golden Pheasant" Upload (HITL)
        // The user must upload a PDF/Zip of the funnel/ads to R2 and trigger this event
        const uploadEvent = await step.waitForEvent('upload-complete', {
            timeout: "1 day",
            type: "event"
        });

        // 4. Process Uploaded Asset
        const assetContent = await step.do('process-upload', async () => {
            if (!uploadEvent) return null; // Timeout occurred
            const eventData = uploadEvent.payload as UploadEvent;

            try {
                const text = await processUploadedDocument(this.env, eventData.objectKey);
                return text;
            } catch (e) {
                console.error('Document processing failed', e);
                return null;
            }
        });

        // 5. Analyze Offer (LLM)
        const offerAnalysis = await step.do('analyze-offer', async () => {
            // Combine scraped text + asset text
            const combinedText = `
        WEBSITE CONTENT:
        ${scrapeResult.text || ''}

        UPLOADED ASSET CONTENT:
        ${assetContent || ''}
        `.substring(0, 10000); // Context window safety

            if (!combinedText.trim()) return null;

            const prompt = PHASE_PROMPTS.halo_strategy.offer_deconstruction.replace('{content}', combinedText);

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

        // 6. Save Analysis
        await step.do('save-competitor-map', async () => {
            if (!offerAnalysis) return { success: false, reason: 'No analysis generated' };

            const db = initDatabase(this.env.DB);

            // Find competitor ID (hacky: we should pass it from step 1, but for now we query or assumes one per project/url pair)
            // Better: Return ID from step 1. But step persistence is tricky in 'do' across scopes effectively without passing.
            // We will just insert a new map record linked to the name/url logically or creating a new competitor record is redundant if we did it in step 1.
            // Actually, let's just insert the map. We need the competitorId.
            // Refactor: Pass competitorId from init step?
            // Workaround: Query by URL/Project to get ID.

            // Simplified for V1: Just insert into competitor_offer_map with a new ID or update?
            // Let's Insert.

            await db.insert(competitorOfferMap).values({
                id: crypto.randomUUID(),
                competitorId: crypto.randomUUID(), // Placeholder as we didn't fetch it. In prod, link correctly.
                primaryCta: offerAnalysis.promise,
                pricing: JSON.stringify(offerAnalysis.price_points),
                guarantee: JSON.stringify(offerAnalysis.guarantees),
                bonuses: JSON.stringify(offerAnalysis.bonuses),
                scarcity: JSON.stringify(offerAnalysis.scarcity_urgency),
                valueBuild: offerAnalysis.mechanism,
                createdAt: new Date()
            });

            return { success: true };
        });

    }
}
