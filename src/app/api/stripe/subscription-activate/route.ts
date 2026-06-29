import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { getSubscriptionPeriodEnd } from "@/lib/payments/stripe-subscription";
import { setSubscriptionInDb } from "@/lib/services/subscription-repository";
import { getStripe, isStripeConfigured } from "@/lib/services/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const subscriptionId =
      typeof body.subscriptionId === "string" ? body.subscriptionId.trim() : "";

    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
    }

    const sessionId = getSessionFromRequest(request);
    const stripe = getStripe();

    let subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items", "customer"],
    });

    for (let attempt = 0; attempt < 5 && subscription.status === "incomplete"; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items", "customer"],
      });
    }

    if (subscription.metadata?.sessionId !== sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const planId = subscription.metadata?.planId;
    if (!planId) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const periodEnd = getSubscriptionPeriodEnd(subscription);

    await setSubscriptionInDb(sessionId, {
      status: subscription.status,
      planId,
      stripeSubscriptionId: subscription.id,
      periodEnd,
    });

    return NextResponse.json({
      status: subscription.status,
      planId,
      periodEnd,
      subscriptionId: subscription.id,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Subscription activation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
