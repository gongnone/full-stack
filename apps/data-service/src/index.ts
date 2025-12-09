import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app';
import { initDatabase } from '@repo/data-ops/database';
import { QueueMessageSchema } from '@repo/data-ops/zod-schema/queue';
import { handleLinkClick } from './queue-handlers/link-clicks';
export { DestinationEvaluationWorkflow } from '@/workflows/destination-evalutation-workflow';
export { EvaluationScheduler } from "@/durable-objects/evaluation-scheduler";
export { LinkClickTracker } from "@/durable-objects/link-click-tracker";

export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env)
		initDatabase(env.DB)
	}
	fetch(request: Request) {
		return App.fetch(request, this.env, this.ctx)
	}

	async queue(batch: MessageBatch<unknown>) {
		if (batch.queue === "social-media-generation-queue") {
			const OpenAI = (await import("openai")).default;
			// Env "OPENAI_API_KEY" needs to be set via wrangler secret
			const openai = new OpenAI({ apiKey: (this.env as any).OPENAI_API_KEY });

			for (const message of batch.messages) {
				try {
					const body = message.body as { generationId: string, type: string, prompt: string };
					if (!body.generationId) continue;

					let output = "";
					let usage = { prompt_tokens: 0, completion_tokens: 0 };

					// 1. Call OpenAI
					switch (body.type) {
						case "tweet":
							const chatCompletion = await openai.chat.completions.create({
								messages: [
									{ role: "system", content: "You are a viral social media expert. Write a punchy tweet based on this prompt." },
									{ role: "user", content: body.prompt || "Write a tweet about AI" }
								],
								model: "gpt-4o",
							});
							output = chatCompletion.choices[0].message.content || "";
							if (chatCompletion.usage) {
								usage = {
									prompt_tokens: chatCompletion.usage.prompt_tokens,
									completion_tokens: chatCompletion.usage.completion_tokens,
								};
							}
							break;
						case "image":
							// Images don't have tokens in the same way, usually fixed price ($0.04)
							const image = await openai.images.generate({
								model: "dall-e-3",
								prompt: body.prompt || "Abstract AI art",
							});
							output = image.data[0].url || "";
							// Fixed cost for DALL-E 3 standard
							usage = { prompt_tokens: 0, completion_tokens: 0 };
							// We will handle cost assignment below since it's usage-based there.
							// Actually, let's override cost for images specifically or use a cost variable.
							break;
						case "offer_architect":
							console.log("Starting Offer Architect run...");
							const thread = await openai.beta.threads.create();
							await openai.beta.threads.messages.create(thread.id, {
								role: "user",
								content: body.prompt || "Create an offer for me",
							});

							const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
								assistant_id: "asst_wEZOpZbqE1l9nuO9BIuB4HCA",
							});

							if (run.status === "completed") {
								const messages = await openai.beta.threads.messages.list(run.thread_id);
								const lastMsg = messages.data[0];
								if (lastMsg.role === "assistant" && lastMsg.content[0].type === "text") {
									output = lastMsg.content[0].text.value;
								} else {
									output = "No text response found.";
								}
								// Capture Usage
								if (run.usage) {
									usage = {
										prompt_tokens: run.usage.prompt_tokens,
										completion_tokens: run.usage.completion_tokens,
									};
								}
							} else {
								throw new Error(`Run didn't complete. Status: ${run.status}`);
							}
							break;
						case "video_script":
							throw new Error("Video generation requires external Webhooks (Coming Soon)");
						default:
							output = "Unknown type";
					}

					// Cost Calculation
					let cost = 0;
					if (body.type === 'image') {
						cost = 0.040; // Fixed price for DALL-E 3
					} else {
						// GPT-4o approx
						cost = (usage.prompt_tokens * 0.000005) + (usage.completion_tokens * 0.000015);
					}

					// 2. Update DB
					const db = initDatabase(this.env.DB);
					const { updateGeneration } = await import("@repo/data-ops/queries/generations");

					await updateGeneration(db, body.generationId, {
						status: "completed",
						output: output,
						usagePromptTokens: usage.prompt_tokens,
						usageCompletionTokens: usage.completion_tokens,
						costEstimatedUsd: cost,
						providerMetadata: JSON.stringify(usage),
					});

					console.log(`Processed generation ${body.generationId}`);
				} catch (err: any) {
					console.error("Generation failed", err);
					const db = initDatabase(this.env.DB);
					const { updateGeneration } = await import("@repo/data-ops/queries/generations");
					if ((message.body as any).generationId) {
						await updateGeneration(db, (message.body as any).generationId, {
							status: "failed",
							output: err.message || "Unknown error"
						});
					}
				}
				message.ack();
			}
			return;
		}

		// Existing Link Click Logic
		for (const message of batch.messages) {
			const parsedEvent = QueueMessageSchema.safeParse(message.body);
			if (parsedEvent.success) {
				const event = parsedEvent.data;
				if (event.type === "LINK_CLICK") {
					await handleLinkClick(this.env, event)
				}
			} else {
				console.error(parsedEvent.error)
			}
		}
	}


}
