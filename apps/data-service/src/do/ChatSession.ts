import { DurableObject } from "cloudflare:workers";
import { searchKnowledge } from "@repo/agent-logic/rag";
import { PHASE_PROMPTS } from "@repo/agent-logic/prompts";
import { performWebSearch } from "@repo/agent-logic/tools";

// Define Phase Data Interface
interface PhaseData {
    research?: { summary: string; audience: string };
    offer?: { summary: string; price: number };
}

export class ChatSession extends DurableObject<Env> {
    currentPhase: string = "research"; // Start at research
    phaseData: PhaseData = {};
    messages: { role: string, content: string }[] = [];
    sessions: Map<WebSocket, any> = new Map();

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.ctx.blockConcurrencyWhile(async () => {
            this.currentPhase = (await this.ctx.storage.get("currentPhase")) as string || "research";
            this.phaseData = (await this.ctx.storage.get("phaseData")) as PhaseData || {};
            this.messages = (await this.ctx.storage.get("messages")) as { role: string, content: string }[] || [];
        });
    }

    async fetch(request: Request) {
        if (request.headers.get("Upgrade") === "websocket") {
            const pair = new WebSocketPair();
            await this.handleSession(pair[1]);
            return new Response(null, { status: 101, webSocket: pair[0] });
        }

        if (request.method === "POST") {
            const { message, phase } = await request.json() as any;
            if (phase) {
                this.currentPhase = phase;
                await this.saveState();
            }
            const response = await this.message(message);
            return new Response(response);
        }
        return new Response("ChatSession DO", { status: 200 });
    }

    async saveState() {
        await this.ctx.storage.put("currentPhase", this.currentPhase);
        await this.ctx.storage.put("phaseData", this.phaseData);
        await this.ctx.storage.put("messages", this.messages);
    }

    async handleSession(webSocket: WebSocket) {
        this.ctx.acceptWebSocket(webSocket);
        this.sessions.set(webSocket, { connectedAt: Date.now() });

        // Filter out internal system messages (like raw search results) before sending to UI
        const visibleMessages = this.messages.filter(msg =>
            !(msg.role === "system" && msg.content.startsWith("[System: Performed live web search"))
        );

        // HYDRATION: Send full history and current phase on connection
        webSocket.send(JSON.stringify({
            type: 'init',
            messages: visibleMessages,
            phase: this.currentPhase
        }));
    }

    async webSocketMessage(webSocket: WebSocket, message: string | ArrayBuffer) {
        try {
            console.log('1. Message Received:', message);
            const data = JSON.parse(message as string);
            if (data.type === 'message') {
                const userMessage = data.content;
                const response = await this.message(userMessage);
                webSocket.send(JSON.stringify({ type: 'message', content: response }));
            }
        } catch (err: any) {
            console.error('ChatSession Error:', err);
            webSocket.send(JSON.stringify({ type: 'error', message: err.message || 'Unknown error' }));
        }
    }

    async webSocketClose(webSocket: WebSocket, code: number, reason: string, wasClean: boolean) {
        this.sessions.delete(webSocket);
    }

    async message(userMessage: string) {
        // DEBUG TOOL: Direct access to RAG
        if (userMessage.startsWith("/debug-rag")) {
            const query = userMessage.replace("/debug-rag", "").trim();
            const context = await searchKnowledge(query, this.env as any, this.currentPhase);
            return `[DEBUG RAG RESULT]\nQuery: ${query}\nPhase: ${this.currentPhase}\nResults found: ${context.length > 0 ? "YES" : "NO"}\n\nContent Preview:\n${context.substring(0, 500)}...`;
        } else if (userMessage.startsWith("/clear")) {
            this.messages = [];
            this.currentPhase = "research";
            this.phaseData = {};
            await this.ctx.storage.deleteAll();
            return "[System: Memory cleared]";
        }

        console.log('2. Running RAG Search...');
        // 1. Retrieve relevant context
        const context = await searchKnowledge(userMessage, this.env as any, this.currentPhase);
        console.log(`[ChatSession] RAG Context Length: ${context.length}`);

        // 2. Construct System Prompt with Instructions
        const systemPrompt = this.constructSystemPrompt(context, true);

        // 3. Update History
        this.messages.push({ role: "user", content: userMessage });
        await this.saveState();

        console.log('3. Calling OpenAI (Workers AI) with Tools...');

        // Tool Definitions
        const tools = [
            {
                name: "searchWeb",
                description: "Search the web for live information (prices, competitors, trends).",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query (e.g. 'ClickFunnels pricing 2024').",
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "completePhase",
                description: "Mark the current phase as complete. YOU MUST PROVIDE 'audience' (if research) or 'price' (if offer).",
                parameters: {
                    type: "object",
                    properties: {
                        summary: { type: "string", description: "Summary of the phase findings." },
                        audience: { type: "string", description: "REQUIRED for Research Phase: The defined target audience (e.g. 'High-income moms')." },
                        price: { type: "number", description: "REQUIRED for Offer Phase: The defined price point (e.g. 97)." }
                    },
                    required: ["summary"]
                }
            },
            {
                name: "finalizeCampaign",
                description: "Finalize the campaign content.",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        brandVoice: { type: "object" }
                    },
                    required: ["name"]
                }
            }
        ];

        // 4. First Call with Tools
        const slidingWindowMessages = [
            { role: "system", content: systemPrompt },
            ...this.messages.slice(-20)
        ];

        const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: slidingWindowMessages,
            tools: tools,
            tool_choice: "auto", // Auto-select helpful tool
            max_tokens: 4096
        } as any);

        // Handle Response (Check for Tool Calls)
        // Note: CF Workers AI response structure for tools may vary, handling standard OpenAI-like or JSON output
        let output = (response as any).response || "";
        let toolCalls = (response as any).tool_calls;

        // Fallback: Check if output is a JSON string simulating a tool call (Legacy Prompt Support)
        if (!toolCalls && output.trim().startsWith('{')) {
            try {
                const legacyAction = JSON.parse(output);
                if (legacyAction.tool) {
                    toolCalls = [{
                        name: legacyAction.tool,
                        arguments: legacyAction
                    }];
                }
            } catch (e) { /* Not JSON */ }
        }

        // 5. Process Tool Calls (Loop)
        if (toolCalls && toolCalls.length > 0) {
            console.log('⚡ Handling Tool Calls:', JSON.stringify(toolCalls));

            // Allow multiple tool calls, but usually just one
            for (const call of toolCalls) {
                const toolName = call.name;
                const args = call.arguments;

                if (toolName === "searchWeb") {
                    console.log('⚡ Executing Search Tool for:', args.query);
                    const searchResults = await performWebSearch(args.query, this.env.TAVILY_API_KEY || "no-key");

                    // Append Tool Result
                    const toolResultMsg = `[System: Performed live web search for '${args.query}'. Results: ${searchResults.formattedOutput.substring(0, 1500)}...]`;
                    this.messages.push({ role: "system", content: toolResultMsg });
                    await this.saveState();

                    // 6. Second Call (Final Answer)
                    console.log('4. Calling OpenAI (Second Pass with Results)...');

                    // Re-construct prompt WITHOUT tool instructions to prevent JSON hallucinations
                    const strictSystemPrompt = this.constructSystemPrompt(context, false);

                    const followUpMessages = [
                        { role: "system", content: strictSystemPrompt },
                        ...this.messages.slice(-20)
                    ];

                    const followUpResponse = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
                        messages: followUpMessages,
                        // tools: tools - Removed to force text response
                        max_tokens: 4096
                    } as any);

                    output = (followUpResponse as any).response || "";

                }
                else if (toolName === "completePhase") {
                    const result = await this.completePhase(args.summary, args.audience, args.price);
                    this.messages.push({ role: "system", content: result });
                    await this.saveState();
                    return result;
                }
                else if (toolName === "finalizeCampaign") {
                    const result = await this.finalizeCampaign(args.name, args.brandVoice);
                    this.messages.push({ role: "system", content: result });
                    await this.saveState();
                    return result;
                }
            }
        }

        // 7. Save and Return Final Assistant Response
        this.messages.push({ role: "assistant", content: output });
        await this.saveState();

        return output;
    }

    getInstructions(toolsEnabled: boolean): string {
        const baseInstructions = `
        Maintain the persona defined above.
        `;

        if (toolsEnabled) {
            return `
            \n\nSYSTEM INSTRUCTIONS:
            1. If you are done with a phase (research/offer), output JSON: { "tool": "completePhase", "summary": "...", "audience": "...", "price": ... }
            2. If you need to search the web for information (e.g., market stats, competitor info), output JSON: { "tool": "searchWeb", "query": "..." }
            3. If you are in the 'content' phase and have finalized the Brand Voice and strategy, output JSON: { "tool": "finalizeCampaign", "name": "Campaign Name", "brandVoice": { ... } }
            4. If the user says "ULTRATEST", immediately generate the final mock data and output the "completePhase" JSON tool call.
            ${baseInstructions}
            `;
        } else {
            return `
            \n\nSYSTEM INSTRUCTIONS:
            1. You have just performed a web search and received the results (in the system history).
            2. Do NOT output JSON. Do NOT trying to search again.
            3. Synthesize the search results into a comprehensive, text-based answer for the user.
            ${baseInstructions}
            `;
        }
    }

    constructSystemPrompt(ragContext: string, toolsEnabled: boolean = true): string {
        let basePrompt = (PHASE_PROMPTS as any)[this.currentPhase] || "You are a helpful assistant.";

        if (this.currentPhase === "offer" && this.phaseData.research) {
            basePrompt += `\n\nCONTEXT FROM RESEARCH PHASE:\nTarget Audience: ${this.phaseData.research.audience}\nSummary: ${this.phaseData.research.summary}`;
        } else if (this.currentPhase === "content" && this.phaseData.offer) {
            basePrompt += `\n\nCONTEXT FROM OFFER PHASE:\nSummary: ${this.phaseData.offer.summary}\nPrice: ${this.phaseData.offer.price}`;
        }

        // Inject Internal Knowledge (Silent context)
        if (ragContext && ragContext.length > 0) {
            basePrompt += `\n\n### ACTIVE MEMORY (Internal Knowledge):\n${ragContext}`;
        }

        return basePrompt + this.getInstructions(toolsEnabled);
    }

    async completePhase(summary: string, audience?: string, price?: number): Promise<string> {
        if (this.currentPhase === "research") {
            this.phaseData.research = { summary, audience: audience || "Unknown" };
            this.currentPhase = "offer";
            await this.saveState();
            return `[System: Phase 'research' completed. Switching to 'offer'.] Based on your research about ${this.phaseData.research.audience}, let's build your offer.`;
        } else if (this.currentPhase === "offer") {
            this.phaseData.offer = { summary, price: price || 0 };
            this.currentPhase = "content";
            await this.saveState();
            return `[System: Phase 'offer' completed. Switching to 'content'.] Great, with an offer price of $${this.phaseData.offer.price}, let's write some content.`;
        } else {
            return `[System: Phase '${this.currentPhase}' completed.]`;
        }
    }

    async finalizeCampaign(name: string, brandVoice: any): Promise<string> {
        const { initDatabase } = await import("@repo/data-ops/database");
        const { campaigns } = await import("@repo/data-ops/schema");
        const db = initDatabase(this.env.DB);
        const { nanoid } = await import("nanoid");

        const campaignId = nanoid();

        await db.insert(campaigns).values({
            id: campaignId,
            userId: "user_test",
            name: name,
            researchData: JSON.stringify(this.phaseData.research),
            offerData: JSON.stringify(this.phaseData.offer),
            brandVoice: JSON.stringify(brandVoice),
        });

        return `[System: Campaign '${name}' saved successfully with ID: ${campaignId}. You can now use this context in the Generator.]`;
    }
}
