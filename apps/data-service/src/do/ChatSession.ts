import { DurableObject } from "cloudflare:workers";
import { searchKnowledge } from "@repo/agent-logic/rag";

const PHASE_PROMPTS: Record<string, string> = {
    "research": "You are a research assistant. Help the user identify their target audience and problem.",
    "offer": "You are an offer architect. Help the user structure a compelling offer.",
    "content": "You are a content strategist. Help the user create content for their offer."
};

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

    async message(userMessage: string) {
        console.log('2. Running RAG Search...');
        // 1. Retrieve relevant context
        // Search current phase AND previous phases if needed, but primarily current phase knowledge base
        const context = await searchKnowledge(userMessage, this.env, this.currentPhase);

        // 2. Construct System Prompt with History/Context
        const systemPrompt = this.constructSystemPrompt(context);

        console.log('3. Calling OpenAI...');
        // 3. Call LLM (Workers AI)
        // Note: For pure Llama 3.1 on Workers AI, function calling might need manual parsing or a specific tool definition structure.
        // We will instruct the model to output a specific JSON structure if it wants to complete the phase.
        const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nINSTRUCTION: 
        1. If you are done with a phase (research/offer), output JSON: { "tool": "completePhase", "summary": "...", "nextPhaseData": { ... } }
        2. If you are in the 'content' phase and have finalized the Brand Voice and strategy, output JSON: { "tool": "finalizeCampaign", "name": "Campaign Name", "brandVoice": { ... } }
        Otherwise, reply normally.`;

        const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
                { role: "system", content: fullPrompt } // Using system prompt + instruction in one block or separate
            ]
        });

        const output = (response as any).response || "";

        // 4. Check for tool usage / phase completion
        try {
            // Naive check for JSON output for tool call
            if (output.trim().startsWith('{') && (output.includes('completePhase') || output.includes('finalizeCampaign'))) {
                const action = JSON.parse(output);
                if (action.tool === "completePhase") {
                    return this.completePhase(action.summary, action.nextPhaseData);
                }
                if (action.tool === "finalizeCampaign") {
                    return await this.finalizeCampaign(action.name, action.brandVoice);
                }
            }
        } catch (e) {
            // Not JSON or failed to parse, assume normal text response
        }

        return output;
    }

    constructSystemPrompt(ragContext: string): string {
        let basePrompt = PHASE_PROMPTS[this.currentPhase] || "You are a helpful assistant.";

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
