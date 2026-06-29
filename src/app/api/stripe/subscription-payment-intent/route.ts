import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { recordAnalyticsEventToDb } from "@/lib/services/analytics-repository";
import { getProfileBySessionFromDb } from "@/lib/services/profile-lookup";
import { getSubscriptionPlan } from "@/lib/payments/subscription-plans";
import {
  createSubscriptionPaymentIntent,
  resolveOrCreateStripeCustomer,
} from "@/lib/payments/create-subscription-payment-intent";
import { resolveStripeCustomerId } from "@/lib/payments/stripe-checkout-customer";
import { assertStripeKeyModeMatch } from "@/lib/payments/stripe-env";
import { getStripe, isStripeConfigured } from "@/lib/services/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your environment.",
      },
      { status: 503 }
    );
  }

  try {
    assertStripeKeyModeMatch();
    const body = await request.json().catch(() => ({}));
    const planId = body.planId as string | undefined;
    const plan = planId ? getSubscriptionPlan(planId) : undefined;

    if (!plan) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 });
    }

    const sessionId = getSessionFromRequest(request);
    const stripe = getStripe();

    const profile =
      isServerDatabaseConfigured()
        ? await getProfileBySessionFromDb(sessionId)
        : null;

    const customerEmail =
      profile?.email ??
      (typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined);
    const customerName =
      profile?.full_name ??
      (typeof body.fullName === "string" ? body.fullName.trim() : undefined);

    const existingCustomerId = await resolveStripeCustomerId(stripe, {
      sessionId,
      email: customerEmail,
      fullName: customerName,
    });

    const customerId = await resolveOrCreateStripeCustomer(stripe, {
      sessionId,
      email: customerEmail,
      fullName: customerName,
      existingCustomerId,
    });

    if (isServerDatabaseConfigured()) {
      try {
        await recordAnalyticsEventToDb(sessionId, {
          eventType: "checkout_started",
          planId: plan.id,
          properties: { source: "subscription_payment_intent" },
        });
      } catch {
        /* analytics must not block checkout */
      }
    }

    const { clientSecret, subscriptionId } = await createSubscriptionPaymentIntent(
      stripe,
      {
        sessionId,
        plan,
        customerId,
      }
    );

    return NextResponse.json({ clientSecret, subscriptionId });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Subscription payment setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
