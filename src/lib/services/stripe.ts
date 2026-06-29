import Stripe from "stripe";
import { resolveStripeSecretKey } from "@/lib/payments/stripe-env";

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(resolveStripeSecretKey());
}

export function getStripe(): Stripe {
  const key = resolveStripeSecretKey();
  if (!key) {
    throw new Error("Stripe is not configured");
  }

  if (!stripeClient || stripeClient.getApiField("key") !== key) {
    stripeClient = new Stripe(key);
  }

  return stripeClient;
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
