import { EMAIL_BRAND } from "@/lib/email/brand";
import { buildSubscriptionWelcomeEmail } from "@/lib/email/templates/subscription-welcome";
import { getSubscriptionPlan } from "@/lib/payments/subscription-plans";
import { isPostmarkConfigured, sendPostmarkEmail } from "@/lib/services/postmark";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function sendSubscriptionWelcomeEmail(params: {
  to: string;
  subscriptionId: string;
  planId?: string | null;
}): Promise<void> {
  if (!isPostmarkConfigured()) return;

  const plan = params.planId ? getSubscriptionPlan(params.planId) : undefined;
  const continueUrl = `${EMAIL_BRAND.siteUrl}/`;

  const mail = buildSubscriptionWelcomeEmail({
    continueUrl,
    planName: plan?.name,
  });

  await sendPostmarkEmail({
    to: params.to,
    subject: mail.subject,
    htmlBody: mail.html,
    textBody: mail.text,
    tag: "welcome-subscription",
    bcc: EMAIL_BRAND.signupWelcomeBcc,
  });
}

export async function markSubscriptionWelcomeSent(sessionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await supabase
    .from("user_sessions")
    .update({
      subscription_welcome_sent: true,
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId);
}

export async function wasSubscriptionWelcomeSent(
  sessionId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data } = await supabase
    .from("user_sessions")
    .select("subscription_welcome_sent")
    .eq("session_id", sessionId)
    .maybeSingle();

  return Boolean(data?.subscription_welcome_sent);
}
