import { DurableObject } from "cloudflare:workers";

export class IngestionTracker extends DurableObject {
  private websockets: WebSocket[] = [];

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Ensure the DO is not evicted for a while if it has active websockets
    this.ctx.blockConcurrencyWhile(async () => {
      // Any initialization that needs to block eviction
    });
  }

  // Handle HTTP requests (e.g., WebSocket upgrades)
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/websocket": {
        // Upgrade to WebSocket
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
          return new Response("Expected Upgrade: websocket", { status: 426 });
        }

        const { 0: client, 1: server } = new WebSocketPair();
        this.websockets.push(server); // Store the server side of the WebSocket
        server.accept(); // Accept the WebSocket connection

        server.addEventListener("message", async (event: MessageEvent) => {
          // Handle incoming messages if needed, e.g., keep-alive pings
          console.log(`IngestionTracker DO received message: ${event.data}`);
          // For now, we don't expect client messages, just server broadcasts
        });

        server.addEventListener("close", async (event: CloseEvent) => {
          console.log(`IngestionTracker DO WebSocket closed: ${event.code} ${event.reason}`);
          this.websockets = this.websockets.filter((ws) => ws !== server);
        });

        server.addEventListener("error", async (event: Event) => {
          console.error(`IngestionTracker DO WebSocket error: ${event}`);
          this.websockets = this.websockets.filter((ws) => ws !== server);
        });

        return new Response(null, { status: 101, webSocket: client });
      }
      case "/broadcast": {
        // Internal API to broadcast messages
        if (request.method !== "POST") {
          return new Response("Method Not Allowed", { status: 405 });
        }
        const message = await request.text();
        this.broadcast(message);
        return new Response("Broadcasted", { status: 200 });
      }
      default:
        return new Response("Not Found", { status: 404 });
    }
  }

  // Send a message to all connected WebSockets
  broadcast(message: string): void {
    this.websockets.forEach((ws) => {
      try {
        ws.send(message);
      } catch (err) {
        console.error("Failed to send message to websocket", err);
        // Remove dead websockets
        this.websockets = this.websockets.filter((_ws) => _ws !== ws);
      }
    });
  }
}
