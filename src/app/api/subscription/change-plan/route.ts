import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import {
  getSubscriptionFromDb,
  isActiveSubscription,
  setSubscriptionInDb,
} from "@/lib/services/subscription-repository";
import { getSubscriptionPeriodEnd } from "@/lib/payments/stripe-subscription";
import { resolveRecurringPriceId } from "@/lib/payments/stripe-subscription-price";
import {
  getSubscriptionPlan,
  type SubscriptionPlan,
} from "@/lib/payments/subscription-plans";
import { getStripe, isStripeConfigured } from "@/lib/services/stripe";

export async function POST(request: Request) {
  const sessionId = getSessionFromRequest(request);
  const record = await getSubscriptionFromDb(sessionId);

  if (!isActiveSubscription(record) || !record.planId) {
    return NextResponse.json(
      { error: "No active subscription to update" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const planId = typeof body.planId === "string" ? body.planId.trim() : "";

  if (!planId) {
    return NextResponse.json({ error: "Missing planId" }, { status: 400 });
  }

  const plan = getSubscriptionPlan(planId);
  if (!plan?.checkoutEnabled) {
    return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 });
  }

  const currentPlan = getSubscriptionPlan(record.planId);
  if (!currentPlan) {
    return NextResponse.json({ error: "Current plan not found" }, { status: 400 });
  }

  if (plan.id === record.planId) {
    return NextResponse.json({ error: "You are already on this plan." }, { status: 400 });
  }

  if (plan.billingInterval !== currentPlan.billingInterval) {
    return NextResponse.json(
      {
        error: `Switch between ${currentPlan.billingInterval}ly plans only. Contact support to change billing interval.`,
      },
      { status: 400 }
    );
  }

  if (record.stripeSubscriptionId && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(
        record.stripeSubscriptionId,
        { expand: ["items"] }
      );

      const item = subscription.items.data[0];
      if (!item?.id) {
        return NextResponse.json(
          { error: "Could not find subscription item to update" },
          { status: 500 }
        );
      }

      const priceId = await resolveRecurringPriceId(stripe, plan);

      const updated = await stripe.subscriptions.update(subscription.id, {
        items: [{ id: item.id, price: priceId }],
        proration_behavior: "create_prorations",
        metadata: {
          ...subscription.metadata,
          sessionId,
          planId: plan.id,
        },
      });

      await setSubscriptionInDb(sessionId, {
        status: updated.cancel_at_period_end
          ? "cancel_at_period_end"
          : updated.status,
        planId: plan.id,
        stripeSubscriptionId: updated.id,
        periodEnd: getSubscriptionPeriodEnd(updated),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not change subscription plan";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } else {
    await setSubscriptionInDb(sessionId, {
      status: record.status ?? "active",
      planId: plan.id,
      stripeSubscriptionId: record.stripeSubscriptionId,
      periodEnd: record.periodEnd,
    });
  }

  const refreshed = await getSubscriptionFromDb(sessionId);

  return NextResponse.json({
    ok: true,
    planId: refreshed.planId,
    status: refreshed.status,
    periodEnd: refreshed.periodEnd,
  });
}
