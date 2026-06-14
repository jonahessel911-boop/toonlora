import { ensureSession } from "@/lib/services/story-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  LoginEventRow,
  PlatformSessionRow,
  ProfileRow,
  ReadingProgressRow,
} from "@/lib/supabase/types";

export interface AdminReportingMetrics {
  totalUsers: number;
  totalVisitors: number;
  episodeCompletionRate: number;
  episodeCompletedCount: number;
  readersCount: number;
  noStoryInteractionCount: number;
  noStoryInteractionRate: number;
  firstThreePagesCount: number;
  firstThreePagesRate: number;
  resignRate: number;
  resignCount: number;
  signupCount: number;
  avgTimeOnPlatformSeconds: number;
  avgTimeOnPlatformFormatted: string;
  generatedAt: string;
}

export interface ReadingProgressInput {
  seriesId: string;
  episodeNumber: number;
  panelIndex: number;
  totalPanels: number;
}

async function resolveProfileId(
  sessionId: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  return (data as { id: string } | null)?.id ?? null;
}

export async function recordReadingProgress(
  sessionId: string,
  input: ReadingProgressInput
): Promise<ReadingProgressRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  await ensureSession(sessionId);
  const profileId = await resolveProfileId(sessionId);

  const maxPanel = Math.max(0, input.panelIndex);
  const totalPanels = Math.max(1, input.totalPanels);
  const isComplete = maxPanel >= totalPanels - 1;
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("session_id", sessionId)
    .eq("series_id", input.seriesId)
    .eq("episode_number", input.episodeNumber)
    .maybeSingle();

  if (existing) {
    const row = existing as ReadingProgressRow;
    const nextMax = Math.max(row.max_panel_reached, maxPanel);
    const completedAt =
      row.completed_at ?? (isComplete || nextMax >= totalPanels - 1 ? now : null);

    const { data, error } = await supabase
      .from("reading_progress")
      .update({
        profile_id: profileId ?? row.profile_id,
        max_panel_reached: nextMax,
        total_panels: totalPanels,
        completed_at: completedAt,
        updated_at: now,
      })
      .eq("id", row.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ReadingProgressRow;
  }

  const { data, error } = await supabase
    .from("reading_progress")
    .insert({
      session_id: sessionId,
      profile_id: profileId,
      series_id: input.seriesId,
      episode_number: input.episodeNumber,
      max_panel_reached: maxPanel,
      total_panels: totalPanels,
      completed_at: isComplete ? now : null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ReadingProgressRow;
}

export async function recordPlatformHeartbeat(
  sessionId: string,
  entryPath: string
): Promise<PlatformSessionRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  await ensureSession(sessionId);
  const profileId = await resolveProfileId(sessionId);
  const now = new Date();
  const nowIso = now.toISOString();
  const idleCutoff = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

  const { data: active } = await supabase
    .from("platform_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .gte("last_active_at", idleCutoff)
    .order("last_active_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (active) {
    const row = active as PlatformSessionRow;
    const startedAt = new Date(row.started_at);
    const durationSeconds = Math.max(
      0,
      Math.round((now.getTime() - startedAt.getTime()) / 1000)
    );

    const { data, error } = await supabase
      .from("platform_sessions")
      .update({
        profile_id: profileId ?? row.profile_id,
        last_active_at: nowIso,
        duration_seconds: durationSeconds,
      })
      .eq("id", row.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as PlatformSessionRow;
  }

  const { data, error } = await supabase
    .from("platform_sessions")
    .insert({
      session_id: sessionId,
      profile_id: profileId,
      entry_path: entryPath,
      duration_seconds: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PlatformSessionRow;
}

export async function recordLoginEvent(
  profileId: string,
  method = "email"
): Promise<LoginEventRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("login_events")
    .insert({ profile_id: profileId, method })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as LoginEventRow;
}

export async function getProfileByEmailFromDb(
  email: string
): Promise<ProfileRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  return (data as ProfileRow | null) ?? null;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0m 0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  }
  return `${mins}m ${secs}s`;
}

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export async function getAdminReportingMetrics(): Promise<AdminReportingMetrics> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const [
    profilesRes,
    visitorsRes,
    progressRes,
    platformRes,
    loginRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id, created_at"),
    supabase.from("platform_sessions").select("session_id"),
    supabase.from("reading_progress").select("session_id, max_panel_reached, total_panels, completed_at"),
    supabase.from("platform_sessions").select("duration_seconds"),
    supabase.from("login_events").select("profile_id, logged_in_at"),
  ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);
  if (visitorsRes.error) throw new Error(visitorsRes.error.message);
  if (progressRes.error) throw new Error(progressRes.error.message);
  if (platformRes.error) throw new Error(platformRes.error.message);
  if (loginRes.error) throw new Error(loginRes.error.message);

  const profiles = (profilesRes.data ?? []) as Pick<
    ProfileRow,
    "id" | "created_at"
  >[];
  const progress = (progressRes.data ?? []) as Pick<
    ReadingProgressRow,
    "session_id" | "max_panel_reached" | "total_panels" | "completed_at"
  >[];
  const platformSessions = (platformRes.data ?? []) as Pick<
    PlatformSessionRow,
    "duration_seconds"
  >[];
  const loginEvents = (loginRes.data ?? []) as Pick<
    LoginEventRow,
    "profile_id" | "logged_in_at"
  >[];

  const totalUsers = profiles.length;
  const totalVisitors = new Set(
    (visitorsRes.data ?? []).map(
      (row) => (row as { session_id: string }).session_id
    )
  ).size;

  const readerSessions = new Set(progress.map((row) => row.session_id));
  const readersCount = readerSessions.size;

  const episodeCompletedCount = progress.filter(
    (row) =>
      row.completed_at ||
      row.max_panel_reached >= Math.max(1, row.total_panels) - 1
  ).length;

  const firstThreePagesCount = progress.filter(
    (row) => row.max_panel_reached >= 2
  ).length;

  const visitorSessions = new Set(
    (visitorsRes.data ?? []).map(
      (row) => (row as { session_id: string }).session_id
    )
  );
  const noStoryInteractionCount = [...visitorSessions].filter(
    (sessionId) => !readerSessions.has(sessionId)
  ).length;

  const loginByProfile = new Map<string, string[]>();
  for (const event of loginEvents) {
    const list = loginByProfile.get(event.profile_id) ?? [];
    list.push(event.logged_in_at);
    loginByProfile.set(event.profile_id, list);
  }

  let resignCount = 0;
  for (const profile of profiles) {
    const created = new Date(profile.created_at);
    const weekEnd = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
    const logins = loginByProfile.get(profile.id) ?? [];
    const loginsInFirstWeek = logins.filter((at) => {
      const t = new Date(at);
      return t >= created && t <= weekEnd;
    }).length;
    if (loginsInFirstWeek >= 2) resignCount += 1;
  }

  const durations = platformSessions
    .map((row) => row.duration_seconds)
    .filter((d) => d > 0);
  const avgTimeOnPlatformSeconds =
    durations.length > 0
      ? Math.round(
          durations.reduce((sum, d) => sum + d, 0) / durations.length
        )
      : 0;

  return {
    totalUsers,
    totalVisitors,
    episodeCompletionRate: pct(episodeCompletedCount, readersCount),
    episodeCompletedCount,
    readersCount,
    noStoryInteractionCount,
    noStoryInteractionRate: pct(noStoryInteractionCount, totalVisitors),
    firstThreePagesCount,
    firstThreePagesRate: pct(firstThreePagesCount, readersCount),
    resignRate: pct(resignCount, totalUsers),
    resignCount,
    signupCount: totalUsers,
    avgTimeOnPlatformSeconds,
    avgTimeOnPlatformFormatted: formatDuration(avgTimeOnPlatformSeconds),
    generatedAt: new Date().toISOString(),
  };
}
