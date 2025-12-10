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

        // HYDRATION: Send full history and current phase on connection
        webSocket.send(JSON.stringify({
            type: 'init',
            messages: this.messages,
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
        const systemPrompt = this.constructSystemPrompt(context) + this.getInstructions();

        // 3. Update History
        this.messages.push({ role: "user", content: userMessage });
        await this.saveState();

        console.log('3. Calling OpenAI (Workers AI)...');

        // 4. Call LLM with Sliding Window Context
        // Take system prompt + last 20 messages
        const slidingWindowMessages = [
            { role: "system", content: systemPrompt },
            ...this.messages.slice(-20)
        ];

        const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: slidingWindowMessages,
            max_tokens: 2048
        });

        const output = (response as any).response || "";

        // 5. Save Assistant Response to History
        this.messages.push({ role: "assistant", content: output });
        await this.saveState();

        // 6. Check for tool usage / phase completion
        try {
            if (output.trim().startsWith('{')) {
                const action = JSON.parse(output);

                if (action.tool === "completePhase") {
                    const result = await this.completePhase(action.summary, action.nextPhaseData);
                    this.messages.push({ role: "system", content: result });
                    await this.saveState();
                    return result;
                }

                if (action.tool === "finalizeCampaign") {
                    const result = await this.finalizeCampaign(action.name, action.brandVoice);
                    this.messages.push({ role: "system", content: result });
                    await this.saveState();
                    return result;
                }

                if (action.tool === "searchWeb") {
                    const searchResults = await performWebSearch(action.query, this.env.TAVILY_API_KEY || "no-key");
                    const result = `[System: Performed live web search for '${action.query}'. Results: ${searchResults.substring(0, 1500)}...]`;

                    // Feed back to model (recurse one level)
                    this.messages.push({ role: "system", content: result });
                    await this.saveState();

                    const followUpMessages = [
                        { role: "system", content: systemPrompt },
                        ...this.messages.slice(-20)
                    ];

                    const followUp = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
                        messages: followUpMessages,
                        max_tokens: 2048,
                        tools: [
                            {
                                name: "searchWeb",
                                description: "Search the web for information.",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        query: {
                                            type: "string",
                                            description: "The search query.",
                                        },
                                    },
                                    required: ["query"],
                                },
                            },
                        ],
                    });

                    const followUpOutput = (followUp as any).response || "";
                    this.messages.push({ role: "assistant", content: followUpOutput });
                    await this.saveState();
                    return followUpOutput;
                }
            }
        } catch (e) {
            // Not JSON
        }

        return output;
    }

    getInstructions(): string {
        return `
        \n\nSYSTEM INSTRUCTIONS:
        1. If you are done with a phase (research/offer), output JSON: { "tool": "completePhase", "summary": "...", "nextPhaseData": { ... } }
        2. If you need to search the web for information (e.g., market stats, competitor info), output JSON: { "tool": "searchWeb", "query": "..." }
        3. If you are in the 'content' phase and have finalized the Brand Voice and strategy, output JSON: { "tool": "finalizeCampaign", "name": "Campaign Name", "brandVoice": { ... } }
        4. If the user says "ULTRATEST", immediately generate the final mock data and output the "completePhase" JSON tool call.
        
        5. GROUNDING & KNOWLEDGE:
           - You HAVE ACCESS to the user's project context via the "RELEVANT KNOWLEDGE" section below.
           - Treat "RELEVANT KNOWLEDGE" as your primary source of truth.
           - If the user asks about specific files or folders, consult "RELEVANT KNOWLEDGE".
           - NEVER apologize for "not having access" to transcripts or documentation. You DO have access to the text provided below.
           - If the answer is not in the context, say "I don't see that in my current knowledge base" instead of guessing or apologizing for your nature as an AI.

        Maintain the persona defined above.
        `;
    }

    constructSystemPrompt(ragContext: string): string {
        let basePrompt = (PHASE_PROMPTS as any)[this.currentPhase] || "You are a helpful assistant.";

        if (this.currentPhase === "offer" && this.phaseData.research) {
            basePrompt += `\n\nCONTEXT FROM RESEARCH PHASE:\nTarget Audience: ${this.phaseData.research.audience}\nSummary: ${this.phaseData.research.summary}`;
        } else if (this.currentPhase === "content" && this.phaseData.offer) {
            basePrompt += `\n\nCONTEXT FROM OFFER PHASE:\nSummary: ${this.phaseData.offer.summary}\nPrice: ${this.phaseData.offer.price}`;
        }

        basePrompt += `\n\nRELEVANT KNOWLEDGE:\n${ragContext}`;
        return basePrompt;
    }

    async completePhase(summary: string, data: any): Promise<string> {
        if (this.currentPhase === "research") {
            this.phaseData.research = { summary, audience: data.audience || "Unknown" };
            this.currentPhase = "offer";
            await this.saveState();
            return `[System: Phase 'research' completed. Switching to 'offer'.] Based on your research about ${this.phaseData.research.audience}, let's build your offer.`;
        } else if (this.currentPhase === "offer") {
            this.phaseData.offer = { summary, price: data.price || 0 };
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
            researchData: this.phaseData.research,
            offerData: this.phaseData.offer,
            brandVoice: brandVoice,
        });

        return `[System: Campaign '${name}' saved successfully with ID: ${campaignId}. You can now use this context in the Generator.]`;
    }
}
