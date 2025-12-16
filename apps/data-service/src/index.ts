import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app';
import { initDatabase } from '@repo/data-ops/database';
// Import from the new file
export { HaloResearchWorkflow } from '@/workflows/halo-workflow';
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
	// Updated signature to match the new Investigator logic requirements
	// RPC Method for User Application
	// Updated signature to match the new Investigator logic requirements
	async startHaloResearch(projectId: string, topic: string, userId: string, runId: string, additionalContext?: {
		targetAudience?: string;
		productDescription?: string;
	}) {
		console.log("RPC startHaloResearch called", { projectId, topic, userId, runId, additionalContext });
		if (!this.env.HALO_RESEARCH_WORKFLOW) {
			throw new Error("HALO_RESEARCH_WORKFLOW binding is missing in Data Service");
		}

		// Use the explicit runId passed from the frontend for traceability
		const workflowId = runId;

		await this.env.HALO_RESEARCH_WORKFLOW.create({
			id: workflowId,
			params: {
				projectId,
				topic,
				userId,
				runId, // Gap 2 Fix: Pass runId to workflow
				additionalContext
			}
		});
		return { success: true, workflowId, status: 'started' };
	}
}
