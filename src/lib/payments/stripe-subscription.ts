import type Stripe from "stripe";

export function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): string | null {
  const item = subscription.items?.data?.[0];
  const end = item?.current_period_end;
  if (!end) return null;
  return new Date(end * 1000).toISOString();
}
