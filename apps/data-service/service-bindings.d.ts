interface Env extends Cloudflare.Env {
	VIRTUAL_BROWSER: Fetcher;
}

interface DestinationStatusEvaluationParams {
	linkId: string;
	destinationUrl: string;
	accountId: string;
}
