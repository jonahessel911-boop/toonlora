import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { addCreditsInDb } from "@/lib/services/story-repository";
import {
  setSubscriptionInDb,
} from "@/lib/services/subscription-repository";
import {
  getProfileIdBySessionId,
  recordAffiliatePurchaseConversion,
} from "@/lib/services/affiliate-repository";
import { getStripe, isStripeConfigured } from "@/lib/services/stripe";
import { getSubscriptionPeriodEnd } from "@/lib/payments/stripe-subscription";

export const runtime = "nodejs";

async function activateSubscriptionFromCheckout(
  session: Stripe.Checkout.Session
) {
  const userSessionId = session.metadata?.sessionId;
  const planId = session.metadata?.planId;
  if (!userSessionId || !planId) return;

  const stripe = getStripe();
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  let periodEnd: string | null = null;
  let status = "active";

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items", "customer"],
    });
    status = subscription.status;
    periodEnd = getSubscriptionPeriodEnd(subscription);
  }

  await setSubscriptionInDb(userSessionId, {
    status,
    planId,
    stripeSubscriptionId: subscriptionId ?? null,
    periodEnd,
  });
}

async function syncSubscriptionEvent(subscription: Stripe.Subscription) {
  const userSessionId = subscription.metadata?.sessionId;
  const planId = subscription.metadata?.planId;
  if (!userSessionId || !planId) return;

  const periodEnd = getSubscriptionPeriodEnd(subscription);

  await setSubscriptionInDb(userSessionId, {
    status: subscription.status,
    planId,
    stripeSubscriptionId: subscription.id,
    periodEnd,
  });
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "subscription") {
      await activateSubscriptionFromCheckout(session);
      const userSessionId = session.metadata?.sessionId;
      if (userSessionId) {
        const profileId = await getProfileIdBySessionId(userSessionId);
        if (profileId) {
          await recordAffiliatePurchaseConversion({
            profileId,
            sessionId: userSessionId,
            purchaseType: "subscription",
            amountCents: session.amount_total ?? undefined,
            stripeSessionId: session.id,
          });
        }
      }
    } else {
      const userSessionId = session.metadata?.sessionId;
      const coins = Number(session.metadata?.coins ?? 0);
      if (userSessionId && coins > 0) {
        await addCreditsInDb(userSessionId, coins);
        const profileId = await getProfileIdBySessionId(userSessionId);
        if (profileId) {
          await recordAffiliatePurchaseConversion({
            profileId,
            sessionId: userSessionId,
            purchaseType: "coins",
            amountCents: session.amount_total ?? undefined,
            stripeSessionId: session.id,
          });
        }
      }
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionRef =
      invoice.parent?.subscription_details?.subscription;
    const subscriptionId =
      typeof subscriptionRef === "string"
        ? subscriptionRef
        : subscriptionRef?.id;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items"],
      });
      await syncSubscriptionEvent(subscription);
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    await syncSubscriptionEvent(subscription);
  }

  return NextResponse.json({ received: true });
}
