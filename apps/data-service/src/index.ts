import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app';
import { initDatabase, getDb } from '@repo/data-ops/database';
import { CriticAgent } from '@repo/agent-system';
import { spokes, spoke_evaluations } from '@repo/data-ops/schema';
import { eq } from 'drizzle-orm';

// Workflows
export { HaloResearchWorkflowV2 } from '@/workflows/halo-workflow-v2'; // 6-phase multi-agent workflow
export { HaloResearchWorkflowV2 as HaloResearchWorkflow } from '@/workflows/halo-workflow-v2'; // Alias for compatibility
export { GoldenPheasantWorkflow } from '@/workflows/golden-pheasant-workflow';
export { GodfatherOfferWorkflow } from '@/workflows/godfather-offer-workflow';
export { SpokeGenerationWorkflow } from '@/workflows/spoke-generation-workflow';
export { CloneSpokeWorkflow } from '@/workflows/clone-spoke-workflow';

// Durable Objects
export { ChatSession } from "./do/ChatSession";
export { IngestionTracker } from "./do/IngestionTracker"; // Export IngestionTracker

/**
 * Validate session token from Better Auth cookie
 * Returns user info if valid, null otherwise
 */
async function validateSession(db: D1Database, cookieHeader: string | null): Promise<{ userId: string; accountId: string } | null> {
	if (!cookieHeader) return null;

	// Extract session token from cookie
	const secureMatch = cookieHeader.match(/__Secure-better-auth\.session_token=([^;]+)/);
	const plainMatch = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
	const token = secureMatch?.[1] || plainMatch?.[1];

	if (!token) return null;

	try {
		const session = await db.prepare(`
			SELECT s.user_id, u.account_id
			FROM session s
			JOIN user u ON s.user_id = u.id
			WHERE s.token = ?
			AND s.expires_at > ?
			LIMIT 1
		`).bind(decodeURIComponent(token), Math.floor(Date.now() / 1000)).first<{
			user_id: string;
			account_id: string | null;
		}>();

		if (!session) return null;

		return {
			userId: session.user_id,
			accountId: session.account_id || session.user_id,
		};
	} catch (error) {
		console.error('Session validation error:', error);
		return null;
	}
}

