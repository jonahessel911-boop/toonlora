import { getSubscriptionPlan } from "@/lib/payments/subscription-plans";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  subscriptionStatus: string | null;
  subscriptionPlanId: string | null;
  subscriptionPlanLabel: string;
  subscriptionPeriodEnd: string | null;
  isActiveSubscription: boolean;
}

function isSubscriptionActive(
  status: string | null,
  periodEnd: string | null
): boolean {
  if (status !== "active") return false;
  if (!periodEnd) return true;
  return new Date(periodEnd).getTime() > Date.now();
}

function planLabel(planId: string | null, status: string | null): string {
  if (!planId || status !== "active") return "Free";
  const plan = getSubscriptionPlan(planId);
  return plan?.name ?? planId;
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at, session_id")
    .order("created_at", { ascending: false });

  if (profilesError) throw new Error(profilesError.message);

  const rows = (profiles ?? []) as Array<{
    id: string;
    email: string;
    full_name: string;
    created_at: string;
    session_id: string;
  }>;

  if (rows.length === 0) return [];

  const sessionIds = rows.map((row) => row.session_id);
  const { data: sessions, error: sessionsError } = await supabase
    .from("user_sessions")
    .select(
      "session_id, subscription_status, subscription_plan_id, subscription_period_end"
    )
    .in("session_id", sessionIds);

  if (sessionsError) throw new Error(sessionsError.message);

  const sessionById = new Map(
    (sessions ?? []).map((s) => [
      (s as { session_id: string }).session_id,
      s as {
        subscription_status: string | null;
        subscription_plan_id: string | null;
        subscription_period_end: string | null;
      },
    ])
  );

  return rows.map((row) => {
    const session = sessionById.get(row.session_id);
    const status = session?.subscription_status ?? null;
    const planId = session?.subscription_plan_id ?? null;
    const periodEnd = session?.subscription_period_end ?? null;

    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      createdAt: row.created_at,
      subscriptionStatus: status,
      subscriptionPlanId: planId,
      subscriptionPlanLabel: planLabel(planId, status),
      subscriptionPeriodEnd: periodEnd,
      isActiveSubscription: isSubscriptionActive(status, periodEnd),
    };
  });
}

export async function deleteAdminUser(profileId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("id, session_id")
    .eq("id", profileId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!profile) throw new Error("User not found");

  const sessionId = (profile as { session_id: string }).session_id;

  const { error: deleteError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);

  if (deleteError) throw new Error(deleteError.message);

  // Revoke Plus on the anonymous session so deleted accounts keep no access.
  await supabase
    .from("user_sessions")
    .update({
      subscription_status: null,
      subscription_plan_id: null,
      subscription_stripe_id: null,
      subscription_period_end: null,
    })
    .eq("session_id", sessionId);
}
