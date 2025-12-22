import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/worker/trpc/router";
import { createContext } from "@/worker/trpc/context";
import { getAuth } from "@repo/data-ops/auth"
import { createMiddleware } from "hono/factory";
import { getDb } from "@repo/data-ops/db/database"; // For Better Auth's Drizzle DB
import { user as authUserSchema } from "@repo/data-ops/drizzle-out/auth-schema"; // Better Auth user schema
import { accounts as foundryAccountsSchema, clients as foundryClientsSchema } from "@repo/foundry-core/schema"; // Foundry Core schemas
import { nanoid } from "nanoid"; // For generating unique IDs
import { DrizzleD1Database, drizzle } from "drizzle-orm/d1"; // For D1 Drizzle client
import { eq } from "drizzle-orm"; // For Drizzle queries


export const App = new Hono<{ Bindings: ServiceBindings, Variables: { userId: string, accountId: string, clientId: string } }>();

const getAuthInstance = (env: Env) => {
  return getAuth(
    {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    },
    {
      stripeWebhookSecret: env.STRIPE_WEBHOOK_KEY,
      stripeApiKey: env.STRIPE_KEY,
      plans: [
        {
          name: "basic",
          priceId: env.STRIPE_PRODUCT_BASIC
        },
        {
          name: "premium",
          priceId: env.STRIPE_PRODUCT_PREMIUM
        },
      ]
    },
    env.APP_SECRET,
    {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    },
  )
}

const authMiddleware = createMiddleware(async (c, next) => {
  const auth = getAuthInstance(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.text("Unauthorized", 401);
  }

  const userId = session.user.id;
  const authDrizzle = getDb(); // Drizzle instance for better-auth's schema

  // Initialize Drizzle for foundry-core's global D1 schema
  const foundryCoreDrizzle = drizzle(c.env.DB, { schema: { foundryAccountsSchema, foundryClientsSchema } }); // Pass both schemas

  let betterAuthUser = await authDrizzle
    .select()
    .from(authUserSchema)
    .where(eq(authUserSchema.id, userId))
    .execute()
    .then(rows => rows[0]);

  let accountId = betterAuthUser?.accountId;

  if (!accountId) {
    // Generate new accountId and create an account if user doesn't have one
    accountId = nanoid();
    await foundryCoreDrizzle.insert(foundryAccountsSchema).values({
      id: accountId,
      name: betterAuthUser?.name || "New Account", // Default name, can be updated later
      plan: "starter", // Default plan
      hubsLimit: 50,
      createdAt: new Date().toISOString(),
    }).execute();

    // Update the better-auth user with the new accountId
    await authDrizzle
      .update(authUserSchema)
      .set({ accountId: accountId })
      .where(eq(authUserSchema.id, userId))
      .execute();
  }

  let clientId: string;
  const requestedClientId = c.req.header("x-client-id"); // Get client ID from header

  if (requestedClientId) {
    // Verify if the requested client ID belongs to the authenticated account
    const client = await foundryCoreDrizzle.query.clients.findFirst({
      where: eq(foundryClientsSchema.id, requestedClientId),
    });

    if (client && client.accountId === accountId) {
      clientId = client.id;
    } else {
      // If requested client is invalid or doesn't belong to account, fall back to default
      console.warn(`Requested client ID ${requestedClientId} is invalid or does not belong to account ${accountId}. Falling back to default.`);
      // Fetch default client for the account
      let defaultClient = await foundryCoreDrizzle.query.clients.findFirst({
        where: eq(foundryClientsSchema.accountId, accountId),
      });

      if (!defaultClient) {
        // Create a default client if none exists
        const newClientId = nanoid();
        defaultClient = (await foundryCoreDrizzle.insert(foundryClientsSchema).values({
          id: newClientId,
          accountId: accountId,
          name: "Default Client",
          durableObjectId: nanoid(),
          vectorizeNamespace: `client-${newClientId}`,
          r2PathPrefix: `r2-${newClientId}`,
          createdAt: new Date().toISOString(),
        }).returning())[0];
      }
      clientId = defaultClient.id;
    }
  } else {
    // If no client ID is requested in the header, use the first existing client or create a new default one
    let defaultClient = await foundryCoreDrizzle.query.clients.findFirst({
      where: eq(foundryClientsSchema.accountId, accountId),
    });

    if (!defaultClient) {
      // Create a default client if none exists
      const newClientId = nanoid();
      defaultClient = (await foundryCoreDrizzle.insert(foundryClientsSchema).values({
        id: newClientId,
        accountId: accountId,
        name: "Default Client",
        durableObjectId: nanoid(),
        vectorizeNamespace: `client-${newClientId}`,
        r2PathPrefix: `r2-${newClientId}`,
        createdAt: new Date().toISOString(),
      }).returning())[0];
    }
    clientId = defaultClient.id;
  }
  
  // TODO: In a real scenario, clientId might come from a cookie/header set by frontend client selector

  c.set("userId", userId);
  c.set("accountId", accountId); // Set accountId in Hono context
  c.set("clientId", clientId); // Set clientId in Hono context

  await next();
});

App.all("/trpc/*", authMiddleware, (c) => {
  const userId = c.get("userId")
  const accountId = c.get("accountId")
  const clientId = c.get("clientId") // Get clientId from Hono context
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () =>
      createContext({ req: c.req.raw, env: c.env, workerCtx: c.executionCtx, userId, accountId, clientId }),
  });
});

App.get("/api/assets/*", authMiddleware, async (c) => {
  const proxiedRequest = new Request(c.req.raw);
  return (c.env as any).BACKEND_SERVICE.fetch(proxiedRequest);
});

App.get("/api/media/*", authMiddleware, async (c) => {
  const proxiedRequest = new Request(c.req.raw);
  return (c.env as any).BACKEND_SERVICE.fetch(proxiedRequest);
});

App.get("/click-socket", authMiddleware, async (c) => {
  const userId = c.get("userId")
  const headers = new Headers(c.req.raw.headers);
  headers.set("account-id", userId);
  const proxiedRequest = new Request(c.req.raw, { headers });
  return c.env.BACKEND_SERVICE.fetch(proxiedRequest);
});

App.get("/api/ws", authMiddleware, async (c) => {
  const userId = c.get("userId")
  const headers = new Headers(c.req.raw.headers);
  headers.set("account-id", userId);
  const proxiedRequest = new Request(c.req.raw, { headers });
  return c.env.BACKEND_SERVICE.fetch(proxiedRequest);
});

App.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = getAuthInstance(c.env)
  return auth.handler(c.req.raw);
});
