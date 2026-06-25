import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import {
  getSubscriptionFromDb,
  isActiveSubscription,
  setSubscriptionInDb,
} from "@/lib/services/subscription-repository";
import { getSubscriptionPeriodEnd } from "@/lib/payments/stripe-subscription";
import { getStripe, isStripeConfigured } from "@/lib/services/stripe";

export async function POST(request: Request) {
  const sessionId = getSessionFromRequest(request);
  const record = await getSubscriptionFromDb(sessionId);

  if (!isActiveSubscription(record) || !record.planId) {
    return NextResponse.json(
      { error: "No active subscription to cancel" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const immediate = Boolean(body.immediate);

  if (record.stripeSubscriptionId && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      if (immediate) {
        const cancelled = await stripe.subscriptions.cancel(
          record.stripeSubscriptionId
        );
        await setSubscriptionInDb(sessionId, {
          status: "cancelled",
          planId: record.planId,
          stripeSubscriptionId: cancelled.id,
          periodEnd: getSubscriptionPeriodEnd(cancelled),
        });
      } else {
        const updated = await stripe.subscriptions.update(
          record.stripeSubscriptionId,
          { cancel_at_period_end: true }
        );
        await setSubscriptionInDb(sessionId, {
          status: updated.status,
          planId: record.planId,
          stripeSubscriptionId: updated.id,
          periodEnd: getSubscriptionPeriodEnd(updated),
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not cancel subscription";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } else {
    await setSubscriptionInDb(sessionId, {
      status: immediate ? "cancelled" : "active",
      planId: record.planId,
      stripeSubscriptionId: record.stripeSubscriptionId,
      periodEnd: record.periodEnd ?? new Date().toISOString(),
    });
  }

  const refreshed = await getSubscriptionFromDb(sessionId);

  return NextResponse.json({
    ok: true,
    status: immediate ? "cancelled" : "cancel_at_period_end",
    periodEnd: refreshed.periodEnd,
    active: isActiveSubscription(refreshed),
  });
}
