import { ensureSession } from "@/lib/services/story-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ProfileRow } from "@/lib/supabase/types";

export interface RegisterProfileInput {
  fullName: string;
  email: string;
  wantsRecommendations?: boolean;
}

export async function registerProfileInDb(
  sessionId: string,
  input: RegisterProfileInput
): Promise<ProfileRow> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  await ensureSession(sessionId);

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await supabase
      .from("profiles")
      .update({
        session_id: sessionId,
        full_name: fullName,
        wants_recommendations: input.wantsRecommendations ?? true,
      })
      .eq("email", email)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated as ProfileRow;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      session_id: sessionId,
      email,
      full_name: fullName,
      wants_recommendations: input.wantsRecommendations ?? true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ProfileRow;
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
