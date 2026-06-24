import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import {
  getSubscriptionFromDb,
  isActiveSubscription,
} from "@/lib/services/subscription-repository";
import { getPlanTier } from "@/lib/payments/subscription-plans";

export async function GET(request: Request) {
  const sessionId = getSessionFromRequest(request);
  const record = await getSubscriptionFromDb(sessionId);
  const active = isActiveSubscription(record);
  const tier = active ? getPlanTier(record.planId) : "free";

  return NextResponse.json({
    active,
    status: record.status,
    planId: record.planId,
    periodEnd: record.periodEnd,
    tier,
  });
}
