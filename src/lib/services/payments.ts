import { CREDIT_PACKAGES } from "@/lib/constants";

/**
 * Future: integrate Stripe checkout sessions.
 */
export async function createCheckoutSession(credits: number): Promise<string | null> {
  const pkg = CREDIT_PACKAGES.find((p) => p.credits === credits);
  if (!pkg) return null;
  // TODO: return Stripe checkout URL
  return null;
}
