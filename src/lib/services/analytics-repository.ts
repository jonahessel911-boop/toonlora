import { ensureSession } from "@/lib/services/story-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  humanizeLpFunnelStep,
  LP_FUNNEL_STEP_ORDER,
  lpFunnelStepIndex,
} from "@/lib/analytics/lp-funnel";
import {
  getSubscriptionPlan,
  planMonthlyRevenueCents,
} from "@/lib/payments/subscription-plans";
import type {
  LoginEventRow,
  PlatformSessionRow,
  ProfileRow,
  ReadingProgressRow,
} from "@/lib/supabase/types";

export interface AdminReportingMetrics {
  totalUsers: number;
  totalVisitors: number;
  totalSeriesViews: number;
  totalEpisodeOpens: number;
  episodeCompletedCount: number;
  episodeCompletionRate: number;
  nextEpisodeClickCount: number;
  nextEpisodeClickRate: number;
  checkoutsStarted: number;
  checkoutConversionRate: number;
  activeSubscriptions: number;
  mrrCents: number;
  mrrFormatted: string;
  wau: number;
  mau: number;
  paywallViewCount: number;
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

export interface AnalyticsEventInput {
  eventType: string;
  seriesId?: string;
  episodeNumber?: number;
  planId?: string;
  properties?: Record<string, string | number | boolean>;
}

export interface ReadingProgressInput {
  seriesId: string;
  episodeNumber: number;
  panelIndex: number;
  totalPanels: number;
  seriesTitle?: string;
  genre?: string;
}

export interface LpFunnelStepMetric {
  step: string;
  stepIndex: number;
  label: string;
  /** Total page views (every time the step was shown). */
  pageViews: number;
  /** Unique sessions that viewed this step. */
  uniqueVisitors: number;
  completions: number;
  uniqueCompletions: number;
  backClicks: number;
  /** % of funnel entrants who reached this step. */
  shareOfStarts: number;
  /** % lost since funnel start (did not reach this step). */
  dropOffFromStart: number;
  /** % of previous-step visitors who reached this step. */
  stepRetention: number;
  /** % who left between previous step and this one. */
  stepFallOff: number;
  /** % of viewers who clicked continue on this step. */
  completionRate: number;
}

export interface LpFunnelReport {
  lpId: string;
  variant?: string;
  /** Unique sessions that entered the funnel. */
  uniqueVisitors: number;
  /** Sum of all step page views. */
  totalPageViews: number;
  checkoutStarts: number;
  paymentSubmits: number;
  subscribes: number;
  checkoutStartRate: number;
  paymentSubmitRate: number;
  subscribeRate: number;
  steps: LpFunnelStepMetric[];
}

export interface LpFunnelOverviewRow {
  lpId: string;
  variant?: string;
  totalPageViews: number;
  uniqueVisitors: number;
  checkoutStarts: number;
  subscribes: number;
  subscribeRate: number;
}

export interface LpFunnelReportsResponse {
  reports: LpFunnelReport[];
  overview: LpFunnelOverviewRow[];
  days: number | null;
  generatedAt: string;
}

export async function resolveProfileId(
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
        series_title: input.seriesTitle ?? (row as { series_title?: string | null }).series_title,
        genre: input.genre ?? (row as { genre?: string | null }).genre,
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
      series_title: input.seriesTitle ?? null,
      genre: input.genre ?? null,
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

export async function recordAnalyticsEventToDb(
  sessionId: string,
  input: AnalyticsEventInput
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await ensureSession(sessionId);
  const profileId = await resolveProfileId(sessionId);

  const { error } = await supabase.from("analytics_events").insert({
    session_id: sessionId,
    profile_id: profileId,
    event_type: input.eventType,
    series_id: input.seriesId ?? null,
    episode_number: input.episodeNumber ?? null,
    plan_id: input.planId ?? null,
    properties: input.properties ?? {},
  });

  if (error) {
    // Non-fatal: table is created by migration 009; checkout must not break without it.
    if (
      error.code === "PGRST205" ||
      error.message.includes("analytics_events")
    ) {
      return;
    }
    throw new Error(error.message);
  }
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

function countDistinctActiveRegisteredUsers(
  platformActivity: Array<{
    session_id: string;
    profile_id: string | null;
    last_active_at: string;
  }>,
  readingActivity: Array<{
    session_id: string;
    profile_id: string | null;
    updated_at: string;
  }>,
  loginActivity: Array<{ profile_id: string; logged_in_at: string }>,
  sessionToProfile: Map<string, string>,
  days: number
): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const active = new Set<string>();

  for (const row of platformActivity) {
    if (new Date(row.last_active_at).getTime() < cutoff) continue;
    const profileId = row.profile_id ?? sessionToProfile.get(row.session_id);
    if (profileId) active.add(profileId);
  }
  for (const row of readingActivity) {
    if (new Date(row.updated_at).getTime() < cutoff) continue;
    const profileId = row.profile_id ?? sessionToProfile.get(row.session_id);
    if (profileId) active.add(profileId);
  }
  for (const row of loginActivity) {
    if (new Date(row.logged_in_at).getTime() >= cutoff) {
      active.add(row.profile_id);
    }
  }

  return active.size;
}

export async function getAdminReportingMetrics(): Promise<AdminReportingMetrics> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    profilesRes,
    visitorsRes,
    progressRes,
    platformRes,
    loginRes,
    seriesViewsRes,
    eventsRes,
    subscriptionsRes,
    platformActivityRes,
    readingActivityRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id, session_id, created_at"),
    supabase.from("platform_sessions").select("session_id"),
    supabase.from("reading_progress").select("session_id, max_panel_reached, total_panels, completed_at"),
    supabase.from("platform_sessions").select("duration_seconds"),
    supabase.from("login_events").select("profile_id, logged_in_at"),
    supabase.from("series").select("views_count"),
    supabase.from("analytics_events").select("event_type"),
    supabase
      .from("user_sessions")
      .select("subscription_status, subscription_plan_id, subscription_period_end")
      .eq("subscription_status", "active"),
    supabase
      .from("platform_sessions")
      .select("session_id, profile_id, last_active_at")
      .gte("last_active_at", monthAgo),
    supabase
      .from("reading_progress")
      .select("session_id, profile_id, updated_at")
      .gte("updated_at", monthAgo),
  ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);
  if (visitorsRes.error) throw new Error(visitorsRes.error.message);
  if (progressRes.error) throw new Error(progressRes.error.message);
  if (platformRes.error) throw new Error(platformRes.error.message);
  if (loginRes.error) throw new Error(loginRes.error.message);
  if (seriesViewsRes.error) throw new Error(seriesViewsRes.error.message);

