import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { resolveStripePublishableKey } from "@/lib/payments/stripe-env";

let stripePromise: Promise<Stripe | null> | null = null;
let stripePromiseKey: string | null = null;

export function isStripeBrowserConfigured(): boolean {
  return Boolean(resolveStripePublishableKey());
}

export function getStripeBrowser(): Promise<Stripe | null> {
  const key = resolveStripePublishableKey();
  if (!key) return Promise.resolve(null);
  if (!stripePromise || stripePromiseKey !== key) {
    stripePromiseKey = key;
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