export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env)
		initDatabase(env.DB)
	}

	async fetch(request: Request) {
		const url = new URL(request.url);

		// Internal ingest endpoint (service-to-service, no auth required)
		if (request.method === "POST" && url.pathname === "/api/internal/ingest") {
			try {
				const { upsertKnowledge } = await import("@repo/agent-logic/rag");
				const body = await request.json() as { items: any[] };
				if (!body.items || !Array.isArray(body.items)) {
					return new Response("Invalid body: 'items' array required", { status: 400 });
				}
				const count = await upsertKnowledge(this.env, body.items);
				return new Response(JSON.stringify({ success: true, count }), { headers: { "Content-Type": "application/json" } });
			} catch (error) {
				console.error('Ingest error:', error);
				return new Response(JSON.stringify({ error: 'Ingest failed' }), { status: 500, headers: { "Content-Type": "application/json" } });
			}
		}

		// WebSocket endpoint for IngestionTracker DO - REQUIRES AUTH + TENANT VALIDATION
		if (url.pathname.startsWith("/ws/ingestion/")) {
			try {
				// Extract accountId from URL path
				const pathAccountId = url.pathname.split("/")[3];
				if (!pathAccountId) {
					return new Response(JSON.stringify({ error: "Missing accountId" }), { status: 400, headers: { "Content-Type": "application/json" } });
				}

				// Validate session and get user's accountId
				const cookieHeader = request.headers.get('cookie');
				const session = await validateSession(this.env.DB, cookieHeader);

				if (!session) {
					return new Response(JSON.stringify({ error: "Unauthorized: Invalid or missing session" }), { status: 401, headers: { "Content-Type": "application/json" } });
				}

				// CRITICAL: Validate tenant access - user can only access their own ingestion tracker
				if (pathAccountId !== session.accountId && pathAccountId !== session.userId) {
					console.warn(`Cross-tenant ingestion access blocked: user ${session.userId} (account ${session.accountId}) tried to access account ${pathAccountId}`);
					return new Response(JSON.stringify({ error: "Forbidden: Access denied to this account's ingestion tracker" }), { status: 403, headers: { "Content-Type": "application/json" } });
				}

				// Check if INGESTION_TRACKER binding exists
				if (!this.env.INGESTION_TRACKER) {
					console.error('INGESTION_TRACKER binding is missing');
					return new Response(JSON.stringify({ error: "Service unavailable" }), { status: 503, headers: { "Content-Type": "application/json" } });
				}

				// Get Durable Object and forward request
				const id = this.env.INGESTION_TRACKER.idFromName(pathAccountId);
				const stub = this.env.INGESTION_TRACKER.get(id);
				return stub.fetch(request);
			} catch (error) {
				console.error('Ingestion WebSocket error:', error);
				return new Response(JSON.stringify({ error: "Service error" }), { status: 500, headers: { "Content-Type": "application/json" } });
			}
		}

		// All other routes handled by Hono app (which has its own auth middleware)
		return App.fetch(request, this.env, this.ctx)
	}

	async queue(batch: MessageBatch<unknown>) {
		// Queue handler for smart-data-queue
		console.log('Processed queue batch', batch.queue);
	}

	// RPC Method to broadcast Hub status updates via IngestionTracker DO
	async broadcastHubStatus(accountId: string, hubId: string, status: string, message?: string) {
		console.log(`RPC broadcastHubStatus called for account ${accountId}, hub ${hubId}, status ${status}`);
		if (!this.env.INGESTION_TRACKER) {
			throw new Error("INGESTION_TRACKER binding is missing in Data Service");
		}

		const id = this.env.INGESTION_TRACKER.idFromName(accountId);
		const stub = this.env.INGESTION_TRACKER.get(id);

		await stub.fetch("http://do/broadcast", { // 'http://do/broadcast' is a convention for DO internal requests
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ hubId, status, message }),
		});
		return { success: true };
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
		// @ts-ignore
		if (!this.env.HALO_RESEARCH_WORKFLOW && !this.env.HALO_RESEARCH_WORKFLOW_V2) {
			throw new Error("HALO_RESEARCH_WORKFLOW binding is missing in Data Service");
		}

		// Use the explicit runId passed from the frontend for traceability
		const workflowId = runId;

		// @ts-ignore
		const workflow = this.env.HALO_RESEARCH_WORKFLOW || this.env.HALO_RESEARCH_WORKFLOW_V2;

		await workflow.create({
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

	

	    	async startSpokeGeneration(hubId: string, runId: string) {

	

	            console.log("RPC startSpokeGeneration called", { hubId, runId });

	

	    

	

	            // @ts-ignore

	

	            if (!this.env.SPOKE_GENERATION_WORKFLOW) {

	

	                throw new Error("SPOKE_GENERATION_WORKFLOW binding is missing in Data Service");

	

	            }

	

	    

	

	            const workflowId = runId;

	

	    

	

	            // @ts-ignore

	

	            await this.env.SPOKE_GENERATION_WORKFLOW.create({

	

	                id: workflowId,

	

	                params: {

	

	                    hubId,

	

	                    runId,

	

	                }

	

	            });

	

	    

	

	            return { success: true, workflowId, status: 'started' };

	

	        }

	

	    

	

	        async evaluateSpoke(spokeId: string) {

	

	            console.log("RPC evaluateSpoke called", { spokeId });

	

	    

	

	            const db = initDatabase(this.env.DB);

	

	            const spoke = await db.select().from(spokes).where(eq(spokes.id, spokeId)).get();

	

	            if (!spoke) {

	

	                throw new Error("Spoke not found");

	

	            }

	

	    

	

	                    // Initialize Critic Agent with AI and Vectorize bindings from Data Service Env

	

	    

	

	                    // Note: AI and VECTORIZE must be bound in wrangler.toml/jsonc of data-service

	

	    

	

	                    const critic = new CriticAgent(this.env.AI as any, this.env.VECTORIZE as any, this.env.DB as any);

	

	    

	

	                    

	

	    

	

	                    const evaluation = await critic.evaluate(spoke, spoke.client_id);

	

	    

	

	            

	

	            

	

	            await db.insert(spoke_evaluations).values({

	

	                id: evaluation.spokeId,

	

	                spoke_id: evaluation.spokeId,

	

	                client_id: spoke.client_id,

	

	                g2_score: evaluation.g2.score,

	

	                g2_breakdown: JSON.stringify(evaluation.g2.breakdown),

	

	                g4_result: evaluation.g4.result,

	

	                g4_violations: JSON.stringify(evaluation.g4.violations),

	

	                g4_similarity_score: evaluation.g4.cosineSimilarity,

	

	                                	                                	                g5_result: evaluation.g5.result,

	

	                                	                                	                g5_violations: JSON.stringify(evaluation.g5.violations),

	

	                                	                                	                g7_score: evaluation.g7.score,

	

	                                	                                	                overall_pass: evaluation.overallPass ? 1 : 0,

	

	                                	                                	                critic_notes: evaluation.feedback,

	

	                                	                                	            }).onConflictDoUpdate({

	

	                                	                                	                target: spoke_evaluations.id,

	

	                                	                                	                set: {

	

	                                	                                	                    g2_score: evaluation.g2.score,

	

	                                	                                	                    g2_breakdown: JSON.stringify(evaluation.g2.breakdown),

	

	                                	                                	                    g4_result: evaluation.g4.result,

	

	                                	                                	                    g4_violations: JSON.stringify(evaluation.g4.violations),

	

	                                	                                	                    g4_similarity_score: evaluation.g4.cosineSimilarity,

	

	                                	                                	                    g5_result: evaluation.g5.result,

	

	                                	                                	                    g5_violations: JSON.stringify(evaluation.g5.violations),

	

	                                	                                	                    g7_score: evaluation.g7.score,

	

	                                	                                	                    overall_pass: evaluation.overallPass ? 1 : 0,

	

	                                	                                	                    critic_notes: evaluation.feedback,

	

	                                	                                	                }

	

	                                	                                	            });

	

	                

	

	    

	

	            	            return evaluation;

	

	                

	

	    

	

	            

	

	                

	

	    

	

	            	        }

	

	                

	

	    

	

	            

	

	                

	

	    

	

	            	    

	

	                

	

	    

	

	            

	

	                

	

	    

	

	            	async startCloneSpoke(params: {
		spokeId: string;
		numVariations: number;
		platforms: string[];
		varyAngle: boolean;
		runId: string;
	}) {
		console.log("RPC startCloneSpoke called", params);

		// @ts-ignore
		if (!this.env.CLONE_SPOKE_WORKFLOW) {
			throw new Error("CLONE_SPOKE_WORKFLOW binding is missing in Data Service");
		}

		const workflowId = params.runId;

		// @ts-ignore
		await this.env.CLONE_SPOKE_WORKFLOW.create({
			id: workflowId,
			params
		});

		return { success: true, workflowId, status: 'started' };
	}
}

	
