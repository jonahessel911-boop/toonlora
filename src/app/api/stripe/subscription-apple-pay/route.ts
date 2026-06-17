import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import {
  getSubscriptionPlan,
  subscriptionStripePriceData,
} from "@/lib/payments/subscription-plans";
import { setSubscriptionInDb } from "@/lib/services/subscription-repository";
import { getSubscriptionPeriodEnd } from "@/lib/payments/stripe-subscription";
import { getStripe, isStripeConfigured } from "@/lib/services/stripe";

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
    const paymentMethodId = body.paymentMethodId as string | undefined;
    const email = body.email as string | undefined;
    const plan = planId ? getSubscriptionPlan(planId) : undefined;

    if (!plan || !paymentMethodId) {
      return NextResponse.json(
        { error: "Invalid subscription request" },
        { status: 400 }
      );
    }

    const sessionId = getSessionFromRequest(request);
    const stripe = getStripe();

    const customer = await stripe.customers.create({
      email: email || undefined,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
      metadata: { sessionId },
    });

    const price = await stripe.prices.create({
      ...subscriptionStripePriceData(plan),
      active: true,
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      default_payment_method: paymentMethodId,
      expand: ["items"],
      metadata: {
        sessionId,
        planId: plan.id,
      },
    });

    const periodEnd = getSubscriptionPeriodEnd(subscription);

    await setSubscriptionInDb(sessionId, {
      status: subscription.status === "active" ? "active" : "incomplete",
      planId: plan.id,
      stripeSubscriptionId: subscription.id,
      periodEnd,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      planId: plan.id,
      periodEnd,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Apple Pay subscription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
