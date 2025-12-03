import puppeteer from '@cloudflare/puppeteer';

export async function collectDestinationInfo(env: Env, destinationUrl: string) {
	const NAVIGATION_TIMEOUT_MS = 15_000;
	const POST_LOAD_WAIT_MS = 3_000;

	const browser = await puppeteer.launch(env.VIRTUAL_BROWSER);
	const page = await browser.newPage();
	page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);

	try {
		const response = await page.goto(destinationUrl, {
			waitUntil: 'domcontentloaded',
			timeout: NAVIGATION_TIMEOUT_MS,
		});
		await new Promise<void>((resolve) => setTimeout(resolve, POST_LOAD_WAIT_MS));

		const rawBodyText = (await page.$eval('body', (el) => el.innerText)) as string;
		const bodyText = rawBodyText.length > 8000 ? rawBodyText.slice(0, 8000) : rawBodyText;
		const html = await page.content();
		const status = response ? response.status() : 0;

		const screenshot = await page.screenshot({ encoding: 'base64' });
		const screenshotDataUrl = `data:image/png;base64,${screenshot}`;

		return {
			status,
			bodyText,
			html,
			screenshotDataUrl,
		};
	} finally {
		try {
			await browser.close();
		} catch {
			// ignore close errors
		}
	}
}