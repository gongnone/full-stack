import { DurableObject } from "cloudflare:workers";
import { searchKnowledge } from "@repo/agent-logic/rag";
import { PHASE_PROMPTS } from "@repo/agent-logic/prompts";



// Define Phase Data Interface
interface PhaseData {
    research?: { summary: string; audience: string };
    offer?: { summary: string; price: number };
}

export class ChatSession extends DurableObject<Env> {
    currentPhase: string = "research"; // Start at research
    phaseData: PhaseData = {};
    sessions: Map<WebSocket, any> = new Map();

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
    }

    async fetch(request: Request) {
        if (request.headers.get("Upgrade") === "websocket") {
            const pair = new WebSocketPair();
            await this.handleSession(pair[1]);
            return new Response(null, { status: 101, webSocket: pair[0] });
        }

        if (request.method === "POST") {
            const { message, phase } = await request.json() as any;
            if (phase) this.currentPhase = phase;
            const response = await this.message(message);
            return new Response(response);
        }
        return new Response("ChatSession DO", { status: 200 });
    }

    async handleSession(webSocket: WebSocket) {
        this.ctx.acceptWebSocket(webSocket);
        this.sessions.set(webSocket, { connectedAt: Date.now() });
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

    history: { role: string, content: string }[] = [];

    async message(userMessage: string) {
        // DEBUG TOOL: Direct access to RAG
        if (userMessage.startsWith("/debug-rag")) {
            const query = userMessage.replace("/debug-rag", "").trim();
            const context = await searchKnowledge(query, this.env, this.currentPhase);
            return `[DEBUG RAG RESULT]\nQuery: ${query}\nPhase: ${this.currentPhase}\nResults found: ${context.length > 0 ? "YES" : "NO"}\n\nContent Preview:\n${context.substring(0, 500)}...`;
        } else if (userMessage.startsWith("/clear")) {
            this.history = [];
            return "[System: Memory cleared]";
        }

        console.log('2. Running RAG Search...');
        // 1. Retrieve relevant context
        // Search current phase AND previous phases if needed, but primarily current phase knowledge base
        const context = await searchKnowledge(userMessage, this.env, this.currentPhase);
        console.log(`[ChatSession] RAG Context Length: ${context.length}`);
        if (context.length > 0) {
            console.log(`[ChatSession] RAG Context Preview: ${context.substring(0, 100)}...`);
        }

        // 2. Construct System Prompt with History/Context
        // We do NOT bake the user message into this anymore.
        const systemPrompt = this.constructSystemPrompt(context);

        // 3. Add Instructions as a wrapper or suffix to system prompt
        // Llama 3 instruction following is best when instructions are clear in system or very last user message.
        // We'll append it to system prompt.
        const specializedInstructions = `
        \n\nSYSTEM INSTRUCTIONS:
        1. If you are done with a phase (research/offer), output JSON: { "tool": "completePhase", "summary": "...", "nextPhaseData": { ... } }
        2. If you need to search the web for information (e.g., market stats, competitor info), output JSON: { "tool": "searchWeb", "query": "..." }
        3. If you are in the 'content' phase and have finalized the Brand Voice and strategy, output JSON: { "tool": "finalizeCampaign", "name": "Campaign Name", "brandVoice": { ... } }
        4. If the user says "ULTRATEST", immediately generate the final mock data and output the "completePhase" JSON tool call.
        
        Maintain the persona defined above.
        `;

        const finalSystemPrompt = systemPrompt + specializedInstructions;

        // 4. Update History
        this.history.push({ role: "user", content: userMessage });

        // Optimize history size - keep last 20 messages to prevent token overflow
        if (this.history.length > 20) {
            this.history = this.history.slice(this.history.length - 20);
        }

        console.log('3. Calling OpenAI (Workers AI)...');

        const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: [
                { role: "system", content: finalSystemPrompt },
                ...this.history
            ]
        });

        const output = (response as any).response || "";

        // 5. Save Assistant Response to History
        this.history.push({ role: "assistant", content: output });

        // 6. Check for tool usage / phase completion
        try {
            // Naive check for JSON output for tool call
            if (output.trim().startsWith('{')) {
                const action = JSON.parse(output);

                if (action.tool === "completePhase") {
                    const result = this.completePhase(action.summary, action.nextPhaseData);
                    // Add system result to history so model knows it happened
                    this.history.push({ role: "system", content: result });
                    return result;
                }

                if (action.tool === "finalizeCampaign") {
                    const result = await this.finalizeCampaign(action.name, action.brandVoice);
                    this.history.push({ role: "system", content: result });
                    return result;
                }

                if (action.tool === "searchWeb") {
                    const searchResults = await searchKnowledge(action.query, this.env);
                    const result = `[System: Performed search for '${action.query}'. Results: ${searchResults.substring(0, 500)}... (Simulated via Knowledge Base)]`;

                    // We need to feed this back to the model to get a natural response
                    this.history.push({ role: "system", content: result });

                    // Recursive call (one level deep) to get the AI explanation
                    const followUp = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
                        messages: [
                            { role: "system", content: finalSystemPrompt },
                            ...this.history
                        ]
                    });

                    const followUpOutput = (followUp as any).response || "";
                    this.history.push({ role: "assistant", content: followUpOutput });
                    return followUpOutput;
                }
            }
        } catch (e) {
            // Not JSON or failed to parse, assume normal text response
        }

        return output;
    }

    constructSystemPrompt(ragContext: string): string {
        let basePrompt = (PHASE_PROMPTS as any)[this.currentPhase] || "You are a helpful assistant.";

        // Inject Previous Phase Context
        if (this.currentPhase === "offer" && this.phaseData.research) {
            basePrompt += `\n\nCONTEXT FROM RESEARCH PHASE:\nTarget Audience: ${this.phaseData.research.audience}\nSummary: ${this.phaseData.research.summary}`;
        } else if (this.currentPhase === "content" && this.phaseData.offer) {
            basePrompt += `\n\nCONTEXT FROM OFFER PHASE:\nSummary: ${this.phaseData.offer.summary}\nPrice: ${this.phaseData.offer.price}`;
        }

        // Inject RAG Context
        basePrompt += `\n\nRELEVANT KNOWLEDGE:\n${ragContext}`;

        return basePrompt;
    }

    completePhase(summary: string, data: any): string {
        // Save data to current phase
        if (this.currentPhase === "research") {
            this.phaseData.research = { summary, audience: data.audience || "Unknown" };
            this.currentPhase = "offer";
            return `[System: Phase 'research' completed. Switching to 'offer'.] Based on your research about ${this.phaseData.research.audience}, let's build your offer.`;
        } else if (this.currentPhase === "offer") {
            this.phaseData.offer = { summary, price: data.price || 0 };
            this.currentPhase = "content";
            return `[System: Phase 'offer' completed. Switching to 'content'.] Great, with an offer price of $${this.phaseData.offer.price}, let's write some content.`;
        } else {
            return `[System: Phase '${this.currentPhase}' completed.]`;
        }
    }
    async finalizeCampaign(name: string, brandVoice: any): Promise<string> {
        // Insert into DB
        const { initDatabase } = await import("@repo/data-ops/database");
        const { campaigns } = await import("@repo/data-ops/schema");
        const db = initDatabase(this.env.DB);
        const { nanoid } = await import("nanoid");

        const campaignId = nanoid();

        await db.insert(campaigns).values({
            id: campaignId,
            userId: "user_test", // TODO: Pass userId from request context
            name: name,
            researchData: this.phaseData.research,
            offerData: this.phaseData.offer,
            brandVoice: brandVoice,
        });

        return `[System: Campaign '${name}' saved successfully with ID: ${campaignId}. You can now use this context in the Generator.]`;
    }
}