  const events = eventsRes.error
    ? []
    : ((eventsRes.data ?? []) as { event_type: string }[]);

  const subscriptions = subscriptionsRes.error
    ? []
    : ((subscriptionsRes.data ?? []) as {
        subscription_status: string | null;
        subscription_plan_id: string | null;
        subscription_period_end: string | null;
      }[]);

  const profiles = (profilesRes.data ?? []) as Pick<
    ProfileRow,
    "id" | "session_id" | "created_at"
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

  const totalSeriesViews = (seriesViewsRes.data ?? []).reduce(
    (sum, row) => sum + ((row as { views_count: number }).views_count ?? 0),
    0
  );
  const totalEpisodeOpens = progress.length;

  const nextEpisodeClickCount = events.filter(
    (e) => e.event_type === "next_episode_click"
  ).length;
  const checkoutsStarted = events.filter(
    (e) => e.event_type === "checkout_started"
  ).length;
  const paywallViewCount = events.filter(
    (e) => e.event_type === "paywall_view"
  ).length;

  const now = Date.now();
  const activeSubs = subscriptions.filter((sub) => {
    if (sub.subscription_status !== "active") return false;
    if (!sub.subscription_period_end) return true;
    return new Date(sub.subscription_period_end).getTime() > now;
  });

  let mrrCents = 0;
  for (const sub of activeSubs) {
    const plan = sub.subscription_plan_id
      ? getSubscriptionPlan(sub.subscription_plan_id)
      : undefined;
    if (plan) mrrCents += planMonthlyRevenueCents(plan);
  }

