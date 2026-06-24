import { ensureSession } from "@/lib/services/story-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ProfileRow } from "@/lib/supabase/types";

export interface RegisterProfileInput {
  fullName: string;
  email: string;
  countryCode?: string;
  signupIp?: string | null;
  wantsRecommendations?: boolean;
  wantsWeeklyNewsletter?: boolean;
  newsletterTopics?: string[];
}

export async function registerProfileInDb(
  sessionId: string,
  input: RegisterProfileInput
): Promise<{ profile: ProfileRow; isNew: boolean }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  await ensureSession(sessionId);

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();

  const [{ data: bySession }, { data: byEmail }] = await Promise.all([
    supabase.from("profiles").select("*").eq("session_id", sessionId).maybeSingle(),
    supabase.from("profiles").select("*").eq("email", email).maybeSingle(),
  ]);

  if (bySession && byEmail && bySession.id !== byEmail.id) {
    throw new Error(
      "This email is already registered. Sign in with that email instead."
    );
  }

  const existing = bySession ?? byEmail;

  const profilePayload = {
    session_id: sessionId,
    email,
    full_name: fullName,
    wants_recommendations: input.wantsRecommendations ?? true,
    wants_weekly_newsletter: input.wantsWeeklyNewsletter ?? false,
    newsletter_topics: input.newsletterTopics ?? [],
    country_code: input.countryCode ?? null,
  };

  if (existing) {
    const { data: updated, error } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { profile: updated as ProfileRow, isNew: false };
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      ...profilePayload,
      signup_ip: input.signupIp?.trim() || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { profile: data as ProfileRow, isNew: true };
}

export async function getProfileBySessionFromDb(
  sessionId: string
): Promise<ProfileRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  return (data as ProfileRow | null) ?? null;
}
