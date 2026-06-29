import type Stripe from "stripe";
import { getSubscriptionPeriodEnd } from "@/lib/payments/stripe-subscription";
import { setSubscriptionInDb } from "@/lib/services/subscription-repository";
import { maybeSendTikTokSubscribeEvent } from "@/lib/analytics/tiktok-subscription-server";

export function isGrantedSubscriptionStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}

export function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice
): string | null {
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  if (!subscriptionRef) return null;
  return typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
}

/** Persist paid access only — webhook source of truth for first payment. */
export async function syncPaidSubscriptionAccess(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<boolean> {
  const userSessionId = subscription.metadata?.sessionId;
  const planId = subscription.metadata?.planId;
  if (!userSessionId || !planId) return false;

  if (!isGrantedSubscriptionStatus(subscription.status)) {
    return false;
  }

  await setSubscriptionInDb(userSessionId, {
    status: subscription.status,
    planId,
    stripeSubscriptionId: subscription.id,
    periodEnd: getSubscriptionPeriodEnd(subscription),
  });

  return true;
}

/** Sync lifecycle changes (cancel, renew, past_due) without granting incomplete access. */
export async function syncSubscriptionLifecycle(
  subscription: Stripe.Subscription
): Promise<void> {
  const userSessionId = subscription.metadata?.sessionId;
  const planId = subscription.metadata?.planId;
  if (!userSessionId || !planId) return;

  if (subscription.status === "incomplete") {
    return;
  }

  await setSubscriptionInDb(userSessionId, {
    status: subscription.status,
    planId,
    stripeSubscriptionId: subscription.id,
    periodEnd: getSubscriptionPeriodEnd(subscription),
  });
}

export async function handleInvoicePaid(
  stripe: Stripe,
  invoice: Stripe.Invoice
): Promise<void> {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items"],
  });

  const isFirstPayment = invoice.billing_reason === "subscription_create";
  await syncPaidSubscriptionAccess(stripe, subscription);

  if (isFirstPayment) {
    await maybeSendTikTokSubscribeEvent(stripe, subscription, invoice);
  }
}
