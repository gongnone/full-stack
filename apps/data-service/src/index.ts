import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app';
import { initDatabase } from '@repo/data-ops/database';

// Workflows
export { HaloResearchWorkflowV2 } from '@/workflows/halo-workflow-v2'; // 6-phase multi-agent workflow
export { HaloResearchWorkflowV2 as HaloResearchWorkflow } from '@/workflows/halo-workflow-v2'; // Alias for compatibility
export { GoldenPheasantWorkflow } from '@/workflows/golden-pheasant-workflow';
export { GodfatherOfferWorkflow } from '@/workflows/godfather-offer-workflow';

// Durable Objects
export { ChatSession } from "./do/ChatSession";



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

	/**
	 * Start Halo Research V2 (6-Phase Multi-Agent Workflow)
	 *
	 * This uses the new multi-phase workflow that produces higher quality outputs:
	 * 1. Discovery - Find watering holes
	 * 2. Listening - Extract verbatim content
	 * 3. Classification - Categorize by sophistication/awareness
	 * 4. Avatar - Build 9-dimension Dream Buyer Avatar
	 * 5. Problem - Identify hair-on-fire problem
	 * 6. HVCO - Generate title variants
	 */
	async startHaloResearchV2(projectId: string, topic: string, userId: string, runId: string, additionalContext?: {
		targetAudience?: string;
		productDescription?: string;
	}) {
		console.log("RPC startHaloResearchV2 called", { projectId, topic, userId, runId, additionalContext });

		// @ts-ignore - V2 workflow binding
		if (!this.env.HALO_RESEARCH_WORKFLOW_V2) {
			// Fall back to V1 if V2 not configured
			console.log("V2 workflow not available, falling back to V1");
			return this.startHaloResearch(projectId, topic, userId, runId, additionalContext);
		}

		const workflowId = runId;

		// @ts-ignore - V2 workflow binding
		await this.env.HALO_RESEARCH_WORKFLOW_V2.create({
			id: workflowId,
			params: {
				projectId,
				topic,
				userId,
				runId,
				additionalContext
			}
		});

		return { success: true, workflowId, status: 'started', version: 'v2' };
	}
}
