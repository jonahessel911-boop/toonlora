import type Stripe from "stripe";
import { buildSubscribeEventId } from "@/lib/analytics/tiktok-event-ids";
import { buildTikTokContents } from "@/lib/analytics/tiktok-content";
import {
  isTikTokEventsApiConfigured,
  sendTikTokServerEvent,
} from "@/lib/analytics/tiktok-server";
import { getSubscriptionPlan } from "@/lib/payments/subscription-plans";
import { getSiteUrl } from "@/lib/seo/site";
import { getProfileBySessionFromDb } from "@/lib/services/profile-lookup";

const SUBSCRIBE_EVENT_SENT_METADATA_KEY = "tiktokSubscribeEventSent";

export function hasTikTokSubscribeEventBeenSent(
  subscription: Stripe.Subscription
): boolean {
  return subscription.metadata?.[SUBSCRIBE_EVENT_SENT_METADATA_KEY] === "true";
}

async function resolveSubscriberEmail(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  sessionId?: string
): Promise<string | undefined> {
  if (sessionId) {
    const profile = await getProfileBySessionFromDb(sessionId).catch(() => null);
    if (profile?.email) return profile.email;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return undefined;

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return undefined;
  return customer.email ?? undefined;
}

/** Fire TikTok Subscribe via Events API once per paid subscription. */
export async function maybeSendTikTokSubscribeEvent(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  invoice?: Stripe.Invoice
): Promise<boolean> {
  if (!isTikTokEventsApiConfigured()) return false;

  if (
    subscription.status !== "active" &&
    subscription.status !== "trialing"
  ) {
    return false;
  }

  if (hasTikTokSubscribeEventBeenSent(subscription)) {
    return false;
  }

  const planId = subscription.metadata?.planId;
  const sessionId = subscription.metadata?.sessionId;
  const plan = planId ? getSubscriptionPlan(planId) : undefined;
  const email = await resolveSubscriberEmail(stripe, subscription, sessionId);

  const valueCents = invoice?.amount_paid ?? plan?.amountCents;
  const siteUrl = getSiteUrl();
  const welcomeParams = new URLSearchParams();
  welcomeParams.set("subscriptionId", subscription.id);
  if (planId) welcomeParams.set("planId", planId);

  const value = valueCents != null ? valueCents / 100 : undefined;

  const sent = await sendTikTokServerEvent({
    event: "Subscribe",
    eventId: buildSubscribeEventId(subscription.id),
    user: {
      email,
      externalId: sessionId,
    },
    properties: {
      currency: "EUR",
      value,
      contentId: planId,
      contentType: "product",
      contentName: plan?.name,
      contents: planId
        ? buildTikTokContents({
            contentId: planId,
            contentName: plan?.name ?? planId,
            price: value,
          })
        : undefined,
    },
    page: {
      url: `${siteUrl}/subscribe/welcome?${welcomeParams.toString()}`,
    },
  });

  if (!sent) return false;

  await stripe.subscriptions.update(subscription.id, {
    metadata: {
      ...subscription.metadata,
      [SUBSCRIBE_EVENT_SENT_METADATA_KEY]: "true",
    },
  });

  return true;
}
