export interface ScrapeResult {
    sourceType: 'reddit' | 'quora' | 'answer_the_public';
    url: string;
    rawContent: string;
    metadata?: Record<string, any>;
}

export async function scrapeReddit(topic: string, limit: number = 10): Promise<ScrapeResult[]> {
    // Use public JSON API for Reddit
    const url = `https://www.reddit.com/r/${topic}/top.json?limit=${limit}&t=year`;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.warn(`Reddit scrape failed for ${topic}: ${response.statusText}`);
            return [];
        }

        const data = await response.json() as any;
        const posts = data.data.children.map((child: any) => ({
            sourceType: 'reddit' as const,
            url: `https://www.reddit.com${child.data.permalink}`,
            rawContent: `${child.data.title}\n${child.data.selftext}`,
            metadata: {
                score: child.data.score,
                comments: child.data.num_comments,
                author: child.data.author
            }
        }));

        return posts;
    } catch (error) {
        console.error(`Error scraping Reddit topic ${topic}:`, error);
        return [];
    }
}

export async function scrapeQuora(browser: puppeteer.Browser, topic: string): Promise<ScrapeResult[]> {
    const page = await browser.newPage();
    const searchUrl = `https://www.quora.com/search?q=${encodeURIComponent(topic)}`;
    const results: ScrapeResult[] = [];

    try {
        await page.goto(searchUrl, { waitUntil: 'networkidle0' });

        // Simple extraction of question titles and visible snippets
        // Note: Quora classes change frequently, this is a best-effort selector strategy
        const snippets = await page.evaluate(() => {
            const items = document.querySelectorAll('.q-box.qu-mb--tiny'); // Generic selector, might need tuning
            return Array.from(items).map(item => ({
                text: (item as HTMLElement).innerText,
                href: item.closest('a')?.href || ''
            }));
        });

        results.push(...snippets.map(s => ({
            sourceType: 'quora' as const,
            url: s.href || searchUrl,
            rawContent: s.text,
            metadata: { topic }
        })));

    } catch (error) {
        console.error(`Error scraping Quora for ${topic}:`, error);
    } finally {
        await page.close();
    }

    return results;
}

export async function scrapeAnswerThePublic(browser: puppeteer.Browser, topic: string): Promise<ScrapeResult[]> {
    // ATP is hard to scrape directly due to visualizations. 
    // We will fallback to a Google Search "people also ask" scraping strategy as a proxy for "Answer The Public" style data 
    // if actual ATP scraping proves too difficult with headless browser (often blocked).
    // For now, let's try a google search for "questions about [topic]"

    const page = await browser.newPage();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent('questions about ' + topic)}`;
    const results: ScrapeResult[] = [];

    try {
        await page.goto(searchUrl, { waitUntil: 'networkidle0' });

        const peopleAlsoAsk = await page.evaluate(() => {
            // Google PAA selectors
            const elements = document.querySelectorAll('.related-question-pair');
            return Array.from(elements).map(el => (el as HTMLElement).innerText);
        });

        results.push({
            sourceType: 'answer_the_public' as const, // Branding as ATP for the system logic
            url: searchUrl,
            rawContent: peopleAlsoAsk.join('\n'),
            metadata: { topic, type: 'google_paa' }
        });

    } catch (error) {
        console.error(`Error scraping questions for ${topic}:`, error);
    } finally {
        await page.close();
    }

    return results;
}
