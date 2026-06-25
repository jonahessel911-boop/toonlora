import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { recordAnalyticsEventToDb } from "@/lib/services/analytics-repository";
import { getProfileBySessionFromDb } from "@/lib/services/profile-repository";
import {
  getSubscriptionPlan,
  subscriptionStripePriceData,
} from "@/lib/payments/subscription-plans";
import { resolveStripeCustomerId } from "@/lib/payments/stripe-checkout-customer";
import { STRIPE_SUBSCRIPTION_PAYMENT_METHODS } from "@/lib/payments/stripe-payment-methods";
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

    const stripeCustomerId = await resolveStripeCustomerId(stripe, {
      sessionId,
      email: customerEmail,
      fullName: customerName,
    });

    if (isServerDatabaseConfigured()) {
      try {
        await recordAnalyticsEventToDb(sessionId, {
          eventType: "checkout_started",
          planId: plan.id,
          properties: { source: "subscription_checkout_api" },
        });
      } catch {
        /* analytics must not block checkout */
      }
    }

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: [...STRIPE_SUBSCRIPTION_PAYMENT_METHODS],
      billing_address_collection: "auto",
      locale: "nl",
      name_collection: {
        individual: {
          enabled: true,
          optional: Boolean(customerName),
        },
        business: {
          enabled: true,
          optional: true,
        },
      },
      tax_id_collection: {
        enabled: true,
      },
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
    };

    if (stripeCustomerId) {
      checkoutParams.customer = stripeCustomerId;
      checkoutParams.customer_update = {
        name: "auto",
        address: "auto",
      };
    } else if (customerEmail) {
      checkoutParams.customer_email = customerEmail;
    }

    const checkout = await stripe.checkout.sessions.create(checkoutParams);

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