  const platformActivity = (platformActivityRes.data ?? []) as Array<{
    session_id: string;
    profile_id: string | null;
    last_active_at: string;
  }>;
  const readingActivity = (readingActivityRes.data ?? []) as Array<{
    session_id: string;
    profile_id: string | null;
    updated_at: string;
  }>;
  const loginActivity = loginEvents.map((e) => ({
    profile_id: e.profile_id,
    logged_in_at: e.logged_in_at,
  }));

  const sessionToProfile = new Map(
    profiles.map((p) => [p.session_id, p.id])
  );
  const wau = countDistinctActiveRegisteredUsers(
    platformActivity,
    readingActivity,
    loginActivity,
    sessionToProfile,
    7
  );
  const mau = countDistinctActiveRegisteredUsers(
    platformActivity,
    readingActivity,
    loginActivity,
    sessionToProfile,
    30
  );

  return {
    totalUsers,
    totalVisitors,
    totalSeriesViews,
    totalEpisodeOpens,
    episodeCompletedCount,
    episodeCompletionRate: pct(episodeCompletedCount, totalEpisodeOpens),
    nextEpisodeClickCount,
    nextEpisodeClickRate: pct(nextEpisodeClickCount, episodeCompletedCount),
    checkoutsStarted,
    checkoutConversionRate: pct(checkoutsStarted, paywallViewCount),
    activeSubscriptions: activeSubs.length,
    mrrCents,
    mrrFormatted: `€${(mrrCents / 100).toFixed(2)}`,
    wau,
    mau,
    paywallViewCount,
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

function propString(
  properties: Record<string, unknown>,
  key: string
): string | null {
  const value = properties[key];
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

export async function getLpFunnelReports(
  days: number | null = 30
): Promise<LpFunnelReportsResponse> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  let query = supabase
    .from("analytics_events")
    .select("session_id, event_type, properties")
    .in("event_type", ["lp_funnel_start", "lp_funnel_step", "lp_funnel_convert"]);

  if (days != null && days > 0) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", cutoff);
  }

  const { data, error } = await query;

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.message.includes("analytics_events")
    ) {
      return {
        reports: [],
        overview: [],
        days,
        generatedAt: new Date().toISOString(),
      };
    }
    throw new Error(error.message);
  }

  const events = (data ?? []) as Array<{
    session_id: string;
    event_type: string;
    properties: Record<string, unknown>;
  }>;

  const byLp = new Map<string, typeof events>();
  for (const event of events) {
    const lpId = propString(event.properties ?? {}, "lp_id");
    if (!lpId) continue;
    const list = byLp.get(lpId) ?? [];
    list.push(event);
    byLp.set(lpId, list);
  }

  const reports: LpFunnelReport[] = [];

  for (const [lpId, lpEvents] of byLp) {
    const starts = new Set<string>();
    const stepPageViews = new Map<string, number>();
    const stepUniqueVisitors = new Map<string, Set<string>>();
    const stepCompletions = new Map<string, number>();
    const stepUniqueCompletions = new Map<string, Set<string>>();
    const stepBackClicks = new Map<string, number>();
    const checkoutStarts = new Set<string>();
    const paymentSubmits = new Set<string>();
    const subscribes = new Set<string>();
    let variant: string | undefined;

    const bump = (map: Map<string, number>, key: string) => {
      map.set(key, (map.get(key) ?? 0) + 1);
    };

    const addUnique = (map: Map<string, Set<string>>, key: string, sessionId: string) => {
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(sessionId);
    };

    for (const event of lpEvents) {
      const props = event.properties ?? {};
      if (!variant) {
        const v = propString(props, "variant");
        if (v) variant = v;
      }

      if (event.event_type === "lp_funnel_start") {
        starts.add(event.session_id);
        continue;
      }

      if (event.event_type === "lp_funnel_step") {
        const step = propString(props, "step");
        const action = propString(props, "action");
        if (!step || !action) continue;

        if (action === "view") {
          bump(stepPageViews, step);
          addUnique(stepUniqueVisitors, step, event.session_id);
        } else if (action === "complete") {
          bump(stepCompletions, step);
          addUnique(stepUniqueCompletions, step, event.session_id);
        } else if (action === "back") {
          bump(stepBackClicks, step);
        }
        continue;
      }

      if (event.event_type === "lp_funnel_convert") {
        const convertEvent = propString(props, "convert_event");
        if (convertEvent === "checkout_start") {
          checkoutStarts.add(event.session_id);
        } else if (convertEvent === "payment_submit") {
          paymentSubmits.add(event.session_id);
        } else if (convertEvent === "subscribe") {
          subscribes.add(event.session_id);
        }
      }
    }

    const steps: LpFunnelStepMetric[] = [];
    let previousUnique = starts.size;
    let totalPageViews = 0;

    for (const step of LP_FUNNEL_STEP_ORDER) {
      const pageViews = stepPageViews.get(step) ?? 0;
      const uniqueVisitors = stepUniqueVisitors.get(step)?.size ?? 0;
      const completions = stepCompletions.get(step) ?? 0;
      const uniqueCompletions = stepUniqueCompletions.get(step)?.size ?? 0;
      const backClicks = stepBackClicks.get(step) ?? 0;
      totalPageViews += pageViews;

      const startCount = starts.size;
      const shareOfStarts = pct(uniqueVisitors, startCount);
      const dropOffFromStart =
        startCount > 0 ? pct(startCount - uniqueVisitors, startCount) : 0;
      const stepRetention = pct(uniqueVisitors, previousUnique);
      const stepFallOff =
        previousUnique > 0 ? pct(previousUnique - uniqueVisitors, previousUnique) : 0;
      const completionRate = pct(uniqueCompletions, uniqueVisitors);

      steps.push({
        step,
        stepIndex: lpFunnelStepIndex(step),
        label: humanizeLpFunnelStep(step),
        pageViews,
        uniqueVisitors,
        completions,
        uniqueCompletions,
        backClicks,
        shareOfStarts,
        dropOffFromStart,
        stepRetention,
        stepFallOff,
        completionRate,
      });

      if (uniqueVisitors > 0) previousUnique = uniqueVisitors;
    }

    const startCount = starts.size;
    reports.push({
      lpId,
      variant,
      uniqueVisitors: startCount,
      totalPageViews,
      checkoutStarts: checkoutStarts.size,
      paymentSubmits: paymentSubmits.size,
      subscribes: subscribes.size,
      checkoutStartRate: pct(checkoutStarts.size, startCount),
      paymentSubmitRate: pct(paymentSubmits.size, checkoutStarts.size),
      subscribeRate: pct(subscribes.size, startCount),
      steps,
    });
  }

  reports.sort((a, b) => {
    const aNum = Number(a.lpId);
    const bNum = Number(b.lpId);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum) && aNum !== bNum) {
      return aNum - bNum;
    }
    return a.lpId.localeCompare(b.lpId);
  });

  return {
    reports,
    overview: reports.map((r) => ({
      lpId: r.lpId,
      variant: r.variant,
      totalPageViews: r.totalPageViews,
      uniqueVisitors: r.uniqueVisitors,
      checkoutStarts: r.checkoutStarts,
      subscribes: r.subscribes,
      subscribeRate: r.subscribeRate,
    })),
    days,
    generatedAt: new Date().toISOString(),
  };
}
