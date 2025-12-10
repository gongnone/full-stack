import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/database";
import {
  account,
  session,
  subscription,
  user,
  verification,
} from "./drizzle-out/auth-schema";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

let auth: ReturnType<typeof betterAuth>;

type StripeConfig = {
  stripeWebhookSecret: string;
  plans: any[];
  stripeApiKey?: string;
};

export function createBetterAuth(
  database: NonNullable<Parameters<typeof betterAuth>[0]>["database"],
  secret: string,
  stripeConfig?: StripeConfig,
  google?: { clientId: string; clientSecret: string },
): ReturnType<typeof betterAuth> {
  const stripeKey = stripeConfig?.stripeApiKey || process.env.STRIPE_KEY;
  const stripeWebhookSecret = stripeConfig?.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !stripeWebhookSecret) {
    console.warn("⚠️ Stripe API Key or Webhook Secret is missing. Stripe plugin will NOT be initialized.");
  }

  return betterAuth({
    database,
    secret: secret,
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      google: {
        clientId: google?.clientId ?? "",
        clientSecret: google?.clientSecret ?? "",
      },
    },
    plugins: stripeKey && stripeWebhookSecret ? [
      stripe({
        stripeClient: new Stripe(stripeKey),
        stripeWebhookSecret: stripeWebhookSecret,
        createCustomerOnSignUp: true,
        subscription: {
          enabled: true,
          plans: stripeConfig?.plans ?? [],
        },
      }),
    ] : [],
  });
}

export function getAuth(
  google: { clientId: string; clientSecret: string },
  stripe: StripeConfig,
  secret: string,
): ReturnType<typeof betterAuth> {
  if (auth) return auth;

  auth = createBetterAuth(
    drizzleAdapter(getDb(), {
      provider: "sqlite",
      schema: {
        user,
        session,
        account,
        verification,
        subscription,
      },
    }),
    secret,
    stripe,
    google,
  );
  return auth;
}