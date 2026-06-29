import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ProfileRow } from "@/lib/supabase/types";

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
