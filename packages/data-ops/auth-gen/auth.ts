import { createBetterAuth } from "../src/auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// This config is ONLY for schema generation - uses dummy values
export const auth = createBetterAuth(
  drizzleAdapter({}, { provider: "sqlite" }),
  {
    stripeWebhookSecret: "dummy",
    stripeApiKey: "dummy",
    plans: [],
  }
);
