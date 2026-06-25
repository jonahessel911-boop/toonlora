import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import {
  getSubscriptionFromDb,
  isActiveSubscription,
  setSubscriptionInDb,
} from "@/lib/services/subscription-repository";
import { getSubscriptionPeriodEnd } from "@/lib/payments/stripe-subscription";
import { getStripe, isStripeConfigured } from "@/lib/services/stripe";

const PAUSE_DAYS = 30;

export async function POST(request: Request) {
  const sessionId = getSessionFromRequest(request);
  const record = await getSubscriptionFromDb(sessionId);

  if (!isActiveSubscription(record) || !record.planId) {
    return NextResponse.json(
      { error: "No active subscription to pause" },
      { status: 400 }
    );
  }

  const resumesAt = new Date();
  resumesAt.setDate(resumesAt.getDate() + PAUSE_DAYS);
  const resumesAtUnix = Math.floor(resumesAt.getTime() / 1000);

  if (record.stripeSubscriptionId && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const updated = await stripe.subscriptions.update(
        record.stripeSubscriptionId,
        {
          pause_collection: {
            behavior: "mark_uncollectible",
            resumes_at: resumesAtUnix,
          },
        }
      );
      await setSubscriptionInDb(sessionId, {
        status: "paused",
        planId: record.planId,
        stripeSubscriptionId: updated.id,
        periodEnd: resumesAt.toISOString(),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not pause subscription";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } else {
    await setSubscriptionInDb(sessionId, {
      status: "paused",
      planId: record.planId,
      stripeSubscriptionId: record.stripeSubscriptionId,
      periodEnd: resumesAt.toISOString(),
    });
  }

  return NextResponse.json({
    ok: true,
    status: "paused",
    resumesAt: resumesAt.toISOString(),
  });
}
