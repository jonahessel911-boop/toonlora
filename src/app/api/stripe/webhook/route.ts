import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { addCreditsInDb } from "@/lib/services/story-repository";
import {
  getProfileIdBySessionId,
  recordAffiliatePurchaseConversion,
} from "@/lib/services/affiliate-repository";
import { getStripe, isStripeConfigured } from "@/lib/services/stripe";
import {
  handleInvoicePaid,
  isGrantedSubscriptionStatus,
  syncSubscriptionLifecycle,
} from "@/lib/payments/stripe-subscription-sync";

export const runtime = "nodejs";

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
      const userSessionId = session.metadata?.sessionId;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (userSessionId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (
          isGrantedSubscriptionStatus(subscription.status) &&
          session.payment_status === "paid"
        ) {
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
      }
    } else {
      const userSessionId = session.metadata?.sessionId;
      const coins = Number(session.metadata?.coins ?? 0);
      if (userSessionId && coins > 0 && session.payment_status === "paid") {
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

  if (
    event.type === "invoice.paid" ||
    event.type === "invoice.payment_succeeded"
  ) {
    await handleInvoicePaid(stripe, event.data.object as Stripe.Invoice);
  }

  if (event.type === "customer.subscription.updated") {
    await syncSubscriptionLifecycle(event.data.object as Stripe.Subscription);
  }

  if (event.type === "customer.subscription.deleted") {
    await syncSubscriptionLifecycle(event.data.object as Stripe.Subscription);
  }

  return NextResponse.json({ received: true });
}
