/// <reference lib="dom" />
import puppeteer from '@cloudflare/puppeteer';

export interface ScrapeResult {
    sourceType: 'reddit' | 'quora' | 'answer_the_public';
    url: string;
    rawContent: string;
    metadata?: Record<string, any>;
}

export async function scrapeReddit(browser: puppeteer.Browser, topic: string, limit: number = 10): Promise<ScrapeResult[]> {
    // 1. Attempt Direct Scrape (old.reddit.com)
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');

        // Use old.reddit.com for easier scraping structure
        const searchUrl = `https://old.reddit.com/search?q=${encodeURIComponent(topic)}&sort=relevance&t=year`;

        try {
            await page.goto(searchUrl, { waitUntil: 'networkidle0' });

            // Check for 403 or specific blocked text just in case (though we rely on try/catch mostly)
            const content = await page.content();
            if (content.includes('Forbidden') || content.includes('403 Forbidden')) {
                throw new Error('Access Forbidden (403)');
            }

            const posts = await page.evaluate((limit: number) => {
                const things = document.querySelectorAll('.search-result-link');
                return Array.from(things).slice(0, limit).map(thing => {
                    const titleEl = thing.querySelector('.search-title');
                    const link = titleEl?.getAttribute('href') || '';
                    const title = titleEl?.textContent || '';
                    const score = thing.querySelector('.search-score')?.textContent || '0';
                    const comments = thing.querySelector('.search-comments')?.textContent || '0 comments';
                    const author = thing.querySelector('.author')?.textContent || 'unknown';

                    return {
                        sourceType: 'reddit' as const,
                        url: link.startsWith('/') ? `https://old.reddit.com${link}` : link,
                        rawContent: title,
                        metadata: {
                            score: score.replace(/\D/g, ''),
                            comments: comments.replace(/\D/g, ''),
                            author,
                            source_method: 'direct_scrape'
                        }
                    };
                });
            }, limit);

            if (posts.length > 0) {
                return posts;
            }
            console.warn(`Direct Reddit scrape yielded 0 results for ${topic}. Triggering fallback.`);

        } finally {
            await page.close();
        }
    } catch (error) {
        console.warn(`Direct Reddit scrape failed for ${topic}:`, error);
    }

    // 2. Fallback: Google Search Proxy ("Google-Fu")
    console.log(`Attempting Google-Fu fallback for Reddit: ${topic}`);
    return scrapeGoogleRedditFallback(browser, topic, limit);
}

async function scrapeGoogleRedditFallback(browser: puppeteer.Browser, topic: string, limit: number): Promise<ScrapeResult[]> {
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:reddit.com ${topic}`)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle0' });

        const results = await page.evaluate((limit: number) => {
            // Broad Google selector strategy
            const elements = Array.from(document.querySelectorAll('.g'));
            return elements.slice(0, limit).map(el => {
                const titleEl = el.querySelector('h3');
                const linkEl = el.querySelector('a');
                const snippetEl = el.querySelector('.VwiC3b') || el.querySelector('.IsZvec'); // Common snippet classes

                const title = titleEl?.innerText || 'No Title';
                const url = linkEl?.href || '';
                const snippet = (snippetEl as HTMLElement)?.innerText || '';

                if (!url.includes('reddit.com')) return null;

                return {
                    sourceType: 'reddit' as const,
                    url: url,
                    rawContent: `${title}\n${snippet}`,
                    metadata: {
                        source_method: 'google_proxy'
                    }
                };
            }).filter((item): item is any => item !== null);
        }, limit);

        return results;
    } catch (error) {
        console.error(`Google-Fu fallback failed for ${topic}:`, error);
        return [];
    } finally {
        await page.close();
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
                href: (item.closest('a') as HTMLAnchorElement | null)?.href || ''
            }));
        });

        results.push(...snippets.map((s: { text: string; href: string }) => ({
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
