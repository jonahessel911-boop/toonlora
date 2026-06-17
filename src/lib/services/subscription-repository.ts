import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ensureSession } from "@/lib/services/story-repository";

export interface SubscriptionRecord {
  status: string | null;
  planId: string | null;
  stripeSubscriptionId: string | null;
  periodEnd: string | null;
}

export async function getSubscriptionFromDb(
  sessionId: string
): Promise<SubscriptionRecord> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      status: null,
      planId: null,
      stripeSubscriptionId: null,
      periodEnd: null,
    };
  }

  await ensureSession(sessionId);

  const { data } = await supabase
    .from("user_sessions")
    .select(
      "subscription_status, subscription_plan_id, subscription_stripe_id, subscription_period_end"
    )
    .eq("session_id", sessionId)
    .maybeSingle();

  return {
    status: data?.subscription_status ?? null,
    planId: data?.subscription_plan_id ?? null,
    stripeSubscriptionId: data?.subscription_stripe_id ?? null,
    periodEnd: data?.subscription_period_end ?? null,
  };
}

export async function setSubscriptionInDb(
  sessionId: string,
  data: {
    status: string;
    planId: string;
    stripeSubscriptionId?: string | null;
    periodEnd?: string | null;
  }
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await ensureSession(sessionId);

  await supabase
    .from("user_sessions")
    .update({
      subscription_status: data.status,
      subscription_plan_id: data.planId,
      subscription_stripe_id: data.stripeSubscriptionId ?? null,
      subscription_period_end: data.periodEnd ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId);
}

export function isActiveSubscription(record: SubscriptionRecord): boolean {
  if (record.status !== "active") return false;
  if (!record.periodEnd) return true;
  return new Date(record.periodEnd).getTime() > Date.now();
}
