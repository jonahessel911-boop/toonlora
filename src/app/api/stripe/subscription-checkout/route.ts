import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import {
  getSubscriptionPlan,
  subscriptionStripePriceData,
} from "@/lib/payments/subscription-plans";
import { getSiteUrl, getStripe, isStripeConfigured } from "@/lib/services/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your environment." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const planId = body.planId as string | undefined;
    const returnPath = (body.returnPath as string | undefined) || "/";
    const plan = planId ? getSubscriptionPlan(planId) : undefined;

    if (!plan) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 });
    }

    const sessionId = getSessionFromRequest(request);
    const stripe = getStripe();
    const siteUrl = getSiteUrl();
    const safePath = returnPath.startsWith("/") ? returnPath : "/";

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      locale: "nl",
      line_items: [
        {
          price_data: subscriptionStripePriceData(plan),
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          sessionId,
          planId: plan.id,
        },
      },
      metadata: {
        sessionId,
        planId: plan.id,
        type: "subscription",
      },
      success_url: `${siteUrl}${safePath}${safePath.includes("?") ? "&" : "?"}subscribed=success`,
      cancel_url: `${siteUrl}${safePath}${safePath.includes("?") ? "&" : "?"}subscribed=cancelled`,
    });

    if (!checkout.url) {
      return NextResponse.json(
        { error: "Could not create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkout.url, sessionId: checkout.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Subscription checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
