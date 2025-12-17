
import puppeteer from '@cloudflare/puppeteer';

/**
 * Scrape full page content using Cloudflare Browser
 */
export async function scrapePageContent(
    browserBinding: any, // Fetcher (Browser Binding)
    url: string
): Promise<{ content: string; title: string; screenshot?: Uint8Array }> {
    let browser;
    try {
        browser = await puppeteer.launch(browserBinding);
        const page = await browser.newPage();

        // Set viewport for consistent rendering
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // Scroll to load lazy content (comments/reviews)
        await autoScroll(page);

        // Extract content
        const content = await page.evaluate(() => {
            // Remove scripts, styles, and ads to clean up text
            const scripts = document.querySelectorAll('script, style, noscript, iframe, .ad, .advertisement');
            scripts.forEach(s => s.remove());
            return document.body.innerText;
        });

        const title = await page.title();

        // Take Screenshot (for saving to R2 later if needed)
        // const screenshot = await page.screenshot(); 

        await browser.close();

        return { content, title }; // Return screenshot if enabled
    } catch (e: any) {
        console.error(`[Browser Tool] Failed to scrape ${url}:`, e);
        if (browser) await browser.close();
        // Fallback: Return empty string so caller can use Tavily snippet
        return { content: '', title: '' };
    }
}

/**
 * Auto-scroll function to trigger lazy loading
 */
async function autoScroll(page: any) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 300;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight || totalHeight > 15000) { // Limit scroll depth
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
