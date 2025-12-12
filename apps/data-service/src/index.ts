import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app';
import { initDatabase } from '@repo/data-ops/database';
export { HaloResearchWorkflow } from '@/workflows/halo-research-workflow';
export { GoldenPheasantWorkflow } from '@/workflows/golden-pheasant-workflow';
export { GodfatherOfferWorkflow } from '@/workflows/godfather-offer-workflow';
export { ChatSession } from "./do/ChatSession";

// Stubs to prevent deployment failure due to existing DO instances
export class EvaluationScheduler { }
export class LinkClickTracker { }

export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env)
		initDatabase(env.DB)
	}
	async fetch(request: Request) {
		const url = new URL(request.url);
		if (request.method === "POST" && url.pathname === "/api/internal/ingest") {
			const { upsertKnowledge } = await import("@repo/agent-logic/rag");
			const body = await request.json() as { items: any[] };
			if (!body.items || !Array.isArray(body.items)) {
				return new Response("Invalid body: 'items' array required", { status: 400 });
			}
			const count = await upsertKnowledge(this.env, body.items);
			return new Response(JSON.stringify({ success: true, count }), { headers: { "Content-Type": "application/json" } });
		}


		return App.fetch(request, this.env, this.ctx)
	}

	async queue(batch: MessageBatch<unknown>) {
		// New Queues (if any) can be handled here.
		// Legacy queues (social-media-generation, link-clicks) are removed.
		console.log('Processed queue batch', batch.queue);
	}

	// RPC Method for User Application
	async startHaloResearch(params: { projectId: string; keywords: string[] }) {
		console.log("RPC startHaloResearch called", params);
		if (!this.env.HALO_RESEARCH_WORKFLOW) {
			throw new Error("HALO_RESEARCH_WORKFLOW binding is missing in Data Service");
		}
		// Use unique ID to allow re-runs. 
		// We still pass projectId in params so the workflow knows what to update.
		const workflowId = `${params.projectId}-${Date.now()}`;
		await this.env.HALO_RESEARCH_WORKFLOW.create({
			id: workflowId,
			params
		});
		return { success: true, workflowId };
	}
}
